<?php

namespace App\Controller\Reaction;

use App\Controller\ApiController;
use App\Entity\Message;
use App\Entity\User;
use App\Service\Reaction as ReactionService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\Request;

class Get extends ApiController
{
    private $reactionService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        ReactionService $reactionService
    ) {
        parent::__construct($em, $serializer);
        $this->reactionService = $reactionService;
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get reactions",
     *
     *  @Model(type=App\Entity\Reaction::class, groups={"read_reaction"})
     * )
     *
     * @OA\Tag(name="reaction")
     *
     * @Security(name="api_key")
     */
    #[Route('/messages/{id}/reactions', methods: ['GET'])]
    public function index(string $id, #[CurrentUser] User $currentUser): Response
    {

        $this->denyAccessUnlessGranted('ROLE_USER');

        if ($this->getParameter('allow.message.reactions') === "false") {
            return new JsonResponse(['error' => 'Reactions are currently disabled.'], Response::HTTP_FORBIDDEN);
        }

        $message = $this->em->getRepository(Message::class)->findOneBy(['id' => $id]);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $message->getGroup());

        $reactions = $this->reactionService->getReactionSummary($message, $currentUser);
        return new Response(
            json_encode($reactions),
            Response::HTTP_OK,
            ['Content-Type' => 'application/json']
        );
    }
}
