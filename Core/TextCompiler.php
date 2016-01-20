<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/File.php');

function compileText($text) {

	$str = $text;

	$str = preg_replace_callback('/(https?:\/\/soundcloud.com\/)([^\s]+)/i','callback_soundcloud',$str);
	$str = preg_replace_callback('/(https?:\/\/vine.co\/v\/)([\w\-]+)/i','callback_vine',$str);
	$str = preg_replace_callback('/(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)/i','callback_dailymotion',$str);
	$str = preg_replace_callback('/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/','callback_vimeo',$str);
	$str = preg_replace_callback('/https?:\/\/youtu\.be\/[\w\/=?~.%&+\-#]+/i','callback_youtube2',$str);
	$str = preg_replace_callback('/https?:\/\/(www|m)\.youtube\.com\/watch[\w\/=?~.%&+\-#]+/i','callback_youtube',$str);
	$str = preg_replace_callback('/https?:\/\/[^\s]+(\.mp4|\.webm)(\?\w*)?/i','callback_video',$str);
	$str = preg_replace_callback('/https?:\/\/[\w\/=?~.%&+\-#\!\']+(\.jpg|\.bmp|\.jpeg|\.png)(\?[\w\/=?~.%&+\-#\!\']+)?/i','callback_image',$str);
	$str = preg_replace_callback('/https?:\/\/[\w\/=?~.%&+\-#\!\']+(\.gif)(\?[\w\/=?~.%&+\-#\!\']+)?/i','callback_gif',$str);
	$str = preg_replace_callback('/\{\:[a-zA-Z0-9]+\:\}/i','callback_file',$str);

	$str = '<div>'.$str.'</div>';
	$str = preg_replace('/\<div\>\s*\<\/div\>/','',$str);

	return $str;
}

function callback_soundcloud($match) {
	$str = $match[0];
	$xx = p2l(pmini($str));
	$code = "";
	$code .= '<div class="embed-responsive embed-responsive-16by9">';
	$code .= '<div onclick="loadIframe(this)" class="launcher">';
	$code .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$code .= '</div></div>';
	$html = '
		<span class="deletable" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">
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
	return '</div>'.$html.'<div>';
}

function callback_vine($match) {
	$str = $match[0];
	$html = "";
	$w .= preg_replace('/(https?:\/\/vine.co\/v\/)([\w\-]+)/','$1$2/embed/simple',$str);
	$html .= '<span class="deletable" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-square">';
	$html .= '<iframe seamless class="embed-responsive-item" src="'.$w.'" frameborder="0"></iframe>';
	$html .= '<script async src="//platform.vine.co/static/scripts/embed.js charset="utf-8"></script>';
	$html .= '</span>';
	//return $html;
	return '</div>'.$html.'<div>';
}

function callback_dailymotion($match) {
	$str = $match[0];
	$html = "";
	$w = preg_replace('/(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)/','http://www.dailymotion.com/embed/video/$2?autoplay=1',$str);
	$xx = p2l(pmini($str));
	$html .= '<span class="deletable" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$html .= '</div></div></span>';
	//return $html;
	return '</div>'.$html.'<div>';
}

function callback_vimeo($match) {
	$str = $match[0];
	$html = "";
	$w = preg_replace('/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/','http://player.vimeo.com/video/$3?autoplay=1',$str);
	$xx = p2l(pmini($str));
	$html .= '<span class="deletable" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$html .= '</div></div></span>';
	//return $html;
	return '</div>'.$html.'<div>';
}

function callback_youtube2($match) {
	$str = $match[0];
	$html = "";
	$v = preg_replace('/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/','$2',$str);
	$w = 'http://www.youtube.com/embed/'.$v.'?autoplay=1&controls=2&wmode=opaque';
	$xx = p2l(pmini($str));
	$html .= '<span class="deletable" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$html .= '</div></div></span>';
	//return $html;
	return '</div>'.$html.'<div>';
}

function callback_youtube($match) {
	$str = $match[0];
	$html = "";
	$v = preg_replace('/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/','$4',$str);
	$w = 'http://www.youtube.com/embed/'.$v.'?autoplay=1&controls=2&wmode=opaque';
	$xx = p2l(pmini($str));
	$html .= '<span class="deletable" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div class="embed-responsive embed-responsive-16by9">';
	$html .= '<div onclick="loadIframe(this)" data-src="'.$w.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadIframe(this)"/>';
	$html .= '</div></div></span>';
	//return $html;
	return '</div>'.$html.'<div>';
}

function callback_video($match) {
	$str = $match[0];
	$xx = p2l(pmini($str));
	$html = "";
	$html .= '<span class="deletable" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div onclick="loadVideo(this)" data-src="'.$str.'" class="launcher">';
	$html .= '<img src="'.$xx.'" onerror="loadVideo(this)"/>';
	$html .= '</div></span>';
	//return $html;
	return '</div>'.$html.'<div>';
}

function callback_image($match) {
	$str = $match[0];
	$html = "";
	$html .= '<span class="deletable" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'.$str.'"/>';
	$html .= '</span>';
	//return $html;
	return '</div>'.$html.'<div>';
}

function callback_gif($match) {
	$str = $match[0];
	$xx = p2l(pmini($str));
	$html = "";
	$html .= '<span class="deletable" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
	$html .= '<div onclick="loadImage(this)" data-src="'.$str.'" class="launcher">';
	$html .= '<img class="inlineImage" src="'.$xx.'" onerror="return false; loadImage(this)"/>';
	$html .= '</div></span>';
	//return $html;
	return '</div>'.$html.'<div>';
}

function callback_file($match) {
	$str = $match[0];
	$fileId = preg_replace('/\{\:([a-zA-Z0-9]+)\:\}/','$1',$str);
	$file = file_load(array('fileId' => $fileId));	
	$uid = $_SESSION['uid'];
	if($file) {
		$html = "";
		$html .= '<span uid="'.$uid.'" owner="'.$file['owner'].'" class="deletable" data-src="'.$str.'" contenteditable="false" id="'.md5($str).'">';
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
		//return $html;
		return '</div>'.$html.'<div>';
	} else {
		return "";
	}
}

?>
