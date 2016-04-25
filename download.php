<?php
session_start();

require_once('Include.php');

// secure variables
$GET = [];
foreach($_GET as $K=>$V) {
	$GET[$K] = (String) $V;
}


$file = file_load(array('fileId'=>$GET['fileId']));
if($file != null) {
	$fp = file_getPath($file);
	//header('Content-Type: application/octet-stream');
	header('Content-Type: image/jpg');
	header('Content-Disposition: attachment; filename="'.$file['fileId'].'.jpg"');
	echo(file_get_contents($fp));
}

?>
