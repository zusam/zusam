<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function compileText($text, $debug) {

	if(!isset($debug)) {
		$debug = false;
	}

	$r = $GLOBALS['regex'];
	$str = strip_tags($text);
	$str = trim($str);
	$str = preg_replace("/\n/","<br>",$str);
	if($debug) {
		var_dump($text);
	}

	$map = genTextMap($str, $debug);
	if($debug) {
		var_dump($map);
	}
	$html = "";
	$text = false;
	foreach($map as $m) {
		if($m[1] != "text") {
			if($text) {
				$pre = '</div>';
				$text = false;
			} else {
				$pre = ' ';
			}
		} else {
			if($text) {
				$pre = ' ';
			} else {
				$pre = '<div>';
				$text = true;
			}
		}
		switch($m[1]) {
			case "file_unknown":
				// nothing is done in order to quietly discard these
				// TODO properly do something
			break;
			case "file_jpg":
				if($m[2] > 3) {
					$html .= $pre.process_albumImage($m[0]);	
				} else {
					$html .= $pre.process_file($m[0]);	
				}
			break;
			case "file_webm":
				$html .= $pre.process_file($m[0]);	
			break;
			case "gfycat":
				$html .= $pre.process_gfycat($m[0]);
			break;
			case "facebook_video":
				$html .= $pre.process_facebook_video($m[0]);
			break;
			case "imgur":
				$html .= $pre.process_imgur($m[0],$debug);
			break;
			case "instagram":
				$html .= $pre.process_instagram($m[0]);
			break;
			//case "onedrive":
			//	$html .= $pre.process_onedrive($m[0]);
			//break;
			case "googleDrive":
				$html .= $pre.process_googleDrive($m[0]);
			break;
			case "soundcloud":
				$html .= $pre.process_soundcloud($m[0], $debug);
			break;
			case "vine":
				$html .= $pre.process_vine($m[0]);
			break;
			case "dailymotion":
				$html .= $pre.process_dailymotion($m[0]);
			break;
			case "vimeo":
				$html .= $pre.process_vimeo($m[0]);
			break;
			case "youtube2":
				$html .= $pre.process_youtube2($m[0]);
			break;
			case "youtube":
				$html .= $pre.process_youtube($m[0]);
			break;
			case "video":
				$html .= $pre.process_video($m[0], $debug);
			break;
			case "image":
				$output = process_image($m[0]);
				$html .= $pre.$output;
				if($debug) {
					var_dump($output);
					echo('______________________________________');
				}
			break;
			case "gif":
				$html .= $pre.process_gif($m[0]);
			break;
			case "link":
				$html .= $pre.process_link($m[0]);
			break;
			default:
				if(preg_match("/^[\s]*$/",$m[0]) != 1) {
					$html .= $pre.$m[0];
				}
			break;
		}
	}
	if($text) {
		$html .= '</div>';
	}
	return $html;
}

function genTextMap($str, $debug) {
	if(!isset($debug)) {
		$debug = false;
	}
	$r = $GLOBALS['regex'];
	$map = explode(' ',$str);
	$suite = [];
	$suiteType = "";
	foreach($map as $k=>$elmt) {
		$matched = false;
		if($elmt == "") {
			unset($map[$k]);
			continue;
		}
		foreach($r as $kr=>$vr) {
			if(preg_match(r2ep($vr),$elmt)) {
				$matched = true;
				if($kr == "file") {
					$fileId = preg_replace('/\{\:([a-zA-Z0-9]+)\:\}/','$1',$elmt);
					$file = file_load(array('fileId' => $fileId));	
					if($file) {
						$type = "file_".$file['type'];
					} else {
						$type = "file_unknown";
					}
				} else {
					$type = $kr;
				}
				break;
			}
			if(!$matched) {
				$type = "text";
			}
		}
		if($type == $suiteType) {
			array_push($suite, $k);	
			$map[$k] = array($elmt, $type);
		} else {
			if($suiteType != "") {
				$n = count($suite);
				foreach($suite as $key) {
					array_push($map[$key], $n);
				}
			}
			$map[$k] = array($elmt, $type);
			$suite = array($k);
			$suiteType = $type;
		}
		if($debug) {
			var_dump($elmt);
		}
	}
	
	$n = count($suite);
	foreach($suite as $key) {
		array_push($map[$key], $n);
	}
	
	return $map;
}

