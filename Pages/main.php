<?php

// generate auth_token cookie
function genAuthToken(&$u) {
	if(isset($u) && $u != false && $u != null) {
		if(isset($u['token'])) {
			// change the token. This is not really secure. Destroys potentially attacked tokens.
			//$u['token'] = md5($u['token'].mt_rand().time());
		} else {
			$u['token'] = md5(bin2hex(openssl_random_pseudo_bytes(16)));
			account_save($u);
		}
		$r = setcookie("auth_token",$u['token'],time()+60*60*24*30);
		return $r;
	}
	return false;
}

// return true if connected, false if not.
// tries to populate SESSION if connected 
// TODO review
function isConnected() {
	
	// if not connected then attempt to connect

	if($_SESSION['connected'] != true) {

		// connect if good auth_token is present
		if(isset($_COOKIE['auth_token'])) {
			$token = (String) $_COOKIE['auth_token'];
			$u = account_load(array('token'=>$token));
			if($u != null && $u != false) {
				$_SESSION['connected'] = true;
				$_SESSION['uid'] = (String) $u['_id'];
				genAuthToken($u);
				return true;
			} else {
				unset($_COOKIE['auth_token']);
			}
		}
			
		// load account if not loaded with auth_token
		if($_SESSION['connected'] == "true") {
			if(!isset($u) || $u == null || $u == false) {
				if(isset($_SESSION['uid'])) {
					$u = account_load(array('_id'=>$_SESSION['uid']));
				} else {
					if(isset($_SESSION['mail'])) {
						$u = account_load(array("mail" => $_SESSION['mail']));
					}
				}
				if(isset($u) && $u != null && $u != false) {
					$_SESSION['uid'] = (String) $u['_id'];
					genAuthToken($u);
					return true;
				}
			} else {
				$_SESSION['uid'] = (String) $u['_id'];
				genAuthToken($u);
				return true;
			}
		}
	
		unset($_SESSION);
		session_destroy();
		return false;
	} else {
		if(isset($_SESSION['uid'])) {
			$u = account_load(array('_id'=>$_SESSION['uid']));
			if(isset($u) && $u != null && $u != false) {
				$_SESSION['uid'] = (String) $u['_id'];
				genAuthToken($u);
				return true;
			}
		} else {
			return false;
		}
	}
}

// decide which action should be done
// returns $data filled with infos
function crossroad(&$GET, &$POST, &$FILES) {

	$data = [];

	// NOT CONNECTED

	if(isset($GET['action']) && $GET['action'] == "reset") {
		$data['action'] = "reset";
		return $data;
	}

	if(isset($POST['action']) && $POST['action'] == "passwordReset") {
		$data['action'] = "passwordReset";
		return $data;
	}

	if($GET['pr'] == "false") {
		$data['action'] = "landing";
		$data['message'] = "Erreur : votre mot de passe n'a pas été modifié, veuillez réessayer ou contactez support@zus.am";
		return $data;
	}


	$connected = isConnected();

	//execute notification's secret invitation link
	if(isset($GET['ii']) && $GET['ii'] != null) {
		if($connected) {
		$data['uid'] = $_SESSION['uid'];
			$data['action'] = "join_forum";
			$data['ii'] = $GET['ii'];
			return $data;
		} else {
			$data['action'] = "landing";
			$data['message'] = "Connectez-vous ou inscrivez-vous pour accéder à cette ressource";
			return $data;
		}
	}

	//execute forum's secret invitation link
	if(isset($GET['il']) && $GET['il'] != null) {
		if($connected) {
			$data['uid'] = $_SESSION['uid'];
			$data['action'] = "join_forum";
			$data['il'] = $GET['il'];
			return $data;
		} else {
			$data['action'] = "landing";
			$data['message'] = "Connectez-vous ou inscrivez-vous pour accéder à cette ressource";
			return $data;
		}
	}

	if(!$connected) {
		$data['action'] = "landing";
		$data['debug'] = "f1";
		$data['debug2'] = $connected;
		return $data;
	}

	// IS CONNECTED

	if(isset($_SESSION['uid'])) {
		$uid = $_SESSION['uid'];
		$data['uid'] = $uid;
		$u = account_load(array("_id"=>$uid));
	} else {
		$data['action'] = "landing";
		$data['debug'] = "f2";
		return $data;
	}

	if($GET['page'] == "profile") {
		$data['action'] = "profile";
		return $data;
	}

	// get forum fid if GET is set
	if(isset($GET['fid'])) {
		if($u['forums'][$GET['fid']] != null) {
			$fid = $GET['fid'];
		}
	}

	// force selection of a forum
	if(!isset($fid)) {
		// erase non-existant forums TODO (fix this : we should not need it)
		foreach($u['forums'] as $k=>$uf) {
			$f = forum_load(array('_id'=>(String) $k));
			if($f == false || $f == null) {
				unset($u['forums'][$k]);
			}
		}
		account_save($u);

		$fid = array_keys($u['forums'])[0];
	}

	if(isset($fid)) {
		$f = forum_load(array('_id'=>$fid));	
		if($f != null) {
			$_SESSION['forum'] = $fid;
			$data['fid'] = $fid;
		} else {
			// TODO the user don't have any forum yet. Propose to create/join one !
			$_SESSION['forum'] = "";
		}

	}
	
	if($GET['page'] == "forum_settings") {
		$data['action'] = "forum_settings";
		return $data;
	}

	$data['action'] = "forum";
	return $data;
}

