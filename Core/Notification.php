<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/MongoDriver.php');
require_once('Core/Accounts.php');

function notification_initialize($a) {
	$n = [];
	$n['_id'] = mongo_id();
	$n['date'] = mongo_date();
	$n['type'] = $a['type'];
	$n['text'] = $a['text'];
	$n['data'] = $a['data'];
	$n['source'] = $a['source']; 
	$n['target'] = $a['target'];
	return $n;
}

function notification_save(&$n) {
	mongo_save("notififications",$n);
}

function notification_destroy($id) {
	mongo_destroy("notifications", $id);
}

function notification_load($array) {
	$n = mongo_load("notifications", $array);
	return $n;
}

function notification_bulkLoad($array) {
	$n = mongo_bulkLoad("notifications", $array);
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
