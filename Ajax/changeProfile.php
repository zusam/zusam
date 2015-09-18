<?php

chdir(realpath(dirname(__FILE__)."/../"));
include('Core/Location.php');
include('Core/Accounts.php');
include('Reduc/ReducImage.php');

$name = $_POST['name'];
//$mail = $_POST['mail'];
$new_password = $_POST['new_password'];
$old_password = $_POST['old_password'];

//TODO
// get infos from SESSION
$uid = $_POST['uid'];
$u = account_load(array('_id' => $uid));

//TODO
//verify ACL (password)

var_dump($uid, $name, $mail, $password);

// save

if(preg_match("/^\s*$/",$name) != 1) {
	$name = htmlentities($name);
	$u['name'] = $name;
}
/*
if(preg_match("/^\s*$/",$mail) != 1) {
	$mail = htmlentities($mail);
	$u['mail'] = $mail;
}
*/
if(preg_match("/^\s*$/",$old_password) != 1) {
	if(password_verify($old_password, $u['password'])) {
		if(preg_match("/^\s*$/",$new_password) != 1) {
			$u['password'] = password_hash($new_password, PASSWORD_BCRYPT);
		}
	}
}

account_save($u);

?>
