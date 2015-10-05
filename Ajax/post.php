<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Connect.php');
require_once('Core/Landing.php');	
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	
require_once('Core/Utils.php');	

require_once('Pages/forum.php');
require_once('Pages/mainmenu.php');
require_once('Pages/profile.php');
require_once('Pages/home.php');

require_once('Reduc/ReducImage.php');

// TODO acl

// secure post variables for mongodb
$POST = [];
foreach($_POST as $K=>$V) {
	$POST[$K] = (String) $V;
}

if($POST['action'] != null && $POST['action'] != "") {

	if($POST['action'] == "addForum") {
		
		$name = $POST['name'];
		$uid = $POST['uid'];
		$name = htmlentities($name);

		$u = account_load(array('_id' => $uid));
		if($u != null && $u != false) {
			$f = forum_initialize($name);
			forum_addUser_andSave($f, $u);
		}

		exit;
	}

	if($POST['action'] == "addUserToForum") {

		$uid = $POST['uid'];
		$nid = $POST['nid'];

		$user = account_load(array('_id' => $uid));
		$notif = notification_load($nid);

		if($user != null && $user != false && $notif != null && $notif != false) {
			$forum = forum_load($notif['data']);
			if($forum != null && $forum != false) {
				forum_addUser_andSave($forum, $user);
			}
			notification_erase_andSave($notif, $user);
		}

		exit;
	}

	if($POST['action'] == "changeAvatar") {


		$uid = $POST['uid'];

		if($_FILES["avatar"]["size"] < 1048576 && $_FILES["avatar"]["type"] == "image/png") {
			$r = saveImage($_FILES["avatar"]["tmp_name"], pathTo($uid, "avatar", "jpg"), 256, 256);
		}

		exit;
	}

	if($POST['action'] == "changeForum") {

		$name = $POST['name'];
		$uid = $POST['uid'];
		$fid = $POST['fid'];
		
		$u = account_load(array('_id' => $uid));
		$f = forum_load($fid);
		
		// name change
		if($f != null && $f != false && $u != null && $u != false) {
			if(!preg_match("/^\s*$/",$name)) {
				if(isIn($uid, $f['users'])) {
					$f['name'] = $name;
					forum_save($f);
				}
			}
		}


		// avatar change
		if($f != null && $f != false && $_FILES["avatar"]["size"] < 1048576 && $_FILES["avatar"]["type"] == "image/png") {
			$r = saveImage($_FILES["avatar"]["tmp_name"], pathTo($fid, "avatar", "jpg"), 256, 256);
		}

		exit;
	}

	if($POST['action'] == "changeProfile") {

		$name = $_POST['name'];
		$new_password = $_POST['new_password'];
		$old_password = $_POST['old_password'];

		$uid = $_POST['uid'];
		$u = account_load(array('_id' => $uid));

		if(preg_match("/^\s*$/",$name) != 1) {
			$name = htmlentities($name);
			$u['name'] = $name;
		}
		if(preg_match("/^\s*$/",$old_password) != 1) {
			if(password_verify($old_password, $u['password'])) {
				if(preg_match("/^\s*$/",$new_password) != 1) {
					$u['password'] = password_hash($new_password, PASSWORD_BCRYPT);
				}
			}
		}
		account_save($u);

		exit;
	}

	if($POST['action'] == "deletePost") {
		$id = $_POST['id'];
		post_destroy($id);
		exit;
	}

	if($POST['action'] == "destroyAccount") {

		$uid = $POST['uid'];
		$password = $POST['password'];

		$u = account_load(array('_id' => $uid));
		if($u != null && $u != false && preg_match("/^\s*$/",$password) != 1) {
			if(password_verify($password, $u['password'])) {
				account_destroy($u['_id']);
			}
		}
		exit;
	}

	if($POST['action'] == "inviteUser") {

		$fid = $POST['forum'];
		$uid = $POST['uid'];
		$mail = $POST['mail'];

		$cible = account_load(array('mail' => $mail));
		$forum = forum_load($fid);

		if($forum != null && $forum != false && $cible != null && $cible != false) {
			$n = notification_initialize("invitation", $forum['name'], $forum['_id']);	
			notification_addNotif_andSave($n, $cible);
		}
		exit;
	}

	if($POST['action'] == "removeNotification") {

		$uid = $POST['uid'];
		$nid = $POST['notification'];

		$user = account_load(array('_id' => $uid));
		$notif = notification_load($nid);

		if($user != null && $user != false && $notif != null && $notif != false) {
			notification_erase_andSave($notif, $user);
		}
		exit;
	}

}




?>
