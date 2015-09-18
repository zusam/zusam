<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Location.php');
require_once('Reduc/ReducVideo.php');

function web_video($url, $file) {

	if($file == null) {
		$source = $url;
	} else {
		$source = $file;
	}

	if(file_exists(pathTo($url, "mini", "jpg"))) {
		return $url;
	} else {
		$tmp = file_get_contents($source);
		file_put_contents(pathTo($url,"tmp"), $tmp);
		if(file_exists(pathTo($url, "tmp"))) {

			// GENERATION
			$source = pathTo($url, "tmp");

			if(file_exists(pathTo($url, "mini", "jpg"))) {
				$path = pathTo($url, "mini", "jpg");
			} else {
				videoThumbnail($source, pathTo($url, "mini", "jpg"), 320, 180);
			}
			/*
			if(preg_match("/\.mp4$/", $url)==1) {
				if(!file_exists(pathTo($url, "video", "webm"))) {
					saveVideo($source, pathTo($url, "video", "webm"), "plop");
				}
			}
			if(preg_match("/\.webm$/", $url)==1) {
				if(!file_exists(pathTo($url, "video", "mp4"))) {
					saveVideo($source, pathTo($url, "video", "mp4"), "plop");
				}
			}
			*/
			unlink(pathTo($url, "tmp"));

			// RETURN
			if(file_exists(pathTo($url, "mini", "jpg"))) {
				return $url;
			}
		}
	}
	return false;
}
