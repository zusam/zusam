<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Location.php');
require_once('Filtre/web_image.php');

function dailymotion($url) {

	$thumbnail = preg_replace("/(http:\/\/www\.dailymotion\.com\/video\/)([0-9a-zA-Z]+)([^\s]*)/","http://www.dailymotion.com/thumbnail/video/$2",$url);
	
	if(!file_exists(pathTo($url, "mini", "jpg"))) {
		$tmp = file_get_contents($thumbnail);
		file_put_contents(pathTo($url,"tmp"), $tmp);
		if(file_exists(pathTo($url, "tmp"))) {
			$file = pathTo($url, "tmp");
			$ret = create_post_review($url, $file);
			return $ret;
		} else {
			return false;
		}
	}
	return pathTo($url, "mini", "jpg");
}
?>
