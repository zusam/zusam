<?php
		
chdir(realpath(dirname(__FILE__)."/../"));
require_once('Include.php');

function get_mini_from_link($url, $link) {
	if(!file_exists(pmini($url))) {
		$tmp = fgc($link);
		file_put_contents(pathTo2(array("url"=>$url,"param"=>"tmp")), $tmp);
		if(file_exists(pathTo2(array("url"=>$url, "param"=>"tmp")))) {
			$file = pathTo2(array("url"=>$url, "param"=>"tmp"));
			$ret = create_post_miniature($url, $file);
			unlink($file);
			return $ret;
		} else {
			return false;
		}
	}
	return pmini($url);
}

function create_post_miniature($url, $file) {
	if($file != null) {
		$source = $file;
	} else {
		$source = $url;
	}
	if(!file_exists(ppi($url))) {
		if(exif_imagetype($source) != IMAGETYPE_GIF) {
			//if(getFileSize($source) > 1024*700) { // > 700K
				createPostImage($source, ppi($url), 600, 6000, 70);  
			//}
		}
	}
	if(!file_exists(pmini($url))) {
		if(exif_imagetype($source) != IMAGETYPE_GIF) {
			//createPreview(320, $source, pmini($url), 9/16, 70);
			createMini($source, pmini($url));
		} else {
			gifPreview(320, $source, pmini($url), 9/16, 70);
		}
	}
	if(file_exists(pmini($url))) {
		return pmini($url);
	} else {
		return false;
	}
}

function filtre($url, $debug) {
	
	if(!isset($debug)) {
		$debug = false;
	}
	
	$regex = $GLOBALS['regex'];

	// FILE //
	if(preg_match(r2ep($regex['file']),$url)==1) {
		$link = preg_replace("/(\{\:)([A-Za-z0-9]+)(\:\})/","$2",$url);
		$file = file_load(array("fileId" => $link));
		if($file['type'] == "jpg") {
			$ret = create_post_miniature($link, pathTo2(array('url' => $link, 'ext' => 'jpg', 'param' => 'file')));
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

	// GFYCAT //
	if(preg_match(r2ep($regex['gfycat']),$url)==1) {
		$str = preg_replace("/(.*)\?.*$/",'$1',$url);
		$id = preg_replace("/.*\/([a-zA-Z]+)$/","$1",$str);
		$link = "https://thumbs.gfycat.com/".$id."-mobile.jpg";
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// FACEBOOK VIDEO //
	if(preg_match(r2ep($regex['facebook_video']),$url)==1) {
		$vid = preg_replace("/.*videos\/([0-9]+).*/","$1",$url);
		$link = "http://graph.facebook.com/".$vid."/picture";
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// GOOGLE DRIVE //
	if(preg_match(r2ep($regex['googleDrive']),$url)==1) {
		return pathTo2(array("url"=>"googleDrive","param"=>"static_mini","ext"=>"jpg"));
	}
	
	// ONEDRIVE //
	//if(preg_match(r2ep($regex['onedrive']),$url)==1) {
	//	return pathTo2(array("url"=>"onedrive","param"=>"static_mini","ext"=>"jpg"));
	//}

	// YOUTUBE //
	if(preg_match(r2ep($regex['youtube']),$url)==1) {
		$link = preg_replace("/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/","http://img.youtube.com/vi/$4/0.jpg",$url);
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// YOUTUBE2 //
	if(preg_match(r2ep($regex['youtube2']),$url)==1) {
		$link = preg_replace("/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/","http://img.youtube.com/vi/$2/0.jpg",$url);
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// VIMEO //
	if(preg_match(r2ep($regex['vimeo']),$url)==1) {
		$id = preg_replace("/(https?:\/\/vimeo.com\/)([^\s]+\/)?([0-9]+)$/","$3",$url);
		$hash = unserialize(file_get_contents("http://vimeo.com/api/v2/video/$id.php"));
		$link = $hash[0]['thumbnail_large'];  
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// DAILYMOTION //
	if(preg_match(r2ep($regex['dailymotion']),$url)==1) {
		$link = preg_replace("/(http:\/\/www\.dailymotion\.com\/video\/)([0-9a-zA-Z]+)([^\s]*)/","http://www.dailymotion.com/thumbnail/video/$2",$url);
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// VINE //
	if(preg_match(r2ep($regex['vine']),$url)==1) {
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
	if(preg_match(r2ep($regex['soundcloud']),$url)==1) {
		$track_url = $url;
		$client_id = '01af1b3315ad8177aefecab596621e09';
		$client_secret = 'f41efa7352f151e040d01a55c8c29b75';
		$embed_info = json_decode(fgc("https://api.soundcloud.com/resolve?url=".$track_url."&client_id=".$client_id));
		$link = preg_replace("/large/","t500x500",$embed_info->artwork_url);
		if($link == "") {
			$user = $embed_info->user;
			$link = preg_replace("/large/","t500x500",$user->avatar_url);
		}
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// WEB IMAGE & GIF //
	if(preg_match(r2ep($regex['image']),$url)==1 || preg_match(r2ep($regex['gif']),$url)==1) {
		//$ret = create_post_miniature($url);
		$ret = get_mini_from_link($url, $url);
		return $ret;
	}

	// WEB VIDEO //
	if(preg_match(r2ep($regex['video']),$url)==1) {
		if(preg_match("/\.gifv/",$url)==1) {
			$url = preg_replace("/\.gifv/",".webm",$url);
		}
		$ret = web_video($url);
		return $ret;
	}

	// IF ALL ELSE FAILS //
	// OPEN GRAPH //
	if(preg_match(r2ep($regex['link']),$url)==1) {
		$prev = json_decode(preview($url), true);
		$link = $prev['image']['url'];
		$ret = get_mini_from_link($url, $link);
		return $ret;
	}

	// fail
	return false;
}
?>
