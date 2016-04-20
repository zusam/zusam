<?php
session_start();

require_once('Include.php');

// secure variables
$GET = [];
foreach($_GET as $K=>$V) {
	$GET[$K] = (String) $V;
}
$POST = [];
foreach($_POST as $K=>$V) {
	$POST[$K] = (String) $V;
}

/*

// reset password
if(isset($GET['action']) && $GET['action'] == "reset") {
	unset($_COOKIE['auth_token']);
	$head = html_head($GLOBALS['__ROOT_URL__']);
	echo($head);
	$html = pr_printPage($GET['id'], $GET['key']);
	echo($html);
	exit();
}
if(isset($POST['action']) && $POST['action'] == "passwordReset") {
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
	exit;
}
if($GET['pr'] == "false") {
	landing("Erreur : votre mot de passe n'a pas été modifié, veuillez réessayer ou contactez support@zus.am");
	exit;
}

// connect if good auth_token is present
if(isset($_COOKIE['auth_token'])) {
	$token = (String) $_COOKIE['auth_token'];
	$u = account_load(array('token'=>$token));
	if($u != null && $u != false) {
		$_SESSION['connected'] = true;
		$_SESSION['uid'] = (String) $u['_id'];
	}
}

// load account if not loaded with auth_token
if(!isset($u) || $u == null || $u == false) {
	if(isset($_SESSION['connected']) && $_SESSION['connected'] != true) {
		unset($_SESSION);
		session_destroy();
		landing();
		exit();
	} else {
		if(isset($_SESSION['uid'])) {
			$u = account_load(array('_id'=>$_SESSION['uid']));
		} else {
			if(isset($_SESSION['mail'])) {
				$u = account_load(array("mail" => $_SESSION['mail']));
			}
		}
		if(!isset($u) || $u == null || $u == false) {
			unset($_SESSION);
			session_destroy();
			landing(null, null);
			exit();
		} else {
			if(isset($u['token'])) {
				// change the token. This is not really secure. Destroys potentially attacked tokens.
				//$u['token'] = md5($u['token'].mt_rand().time());
			} else {
				$u['token'] = md5(bin2hex(openssl_random_pseudo_bytes(16)));
				account_save($u);
			}
			$ret = setcookie("auth_token",$u['token'],time()+60*60*24*30);
		}
	}
}

//execute secret invitation link
if(isset($GET['il']) && $GET['il'] != null) {
	if($_SESSION['connected']) {
		$f = forum_load(array('link'=>$GET['il']));
		if($f != null && $f != false && $u != null && $u != false) {
			forum_addUser_andSave($f, $u);	
		}
	} else {
		unset($_SESSION);
		session_destroy();
		landing("Connectez-vous ou inscrivez-vous pour accéder à cette ressource");
		exit();
	}
}

// get forum fid if GET is set
if(isset($GET['fid'])) {
	if($u['forums'][$GET['fid']] != null) {
		$_SESSION['forum'] = $GET['fid'];
	} else {
		$_SESSION['forum'] = "";
	}
}

// load forum
if(isset($_SESSION['forum']) && $u['forums'][$_SESSION['forum']] != null) {
	$forum = forum_load(array('_id'=>$_SESSION['forum']));	
	if($forum != null && $GET['page'] != "profile") {
		$_SESSION['forum'] = (String) $forum['_id'];
	} else {
		$_SESSION['forum'] = "";
	}
} else {
	// Force selection of a forum
	if(!isset($GET['page']) || $GET['page'] != "profile") {
		
		// erase non-existant forums TODO (fix this : we should not need it)
		foreach($u['forums'] as $k=>$uf) {
			$f = forum_load(array('_id'=>(String) $k));
			if($f == false || $f == null) {
				unset($u['forums'][$k]);
			}
		}
		account_save($u);
		
		$fid = array_keys($u['forums'])[0];

		if($fid != null) {
			$forum = forum_load(array('_id'=>$fid));	
			if($forum != null) {
				$_SESSION['forum'] = $fid;
			} else {
				// TODO the user don't have any forum yet. Propose to create/join one !
				$_SESSION['forum'] = "";
			}
		} else {
			// TODO the user don't have any forum yet. Propose to create/join one !
			$_SESSION['forum'] = "";
		}
	} else {
		$forum = "";
		$_SESSION['forum'] = "";
	}
}

// update timestamp
account_updateTimestamp($u);
account_save($u);

// update timestamp of visited forum
if($_SESSION['forum'] != "") {
	$coucou = (String) $_SESSION['forum'];
	$u['forums'][$coucou]['timestamp'] = time();
	account_save($u);
}

*/

$data = crossroad($GET, $POST, $FILES);
//var_dump($data);
//var_dump($_SESSION);
//var_dump($_COOKIE);

// HTML
echo('<html>');

// HEAD
$head = html_head($GLOBALS['__ROOT_URL__']);
echo($head);
takeAction($data);
//main($u,$forum,$GET,$POST);

?>
