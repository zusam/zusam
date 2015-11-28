<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Reduc/ReducImage.php');


function create_post_preview($url, $file) {
	if($file != null) {
		$source = $file;
	} else {
		$source = $url;
	}
	if(!file_exists(pathTo($url, "mini", "jpg"))) {
		if(exif_imagetype($source) != IMAGETYPE_GIF) {
			//var_dump(file_exists(pathTo($url, "mini", "jpg")));
			//var_dump(is_writable(pathTo($url, "mini", "jpg")));
			//var_dump(pathTo($url, "mini", "jpg"));
			createPreview(320, $source, pathTo($url, "mini", "jpg"), 9/16, 70);
		} else {
			gifPreview(320, $source, pathTo($url, "mini", "jpg"), 9/16, 70);
		}
	}
	if(file_exists(pathTo($url, "mini", "jpg"))) {
		return pathTo($url, "mini", "jpg");
	} else {
		return false;
	}
}



function web_image($url, $file, $format) {

	// GENERATION

	if($file != null) {
		$source = $file;
	} else {
		$source = $url;
	}

	// facebook 
	$fb = false;
	if(preg_match("/fbcdn/",$url)==1) {
		//echo("fb!<br/>");
		$tmp = pathTo($url, "tmp");
		file_put_contents($tmp, file_get_contents($url));
		$r = filesize($tmp);
		if(filesize($tmp) != 0) {
			$url = $tmp;
			$fb = true;
		}
	}
	if(!file_exists(pathTo($url, "thumbnail_big", "jpg"))) {
		if(exif_imagetype($source) != IMAGETYPE_GIF) {
			createPreview(540, $source, pathTo($url, "thumbnail_big", "jpg"), $format, 70);
		} else {
			gifPreview(540, $source, pathTo($url, "thumbnail_big", "jpg"), $format, 70);
		}
	}
	if(file_exists(pathTo($url, "thumbnail_big", "jpg"))) {
		$source = pathTo($url, "thumbnail_big", "jpg");
	}
	if(!file_exists(pathTo($url, "thumbnail_small", "jpg"))) {
		if(exif_imagetype($source) != IMAGETYPE_GIF) {
			createPreview(320, $source, pathTo($url, "thumbnail_small", "jpg"), $format, 70);
		} else {
			gifPreview(320, $source, pathTo($url, "thumbnail_small", "jpg"), $format, 70);
		}
	}
	if(!file_exists(pathTo($url, "mini", "jpg"))) {
		if(exif_imagetype($source) != IMAGETYPE_GIF) {
			createPreview(320, $source, pathTo($url, "mini", "jpg"), 9/16, 70);
		} else {
			gifPreview(320, $source, pathTo($url, "mini", "jpg"), 9/16, 70);
		}
	}

	if($fb) {
		unlink($tmp);
	}

	if(file_exists(pathTo($url, "mini", "jpg"))) {
		return pathTo($url, "mini", "jpg");
	} else {
		return false;
	}

}
