<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Location.php');
require_once('Core/Accounts.php');
require_once('Core/Forum.php');
require_once('Core/Utils.php');
require_once('Reduc/ReducImage.php');

$name = (String) $_POST['name'];
$uid = (String) $_POST['uid'];
$fid = (String) $_POST['fid'];

// TODO acl 

$u = account_load(array('_id' => $uid));
$f = forum_load($fid);

// name change
if($f != null && $f != false && $u != null && $u != false) {
	if(isIn($uid, $f['users'])) {
		if(!preg_match("/^\s*$/",$name)) {
			$f['name'] = $name;
			forum_save($f);
		}
	}
}

// avatar change
if($f != null && $f != false && $_FILES["avatar"]["size"] < 1048576 && $_FILES["avatar"]["type"] == "image/png") {
	$r = saveImage($_FILES["avatar"]["tmp_name"], pathTo($fid, "avatar", "jpg"), 320, 180);
}
