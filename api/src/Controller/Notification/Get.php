<?php

namespace App\Controller\Notification;

use App\Controller\ApiController;
use App\Entity\Link;
use App\Entity\Message;
use App\Entity\Notification;
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
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/notifications/{id}", methods={"GET"})
     * @OA\Response(
     *  response=200,
     *  description="Get a notification",
     *  @Model(type=App\Entity\Notification::class, groups={"read_notification"})
     * )
     * @OA\Tag(name="notification")
     * @Security(name="api_key")
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $notification = $this->em->getRepository(Notification::class)->findOneById($id);
        if (empty($notification)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }
        $notification_data = $this->normalize($notification, ['read_notification']);
        $notification_data["fromGroup"] = $this->normalize($notification->getFromGroup(), ['read_notification']);

        // Process notification's title
        $title = "";
        if (in_array($notification->getType(), [Notification::NEW_COMMENT, Notification::NEW_MESSAGE])) {

          $notification_data["author"] = $this->normalize($notification->getFromUser(), ['read_message']);

          $message = $notification->getFromMessage();
          if ($message) {
            $notification_data["target_author"] = $this->normalize($message->getAuthor(), ['read_message']);
            $data = $message->getData();
            if (!empty($data["title"])) {
              $title = $data["title"];
            }

            if (empty($title)) {
              $urls = $message->getUrls();
              if (count($urls) > 0) {
                $link = $this->em->getRepository(Link::class)->findOneByUrl($urls[0]);
                if (!empty($link)) {
                  $title = $link->getData()["title"] ?? $link->getData()["description"] ?? $link->getData()["url"];
                }
              }
            }

            if (empty($title) && !empty($data["text"])) {
              $title = $data["text"];
            }
          }
        }
        $notification_data["title"] = $title;

        // Process notification's miniature
        if (
          $notification_data["type"] != Notification::GLOBAL_NOTIFICATION
        ) {
          $notification_data["miniature"] = $this->normalize($notification->getFromUser()->getAvatar(), ['read_message']);
        }

        return new Response(json_encode($notification_data), Response::HTTP_OK);
    }
}
