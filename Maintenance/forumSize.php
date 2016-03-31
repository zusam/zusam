<?php

// Report all errors except E_NOTICE   
error_reporting(E_ALL ^ E_NOTICE);

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

$fid = (String) $argv[1];

$posts = post_bulkLoad(array('forum'=>mongo_id($fid)));
$files = [];
//var_dump($posts);
foreach($posts as $p) {
	$pf = post_listFiles($p);
	foreach($pf as $f) {
		array_push($files, $f);
	}
}
var_dump(count($files));
$total_fsize = 0;
foreach($files as $f) {
	$total_fsize += filesize(file_getpath($f));
}
var_dump(human_filesize($total_fsize));

?>
