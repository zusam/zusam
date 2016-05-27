<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Include.php');

// secure post variables for mongodb
$POST = [];
foreach($_POST as $K=>$V) {
	$POST[$K] = (String) $V;
}



// CONNECTED OR NOT
if($POST['action'] != null && $POST['action'] != "") {
	
	if($POST['action'] == "saveRecord") {
		recordStat(array("connected"=>$_SESSION['connected'], "loadingTime"=>$POST['loadingTime'], "screenHeight"=>$POST['screenHeight'],"screenWidth"=>$POST['screenWidth']));
		exit;
	}
	if($POST['action'] == "recordUsage") {
		recordUsage(array("usage"=>$POST['usage']));
		exit;
	}
}

// CONNECTED
if($_SESSION['connected']) {
	
	if($POST['action'] != null && $POST['action'] != "") {

		if($POST['action'] == "turnImage") {
			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
			$rotation = intval($POST['rotation']);

			$file = file_load(array("fileId"=>$fileId));
			if($file != null && $rotation != 0) {
				$r = rotateImage(file_getPath($file), $rotation);
				unlink(pmini($file['fileId']));
				unlink(ppi($file['fileId']));
				gen_miniature("{:".$fileId.":}");
				echo("image turned !");
				//var_dump($POST);
				//var_dump($r);
			} else {
				echo("fail");
			}
			exit;
		}

		//TODO protect
		if($POST['action'] == "removeNotification") {
			if($POST['uid'] == $_SESSION['uid']) {
				$nid = $POST['nid'];
				notification_destroy($nid);
			}
		}

		if($POST['action'] == "getImgur") {
			$url = $POST['url']; 
			$data['html'] = process_imgur($url);
			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($data));
			exit;
		}

		if($POST['action'] == "getInstagram") {
			$url = $POST['url']; 
			$data = json_decode(fgc("https://api.instagram.com/oembed/?url=".$url),true);
			$data['url'] = $url;
			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($data));
			exit;
		}

		// TODO protect ?
		if($POST['action'] == "morePost") {
			$r = new StdClass();
			

			$u = account_load(array('_id'=>$_SESSION['uid']));
			$list = json_decode($POST['list'], true);
			
			$fid = $POST['fid'];
			$f = forum_load(array('_id'=>$fid));
			if($f != null && $f != false && in_array($_SESSION['uid'], $f['users'])) {
				$news = array_reverse($f['news']);
				$n = intval($POST['number']);
				if($n == 0) {
					$n = 30;
				}
				$j = 0;
				$i = 0;
				$html = "";
				$newslist = [];
			
				// max 300 posts backwards
				while($i < $n && $j < count($news) && $j < 300) {
					if(!in_array($news[$j], $list)) {
						$p = post_load(array('_id'=>$news[$j]));
						if($p != null && $p != false) {
							$i++;
							if(in_array((String) $p['_id'], $u['unread'])) {
								$html .= print_post_mini($p, true);
							$r->debug1 = json_encode($u['unread']);
							$r->debug2 = json_encode((String) $p['_id']);
							} else {
								$html .= print_post_mini($p, false);
							}
							//$newslist[] = $news[$j];
							array_push($newslist, $news[$j]);
						} else {
							//var_dump($news[$j]);
							//deleteValue($news[$j], $f['news']);		
							//forum_save($f);
						}
					}
					$j++;
				}

				//forum_save($f);
				
				$r->html = $html;
				$r->list = $newslist;
				$r->count = $i;
				$r->load = $j;
				if($i < $n) {
					$r->end = true;
				} else {
					$r->end = false;
				}
				header('Content-Type: text/json; charset=UTF-8');
				echo(json_encode($r));
			}
			exit;
		}
		
		// TODO protect file
		if($POST['action'] == "getFile") {

			$fileId = preg_replace("/\{\:([a-zA-Z0-9]+)\:\}/","$1",$POST['url']);
			$url = $POST['url'];
			$uid = $_SESSION['uid'];

			$file = file_load(array("fileId" => $fileId));	
			$html = file_print($file);

			$response = new StdClass();
			$response->url = $url;
			$response->html = $html;
			$response->filetype = $file['type'];

			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($response));
			exit;

		}

		// TODO protect ?
		if($POST['action'] == "gen_preview") {
		
			$url = $POST['url'];

			$ret = handleLink($url);
			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($ret, JSON_UNESCAPED_UNICODE));
			exit;
		}

		if($POST['action'] == "changeSecretLink") {
			$uid = $POST['uid'];
			$fid = $POST['fid'];
			
			$u = account_load(array('_id' => $uid));
			$f = forum_load(array('_id'=>$fid));

			if($_SESSION['uid'] == $uid && in_array($uid, $f['users']) && $u['forums'][$fid] != null) {
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

			if($_SESSION['uid'] == $uid) {
				$r = forum_removeUser_andSave($f, $u);
			}
			var_dump($r);
			exit;
		}

		if($POST['action'] == "addGif") {
			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
		
			if($_FILES["image"]["size"] < 1024*1024*31 && $_FILES["image"]["type"] == "image/gif") {
				$u = account_load(array('_id' => $uid));
				if($u != null && $u != false) {
					if(isAnimated($_FILES['image']['tmp_name'])) {
						echo('is animated');
						$file = file_initialize($fileId, "webm", $u['_id']);
						var_dump($file);
						$ext = ".".pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
						var_dump($ext);
					$r = move_uploaded_file($_FILES['image']['tmp_name'], pathTo2(array('url'=>$file['fileId'], 'ext'=>$ext, 'param'=>'uploaded')));
					var_dump($r);
						if($r) {
							file_save($file);
						} else {
							echo('fail move file');
						}
					} else {
						echo('is not animated');
						$file = file_load(array("fileId"=>$fileId));
						if($file == null || $file == false) {
							$file = file_initialize($fileId, "jpg", $u['_id']);
						}
						$r = saveImage($_FILES["image"]["tmp_name"], pathTo2(array('url' => $file['location'], 'ext' => 'jpg', 'param' => 'file')), 2048, 2048);
						unlink(pmini($file['fileId']));
						gen_miniature("{:".$fileId.":}");
						if($r) {
							file_save($file);
							echo($file['fileId']);
						}
					}
				}
			}

			exit;
		}

		if($POST['action'] == "addImage") {

			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
		
			if($_FILES["image"]["size"] < 1024*1024*31 && ($_FILES["image"]["type"] == "image/png" || $_FILES["image"]["type"] == "image/jpeg")) {
				$u = account_load(array('_id' => $uid));
				if($u != null && $u != false) {
					$file = file_load(array("fileId"=>$fileId));
					if($file == null || $file == false) {
						$file = file_initialize($fileId, "jpg", $u['_id']);
					}
					$r = saveImage($_FILES["image"]["tmp_name"], pathTo2(array('url' => $file['fileId'], 'ext' => 'jpg', 'param' => 'file')), 2048, 2048);
					if($r) {
						file_save($file);
						unlink(pmini($file['fileId']));
						unlink(ppi($file['fileId']));
						gen_miniature("{:".$fileId.":}");
						$r = new StdClass();
						$r->url = p2l(pmini($file['fileId']));
						header('Content-Type: text/json; charset=UTF-8');
						echo(json_encode($r));
					}
				}
			}

			exit;
		}

		if($POST['action'] == "addVideo") {

			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
		
			if($_FILES["video"]["size"] < 1024*1024*301) {
				$u = account_load(array('_id' => $uid));
				if($u != null && $u != false) {
					$file = file_initialize($fileId, "webm", $u['_id']);
					$ext = ".".pathinfo($_FILES['video']['name'], PATHINFO_EXTENSION);
				$r = move_uploaded_file($_FILES['video']['tmp_name'], pathTo2(array('url'=>$file['fileId'], 'ext'=>$ext, 'param'=>'uploaded')));
					if($r) {
						file_save($file);
					} else {
						echo('fail move file');
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
				$r = new StdClass();
				$r->link = $GLOBALS['__ROOT_URL__'].'?fid='.$f['_id'].'&page=forum_settings';
				header('Content-Type: text/json; charset=UTF-8');
				echo(json_encode($r));
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
					
					$r = new StdClass();
					$r->link = $GLOBALS['__ROOT_URL__'].'?fid='.$forum['_id'];
					header('Content-Type: text/json; charset=UTF-8');
					echo(json_encode($r));
				}
			} else {
				echo('no credentials');
			}

			exit;
		}

		if($POST['action'] == "changeAvatar") {

			$uid = $POST['uid'];

			if($_SESSION['uid'] == $uid) {
				if($_FILES["image"]["size"] < 1024*1024*2 && $_FILES["image"]["type"] == "image/png") {
					$r = saveImage($_FILES["image"]["tmp_name"], pathTo2(array("url"=>$uid, "param"=>"avatar", "ext"=>"jpg")), 256, 256);
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
						if(in_array($uid, $f['users'])) {
							$f['name'] = $name;
							forum_save($f);
						}
					}
				}
			} else {
				echo('no credentials');
			}
			exit;
		}

		if($POST['action'] == "changeProfile") {
			
			$data = json_decode($POST['data'], true);
			$name = $data['name'];
			$new_password = $data['new_password'];
			$old_password = $data['old_password'];
			$new_mail = $data['new_mail'];
			$password = $data['password'];
			$absenceMail = $data['absenceMail'];

			$uid = $POST['uid'];
			$u = account_load(array('_id' => $uid));

			if($_SESSION['uid'] == $uid) {

				if($absenceMail == true) {
					$u['absenceMail'] = "yes";
				} else {
					$u['absenceMail'] = "no";
				}
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
				if(preg_match("/^\s*$/",$new_mail) != 1) {
					if(password_verify($password, $u['password'])) {
						$u['mail'] = $new_mail;
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
						account_destroy($uid);
						echo('ok');
					}
				} else {
					echo('fail');
				}
			} else {
				echo('no credentials');
			}
			exit;
		}

		if($POST['action'] == "inviteUser") {

			$fid = $POST['fid'];
			$uid = $POST['uid'];
			$mail = $POST['mail'];

			$u = account_load(array('_id' => $uid));
			if(!isset($u) || $u == false) {
				echo("no source account");
				exit;
			}
			$cible = account_load(array('mail' => $mail));
			if($cible != false && $cible != "") {
				$cible = (String) $cible['_id'];
			} else {
				$cible = $mail;
			}
			$forum = forum_load(array('_id'=>$fid));

			if($_SESSION['uid'] == $uid && $u['forums'][$fid] != null) {
				if($forum != null && $forum != false && $mail != "") {
					$n = notification_load(array('mail' => $mail));
					if(!isset($n) || $n == false) { 
						$n = notification_initialize(array(
								"type" => "invitation",
								"text" => $forum['name'],
								"data" => array("forum"=>$forum['_id'],"mail"=>$mail),
								"source" => $forum['_id'],
								"target" => $cible
							));
						$ret = mail_invitation($mail,$GLOBALS['__ROOT_URL__'].'?ii='.$n['link'],$u['name']);
						if(preg_match("/^Message/",$ret)==1) {
							notification_save($n);
						}
					} else {
						echo("exists already");
					}
				}
			} else {
				echo('no credentials');
			}
			echo('plop');
			$url_prev = search_miniature($text);
			account_save($u);
			exit;
		}
	}

// NOT CONNECTED
} else {
	
	if($POST['action'] != null && $POST['action'] != "") {

		if($POST['action'] == "passwordReset") {

			$mail = $POST['mail'];
			$u = account_load(array('mail'=>$mail));
			if($u != false && $u != null) {
				$uid = (String) $u['_id'];
				$pr = pr_initialize($uid);
				mail_resetPassword($u['mail'], $GLOBALS['__ROOT_URL__']."?action=reset&id=".$pr['_id']."&key=".$pr['key'], $u['name']);
				// reset the key for security reasons
				$pr['key'] == "";
				pr_save($pr);
				echo('ok');
				exit;
			}
		}
	}

}

?>
