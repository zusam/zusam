<?php

//function isAnimatedGif($url) {
//	$size = 1024*1024;
//	$headers = array("Range: bytes=0-".$size);
//	$curl = curl_init($url);
//	curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
//	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
//	$data = curl_exec($curl);
//	curl_close($curl);
//
//	$filecontents = $data;
//
//	$str_loc=0;
//	$count=0;
//
//	// There is no point in continuing after we find a 2nd frame
//	while ($count < 2) {
//		$where1=strpos($filecontents,"\x00\x21\xF9\x04", $str_loc);
//		if ($where1 === FALSE) {
//			break;
//		}
//
//		$str_loc = $where1+1;
//		$where2  = strpos($filecontents,"\x00\x2C",$str_loc);
//		if ($where2 === FALSE) {
//			break;
//		} else {
//			if ($where1+8 == $where2) {
//				$count++;
//			}
//			$str_loc = $where2+1;
//		}
//	}
//
//	// gif is animated when it has two or more frames
//	return ($count >= 2); 
//}


function getFileSize($url) {
	$size = filesize($url);
	if($size) {
		return $size;
	}

	$ch = curl_init($url);

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	curl_setopt($ch, CURLOPT_HEADER, TRUE);
	curl_setopt($ch, CURLOPT_NOBODY, TRUE);

	$data = curl_exec($ch);
	$size = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);

	curl_close($ch);
	return $size;
}

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

function cutIfTooLong($str, $n) {
	$replace = trim(mb_substr($str,0,$n));
	if(abs(mb_strlen($replace) - mb_strlen($str)) > 3) {
		$replace = $replace . "...";
	}
	return $replace;
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

function deleteAllValues($e, $a) {
	$k = array_keys($a, $e, true);
	foreach($k as $kk) {
		unset($a[$kk]);
	}
	return $a;
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

function human_filesize($bytes, $decimals = 2) {
	$sz = 'BKMGTP';
	$factor = floor((strlen($bytes) - 1) / 3);
	return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$sz[$factor];
}

?>
