<?php

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Include.php');

function preview($url) {
	$p = preview_load(array('url' => $url));
	if($p != null) {
		$ret = json_encode($p,JSON_UNESCAPED_UNICODE);
		return $ret;
	} else {
		$p = preview_initialize($url);
		preview_save($p);
		$ret = json_encode($p,JSON_UNESCAPED_UNICODE);
		
		return $ret;
	}
}

?>
