<?php

namespace App\Controller\Notification;

use App\Controller\ApiController;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;

class GetFromUser extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/users/{id}/notifications", methods={"GET"})
     * @OA\Response(
     *  response=200,
     *  description="Get all notifications from a user",
     *  @OA\JsonContent(
     *    type="array",
     *    @OA\Items(ref=@Model(type=App\Entity\Notification::class, groups={"read_notification"}))
     *  )
     * )
     * @OA\Tag(name="notification")
     * @Security(name="api_key")
     */
    public function get_notifications(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $user);

        return new Response(
            $this->serialize($user->getNotifications(), ['read_notification']),
            Response::HTTP_OK,
        );
    }

    /**
     * @Route("/users/{id}/notifications/{limit}", methods={"GET"})
     * @OA\Response(
     *  response=200,
     *  description="Get recent notifications from a user",
     *  @OA\JsonContent(
     *    type="array",
     *    @OA\Items(ref=@Model(type=App\Entity\Notification::class, groups={"read_notification"}))
     *  )
     * )
     * @OA\Tag(name="notification")
     * @Security(name="api_key")
     */
    public function get_notifications_with_limit(string $id, int $limit): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $user);

        $notifications = $user->getNotifications($limit);

        return new Response(
            $this->serialize($notifications, ['read_notification']),
            Response::HTTP_OK,
        );
    }
}
