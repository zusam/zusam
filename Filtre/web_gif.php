<?php

//TODO remove file
// TODO this is not used anymore
//function web_gif($url, $file) {
//
//
//	if($file == null) {
//		$source = $url;
//	} else {
//		$source = $file;
//	}
//
//	if(file_exists(pathTo($url, "original", "webm"))) {
//		return true;
//	} else {
//		$tmp = file_get_contents($source);
//		file_put_contents(pathTo($url,"tmp"), $tmp);
//		if(file_exists(pathTo($url, "tmp"))) {
//			$file = pathTo($url, "tmp");
//			if(!isAnimated($file)) {
//				$path = web_image($url, $file);
//				unlink(pathTo($url, "tmp"));
//			} else {
//
//
//				// GENERATION
//				$source = pathTo($url, "tmp");
//
//				$ret = web_image($url, $source); 
//				if(!$ret) {
//					return false;
//				}
//				if(file_exists(pathTo($url, "original", "webm"))) {
//					$path = pathTo($url, "original", "webm");
//				} else {
//					gif2webm($source, pathTo($url, "original", "webm"));
//				}
//				if(file_exists(pathTo($url, "original", "webm"))) {
//					$source = pathTo($url, "original", "webm");
//				}
//				if(file_exists(pathTo($url, "original", "mp4"))) {
//					$path = pathTo($url, "original", "mp4");
//				} else {
//					webm2mp4($source, pathTo($url, "original", "mp4"));
//				}
//
//				unlink(pathTo($url, "tmp"));
//
//				// RETURN
//				if(file_exists(pathTo($url, "original", "webm"))) {
//					return true;
//				}
//			}
//		} else {
//			return false;
//		}
//	}
//}
