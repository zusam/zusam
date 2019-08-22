<?php
namespace App\Controller\User;

use App\Controller\ApiController;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
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
     * @Route("/me", methods={"GET","HEAD"})
     */
    public function index(): Response
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        return new Response(
            $this->serialize($this->getUser(), ["read_user", "read_me"]),
            Response::HTTP_OK
        );
    }
}
