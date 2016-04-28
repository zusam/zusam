<?php

// Report all errors except E_NOTICE   
error_reporting(E_ALL ^ E_NOTICE);

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

$accounts = account_bulkLoad([]);
//$n = 0;
$k = 0;
$nbf = [];
foreach($accounts as $a) {
	//if(count($a['forums']) == 0) {
	//	$n++;
	//}
	if(intval($a['timestamp']) < time() - 7*24*60*60) {
		$k++;
	}
	if(isset($nbf[count($a['forums'])])) {
		$nbf[count($a['forums'])] = $nbf[count($a['forums'])] + 1;
	} else {
		$nbf[count($a['forums'])] = 1;
	}

}
echo('all accounts : ');
var_dump(count($accounts));
echo('active accounts :');
var_dump($k);
echo('account distribution :');
var_dump($nbf);
