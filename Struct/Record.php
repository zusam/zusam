<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function recordStat($array) {
	$record = [];
	$record['_id'] = mongo_id();
	$record['date'] = mongo_date();
	$record['loadingTime'] = intval($array['loadingTime']);
	$record['screenHeight'] = intval($array['screenHeight']);
	$record['screenWidth'] = intval($array['screenWidth']);
	$record['referer'] = $_SERVER['HTTP_REFERER'];
	$record['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
	$record['client_ip'] = $_SERVER['REMOTE_ADDR'];
	$record['connected'] = $array['connected'];

	mongo_save("records", $record);
}

function recordUpload($array) {
	$record = [];
	$record['_id'] = mongo_id();
	$record['date'] = mongo_date();
	$record['uid'] = $array['uid'];
	$record['type'] = $array['type'];

	mongo_save("upload", $record);

}

function recordUsage($array) {
	$record = [];
	$record['_id'] = mongo_id();
	$record['date'] = mongo_date();
	$record['usage'] = $array['usage'];

	mongo_save("usage", $record);
}



?>
