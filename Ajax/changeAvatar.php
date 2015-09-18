<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Accounts.php');
require_once('Reduc/ReducImage.php');

//TODO
// get infos from SESSION
$uid = $_POST['uid'];
//$u = new User();
//$u->loadFromDB('id='.$uid);
var_dump($uid);
//TODO
//verify ACL (password)
var_dump($_FILES);

if($_FILES["avatar"]["size"] < 1048576 && $_FILES["avatar"]["type"] == "image/png") {
	$r = saveImage($_FILES["avatar"]["tmp_name"], pathTo($uid, "avatar", "jpg"), 256, 256);
	var_dump($r);
}

?>
