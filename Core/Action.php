<?php

chdir(realpath(dirname(__FILE__).'/../'));

function action_initialize($type, $target, $data, $duration) {
	$action = [];
	$action['_id'] = new MongoId();
	$action['date'] = new MongoDate(); 
	$action['target'] = $text;
	$action['timestamp'] = time();
	$action['duration'] = $duration;
	return $action;
}




?>
