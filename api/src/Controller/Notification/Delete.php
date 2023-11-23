<?php

namespace App\Controller\Notification;

use App\Controller\ApiController;
use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class Delete extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/notifications/{id}", methods={"DELETE"})
     *
     * @OA\Response(
     *  response=204,
     *  description="Delete a notification"
     * )
     *
     * @OA\Tag(name="notification")
     *
     * @Security(name="api_key")
     */
    public function index(
        string $id,
        #[CurrentUser] User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $notification = $this->em->getRepository(Notification::class)->findOneById($id);
        if (empty($notification)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $notification->getOwner());

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);
        $this->em->remove($notification);

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);

        $this->em->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
