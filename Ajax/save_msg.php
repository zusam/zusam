<?php
session_start();

chdir(realpath(dirname(__FILE__).'/../'));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/Print_post.php');
require_once('Core/Forum.php');
require_once('Core/Miniature.php');

$pid = (String) $_POST['pid'];
$text = (String) $_POST['text'];
$forum = (String) $_POST['forum'];
$uid = (String) $_POST['uid'];
$parent = (String) $_POST['parent'];

if($_SESSION['connected'] && $_SESSION['uid'] == $uid) {
			
	$f = forum_load(array('_id'=>$forum));
	$u = account_load(array('_id' => new MongoId($uid)));

	if($_SESSION['forum'] == $f['_id'] && $u['forums'][$forum] != null) {

		// look for a preview
		$ret = preg_match("/https?:\/\/[^\s]+/i",$text,$matches);
		$ret2 = preg_match("/\{\:[A-Za-z0-9]+\:\}/i",$text,$matches2);
		if($ret != false && count($matches) > 0) {
			$preview = $matches[0];
		} else {
			if($ret2 != false && count($matches2) > 0) {
				$preview = $matches2[0];
			} else {
				$preview = "";
			}
		}

		// building response...
		if($preview != "") {
			// generating the miniature if it's not already done
			$link = gen_miniature($preview);
			if($link != false && $link != "") {
				$url_prev = $link;
			}
		} 
		// default placeholder image
		if(preg_match("/.*miniature\/.*\.jpg/",$url_prev) != 1) {
			$url_prev = p2l(pathTo("placeholder", "assets", "jpg"));
		}

		if($pid == null || $pid == 0) {
			if($parent == null || $parent == 0) {
				// new post
				$p = post_initialize($text, $uid, $preview, $forum);
				post_save($p);
				forum_post2news($f, $p['_id']);
				forum_updateTimestamp($f);
				forum_save($f);
			} else {
				// new com
				$p = post_load(array('_id'=>$parent));
				$c = post_initialize($text, $uid, $preview, $forum, $p['_id']);
				post_addChild($p, $c['_id']);
				post_save($c);
				post_save($p);
				forum_post2news($f, $p['_id']);
				forum_updateTimestamp($f);
				forum_save($f);
			}
		} else {
			if($parent == null || $parent == 0) {
				// editing post
				$p = post_load(array('_id'=>$pid));
				post_update($p, array('text'=>$text,'preview'=>$preview));
				post_save($p);
			} else {
				// editing com
				$c = post_load(array('_id'=>$pid));
				post_update($c, array('text'=>$text,'preview'=>$preview));
				post_save($c);
			}
		}

		$r = new stdClass();
		$r->link = $link;
		$r->miniature = $url_prev;
		$r->prev = $preview;
		$r->id = (String) $p['_id'];
		$r->text = $text;
		$r->parent = $parent;
		$r->pid = $pid;

		if($parent != null && $parent != 0) {
			$r->html = print_post($c['_id'], $uid);
		}

		header('Content-Type: text/json; charset=UTF-8');
		echo(json_encode($r));
	}
}

?>
