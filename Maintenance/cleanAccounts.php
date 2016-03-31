<?php

// Report all errors except E_NOTICE   
error_reporting(E_ALL ^ E_NOTICE);

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

$accounts = account_bulkLoad([]);
$n = 0;
$k = 0;
foreach($accounts as $a) {
	if(count($a['forums']) == 0) {
		$n++;
	}
	if(intval($a['timestamp']) < time() - 14*24*60*60) {
		$k++;
	}
}
var_dump(count($accounts));
var_dump($n);
var_dump($k);
