<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');

function acount_getDummy() {
	$ac = [];
	$ac['_id'] = -1;
	$ac['date'] = -1;
	$ac['mail'] = "";
	$ac['name'] = "Utilisateur inconnu";
	$ac['password'] = "";
	$ac['forums'] = [];
	$ac['default_avatar'] = -1;
	return $ac;
}

function account_initialize($mail, $password) {
	$ac = [];
	$ac['_id'] = new MongoId();
	$ac['date'] = new MongoDate();
	$ac['mail'] = $mail;
	$ac['name'] = $mail;
	$ac['password'] = password_hash($password, PASSWORD_BCRYPT);
	$ac['forums'] = [];
	$ac['default_avatar'] = rand(0, 65535);
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
	//dummy
	if($ac['_id'] == -1) {
		$avatar = p2l(pathTo2(array("url"=>"avatar", "param"=>"assets", "dir"=>false)));
		return $avatar;
	}
	$loc = array("url"=>$ac['_id'], "param"=>"avatar", "ext"=>"jpg");
	if(file_exists(pathTo2($loc))) {
		$avatar = p2l(pathTo2($loc));
	} else {
		//$avatar = p2l(pathTo("avatar", "assets", "jpg"));
		// get random default avatar 
		$av = scanDir(pathTo2(array("param"=>"default_avatar", "dir"=>true)));
		array_shift($av); array_shift($av);
		$i = $ac['default_avatar'] % count($av);
		$avatar = p2l(pathTo2(array("url"=>$av[$i], "param"=>"default_avatar", "dir"=>false)));
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
