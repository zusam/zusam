<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Location.php');

function mailAlreadyExists($mail) {
	$ac = account_load(array('mail' => $mail));
	if($ac == null) {
		return false;
	} else {
		return true;
	}
}

function verifyACL($mail, $pass) {
	if($pass == null || $pass == "" || $mail == null || $mail == "") {
		return false;
	}
	$ac = account_load(array('mail' => $mail));
	if(password_verify($pass, $ac['password'])) {
		return true;
	}
	return false;
}

?>
