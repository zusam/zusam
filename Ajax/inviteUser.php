<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Accounts.php');
require_once('Core/Forum.php');
require_once('Core/Notification.php');

// TODO acl ?

$fid = $_POST['forum'];
$uid = $_POST['uid'];
$mail = $_POST['mail'];

$cible = account_load(array('mail' => $mail));
$forum = forum_load($fid);

if($forum != null && $forum != false && $cible != null && $cible != false) {
	$n = notification_initialize("invitation", $forum['name'], $forum['_id']);	
	notification_addNotif_andSave($n, $cible);
}


?>
