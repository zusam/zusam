<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');
require_once('Core/Filtre.php');

function gen_miniature($url) {
	$link = p2l(filtre($url));
	return $link;
}

function get_miniature($url) {
	$link = p2l(pathTo($url, "mini", "jpg"));
	return $link;
}
function get_miniature_path($url) {
	$link = pathTo($url, "mini", "jpg");
	return $link;
}

?>
