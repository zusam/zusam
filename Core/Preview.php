<?php

require_once(realpath(dirname(__FILE__)).'/../Ganon/ganon.php');

function preview_initialize($url) {
	$p = [];
	$p['url'] = $url;
	$p['_id'] = new MongoId();
	$p['date'] = new MongoDate();
	$t = microtime(true);
	preview_getBaseURL($p);
	preview_getHTML($p);
	preview_getTitle($p);
	preview_getDescription($p);
	preview_getImage($p);
	$p['total_time'] = round(microtime(true) - $t, 5);
	unset($p['html']);
	return $p;
}

function preview_getBaseURL(&$p) {
	if(!isset($p['url'])) {
		return false;
	}
	$url = $p['url'];
	$base_url = parse_url($url)['host'];
	$p['base_url'] = $base_url;
}

function preview_getHTML(&$p) {
	if(!isset($p['url'])) {
		return false;
	}

	$t = microtime(true);

	$url = $p['url'];
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_ENCODING, "");
	curl_setopt($ch, CURLOPT_USERAGENT, "");
	curl_setopt($ch, CURLOPT_AUTOREFERER, true);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
	curl_setopt($ch, CURLOPT_TIMEOUT, 5);
	curl_setopt($ch, CURLOPT_MAXREDIR, 10);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_COOKIEFILE, "/tmp/cookie.txt");
	curl_setopt($ch, CURLOPT_COOKIEJAR, "/tmp/cookie.txt");
	curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
	$html_string = curl_exec($ch);
	curl_close($ch);
	
	//remove script/style tags
	$dom = new DOMDocument();
	$dom->loadHTML($html_string);
	$remove = [];
	$script = $dom->getElementsByTagName('script');
	foreach($script as $item) {
		$remove[] = $item;
	}
	$style = $dom->getElementsByTagName('style');
	foreach($style as $item) {
		$remove[] = $item;
	}
	foreach ($remove as $item) {
		$item->parentNode->removeChild($item); 
	}
	$html_string = $dom->saveHTML();
	$html = str_get_dom($html_string);

	$p['html'] = $html;

	$p['html_t'] = microtime(true) - $t;
}

function to_utf8($str) {
	$str = mb_convert_encoding($str, "UTF-8");
	$str = fixBadUnicode($str);
	return $str;
}

function fixBadUnicode($str) {
	$str = preg_replace("/\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1")).chr(hexdec("$2")).chr(hexdec("$3")).chr(hexdec("$4"))', $str);
	$str = preg_replace("/\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1")).chr(hexdec("$2")).chr(hexdec("$3"))', $str);
	$str = preg_replace("/\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1")).chr(hexdec("$2"))', $str);
	$str = preg_replace("/\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1"))', $str);
	return $str;
}

function preview_getTitle(&$p) {
	if(!isset($p['html'])) {
		return false;
	}
	if(!isset($p['url'])) {
		return false;
	}
	$title = $p['html']('meta[property="og:title"]');
	if($title != null) {
		$title = $title[0]->content;
	} else {
		$tmp = $p['html']('title');
		if(count($tmp) > 0) {
			$title = $tmp[0]->getPlainText();
		} else {
			$title = null;
		}
		if($title == null) {
			$title = $p['url'];
		}
	}
	
	$replace = trim(substr($title,0,150));
	if(abs(strlen($replace) - strlen($title)) > 3) {
		$replace = $replace . "...";
	}
	$p['title'] = to_utf8(utf8_decode($replace));
}

function preview_getDescription(&$p) {
	if(!isset($p['html'])) {
		return false;
	}

	$description = $p['html']('meta[property="og:description"]');
	if($description != null) {
		$description = $description[0]->content;
	} else {
		$value = 0;
		$description = "";
		foreach($p['html']('p') as $d) {
			$str = $d->getPlainText();
			$v = 0;
			$v += min(floor(strlen($str)/100), 5);
			$v += count(preg_match_all("/[,]/",$str));
			if($v > $value) {
				$description = $str;
				$value = $v;
			}
		}
	}
	$replace = trim(substr($description,0,335));
	if(abs(strlen($replace) - strlen($description)) > 3) {
		$replace = $replace . "...";
	}
	$p['description'] = to_utf8(utf8_decode($replace));
}

function ranger($url) {
	$t = microtime(true);
	$headers = array("Range: bytes=0-65536");
	
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
	$info[0] = $width;
	$info[1] = $height;
	$info['width'] = $width;
	$info['height'] = $height;
	$info['time'] = round(microtime(true) - $t, 5);
	return $info;
}

