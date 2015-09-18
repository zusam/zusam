<?php

chdir(realpath(dirname(__FILE__)."/../"));
include('Core/Location.php');
include('Core/Accounts.php');
include('Reduc/ReducImage.php');

$uid = intval($_GET['uid']);

$response = new StdClass();
$response->avatar = p2l(pathTo($uid,"avatar","jpg"));

header('Content-Type: text/json; charset=UTF-8');
echo(json_encode($response));

?>
