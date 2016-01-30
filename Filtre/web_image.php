<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Include.php');


//TODO rename to "create_post_miniature"
function create_post_preview($url, $file) {
	if($file != null) {
		$source = $file;
	} else {
		$source = $url;
	}
	if(!file_exists(pmini($url))) {
		if(exif_imagetype($source) != IMAGETYPE_GIF) {
			createPreview(320, $source, pmini($url), 9/16, 70);
		} else {
			gifPreview(320, $source, pmini($url), 9/16, 70);
		}
	}
	if(file_exists(pmini($url))) {
		return pmini($url);
	} else {
		return false;
	}
}

