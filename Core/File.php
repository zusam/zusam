<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');

function file_initialize($fileId, $type, $uid) {
	$file = [];
	$file['_id'] = new MongoId();
	$file['date'] = new MongoDate();
	$file['type'] = $type;
	$file['owner'] = new MongoId($uid);
	$file['links'] = 1;
	$file['fileId'] = $fileId;

	file_locate($file);

	return $file;
}

function file_locate(&$file) {
	if($file['type'] == 'jpg') {
		$file['location'] = $file['fileId'];
	}
}

function file_save(&$file) {
	$m = new MongoClient();
	$files = $m->selectDB("zusam")->selectCollection("files");
	$mid = new MongoId($file['_id']);
	$files->update(array('_id' => $mid), $file, array('upsert' => true));
}

function file_unlink(&$file) {
	$file['links'] = $file['links'] - 1;
	if($file['links'] <= 0) {
		unlink($file['location']);	
	}
	file_save($file);
}

function file_load($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	$m = new MongoClient();
	$files = $m->selectDB("zusam")->selectCollection("files");
	$file = $files->findOne($array);
	return $file;
}

function file_print(&$file) {

	$html = "";

	if($file['type'] == "jpg") {
		$html .= '<img class="zoomPossible" onclick="lightbox.enlighten(this)" src="'.p2l(pathTo2(array("url" => $file['location'], "ext" => "jpg", "param" => "file"))).'"/>';
	}

	return $html;
}

?>
