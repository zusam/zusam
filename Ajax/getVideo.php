<?php

chdir(realpath(dirname(__FILE__)."/../"));
include('Core/Location.php');

$path = "";

$url = $_GET['url'];
if(preg_match("/\.mp4$/", $url)==1) {
	if(file_exists(pathTo($url, "video", "webm"))) {
		$path = p2l(pathTo($url, "video", "webm"));
	}
}
if(preg_match("/\.webm$/", $url)==1) {
	if(file_exists(pathTo($url, "video", "mp4"))) {
		$path = p2l(pathTo($url, "video", "mp4"));
	}
}

echo($path);
?>
