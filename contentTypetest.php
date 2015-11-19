<?php

require_once('Core/Utils.php');

//$url = "https://lh3.googleusercontent.com/G0BI1WB-eJNjnl4pYl1-AtXoT8Y_Tv5i9pAWW6rM8N4k-S-pdPOlKfNVcYUJDCP737_0_euOWJs91z2zzSicNs_p7U-L6ZGR4k-MzqF_u6-jiacBjs6R50SNV8yT03MIgJVgcYP8CzuSXW4646wCN_hmxxKrTtLhQJq-A19cvjOmgpuBUcUwKJPZuhqtyeEmloaYwoXNjfIARx2fMMU3bbjMiEkGZ8vaUfMHQvCO4TT5KPX2s9-uStr0xs0jK07BxWj2zI0hv7wItl-uuIATaafmvQdChkQhRSRU0xCdzUBG-GJoJTxbiDyW0d85cYH58JotEMUo-2_pKptZ3h2EK7LdablXbeV05rNEa0jD79DVMWUz0g54y_5_qfDzvvbhsNSVVs3Ee1kqbDT4moslj8-n4TLruUZ7pT-29ELl_RwjHl2hLprykJTL4Yf4P3j84dJHcIN1QsDicfn1QotI1QQ-lopCEPzKqDal2fd97C6JuDJdQP0083hQ_LWs5sWGKN5UJlGP30pygfJqVMNIf7pFawjGbPtc4COT2w5yv4TI=w1222-h687-no";
//$url = "https://goo.gl/photos/SyKdM9E7Ny8NnC118";
//$url = "https://lh3.googleusercontent.com/RRO-8zrEEHDo_lkTwBUkwtbycPWeh2ptcI5PJcarNJUmfoyOCJ86fRsT4mgfjAmBnuqwqiki6MQsrorgFIKaubB81VMX8_VTgh3PZlhCiaG_B5C-FK7YQGQWN1im7w66Q2lJeDMnJxO5lRoTOlnG4jUuOmpuACRvnp1wu_7Ook8fETMsF3ykW5MF7k1todRoKK7FoxMxvVUsp32ES2pAOERD3_UrAaIEmKoZ8S57yswiP9HidyMh-g3uZiaEKGHi61kmInl6ZtMQePLsNPzEvFOrPVU-_JvvTzte-aAqCO-4-5aVpX3XoLpJ2sbs5JqBQt5gHCB-YxrOeZyg74rZ5GAq1NbZcfI6AnbvFMlo-yfnSlO9PxaTh3xW9rsWvGtJlZnsKlcdwEdZf9-cun2N0IGHW-V79TIeR8FbnlgdDTIVzFi0FuSYRx-OoCVZC902Pg5qLxqvfRZsasspOPV8JcdQ9HecZiYyj2vx8nfi0pbuMi1Zx1SPPonyPfruHmWm-ta57XDSgZ6HBa4k4yXzTnKf3DAYxB4RSaF6vNczKnU";
//$url = "http://i.imgur.com/JUoTWhO.gifv";
//$url = "http://www.nibou.eu/plop";
//$url = "https://www.facebook.com/niels.robinaubertin/videos/1088167737867606/?l=8670996102014707065";
$url = "https://lh3.googleusercontent.com/G0BI1WB-eJNjnl4pYl1-AtXoT8Y_Tv5i9pAWW6rM8N4k-S-pdPOlKfNVcYUJDCP737_0_euOWJs91z2zzSicNs_p7U-L6ZGR4k-MzqF_u6-jiacBjs6R50SNV8yT03MIgJVgcYP8CzuSXW4646wCN_hmxxKrTtLhQJq-A19cvjOmgpuBUcUwKJPZuhqtyeEmloaYwoXNjfIARx2fMMU3bbjMiEkGZ8vaUfMHQvCO4TT5KPX2s9-uStr0xs0jK07BxWj2zI0hv7wItl-uuIATaafmvQdChkQhRSRU0xCdzUBG-GJoJTxbiDyW0d85cYH58JotEMUo-2_pKptZ3h2EK7LdablXbeV05rNEa0jD79DVMWUz0g54y_5_qfDzvvbhsNSVVs3Ee1kqbDT4moslj8-n4TLruUZ7pT-29ELl_RwjHl2hLprykJTL4Yf4P3j84dJHcIN1QsDicfn1QotI1QQ-lopCEPzKqDal2fd97C6JuDJdQP0083hQ_LWs5sWGKN5UJlGP30pygfJqVMNIf7pFawjGbPtc4COT2w5yv4TI=w1222-h687-no";
$t1 = microtime(true);
for($i=0;$i<50;$i++) {
	//$r = get_headers($url);
	$r = contentType($url);
}
$t2 = microtime(true) - $t1;
var_dump($t2);
var_dump($r);
