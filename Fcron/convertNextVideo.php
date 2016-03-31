<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

$path = "Data/uploaded/";
$to = "Data/converted/";
$queue = scandir($path);

foreach($queue as $q) {
	if($q == "." || $q == "..") {
		// this is just the current directory
		continue;
	}
	$basename = preg_replace("/^(.*)\..*$/","$1",$q);
	if(file_exists("Data/file/".$basename.".webm")) {
		// file already converted
		unlink($path.$q);
		continue;
	}
	if(file_exists($to.$basename.".webm")) {
		// file already converting
		// do nothing for now.
		break;
	}

	// ok, let's convert !
	$r = saveVideo($path.$q, $to.$basename.".webm", (String) time());
	if($r) {
		rename($to.$basename.".webm", "Data/file/".$basename.".webm");
		//unlink($to.$basename.".webm");
		unlink($path.$q);
	}
}

?>
