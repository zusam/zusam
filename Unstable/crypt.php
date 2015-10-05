<?php

//var_dump(mcrypt_list_algorithms());
$key = "coucou";
//$input = "Rendez-vous à 9 heures, dans notre planque.";
//$input = file_get_contents("9gang/post/1536.json");
//echo("chou");
$input = file_get_contents("9gang/thumbnail/5736fae414c88ac8c3c4e42ed830dd6d");
//var_dump($input);

$td = mcrypt_module_open('rijndael-256', '', 'cbc', '');
$iv = mcrypt_create_iv(mcrypt_enc_get_iv_size($td), MCRYPT_RAND);
mcrypt_generic_init($td, $key, $iv);
$encrypted_data = mcrypt_generic($td, $input);
mcrypt_generic_deinit($td);
mcrypt_module_close($td);
//echo("<br/>");
//echo("<br/>");
////var_dump($encrypted_data);
//echo("<br/>");
//echo("<br/>");
//var_dump($iv);
//echo("<br/>");
//echo("<br/>");

$td = mcrypt_module_open('rijndael-256', '', 'cbc', '');
$iv = $iv;
$pass = $_GET['key'];
mcrypt_generic_init($td, $pass, $iv);
$decrypted = mdecrypt_generic($td, $encrypted_data);
mcrypt_module_close($td);

header('Content-Type: image/jpg');
echo($decrypted);


?>
