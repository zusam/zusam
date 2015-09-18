<?php

chdir(realpath(dirname(__FILE__)."/../"));
include('Core/Post.php');
include('Core/Location.php');
include('Core/Accounts.php');
include('Core/Forum.php');


// TODO credentials ?

$name = $_POST['name'];
$uid = $_POST['uid'];

$name = htmlentities($name);

$u = account_load(array('_id' => $uid));
$f = forum_initialize($name, $uid);
forum_addUser_andSave($f, $u);

// TODO transmit something ?
?>
