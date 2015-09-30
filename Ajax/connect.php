<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Location.php');
require_once('Core/Accounts.php');
require_once('Core/Connect.php');

$mail = (String) $_POST['mail'];
$password = (String) $_POST['password'];


if($mail == "" || $password == "") {
	session_unset();
	exit();
}
// TODO do both verifications in one swipe.
if(mailAlreadyExists($mail)) {
	if(verifyACL($mail, $password)) {
		$_SESSION['connected'] = true;
		$_SESSION['mail'] = $mail;
		$_SESSION['password'] = $password;
	} else {
		session_unset();
	}
} else {
	//create account !
	$mail = htmlentities($mail);
	$ac = account_initialize($mail, $password);
	account_save($ac);
	$_SESSION['connected'] = true;
	$_SESSION['mail'] = $mail;
	$_SESSION['password'] = $password;
}

?>