function process_gfycat($str) {
	gen_miniature($str, false);

	$url = preg_replace("/(.*)\?.*$/",'$1',$str);
	$id = preg_replace("/.*\/([a-zA-Z]+)$/","$1",$url);
	$w = "https://gfycat.com/ifr/".$id;
	$xx = p2l(pmini($str));
	$b = '<span class="deletable deletable-block" data-type="gfycat" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$o = '<div class="embed-responsive embed-responsive-16by9">';
	$o .= '<div onclick="loadIframe(this)" data-src="'.$w.'" class="launcher">';
	$o .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$o .= '</div></div>';
	$a = '</span>';
	return $b.$o.$a;
}

function process_facebook_video($str) {
	gen_miniature($str, false);
	$b = '<span class="deletable deletable-block" data-type="gfycat" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$o = '<iframe src="https://www.facebook.com/plugins/video.php?href='.$str.'&show_text=0&width=600" width="600" height="337" style="border:none;overflow:hidden" onload="keepFormat(this, 16/9)" scrolling="no" frameborder="0" allowTransparency="true" allowFullScreen="true"></iframe>';
	$a = '</span>';
	return $b.$o.$a;
}

function process_imgur($str,$debug) {
	// TODO add support for albums and not gallery (just add gallery)
	$id = preg_replace("/.*\/(\w+)\/?$/","$1",$str);
	if($id != "") {
		$data = fgc("https://api.imgur.com/3/gallery/".$id);
		if($debug) {
			echo('-');
			var_dump($data);
			echo('-');
		}
		$data = json_decode($data,true);
		if($data['success']) {
			if($data['data']['is_album'] == false) {
				$b = '<span class="deletable deletable-block" data-type="imgur" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
				if($data['data']['webm'] != "") {
					$xx = p2l(pmini($data['data']['webm']));
					gen_miniature($data['data']['webm']);
					$o = '<a class="mediaLink material-shadow" href="'.$str.'" target="_blank"><i class="icon-link-ext-alt"></i></a>';
					$o .= '<div onclick="loadVideo(this)" data-src="'.$data['data']['webm'].'" class="launcher">';
					$o .= '<img src="'.$xx.'" onerror="loadVideo(this)"/>';
				} else {
					$o = '<a class="mediaLink material-shadow" href="'.$str.'" target="_blank"><i class="icon-link-ext-alt"></i></a><img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'.$data['data']['link'].'"/>';
				}
				$a = '</span>';
				$output = $b.$o.$a;
			} else {
				$output = "";
				$b = '<span class="deletable deletable-block" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
				$output .= $b;	
				foreach($data['data']['images'] as $im) {
					$o = '<a class="mediaLink material-shadow" href="'.$str.'" target="_blank"><i class="icon-link-ext-alt"></i></a><img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'.$im['link'].'"/>';
					$output .= $o;	
				}
				$a = '</span>';
				$output .= $a;	
			}
		} else {
			$data = handleLink($str);
			$output = '<span class="deletable deletable-block" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
			$output .= open_graph_build($data);
			$output .= '</span>';
		}
	} else {
		$data = handleLink($str);
		$output = '<span class="deletable deletable-block" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
		$output .= open_graph_build($data);
		$output .= '</span>';
	}
	return $output;
}

