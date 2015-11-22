<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');

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

function notification_print(&$n) {

	$html = "";
	
	if($n['type'] == "invitation") {
		$html .= '	
			<div class="notification" data-id="'.$n['_id'].'">
				<div onclick="addUserToForum(this)" class="menu-highlight title">Rejoindre le groupe "'.$n['text'].'"</div>
				<div onclick="removeNotification(this)" class="remove"><i class="fa fa-remove"></i></div>
			</div>
		';
		return $html;
	}
	if($n['type'] == "blog_update") {
		$html .= '
			<div class="notification" data-id="'.$n['_id'].'">
				<a href="'.$n['data'].'" target="_blank" class="menu-highlight title">'.$n['text'].'</a>
				<div onclick="removeNotification(this)" class="remove"><i class="fa fa-remove"></i></div>
			</div>
		';
		return $html;
	}
}
