<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Notification.php');
require_once('Core/Accounts.php');
require_once('Core/Utils.php');

// Admin-tool
// used to send notification to all or some users

// secure variables
$GET = [];
foreach($_GET as $K=>$V) {
	$GET[$K] = (String) $V;
}

function notif_blog($text, $url) {
	if(isEmpty($text) || isEmpty($url)) {
		echo('no args !');
		return false;
	}
	$accounts = account_bulkload();	
	foreach($accounts as $ac) {
		$args = [];
		$args['type'] = 'blog_update';
		$args['text'] = cutIfTooLong((String) $text, 50);
		$args['data'] = (String) $url;
		$args['source'] = 'admin';
		$args['target'] = (String) $ac['_id'];
		$n = notification_initialize($args);
		notification_save($n);	
		echo('notification sent to '.$ac['_id'].'<br>');
	}
}

if(isEmpty($GET['action'])) {
	var_dump($_GET);
	echo('<br>');
	var_dump($GET);
	echo('<br>');
	echo('no action !');
	exit;
}

if($GET['action'] == 'notif_blog') {
	notif_blog($GET['text'], $GET['url']);
}

?>
