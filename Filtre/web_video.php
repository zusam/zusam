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

		videoThumbnail($source, pathTo($url, "mini", "jpg"));
		if(file_exists(pathTo($url, "mini", "jpg"))) {
			return $url;
		} else {
			// if it failed, try to download the file separately
			$tmp = fgc($source, 65536);
			file_put_contents(pathTo($url,"tmp"), $tmp);
			if(file_exists(pathTo($url, "tmp"))) {

				// GENERATION
				$source = pathTo($url, "tmp");

				if(file_exists(pathTo($url, "mini", "jpg"))) {
					$path = pathTo($url, "mini", "jpg");
				} else {
					videoThumbnail($source, pathTo($url, "mini", "jpg"));
				}
				unlink(pathTo($url, "tmp"));

				// RETURN
				if(file_exists(pathTo($url, "mini", "jpg"))) {
					return $url;
				}
			}
		}
	}
	return false;
}
