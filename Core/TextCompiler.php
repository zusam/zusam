<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function compileText($text) {

	$r = $GLOBALS['regex'];

	$str = strip_tags($text);
	$str = " ".$str." ";
	
	// new lines tags
	$str = preg_replace("/\n/","<br>",$str);

	$str = encapsuleKnownLinks($str);
	
	// general link
	$str = preg_replace_callback(r2p($r['link']),'callback_link',$str);

	$str = decapsuleLinks($str);

	$str = preg_replace_callback(r2p($r['instagram']),'callback_instagram',$str);
	$str = preg_replace_callback(r2p($r['onedrive']),'callback_onedrive',$str);
	$str = preg_replace_callback(r2p($r['googleDrive']),'callback_googleDrive',$str);
	$str = preg_replace_callback(r2p($r['soundcloud']),'callback_soundcloud',$str);
	$str = preg_replace_callback(r2p($r['vine']),'callback_vine',$str);
	$str = preg_replace_callback(r2p($r['dailymotion']),'callback_dailymotion',$str);
	$str = preg_replace_callback(r2p($r['vimeo']),'callback_vimeo',$str);
	$str = preg_replace_callback(r2p($r['youtube2']),'callback_youtube2',$str);
	$str = preg_replace_callback(r2p($r['youtube']),'callback_youtube',$str);
	$str = preg_replace_callback(r2p($r['video']),'callback_video',$str);
	$str = preg_replace_callback(r2p($r['image']),'callback_image',$str);
	$str = preg_replace_callback(r2p($r['gif']),'callback_gif',$str);
	
	// files
	$str = preg_replace_callback(r2p($r['file']),'callback_file',$str);

	$str = ' <div>'.$str.'</div> ';
	$str = preg_replace('/\<div\>\s*\<\/div\>/','',$str);
	
	$str = trim($str);

	return $str;
}

function encapsuleKnownLinks($str) {
	
	$r = $GLOBALS['regex'];
	
	$str = preg_replace(r2ep($r['instagram']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['onedrive']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['googleDrive']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['soundcloud']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['vine']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['dailymotion']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['vimeo']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['youtube2']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['youtube']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['video']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['image']),'[[$1]]',$str);
	$str = preg_replace(r2ep($r['gif']),'[[$1]]',$str);

	return $str;
}

function decapsuleLinks($str) {
	$str = preg_replace('/\[\[([^\[\]]+)\]\]/',' $1 ',$str);
	return $str;
}

function prepareInput($match) {
	$str = $match[0];
	$str = trim($str);
	return $str;
}

function prepareOutput($str) {
	return ' </div>'.$str.'<div> ';
}

function callback_instagram($match) {
	$str = prepareInput($match);
		
		$data = fgc("https://api.instagram.com/oembed/?url=".$str);
		$data = json_decode($data,true);

		$b = '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
		$o = '<a class="mediaLink material-shadow" href="'.$str.'" target="_blank"><i class="fa fa-instagram"></i></a><img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'.$data['thumbnail_url'].'"/>';
		$a = '</span>';
		$output = $b.$o.$a;

	return prepareOutput($output);
}

function callback_onedrive($match) {
	$str = prepareInput($match);
	if(preg_match("/resid=/",$str)) {
		$resid = preg_replace("/(https?:\/\/onedrive.live.com\/).*resid=([\-\!\%\w]+).*/","$2",$str);
		$param = "resid=".$resid;
	} else {
		$resid = preg_replace("/(https?:\/\/onedrive.live.com\/).*id=([\-\!\%\w]+).*/","$2",$str);
		$cid = preg_replace("/(https?:\/\/onedrive.live.com\/).*cid=([\-\!\%\w]+).*/","$2",$str);
		$authkey = preg_replace("/(https?:\/\/onedrive.live.com\/).*authkey=([\-\!\%\w]+).*/","$2",$str);
		$param = "resid=".$resid."&cid=".$cid."&authkey=".$authkey;

	}
	if(preg_match("/^[\!\%\w]+$/",$resid)) {
		$b = '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
		$o = '<iframe width="320" height="180" seamless src="https://onedrive.live.com/embed?'.$param.'" frameborder="0"></iframe>';
		$a = '</span>';
		$output = $b.$o.$a;
	} else {
		$output = fail_request($str);
	}
	return prepareOutput($output);
}

function callback_googleDrive($match) {
	$str = prepareInput($match);
	
	if(preg_match("/open\?id=/",$str)) {
		$id = preg_replace("/(https?:\/\/drive.google.com\/open\?id=)(\w+)/","$2",$str);
	} else {
		$id = preg_replace("/(https?:\/\/drive.google.com\/file\/d\/)([\w]+)(\/)([^\s]+)/","$2",$str);
	}
	if(preg_match("/^\w+$/",$id)==1) {
		$b = '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
		$o = '<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="https://drive.google.com/file/d/'.$id.'/preview" frameborder="0"></iframe></div>';
		$a = '</span>';
		$output = $b.$o.$a;
	} else {
		$output = fail_request($str);
	}
	return prepareOutput($output);
}

