<?php

function p2l($path) {
	$path = preg_replace("/\/srv\/http\/zusam\//",$GLOBALS['__ROOT_URL__'],$path);
	return $path;
}

// this function is just a shortcut
function pmini($url) {
	return pathTo2(array('url'=>$url,'param'=>'mini','ext'=>'jpg'));
}

// this function is just a shortcut
function ppi($url) {
	return pathTo2(array('url'=>$url,'param'=>'postImage','ext'=>'jpg'));
}

// TODO remove this function
function pathTo($url, $param, $ext) {
	return pathTo2(array('url' => $url, 'param' => $param, 'ext' => $ext));
}

function pathTo2($args) {

	$url = $args['url'];
	$param = $args['param'];
	$ext = $args['ext'];
	if(isset($args['dir'])) {
		$dir = $args['dir'];
	} else {
		$dir = null;
	}

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
	if($ext == ".") {
		$ext = "";
	}

	$loc = "Data";
	if($param == "assets") {
		$path = "Assets/".$url.$ext; 
		return realpath(dirname(__FILE__)."/../")."/".$path;
	}
	if($param == "default_avatar") {
		$path = "Assets/default_avatar/".$url.$ext; 
		return realpath(dirname(__FILE__)."/../")."/".$path;
	}
	if($param == "static_mini") {
		$path = "Assets/Miniatures/".$url.$ext; 
		return realpath(dirname(__FILE__)."/../")."/".$path;
	}
	if($param == "mini") {
		$path = $loc."/miniature/".hash("md5", $url).$ext; 
		return realpath(dirname(__FILE__)."/../")."/".$path;
	}
	if($param == "postImage") {
		$path = $loc."/postImage/".hash("md5", $url).$ext; 
		return realpath(dirname(__FILE__)."/../")."/".$path;
	}
	if($param == "avatar") {
		$path = $loc."/avatar/".$url.$ext; 
		return realpath(dirname(__FILE__)."/../")."/".$path;
	}
	if($param == "file") {
		$path = $loc."/file/".$url.$ext; 
		return realpath(dirname(__FILE__)."/../")."/".$path;
	}
	if($param == "uploaded") {
		$path = $loc."/uploaded/".$url.$ext; 
		return realpath(dirname(__FILE__)."/../")."/".$path;
	}
	if($param == "tmp") {
		$path = "tmp/".hash("md5", $url); 
		return $path;
	}
}

?>
