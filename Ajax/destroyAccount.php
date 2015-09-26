<?php

chdir(realpath(dirname(__FILE__)."/../"));
include('Core/Location.php');
include('Core/Accounts.php');

// TODO acl


$uid = $_POST['uid'];
$password = $_POST['password'];

$u = account_load(array('_id' => $uid));
if($u != null && $u != false && preg_match("/^\s*$/",$password) != 1) {
	if(password_verify($password, $u['password'])) {
		account_destroy($u['_id']);
	}
}

?>
