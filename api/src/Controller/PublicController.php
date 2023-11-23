<?php

namespace App\Controller;

use App\Entity\Message;
use App\Service\Token;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class PublicController extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/public/{token}", methods={"GET"})
     */
    public function public(string $token)
    {
        $token_data = Token::extract($token);
        if (empty($token_data) || empty($token_data['id']) || empty($token_data['sub'])) {
            return new JsonResponse(['message' => 'Invalid token'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (Token::SUB_READ_PUBLIC_MESSAGE == $token_data['sub']) {
            return $this->getMessage($token_data['id'], $token);
        }

        return new JsonResponse(['message' => 'Invalid token'], JsonResponse::HTTP_BAD_REQUEST);
    }

    private function getMessage(string $id, string $token): Response
    {
        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(['message' => 'Invalid token'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $token_data = Token::decode($token, $message->getSecretKey());
        if (empty($token_data)) {
            return new JsonResponse(['message' => 'Invalid token'], JsonResponse::HTTP_BAD_REQUEST);
        }

        return new Response(
            $this->serialize($message, ['groups' => 'read_message']),
            JsonResponse::HTTP_OK
        );
    }
}
