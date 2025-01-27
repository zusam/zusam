<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use App\Entity\Message;
use App\Service\Token;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class GetPublicLink extends ApiController
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
     *  description="Get a message's public link token",
     *
     *  @OA\JsonContent(
     *    type="string",
     *  )
     * )
     *
     * @OA\Tag(name="message")
     *
     * @Security(name="api_key")
     */
    #[Route('/messages/{id}/get-public-link', methods: ['GET'])]
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        if ($this->getParameter('allow.public.links') != 'true') {
            return new JsonResponse(['error' => 'Public link creation is restricted'], JsonResponse::HTTP_FORBIDDEN);
        }

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }
        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $message->getGroup());

        $token = Token::encode([
            'iat' => time(),
            'sub' => Token::SUB_READ_PUBLIC_MESSAGE,
            'id' => $message->getId(),
        ], $message->getSecretKey());

        return new JsonResponse(['token' => $token], JsonResponse::HTTP_OK);
    }
}
