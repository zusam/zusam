<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Location.php');
require_once('Core/Post.php');
require_once('Core/Notification.php');

function forum_initialize($name) {
	$forum = [];
	$forum['_id'] = new MongoId();
	$forum['date'] = new MongoDate();
	$forum['name'] = $name;
	$forum['users'] = [];
	$forum['news'] = [];
	$forum['link'] = sha1(rand().$forum['_id'].time());
	$forum['salt'] = bin2hex(openssl_random_pseudo_bytes(6));
	return $forum;
}

function forum_addUnread(&$forum, $pid) {
	foreach($forum['users'] as $uid) {
		$u = account_load(array('_id'=>$uid));
		if($u != null && $u != false) {
			account_addUnread($u, $pid);
			account_save($u);
		}
	}
}

function forum_updateTimestamp(&$forum) {
	$forum['timestamp'] = time();
}

function forum_changeLink(&$forum) {
	$forum['link'] = sha1(rand().$forum['_id'].time());
}

function forum_save(&$forum) {
	$m = new MongoClient();
	$forums = $m->selectDB("zusam")->selectCollection("forums");
	$mid = new MongoId($forum['_id']);
	$forums->update(array('_id' => $mid), $forum, array('upsert' => true));
}

function forum_bulkLoad($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	$m = new MongoClient();
	$forums = $m->selectDB("zusam")->selectCollection("forums");
	$forum = $forums->find($array);
	return $forum;
}

function forum_load($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	$m = new MongoClient();
	$forums = $m->selectDB("zusam")->selectCollection("forums");
	$forum = $forums->findOne($array);
	return $forum;
}

function forum_post2news(&$forum, $pid) {
	$pid = (String) $pid;
	deleteValue($pid, $forum['news']); 	
	array_push($forum['news'], $pid);
}

function forum_addUser_andSave(&$forum, &$user) {
	if(!in_array($user['_id'], $forum['users'])) {
		array_push($forum['users'], $user['_id']);
	}
	account_addForum($user, $forum);
	forum_save($forum);
	account_save($user);
}

function forum_removeUser_andSave(&$forum, &$user) {
	deleteValue($user['_id'], $forum['users']);
	deleteKey($forum['_id'], $user['forums']);
	forum_save($forum);
	account_save($user);
	if(count($forum['users']) <= 0) {
		forum_destroy($forum['_id']);
	}
}

function forum_getAvatar(&$forum) {
	if(file_exists(pathTo($forum['_id'], "avatar", "jpg"))) {
		$avatar = p2l(pathTo($forum['_id'], "avatar", "jpg"));
		return $avatar;
	} else {
		return "";
	}
}

function forum_genIdenticon(&$forum) {

	list($r,$g,$b) = sscanf(substr($forum['salt'],0,6), "%02x%02x%02x");
	$rl = floor((255+$r)/2);
	$gl = floor((255+$g)/2);
	$bl = floor((255+$b)/2);
	$rd = floor((0+$r)/2);
	$gd = floor((0+$g)/2);
	$bd = floor((0+$b)/2);

	$html = '';
	$html .= '
		<div data-color="'.substr($forum['salt'],0,6).'" class="identicon" style="background:rgb('."$rd,$gd,$bd".')">
			<i class="fa fa-camera-retro" style="color:rgb('."$rl,$gl,$bl".')"></i>
		</div>
	';

	return $html;
}

function forum_getAvatarHTML(&$forum) {
	
	$html = "";

	$avatar = forum_getAvatar($forum);
	if($avatar == "") {
		$html = forum_genIdenticon($forum);
	} else {
		$html = '<img src="'.$avatar.'"/>';
	}
	return $html;
}

function forum_destroy($fid) {
	$mid = new MongoId($fid);
	
	$f = forum_load(array('_id'=>$fid));
	if($f != null && $f != false) {
		$posts = post_bulkLoad(array('forum'=>$mid));	
		foreach($posts as $p) {
			post_destroy($p['_id']);
		}
		$notifications = notification_bulkLoad(array('source'=>$fid));
		foreach($notifications as $n) {
			notification_destroy($n['_id']);
		}
		$m = new MongoClient();
		$forums = $m->selectDB("zusam")->selectCollection("forums");
		$forums->remove(array('_id' => $mid));
	}
}

?>
