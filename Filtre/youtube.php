<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');
require_once('Filtre/web_image.php');

function youtube($url) { 
	$thumbnail = preg_replace("/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/",
					"http://img.youtube.com/vi/$4/0.jpg",$url);
	if(!file_exists(pathTo($url, "mini", "jpg"))) {
		$tmp = file_get_contents($thumbnail);
		file_put_contents(pathTo($url,"tmp"), $tmp);
		if(file_exists(pathTo($url, "tmp"))) {
			$file = pathTo($url, "tmp");
			$ret = create_post_preview($url, $file);
			unlink(pathTo($url, "tmp"));
			if($ret == true) {
				$ret = pathTo($url, "mini", "jpg");
			}
			return $ret;
		} else {
			return false;
		}
	}
	return pathTo($url, "mini", "jpg");
}

function youtube2($url) { 
	$thumbnail = preg_replace("/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/",
					"http://img.youtube.com/vi/$2/0.jpg",$url);
	if(!file_exists(pathTo($url, "mini", "jpg"))) {
		$tmp = file_get_contents($thumbnail);
		file_put_contents(pathTo($url,"tmp"), $tmp);
		if(file_exists(pathTo($url, "tmp"))) {
			$file = pathTo($url, "tmp");
			$ret = create_post_preview($url, $file);
			unlink(pathTo($url, "tmp"));
			if($ret == true) {
				$ret = pathTo($url, "mini", "jpg");
			}
			return $ret;
		} else {
			return false;
		}
	}
	return pathTo($url, "mini", "jpg");
}

?>
