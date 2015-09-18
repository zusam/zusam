<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Accounts.php');
require_once('Core/Forum.php');
require_once('Core/Notification.php');

//TODO acl ?

$uid = (String) $_POST['uid'];
$nid = (String) $_POST['nid'];


$user = account_load(array('_id' => $uid));
$notif = notification_load($nid);

if($user != null && $user != false && $notif != null && $notif != false) {
	$forum = forum_load($notif['data']);
	if($forum != null && $forum != false) {
		forum_addUser_andSave($forum, $user);
	}
	notification_erase_andSave($notif, $user);
}
?>
