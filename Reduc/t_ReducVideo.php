<?php

	require_once('ReducVideo.php');

$msg = $_GET['msg'];
if($msg != "") {
	$go = ReducVideo\videoThumbnail($msg, "/srv/http/tmp/plop.jpg", 320, 240);
	if($go == false) {
		echo("fail");
	} else {
		header('Content-Type: image/jpeg');
		readfile("/srv/http/tmp/plop.jpg");
		unlink("/srv/http/tmp/plop.jpg");
	}
} else {
	echo('<!DOCTYPE html><head><meta charset="utf-8"></head><body>');
	echo('<form action="'.$_SERVER['PHP_SELF'].'" method="GET">'); 
	echo('<input type="text" id="msg" name="msg"/><input type="submit"/>');
	echo('</form>');
	echo('</body></html>');
}


?>
