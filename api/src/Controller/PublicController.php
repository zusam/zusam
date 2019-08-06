<?php
namespace App\Controller;

use App\Entity\Message;
use App\Service\Token;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class PublicController extends AbstractController
{
    private $em;
    private $serializer;

    public function __construct(EntityManagerInterface $em, SerializerInterface $serializer)
    {
        $this->em = $em;
        $this->serializer = $serializer;
    }

    /**
     * @Route("/public/{token}", name="public")
     */
    public function public(string $token)
    {
        $token_data = Token::extract($token);
        if (empty($token_data) || empty($token_data["id"]) || empty($token_data["sub"])) {
            return new JsonResponse(["message" => "Invalid token"], JsonResponse::HTTP_BAD_REQUEST);
        }

        if ($token_data["sub"] == Token::SUB_READ_PUBLIC_MESSAGE) {
            return $this->getMessage($token_data["id"], $token);
        }

        return new JsonResponse(["message" => "Invalid token"], JsonResponse::HTTP_BAD_REQUEST);
    }

    private function getMessage(string $id, string $token): JsonResponse
    {
        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(["message" => "Invalid token"], JsonResponse::HTTP_BAD_REQUEST);
        }

        $token_data = Token::decode($token, $message->getSecretKey());
        if (empty($token_data)) {
            return new JsonResponse(["message" => "Invalid token"], JsonResponse::HTTP_BAD_REQUEST);
        }

        return new JsonResponse(
            $this->serializer->normalize($message, "json", ["groups" => "read_message"]),
            JsonResponse::HTTP_OK
        );
    }
}
