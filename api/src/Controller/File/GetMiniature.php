<?php

namespace App\Controller\File;

use App\Controller\ApiController;
use App\Entity\File;
use App\Service\Image as ImageService;
use App\Service\Uuid;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\Cache;
use Symfony\Component\Routing\Annotation\Route;

class GetMiniature extends ApiController
{
    /**
     * @OA\Response(
     *  response=200,
     *  description="Get a miniature of a file",
     *
     *  @OA\Schema(
     *    type="binary",
     *  )
     * )
     *
     * @OA\Tag(name="file")
     *
     * @Security(name="api_key")
     */
    #[Cache(public: true, maxage: 31536000)]
    #[Route("/images/{type}/{width}/{height}/{id}", methods: ["GET"])]
    public function index(
        string $id,
        int $width,
        int $height,
        string $type,
        ImageService $imageService
    ): Response {
        $filesDir = realpath($this->getParameter('dir.files'));
        $cacheDir = realpath($this->getParameter('dir.cache'));
        if (!$cacheDir) {
            mkdir($this->getParameter('dir.cache'));
            $cacheDir = realpath($this->getParameter('dir.cache'));
        }
        if (!file_exists($cacheDir.'/images')) {
            mkdir($cacheDir.'/images');
        }
        $cacheFile = $cacheDir.'/images/'.Uuid::uuidv4($id.$width.'x'.$height.$type).'.jpg';
        if (is_readable($cacheFile)) {
            return new BinaryFileResponse($cacheFile, 200, ['Content-Type' => mime_content_type($cacheFile)]);
        }
        $sourceFile = $this->em->getRepository(File::class)->findOneBy(['id' => $id]);
        if (empty($sourceFile)) {
            return new JsonResponse(['message' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }
        $sourceFilePath = $filesDir.'/'.$sourceFile->getContentUrl();
        if (is_readable($sourceFilePath)) {
            if ('thumbnail' === $type) {
                $imageService->createThumbnail($sourceFilePath, $cacheFile, $width, $height);
            }
            if ('crop' === $type) {
                $imageService->createThumbnail($sourceFilePath, $cacheFile, $width, $height, false);
            }
        }

        return new JsonResponse(['message' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
    }
}
