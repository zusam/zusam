<?php

namespace App\Controller\User;

use App\Controller\ApiController;
use App\Entity\User;
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
     * @OA\Response(
     *  response=200,
     *  description="Returns a user given its id",
     *
     *  @Model(type=App\Entity\User::class, groups={"read_user"})
     * )
     *
     * @OA\Tag(name="user")
     *
     * @Security(name="api_key")
     */
    #[Route('/users/{id}', methods: ['GET'])]
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $currentUser = $this->getUser();
        if (!$currentUser instanceof User) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }

        // A user may read their own profile; otherwise they must share at least one group
        // with the target user, honoring the group-isolation privacy model.
        if ($currentUser->getId() !== $user->getId()) {
            $currentGroupIds = $currentUser->getGroups()->map(static fn ($g) => $g->getId())->toArray();
            $targetGroupIds = $user->getGroups()->map(static fn ($g) => $g->getId())->toArray();
            if (empty(array_intersect($currentGroupIds, $targetGroupIds))) {
                throw $this->createAccessDeniedException();
            }
        }

        return new Response(
            $this->serialize($user, ['read_user']),
            Response::HTTP_OK,
        );
    }
}
