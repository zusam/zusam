<?php
		
chdir(realpath(dirname(__FILE__)."/../"));
require_once('Filtre/web_image.php');
require_once('Filtre/web_video.php');
require_once('Filtre/preview.php');
require_once('Filtre/soundcloud.php');
require_once('Core/Location.php');
require_once('Core/File.php');
require_once('Core/Utils.php');

function get_mini_from_link($url, $link) {
	if(!file_exists(pathTo($url, "mini", "jpg"))) {
		$tmp = fgc($link);
		file_put_contents(pathTo($url,"tmp"), $tmp);
		if(file_exists(pathTo($url, "tmp"))) {
			$file = pathTo($url, "tmp");
			$ret = create_post_preview($url, $file);
			return $ret;
		} else {
			return false;
		}
	}
	return pathTo($url, "mini", "jpg");
}


function filtre($url) {

	// FILE //
	if(preg_match("/(\{\:)([A-Za-z0-9]+)(\:\})/",$url)==1) {
		$link = preg_replace("/(\{\:)([A-Za-z0-9]+)(\:\})/","$2",$url);
		$file = file_load(array("fileId" => $link));
		if($file['type'] == "jpg") {
			$ret = create_post_preview($link, pathTo2(array('url' => $link, 'ext' => 'jpg', 'param' => 'file')));
		}
		if($file['type'] == "webm") {
			$ret = videoThumbnail(
					pathTo2(array('url' => $file['location'], 'ext' => 'webm', 'param' => 'file')), 
					pathTo2(array('url' => $link, 'ext' => 'jpg', 'param' => 'mini'))
				);
			if($ret) {
				$ret = pathTo2(array('url' => $link, 'ext' => 'jpg', 'param' => 'mini'));
			}
		}
		return $ret;
	}

	// YOUTUBE //
	if(preg_match("/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([a-zA-Z0-9\-\_]+)(.*)/",$url)==1) {
		$link = preg_replace("/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/","http://img.youtube.com/vi/$4/0.jpg",$url);
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// YOUTUBE2 //
	if(preg_match("/https?:\/\/youtu\.be\/[\w\/=?~.%&+\-#]+$/",$url)==1) {
		$link = preg_replace("/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/","http://img.youtube.com/vi/$2/0.jpg",$url);
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// VIMEO //
	if(preg_match("/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/",$url)==1) {
		$id = preg_replace("/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/","$3",$url);
		$hash = unserialize(file_get_contents("http://vimeo.com/api/v2/video/$id.php"));
		$link = $hash[0]['thumbnail_large'];  
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// DAILYMOTION //
	if(preg_match("/(http:\/\/www.dailymotion.com\/video\/)([0-9a-zA-Z]+)([^\s]+)/",$url)==1) {
		$link = preg_replace("/(http:\/\/www\.dailymotion\.com\/video\/)([0-9a-zA-Z]+)([^\s]*)/","http://www.dailymotion.com/thumbnail/video/$2",$url);
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// VINE //
	if(preg_match("/(https?:\/\/vine.co\/v\/[a-zA-Z0-9]+\/?)/",$url)==1) {
		$id = preg_replace("/(https?:\/\/vine.co\/v\/)([a-zA-Z0-9]*)(\/?)/","$2",$url);
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_ENCODING, "");
		curl_setopt($ch, CURLOPT_USERAGENT, "nibou");
		curl_setopt($ch, CURLOPT_AUTOREFERER, true);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
		curl_setopt($ch, CURLOPT_TIMEOUT, 5);
		curl_setopt($ch, CURLOPT_MAXREDIR, 10);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$vine = curl_exec($ch);
		curl_close($ch);
		preg_match('/property="og:image" content="(.*?)"/', $vine, $matches);
		$link = $matches[1]; 
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// SOUNDCLOUD //
	if(preg_match("/(https?:\/\/soundcloud.com\/)([\w\-]+)\/([\w\-]+)(\/[\w\-]+)?/",$url)==1) {
		$track_url = $url;
		$client = new Services_Soundcloud('01af1b3315ad8177aefecab596621e09', 'f41efa7352f151e040d01a55c8c29b75');
		$client->setCurlOptions(array(CURLOPT_FOLLOWLOCATION => 1));
		$embed_info = json_decode($client->get('resolve', array('url' => $track_url)));
		$link = preg_replace("/large/","t500x500",$embed_info->artwork_url);
		if($link == "") {
			$user = $embed_info->user;
			$link = preg_replace("/large/","t500x500",$user->avatar_url);
		}
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// WEB IMAGE //
	if(preg_match("/(https?:\/\/.+)(\.bmp|\.jpeg|\.jpg|\.png)(.*)/i",$url)==1) {
		$ret = create_post_preview($url);
		return $ret;
	}

	// handled as an image for now
	// WEB GIF //
	if(preg_match("/(https?:\/\/.+)(\.gif)(.*)/i",$url)==1) {
		$ret = create_post_preview($url);
		return $ret;
	}

	// WEB VIDEO //
	if(preg_match("/(https?:\/\/.+)(\.webm|\.mp4)(.*)/i",$url)==1) {
		$ret = web_video($url);
		return $ret;
	}

	// IF ALL ELSE FAILS //
	// GENERAL LINKS & OPEN GRAPH //
	if(preg_match("/https?:\/\/[\w\/=?~.%&+\-#]+/",$url)==1) {
		// verify that it's not an image (even if it doesn't have a image extension)
		$r = getimagesize($url);
		if($r != false) {
			if($r['mime'] == 'image/jpeg' || $r['mime'] == 'image/png' || $r['mime'] == 'image/bmp') {
				$ret = create_post_preview($url);
				return $ret;
			}
		} 
		// open graph
		$prev = json_decode(preview_v2($url), true);
		$link = $prev['image']['url'];
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// fail
	return false;
}
?>
