<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Accounts.php');
require_once('Core/Forum.php');

require_once('Pages/forum.php');
require_once('Pages/mainmenu.php');
require_once('Pages/profile.php');

//TODO
//verify ACL (password)

$page = $_POST['page'];
$fid = $_POST['fid'];

$data = [];
if($page == "profile") {
	$_SESSION['page'] = "profile";
	$u = account_load(array("mail" => $_SESSION['mail']));
	$data['section'] = page_section_profile($u);
	$data['nav'] = page_nav_forum($u);
}

if($page == "forum") {
	$_SESSION['page'] = "forum";
	$u = account_load(array("mail" => $_SESSION['mail']));
	$forum = forum_load($fid);	
	$data['section'] = page_section_forum($u, $forum);
	$data['nav'] = page_nav_forum($u, $forum);
}

if($page == "forum_settings") {
	$_SESSION['page'] = "forum_settings";
	$u = account_load(array("mail" => $_SESSION['mail']));
	$forum = forum_load($fid);	
	$data['section'] = page_section_forum_settings($u, $forum);
	$data['nav'] = page_nav_forum($u, $forum);
}

header('Content-Type: text/json; charset=UTF-8');
echo(json_encode($data));
?>
