<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Include.php');

$mail = (String) $_POST['mail'];
$password = (String) $_POST['password'];
$password_conf = (String) $_POST['password_conf'];
$action = (String) $_POST['action'];

if($action == "logout" || $mail == "" || $password == "") {
	session_unset();
	exit();
}

if($password_conf == "") {
	$action = "login";
	echo("login");
}

if($action == "signup") {
	if(mailAlreadyExists($mail)) {
		echo("mail already exists");
		verifyACL($mail, $password);
	} else {
		//create account !
		if($password == $password_conf) {
			$mail = htmlentities($mail);
			$ac = account_initialize($mail, $password);
			$_SESSION['connected'] = true;
			$_SESSION['mail'] = $mail;
			$_SESSION['password'] = $password;
			$_SESSION['uid'] = (String) $ac['_id'];
			account_save($ac);
			echo("signup");
		} else {
			echo("fail");
		}
	}
	exit;
}

if($action == "login") {
	if(mailAlreadyExists($mail)) {
		$ret = verifyACL($mail, $password);
		if(!$ret) {
			echo("fail");
		} else {
			echo('ok');
		}
	} else {
		echo("fail");
	}
}

?>
