<?php
namespace App\Controller\Message;

use App\Entity\Message;
use App\Service\Token;
use App\Controller\ApiController;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Routing\Annotation\Route;

class GetPublicLink extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/messages/{id}/get-public-link", methods={"GET"})
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted("ROLE_USER");

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(["error" => "Not Found"], JsonResponse::HTTP_NOT_FOUND);
        }
        $this->denyAccessUnlessGranted(new Expression("user in object.getUsersAsArray()"), $message->getGroup());

        $token = Token::encode([
            "iat" => time(),
            "sub" => Token::SUB_READ_PUBLIC_MESSAGE,
            "id" => $message->getId(),
        ], $message->getSecretKey());

        return new JsonResponse(["token" => $token], JsonResponse::HTTP_OK);
    }
}
