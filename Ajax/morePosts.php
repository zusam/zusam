<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/Accounts.php');

$start = intval($_GET['start']);
$forum = $_GET['forum'];

// TODO credentials ?

$html = "";

$location = realpath('..')."/forum/".$forum."/post/";
$posts = scandir($location);
array_shift($posts);
array_shift($posts);
natsort($posts);
$posts = array_reverse($posts);
//var_dump($start);
//var_dump($forum);
//var_dump($posts);
for($i=$start; $i < (30+$start) && $i < count($posts);$i++) {
	$e = $posts[$i];
	$p = post_load($location.$e);
	$pp = p2l(pathTo($p['preview'], "mini", "jpg"));
	if($pp == "" || !file_exists(pathTo($p['preview'], "mini", "jpg"))) {
		$inside = '<img src="'.p2l(pathTo("placeholder", "assets", "jpg")).'"/>';
	} else {
		$inside = '<img src="'.$pp.'"/>';
	}
	$id = preg_replace("/\.json/","",$e);
	$html .= '<div class="post-mini" data-id="'.$id.'">'.$inside.'</div>';
}

$ret = new StdClass();
$ret->html = $html;
$ret->entries = intval($i - $start);
header('Content-Type: text/json; charset=UTF-8');
echo(json_encode($ret));
?>
