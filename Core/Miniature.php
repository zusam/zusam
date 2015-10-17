<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');
require_once('Core/Filtre.php');

function gen_miniature($url) {
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
