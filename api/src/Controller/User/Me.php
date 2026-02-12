<?php

namespace App\Controller\User;

use App\Controller\ApiController;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Me extends ApiController
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
     *  description="Returns the current logged in user",
     *
     *  @Model(type=App\Entity\User::class, groups={"read_user", "read_me"})
     * )
     *
     * @OA\Tag(name="user")
     *
     * @Security(name="api_key")
     */
    #[Route('/me', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->getUser();
        $user_norm = $this->normalize($user, ['read_user', 'read_me']);
        
        if (!isset($user_norm['data']['default_page'])) {
            $user_norm['data']['default_page'] = $this->getParameter('default.page');
        }

        if (!isset($user_norm['data']['default_group'])) {
            $groups = $user->getGroups();
            if (!empty($groups) && !$groups->isEmpty()) {
                $user_norm['data']['default_group'] = $groups->first()->getId();
            }
        }

        return new JsonResponse(
            $user_norm,
            JsonResponse::HTTP_OK
        );
    }
}
