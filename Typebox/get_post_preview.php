<?php

chdir(realpath(dirname(__FILE__).'/../'));
include('Core/Location.php');

$url = $_GET['url'];
echo(pathTo($url, "thumbnail_big"));  

?>
