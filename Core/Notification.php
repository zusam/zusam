<?php

require_once(realpath(dirname(__FILE__).'/Accounts.php'));

function notification_initialize($type, $text, $data) {
	$n = [];
	$n['_id'] = new MongoId();
	$n['date'] = new MongoDate();
	$n['type'] = $type;
	$n['text'] = $text;
	$n['data'] = $data;
	return $n;
}

function notification_save(&$n) {
	$m = new MongoClient();
	$notifications = $m->selectDB("zusam")->selectCollection("notifications");
	$mid = new MongoId($n['_id']);
	$notifications->update(array('_id' => $mid), $n, array('upsert' => true));
}

function notification_destroy($id) {
	$m = new MongoClient();
	$mid = new MongoId($id);
	$notifications = $m->selectDB("zusam")->selectCollection("notifications");
	$notifications->remove(array('_id' => $mid));
}

function notification_load($id) {
	if(MongoId::isValid($id)) {
		$mid = new MongoId($id);
	} else {
		echo("fail");
		return null;
	}
	$m = new MongoClient();
	$notifications = $m->selectDB("zusam")->selectCollection("notifications");
	$n = $notifications->findOne(array('_id' => $mid));
	return $n;

}

function notification_erase_andSave(&$n, &$u) {
	if($u['notifications'] == null) {
		$u['notifications'] = [];
	}
	$un = array_flip($u['notifications']);
	$i = $un[$n['_id']];
	if($i != null) {
		unset($u['notifications'][$i]);
	}
	notification_destroy($n['_id']);
	account_save($u);
}

function notification_addNotif_andSave(&$n, &$u) {
	if($u['notifications'] == null) {
		$u['notifications'] = [];
	}
	$un = array_flip($u['notifications']);
	if(!isset($un[$n['_id']])) {
		array_push($u['notifications'], $n['_id']);
	}
	notification_save($n);
	account_save($u);
}

function notification_print_full(&$u) {
	$html = "";
	foreach($u['notifications'] as $nid) {
		$n = notification_load($nid);
		$html .= notification_print($n);
	}
	return $html;
}

function notification_print(&$n) {
	if($n['type'] == "invitation") {
		$html = '	
			<div class="menu-highlight invitation" data-id="'.$n['_id'].'">
				<div class="title">'.$n['text'].'</div>
				<div class="action-menu">
					<button class="action" onclick="addUserToForum(this)" >Rejoindre le forum</button>
					<button class="action"><i class="fa fa-remove" onclick="removeNotification(this)"></i></button>
				</div>
			</div>
		';
		return $html;
	}
	return "";
}
