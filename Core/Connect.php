<?php
session_start();

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
		$_SESSION['connected'] = true;
		$_SESSION['mail'] = $mail;
		// TODO security problem to save the password ?
		$_SESSION['password'] = $pass;
		$_SESSION['uid'] = $ac['_id'];
		return true;
	}
	session_unset();
	return false;
}

?>
