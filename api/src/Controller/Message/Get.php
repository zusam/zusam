<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use App\Entity\Message;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityNotFoundException;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
    #[Route('/messages/{id}', methods: ['GET'])]
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

        try {
            $message_norm['author'] = $this->normalize($message->getAuthor(), ['read_message_preview']);
        } catch (EntityNotFoundException $e) {
            $message_norm['author'] = null;
        }

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
    #[Route('/messages/{id}/preview', methods: ['GET'])]
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

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get an array of message IDs from groups for the user's feed",
     *
     *  @OA\JsonContent(type="array", @OA\Items(type="integer"))
     * )
     *
     * @OA\Tag(name="message")
     *
     * @Security(name="api_key")
     */
    #[Route('/feed/page/{page}', methods: ['GET'])]
    public function feed(Request $request, int $page): Response
    {
        $limit = 30;

        $this->denyAccessUnlessGranted('ROLE_USER');
        $user = $this->getUser();
        if ($user instanceof User) {
            $groupIds = $user->getGroups()->map(static fn ($group) => $group->getId())->toArray();
        } else {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }

        // Get message IDs
        $messageIds = $this->em->getRepository(Message::class)
            ->createQueryBuilder('m')
            ->select('m.id')
            ->innerJoin('m.group', 'g')
            ->where('g.id IN (:groupIds)')
            ->andWhere('m.parent IS NULL')
            ->setParameter('groupIds', $groupIds)
            ->orderBy('m.lastActivityDate', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($page)
            ->getQuery()
            ->getResult()
        ;

        $messageIdsArray = array_map(static fn ($message) => $message['id'], $messageIds);

        // Count total messages user can access
        $totalItems = $this->em->getRepository(Message::class)
            ->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->innerJoin('m.group', 'g')
            ->where('g.id IN (:groupIds)')
            ->setParameter('groupIds', $groupIds)
            ->getQuery()
            ->getSingleScalarResult()
        ;

        return new JsonResponse([
            'messages' => $messageIdsArray,
            'totalItems' => $totalItems,
        ], JsonResponse::HTTP_OK);
    }
}
