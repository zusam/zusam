<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function post_initialize($array) {
	$post = [];
	$post['_id'] = mongo_id();
	$post['date'] = mongo_date(); 
	$post['children'] = [];
	$post['text'] = $array['text'];
	$post['uid'] = mongo_id($array['uid']);
	$post['preview'] = $array['preview'];
	$post['forum'] = mongo_id($array['forum']);
	$post['timestamp'] = time();
	if($array['parent'] != null && $array['parent'] != 0) {
		$post['parent'] = mongo_id($array['parent']);
	}
	return $post;
}

function post_updateTimestamp(&$post) {
	$post['timestamp'] = time();
}

//function post_addButterfly(&$post, $uid) {
//	if($post['butterflies'] == null) {
//		$post['butterflies'] = [];
//	}
//	if($post['butterflies'][$uid] == null) {
//		$post['butterflies'][$uid]['timestamp'] = time();
//	}
//}
//
//function post_removeButterfly(&$post, $uid) {
//	if($post['butterflies'] == null) {
//		$post['butterflies'] = [];
//	} else {
//		unset($post['butterflies'][$uid]);
//	}
//}

function post_bulkLoad($array) {
	$p = mongo_bulkLoad("posts",$array);
	return $p;
}

function post_load($array) {
	$p = mongo_load("posts", $array);
	return $p;
}

function post_update(&$p, $a) {
	foreach($a as $k => $v) {
		$p[$k] = $v;
	}
}

function post_removeChild(&$p, $id) {
	$mid = mongo_id($id);
	foreach($p['children'] as $key=>$cid) {
		if($cid == $mid || $cid == $id) {
			unset($p['children'][$key]);
		}
	}
}

function post_addChild(&$p, $id) {
	$mid = mongo_id($id);
	array_push($p['children'], $mid);

	//TODO XXX TRICK
	$children = $p['children'];
	unset($p['children']);
	$p['children'] = $children;
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

function post_destroy($id) {
	$p = post_load(array('_id'=>$id));
	if($p != null && $p != false) {
		// unlink files
		post_removeFiles($p);
		post_removeAlbums($p);
		// destroy children
		foreach($p['children'] as $cid) {
			post_destroy($cid);
		}
		mongo_destroy("posts",$id);
	}
}

function post_save(&$post) {
	mongo_save("posts",$post);
}

?>
