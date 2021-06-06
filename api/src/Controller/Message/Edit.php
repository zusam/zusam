<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use App\Entity\File;
use App\Entity\Message;
use App\Service\Message as MessageService;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Edit extends ApiController
{
    private $messageService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        MessageService $messageService
    ) {
        parent::__construct($em, $serializer);
        $this->messageService = $messageService;
    }

    /**
     * @Route("/messages/{id}", methods={"PUT"})
     * @SWG\Parameter(
     *  name="data",
     *  in="body",
     *  @SWG\Schema(
     *    type="object",
     *    @SWG\Property(property="text", type="string"),
     *    @SWG\Property(property="title", type="string")
     *  )
     * )
     * @SWG\Parameter(
     *  name="files",
     *  in="body",
     *  @SWG\Schema(
     *    type="array",
     *    @SWG\Items(type="string")
     *  )
     * )
     * @SWG\Response(
     *  response=200,
     *  description="Modify a bookmark",
     *  @Model(type=App\Entity\Message::class, groups={"read_message"})
     * )
     * @SWG\Tag(name="message")
     * @Security(name="api_key")
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
        if (!empty($requestData['data'])) {
            $message->setData($requestData['data']);
        }
        if (!empty($requestData['isInFront'])) {
            $message->setIsInFront($requestData['isInFront']);
        }
        if (!empty($requestData['lastActivityDate'])) {
            $message->setLastActivityDate($requestData['lastActivityDate']);
        }
        if (!empty($requestData['files'])) {
            $message->setFiles(new ArrayCollection(array_map(function ($fid) {
                return $this->em->getRepository(File::class)->findOneById($fid);
            }, $requestData['files'])));
        }

        // regen message miniature
        $message->setPreview($this->messageService->genPreview($message));

        $this->getUser()->setLastActivityDate(time());
        $this->em->persist($this->getUser());

        $this->em->persist($message);
        $this->em->flush();

        return new Response(
            $this->serialize($message, ['read_message']),
            Response::HTTP_OK
        );
    }
}
