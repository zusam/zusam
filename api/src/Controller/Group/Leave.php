<?php
namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Leave extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/groups/{id}/leave", methods={"POST"})
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted("ROLE_USER");

        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(["error" => "Not Found"], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression("user in object.getUsersAsArray()"), $group);

        $group->removeUser($this->getUser());
        $this->getUser()->removeGroup($group);
        $this->em->persist($this->getUser());
        $this->em->persist($group);
        $this->em->flush();

        return new Response(
            $this->serialize($group, ["read_group"]),
            Response::HTTP_OK
        );
    }
}
