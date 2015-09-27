<?php
session_start();


chdir(realpath(dirname(__FILE__)));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Connect.php');
require_once('Core/Landing.php');	
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	

require_once('Pages/forum.php');
require_once('Pages/mainmenu.php');
require_once('Pages/profile.php');
require_once('Pages/home.php');



if($_SESSION['connected'] != true) {
	unset($_SESSION);
	session_destroy();
	landing();
	exit();
}

$u = account_load(array("mail" => $_SESSION['mail']));
$_SESSION['page'] = $_GET['page'];
$_SESSION['forum'] = $_GET['fid'];

if($_SESSION['forum'] != "" && $_SESSION['forum'] != null && in_array($_SESSION['forum'], $u['forums'])) {
	$forum = forum_load($_SESSION['forum']);	
	if($forum != null) {
		$_SESSION['forum'] = $forum['_id'];
	} else {
		$_SESSION['forum'] = "";
	}
}

// HEAD
echo('
<html>
	<head>
		<title>Zusam</title>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
		<meta charset="utf-8"/>
		<!--<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet">-->
		<link href="CSS/font-awesome.min.css" rel="stylesheet">
		<link href="CSS/style.css?12" rel="stylesheet">
		<link href="Typebox/style.css?11" rel="stylesheet">
		<link href="Retouche/style.css?11" rel="stylesheet">
	</head>
	<body>
');

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
	<div class="post-options"><div onclick="hidenewpost()"><i class="fa fa-long-arrow-right"></i></div></div>
	<div class="post-separator"></div>
	<div id="newpost" class="newpost">
		<div id="typeBox" class="dynamicBox"><div contenteditable="true" data-placeholder="Share something..."></div></div>
		<div class="menu">
			<div class="menu-cell">
				<button id="cancelit" onclick="hidenewpost()">Annuler</button>
			</div>
			<div class="menu-cell">
				<button id="sendit" onclick="sendIt(\'#typeBox\')">Envoyer</button>
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
	echo(page_nav_forum($u, $forum));
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
<!--<script src="http://connect.soundcloud.com/sdk.js"></script>-->
<script src="JS/jquery.2.1.4.min.js"></script>
<script src="JS/fastclick.js"></script>
<script src="JS/utils.js?11"></script>
<script src="Typebox/searchFilter.js?11"></script>
<script src="Typebox/genericFilter.js?11"></script>
<script src="Typebox/control.js?11"></script>
<script src="Typebox/typebox.js?11"></script>
<script src="Retouche/script.js?12"></script>
<script src="JS/ui.js?11"></script>
<script src="JS/script.js?11"></script>
<script src="JS/start.js?11"></script>
</body>
</html>
');

?>
