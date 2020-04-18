<?php

namespace App\Controller;

use App\Controller\ApiController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Routing\Annotation\Route;

class Info extends ApiController
{
    /**
     * @Route("/info", methods={"GET", "HEAD"})
     */
    public function index(): Response
    {
        return new JsonResponse([
            'version' => $this->getParameter('version'),
            'upload' => [
                'image' => $this->getParameter('allow.upload.image') == 'true',
                'video' => $this->getParameter('allow.upload.video') == 'true',
            ],
            'default_lang' => $this->getParameter('lang'),
            'allow_email' => $this->getParameter('allow.email'),
        ], JsonResponse::HTTP_NOT_FOUND);
    }
}
