<?php

chdir(realpath(dirname(__FILE__).'/../'));

// TODO review and use !
function isEmpty($var) {
	if(!isset($var) || $var == null || $var == "" || $var == false) {
		return true;
	}
	return false;
}
function ranger($url) {
	$t = microtime(true);
	$headers = array("Range: bytes=0-65536");

	// TODO see why we have to do this for png... imagecreatefromstring seems to fail randomly
	if(preg_match("/\.png/", $url) == 1) {
		$tmp = getimagesize($url);
		$width = $tmp[0];
		$height = $tmp[1];
	} else {
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		$data = curl_exec($curl);
		curl_close($curl);

		$im = imagecreatefromstring($data);
		if($im) {
			$width = imagesx($im);
			$height = imagesy($im);
		} else {
			$tmp = getimagesize($url);
			$width = $tmp[0];
			$height = $tmp[1];
		}
	}
	$info[0] = $width;
	$info[1] = $height;
	$info['width'] = $width;
	$info['height'] = $height;
	$info['time'] = round(microtime(true) - $t, 5);
	return $info;
}

// convert string to utf8
function to_utf8($str) {
	$encoding = mb_detect_encoding($str, 'UTF-8', true);
	if(!$encoding) {
		$e = mb_detect_encoding($str);
		if($e != "UTF-8") {
			$str = iconv($e, "UTF-8", $str);
		} else {
			$str = utf8_encode($str);

		}
	} else {
	}
	return $str;
}

// TODO remove : this should not be used
//function fixBadUnicode($str) {
//	$str = preg_replace("/\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1")).chr(hexdec("$2")).chr(hexdec("$3")).chr(hexdec("$4"))', $str);
//	$str = preg_replace("/\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1")).chr(hexdec("$2")).chr(hexdec("$3"))', $str);
//	$str = preg_replace("/\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1")).chr(hexdec("$2"))', $str);
//	$str = preg_replace("/\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1"))', $str);
//	return $str;
//}

function cutIfTooLong($str, $n) {
	$replace = trim(mb_substr($str,0,$n));
	if(abs(mb_strlen($replace) - mb_strlen($str)) > 3) {
		$replace = $replace . "...";
	}
	return $replace;
}

function contentType($url) {
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_HEADER, true);
	curl_setopt($curl, CURLOPT_NOBODY, true);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_ENCODING, "");
	curl_setopt($ch, CURLOPT_USERAGENT, "");
	curl_setopt($ch, CURLOPT_AUTOREFERER, true);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
	curl_setopt($ch, CURLOPT_TIMEOUT, 5);
	curl_setopt($ch, CURLOPT_MAXREDIR, 10);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_COOKIEFILE, "tmp/cookie.txt");
	curl_setopt($ch, CURLOPT_COOKIEJAR, "tmp/cookie.txt");
	curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
	$data = curl_exec($ch);
	$data = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
	curl_close($ch);
	return $data;
}

function fgc($url, $bytes, $header) {
	$ch = curl_init($url);
	if($header == true) {
		curl_setopt($ch, CURLOPT_HEADER, true);
		curl_setopt($curl, CURLOPT_NOBODY, true);
	} else {
		curl_setopt($ch, CURLOPT_HEADER, false);
	}
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_ENCODING, "");
	curl_setopt($ch, CURLOPT_USERAGENT, "");
	curl_setopt($ch, CURLOPT_AUTOREFERER, true);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
	curl_setopt($ch, CURLOPT_TIMEOUT, 5);
	curl_setopt($ch, CURLOPT_MAXREDIR, 10);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_COOKIEFILE, "tmp/cookie.txt");
	curl_setopt($ch, CURLOPT_COOKIEJAR, "tmp/cookie.txt");
	curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
	if($bytes != "" && intval($bytes) != 0) {
	var_dump($bytes);
		$headers = array("Range: bytes=0-"+intval($bytes));
		curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
	}
	$data = curl_exec($ch);
	if($header == true) {
		$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$data = substr($data, 0, $header_size);
	}
	curl_close($ch);
	return $data;
}

function deleteValue($e, $a) {
	$k = array_search($e, $a, true);
	if($k !== false) {
		unset($a[$k]);
	}
	return $a;
}

// TODO need to be replace with unset ?
// unset alone is far more better
// this function is used in Core/Forum.php
function deleteKey(&$e, &$a) {
	$ee = (String) $e;
	unset($a[$ee]);
}

// TODO not used... I hope.
// rot(n) ...
//function str_rot($s, $n) {
//	static $letters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';
//	$n = (int)$n % 26;
//	if (!$n) return $s;
//	if ($n < 0) $n += 26;
//	if ($n == 13) return str_rot13($s);
//	$rep = substr($letters, $n * 2) . substr($letters, 0, $n * 2);
//	return strtr($s, $letters, $rep);
//}

// TODO is this used ? --not used
//function noAccent($str) {
//	$replace = array(
//		'â' => 'a', 
//		'ä' => 'a', 
//		'à' => 'a', 
//		'ê' => 'e', 
//		'ë' => 'e', 
//		'è' => 'e', 
//		'é' => 'e', 
//		'ù' => 'u', 
//		'û' => 'u', 
//		'ü' => 'u', 
//		'ô' => 'o', 
//		'ö' => 'o', 
//		'ç' => 'c' 
//	);
//	$r = strtr($str, $replace);
//	return $r;
//}

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
		if($days != 1) {
			$str = $days." jours";
		} else {
			$str = $days." jour";
		}
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
		return $day." ".$month_conversion[intval($month)-1];
	}
}

?>
