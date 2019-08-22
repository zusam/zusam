<?php
namespace App\Controller\Message;

use App\Entity\Message;
use App\Entity\User;
use App\Controller\ApiController;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
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
     * @Route("/messages/{id}", methods={"GET","HEAD"})
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted("ROLE_USER");

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(["error" => "Not Found"], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression("user in object.getUsersAsArray()"), $message->getGroup());

        // remove this message from the current users news
        $user = $this->getUser();
        $user->removeNews($message->getId());
        $this->em->persist($user);
        $this->em->flush();

        return new Response(
            $this->serialize($message, ["read_message"]),
            Response::HTTP_OK
        );
    }
}
