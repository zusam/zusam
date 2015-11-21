<?php

// THIS FILE IS A TEMPORARY SCRIPT TO CONVERT SOME ID TO MONGOID

// posts
//$m = new MongoClient();
//$posts = $m->selectDB("zusam")->selectCollection("posts");
//$p = $posts->find();
//foreach($p as $pp) {
//	$pp['_id'] = new MongoId($pp['_id']);
//	$pp['uid'] = new MongoId($pp['uid']);
//	$pp['forum'] = new MongoId($pp['forum']);
//	$mid = new MongoId($pp['_id']);
//	$posts->update(array('_id' => $mid), $pp, array('upsert' => true));
//	echo($pp['_id']." converted<br>");
//}

// forums
//$m = new MongoClient();
//$plop = $m->selectDB("zusam")->selectCollection("forums");
//$p = $plop->find();
//foreach($p as $pp) {
//	$pp['_id'] = new MongoId($pp['_id']);
//	$mid = new MongoId($pp['_id']);
//	$plop->update(array('_id' => $mid), $pp, array('upsert' => true));
//	echo($pp['_id']." converted<br>");
//}

// accounts
$m = new MongoClient();
$plop = $m->selectDB("zusam")->selectCollection("accounts");
$p = $plop->find();
//$p = $plop->count();
foreach($p as $pp) {

	//$pp['_id'] = new MongoId($pp['_id']);
	$mid = new MongoId($pp['_id']);

	$arr = [];
	$t = time();
	foreach($pp['forums'] as $fid=>$k) {
		$fid = (String) $fid;
		$arr[$fid]['timestamp'] = $t;
	}
	$pp['forums'] = $arr;
	var_dump($pp);
	echo($pp['_id']." converted<br>");
	$plop->update(array('_id' => $mid), $pp, array('upsert' => true));
}

// files
//$m = new MongoClient();
//$plop = $m->selectDB("zusam")->selectCollection("files");
//$p = $plop->find();
//foreach($p as $pp) {
//	$pp['_id'] = new MongoId($pp['_id']);
//	$pp['owner'] = new MongoId($pp['owner']);
//	$mid = new MongoId($pp['_id']);
//	$plop->update(array('_id' => $mid), $pp, array('upsert' => true));
//	echo($pp['_id']." converted<br>");
//}

// notifs
//$m = new MongoClient();
//$plop = $m->selectDB("zusam")->selectCollection("notifications");
//$p = $plop->find();
//foreach($p as $pp) {
//	$pp['_id'] = new MongoId($pp['_id']);
//	$pp['source'] = new MongoId($pp['source']);
//	$pp['target'] = new MongoId($pp['target']);
//	$mid = new MongoId($pp['_id']);
//	$plop->update(array('_id' => $mid), $pp, array('upsert' => true));
//	echo($pp['_id']." converted<br>");
//}


?>
