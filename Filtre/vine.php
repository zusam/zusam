<?php

function vine($url) {

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
	$thumbnail = $matches[1]; 
	
	if(!file_exists(pathTo($url, "mini", "jpg"))) {
		$tmp = file_get_contents($thumbnail);
		file_put_contents(pathTo($url,"tmp"), $tmp);
		if(file_exists(pathTo($url, "tmp"))) {
			$file = pathTo($url, "tmp");
			$ret = create_post_preview($url, $file);
			unlink(pathTo($url, "tmp"));
			return $ret;
		} else {
			return false;
		}
	}
	return true;
}
?>
