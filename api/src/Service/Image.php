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
        try {
            $im = $this->loadImage($input);
        } catch (\Exception $e) {
            return;
        }
        if (!$im) {
            return;
        }

        if ($respectFormat) {
            $im->resizeImage(
                min($im->getImageWidth(), $w),
                min($im->getImageHeight(), $h),
                \Imagick::FILTER_LANCZOS,
                1,
                true
            );
        } else {
            $im->cropThumbnailImage(
                min($im->getImageWidth(), $w),
                min($im->getImageHeight(), $h)
            );
        }
        
        $this->saveImage($im, $output);
        $im->destroy();
    }

    private function loadImage(string $input): ?\Imagick
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
            }
            $im->readImageBlob(file_get_contents($input));
            return $im;
        } catch(\Exception $e) {
            throw new \Exception("Could not read input image: " + $e->getMessage());
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
