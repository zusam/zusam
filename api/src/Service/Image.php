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
