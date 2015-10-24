<?php

require_once(realpath(dirname(__FILE__).'/Accounts.php'));

function notification_initialize($a) {
	$n = [];
	$n['_id'] = new MongoId();
	$n['date'] = new MongoDate();
	$n['type'] = $a['type'];
	$n['text'] = $a['text'];
	$n['data'] = $a['data'];
	$n['source'] = $a['source']; 
	$n['target'] = $a['target'];
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

function notification_load($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	$m = new MongoClient();
	$notifications = $m->selectDB("zusam")->selectCollection("notifications");
	$n = $notifications->findOne($array);
	return $n;
}

function notification_bulkLoad($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	$m = new MongoClient();
	$notifications = $m->selectDB("zusam")->selectCollection("notifications");
	$n = $notifications->find($array);
	return $n;
}

// INVITATION SPECIFIC

function load_invitations(&$u) {
	
	$notifications = [];

	// search by id
	$n1 =  notification_bulkLoad(array(
						'type' => 'invitation', 
						'target' => new MongoId($u['_id']), 
					));
	foreach($n1 as $n) {
		array_push($notifications, $n);
	}
	// search by mail
	$n2 = notification_bulkLoad(array(
						'type' => 'invitation', 
						'target' => $u['mail'], 
					));
	foreach($n2 as $n) {
		// correct target to be an id
		$n['target'] = new MongoId($u['_id']);
		notification_save($n);
		array_push($notifications, $n);
	}
	return $notifications;
}

/*
function invitation_print(&$n) {
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
*/
