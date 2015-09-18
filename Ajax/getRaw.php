<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/Accounts.php');

$pid = $_GET['pid'];

//TODO credentials ?
$u = new User();
$u->loadFromDB("mail='".$_SESSION['login']."'");

$p = post_load($pid);
$raw = $p['text'];

$r = new StdClass();
$r->raw = $raw;
header('Content-Type: text/json; charset=UTF-8');
echo(json_encode($r));
?>
