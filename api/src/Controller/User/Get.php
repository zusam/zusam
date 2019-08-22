<?php
namespace App\Controller\User;

use App\Controller\ApiController;
use App\Entity\User;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class Get extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/users/{id}", methods={"GET","HEAD"})
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted("ROLE_USER");

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(["error" => "Not Found"], Response::HTTP_NOT_FOUND);
        }

        return new Response(
            $this->serialize($user, ["read_user"]),
            Response::HTTP_OK,
        );
    }
}
