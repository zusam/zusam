<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');
require_once('Core/Filtre.php');

function search_miniature($text) {
	// look for a potential previews
	$ret = preg_match_all("/https?:\/\/[^\s]+/i",$text,$matches);
	$ret2 = preg_match_all("/\{\:[A-Za-z0-9]+\:\}/i",$text,$matches2);
	$ret3 = preg_match_all("/\{\:\:[A-Za-z0-9]+\:\:\}/i",$text,$matches3);
	if($ret != false) {
		$matches = $matches[0];
	}
	if($ret2 != false) {
		$matches2 = $matches2[0];
	}
	if($ret3 != false) {
		$matches3 = $matches3[0];
	}
	// look for a image that we can render
	foreach($matches as $preview) {
		//var_dump($preview);
		$link = gen_miniature($preview);
		//var_dump($link);
		if($link != false && $link != "") {
			$url_prev = $link;
			break;
		}
	}
	if($url_prev == "") {
		foreach($matches2 as $preview) {
			$link = gen_miniature($preview);
			if($link != false && $link != "") {
				$url_prev = $link;
				break;
			}
		}
	}
	if($url_prev == "") {
		foreach($matches3 as $preview) {
			$link = gen_miniature($preview);
			if($link != false && $link != "") {
				$url_prev = $link;
				break;
			}
		}
	}
	return $url_prev;
}

function gen_miniature($url) {
	if(empty($url)) {
		return "";
	}
	$link = p2l(filtre($url));
	return $link;
}

function get_miniature($url) {
	//if it's a file
	if(preg_match("/\{\:[a-zA-Z0-9]+\:\}/",$url)==1) {
		$url = preg_replace("/\{\:([a-zA-Z0-9]+)\:\}/","$1",$url);
	}
	$link = p2l(pathTo($url, "mini", "jpg"));
	return $link;
}

function get_miniature_path($url) {
	//if it's a file
	if(preg_match("/\{\:[a-zA-Z0-9]+\:\}/",$url)==1) {
		$url = preg_replace("/\{\:([a-zA-Z0-9]+)\:\}/","$1",$url);
	}
	$link = pathTo($url, "mini", "jpg");
	return $link;
}

?>
