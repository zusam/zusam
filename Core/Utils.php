<?php

function isIn(&$e, &$a) {
	foreach($a as $m) {
		if($m == $e) {
			return true;
		}
	}
	return false;
}

function deleteValue(&$e, &$a) {
	foreach($a as $k=>$v) {
		if($v == $e) {
			unset($a[$k]);
			break;
		}
	}
}


// rot(n) ...
function str_rot($s, $n) {
	static $letters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';
	$n = (int)$n % 26;
	if (!$n) return $s;
	if ($n < 0) $n += 26;
	if ($n == 13) return str_rot13($s);
	$rep = substr($letters, $n * 2) . substr($letters, 0, $n * 2);
	return strtr($s, $letters, $rep);
}

// remove accents from string
function noAccent($str) {
	$replace = array(
		'â' => 'a', 
		'ä' => 'a', 
		'à' => 'a', 
		'ê' => 'e', 
		'ë' => 'e', 
		'è' => 'e', 
		'é' => 'e', 
		'ù' => 'u', 
		'û' => 'u', 
		'ü' => 'u', 
		'ô' => 'o', 
		'ö' => 'o', 
		'ç' => 'c' 
	);
	$r = strtr($str, $replace);
	return $r;
}

// relative time
function ago($d) {
	$da = new DateTime($d);
	$interval = $da->diff(new DateTime('now'));
	$days = $interval->format('%a');
	$sec = $interval->format('%s');
	$min = $interval->format('%i');
	$hour = $interval->format('%H');
	if($days == "0") {
		if($hour == "00") {
			if($min == "0") {
				$str = $sec."s";
			} else {
				$str = $min."mn";
			}
		} else {
			$hour = preg_replace("/^0*/","",$hour);
			$str = $hour."h";
		}
	} else {
		$str = $days." jours";
	}
	$str = "Il y a ".$str;
	return $str;
}

// function to return a nice time since post.
function convertDate($d) {
	$da = new DateTime($d);
	$interval = $da->diff(new DateTime('now'));
	$days = $interval->format('%a');
	$sec = $interval->format('%s');
	$min = $interval->format('%i');
	$hour = $interval->format('%H');

	if(intval($days) < 4) {
		return ago($d);
	} else {
		$day = $da->format('j');
		$month = $da->format('n');
		$year = $da->format('Y');

		$month_conversion = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 
						'août', 'septembre', 'octobre', 'novembre', 'décembre'];
		return $day." ".$month_conversion[intval($month)];
	}
}

?>
