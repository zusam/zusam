<?php
session_start();

chdir(realpath(dirname(__FILE__).'/../'));
require_once('Core/Filtre.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/Preview.php');
require_once('Core/Miniature.php');

// TODO acl ?
if($_SESSION['connected']) {

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
	// GENERAL LINKS & OPEN GRAPH //
	if(preg_match("/https?:\/\/[\w\/=?~.%&+\-#]+/",$url)==1) {
		$ret = preview($url);
		gen_miniature($url);
	}

	header('Content-Type: text/json; charset=UTF-8');
	echo($ret);
}

?>
