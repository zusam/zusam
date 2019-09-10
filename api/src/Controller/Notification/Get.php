<?php

namespace App\Controller\Notification;

use App\Controller\ApiController;
use App\Entity\Notification;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class Get extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/notifications/{id}", methods={"GET","HEAD"})
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $notification = $this->em->getRepository(Notification::class)->findOneById($id);
        if (empty($notification)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        return new Response(
            $this->serialize($notification, ['read_notification']),
            Response::HTTP_OK,
        );
    }
}
