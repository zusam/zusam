<?php
		// PICTURES //

		if($option != "light") {
			if($flag==0 && preg_match("/(https?:\/\/.+)(\.bmp|\.BMP|\.jpeg|\.JPG|\.jpg|\.png|\.PNG)(.*)/",$word)==1) {
				// facebook 
				$fb = false;
				if(preg_match("/fbcdn/",$word)==1) {
					$tmp = "/tmp/".md5($word);
					file_put_contents($tmp, file_get_contents($word));
					$r = filesize($tmp);
					if(filesize($tmp) == 0) {
						$url = preg_replace("/(https?:\/\/.+)(\.bmp|\.BMP|\.jpeg|\.JPG|\.jpg|\.png|\.PNG)(.*)/","$1$2$3", $word);
					} else {
						$url = $tmp;
						$fb = true;
					}
				} else {
					$url = preg_replace("/(https?:\/\/.+)(\.bmp|\.BMP|\.jpeg|\.JPG|\.jpg|\.png|\.PNG)(.*)/","$1$2$3", $word);
				}
				if(thumbnail_exists($url,"jpg")) {
					$path = path_thumbnail($url,"jpg");
				} else {
					createImage($url);
					if(thumbnail_exists($url,"jpg")) {
						$path = path_thumbnail($url,"jpg");
					} else {
						$path = $url;
					}
				}
				if($fb) {
					unlink($tmp);
				}
				$word = preg_replace("/(https?:\/\/.+)(\.bmp|\.BMP|\.jpeg|\.JPG|\.jpg|\.png|\.PNG)(.*)/",
						"
						<div class=\"block-center\">
						<div class=\"zoom\">
						<img class=\"img-responsive\" src=\"$path\" alt=\"$1$2$3\" />
						<div onclick=\"TINY.box.show({image:'$1$2$3',fixed:false}); return false;\" class=\"mask\">
						<!--<a class=\"info\" href=\"$1$2\"><i class=\"fa fa-search fa-2x\"></i>-->
						</a>
						</div>
						</div>
						</div>
						",$word);
				$flag = 1;
			}
		} else {
			if($flag==0 && preg_match("/(https?:\/\/.+)(\.bmp|\.BMP|\.jpeg|\.JPG|\.jpg|\.png|.PNG)(.*)/",$word)==1) {
				$url = preg_replace("/(https?:\/\/.+)(\.bmp|\.BMP|\.jpeg|\.JPG|\.jpg|\.png|.PNG)(.*)/","$1$2$3", $word);
				if(thumbnail_exists($url,"mini")) {
					$path = path_thumbnail($url,"mini");
				} else {
					createMiniature($url);
					if(thumbnail_exists($url,"mini")) {
						$path = path_thumbnail($url,"mini");
					} else {
						$path = $url;
					}
				}
				$word = preg_replace("/(https?:\/\/.+)(\.bmp|\.BMP|\.jpeg|\.JPG|\.jpg|\.png|.PNG)(.*)/",
						"
						<img class=\"img-cover\" src=\"$path\" alt=\"$1$2$3\" />
						",$word);
				$flag = 1;
			}
		}

		// GIF OR WEBP //

		if($option == "light") {
			$fail = false;
			$fail2 = false;
			if($flag==0 && preg_match("/(https?:\/\/.+)(\.gif|\.webp)(.*)/",$word)==1) {
				$url = preg_replace("/(https?:\/\/.+)(\.gif|\.webp)(.*)/","$1$2$3",$word);
				if(thumbnail_exists($url,"mini")) {
					$path = path_thumbnail($url,"mini");
				} else {
					//createThumbs_mini($url, "");
					gifMiniature($url);
					if(thumbnail_exists($url,"mini")) {
						$path = path_thumbnail($url,"mini");
					} else {
						$fail = true;
						$path = $url;
					}
				}
				if(thumbnail_exists($url,"webm")) {
					$path2 = path_thumbnail($url,"webm");
				} else {
					gif2webm($url, "");
					if(thumbnail_exists($url,"webm")) {
						$path2 = path_thumbnail($url,"webm");
					} else {
						$fail2 = true;
						$path2 = $url;
					}
				}
				$word = '<img class="img-cover" src="'.$path.'"/>';
				if(!$fail) {
					$word .=  '<span class="gif-badge">GIF</span>';
				}
				$flag = 1;
			}
		} else {
			$fail = false;
			$fail2 = false;
			if($flag==0 && preg_match("/(https?:\/\/.+)(\.gif|\.webp)([;&?a-zA-Z0-9\~\_\=\%]*)/",$word)==1) {
				$url = preg_replace("/(https?:\/\/.+)(\.gif|\.webp)([;&?a-zA-Z0-9\~\=\_\%\/]*)/","$1$2",$word);
				if(thumbnail_exists($url,"mini")) {
					$path = path_thumbnail($url,"mini");
				} else {
					gifMiniature($url);
					if(thumbnail_exists($url,"mini")) {
						$path = path_thumbnail($url,"mini");
					} else {
						$fail = true;
						$path = $url;
					}
				}
				if(thumbnail_exists($url,"webm")) {
					$path2 = path_thumbnail($url,"webm");
				} else {
					gif2webm($url, "");
					if(thumbnail_exists($url,"webm")) {
						$path2 = path_thumbnail($url,"webm");
					} else {
						$fail2 = true;
						$path2 = $url;
					}
				}
				if(!$fail2) {
					if(thumbnail_exists($path2,"mp4")) {
						$path3 = path_thumbnail($path2,"mp4");
					} else {
						webm2mp4($path2);
						if(thumbnail_exists($path2,"mp4")) {
							$path3 = path_thumbnail($path2,"mp4");
						} else {
							$fail3 = true;
							$path3 = $url;
						}
					}
				}
				$word = '<div class="block-center">';
				$word .= '<a href="'.$path2.'"';
				if($fail2 && $fail3) {
					$word .= ' onclick="loadGif(this); return false;" alt="'.$url.'">';
				} else {
					$word .= ' onclick="loadGifV(this); return false;">';
				}
				$word .= ' <img src="'.$path.'" data-mp4="'.$path3.'" data-webm="'.$path2.'"/>';
				if(!$fail) {
					$word .= '<span class="gif-badge">GIF</span>';
				}
				$word .= '</a></div>';
				$flag = 1;
			}
		}
		if($flag==0 && preg_match("/(https?:\/\/.+)(\.mp4|\.webm)(.*)/",$word)==1) {
			$url = preg_replace("/(https?:\/\/.+)(\.mp4|\.webm)(.*)/","$1$2",$word);
			if(file_exists(path_thumbnail($url, "vidthumb"))) {
				$path = path_thumbnail($url,"vidthumb");
			} else {
				videoThumbnail($url);
				if(thumbnail_exists($url,"vidthumb")) {
					$path = path_thumbnail($url,"vidthumb");
				} else {
					$fail = true;
					$path = $url;
				}
			}
			if(!$fail) {
				if($option == "light") {
					$word = ' <img src="'.$path.'" alt="'.$url.'"';
					$word .= ' class="img-cover"';
					$word .= '/>';
					$word .= '<span class="loop-badge"><i class="fa fa-play fa-2x"></i></span>';
				} else {
					$word = '<div class="block-center">
						<a href="'.$url.'" onclick="loadLoop(this); return false;">
						<img src="'.$path.'" alt="'.$url.'"';
					$word .= '/>';
					$word .= '<span class="loop-badge"><i class="fa fa-play fa-2x"></i></span>';
					$word .= '</a></div>';
				}

			} else {
				$word = preg_replace("/(https?:\/\/.+)(\.mp4|\.webm)(.*)/","<video preload=\"auto\" autoplay width=\"100%\" src=\"$1$2\" loop></video>",$word);
			}
			$flag = 1;
		}

		// VARIOUS //

		if($flag==0 && preg_match("/(https?:\/\/.+)(\.avi)([?a-zA-Z0-9\~\_\=\%]*)/",$word)==1) {
			$word = preg_replace("/(https?:\/\/.+)(\.avi)([?a-zA-Z0-9\~\=\_\%]*)/","<video controls width=\"100%\" src=\"$1$2\"></video>",$word);
			$flag = 1;
		}
		if($flag==0 && preg_match("/(https?:\/\/.+)(\.ogg)([?a-zA-Z0-9\~\_\=\%]*)/",$word)==1) {
			$word = preg_replace("/(https?:\/\/.+)(\.ogg)([?a-zA-Z0-9\~\=\_\%]*)/","<audio controls><source src=\"$1$2\" type=\"audio/ogg\"></audio>",$word);
			$flag = 1;
		}
		if($flag==0 && preg_match("/(https?:\/\/.+)(\.mp3)([?a-zA-Z0-9\~\_\=\%]*)/",$word)==1) {
			$word = preg_replace("/(https?:\/\/.+)(\.mp3)([?a-zA-Z0-9\~\=\_\%]*)/","<audio controls><source src=\"$1$2\" type=\"audio/mpeg\"></audio>",$word);
			$flag = 1;
		}
		if($flag==0 && preg_match("/(https?:\/\/.+)(\.wav)([?a-zA-Z0-9\~\_\=\%]*)/",$word)==1) {
			$word = preg_replace("/(https?:\/\/.+)(\.wav)([?a-zA-Z0-9\~\=\_\%]*)/","<audio controls><source src=\"$1$2\" type=\"audio/wav\"></audio>",$word);
			$flag = 1;
		}
		if($flag==0 && preg_match("/(https?:\/\/[^\s]+)(\.pdf)(.*)/",$word)==1) {
			$word = preg_replace("/(https?:\/\/[^\s]+)(\.pdf)(.*)/","<a href=\"$1$2\" target=\"_blank\"><img style=\"height:100px;\" src=\"images/pdf.png\" alt=\"\" /></a>",$word);
			$flag = 1;
		}













?>
