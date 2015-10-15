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
require_once('Core/Print_post.php');	

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

	if($GET['action'] == "getFile") {


		$fileId = preg_replace("/\{\:([a-zA-Z0-9]+)\:\}/","$1",$GET['url']);
		$url = $GET['url'];

		$file = file_load(array("fileId" => $fileId));	
		$html = file_print($file);

		$response = new StdClass();
		$response->url = $url;
		$response->html = $html;

		header('Content-Type: text/json; charset=UTF-8');
		echo(json_encode($response));
		exit;

	}


	if($GET['action'] == "getAvatar") {

		$uid = $GET['uid'];

		$response = new StdClass();
		$response->avatar = p2l(pathTo($uid,"avatar","jpg"));

		header('Content-Type: text/json; charset=UTF-8');
		echo(json_encode($response));
		exit;
	}

	if($GET['action'] == "getPost") {


		$id = $GET['id'];

		$u = account_load(array('mail' => $_SESSION['mail']));
		$html_data = print_full_post($id, $u['_id']);
		$r = new StdClass();
		$r->html = $html_data;
		header('Content-Type: text/json; charset=UTF-8');
		echo(json_encode($r));
		exit;
	}

	if($GET['action'] == "getRaw") {

		$pid = $GET['pid'];

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