function callback_link($match) {
	$str = prepareInput($match);

	// don't take encapsuled links into account : they will be interpreted later
	if(preg_match("/.*\]\]$/",$str)==1) {
		return $str;
	}

	$data = handleLink($str);
	if(isset($data['info']) && $data['info'] == "extensionless") {
		switch($data['type']) {
			case "image";
				$e = '<img class="zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'.$data['url'].'"/>';
				break;
			case "video";
				$e = '<video autoplay loop><source src="'.$str.'"></video>';
				break;
			default;
				$e = fail_request($str);
				break;
		}
	} else {
		$e = open_graph_build($data);
	}
	$html = "";
	$html .= '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= $e;
	$html .= '</span>';
	return prepareOutput($html);
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
		$description = '<div class="description">'.html_entity_decode($data['description']).'</div>';
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

function callback_soundcloud($match) {
	$str = prepareInput($match);
	$xx = p2l(pmini($str));
	gen_miniature($str);
	$code = "";
	$code .= '<div class="embed-responsive embed-responsive-16by9">';
	$code .= '<div onclick="loadIframe(this)" class="launcher">';
	$code .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$code .= '</div></div>';
	$html = '
		<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">
			<script>
				SC.oEmbed("'.$str.'", { auto_play: true }, function(oEmbed) {
					var song_url = oEmbed.html.replace(/.*src="([^"]+)".*/,"$1");
					var w = song_url.replace("/auto_play=false/","auto_play=true");
					var dropin = $(\''.$code.'\');
					dropin.find(".launcher").attr("data-src",w);
					$("#'.md5($str).'").html(dropin);
				});
			</script>
		</span>
	';
	return prepareOutput($html);
}

function callback_vine($match) {
	$str = prepareInput($match);
	$html = "";
	$w .= preg_replace('/(https?:\/\/vine.co\/v\/)([\w\-]+)/','$1$2/embed/simple',$str);
	$html .= '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-square">';
	$html .= '<iframe seamless class="embed-responsive-item" src="'.$w.'" frameborder="0"></iframe>';
	$html .= '<script async src="//platform.vine.co/static/scripts/embed.js charset="utf-8"></script>';
	$html .= '</span>';
	return prepareOutput($html);
}

function callback_dailymotion($match) {
	$str = prepareInput($match);
	$html = "";
	$w = preg_replace('/(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)/','http://www.dailymotion.com/embed/video/$2?autoplay=1',$str);
	$xx = p2l(pmini($str));
	gen_miniature($str);
	$html .= '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$html .= '</div></div></span>';
	return prepareOutput($html);
}

function callback_vimeo($match) {
	$str = prepareInput($match);
	$html = "";
	$w = preg_replace('/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/','http://player.vimeo.com/video/$3?autoplay=1',$str);
	$xx = p2l(pmini($str));
	gen_miniature($str);
	$html .= '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$html .= '</div></div></span>';
	return prepareOutput($html);
}

function callback_youtube2($match) {
	$str = prepareInput($match);
	$html = "";
	$v = preg_replace('/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/','$2',$str);
	$w = 'http://www.youtube.com/embed/'.$v.'?autoplay=1&controls=2&wmode=opaque';
	$xx = p2l(pmini($str));
	gen_miniature($str);
	$html .= '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$html .= '</div></div></span>';
	return prepareOutput($html);
}

function callback_youtube($match) {
	$str = prepareInput($match);
	$html = "";
	$v = preg_replace('/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/','$4',$str);
	$w = 'http://www.youtube.com/embed/'.$v.'?autoplay=1&controls=2&wmode=opaque';
	$xx = p2l(pmini($str));
	gen_miniature($str);
	$html .= '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$html .= '</div></div></span>';
	return prepareOutput($html);
}

function callback_video($match) {
	$str = prepareInput($match);
	// change gifv into webm
	$str = preg_replace("/\.gifv/",".webm",$str);
	$html = "";
	$xx = p2l(pmini($str));
	gen_miniature($str);
	$html = "";
	$html .= '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div onclick="loadVideo(this)" data-src="'.$str.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadVideo(this)"/>';
	$html .= '</div></span>';
	return prepareOutput($html);
}

function callback_image($match) {
	$str = prepareInput($match);
	$html = "";
	$html .= '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'.$str.'"/>';
	$html .= '</span>';
	return prepareOutput($html);
}

function callback_gif($match) {
	$str = prepareInput($match);
	$xx = p2l(pmini($str));
	gen_miniature($str);
	$html = "";
	$html .= '<span class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div onclick="loadImage(this)" data-src="'.$str.'" class="launcher">';
	$html .= '<img class="inlineImage" src="'.$xx.'" onerror="loadImage(this)"/>';
	$html .= '</div></span>';
	return prepareOutput($html);
}

function callback_file($match) {
	$str = prepareInput($match);
	gen_miniature($str);
	$fileId = preg_replace('/\{\:([a-zA-Z0-9]+)\:\}/','$1',$str);
	$file = file_load(array('fileId' => $fileId));	
	$uid = $_SESSION['uid'];
	if($file) {
		$html = "";
		$html .= '<span uid="'.$uid.'" owner="'.$file['owner'].'" class="deletable deletable-block" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
		if($uid == (String) $file['owner'] && $file['type'] == 'jpg') {
			$html .= '<div contenteditable="false">';
			$html .= file_print($file);
			$html .= '<button onclick="showimageeditor(\'#retoucheBox\', this)" contentditable="false" class="material-shadow editIMG">';
			$html .= '<i class="fa fa-pencil"></i>';
			$html .= '</button>';
			$html .= '</div>';
		} else {
			$html .= file_print($file);
		}
		$html .= '</span>';
		return prepareOutput($html);
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
