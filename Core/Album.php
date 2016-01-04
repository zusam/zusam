<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/MongoDriver.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/File.php');

function album_initialize($albumId) {
	$a = [];
	$a['_id'] = mongo_id();
	$a['date'] = mongo_date();
	$a['files'] = [];
	$a['albumId'] = $albumId;
	return $a;
}

function album_load($array) {
	$a = mongo_load("albums",$array);
	return $a;
}

function album_addFile(&$a, &$f) {
	$fid = (String) $f['_id'];
	if(!in_array($fid, $a['files'])) {
		array_push($a['files'], $fid);
	}
}

function album_removeFile(&$a, &$f) {
	$fid = (String) $f['_id'];
	if(in_array($fid, $a['files'])) {
		file_unlink($f);
	}
}

function album_save(&$a) {
	mongo_save("albums", $a);
}

function album_destroy(&$a) {
	foreach($a['files'] as $fid) {
		$f = file_load(array('_id'=>$fid));
		if($f != false && $f != null) {
			album_removeFile($a, $f);
		}
	}
	mongo_destroy("albums", (String) $a['_id']);
}

function album_print(&$a, $viewer) {
	$html_data = "";
	$html_data .= '<div class="slideshow">';
	foreach($a['files'] as $ffid) {
		$file = file_load(array('_id'=>$ffid));
		if($file != false && $file != null) {
			$imgsrc = p2l(pathTo2(array("url" => $file['location'], "ext" => "jpg", "param" => "file")));
			$html_data .= '<div class="photo hidden" data-src="'.$imgsrc.'"></div>';
		}
	}
	$html_data .= '<img class="current zoomPossible" onclick="lightbox.enlighten(this)"/>';
	$html_data .= '<div class="action next" onclick="slideshow.next(this)"></div>';
	$html_data .= '<div class="action previous" onclick="slideshow.previous(this)"></div>';
	$html_data .= '<span class="title">'.count($a['files']).' photos</span>';
	$html_data .= '</div>';
	return $html_data;
}

?>
