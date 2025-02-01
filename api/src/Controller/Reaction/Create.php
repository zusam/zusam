<?php

namespace App\Controller\Reaction;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\Message;
use App\Entity\User;
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
use Symfony\Component\Security\Http\Attribute\CurrentUser;
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
        public function index($id, Request $request, #[CurrentUser] User $currentUser): Response
        {
        $this->denyAccessUnlessGranted('ROLE_USER');

        if ($this->getParameter('allow.message.reactions') === "false") {
            return new JsonResponse(['error' => 'Reactions are currently disabled.'], Response::HTTP_FORBIDDEN);
        }

        $requestData = json_decode($request->getcontent(), true);
        $reactionString = trim(strip_tags($requestData['reaction']));
        if (grapheme_strlen($reactionString) !== 1){
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }

        $message = $this->em->getRepository(Message::class)->findOneBy(['id' => $id]);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }
        $group = $this->em->getRepository(Group::class)->findOneBy(['id' => $message->getGroup()->getId()]);

        if (empty($group)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);
        $this->em->flush();
        
        $this->reactionService->create($requestData['reaction'], $this->getUser(), $message);
        $reactions = $this->reactionService->getReactionSummary($message, $currentUser);
        return new Response(
            json_encode($reactions),
            Response::HTTP_OK,
            ['Content-Type' => 'application/json']
        );
    }
}
