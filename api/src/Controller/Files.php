<?php
namespace App\Controller;

use App\Service\Image;
use App\Service\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Routing\Annotation\Route;

class Files extends Controller
{
    /**
     * @Route("/images/{type}/{width}/{height}/{id}.jpg", name="images")
     */
    public function image(string $id, int $width, int $height, string $type)
    {
        $publicDir = realpath($this->getParameter("kernel.project_dir")."/../public/");
        $cacheDir = realpath($this->getParameter("kernel.project_dir")."/var/cache/");
        $cacheFile = $cacheDir."/images/".Uuid::uuidv4($id.$width."x".$height.$type).".jpg";
        if (is_readable($cacheFile)) {
            return new BinaryFileResponse($cacheFile, 200, ["Content-Type" => mime_content_type($cacheFile)]);
        }
        $sourceImage = $publicDir."/files/".$id.".jpg";
        if (is_readable($sourceImage)) {
            if ("thumbnail" === $type) {
                Image::createThumbnail($sourceImage, $cacheFile, $width, $height);
            }
            if ("crop" === $type) {
                Image::createThumbnail($sourceImage, $cacheFile, $width, $height, false);
            }
        }
        if (is_readable($cacheFile)) {
            return new BinaryFileResponse($cacheFile, 200, ["Content-Type" => mime_content_type($cacheFile)]);
        }
        return new JsonResponse(["message" => "Not Found"], JsonResponse::HTTP_NOT_FOUND);
    }
}
