<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Connect.php');
require_once('Core/Landing.php');	
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	
require_once('Core/File.php');	
require_once('Core/Utils.php');	

require_once('Pages/forum.php');
require_once('Pages/mainmenu.php');
require_once('Pages/profile.php');
require_once('Pages/home.php');

require_once('Reduc/ReducImage.php');
require_once('Reduc/ReducVideo.php');

if($_SESSION['connected']) {

	// secure post variables for mongodb
	$POST = [];
	foreach($_POST as $K=>$V) {
		$POST[$K] = (String) $V;
	}

	if($POST['action'] != null && $POST['action'] != "") {
		
		if($POST['action'] == "removeUserFromForum") {
			$uid = $POST['uid'];
			$fid = $POST['fid'];
			
			$u = account_load(array('_id' => $uid));
			$f = forum_load($fid);

			if($_SESSION['uid'] == $uid) {
				forum_removeUser_andSave($f, $u);
			}
			exit;
		}

		if($POST['action'] == "addImage") {

			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
			var_dump($POST);
			var_dump($_FILES);
		
			// TODO ajuster la taille limite
			if($_FILES["image"]["size"] < 1048576*10 && $_FILES["image"]["type"] == "image/png") {
				$u = account_load(array('_id' => $uid));
				if($u != null && $u != false) {
					$file = file_initialize($fileId, "jpg", $u['_id']);
					var_dump($file);
					$r = saveImage($_FILES["image"]["tmp_name"], pathTo2(array('url' => $file['location'], 'ext' => 'jpg', 'param' => 'file')), 1024, 1024);
					var_dump($r);
					if($r) {
						file_save($file);
					}
				}
			}

			exit;
		}

		if($POST['action'] == "addVideo") {

			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
			var_dump($POST);
			var_dump($_FILES);
		
			// TODO ajuster la taille limite
			if($_FILES["video"]["size"] < 1048576*2000) {
				$u = account_load(array('_id' => $uid));
				if($u != null && $u != false) {
					$file = file_initialize($fileId, "webm", $u['_id']);
					var_dump($file);
			$r = saveVideo($_FILES["video"]["tmp_name"], pathTo2(array('url' => $file['location'], 'ext' => 'webm', 'param' => 'file')), $fileId);
					var_dump($r);
					if($r) {
						file_save($file);
					}
				}
			}

			exit;
		}

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
			$notif = notification_load(array('_id' => $nid));

			if($_SESSION['uid'] == $uid) { 
				if($user != null && $user != false && $notif != null && $notif != false) {
					$forum = forum_load($notif['source']);
					if($forum != null && $forum != false) {
						forum_addUser_andSave($forum, $user);
					}
					notification_destroy($notif);
					//notification_erase_andSave($notif, $user);
				}
			} else {
				echo('no credentials');
			}

			exit;
		}

		if($POST['action'] == "changeAvatar") {

			$uid = $POST['uid'];

			if($_SESSION['uid'] == $uid) {
				if($_FILES["avatar"]["size"] < 1048576 && $_FILES["avatar"]["type"] == "image/png") {
					$r = saveImage($_FILES["avatar"]["tmp_name"], pathTo($uid, "avatar", "jpg"), 256, 256);
				}
			} else {
				echo('no credentials');
			}

			exit;
		}

		if($POST['action'] == "changeForum") {

			$name = $POST['name'];
			$uid = $POST['uid'];
			$fid = $POST['fid'];
			
			$u = account_load(array('_id' => $uid));
			$f = forum_load($fid);

			if($_SESSION['uid'] == $uid && isIn($fid, $u['forums'])) {
				// name change
				if($f != null && $f != false && $u != null && $u != false) {
					if(!preg_match("/^\s*$/",$name)) {
						if(isIn($uid, $f['users'])) {
							$f['name'] = $name;
							forum_save($f);
						}
					}
				}

				// TODO ajuster la taille max
				// avatar change
				if($f != null && $f != false && $_FILES["avatar"]["size"] < 1048576*5 && $_FILES["avatar"]["type"] == "image/png") {
					$r = saveImage($_FILES["avatar"]["tmp_name"], pathTo($fid, "avatar", "jpg"), 256, 256);
				}
			} else {
				echo('no credentials');
			}

			exit;
		}

		if($POST['action'] == "changeProfile") {

			$name = $POST['name'];
			$new_password = $POST['new_password'];
			$old_password = $POST['old_password'];

			$uid = $POST['uid'];
			$u = account_load(array('_id' => $uid));

			if($_SESSION['uid'] == $uid) {
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
			} else {
				echo('no credentials');
			}

			exit;
		}

		if($POST['action'] == "deletePost") {
			$id = $POST['id'];
			$p = post_load($id);
			if($p != false && $p != null && $p['uid'] == $_SESSION['uid']) {
				post_destroy($id);
			} else {
				echo('no credentials');
			}
			exit;
		}

		if($POST['action'] == "destroyAccount") {

			$uid = $POST['uid'];
			$password = $POST['password'];

			$u = account_load(array('_id' => $uid));
			if($uid == $_SESSION['uid']) {
				if($u != null && $u != false && preg_match("/^\s*$/",$password) != 1) {
					if(password_verify($password, $u['password'])) {
						account_destroy($u['_id']);
					}
				}
			} else {
				echo('no credentials');
			}
			exit;
		}

		if($POST['action'] == "inviteUser") {

			$fid = $POST['forum'];
			$uid = $POST['uid'];
			$mail = $POST['mail'];

			$u = account_load(array('_id' => $uid));
			$cible = account_load(array('mail' => $mail));
			if($cible != false && $cible != "") {
				$cible = $cible['_id'];
			} else {
				$cible = $mail;
			}
			$forum = forum_load($fid);

			if($_SESSION['uid'] == $uid && isIn($fid, $u['forums'])) {
				if($forum != null && $forum != false && $mail != "") {
					$n = notification_initialize(array(
							"type" => "invitation", 
							"text" => $forum['name'], 
							"data" => array("forum"=>$forum['_id'],"mail"=>$mail),
							"source" => $forum['_id'], 
							"target" => $cible
						));	
					notification_save($n);
					echo("ok");
					//notification_addNotif_andSave($n, $cible);
				}
			} else {
				echo('no credentials');
			}
			exit;
		}

		if($POST['action'] == "removeNotification") {

			$uid = $POST['uid'];
			$nid = $POST['notification'];

			$user = account_load(array('_id' => $uid));
			$notif = notification_load(array('_id' => $nid));

			if($_SESSION['uid'] == $uid && $notif['target'] == $uid) {  
				if($user != null && $user != false && $notif != null && $notif != false) {
					notification_destroy($notif);
					//notification_erase_andSave($notif, $user);
				}
			} else {
				echo('no credentials');
			}
			exit;
		}

	}
}

?>
