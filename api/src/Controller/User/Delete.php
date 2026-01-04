<?php

namespace App\Controller\User;

use App\Controller\ApiController;
use App\Entity\User;
use App\Service\User as UserService;
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
    private UserService $us;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UserService $us
    ) {
        parent::__construct($em, $serializer);
        $this->us = $us;
    }

    /**
     * @OA\Response(
     *  response=204,
     *  description="Delete a user",
     * )
     *
     * @OA\Tag(name="user")
     *
     * @Security(name="api_key")
     */
    #[Route('/users/{id}', methods: ['DELETE'])]
    public function index(
        string $id,
        #[CurrentUser]
        User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $user);

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);
        $this->us->delete($user);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
