<?php

function post_initialize($text, $uid, $preview, $forum, $parent) {
	$post = [];
	$post['_id'] = new MongoId();
	$post['date'] = new MongoDate(); 
	$post['children'] = [];
	$post['text'] = $text;
	$post['uid'] = $uid;
	$post['preview'] = $preview;
	$post['forum'] = $forum;
	if($parent != null) {
		$post['parent'] = new MongoId($parent);
	}
	return $post;
}

function post_load($id) {
	$m = new MongoClient();
	$posts = $m->selectDB("zusam")->selectCollection("posts");
	$mid = new MongoId($id);
	$p = $posts->findOne(array('_id' => $mid));
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

function post_destroy($id) {
	$m = new MongoClient();
	$mid = new MongoId($id);
	$posts = $m->selectDB("zusam")->selectCollection("posts");
	$posts->remove(array('_id' => $mid));
}

function post_save(&$post) {
	$m = new MongoClient();
	$posts = $m->selectDB("zusam")->selectCollection("posts");
	$mid = new MongoId($post['_id']);
	$posts->update(array('_id' => $mid), $post, array('upsert' => true));
}

?>
