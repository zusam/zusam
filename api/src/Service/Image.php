<?php

namespace App\Service;

use FFMpeg\FFMpeg;
use FFMpeg\Media\Video;
use FFMpeg\Coordinate\TimeCode;

class Image
{
	private $ffmpegPath;
	private $ffprobePath;

	public function __construct($binaries) {
		$this->ffmpegPath = $binaries["ffmpeg"];
		$this->ffprobePath = $binaries["ffprobe"];
	}

    public function createThumbnail(string $input, string $output, $w, $h, $respectFormat = true): void
    {
        $im = new \Imagick();
        if ($respectFormat) {
            $im = $this->loadResizeImage($input, $w, $h);
        } else {
            $im = $this->load($input);
            $im->cropThumbnailImage(
                min($im->getImageWidth(), $w),
                min($im->getImageHeight(), $h)
            );
        }
        
        $this->saveImage($im, $output);
        $im->destroy();
    }
    
    private function loadResizeImage(string $input, int $w, int $h): ?\Imagick
    {
        $im = new \Imagick();
        try {
            if (is_readable($input)) {
                // https://secure.php.net/manual/en/imagick.setsize.php#110166
                $im->pingImage($input);
                if ($im->getImageWidth() > $w || $im->getImageHeight() > $h) {
                    $aspect_ratio = $im->getImageWidth()/$im->getImageHeight();
                    $width = min($w, $im->getImageWidth());
                    $height = min($h, floor($width / $aspect_ratio), $im->getImageHeight());
                    $width = floor($height * $aspect_ratio);
                    $im->setSize($width, $height);
                }

                if ($im->readImage($input)) {
                    return $im;
                }
            }
            throw new \Exception("Something went wrong while loading $input.");
        } catch(\Exception $e) {
            $im = $this->load($input);
            $im->resizeImage(
                min($im->getImageWidth(), $w),
                min($im->getImageHeight(), $h),
                \Imagick::FILTER_LANCZOS,
                1,
                true
            );
            return $im;
        }
    }

    private function load(string $input): ?\Imagick
    {
        $im = new \Imagick();
        try {
            if (is_readable($input)) {
                if (preg_match("/video/", mime_content_type($input))) {
                    $ffmpeg = FFMpeg::create([
						"ffmpeg.binaries" => $this->ffmpegPath,
						"ffprobe.binaries" => $this->ffprobePath
					]);
                    $video = $ffmpeg->open($input);
                    $frame = $video->frame(TimeCode::fromSeconds(0));
                    $tmpfname = tempnam(sys_get_temp_dir(), 'zusam_temp');
					$frame->save($tmpfname);
					$input = $tmpfname;
                }

                if ($im->readImage($input)) {
                    return $im;
                }
            } else {
                $client = new \GuzzleHttp\Client();
                $res = $client->request("GET", $input);
                if ($res->getStatusCode() == 200) {
                    if ($im->readImageBlob($res->getBody())) {
                        return $im;
                    }
                } else {
                    throw new \Exception("Guzzle got status " . $res->getStatusCode() . " while trying to retrieve $input.");
                }
            }
            throw new \Exception("Something went wrong while loading $input.");
        } catch(\Exception $e) {
            throw new \Exception("Could not load input image: " . $e->getMessage());
        }
    }

    private function saveImage(\Imagick $im, string $output)
    {
        // https://developers.google.com/speed/docs/insights/OptimizeImages
        $im->setImageFormat("jpeg");
        $im->stripImage();
        $im->setImageCompression(\Imagick::COMPRESSION_JPEG);
        $im->setImageCompressionQuality(85);
        $im->setSamplingFactors(["2x2", "1x1", "1x1"]);
        if ($im->getImageColorspace() == \Imagick::COLORSPACE_CMYK) {
            $im->transformimagecolorspace(\Imagick::COLORSPACE_SRGB);
        }
        $im->setInterlaceScheme(\Imagick::INTERLACE_JPEG);
        // set the image background to white by default
        $im->setImageBackgroundColor(new \ImagickPixel("white"));
        if (!$im->writeImage($output)) {
            throw new \Exception("Could not save output image");
        }
    }
}
