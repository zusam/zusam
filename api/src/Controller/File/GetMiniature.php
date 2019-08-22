<?php
namespace App\Controller\File;

use App\Controller\ApiController;
use App\Entity\File;
use App\Service\Image as ImageService;
use App\Service\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Routing\Annotation\Route;

class GetMiniature extends ApiController
{
    /**
     * @Route("/images/{type}/{width}/{height}/{id}", methods={"GET", "HEAD"})
     */
    public function index(
        string $id,
        int $width,
        int $height,
        string $type,
        ImageService $imageService
    ): Response
    {
        $filesDir = realpath($this->getParameter("dir.files"));
        $cacheDir = realpath($this->getParameter("dir.cache"));
        if (!$cacheDir) {
            mkdir($this->getParameter("dir.cache"));
            $cacheDir = realpath($this->getParameter("dir.cache"));
        }
        if (!file_exists($cacheDir."/images")) {
            mkdir($cacheDir."/images");
        }
        $cacheFile = $cacheDir."/images/".Uuid::uuidv4($id.$width."x".$height.$type).".jpg";
        if (is_readable($cacheFile)) {
            $response = new BinaryFileResponse($cacheFile, 200, ["Content-Type" => mime_content_type($cacheFile)]);
            $response->setCache(array(
                "etag"          => md5($cacheFile),
                "max_age"       => 0,
                "s_maxage"      => 3600,
                "public"        => true,
            ));
            return $response;
        }
        $sourceFile = $this->getDoctrine()->getRepository(File::class)->findOneById($id);
        if (empty($sourceFile)) {
            return new JsonResponse(["message" => "Not Found"], JsonResponse::HTTP_NOT_FOUND);
        }
        $sourceFilePath = $filesDir."/".$sourceFile->getContentUrl();
        if (is_readable($sourceFilePath)) {
            if ("thumbnail" === $type) {
                $imageService->createThumbnail($sourceFilePath, $cacheFile, $width, $height);
            }
            if ("crop" === $type) {
                $imageService->createThumbnail($sourceFilePath, $cacheFile, $width, $height, false);
            }
        }
        if (is_readable($cacheFile)) {
            $response = new BinaryFileResponse($cacheFile, 200, ["Content-Type" => mime_content_type($cacheFile)]);
            $response->setCache(array(
                "etag"          => md5($cacheFile),
                "max_age"       => 0,
                "s_maxage"      => 3600,
                "public"        => true,
            ));
            return $response;
        }
        return new JsonResponse(["message" => "Not Found"], JsonResponse::HTTP_NOT_FOUND);
    }
}
