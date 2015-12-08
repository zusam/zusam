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
require_once('Core/Print_post.php');	

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
		
		// TODO protect ?
		if($POST['action'] == "morePost") {

			$list = json_decode($POST['list'], true);
			
			$fid = $POST['fid'];
			$f = forum_load(array('_id'=>$fid));
			if($f != null && $f != false && isIn($_SESSION['uid'], $f['users'])) {
				$news = array_reverse($f['news']);
				$n = intval($POST['n']);
				if(!$n || $n == 0) {
					$n = 30;
				}
				$j = 0;
				$i = 0;
				$html = "";
				$newlist = [];
				// max 300 posts backwards
				while($i < $n && $j < count($news) && $j < 300) {
					if(!in_array($news[$j], $list)) {
						$p = post_load(array('_id'=>$news[$j]));
						if($p != null && $p != false) {
							$i++;
							$html .= print_post_mini($p);
							$newlist[] = $news[$j];
						}
					}
					$j++;
				}
				
				$response = new StdClass();
				$response->html = $html;
				$response->list = $newlist;
				$response->count = $i;
				$response->load = $j;
				header('Content-Type: text/json; charset=UTF-8');
				echo(json_encode($response));
				exit;
			}
			exit;
		}

		// TODO protect file
		if($POST['action'] == "getFile") {

			$fileId = preg_replace("/\{\:([a-zA-Z0-9]+)\:\}/","$1",$POST['url']);
			$url = $POST['url'];

			$file = file_load(array("fileId" => $fileId));	
			$html = file_print($file);

			$response = new StdClass();
			$response->url = $url;
			$response->html = $html;

			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($response));
			exit;

		}

		// TODO protect ?
		if($POST['action'] == "gen_preview") {
		
			$url = $POST['url'];
			
			// First we check if the preview doesn't exist (to be as fast as possible)	
			$p = preview_load(array('url' => $url));
			if($p != null) {
				$ret = json_encode($p,JSON_UNESCAPED_UNICODE);
				header('Content-Type: text/json; charset=UTF-8');
				echo($ret);
				exit;
			}
			
			// EXTENSION LESS IMAGES
			$type = contentType($url);
			if($type == 'image/jpeg' || $type == 'image/png' || $type == 'image/bmp' || $type == 'image/gif') {
				$data = [];
				$data['ret'] = create_post_preview($url);
				$data['url'] = $url;
				$data['type'] = "image";
				$data['info'] = "extensionless";
				header('Content-Type: text/json; charset=UTF-8');
				echo(json_encode($data));
				exit;
			}

			// GENERAL LINKS & OPEN GRAPH //
			$ret = preview($url);
			gen_miniature($url);
			header('Content-Type: text/json; charset=UTF-8');
			echo($ret);
			exit;
		}


		if($POST['action'] == "changeSecretLink") {
			$uid = $POST['uid'];
			$fid = $POST['fid'];
			
			$u = account_load(array('_id' => $uid));
			$f = forum_load(array('_id'=>$fid));

			if($_SESSION['uid'] == $uid && isIn($uid, $f['users']) && $u['forums'][$fid] != null) {
				forum_changeLink($f);
				forum_save($f);
			}
			exit;
		}

		
		if($POST['action'] == "removeUserFromForum") {
			$uid = $POST['uid'];
			$fid = $POST['fid'];
			
			$u = account_load(array('_id' => $uid));
			$f = forum_load(array('_id'=> $fid));
			var_dump($u);

			if($_SESSION['uid'] == $uid) {
				forum_removeUser_andSave($f, $u);
			}
			var_dump($u);
			exit;
		}

		if($POST['action'] == "addImage") {

			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
			var_dump($POST);
			var_dump($_FILES);
		
			if($_FILES["image"]["size"] < 1024*1024*10 && $_FILES["image"]["type"] == "image/png") {
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
		
			if($_FILES["video"]["size"] < 1024*1024*300) {
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
		
		if($POST['action'] == "addSGF") {

			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
			var_dump($POST);
			var_dump($_FILES);
		
			if($_FILES["sgf"]["size"] < 1024*1024*5) {
				$u = account_load(array('_id' => $uid));
				if($u != null && $u != false) {
					$file = file_initialize($fileId, "sgf", $u['_id']);
					// TODO verify that's a sgf an not something else...
	$r = copy($_FILES["sgf"]["tmp_name"], pathTo2(array('url' => $file['location'], 'ext' => 'sgf', 'param' => 'file')));
	//$r2 = copy($_FILES["sgf"]["tmp_name"], "/srv/http/zusam/Data/file/plop.sgf");
	$hello = pathTo2(array('url' => $file['location'], 'ext' => 'sgf', 'param' => 'file'));
	var_dump($hello);
	var_dump($file);
	$coucou = is_writable("/srv/http/zusam/Data/file");
	var_dump($coucou);
	$plop = file_get_contents($_FILES["sgf"]["tmp_name"]);
	var_dump($plop);
	var_dump($r);
	//var_dump($r2);
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
					$forum = forum_load(array('_id'=>$notif['source']));
					if($forum != null && $forum != false) {
						forum_addUser_andSave($forum, $user);
					}
					notification_destroy($nid);
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
				if($_FILES["avatar"]["size"] < 1024*1024*2 && $_FILES["avatar"]["type"] == "image/png") {
					//var_dump(pathTo($uid, "avatar", "jpg"));
					//var_dump(is_writeable(pathTo($uid, "avatar", "jpg")));
					//var_dump(is_writeable("/srv/http/zusam/Data/avatar/"));
					//exit;
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
			$f = forum_load(array('_id'=>$fid));

			if($_SESSION['uid'] == $uid && $u['forums'][$fid] != null) {
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
				if($f != null && $f != false && $_FILES["avatar"]["size"] < 1024*1024*2 && $_FILES["avatar"]["type"] == "image/png") {
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
			$p = post_load(array('_id'=>$id));
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
			$forum = forum_load(array('_id'=>$fid));

			if($_SESSION['uid'] == $uid && $u['forums'][$fid] != null) {
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
				}
			} else {
				echo('no credentials');
			}
			exit;
		}

		if($POST['action'] == "removeNotification") {

			$uid = $POST['uid'];
			$nid = $POST['nid'];

			$user = account_load(array('_id' => $uid));
			$notif = notification_load(array('_id' => $nid));

			if($_SESSION['uid'] == $uid && $notif['target'] == $uid) {  
				if($user != null && $user != false && $notif != null && $notif != false) {
					notification_destroy($nid);
				}
			} else {
				echo('no credentials');
			}
			exit;
		}

	}
}

?>