function process_instagram($str) {
	$data = fgc("https://api.instagram.com/oembed/?url=".$str);
	$data = json_decode($data,true);

	$b = '<span class="deletable deletable-block" data-type="instagram" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$o = '<a class="mediaLink material-shadow" href="'.$str.'" target="_blank"><i class="icon-link-ext-alt"></i></a><img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'.$data['thumbnail_url'].'"/>';
	$a = '</span>';
	$output = $b.$o.$a;
	return $output;
}

//onedrive embed is not good
//function process_onedrive($str) {
//	if(preg_match("/resid=/",$str)) {
//		$resid = preg_replace("/(https?:\/\/onedrive.live.com\/).*resid=([\-\!\%\w]+).*/","$2",$str);
//		$param = "resid=".$resid;
//	} else {
//		$resid = preg_replace("/(https?:\/\/onedrive.live.com\/).*id=([\-\!\%\w]+).*/","$2",$str);
//		$cid = preg_replace("/(https?:\/\/onedrive.live.com\/).*cid=([\-\!\%\w]+).*/","$2",$str);
//		$authkey = preg_replace("/(https?:\/\/onedrive.live.com\/).*authkey=([\-\!\%\w]+).*/","$2",$str);
//		$param = "resid=".$resid."&cid=".$cid."&authkey=".$authkey;
//
//	}
//	if(preg_match("/^[\!\%\w]+$/",$resid)) {
//		$b = '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
//		$o = '<iframe seamless src="https://onedrive.live.com/embed?'.$param.'" frameborder="0"></iframe>';
//		$a = '</span>';
//		$output = $b.$o.$a;
//	} else {
//		$output = fail_request($str);
//	}
//	return $output;
//}

function process_googleDrive($str) {
	if(preg_match("/open\?id=/",$str)) {
		$id = preg_replace("/(https?:\/\/drive.google.com\/open\?id=)(\w+)/","$2",$str);
	} else {
		$id = preg_replace("/(https?:\/\/drive.google.com\/file\/d\/)([\w]+)(\/)([^\s]+)/","$2",$str);
	}
	if(preg_match("/^\w+$/",$id)==1) {
		$b = '<span class="deletable deletable-block" data-type="googleDrive" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
		$o = '<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="https://drive.google.com/file/d/'.$id.'/preview" frameborder="0"></iframe></div>';
		$a = '</span>';
		$output = $b.$o.$a;
	} else {
		$output = fail_request($str);
	}
	return $output;
}

function process_link($str) {
	$data = handleLink($str);
	$e = open_graph_build($data);
	$html = "";
	$html .= '<span class="deletable deletable-block" data-type="link" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= $e;
	$html .= '</span>';
	return $html;
}

function open_graph_build($data) {
	$base_url = $data['base_url'];
	$preview = ""; 
	$e = "";
	if(isset($data['image'])) {
		if(isset($data['image']['url']) && preg_match("/^\s*$/",$data['image']['url']) != 1) {
			$xx = p2l(pmini($data['url']));
			$preview = '<div class="preview"><img src="'.$xx.'" onerror="error_im(this)"/></div>';
		}
	}
	if(isset($data['title']) && $data['title'] != "") {
		$title = '<div class="title">'.html_entity_decode($data['title']).'</div>';
	} else { $title = ""; }
	if(isset($data['description']) && $data['description'] != "") {
		$description = '<div class="description">'.$data['description'].'</div>';
	} else { $description = ""; }
	if($preview != "" || ($title != "" && $description != "")) {
		$e = '<a class="article_big" href="'.$data['url'].'" target="_blank">'.$preview.$title.$description.'<div class="base_url">'.$base_url.'</div></a>';
		if(intval($data['image']['width']) < 380) {
			$e = '<a class="article_small" href="'.$data['url'].'" target="_blank">'.$preview.$title.$description.'<div class="base_url">'.$base_url.'</div></a>';
		}
	} else {
		$e = fail_request($data['url']);
	}
	return $e;
}

function fail_request($url) {
	$e = '<a class="b-link" href="'.preg_replace("/\s/"," ",$url).'" target="_blank">'.$url.'</a>';
	return $e;
}

