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

require_once('Pages/forum.php');
require_once('Pages/mainmenu.php');
require_once('Pages/profile.php');
require_once('Pages/home.php');

// secure post variables for mongodb
$GET = [];
foreach($_GET as $K=>$V) {
	$GET[$K] = (String) $V;
}

//apply secret link
if($GET['il'] != null && $_SESSION['connected']) {
	$f = forum_load(array('link'=>$GET['il']));
	$u = account_load(array('_id'=>$_SESSION['uid']));
	if($f != null && $f != false && $u != null && $u != false) {
		forum_addUser_andSave($f, $u);	
	}
}


// HTML
echo('<html>');

// HEAD
echo('
	<head>
		<title>Zusam</title>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
		<meta charset="utf-8"/>
		<link href="style.css" rel="stylesheet">
	</head>
');

if($_SESSION['connected'] != true) {
	unset($_SESSION);
	session_destroy();
	landing();
	exit();
}

$u = account_load(array("mail" => $_SESSION['mail']));
$_SESSION['page'] = $GET['page'];
if($GET['fid'] != "") {
	if(isIn($GET['fid'], $u['forums'])) {
		$_SESSION['forum'] = $GET['fid'];
	} else {
		$_SESSION['forum'] = "";
		$_SESSION['page'] = "";
	}
}

$_SESSION['forum'] = $GET['fid'];
if($_SESSION['forum'] != "" && $_SESSION['forum'] != null && in_array($_SESSION['forum'], $u['forums'])) {
	$forum = forum_load(array('_id'=>$_SESSION['forum']));	
	if($forum != null) {
		$_SESSION['forum'] = $forum['_id'];
	} else {
		$_SESSION['forum'] = "";
	}
}

// BODY
echo('<body>');

// SOME INFOS FOR JAVASCRIPT 
echo('
<div class="hidden" id="info" data-uid="'.$u['_id'].'" data-avatar="'.account_getAvatar($u).'" data-name="'.$u['name'].'" data-forum="'.$_SESSION['forum'].'"></div>
');

// MAIN MENU
echo(page_mainmenu($u));

// NEW AVATAR
echo('
<div id="newavatar" class="newavatar">
	<div id="retoucheBox">
	<i class="label fa fa-photo"></i>
	<span class="underLabel">Click to upload a photo</span>
	<input type="file"></input>
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
		<div id="typeBox" class="dynamicBox"><div contenteditable="true" data-placeholder="Share something..."></div></div>
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
if($_SESSION['page'] == "forum" || $_SESSION['page'] == "forum_settings") {
	echo(page_nav_forum($u, $forum));
} else {
	echo(page_nav_forum($u));
}
echo('</nav>');

// MAIN SECTION
echo('<section>');
if($_SESSION['page'] == "profile") {
	echo(page_section_profile($u));
} 
if($_SESSION['page'] == "forum") {
	echo(page_section_forum($u, $forum));
}
if($_SESSION['page'] == "forum_settings") {
	echo(page_section_forum_settings($u, $forum));
}
if($_SESSION['page'] == "") {
	echo(page_section_home($u));
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
