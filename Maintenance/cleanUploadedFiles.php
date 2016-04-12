<?php

// Report all errors except E_NOTICE   
error_reporting(E_ALL ^ E_NOTICE);

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

$path = "Data/file/";
$files = scandir($path);

$total_fsize = 0;
$total_nfiles = 0;
foreach($files as $fname) {
	if(preg_match("/^\./",$fname)) {
		continue;
	}
	$fid = preg_replace("/\..*/","",$fname);
	$f = file_load(array('fileId'=>$fid));
	if($f == null) {
		$fsize = filesize($path.$fname);
		$total_fsize += $fsize;
		$total_nfiles++;
		//unlink($path.$fname);
		//var_dump(human_filesize($fsize));
		continue;
	}
	//if($f['links'] < 1) {
	//	var_dump($fname);
	//}
}
var_dump(human_filesize($total_fsize));
var_dump($total_nfiles);


?>