function process_soundcloud($str, $debug) {
	gen_miniature($str, $debug);
	$xx = p2l(pmini($str));
	$code = "";
	$code .= '<div class="embed-responsive embed-responsive-16by9">';
	$code .= '<div onclick="loadIframe(this)" class="launcher">';
	$code .= '<img src="'.$xx.'" onerror="loadIframeNoPlay(this)"/>';
	$code .= '</div></div>';
	$html = '
		<span class="deletable deletable-block" data-type="soundcloud" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">
			<script>
				SC.oEmbed("'.$str.'", { auto_play: false }, function(oEmbed) {
					var song_url = oEmbed.html.replace(/.*src="([^"]+)".*/,"$1");
					var w = song_url.replace(/auto_play=false/,"auto_play=true");
					var dropin = $(\''.$code.'\');
					dropin.find(".launcher").attr("data-src",w);
					dropin.find(".launcher").attr("data-srcnoplay",song_url);
					$("#'.md5($str).'").html(dropin);
				});
			</script>
		</span>
	';
	return $html;
}

function process_vine($str) {
	gen_miniature($str, false);
	$html = "";
	$w .= preg_replace('/(https?:\/\/vine.co\/v\/)([\w\-]+)/','$1$2/embed/simple',$str);
	$html .= '<span class="deletable deletable-block" data-type="vine" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-square">';
	$html .= '<iframe seamless class="embed-responsive-item" src="'.$w.'" frameborder="0"></iframe>';
	$html .= '<script async src="//platform.vine.co/static/scripts/embed.js charset="utf-8"></script>';
	$html .= '</span>';
	return $html;
}

function process_dailymotion($str) {
	gen_miniature($str, false);
	$html = "";
	$w = preg_replace('/(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)/','https://www.dailymotion.com/embed/video/$2?autoplay=1',$str);
	$wnoplay = preg_replace('/(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)/','https://www.dailymotion.com/embed/video/$2',$str);
	$xx = p2l(pmini($str));
	$html .= '<span class="deletable deletable-block" data-type="dailymotion" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-srcnoplay="'.$wnoplay.'" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframeNoPlay(this)"/>';
	$html .= '</div></div></span>';
	return $html;
}

function process_vimeo($str) {
	gen_miniature($str, false);
	$html = "";
	$vid = preg_replace('/(https?:\/\/vimeo.com\/)([^\s]+\/)?([0-9]+)$/','$3',$str);
	$w = 'https://player.vimeo.com/video/'.$vid.'?autoplay=1';
	$wnoplay = 'https://player.vimeo.com/video/'.$vid;
	$xx = p2l(pmini($str));
	$html .= '<span class="deletable deletable-block" data-type="vimeo" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-srcnoplay="'.$wnoplay.'" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframeNoPlay(this)"/>';
	$html .= '</div></div></span>';
	return $html;
}

function process_youtube2($str) {
	gen_miniature($str, false);
	$html = "";
	$v = preg_replace('/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/','$2',$str);
	$w = 'https://www.youtube.com/embed/'.$v.'?autoplay=1&controls=2&wmode=opaque';
	$wnoplay = 'https://www.youtube.com/embed/'.$v.'?controls=2&wmode=opaque';
	$xx = p2l(pmini($str));
	$html .= '<span class="deletable deletable-block" data-type="youtube2" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-src="'.$wnoplay.'" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframeNoPlay(this)"/>';
	$html .= '</div></div></span>';
	return $html;
}

function process_youtube($str) {
	gen_miniature($str, false);
	$html = "";
	$v = preg_replace('/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/','$4',$str);
	$w = 'https://www.youtube.com/embed/'.$v.'?autoplay=1&controls=2&wmode=opaque';
	$wnoplay = 'https://www.youtube.com/embed/'.$v.'?controls=2&wmode=opaque';
	$xx = p2l(pmini($str));
	$html .= '<span class="deletable deletable-block" data-type="youtube" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-srcnoplay="'.$wnoplay.'" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframeNoPlay(this)"/>';
	$html .= '</div></div></span>';
	return $html;
}

