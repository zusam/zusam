<?php

namespace App\Controller;

use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class Info extends ApiController
{
    /**
     * @OA\Response(
     *  response=200,
     *  description="Get informations about the API",
     * )
     */
    #[Route('/info', methods: ['GET'])]
    public function index(): Response
    {
        $data = [
            'default_lang' => $this->getParameter('lang'),
            'allow_email' => 'true' == $this->getParameter('allow.email'),
        ];

        if ($this->getUser()) {
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

            $data['version'] = $this->getParameter('version');
            $data['upload'] = [
                'image' => 'true' == $this->getParameter('allow.upload.image') && $has_imagick,
                'video' => 'true' == $this->getParameter('allow.upload.video') && $has_ffmpeg,
                'pdf' => 'true' == $this->getParameter('allow.upload.pdf') && $has_ghostscript,
            ];
            $data['allow_public_links'] = 'true' == $this->getParameter('allow.public.links');
            $data['allow_message_reactions'] = 'true' == $this->getParameter('allow.message.reactions');
            $data['show'] = [
                'group_invitation_links' => 'true' == $this->getParameter('show.group.invitation.links'),
            ];
        }

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }
}
