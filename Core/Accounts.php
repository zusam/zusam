<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');

function account_initialize($mail, $password) {
	$ac = [];
	$ac['_id'] = new MongoId();
	$ac['date'] = new MongoDate();
	$ac['mail'] = $mail;
	$ac['name'] = $mail;
	$ac['password'] = password_hash($password, PASSWORD_BCRYPT);
	$ac['forums'] = [];
	return $ac;
}

function account_save(&$ac) {
	$m = new MongoClient();
	$accounts = $m->selectDB("zusam")->selectCollection("accounts");
	$mid = new MongoId($ac['_id']);
	$accounts->update(array('_id' => $mid), $ac, array('upsert' => true));
}

function account_load($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	$m = new MongoClient();
	$accounts = $m->selectDB("zusam")->selectCollection("accounts");
	$ac = $accounts->findOne($array);
	return $ac;
}

function account_getAvatar(&$ac) {
	if(file_exists(pathTo($ac['_id'], "avatar", "jpg"))) {
		$avatar = p2l(pathTo($ac['_id'], "avatar", "jpg"));
	} else {
		$avatar = p2l(pathTo("avatar", "assets", "jpg"));
	}
	return $avatar;
}

function account_destroy($id) {
	$m = new MongoClient();
	$mid = new MongoId($id);
	$accounts = $m->selectDB("zusam")->selectCollection("accounts");
	$accounts->remove(array('_id' => $mid));
}

?>
