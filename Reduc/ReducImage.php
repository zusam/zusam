<?php
	function saveImage($from, $to, $w, $h, $q) {
		if($q == null) {
			$q = 100;
		}
		
		$im = new \Imagick();
		try {
			if(!$im->readImage($from)) {
				throw new Exception("");
			}
		} catch(Exception $e) {
			return false;
		}

		$width = $im->getImageWidth();
		$height = $im->getImageHeight();

		$hw = $height / $width;
		$wh = $width / $height;

		//then we shorten the image 
		$new_width = min($width, $w); 
		$new_height = $hw*$new_width; 
		$new_height = min($new_height, $h); 
		$new_width = $wh*$new_height; 

		$im->thumbnailImage($new_width, $new_height);
		$im->setImageFormat('jpeg');
		$im->stripImage();
		$im->setImageCompression(Imagick::COMPRESSION_JPEG);
		$im->setImageCompressionQuality($q);
		$im->writeImage($to);
		$im->destroy();

		return file_exists($to);
	}

	function rotateImage($location, $direction) {

		$im = new \Imagick();
		try {
			if(!$im->readImage(realpath($location))) {
				throw new Exception("");
			}
		} catch(Exception $e) {
			return false;
		}
		if($direction=="right") {
			$d = 90;
		} else {
			$d = -90;
		}
		$im->rotateImage(new ImagickPixel('#00000000'), $d);
		unlink(realpath($location));
		$im->writeImage($location);
	}

	function createPreview($new_width, $url, $to, $format, $quality) {
		
		if($quality == null) {
			$quality = 100;
		}

		$im = new \Imagick();
		try {
			if(!$im->readImage($url)) {
				throw new Exception("");
			}
		} catch(Exception $e) {
			return false;
		}

		$width = $im->getImageWidth();
		$height = $im->getImageHeight();

		if($width < $new_width) {
			$new_width = $width;
		}

		if($format == null) {
			$new_height = $height*$new_width/$width;
		} else {
			$new_height = $new_width*$format;
		}

		//could we make the snippet show a larger view ?
		if( $height/$new_height < $width/$new_width) {
			$dezoom = $height/$new_height;
		} else {
			$dezoom = $width/$new_width;
		}
		$starting_height = $dezoom*$new_height;
		$starting_width = $dezoom*$new_width;

		//we calculate the position of the snippet.
		$offset_width = 0;
		$offset_height = 0;
		if($starting_width < $width) {
			$offset_width = ($width - $starting_width) / 2;
		} else {
			$offset_width = 0;
		}
		if($starting_height < $height) {
			$offset_height = ($height - $starting_height) / 2;
		} else {
			$offset_height = 0;
		}
		$im->setImageBackgroundColor(new \ImagickPixel('white'));
		$im = $im->mergeImageLayers(\Imagick::LAYERMETHOD_FLATTEN);
		$im->cropImage($starting_width, $starting_height, $offset_width, $offset_height);
		$im->thumbnailImage($new_width, $new_height);
		$im->setImageFormat('jpeg');
		$im->stripImage();
		$im->setImageCompression(\Imagick::COMPRESSION_JPEG);
		$im->setImageCompressionQuality($quality);
		$ret = $im->writeImage($to);
		$im->destroy();

		return file_exists($to);

	}

	function gifPreview($new_width, $url, $to, $format, $quality) {
		//echo("gif preview");

		if($quality == null) {
			$quality = 100;
		}

    	$source = imagecreatefromgif($url);

		$width = imagesX($source);
		$height = imagesY($source);

		if($width < $new_width) {
			$new_width = $width;
		}

		if($format == null) {
			$new_height = $height*$new_width/$width;
		} else {
			$new_height = $new_width*$format;
		}

		//could we make the snippet show a larger view ?
		if( $height/$new_height < $width/$new_width) {
			$dezoom = $height/$new_height;
		} else {
			$dezoom = $width/$new_width;
		}
		$starting_height = $dezoom*$new_height;
		$starting_width = $dezoom*$new_width;

		//we calculate the position of the snippet.
		$offset_width = 0;
		$offset_height = 0;
		if($starting_width < $width) {
			$offset_width = ($width - $starting_width) / 2;
		} else {
			$offset_width = 0;
		}
		if($starting_height < $height) {
			$offset_height = ($height - $starting_height) / 2;
		} else {
			$offset_height = 0;
		}

		$img = imagecreatetruecolor($new_width, $new_height);
		imagecopyresampled($img, $source, 0, 0, $offset_width, $offset_height, $new_width,$new_height,$starting_width,$starting_height);
		imagejpeg($img, $to, $quality);
		imagedestroy($img);
		imagedestroy($source);

		return file_exists($to);
	}
?>
