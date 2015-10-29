<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Preview.php');
require_once('Filtre/web_image.php');

// TODO verify if that's sill necessary
function preview_v2($url) {
	return preview($url);
}

function preview($url) {
	$p = preview_load(array('url' => $url));
	if($p != null) {
		//$tmp = file_get_contents($src);
		//file_put_contents(pathTo($url,"tmp"), $tmp);
		//if(file_exists(pathTo($url, "tmp"))) {
		//	$file = pathTo($url, "tmp");
		//	$ret = create_post_preview($url, $file);
		//}
		$ret = json_encode($p,JSON_UNESCAPED_UNICODE);
		return $ret;
	} else {
		//$tmp = file_get_contents($src);
		//file_put_contents(pathTo($url,"tmp"), $tmp);
		//if(file_exists(pathTo($url, "tmp"))) {
		//	$file = pathTo($url, "tmp");
		//	$ret = create_post_preview($url, $file);
		//}
		$p = preview_initialize($url);
		preview_save($p);
		$ret = json_encode($p,JSON_UNESCAPED_UNICODE);
		return $ret;
	}
}

?>
