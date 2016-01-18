<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/MongoDriver.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');

function file_initialize($fileId, $type, $uid) {
	$file = [];
	$file['_id'] = mongo_id();
	$file['date'] = mongo_date();
	$file['type'] = $type;
	$file['owner'] = mongo_id($uid);
	$file['links'] = 1;
	$file['fileId'] = $fileId;

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
	mongo_save("files",$file);
}

function file_destroy($fid) {
	$mid = new MongoId($fid);
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

function file_print(&$file, $viewer) {

	$html = "";

	if($file['type'] == "jpg") {
		$imgsrc = p2l(file_getPath($file));
		if($viewer === "false" || $viewer === false) {
			$html .= '
				<div contenteditable="false">
					<img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" src="'.$imgsrc.'?'.time().'"/>
					<button onclick="showimageeditor(\'#retoucheBox\', this)" contentditable="false" class="editIMG">Editer l\'image</button>
				</div>
			';
		} else {
			$html .= '<img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" src="'.$imgsrc.'?'.time().'"/>';
		}
	}
	if($file['type'] == "webm") {
		$xx = p2l(pathTo2(array('url' => $file['fileId'], 'ext' => 'jpg', 'param' => 'mini')));
		$w = p2l(file_getPath($file));
		$html .= '<div onclick="loadVideo(this)" data-src="'.$w.'" class="launcher">';
		$html .= '<img src="'.$xx.'" onerror="loadVideo(this)"/>';
		$html .= '</div>';
	}
	if($file['type'] == "sgf") {
		$html .= '<div class="sgf-viewer" id="sgf-viewer-'.$file['fileId'].'"></div>';
		$html .= '<script>var wgo = new WGo.BasicPlayer(document.getElementById("sgf-viewer-'.$file['fileId'].'"), {sgfFile : "'.p2l(file_getPath($file)).'", enableKeys: false, enableWheel: false, layout: {top: ["InfoBox", "Control"],bottom: ["CommentBox"]}}); wgo.setCoordinates(true);</script>';
	}
	return $html;
}

?>
