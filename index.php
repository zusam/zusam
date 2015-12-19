<?php
session_start();

chdir(realpath(dirname(__FILE__)));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/Connect.php');
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	
require_once('Core/File.php');	
require_once('Core/Landing.php');
require_once('Core/PasswordReset.php');

require_once('Pages/forum.php');
require_once('Pages/mainmenu.php');
require_once('Pages/profile.php');
require_once('Pages/home.php');

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
echo('
	<head>
		<title>Zusam</title>
		<meta name="description" content="Zusam est un service de discussions et de partages moderne et réellement privé"/>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
		<meta charset="utf-8"/>
		<link href="style.css" rel="stylesheet">
		<link href="Assets/icons/apple-touch-icon.png" rel="apple-touch-icon" />
		<link href="Assets/icons/apple-touch-icon-76x76.png" rel="apple-touch-icon" sizes="76x76" />
		<link href="Assets/icons/apple-touch-icon-120x120.png" rel="apple-touch-icon" sizes="120x120" />
		<link href="Assets/icons/apple-touch-icon-152x152.png" rel="apple-touch-icon" sizes="152x152" />
		<link href="Assets/icons/apple-touch-icon-180x180.png" rel="apple-touch-icon" sizes="180x180" />
		<link href="Assets/icons/icon-hires.png" rel="icon" sizes="192x192" />
		<link href="Assets/icons/icon-normal.png" rel="icon" sizes="128x128" />
	</head>
');

//apply secret link
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
$_SESSION['page'] = $GET['page'];
if($GET['fid'] != "") {
	if(in_array($GET['fid'], $u['forums'])) {
		$_SESSION['forum'] = $GET['fid'];
	} else {
		$_SESSION['forum'] = "";
		$_SESSION['page'] = "";
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
	reset($u['forums']);
	$fid = key($u['forums']);
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
	$u['forums'][$_SESSION['forum']]['timestamp'] = time();
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
echo('
<div id="slidepostviewer" class="slide slide-over slidefromright">
	<div id="post-viewer">
	</div>
</div>
');

// NEW POST
echo('
<div id="slidenewpost" class="slide slide-over slidefromright">
	<div class="post-separator"></div>
	<div class="post-options"><div class="cell" onclick="hidenewpost()"><i class="fa fa-close"></i></div></div>
	<div class="post-separator"></div>
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
if($GET['page'] == "forum" || $GET['page'] == "forum_settings") {
	echo(page_nav_forum($u, $forum));
} else {
	echo(page_nav_forum($u, $forum));
}
echo('</nav>');

// MAIN SECTION
echo('<section>');
if($GET['page'] == "profile") {
	echo(page_section_profile($u));
} 
if($GET['page'] == "forum") {
	echo(page_section_forum($u, $forum));
}
if($GET['page'] == "forum_settings") {
	echo(page_section_forum_settings($u, $forum));
}
if($GET['page'] == "") {
	//echo(page_section_home($u));
	echo(page_section_forum($u, $forum));
}
echo('</section>');

// MAIN_PAGE
echo('</div>');

// FOOTER
echo('
<!--<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>-->
<script src="http://connect.soundcloud.com/sdk.js"></script>
<script src="LibJS/jquery.2.1.4.min.js"></script>
<script src="LibJS/fastclick.min.js"></script>
<script src="zusam.min.js"></script>
</body>
</html>
');

?>
