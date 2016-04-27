<?php

// Report all errors except E_NOTICE   
error_reporting(E_ALL ^ E_NOTICE);

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');


$forums = forum_bulkLoad([]);
$n = 0;
foreach($forums as $f) {
	if(intval($f['timestamp']) < time() - 7*24*60*60) {
		$n++;
	}
}
var_dump($n);

?>
