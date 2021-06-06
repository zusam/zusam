<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use App\Entity\File;
use App\Entity\Group;
use App\Entity\Message;
use App\Entity\Notification;
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

class Create extends ApiController
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
     * @Route("/messages", methods={"POST"})
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
     *  response=201,
     *  description="Create a message",
     *  @Model(type=App\Entity\Message::class, groups={"read_message"})
     * )
     * @SWG\Tag(name="message")
     * @Security(name="api_key")
     */
    public function index(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        $requestData = json_decode($request->getcontent(), true);
        $group = $this->em->getRepository(Group::class)->findOneById($requestData['group']);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }
        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $message = $this->messageService->create($requestData, $this->getUser(), $group);

        return new Response(
            $this->serialize($message, ['read_message']),
            Response::HTTP_CREATED
        );
    }
}
