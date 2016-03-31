<?php

chdir(realpath(dirname(__FILE__)."/../"));

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

function saveVideo($url, $to, $progressID) {

	$in = escapeshellcmd($url);
	$out = escapeshellcmd($to);
	// 720p
	exec("/usr/bin/ffmpeg -t 600 -i ".$in." -c:v libvpx-vp9 -filter:v scale=-1:720 -crf 30 -b:v 2000K -speed 2 -c:a libvorbis -y -t 600 -f webm ".$out);
	// 360p
	//exec("/usr/bin/ffmpeg -t 600 -i ".$in." -c:v libvpx-vp9 -filter:v scale=-1:360 -crf 30 -b:v 1000K -speed 2 -c:a libvorbis -y -t 600 -f webm ".$out);
	if(filesize($out) == 0) {
		return false;
	}
	return true;
}

function videoThumbnail($url, $to) {

	$in = escapeshellcmd($url);
	$out = escapeshellcmd($to);
	$tmp = escapeshellcmd("tmp/".dechex(time()).dechex(rand(1,65536)));
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
