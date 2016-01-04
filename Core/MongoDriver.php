<?php

chdir(realpath(dirname(__FILE__))."/../");

function mongo_isId($id) {
	if(ctype_xdigit($id) && mb_strlen($id)) {
		return true;
	}
	return false;
}

function mongo_id($id) {
	return new MongoDB\BSON\ObjectID($id);
}

function mongo_date($milliseconds) {
	return new MongoDB\BSON\UTCDateTime($milliseconds);
}

function mongo_bulkLoad($collection, $array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoDB\BSON\ObjectID($array['_id']);
	}
	if($array['uid'] != null && $array['uid'] != "") {
		$array['uid'] = new MongoDB\BSON\ObjectID($array['uid']);
	}
	
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$query = new MongoDB\Driver\Query($array);
	$cursor = $manager->executeQuery('zusam.'.$collection, $query);
	$response = $cursor->toArray();
	$data = (array) $response;
	return $data;
}

function mongo_load($collection, $array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoDB\BSON\ObjectID($array['_id']);
	}
	if($array['uid'] != null && $array['uid'] != "") {
		$array['uid'] = new MongoDB\BSON\ObjectID($array['uid']);
	}
	
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$query = new MongoDB\Driver\Query($array);
	$cursor = $manager->executeQuery('zusam.'.$collection, $query);
	$response = $cursor->toArray()[0];
	$data = (array) $response;
	return $data;
}

function mongo_save($collection, &$entity) {
	$mid = new MongoDB\BSON\ObjectID($entity['_id']);
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$bulk = new MongoDB\Driver\BulkWrite;
	$bulk->update(array('_id' => $mid), array('$set' => $entity), array('multi' => false, 'upsert' => true));
	$writeConcern = new MongoDB\Driver\WriteConcern(MongoDB\Driver\WriteConcern::MAJORITY);
	$result = $manager->executeBulkWrite('zusam.'.$collection, $bulk, $writeConcern);
}

function mongo_destroy($collection, $id) {
	$mid = new MongoDB\BSON\ObjectID($id);
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$bulk = new MongoDB\Driver\BulkWrite;
	$bulk->delete(array('_id' => $mid));
	$writeConcern = new MongoDB\Driver\WriteConcern(MongoDB\Driver\WriteConcern::MAJORITY);
	$result = $manager->executeBulkWrite('zusam.'.$collection, $bulk, $writeConcern);
}


?>
