<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Preview_v2.php');
require_once('Filtre/web_image.php');

function preview_v2($url) {
	$p = preview_load(array('url' => $url));
	if($p != null) {
		$tmp = file_get_contents($src);
		file_put_contents(pathTo($url,"tmp"), $tmp);
		if(file_exists(pathTo($url, "tmp"))) {
			$file = pathTo($url, "tmp");
			$ret = create_post_preview($url, $file);
		}
		$ret = fixBadUnicode(json_encode($p));
		return $ret;
	} else {
		$tmp = file_get_contents($src);
		file_put_contents(pathTo($url,"tmp"), $tmp);
		if(file_exists(pathTo($url, "tmp"))) {
			$file = pathTo($url, "tmp");
			$ret = create_post_preview($url, $file);
		}
		$p = preview_initialize($url);
		preview_save($p);
		$ret = fixBadUnicode(json_encode($p));
		return $ret;
	}
}

?>
