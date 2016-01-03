<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/File.php');
require_once('Core/Album.php');

function post_initialize($array) {
	$post = [];
	$post['_id'] = new MongoId();
	$post['date'] = new MongoDate(); 
	$post['children'] = [];
	$post['text'] = $array['text'];
	$post['uid'] = new MongoId($array['uid']);
	$post['preview'] = $array['preview'];
	$post['forum'] = new MongoId($array['forum']);
	$post['timestamp'] = time();
	if($array['parent'] != null && $array['parent'] != 0) {
		$post['parent'] = new MongoId($array['parent']);
	}
	return $post;
}

function post_updateTimestamp(&$post) {
	$post['timestamp'] = time();
}

function post_addButterfly(&$post, $uid) {
	if($post['butterflies'] == null) {
		$post['butterflies'] = [];
	}
	if($post['butterflies'][$uid] == null) {
		$post['butterflies'][$uid]['timestamp'] = time();
	}
}

function post_removeButterfly(&$post, $uid) {
	if($post['butterflies'] == null) {
		$post['butterflies'] = [];
	} else {
		unset($post['butterflies'][$uid]);
	}
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
	foreach($p['children'] as $key=>$cid) {
		if($cid == $mid || $cid == $id) {
			unset($p['children'][$key]);
		}
	}
}

function post_addChild(&$p, $id) {
	$mid = new MongoId($id);
	array_push($p['children'], $mid);
}

function post_removeFiles(&$p) {
	preg_match_all("/(\{\:)([\w\-]+)(\:\})/",$p['text'],$matches);
	foreach($matches[0] as $m) {
		$fileId = preg_replace("/(\{\:)([\w\-]+)(\:\})/","$2",$m);
		$file = file_load(array('fileId'=>$fileId));
		if($file != null && $file != false) {
			file_unlink($file);
		}
	}
}

function post_removeAlbums(&$p) {
	preg_match_all("/(\{\:\:)([\w\-]+)(\:\:\})/",$p['text'],$matches);
	foreach($matches[0] as $m) {
		$albumId = preg_replace("/(\{\:\:)([\w\-]+)(\:\:\})/","$2",$m);
		$album = album_load(array('albumId'=>$albumId));
		if($album != false && $album != null) {
			echo('album targeted');
			album_destroy($album);
		}
	}
}

function post_destroy($id) {
	$mid = new MongoId($id);
	$p = post_load(array('_id'=>$id));
	if($p != null && $p != false) {
		// unlink files
		post_removeFiles($p);
		post_removeAlbums($p);
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
