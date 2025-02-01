<?php

namespace App\Controller\Reaction;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\Message;
use App\Entity\User;
use App\Entity\Reaction;
use App\Service\Reaction as ReactionService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class Delete extends ApiController
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
     * @OA\Response(
     *  response=204,
     *  description="Delete a reaction and return updated reaction summary"
     * )
     *
     * @OA\Tag(name="reaction")
     *
     * @Security(name="api_key")
     */
    #[Route('/messages/{id}/reactions/{reactionId}', methods: ['DELETE'])]
    public function index(
        string $id,
        string $reactionId,
        #[CurrentUser] User $currentUser): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $message = $this->em->getRepository(Message::class)->findOneBy(['id' => $id]);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }

        $group = $this->em->getRepository(Group::class)->findOneBy(['id' => $message->getGroup()->getId()]);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }

        $reaction = $this->em->getRepository(Reaction::class)->findOneBy(['id' => $reactionId]);

        if (empty($reaction)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object.getAuthor()'), $reaction);

        $this->em->remove($reaction);

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);
        $this->em->flush();

        $reactions = $this->reactionService->getReactionSummary($message, $currentUser);


        return new Response(
            json_encode($reactions),
            Response::HTTP_OK,
            ['Content-Type' => 'application/json']
        );
    }
}