<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');
require_once('Core/Utils.php');

function file_initialize($fileId, $type, $uid) {
	$file = [];
	$file['_id'] = new MongoId();
	$file['date'] = new MongoDate();
	$file['type'] = $type;
	$file['owner'] = new MongoId($uid);
	$file['links'] = 1;
	$file['fileId'] = $fileId;
	$file['forums'] = [];

	file_locate($file);

	return $file;
}

function file_locate(&$file) {
	if($file['type'] == 'jpg') {
		$file['location'] = $file['fileId'];
	}
	if($file['type'] == 'webm') {
		$file['location'] = $file['fileId'];
	}
}

function file_save(&$file) {
	$m = new MongoClient();
	$files = $m->selectDB("zusam")->selectCollection("files");
	$mid = new MongoId($file['_id']);
	$files->update(array('_id' => $mid), $file, array('upsert' => true));
}

function file_destroy($fid) {
	$mid = new MongoId($fid);
	$f = file_load(array('_id'=>$fid));
	if($f != false && $f != null) {
		unlink(file_getPath($f));	
		$m = new MongoClient();
		$files = $m->selectDB("zusam")->selectCollection("files");
		$files->remove(array('_id' => $mid));
	}
}

function file_unlink(&$file) {
	$file['links'] = $file['links'] - 1;
	file_save($file);
	if($file['links'] <= 0) {
		file_destroy($file['_id']);
	}
}

function file_bulkLoad($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	if($array['owner'] != null && $array['owner'] != "") {
		$array['owner'] = new MongoId($array['owner']);
	}
	$m = new MongoClient();
	$files = $m->selectDB("zusam")->selectCollection("files");
	$file = $files->find($array);
	return $file;
}

function file_load($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	if($array['owner'] != null && $array['owner'] != "") {
		$array['owner'] = new MongoId($array['owner']);
	}
	$m = new MongoClient();
	$files = $m->selectDB("zusam")->selectCollection("files");
	$file = $files->findOne($array);
	return $file;
}

function file_getPath(&$file) {
	return pathTo2(array("url" => $file['location'], "ext" => $file['type'], "param" => "file"));
}

function file_print(&$file) {

	$html = "";

	if($file['type'] == "jpg") {
		$html .= '<img class="zoomPossible" onclick="lightbox.enlighten(this)" src="'.p2l(pathTo2(array("url" => $file['location'], "ext" => "jpg", "param" => "file"))).'"/>';
	}
	if($file['type'] == "webm") {
		$html .= '<video controls="true" src="'.p2l(pathTo2(array("url" => $file['location'], "ext" => "webm", "param" => "file"))).'"></video>';
	}

	return $html;
}

?>
