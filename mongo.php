<?php



//SIMPLE MANAGER
//$manager = new MongoDB\Driver\Manager("mongodb://localhost:27017");
//var_dump($manager);
//

//SIMPLE QUERY
//$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
//$query = new MongoDB\Driver\Query(array('_id' => new MongoDB\BSON\ObjectID("56803481307d5953526bec1d")));
//$cursor = $manager->executeQuery('zusam.posts', $query);
//$response = $cursor->toArray();
//foreach($response as $document) {
//    var_dump($document);
//}

var_dump(ctype_xdigit("56803481307d5953526bec1d"));
var_dump(ctype_xdigit("coucou"));

//BULK QUERY
//$manager = new MongoDB\Driver\Manager('mongodb://localhost:27017');
//$query = new MongoDB\Driver\Query(array('_id' => new MongoDB\BSON\ObjectID("56803481307d5953526bec1d")));
//$cursor = $manager->executeQuery('zusam.posts', $query);
//$response = $cursor->toArray();
//foreach($response as $document) {
//    var_dump($document);
//}

?>
