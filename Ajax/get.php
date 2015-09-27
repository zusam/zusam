<?php

chdir(realpath(dirname(__FILE__)."/../"));
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

require_once('Reduc/ReducImage.php');

// TODO acl

// secure post variables for mongodb
$GET = [];
foreach($_GET as $K=>$V) {
	$GET[$K] = (String) $V;
}

if($GET['action'] != null && $GET['action'] != "") {

	if($GET['action'] == "getAvatar") {

		$uid = intval($GET['uid']);

		$response = new StdClass();
		$response->avatar = p2l(pathTo($uid,"avatar","jpg"));

		header('Content-Type: text/json; charset=UTF-8');
		echo(json_encode($response));
		exit;
	}

	if($GET['action'] == "getPost") {

		$id = $_GET['id'];

		$u = account_load(array('mail' => $_SESSION['mail']));
		$html_data = print_full_post($id, $u['_id']);
		$r = new StdClass();
		$r->html = $html_data;
		header('Content-Type: text/json; charset=UTF-8');
		echo(json_encode($r));
		exit;
	}

	if($GET['action'] == "getRaw") {

		$pid = $_GET['pid'];

		$u = new User();
		$u->loadFromDB("mail='".$_SESSION['login']."'");
		$p = post_load($pid);
		$raw = $p['text'];
		$r = new StdClass();
		$r->raw = $raw;
		header('Content-Type: text/json; charset=UTF-8');
		echo(json_encode($r));
		exit;
	}

}
