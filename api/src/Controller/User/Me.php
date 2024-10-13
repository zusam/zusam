<?php

namespace App\Controller\User;

use App\Controller\ApiController;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Response;
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
    public function index(): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        return new Response(
            $this->serialize($this->getUser(), ['read_user', 'read_me']),
            Response::HTTP_OK
        );
    }
}
