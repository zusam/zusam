<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Accounts.php');
require_once('Core/Forum.php');
require_once('Core/Notification.php');

// TODO acl ?

$uid = $_POST['uid'];
$nid = $_POST['notification'];


$user = account_load(array('_id' => $uid));
$notif = notification_load($nid);

if($user != null && $user != false && $notif != null && $notif != false) {
	notification_erase_andSave($notif, $user);
}

?>
