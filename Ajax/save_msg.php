<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Include.php');

$pid = (String) $_POST['pid'];
$text = (String) $_POST['text'];
$forum = (String) $_POST['forum'];
$uid = (String) $_POST['uid'];
$parent = (String) $_POST['parent'];


if($_SESSION['connected'] && $_SESSION['uid'] == $uid) {
			
	$f = forum_load(array('_id'=>$forum));
	$u = account_load(array('_id' => mongo_id($uid)));

	if($_SESSION['forum'] == $f['_id'] && $u['forums'][$forum] != null) {

		account_updateTimestamp($u);
		account_usageTimestamp($u);

		$preview = search_miniature($text);
		account_save($u);

		if($pid == null || $pid == 0) {
			if($parent == null || $parent == 0) {
				// new post
				$p = post_initialize(array('text'=>$text, 'uid'=>$uid, 'preview'=>$preview, 'forum'=>$forum));
				post_save($p);
				forum_post2news($f, $p['_id']);
				forum_updateTimestamp($f);
				forum_save($f);
				$u['forums'][$forum]['timestamp'] = time();
				account_save($u);
				forum_addUnread($f, $p['_id'], $uid);
			} else {
				// new com
				$p = post_load(array('_id'=>$parent));
				$c = post_initialize(array('text'=>$text, 'uid'=>$uid, 'preview'=>$preview, 'forum'=>$forum, 'parent'=>$parent));
				post_addChild($p, $c['_id']);
				post_save($c);
				post_updateTimestamp($p);
				post_save($p);
				forum_post2news($f, $p['_id']);
				forum_updateTimestamp($f);
				forum_save($f);
				forum_addUnread($f, $p['_id'], $uid);
				$u['forums'][$forum]['timestamp'] = time();
				account_readPost($u, $id);
				account_save($u);
			}
		} else {
			// editing (parent or child)
			$p = post_load(array('_id'=>$pid));
			post_update($p, array('text'=>$text,'preview'=>$preview));
			post_save($p);
		}

		$r = new stdClass();
		$r->miniature = p2l($preview);
		$r->prev = $preview;
		$r->id = (String) $p['_id'];
		$r->text = $text;
		$r->parent = $parent;
		$r->pid = $pid;

		if($parent != null && $parent != 0) {
			if($pid == $parent) {
				$r->mini_html = print_post_mini($p, false);
				$r->html = print_post($p['_id'], $uid);
			} else {
				$r->html = print_post($c['_id'], $uid);
			}
		} else {
			$r->mini_html = print_post_mini($p, false);
		}

		header('Content-Type: text/json; charset=UTF-8');
		echo(json_encode($r));
	}
}

?>
