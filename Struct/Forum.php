<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function forum_initialize($name) {
	$forum = [];
	$forum['_id'] = mongo_id();
	$forum['date'] = mongo_date();
	$forum['name'] = $name;
	$forum['users'] = [];
	$forum['news'] = [];
	$forum['link'] = sha1(rand().$forum['_id'].time());
	$forum['salt'] = bin2hex(openssl_random_pseudo_bytes(6));
	return $forum;
}

function forum_addUnread(&$forum, $pid) {
	foreach($forum['users'] as $uid) {
		$uid = (String) $uid;
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
	mongo_save("forums",$forum);
}

function forum_bulkLoad($array) {
	$forum = mongo_bulkLoad("forums",$array);
	return $forum;
}

function forum_load($array) {
	$forum = mongo_load("forums", $array);
	return $forum;
}

function forum_post2news(&$forum, $pid) {
	$pid = (String) $pid;
	$forum['news'] = deleteValue($pid, $forum['news']); 	
	array_push($forum['news'], $pid);

	// TODO XXX TRICK
	$news = $forum['news'];
	unset($forum['news']);
	$forum['news'] = $news;
}

function forum_removeFromNews(&$forum, $pid) {
	$pid = (String) $pid;
	$forum['news'] = deleteValue($pid, $forum['news']); 	
	// TODO verify that this do not reorder values
	$forum['news'] = array_values($forum['news']);
}

function forum_addUser_andSave(&$forum, &$user) {
	if(!in_array($user['_id'], $forum['users'])) {
		array_push($forum['users'], $user['_id']);
	}

	// TODO XXX TRICK
	$users = $forum['users'];
	unset($forum['users']);
	$forum['users'] = $users;

	account_addForum($user, $forum);
	forum_save($forum);
	account_save($user);
}

function forum_removeUser_andSave(&$forum, &$user) {
	$forum['users'] = deleteValue($user['_id'], $forum['users']);
	
	// TODO XXX TRICK
	$fusers = $forum['users'];
	unset($forum['users']);
	$forum['users'] = $fusers;
	
	deleteKey($forum['_id'], $user['forums']);
	
	// TODO XXX TRICK
	//$uforums = $user['forums'];
	//unset($user['forums']);
	//$user['forums'] = $uforums;
	
	
	forum_save($forum);
	account_save($user);
	if(count($forum['users']) <= 0) {
		forum_destroy($forum['_id']);
	}
}

function forum_getAvatar(&$forum) {
	if(file_exists(pathTo2(array("url"=>$forum['_id'], "param"=>"avatar", "ext"=>"jpg")))) {
		$avatar = p2l(pathTo2(array("url"=>$forum['_id'], "param"=>"avatar", "ext"=>"jpg")));
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
	
	$mid = mongo_id($fid);
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
		mongo_destroy("forums",$fid);
	}
}

?>
