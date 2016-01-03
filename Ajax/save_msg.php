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

		account_updateTimestamp($u);

		$url_prev = search_miniature($text);
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
				forum_addUnread($f, $p['_id']);
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
				forum_addUnread($f, $p['_id']);
				$u['forums'][$forum]['timestamp'] = time();
				account_readPost($u, $id);
				account_save($u);
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
		if(preg_match("/.*miniature\/.*\.jpg/",$url_prev) != 1) {
			$inside = '<div class="text-container">';
			$text = cutIfTooLong($p['text'], 180);
			$inside .= '<div>'.$text.'</div>';
			$inside .= '</div>';
			$r->html_preview = $inside;
		} else {
			$r->miniature = $url_prev;
		}
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