// take action based on data
function takeAction($data) {
	switch($data['action']) {
		case "reset" :
			unset($_COOKIE['auth_token']);
			$head = html_head($GLOBALS['__ROOT_URL__']);
			echo($head);
			$html = pr_printPage($GET['id'], $GET['key']);
			echo($html);
			exit();
			break;

		case "passwordReset" :
			unset($_COOKIE['auth_token']);
			unset($_SESSION);
			unset($_POST);
			unset($_GET);
			session_destroy();
			if($POST['password'] == $POST['password_conf']) {
				$pr = pr_load(array('_id'=>$POST['id']));
				if($pr != false && $pr != null) {
					$u = account_load(array('_id'=>$pr['uid']));
					if($u != false && $u != null) {
						account_setPassword($u, $POST['password']);
						account_save($u);
						pr_destroy($POST['id']);
						landing("Votre mot de passe a bien été modifié");
						exit;
					}
				}
			}
			header('Location: '.$GLOBALS['__ROOT_URL__'].'?pr=false');
			exit();
			break;

		case "landing" :
			landing($data['message']);
			exit();
			break;

		case "join_forum" :
			$u = account_load(array('_id'=>$data['uid']));
			if(isset($data['il'])) {
				$f = forum_load(array('link'=>$data['il']));
			}
			if(isset($data['ii'])) {
				$n = notification_load(array('link'=>$data['ii']));
				if($n != null && $n != false){
					$fid = (String) $n['data']['forum'];
					$f = forum_load(array('_id'=>$fid));
					if($f != null && $f != false) {
						notification_destroy((String) $n['_id']);
					}
				}
			}
			if($f != null && $f != false && $u != null && $u != false) {
				forum_addUser_andSave($f, $u);	
				$data['fid'] = (String) $f['_id'];
				$data['action'] = "forum";
				takeAction($data);
			} else {
				// redirect to normal forum
				// TODO add popup notif for error
				$data['action'] = "forum";
				$fid = array_keys($u['forums'])[0];
				$data['fid'] = $fid;
				takeAction($data);
			}
			break;

		case "profile" :
			$u = account_load(array('_id'=>$data['uid']));
			$f = forum_load(array('_id'=>$data['fid']));
			echo('<body>');
			echo('<div class="hidden" id="info" data-uid="'.$u['_id'].'" data-avatar="'.account_getAvatar($u).'" data-fid="'.$_SESSION['forum'].'" data-action="'.$data['action'].'"></div>');
			echo(page_mainmenu($u, "profile"));
			echo('<div id="newavatar" class="newavatar"><div id="retoucheBox"></div></div>');
			echo('<div id="main_page">');
			echo('<nav>');
			echo(page_nav($u, $f, "profile"));
			echo('</nav>');
			echo('<section>');
			echo(page_section_profile($u));
			echo('</section>');
			echo('</div>');
			$footer = html_footer($GLOBALS['__ROOT_URL__']);
			echo($footer);
			exit();
			break;

		case "forum_settings" :
			$u = account_load(array('_id'=>$data['uid']));
			$uid = (String) $u['_id'];
			$f = forum_load(array('_id'=>$data['fid']));
			$fid = (String) $f['_id'];
			
			// Is it a valid forum ?
			if($f == null || $f == false || !in_array($uid, $f['users'])) {
				unset($u['forums'][$fid]);
				account_save($u);
				$fid = array_keys($u['forums'])[0];
				if($fid != null && $fid != "") {
					$data['action'] = "forum";
					$data['fid'] = $fid;
				} else {
					$data['action'] = "void";
				}
				takeAction($data);
			}

			echo('<body>');
			echo('<div class="hidden" id="info" data-uid="'.$u['_id'].'" data-avatar="'.account_getAvatar($u).'" data-fid="'.$_SESSION['forum'].'" data-action="'.$data['action'].'"></div>');
			echo(page_mainmenu($u, "forum_settings"));
			echo('<div id="main_page">');
			echo('<nav>');
			echo(page_nav($u, $f, "forum_settings"));
			echo('</nav>');
			echo('<section>');
			echo(page_section_forum_settings($u, $f));
			echo('</section>');
			echo('</div>');
			$footer = html_footer($GLOBALS['__ROOT_URL__']);
			echo($footer);
			exit();
			break;

		case "forum" :
			$u = account_load(array('_id'=>$data['uid']));
			$uid = (String) $u['_id'];
			$f = forum_load(array('_id'=>$data['fid']));
			$fid = (String) $f['_id'];

			// Is it a valid forum ?
			if($f == null || $f == false || !in_array($uid, $f['users'])) {
				unset($u['forums'][$fid]);
				account_save($u);
				$fid = array_keys($u['forums'])[0];
				if($fid != null && $fid != "") {
					$data['action'] = "forum";
					$data['fid'] = $fid;
				} else {
					$data['action'] = "void";
				}
				takeAction($data);
			}
			
			// update timestamp
			account_updateTimestamp($u);
			account_save($u);

			$_SESSION['forum'] = $fid;

			// update timestamp of visited forum
			if($_SESSION['forum'] != "") {
				$coucou = (String) $_SESSION['forum'];
				$u['forums'][$coucou]['timestamp'] = time();
				account_save($u);
			}

			echo('<body>');
			echo('<div class="hidden" id="info" data-uid="'.$uid.'" data-avatar="'.account_getAvatar($u).'" data-fid="'.$_SESSION['forum'].'" data-action="'.$data['action'].'"></div>');
			echo(page_mainmenu($u, "forum"));
			echo('<div id="newavatar" class="newavatar"><div id="retoucheBox"></div></div>');
			echo('<div id="slidepostviewer" class="slide slide-over slidefromright"></div>');
			echo('
			<div id="slidenewpost" class="slide slide-over slidefromright">
				<div class="nano">
					<div class="nano-content">
						<div id="newpost" class="newpost">
							<div id="typeBox" class="dynamicBox"><div contenteditable="true" data-placeholder="Partagez quelque chose..."></div></div>
							<div class="menu">
								<div class="menu-cell">
									<button class="cancel" onclick="push_hidenewpost()">Annuler</button>
								</div>
								<div class="menu-cell">
									<button onclick="inputFile(\'#typeBox\')" class="action"><i class="icon-attach"></i></button>
								</div>
								<div class="menu-cell">
									<button class="send" onclick="sendIt(\'#typeBox\')">Envoyer</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			');
			echo('<div id="main_page">');
			echo('<nav>');
			echo(page_nav($u, $f, ""));
			echo('</nav>');
			echo('<section>');
			//echo(page_section_forum($u, $f));
			echo('<div id="container">');
			echo('</div>');
			echo('</section>');
			echo('</div>');
			$footer = html_footer($GLOBALS['__ROOT_URL__']);
			echo($footer);
			exit();
			break;
	
		case "void" : 
			$u = account_load(array('_id'=>$data['uid']));
			$uid = (String) $u['_id'];
			$_SESSION['forum'] = "";
			
			echo('<body>');
			echo('<div class="hidden" id="info" data-uid="'.$uid.'" data-avatar="'.account_getAvatar($u).'" data-action="'.$data['action'].'"></div>');
			echo(page_mainmenu($u, ""));
			echo('<div id="main_page">');
			echo('<nav>');
			echo(page_nav($u, null, ""));
			echo('</nav>');
			echo('</div>');
			$footer = html_footer($GLOBALS['__ROOT_URL__']);
			echo($footer);
			exit();
			break;
	}

}
