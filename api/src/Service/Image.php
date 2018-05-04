<?php

namespace App\Service;

class Image
{
    public static function createThumbnail(string $input, string $output, $w, $h, $respectFormat = true)
    {
        $im = self::loadImage($input);

        if ($respectFormat) {
            $im->thumbnailImage($w, $h, true);
        } else {
            $im->cropThumbnailImage($w, $h);
        }
        
        self::saveImage($im, $output);
        $im->destroy();
    }

    private static function getCacheId(string $input): string
    {
        return Uuid::uuidv4($input);
    }

    private static function loadImage(string $input): ?\Imagick
    {
        $im = new \Imagick();
        if (is_readable($input)) {
            if ($im->readImage($input)) {
                return $im;
            }
        }
        throw new \Exception("Could not read input image");
    }

    private static function saveImage(\Imagick $im, string $output)
    {
        // https://developers.google.com/speed/docs/insights/OptimizeImages
        $im->setImageFormat("jpeg");
        $im->stripImage();
        $im->setImageCompression(\Imagick::COMPRESSION_JPEG);
        $im->setImageCompressionQuality(85);
        $im->setSamplingFactors(["2x2", "1x1", "1x1"]);
        $im->setImageColorspace(\Imagick::COLORSPACE_RGB);
        $im->setInterlaceScheme(\Imagick::INTERLACE_JPEG);
        // set the image background to white by default
        $im->setImageBackgroundColor(new \ImagickPixel("white"));
        if (!$im->writeImage($output)) {
            throw new \Exception("Could not save output image");
        }
    }
}

function createPostImage($from, $to, $w, $max_height, $q) {
    if($q == null) {
        $q = 90;
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
    $final_height = min($new_height, $max_height); 

    $im->thumbnailImage($new_width, $new_height);
    $im->cropImage($new_width, $final_height, 0, 0);
    $im->setImageFormat("jpeg");
    $im->stripImage();
    $im->setImageCompression(Imagick::COMPRESSION_JPEG);
    $im->setImageCompressionQuality($q);
    try {
        $im->writeImage($to);
    } catch (\Exception $e) {
        $im->destroy();
        return false;
    }
    $im->destroy();

    return file_exists($to);
}


