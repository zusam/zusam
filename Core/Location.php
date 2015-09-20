<?php

function p2l($path) {
	$link = preg_replace("/\/srv\/http/","http://localhost/",$path);
	return $link;
}

function pathTo($url, $param, $ext) {

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
	$loc = "Data";
	if($param == "assets") {
		$path = "Assets/".$url.$ext; 
		return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT']."/zusam/".$path);
	}
	if($param == "mini") {
		$path = $loc."/miniature/".hash("md5", $url).$ext; 
		return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT']."/zusam/".$path);
	}
	if($param == "tmp") {
		$path = "/tmp/".hash("md5", $url); 
		return $path;
	}
	//if($param == "data") {
	//	$path = $loc."/".$forum."/".$url.$ext; 
	//	return $path;
	//}
	if($param == "avatar") {
		$path = $loc."/avatar/".$url.$ext; 
		return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT']."/zusam/".$path);
	}
}

function pathTo2($args) {

	$url = $args['url'];
	$param = $args['param'];
	$ext = $args['ext'];
	$dir = $args['dir'];

	if(!$dir && ($param == "" || $url == "")) {
		return false;
	}
	if($ext == "") {
		$ext = ".".pathinfo($url, PATHINFO_EXTENSION);
	} else {
		if($ext{0} != ".") {
			$ext = ".".$ext;
		}
	}
	$loc = "Data";
	if(!$dir) {
		if($param == "assets") {
			$path = "Assets/".$url.$ext; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT']."/zusam/".$path);
		}
		if($param == "mini") {
			$path = $loc."/miniature/".hash("md5", $url).$ext; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT']."/zusam/".$path);
		}
		if($param == "avatar") {
			$path = $loc."/avatar/".$url.$ext; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT']."/zusam/".$path);
		}
		if($param == "tmp") {
			$path = "/tmp/".hash("md5", $url); 
			return $path;
		}
		if($param == "default_avatar") {
			$path = "Assets/avatar/".$url; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT']."/zusam/".$path);
		}
	} else {
		if($param == "default_avatar") {
			$path = "Assets/avatar"; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT']."/zusam/".$path);
		}
	}
}

?>
