<?php

namespace App\Controller\Notification;

use App\Controller\ApiController;
use App\Entity\Notification;
use App\Service\Notification as NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Get extends ApiController
{
    private $notificationService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        NotificationService $notificationService,
    ) {
        parent::__construct($em, $serializer);
        $this->notificationService = $notificationService;
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get a notification",
     *
     *  @Model(type=App\Entity\Notification::class, groups={"read_notification"})
     * )
     *
     * @OA\Tag(name="notification")
     *
     * @Security(name="api_key")
     */
    #[Route('/notifications/{id}', methods: ['GET'])]
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $notification = $this->em->getRepository(Notification::class)->findOneById($id);
        if (empty($notification)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }
        $notification_data_output = $this->normalize($notification, ['read_notification']);

        if (in_array(
            $notification->getType(),
            [
                Notification::NEW_COMMENT,
                Notification::NEW_MESSAGE,
            ]
        )) {
            $notification_data_output['parentAuthorName'] = $this->notificationService->getParentAuthorName($notification);
            $notification_data_output['title'] = $this->notificationService->getTitle($notification);
        }

        // Process notification's miniature
        if (Notification::GLOBAL_NOTIFICATION != $notification_data_output['type']
          && empty($notification->getMiniature())
        ) {
            $notification_data_output['miniature'] = $this->normalize($notification->getFromUser()->getAvatar(), ['read_notification']);
        }

        return new JsonResponse($notification_data_output, Response::HTTP_OK);
    }
}
