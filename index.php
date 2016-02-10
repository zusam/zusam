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

// HTML
echo('<html>');

// HEAD
$head = html_head($GLOBALS['__ROOT_URL__']);
echo($head);

//execute secret link
if($GET['il'] != null) {
	if($_SESSION['connected']) {
		$f = forum_load(array('link'=>$GET['il']));
		$u = account_load(array('_id'=>$_SESSION['uid']));
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

// reset password
if($GET['action'] == "reset") {
	$html = pr_printPage($GET['id'], $GET['key']);
	echo($html);
	exit();
}
if($POST['action'] == "passwordReset") {
	if($POST['password'] == $POST['password_conf']) {
		$pr = pr_load(array('_id'=>$POST['id']));
		if($pr != false && $pr != null) {
			$u = account_load(array('_id'=>$pr['uid']));
			if($u != false && $u != null) {
				account_setPassword($u, $POST['password']);
				account_save($u);
				pr_destroy($POST['id']);
				//TODO add pop-up to say that it's ok
			}
		}
	}
	//TODO say that the passwords were not the same
}

if($_SESSION['connected'] != true) {
	unset($_SESSION);
	session_destroy();
	landing();
	exit();
} else {
	$u = account_load(array('_id'=>$_SESSION['uid']));
	if($u == null || $u == false) {
		unset($_SESSION);
		session_destroy();
		landing();
		exit();
	}
}

// TODO Is $_SESSION['page'] still needed ?
$u = account_load(array("mail" => $_SESSION['mail']));
if($GET['fid'] != "") {
	if(in_array($GET['fid'], $u['forums'])) {
		$_SESSION['forum'] = $GET['fid'];
	} else {
		$_SESSION['forum'] = "";
	}
}

$_SESSION['forum'] = $GET['fid'];
if($_SESSION['forum'] != "" && $_SESSION['forum'] != null && $u['forums'][$_SESSION['forum']] != null) {
	$forum = forum_load(array('_id'=>$_SESSION['forum']));	
	if($forum != null) {
		$_SESSION['forum'] = (String) $forum['_id'];
	} else {
		$_SESSION['forum'] = "";
	}
}

// Force selection of a forum
if($_SESSION['forum'] == "" && $GET['page'] != "profile") {
	$fid = array_keys($u['forums'])[0];
	if($fid != null) {
		$_SESSION['forum'] = $fid;
		$forum = forum_load(array('_id'=>$_SESSION['forum']));	
	} else {
		// TODO the user don't have any forum yet. Propose to create/join one !
		$_SESSION['forum'] = "";
	}
}


// update timestamp of visited forum
if($_SESSION['forum'] != "") {
	$coucou = (String) $_SESSION['forum'];
	$u['forums'][$coucou]['timestamp'] = time();
	account_save($u);
}

// BODY
echo('<body>');

// SOME INFOS FOR JAVASCRIPT 
echo('
<div class="hidden" id="info" data-uid="'.$u['_id'].'" data-avatar="'.account_getAvatar($u).'" data-fid="'.$_SESSION['forum'].'"></div>
');

// MAIN MENU
echo(page_mainmenu($u, $GET['page']));

// NEW AVATAR
echo('
<div id="newavatar" class="newavatar">
	<div id="retoucheBox">
		<div class="placeholder">
			<i class="label fa fa-photo"></i>
			<span class="underLabel">Cliquez pour choisir une photo</span>
			<input type="file"></input>
		</div>
	</div>
</div>
');

// POST VIEWER
echo('<div id="slidepostviewer" class="slide slide-over slidefromright"></div>');

// NEW POST
echo('
<div id="slidenewpost" class="slide slide-over slidefromright">
	<div id="newpost" class="newpost">
		<div id="typeBox" class="dynamicBox"><div contenteditable="true" data-placeholder="Partagez quelque chose..."></div></div>
		<div class="menu">
			<div class="menu-cell">
				<button onclick="hidenewpost()">Annuler</button>
			</div>
			<div class="menu-cell">
				<button onclick="inputFile(\'#typeBox\')" class="action"><i class="fa fa-paperclip"></i></button>
			</div>
			<div class="menu-cell">
				<button onclick="sendIt(\'#typeBox\')">Envoyer</button>
			</div>
		</div>
	</div>
</div>
');

// MAIN_PAGE
echo('<div id="main_page">');

// NAVBAR
echo('<nav>');
echo(page_nav($u, $forum));
echo('</nav>');

// MAIN SECTION
echo('<section>');
switch($GET['page']) {
	case "profile": 
		echo(page_section_profile($u));
		break;
	// this case should not exist anymore
	//case "forum":
	//	echo(page_section_forum($u, $forum));
	//	break;
	case "forum_settings":
		echo(page_section_forum_settings($u, $forum));
		break;
	default:
		echo(page_section_forum($u, $forum));
		break;
}
echo('</section>');

// MAIN_PAGE
echo('</div>');

// ALBUMS
echo('<span class="send-notification" id="send-notification"></span>');

// FOOTER
$footer = html_footer($GLOBALS['__ROOT_URL__']);
echo($footer);

?>
