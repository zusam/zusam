<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Include.php');

// This function is used to create miniatures from web videos
// It's optimized to download as little as possible from the actual video
function web_video($url, $file) {

	if($file == null) {
		$source = $url;
	} else {
		$source = $file;
	}

	if(file_exists(pmini($url))) {
		return p2l(pmini($url));
	} else {

		videoThumbnail($source, pmini($url));
		if(file_exists(pmini($url))) {
			return p2l(pmini($url));
		} else {
			// if it failed, try to download the file separately
			$tmp = fgc($source, 65536);
			file_put_contents(pathTo2(array("url"=>$url,"param"=>"tmp")), $tmp);
			if(file_exists(pathTo2(array("url"=>$url, "param"=>"tmp")))) {

				// GENERATION
				$source = pathTo2(array("url"=>$url, "param"=>"tmp"));

				if(file_exists(pmini($url))) {
					$path = pmini($url);
				} else {
					videoThumbnail($source, pmini($url));
				}
				unlink(pathTo2(array("url"=>$url, "param"=>"tmp")));

				// RETURN
				if(file_exists(pmini($url))) {
					return p2l(pmini($url));
				}
			}
		}
	}
	return false;
}