function preview_imageInit($url) {
	$im = [];
	$ret = ranger($url);
	$im['url'] = $url;
	$im['width'] = $ret['width'];
	$im['height'] = $ret['height'];
	$im['time'] = $ret['time'];

	$score = 0;
	$width = $im['width'];
	$height = $im['height'];
	if($width == null || $height == null) {
		$im['score'] = 0;
	} else {
		if($width > 270) {
			$score += 10;
		}
		if($height > 270) {
			$score += 10;
		}
		if($width/$height >= 1) {
			$score += 10;
		}
		$score += floor(min($width, max($width, 1024))*min($height, max($height, 1024))/(256*256));
		$score += floor(max(5 - $im['time'], 0)*5);
	}
	$im['score'] = intval($score);
	$im['size'] = intval($im['width'])*intval($im['height']);
	return $im;
}

function preview_getImage(&$p) {
	if(!isset($p['html'])) {
		return false;
	}
	if(!isset($p['base_url'])) {
		return false;
	}

	$candidates = [];

	// first get the meta-images (we maybe don't need to look further)
	$meta[] = 'meta[property="og:image"]';
	$meta[] = 'meta[property="og:image:url"]';
	$meta[] = 'meta[property="twitter:image"]';

	$score_max = 0;
	$id_max = -1;
	$i = 0;
	foreach($meta as $m) {
		$img = $p['html']($m);
		if($img != null) {
			$img_final = $img[0]->content;
			if($img_final != null) {
				$im = preview_imageInit($img_final);
				if($im['score'] > $score_max) {
					$score_max = $im['score'];
					$id_max = $i;
				}
				$i++;
				array_push($candidates, $im);
			}
		}
	}

	$p['meta'] = $candidates;
	
	// stop here if the images are good enough
	if($score_max > 40 && $candidates[$id_max]['width'] > 270) {
		$p['image'] = $candidates[$id_max];
		$p['candidates'] = $candidates;
		return true;
	}

	$found = $p['html']('img[src]');
	$base_url = $p['base_url'];
	if($found != null) {

		$i = 0;
		foreach($found as $element) {
			if($i > 20) {
				break;
			}
			if($element->src != null) {
				if(preg_match("/^https?:\/\//",$element->src) != 1) {
					if(preg_match("/^\/\//",$element->src) == 1) {
						$img = 'http:'.$element->src;
					} else {
						if(preg_match("/^\.\./",$element->src) == 1) {
							$url = preg_replace("/\/([^\/]+)$/","/",$url);
							$img = $url.$element->src;
						} else {
							$img = 'http://'.$base_url.'/'.$element->src;
						}
					}
				} else {
					$img = $element->src;
				}
				if(preg_match("/\.bmp|\.jpg|\.jpeg|\.png|\.gif/i",$img)==1) {
					$img = preg_replace("/(.*\.jpg|\.jpeg|\.png|\.gif).*/i","$1",$img);
					if(!array_search($img, $repeat)) {
						$i++;
						$im = preview_imageInit($img);
						$repeat[] = $img;
						array_push($candidates, $im);
						// stop here if the image is good enough
						if($im['score'] > 50 && $im['width'] > 270) {
							$p['image'] = $im;
							$p['candidates'] = $candidates;
							return true;
						}
					}
				}
			}
		}
	}

	$best_candidate = [];
	foreach($candidates as $c) {
		if($c['score'] > $best_candidate['score']) {
			$best_candidate = $c;
		}
	}
			
	$p['image'] = $best_candidate;
	$p['candidates'] = $candidates;
	if($p['image'] != null && $p['image'] != []) {
		return true;
	} else {
		return false;
	}

}

function preview_save(&$p) {
	$m = new MongoClient();
	$previews = $m->selectDB("zusam")->selectCollection("previews");
	$mid = new MongoId($p['_id']);
	$previews->update(array('_id' => $mid), $p, array('upsert' => true));
}	

function preview_load($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	$m = new MongoClient();
	$previews = $m->selectDB("zusam")->selectCollection("previews");
	$p = $previews->findOne($array);
	return $p;
}

function preview_destroy($id) {
	$m = new MongoClient();
	$mid = new MongoId($id);
	$previews = $m->selectDB("zusam")->selectCollection("previews");
	$previews->remove(array('_id' => $mid));
}

?>
