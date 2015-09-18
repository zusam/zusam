<?php

function p2l($path) {
	$link = preg_replace("/\/srv\/http/","http://www.nibou.eu",$path);
	return $link;
}

function pathTo($url, $param, $ext, $forum) {

	if($param == "" || $url == "") {
		return false;
	}
	if($ext == "") {
		$ext = ".".pathinfo($url, PATHINFO_EXTENSION);
	} else {
		if($ext{0} != ".") {
			$ext = ".".$ext;
		}
	}
	if($forum == "") {
		$loc = "web";
	} else {
		$loc = "forum";
	}
	if($param == "assets") {
		$path = $loc."/assets/".$url.$ext; 
	}
	//if($param == "upload") {
	//	$path = $loc."/".$forum."/upload/".hash("md5", $url).$ext; 
	//}
	if($param == "mini") {
		$path = $loc."/".$forum."/mini/".hash("md5", $url)."_mini".$ext; 
	}
	//if($param == "original") {
	//	$path = $loc."/".$forum."/original/".hash("md5", $url).$ext; 
	//}
	//if($param == "video") {
	//	$path = $loc."/".$forum."/video/".hash("md5", $url).$ext; 
	//}
	if($param == "tmp") {
		$path = "/tmp/".hash("md5", $url); 
		return $path;
	}
	if($param == "data") {
		$path = $loc."/".$forum."/".$url.$ext; 
	}
	if($param == "avatar") {
		$path = "accounts/uploads/avatars/".$url.$ext; 
	}
	return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT']."/zusam/".$path);
}

?>
