<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Get extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/messages/{id}", methods={"GET"})
     *
     * @OA\Response(
     *  response=200,
     *  description="Get a message",
     *
     *  @Model(type=App\Entity\Message::class, groups={"read_message"})
     * )
     *
     * @OA\Tag(name="message")
     *
     * @Security(name="api_key")
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $message->getGroup());
        $message_norm = $this->normalize($message, ['read_message']);
        $message_norm['preview'] = $this->normalize($message->getPreview(), ['read_message']);
        $message_norm['author'] = $this->normalize($message->getAuthor(), ['read_message_preview']);

        $lineage = [];
        $parent = $message->getParent();
        while (!empty($parent)) {
            $lineage[] = $parent->getId();
            $parent = $parent->getParent();
        }
        $message_norm['lineage'] = $lineage;

        return new JsonResponse(
            $message_norm,
            JsonResponse::HTTP_OK
        );
    }

    /**
     * @Route("/messages/{id}/preview", methods={"GET"})
     *
     * @OA\Response(
     *  response=200,
     *  description="Get a message",
     *
     *  @Model(type=App\Entity\Message::class, groups={"read_message"})
     * )
     *
     * @OA\Tag(name="message")
     *
     * @Security(name="api_key")
     */
    public function preview(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $message->getGroup());

        $message_preview = $this->normalize($message, ['read_message_preview']);
        $message_preview['children'] = count($message->getChildren());

        return new JsonResponse($message_preview, JsonResponse::HTTP_OK);
    }
}
