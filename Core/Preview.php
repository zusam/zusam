<?php

	require_once('Ganon/ganon.php');

	class graphObject {
		public $title;
		public $description;
		public $url;
		public $preview;
		public $w;
		public $h;
		public $tmp;
	}

	function getGraphObject($url) {
		$go = new graphObject();
		$html = getHTML($url);
		if($html != null) {
			$title = getTitle($url, $html);
			$description = getDescription($url, $html);
			$p = getImage($url, $html);

			$go->title = $title;
			$go->description = $description;
			$go->url = $url;
			$go->preview = $p->url;
			$go->w = $p->w;
			$go->h = $p->h;
			return $go;
		} else {
			return false;
		}
	}

	function getHTML($url, $full) {
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
		
		//remove script tags
		$dom = new DOMDocument();
		$dom->loadHTML($html_string);
		$script = $dom->getElementsByTagName('script');
		$remove = [];
		foreach($script as $item) {
			$remove[] = $item;
		}
		foreach ($remove as $item) {
			$item->parentNode->removeChild($item); 
		}
		$html_string = $dom->saveHTML();

		$html = str_get_dom($html_string);
		return $html;
	}
	
	function getTitle($url, $html) {
		$title = $html('meta[property="og:title"]');
		if($title != null) {
			$title = utf8_encode(to_utf8($title[0]->content));
		} else {
			$title = utf8_encode(to_utf8($html('title')[0]->getPlainText()));
			if($title == null) {
				$title = $url;
			}
		}
		$title = correctBadTitle($title);
		$replace = trim(substr($title,0,150));
		if(abs(strlen($replace) - strlen($title)) > 3) {
			$replace = $replace . "...";
		}
		return $replace;
	}

	function correctBadTitle($str) {
		if(substr_count($str,"?") > 2) {
			$str2 = preg_replace("/\ \?\ /"," à ",$str);	
			$str3 = preg_replace("/\?/","é",$str2);	
			return $str3;
		}
		return $str;
	}

	function getDescription($url, $html){
		$description = $html('meta[property="og:description"]');
		if($description != null) {
			$description = utf8_encode(to_utf8($description[0]->content));
		} else {
			$value = 0;
			$description = "";
			foreach($html('p') as $d) {
				$str = $d->getPlainText();
				$v = 0;
				$v += min(floor(strlen($str)/100), 5);
				$v += count(preg_match_all("/[,]/",$str));
				$v -= count(preg_match_all("/[=+><]/",$str))*0;
				if($v > $value) {
					$description = utf8_encode(to_utf8($str));
					$value = $v;
				}
			}
			//$description = to_utf8($html('p')[0]->getPlainText());
		}
		$replace = trim(substr($description,0,335));
		if(abs(strlen($replace) - strlen($description)) > 3) {
			$replace = $replace . "...";
		}
		return $replace;
	}

	function to_utf8($str) {
		$str = mb_convert_encoding($str, "UTF-8");
		//return utf8_encode($str);
		return $str;
	}

	function fixBadUnicode($str) {
		$str = preg_replace("/\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1")).chr(hexdec("$2")).chr(hexdec("$3")).chr(hexdec("$4"))', $str);
		$str = preg_replace("/\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1")).chr(hexdec("$2")).chr(hexdec("$3"))', $str);
		$str = preg_replace("/\\\\u00([0-9a-f]{2})\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1")).chr(hexdec("$2"))', $str);
		$str = preg_replace("/\\\\u00([0-9a-f]{2})/e", 'chr(hexdec("$1"))', $str);
		return $str;
	}

	function getMetaImage($url, $html, $meta) {
		$img = $html($meta);
		if($img != null) {
			$img_final = $img[0]->content;
			if($img_final != null) {
				$im = new imageObject();
				$im->initialize($img_final, true);
				if($im->w > 64) {
					//var_dump($im);
					return $im;
				}
			}
		}
		return null;
	}

	function ranger($url){
		$headers = array("Range: bytes=0-65536");
		
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		$data = curl_exec($curl);
		curl_close($curl);

		$im = imagecreatefromstring($data);
		$width = imagesx($im);
		$height = imagesy($im);
		$info[0] = $width;
		$info[1] = $height;
		return $info;
	}


	class imageObject {
		public $url;
		public $w;
		public $h;
		public $score;
		public $meta;
		public $size;

		public function initialize($url, $meta) {
			$this->url = $url;
			$info = ranger($url);
			$this->w = $info[0];
			$this->h = $info[1];
			$this->meta = $meta;
			$this->setImageScore();
			$this->size = $this->w*$this->w+$this->h*$this->h;
		}

		public function setImageScore() {
			$score = 0;
			$width = $this->width;
			$height = $this->height;
			if($width == null || $height == null) {
				$this->score = 0;
				return false;
			}
			if($width > 540) {
				$score = $score + 10;
			}
			if($height > 540) {
				$score = $score + 10;
			}
			if($width/$height >= 1) {
				$score = $score + 10;
			}
			$score = $score + floor(max($width, 1024)*max($height, 1024)/(128*128));
			$this->score = $score;
			return $score;
		}
	}

	// try to get an image. If his OGP image doesn't exist or is too small, try manually to extract one.
	function getImage($url, $html) {

		$metaImages = [];
		$metaImages[] = getMetaImage($url, $html, 'meta[property="og:image"]');
		$metaImages[] = getMetaImage($url, $html, 'meta[property="og:image:url"]');
		$metaImages[] = getMetaImage($url, $html, 'meta[property="twitter:image"]');

		$s = 0;
		$im = -1;
		for($i=0; $i < count($metaImages); $i++) {
			if($metaImages[$i] != null) {
				if($s < $metaImages[$i]->score) {
					$s = $metaImages[$i]->score;
					$im = $i;
				}
			}
		}
		
		$img_final = $metaImages[$im];
		if($im == -1) {
			$img_final = extractPreview($url, $html);
		} else {
			if($metaImages[$im]->width < 128) {
				$img = extractPreview($url, $html);
				if($img != null) { 
					if($img->score > $metaImages[$im]->score) {
						$image_final = $img;
					}
				}
			}
		}
		return $img_final;
	}


	function extractPreview($url, $html) {
		$found = $html('img[src]');
		$base_url = parse_url($url)['host'];
		if($found != null) {

			$img_final = new imageObject();
			$img_final->url = "";
			$img_final->w = 0;
			$img_final->h = 0;
			$img_final->score = 0;
			$img_final->size = 0;
			$repeat = [];
			$extracted = [];
			foreach($found as $element) {
				if($element->src != null) {
					if(preg_match("/^https?:\/\//",$element->src) != 1) {
						if(preg_match("/^\/+/",$element->src) == 1) {
							//$img = 'http://'.$base_url.$element->src;
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
							//$ext = strtolower(preg_replace("/.*(\.jpg|\.jpeg|\.png|\.gif)/i","$1",$img));
							$im = new imageObject();
							$im->initialize($img, false);
							if($im->size > $img_final->size*1.05 && $im->w > 75 && $im->h > 75) {
								$img_final = $im;
							}
							$repeat[] = $img;
							$extracted[] = $im;
						}
					}
				}
			}
			if($img_final->url != "") {
				return $img_final;
			} 
		}
		return false;;
	}

?>
