<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function file_initialize($fileId, $type, $uid) {
	$file = [];
	$file['_id'] = mongo_id();
	$file['date'] = mongo_date();
	$file['type'] = $type;
	$file['owner'] = mongo_id($uid);
	$file['links'] = 1;
	$file['fileId'] = $fileId;
	$file['timestamp'] = time();

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
	if($file['type'] == 'sgf') {
		$file['location'] = $file['fileId'];
	}
}

function file_save(&$file) {
	$file['timestamp'] = time();
	mongo_save("files",$file);
}

function file_destroy($fid) {
	$mid = mongo_id($fid);
	$f = file_load(array('_id'=>$fid));
	if($f != false && $f != null) {
		unlink(file_getPath($f));	
		mongo_destroy("files",$fid);
	}
}

function file_unlink(&$file) {
	$file['links'] = $file['links'] - 1;
	if($file['links'] <= 0) {
		file_destroy($file['_id']);
	} else {
		file_save($file);
	}
}

function file_bulkLoad($array) {
	$files = mongo_bulkLoad("files", $array);
	return $files;
}

function file_load($array) {
	$file = mongo_load("files", $array);
	return $file;
}

function file_getPath(&$file) {
	return pathTo2(array("url" => $file['location'], "ext" => $file['type'], "param" => "file"));
}

function file_getWidth(&$file) {
	//if(isset($file['width'])) {
	//	return $file['width'];
	//}
	$a = getimagesize(file_getPath($file));
	if($a != false && isset($a[0])) {
		//$file['width'] = $a[0];
		return $a[0];
	}
	return false;
}

function file_getHeight(&$file) {
	//if(isset($file['height'])) {
	//	return $file['height'];
	//}
	$a = getimagesize(file_getPath($file));
	if($a != false && isset($a[1])) {
		//$file['height'] = $a[1];
		return $a[1];
	}
	return false;
}

function file_albumImage(&$file) {
	$imgsrc = p2l(file_getPath($file));
	$xx = p2l(pmini($file['fileId']));
	$html = '<img class="zoomPossible" onclick="lightbox.enlighten(this)" src="'.$xx.'" data-lightbox="'.$imgsrc.'"/>';
	return $html;
}

function file_print(&$file) {

	$html = "";

	if($file['type'] == "jpg") {
		$imgsrc = p2l(file_getPath($file));

		$width = file_getWidth($file);
		$height = file_getHeight($file);
		$nw = 530;
		$nh = floor($nw * $height / $width);

		$xx = p2l(pmini($file['fileId']));

		$html .= '<img width="'.$nw.'" height="'.$nh.'" class="inlineImage zoomPossible lazyload" onclick="lightbox.enlighten(this)" data-src="'.$imgsrc.'?'.$file['timestamp'].'"/>';
		// save for getWidth and getHeight
		//file_save($file);
	}
	if($file['type'] == "webm") {
		$xx = p2l(pmini($file['fileId']));
		$w = p2l(file_getPath($file));
		$html .= '<div onclick="loadVideo(this)" data-src="'.$w.'" class="launcher">';
		$html .= '<img src="'.$xx.'" onerror="loadVideo(this)"/>';
		$html .= '</div>';
	}
	//if($file['type'] == "sgf") {
	//	$html .= '<div class="sgf-viewer" id="sgf-viewer-'.$file['fileId'].'"></div>';
	//	$html .= '<script>var wgo = new WGo.BasicPlayer(document.getElementById("sgf-viewer-'.$file['fileId'].'"), {sgfFile : "'.p2l(file_getPath($file)).'", enableKeys: false, enableWheel: false, layout: {top: ["InfoBox", "Control"],bottom: ["CommentBox"]}}); wgo.setCoordinates(true);</script>';
	//}
	return $html;
}

?>
