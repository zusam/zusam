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
use Symfony\Component\HttpKernel\Attribute\Cache;
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
    #[Cache(public: true, maxage: 86400)]
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        return new Response(
            $this->serialize($user, ['read_user']),
            Response::HTTP_OK,
        );
    }
}
