<?php
namespace App\Controller;

use App\Entity\File;
use App\Service\Image as ImageService;
use App\Service\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Routing\Annotation\Route;

class Files extends Controller
{
    /**
     * @Route("/images/{type}/{width}/{height}/{id}", name="images")
     */
    public function image(string $id, int $width, int $height, string $type, ImageService $imageService)
    {
        $publicDir = realpath($this->getParameter("dir.public"));
        $cacheDir = realpath($this->getParameter("dir.cache"));
        $cacheFile = $cacheDir."/images/".Uuid::uuidv4($id.$width."x".$height.$type).".jpg";
        if (is_readable($cacheFile)) {
            return new BinaryFileResponse($cacheFile, 200, ["Content-Type" => mime_content_type($cacheFile)]);
        }
        $sourceFile = $this->getDoctrine()->getRepository(File::class)->findOneById($id);
		if (empty($sourceFile)) {
			return new JsonResponse(["message" => "Not Found"], JsonResponse::HTTP_NOT_FOUND);
		}
        $sourceFilePath = $publicDir.$sourceFile->getPath();
        if (is_readable($sourceFilePath)) {
            if ("thumbnail" === $type) {
                $imageService->createThumbnail($sourceFilePath, $cacheFile, $width, $height);
            }
            if ("crop" === $type) {
                $imageService->createThumbnail($sourceFilePath, $cacheFile, $width, $height, false);
            }
        }
        if (is_readable($cacheFile)) {
            return new BinaryFileResponse($cacheFile, 200, ["Content-Type" => mime_content_type($cacheFile)]);
        }
        return new JsonResponse(["message" => "Not Found"], JsonResponse::HTTP_NOT_FOUND);
    }
}
