<?php

namespace App\Controller\Notification;

use App\Controller\ApiController;
use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class Edit extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Modify a notification",
     *
     *  @Model(type=App\Entity\Notification::class, groups={"read_notification"})
     * )
     *
     * @OA\Tag(name="notification")
     *
     * @Security(name="api_key")
     */
    #[Route('/notifications/{id}', methods: ['PUT'])]
    public function index(
        string $id,
        Request $request,
        #[CurrentUser] User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $notification = $this->em->getRepository(Notification::class)->findOneById($id);
        if (empty($notification)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $notification->getOwner());

        $requestData = json_decode($request->getcontent(), true);
        if (!empty($requestData['readAt'])) {
            $notification->setReadAt($requestData['readAt']);
        }
        if (!empty($requestData['data'])) {
            $notification->setData($requestData['data']);
        }
        if (!empty($requestData['read'])) {
            $notification->setRead($requestData['read']);
        }
        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);
        $this->em->persist($notification);
        $this->em->flush();

        return new Response(
            $this->serialize($notification, ['read_notification']),
            Response::HTTP_OK
        );
    }
}
