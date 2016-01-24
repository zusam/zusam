<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');
require_once('Core/Filtre.php');

function search_miniatures($text) {
	// look for a potential previews
	$ret = preg_match_all("/https?:\/\/[^\s]+/i",$text,$matches);
	$ret2 = preg_match_all("/\{\:[A-Za-z0-9]+\:\}/i",$text,$matches2);
	if($ret != false) {
		$matches = $matches[0];
	}
	if($ret2 != false) {
		$matches2 = $matches2[0];
	}
	$results = array_merge($matches, $matches2);
	return $results;
}

function create_miniatures($text) {
	$matches = search_miniatures($text);
	$results = [];
	foreach($matches as $preview) {
		$link = gen_miniature($preview);
		if($link != "") {
			$results[] = $link;
		}
	}
	return $results;
}

function search_miniature($text) {
	$miniatures = create_miniatures($text);
	return $miniatures[0];
}

function gen_miniature($url) {
	//var_dump($url);
	if(empty($url)) {
		return "";
	}
	$link = p2l(filtre($url));
	//var_dump($link);
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
