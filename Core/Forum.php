<?php

require_once(realpath(dirname(__FILE__).'/Accounts.php'));

function forum_initialize($name) {
	$forum = [];
	$forum['_id'] = new MongoId();
	$forum['date'] = new MongoDate();
	$forum['name'] = $name;
	$forum['users'] = [];
	$forum['news'] = [];
	return $forum;
}

function forum_save(&$forum) {
	$m = new MongoClient();
	$forums = $m->selectDB("zusam")->selectCollection("forums");
	$mid = new MongoId($forum['_id']);
	$forums->update(array('_id' => $mid), $forum, array('upsert' => true));
}

function forum_load($fid) {
	if(MongoId::isValid($fid)) {
		$mid = new MongoId($fid);
	} else {
		return null;
	}
	$m = new MongoClient();
	$forums = $m->selectDB("zusam")->selectCollection("forums");
	$forum = $forums->findOne(array('_id' => $mid));
	return $forum;
}

function forum_post2news(&$forum, $pid) {
	$pid = (String) $pid;
	$a = array_flip($forum['news']);
	if(isset($a[$pid])) {
		unset($forum['news'][$a[$pid]]);
		array_push($forum['news'], $pid);
	} else {
		array_push($forum['news'], $pid);
	}
}

function forum_addUser_andSave(&$forum, &$user) {
	$fu = array_flip($forum['users']);
	if(!isset($fu[$user['_id']])) {
		array_push($forum['users'], $user['_id']);
	}
	$uf = array_flip($user['forums']);
	if(!isset($uf[$forum['_id']])) {
		array_push($user['forums'], $forum['_id']);
	}
	forum_save($forum);
	account_save($user);
}

function forum_getAvatar(&$forum) {
	if(file_exists(pathTo($forum['_id'], "avatar", "jpg"))) {
		$avatar = p2l(pathTo($forum['_id'], "avatar", "jpg"));
	} else {
		//$avatar = p2l(pathTo2("avatar", "assets", "jpg"));
		$avatar = p2l(pathTo2(array("url"=>"no_image", "ext"=>"png", "param"=>"assets", "dir"=>false)));
	}
	return $avatar;
}





?>
