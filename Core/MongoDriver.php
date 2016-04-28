<?php
//TODO ajouter des try/catch

function object_to_array($obj) {
	if(is_object($obj) && get_class($obj)=="stdClass") {
		$obj = (array) $obj;
	}
	if(is_array($obj)) {
		$new = array();
		foreach($obj as $key => $val) {
			$new[$key] = object_to_array($val);
		}
	} else {
		$new = $obj;
	}
	return $new;       
}

function mongo_isId($id) {
	if(ctype_xdigit($id) && mb_strlen($id)==24) {
		return true;
	}
	return false;
}

function mongo_id($id) {
	$id = (String) $id;
	if($id == "") {
		return new MongoDB\BSON\ObjectID();
	}
	if(!mongo_isId($id)) {
		return false;
	}
	$p = new MongoDB\BSON\ObjectID($id);
	return new MongoDB\BSON\ObjectID($id);
}

function mongo_date($milliseconds) {
	if($milliseconds == "") {
		$milliseconds = intval(1000*microtime(true));
	}
	return new MongoDB\BSON\UTCDateTime($milliseconds);
}

function mongo_bulkLoad($collection, $array) {
	if(isset($array['_id']) && $array['_id'] != "") {
		$array['_id'] = mongo_id($array['_id']);
	}
	if(isset($array['uid']) && $array['uid'] != "") {
		$array['uid'] = mongo_id($array['uid']);
	}
	
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$query = new MongoDB\Driver\Query($array);
	$cursor = $manager->executeQuery('zusam.'.$collection, $query);
	$response = $cursor->toArray();
	$data = object_to_array($response);
	return $data;
}

function mongo_load($collection, $array) {
	if(isset($array['_id']) && $array['_id'] != "") {
		$array['_id'] = mongo_id($array['_id']);
	}
	if(isset($array['uid']) && $array['uid'] != "") {
		$array['uid'] = mongo_id($array['uid']);
	}
	
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$query = new MongoDB\Driver\Query($array);
	$cursor = $manager->executeQuery('zusam.'.$collection, $query);
	$response = $cursor->toArray()[0];
	$data = object_to_array($response);
	return $data;
}

function mongo_correctArray(&$array) {
	foreach($array as $k=>$v) {
		if(empty($v)) {
			unset($array[$k]);
		}
	}
}

function mongo_save($collection, &$entity, $debug) {

	if(!isset($debug)) {
		$debug = false;
	}

	mongo_correctArray($entity);

	$mid = mongo_id($entity['_id']);
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$bulk = new MongoDB\Driver\BulkWrite;

	$filter = array('_id' => $mid);
	$options = array('multi' => false, 'upsert' => true);

	try {
		$bulk->update($filter, $entity, $options);
	} catch (MongoDB\Driver\Exception\UnexpectedValueException $e) {
		//var_dump($e);
		echo($e);
		echo('fail');
		// TODO do something with it
		return false;
	}
	$writeConcern = new MongoDB\Driver\WriteConcern(MongoDB\Driver\WriteConcern::MAJORITY);
	try {
		$result = $manager->executeBulkWrite('zusam.'.$collection, $bulk, $writeConcern);
	} catch (MongoDB\Driver\Exception\BulkWriteException $e) {
		$result = $e->getWriteResult();
		//var_dump($result);
		// TODO do something with it
		return false;
	}
	if($debug) {
		var_dump($result);
	}
	return true;
}

function mongo_destroy($collection, $id) {
	$mid = mongo_id($id);
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$bulk = new MongoDB\Driver\BulkWrite;
	try {
		$bulk->delete(array('_id' => $mid));
	} catch (MongoDB\Driver\Exception\UnexpectedValueException $e) {
		//var_dump($e);
		echo($e);
		echo('fail');
		// TODO do something with it
		return false;
	}
	$writeConcern = new MongoDB\Driver\WriteConcern(MongoDB\Driver\WriteConcern::MAJORITY);
	try {
		$result = $manager->executeBulkWrite('zusam.'.$collection, $bulk, $writeConcern);
	} catch (MongoDB\Driver\Exception\BulkWriteException $e) {
		$result = $e->getWriteResult();
		var_dump($result);
		// TODO do something with it
		return false;
	}
}


?>
