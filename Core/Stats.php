<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/MongoDriver.php');

function recordStat($array) {
	$record = [];
	$record['loadingTime'] = intval($array['loadingTime']);
	$record['referer'] = $_SERVER['HTTP_REFERER'];
	$record['request_time'] = $_SERVER['REQUEST_TIME'];
	$record['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
	$record['client_ip'] = $_SERVER['REMOTE_ADDR'];
	$record['connected'] = $array['connected'];

	//var_dump($record);

	mongo_save("stats", $record);
}



?>
