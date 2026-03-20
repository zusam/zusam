<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use App\Entity\Message;
use App\Entity\Notification;
use App\Entity\User;
use App\Service\Message as MessageService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Contracts\Cache\TagAwareCacheInterface;

class Delete extends ApiController
{
    private $cache;
    private MessageService $ms;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        TagAwareCacheInterface $cache,
        MessageService $ms,
    ) {
        parent::__construct($em, $serializer);
        $this->cache = $cache;
        $this->ms = $ms;
    }

    /**
     * @OA\Response(
     *  response=204,
     *  description="Delete a message"
     * )
     *
     * @OA\Tag(name="message")
     *
     * @Security(name="api_key")
     */
    #[Route('/messages/{id}', methods: ['DELETE'])]
    public function index(
        string $id,
        #[CurrentUser]
        User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object.getAuthor()'), $message);

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);

        $this->ms->delete($message);

        // Clear cache for the group
        $this->cache->invalidateTags(['group_' . $message->getGroup()->getId()]);

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }
}
