<?php
chdir(realpath(dirname(__FILE__).'/../'));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Configuration.php');
require_once('Core/Utils.php');

$id = $_POST['id'];

//TODO : acl ?

post_destroy($id);

?>
