<?php

// Report all errors except E_NOTICE   
//error_reporting(E_ALL ^ E_NOTICE);

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

$GET = [];
foreach($_GET as $K=>$V) {
	$GET[$K] = (String) $V;
}

if(!isset($GET['uid']) || !isset($GET['p']) || !isset($GET['fid'])) {
	echo('fail');
	exit();
}

$uid = $GET['uid'];
$fid = $GET['fid'];
$p = $GET['p'];

$u = account_load(array('_id'=>$uid));
if(password_verify($p, $u['password'])) {
	$f = forum_load(array('_id'=>$fid));
	if($f != null && $f != false && $u['forums'][$fid] != null) {
		$posts = post_bulkLoad(array('forum'=>mongo_id($fid)));
		$files = [];
		foreach($posts as $p) {
			$pf = post_listFiles($p);
			foreach($pf as $f) {
				if($f['type'] == "jpg") {
					array_push($files, $f);
				}
			}
		}
		$r = new StdClass();
		$r->list = [];
		foreach($files as $f) {
			array_push($r->list, array("path"=>p2l(file_getPath($f)), "ctime"=>$f['date']->toDateTime()->getTimestamp()));
		}
		header('Content-Type: text/json; charset=UTF-8');
		echo(json_encode($r));
	}
}
