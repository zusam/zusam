<?php

	require_once('ReducImage.php');

$msg = $_GET['msg'];
if($msg != "") {
	$go = createPreview(320, $msg, "/tmp/plop.jpg", 9/16);
	header('Content-Type: image/jpeg');
	readfile("/tmp/plop.jpg");
	unlink("/tmp/plop.jpg");
} else {
	echo('<!DOCTYPE html><head><meta charset="utf-8"></head><body>');
	echo('<form action="'.$_SERVER['PHP_SELF'].'" method="GET">'); 
	echo('<input type="text" id="msg" name="msg"/><input type="submit"/>');
	echo('</form>');
	echo('</body></html>');
}


?>
