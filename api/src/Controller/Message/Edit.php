<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use App\Entity\Message;
use App\Entity\File;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Edit extends ApiController
{
    private $create;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        Create $create
    ) {
        parent::__construct($em, $serializer);
        $this->create = $create;
    }

    /**
     * @Route("/messages/{id}", methods={"PUT"})
     */
    public function index(string $id, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $message->getAuthor());

        $requestData = json_decode($request->getcontent(), true);
        $message->setData($requestData['data']);
        $message->setFiles(new ArrayCollection(array_map(function ($fid) {
            return $this->em->getRepository(File::class)->findOneById($fid);
        }, $requestData['files'])));

        // regen message miniature
        $message->setPreview($this->create->genPreview($message));

        return new Response(
            $this->serialize($message, ['read_message']),
            Response::HTTP_OK
        );
    }
}
