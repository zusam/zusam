<?php

namespace App\Controller\Reaction;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\Message;
use App\Service\Reaction as ReactionService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Create extends ApiController
{
    private $reactionService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        ReactionService $reactionService,
    ) {
        parent::__construct($em, $serializer);
        $this->reactionService = $reactionService;
    }

    /**
     * @OA\RequestBody(
     *
     *  @OA\Schema(
     *    type="object",
     *
     *    @OA\Property(property="reaction", type="string"),
     *  )
     * )
     *
     * @OA\Response(
     *  response=201,
     *  description="Create a reaction",
     * )
     *
     * @OA\Tag(name="reaction")
     *
     * @Security(name="api_key")
     */
        #[Route('/messages/{id}/reactions', methods: ['POST'])]
        public function index($id, Request $request): Response
        {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $requestData = json_decode($request->getcontent(), true);
        $message = $this->em->getRepository(Message::class)->findOneBy(['id' => $id]);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }
        $group = $this->em->getRepository(Group::class)->findOneBy(['id' => $message->getGroup()->getId()]);

        if (empty($group)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $this->reactionService->create($requestData['reaction'], $this->getUser(), $message);
        $reactions = $this->reactionService->getReactionSummary($message);
        return new Response(
            $this->serialize($reactions, ['read_reaction']),
            Response::HTTP_OK,
        );
    }
}