function process_video($str,$debug) {
	if($debug) {
		var_dump($str);
	}
	// change gifv into webm
	$str = preg_replace("/\.gifv/",".webm",$str);
	gen_miniature($str, false);
	$html = "";
	$xx = p2l(pmini($str));
	$html = "";
	$html .= '<span class="deletable deletable-block" data-type="video" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div onclick="loadVideo(this)" data-src="'.$str.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadVideo(this)"/>';
	$html .= '</div></span>';
	return $html;
}

function process_image($str) {
	gen_miniature($str, false);
	if(file_exists(ppi($str))) {
		$postImage = p2l(ppi($str));
	} else {
		$postImage = $str;
	}
	$html = "";
	$html .= '<span class="deletable deletable-block" data-type="image" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" data-postimage="'.$postImage.'" data-lightbox="'.$str.'" src="'.$postImage.'"/>';
	$html .= '</span>';
	return $html;
}

function process_gif($str) {
	// isAnimated is too long...
	//if(true || !isAnimated($str)) {
	//	$html = process_image($str);
	//} else {
		gen_miniature($str, false);
		$xx = p2l(pmini($str));
		$html = "";
		$html .= '<span class="deletable deletable-block" data-type="gif" data-txt="'.$str.'" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
		$html .= '<div onclick="loadImage(this)" data-src="'.$str.'" class="launcher">';
		$html .= '<img class="inlineImage" src="'.$xx.'" onerror="loadImage(this)"/>';
		$html .= '</div></span>';
	//}
	return $html;
}

function process_albumImage($str) {
	gen_miniature($str, false);
	$fileId = preg_replace('/\{\:([a-zA-Z0-9]+)\:\}/','$1',$str);
	$file = file_load(array('fileId' => $fileId));	
	$uid = $_SESSION['uid'];
	$w = file_getWidth($file);
	$h = file_getHeight($file);
	if($file) {
		$html = "";
		$html .= '<span data-filetype="'.$file['type'].'" data-owner="'.$file['owner'].'" class="deletable flexible-image" data-width="'.$w.'" data-height="'.$h.'" data-type="file" data-txt="'.$str.'" data-src="'.p2l(file_getPath($file)).'" data-fileid="'.$file['fileId'].'" style="width:'.intval($w*130/$h).'px" contenteditable="false" id="'.$file['fileId'].'">';
		if($uid == (String) $file['owner']) {
			$html .= file_albumImage($file);
		} else {
			$html .= file_albumImage($file);
		}
		$html .= '</span>';
		return $html;
	} else {
		return " ";
	}
}

function process_file($str) {
	gen_miniature($str, false);
	$fileId = preg_replace('/\{\:([a-zA-Z0-9]+)\:\}/','$1',$str);
	$file = file_load(array('fileId' => $fileId));	
	$uid = $_SESSION['uid'];
	if($file) {
		$html = "";
		$html .= '<span data-filetype="'.$file['type'].'" data-owner="'.$file['owner'].'" class="deletable deletable-block" data-width="'.$w.'" data-height="'.$h.'" data-type="file" data-txt="'.$str.'" data-src="'.p2l(file_getPath($file)).'" data-fileid="'.$file['fileId'].'" contenteditable="false" id="'.$file['fileId'].'">';
		$html .= file_print($file);
		$html .= '</span>';
		return $html;
	} else {
		return " ";
	}
}

function handleLink($url) {

	// generate_miniature
	gen_miniature($url);

	// First we check if the preview doesn't exist (to be as fast as possible)	
	$p = preview_load(array('url' => $url));
	if($p != null) {
		$ret = $p;
		return $ret;
	}
	
	$ret = preview($url);

	return $ret;
}
	
?>
