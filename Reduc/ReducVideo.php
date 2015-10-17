<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Reduc/ReducImage.php');

/*
function gif2webm($url, $to) {

	$in = escapeshellcmd($url);
	$out = escapeshellcmd($to);
	exec("/usr/bin/ffmpeg -t 60 -i ".$in." -y -an -b:v 1024k -bufsize 1024k -t 60 ".$out);
	if(filesize($out) == 0) {
		return false;
	}
	return true;
}
*/

function isAnimated($url) {
	$im = new \Imagick();
	try {
		if(!$im->readImage($url)) {
			throw new Exception("");
		}
	} catch(Exception $e) {
		return false;
	}
	foreach($im->deconstructImages() as $i) {
		$nb_image_frame++;
		if ($nb_image_frame > 1) {
			return true;
		}
	}
	return false;
}

/*
function video2webm($url, $to, $progressID) {

	$pathProgress = "tmp/".escapeshellcmd($progressID);
	$in = escapeshellcmd($url);
	$out = escapeshellcmd($to);
	exec("/usr/bin/ffmpeg -t 600 -i ".$in." -y -b:v 1024k -bufsize 1024k -t 600 ".$out." -progress ".$pathProgress);
	exec("/usr/bin/rm ".$pathProgress);
	if(filesize($out) == 0) {
		return false;
	}
	return true;
}
*/

// duplicate from video2webm
function saveVideo($url, $to, $progressID) {

	$pathProgress = "tmp/".escapeshellcmd($progressID);
	$in = escapeshellcmd($url);
	$out = escapeshellcmd($to);
	var_dump($in);
	var_dump($out);
	var_dump($pathProgress);
	//if(preg_match("/\.webm$/", $out) == 1) {
exec("/usr/bin/ffmpeg -t 600 -i ".$in." -c:v libvpx -filter:v scale=480:-1 -speed 2 -crf 24 -b:v 600k -c:a libvorbis -y -t 600 ".$out." -progress ".$pathProgress);
	//}
	//if(preg_match("/\.mp4$/", $out) == 1) {
	//	exec("/usr/bin/ffmpeg -t 600 -i ".$in." -y -vcodec h264 -strict -2 -b:v 1024k -bufsize 1024k -t 600 ".$out." -progress ".$pathProgress);
	//}
	exec("/usr/bin/rm ".$pathProgress);
	if(filesize($out) == 0) {
		return false;
	}
	return true;
}

/*
function webm2mp4($url, $to, $progressID) {

	$pathProgress = "tmp/".escapeshellcmd($progressID);
	$in = escapeshellcmd($url);
	$out = escapeshellcmd($to);

	exec("/usr/bin/ffmpeg -t 600 -i ".$in." -y -vcodec h264 -strict -2 -b:v 1024k -bufsize 1024k -t 600 ".$out." -progress ".$pathProgress);
	exec("/usr/bin/rm ".$pathProgress);
	if(filesize($out) == 0) {
		return false;
	}
	return true; 
}
*/

function videoThumbnail($url, $to) {
	
	if($height == null) {
		$height = "-1";
	}
	if($width == null) {
		$width = "-1";
	}

	$in = escapeshellcmd($url);
	$out = escapeshellcmd($to);
	$tmp = "tmp/".dechex(time()).dechex(rand(1,65536));
	exec("/usr/bin/ffmpeg -v -1 -i ".$in." -vcodec mjpeg -vframes 1 -an -f rawvideo -y ".$tmp);
	createPreview(320, $tmp, $out, 9/16, 70);
	exec("/usr/bin/rm ".$tmp);
	$r = filesize($out);
	if(filesize($out) == 0) {
		return false;
	}
	return true;
}
?>
