<?php

namespace App\Controller;

use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class Info extends ApiController
{
    /**
     * @Route("/info", methods={"GET"})
     *
     * @OA\Response(
     *  response=200,
     *  description="Get informations about the API",
     * )
     */
    public function index(): Response
    {
        // check if ghostscript is found
        $has_ghostscript = false;
        if (is_executable(realpath($this->getParameter('binaries.ghostscript')))) {
            $has_ghostscript = true;
        }

        // check if ffmpeg is found
        $has_ffmpeg = false;
        if (is_executable(realpath($this->getParameter('binaries.ffmpeg')))) {
            $has_ffmpeg = true;
        }

        // check if imagick is enabled
        $has_imagick = false;
        if (extension_loaded('imagick')) {
            $has_imagick = true;
        }

        return new JsonResponse([
          'version' => $this->getParameter('version'),
          'upload' => [
            'image' => 'true' == $this->getParameter('allow.upload.image') && $has_imagick,
            'video' => 'true' == $this->getParameter('allow.upload.video') && $has_ffmpeg,
            'pdf' => 'true' == $this->getParameter('allow.upload.pdf') && $has_ghostscript,
          ],
          'default_lang' => $this->getParameter('lang'),
          'allow_email' => 'true' == $this->getParameter('allow.email'),
        ], JsonResponse::HTTP_OK);
    }
}
