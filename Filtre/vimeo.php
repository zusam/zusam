<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Location.php');
require_once('Filtre/web_image.php');

function vimeo($url) {

	$id = preg_replace("/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/","$3",$url);
	$hash = unserialize(file_get_contents("http://vimeo.com/api/v2/video/$id.php"));
	$thumbnail = $hash[0]['thumbnail_large'];  

	if(!file_exists(pathTo($url, "mini", "jpg"))) {
		$tmp = file_get_contents($thumbnail);
		file_put_contents(pathTo($url,"tmp"), $tmp);
		if(file_exists(pathTo($url, "tmp"))) {
			$file = pathTo($url, "tmp");
			$ret = create_post_preview($url, $file);
			unlink(pathTo($url, "tmp"));
			return $ret;
		} else {
			return false;
		}
	}
	return pathTo($url, "mini", "jpg");

}


?>
