<?php

chdir(realpath(dirname(__FILE__).'/../'));
require_once('Reduc/ReducImage.php');
require_once('Reduc/ReducVideo.php');
require_once('Core/Filtre.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');

// TODO acl ?

$url = $_GET['url'];
// reconstruct url when it has parameters :
if(count($_GET) > 1) {
	$reconstructed = $url;
	foreach($_GET as $k => $v) {
		if($k != 'url') {
			$reconstructed .= "&".$k."=".$v;
		}
	}
	$url = $reconstructed;
}

//echo("gen_im,");

$ret = filtre($url);
//TODO if we enable this header searchFilter.js is broken because of the automatic conversion of jquery
//header('Content-Type: text/json; charset=UTF-8');
echo($ret);


?>
