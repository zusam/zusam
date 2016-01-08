<?php

chdir(realpath(dirname(__FILE__))."/../../");
require_once('Core/MongoDriver.php');
require_once('Core/Accounts.php');
require_once('Core/Forum.php');


function test_loadSaveNiels() {

	$mid = new MongoDB\BSON\ObjectID("56251782307d593b395898ab");
	$niels = account_load(array("_id"=>$mid));
	$niels['forums']["5625fb7e307d598c5d5898ab"]['timestamp'] = time();
	var_dump($niels['forums']["5625fb7e307d598c5d5898ab"]);
	account_save($niels);
}

function test_loadSaveForum() {

	$mid = new MongoDB\BSON\ObjectID("5625fb7e307d598c5d5898ab");
	$niels = forum_load(array("_id"=>$mid));
	//$niels['forums']["5625fb7e307d598c5d5898ab"]['timestamp'] = time();
	forum_updateTimestamp($niels);
	//var_dump($niels);
	forum_save($niels);
}

function test_unread() {

	$fid = new MongoDB\BSON\ObjectID("5625fb7e307d598c5d5898ab");
	$forum = forum_load(array("_id"=>$fid));
	forum_addUnread($forum, "aaaaaaaaaaaaaaaaaaaaaaaa");

}

function test_mongo_isId() {
	$test = array("coucou", "0", true, "", null, [], "568028ff307d594a476bec1d", "568028ff307d59", md5("1991"), "aaaaaaaaaaaaaaaaaaaaaaaa");
	$results = array(false, false, false, false, false, false, true, false, false, true);
	for($i=0;$i<count($test);$i++) {
		if($results[$i] != mongo_isId($test[$i])) {
			return false;
		}
	}
	return true;
}


function test_mongo_load() {

	// write test
	$mid = new MongoDB\BSON\ObjectID("aaaaaaaaaaaaaaaaaaaaaaaa");
	//var_dump($mid);
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$bulk = new MongoDB\Driver\BulkWrite;
	$bulk->insert(array('_id' => $mid, 'flag' => "coucou"));
	$writeConcern = new MongoDB\Driver\WriteConcern(MongoDB\Driver\WriteConcern::MAJORITY);
	try {
		$result = $manager->executeBulkWrite('zusam.test', $bulk, $writeConcern);
	} catch (MongoDB\Driver\Exception\BulkWriteException $e) {
		$result = $e->getWriteResult();
		//var_dump($result);
		return false;
	}

	// test
	$result = mongo_load("test",array('_id'=>"aaaaaaaaaaaaaaaaaaaaaaaa"));
	if($result['flag'] != "coucou") {
		return false;
	}
	//var_dump($result);

	
	// delete test
	$mid = new MongoDB\BSON\ObjectID("aaaaaaaaaaaaaaaaaaaaaaaa");
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$bulk = new MongoDB\Driver\BulkWrite;
	$bulk->delete(array('_id' => $mid));
	$writeConcern = new MongoDB\Driver\WriteConcern(MongoDB\Driver\WriteConcern::MAJORITY);
	try {
		$result = $manager->executeBulkWrite('zusam.test', $bulk, $writeConcern);
	} catch (MongoDB\Driver\Exception\BulkWriteException $e) {
		$result = $e->getWriteResult();
		//var_dump($result);
		return false;
	}

	// all went well
	return true;
}


function test_mongo_bulkLoad() {
	// write test
	$aaa = new MongoDB\BSON\ObjectID("aaaaaaaaaaaaaaaaaaaaaaaa");
	$aab = new MongoDB\BSON\ObjectID("aaaaaaaaaaaaaaaaaaaaaaab");
	$aac = new MongoDB\BSON\ObjectID("aaaaaaaaaaaaaaaaaaaaaaac");
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$bulk = new MongoDB\Driver\BulkWrite;
	$bulk->insert(array('_id' => $aaa, 'flag' => "coucou"));
	$bulk->insert(array('_id' => $aab, 'flag' => "coucou"));
	$bulk->insert(array('_id' => $aac, 'flag' => "coucou"));
	$writeConcern = new MongoDB\Driver\WriteConcern(MongoDB\Driver\WriteConcern::MAJORITY);
	try {
		$result = $manager->executeBulkWrite('zusam.test', $bulk, $writeConcern);
	} catch (MongoDB\Driver\Exception\BulkWriteException $e) {
		$result = $e->getWriteResult();
		//var_dump($result);
		return false;
	}

	// test
	$result = mongo_bulkLoad("test",array('flag'=>"coucou"));
	if(count($result) != 3) {
		return false;
	}
	//var_dump($result);


	// delete test
	$aaa = new MongoDB\BSON\ObjectID("aaaaaaaaaaaaaaaaaaaaaaaa");
	$aab = new MongoDB\BSON\ObjectID("aaaaaaaaaaaaaaaaaaaaaaab");
	$aac = new MongoDB\BSON\ObjectID("aaaaaaaaaaaaaaaaaaaaaaac");
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$bulk = new MongoDB\Driver\BulkWrite;
	$bulk->delete(array('_id' => $aaa));
	$bulk->delete(array('_id' => $aab));
	$bulk->delete(array('_id' => $aac));
	$writeConcern = new MongoDB\Driver\WriteConcern(MongoDB\Driver\WriteConcern::MAJORITY);
	try {
		$result = $manager->executeBulkWrite('zusam.test', $bulk, $writeConcern);
	} catch (MongoDB\Driver\Exception\BulkWriteException $e) {
		$result = $e->getWriteResult();
		//var_dump($result);
		return false;
	}

	// all went well
	return true;
}

function test_mongo_save() {
	

	$aaa = new MongoDB\BSON\ObjectID("aaaaaaaaaaaaaaaaaaaaaaaa");
	$object = array('_id' => $aaa, 'flag' => array('value'=>'coucou'));
	mongo_save("test", $object);

	
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$query = new MongoDB\Driver\Query(array('_id'=>$aaa));
	try {
		$cursor = $manager->executeQuery('zusam.test', $query);
	} catch (MongoDB\Driver\Exception\BulkWriteException $e) {
		$result = $e->getWriteResult();
		//var_dump($result);
		return false;
	}
	$response = $cursor->toArray()[0];
	$data = object_to_array($response);
	//var_dump($data);
	//return $data;
	

	// delete test
	$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
	$bulk = new MongoDB\Driver\BulkWrite;
	$bulk->delete(array('_id' => $aaa));
	$writeConcern = new MongoDB\Driver\WriteConcern(MongoDB\Driver\WriteConcern::MAJORITY);
	try {
		$result = $manager->executeBulkWrite('zusam.test', $bulk, $writeConcern);
	} catch (MongoDB\Driver\Exception\BulkWriteException $e) {
		$result = $e->getWriteResult();
		//var_dump($result);
		return false;
	}

	// all went well
	return true;


}


//var_dump(test_mongo_isId());
//var_dump(test_mongo_load());
//var_dump(test_mongo_bulkLoad());
//var_dump(test_mongo_save());
//test_loadSaveNiels();
test_unread();



?>
