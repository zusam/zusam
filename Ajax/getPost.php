<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/Accounts.php');
require_once('Core/Print_post.php');
require_once('Filtre/web_image.php');

$id = $_GET['id'];

//TODO credentials ?
$u = account_load(array('mail' => $_SESSION['mail']));

$html_data = print_full_post($id, $u['_id']);

$r = new StdClass();
$r->html = $html_data;
header('Content-Type: text/json; charset=UTF-8');
echo(json_encode($r));

?>
