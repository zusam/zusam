<?php

chdir(realpath(dirname(__FILE__).'/../'));
require_once('Core/MongoDriver.php');
require_once('LibPHP/Ganon/ganon.php');
require_once('Core/Utils.php');

function preview_initialize($url) {
	$p = [];
	$p['url'] = $url;
	$p['_id'] = mongo_id();
	$p['date'] = mongo_date();
	$t = microtime(true);
	preview_getBaseURL($p);
	preview_getHTML($p);
	preview_getTitle($p);
	preview_getDescription($p);
	preview_getImage($p);
	$p['total_time'] = round(microtime(true) - $t, 5);
	unset($p['html']);
	$p['raw_html'] = to_utf8($p['raw_html']);
	unset($p['raw_html']);
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
	$html_string = to_utf8($html_string);
	$html_string = mb_convert_encoding($html_string, 'HTML-ENTITIES', "UTF-8"); 
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
	$p['raw_html'] = $html_string;
	$html = str_get_dom($html_string);

	$p['html'] = $html;

	$p['html_t'] = microtime(true) - $t;
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

	$title = to_utf8($title);
	$title = html_entity_decode($title);
	$p['title'] = cutIfTooLong($title, 150);
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
			$str = strip_tags($d->getPlainText());
			$v = 0;
			$v = $v + min(floor(mb_strlen($str)/100), 8);
			$v = $v + min(preg_match_all("/[,\.]/",$str), 8);
			$v = $v - min(floor(preg_match_all("/[\%\^\{\}\(\)\[\]\-\/\_\#\~\§]/",$str)/4), 2);
			//$v -= min(floor(count(preg_match_all("/[0-9]/",$str))), 2);
			if($v > $value) {
				$description = $str;
				$value = $v;
			}
		}
		foreach($p['html']('*:text') as $d) {
			$str = strip_tags($d->getPlainText());
			$v = 0;
			$v = $v + min(floor(mb_strlen($str)/100), 8);
			$v = $v + min(preg_match_all("/[,\.]/",$str), 8);
			$v = $v - min(floor(preg_match_all("/[\%\^\{\}\(\)\[\]\-\/\_\#\~\§]/",$str)/4), 2);
			//$v -= min(floor(count(preg_match_all("/[0-9]/",$str))), 2);
			if($v > $value) {
				$description = $str;
				$value = $v;
			}
		}
	}
	$description = to_utf8($description);
	$description = html_entity_decode($description);
	$description = strip_tags($description);
	$p['description'] = cutIfTooLong($description, 335); 
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
			$score += 8;
		}
		if($height > 270) {
			$score += 8;
		}
		if($width/$height >= 1) {
			$score += 2;
		}
		$score += floor(min($width, max($width, 1024))*min($height, max($height, 1024))/(256*256));
		$score += floor(max(5 - $im['time'], 0)*2);
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
	$meta[] = 'meta[name="twitter:image"]';
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

	$found1 = $p['html']('img[src]');
	$found2 = $p['html']('iframe[src]');
	$found = array_merge($found2, $found1);
	$base_url = $p['base_url'];
	if($found != null) {

		$i = 0;
		foreach($found as $element) {
			if($i > 10) {
				break;
			}
			if($element->src != null) {

				$img = getImageFromSource($element->src,$p['url'],$p['base_url']);
				//var_dump($img);

				///if(preg_match("/\.bmp|\.jpg|\.jpeg|\.png|\.gif/i",$img)==1) {
				//	$img = preg_replace("/(.*\.jpg|\.jpeg|\.png|\.gif).*/i","$1",$img);
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
				//}
			}
		}
	}

	$best_candidate = [];
	foreach($candidates as $c) {
		if($c['score'] > $best_candidate['score']) {
			$best_candidate = $c;
		}
	}
			
	if($best_candidate['score'] > 10 && $best_candidate['width'] > 64) {
		$p['image'] = $best_candidate;
	}
	$p['candidates'] = $candidates;
	if($p['image'] != null && $p['image'] != []) {
		return true;
	} else {
		return false;
	}

}

function getImageFromSource($src,$url,$base_url) {


	if(preg_match("/(https?:\/\/www.youtube.com\/embed\/)([\w\-]+)(.*)/",$src)==1) {
		$img = preg_replace("/(https?:\/\/www.youtube.com\/embed\/)([\w\-]+)([^\s]*)/","http://img.youtube.com/vi/$2/maxresdefault.jpg",$element->src);
		return $img;
	} 
	
	if(preg_match("/(https?:\/\/player.vimeo.com\/video\/)([0-9]+)/",$src)==1) {
		$id = preg_replace("/(https?:\/\/player.vimeo.com\/video\/)([0-9]+)/","$2",$src);
		$hash = unserialize(file_get_contents("http://vimeo.com/api/v2/video/$id.php"));
		$img = $hash[0]['thumbnail_large'];  
		return $img;
	}
	
	if(preg_match("/(http:\/\/www.dailymotion.com\/embed\/video\/)([\w\-]+)([^\s]*)/",$src)==1) {
		$img = preg_replace("/(http:\/\/www.dailymotion\.com\/embed\/video\/)([\w\-]+)([^\s]*)/","http://www.dailymotion.com/thumbnail/video/$2",$src);
		return $img;
	}

	if(preg_match("/^https?:\/\//",$src) != 1) {
		if(preg_match("/^\/\//",$src) == 1) {
			$img = 'http:'.$src;
		} else {
			if(preg_match("/^\.\./",$src) == 1) {
				$url = preg_replace("/\/([^\/]+)$/","/",$url);
				$img = $url.$src;
			} else {
				$img = 'http://'.$base_url.'/'.$src;
			}
		}
	} else {
		$img = $src;
	}
	return $img;

}

function preview_save(&$p) {
	mongo_save("previews",$p);
}	

function preview_load($array) {
	$p = mongo_load("previews",$array);
	return $p;
}

// TODO destroy miniature file
function preview_destroy($id) {
	mongo_destroy("previews",$id);
}

?>
