<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');
require_once('Core/File.php');

function post_initialize($text, $uid, $preview, $forum, $parent) {
	$post = [];
	$post['_id'] = new MongoId();
	$post['date'] = new MongoDate(); 
	$post['children'] = [];
	$post['text'] = $text;
	$post['uid'] = new MongoId($uid);
	$post['preview'] = $preview;
	$post['forum'] = new MongoId($forum);
	$post['timestamp'] = time();
	if($parent != null) {
		$post['parent'] = new MongoId($parent);
	}
	return $post;
}

function post_updateTimestamp(&$post) {
	$post['timestamp'] = time();
}


function post_bulkLoad($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	if($array['uid'] != null && $array['uid'] != "") {
		$array['uid'] = new MongoId($array['uid']);
	}
	$m = new MongoClient();
	$posts = $m->selectDB("zusam")->selectCollection("posts");
	$p = $posts->find($array);
	return $p;
}

function post_load($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	if($array['uid'] != null && $array['uid'] != "") {
		$array['uid'] = new MongoId($array['uid']);
	}
	$m = new MongoClient();
	$posts = $m->selectDB("zusam")->selectCollection("posts");
	$p = $posts->findOne($array);
	return $p;
}

function post_update(&$p, $a) {
	foreach($a as $k => $v) {
		$p[$k] = $v;
	}
}

function post_removeChild(&$p, $id) {
	$mid = new MongoId($id);
	for($i = 0; $i < count($p['children']); $i++) {
		if($p['children'][$i] == $mid) {
			unset($p['children'][$i]);
		}
	}
}

function post_addChild(&$p, $id) {
	$mid = new MongoId($id);
	array_push($p['children'], $mid);
}

function post_getFiles(&$p) {

	$files = [];
	preg_match_all("/(\{\:)([A-Za-z0-9]+)(\:\})/",$p['text'],$matches);
	foreach($matches as $m) {
		$fileId = preg_replace("/(\{\:)([A-Za-z0-9]+)(\:\})/","$2",$m);
		$file = file_load(array('fileId'=>$fileId));
		if($file != null && $file != false) {
			array_push($files, $file);
		}
	}
	return $files;
}

function post_destroy($id) {
	$mid = new MongoId($id);
	$p = post_load(array('_id'=>$id));
	if($p != null && $p != false) {
		// unlink files
		$files = post_getFiles($p);
		foreach($files as $f) {
			file_unlink($f);
		}
		// destroy children
		foreach($p['children'] as $cid) {
			post_destroy($cid);
		}
		$m = new MongoClient();
		$posts = $m->selectDB("zusam")->selectCollection("posts");
		$posts->remove(array('_id' => $mid));
	}
}

function post_save(&$post) {
	$m = new MongoClient();
	$posts = $m->selectDB("zusam")->selectCollection("posts");
	$mid = new MongoId($post['_id']);
	$posts->update(array('_id' => $mid), $post, array('upsert' => true));
}

?>
