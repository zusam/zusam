<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Location.php');
require_once('Core/Accounts.php');
require_once('Core/Connect.php');

$mail = (String) $_POST['mail'];
$password = (String) $_POST['password'];
$action = (String) $_POST['action'];


if($action == "logout" || $mail == "" || $password == "") {
	session_unset();
	exit();
}

if($action == "signup") {
	// TODO do both verifications in one swipe.
	if(mailAlreadyExists($mail)) {
		verifyACL($mail, $password);
	} else {
		//create account !
		$mail = htmlentities($mail);
		$ac = account_initialize($mail, $password);
		$_SESSION['connected'] = true;
		$_SESSION['mail'] = $mail;
		$_SESSION['password'] = $password;
		$_SESSION['uid'] = $ac['_id'];
		account_save($ac);
	}
	exit;
}

if($action == "login") {
	if(mailAlreadyExists($mail)) {
		verifyACL($mail, $password);
	}
}

?>
