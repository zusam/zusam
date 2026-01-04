<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Service\Preview as PreviewService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\Cache\TagAwareCacheInterface;

class GetPage extends ApiController
{
    private $previewService;
    private $cache;

    public function __construct(
        EntityManagerInterface $em,
        PreviewService $previewService,
        SerializerInterface $serializer,
        TagAwareCacheInterface $cache
    ) {
        parent::__construct($em, $serializer);
        $this->previewService = $previewService;
        $this->cache = $cache;
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get a group page",
     *
     *  @OA\JsonContent(
     *    type="object",
     *
     *    @OA\Property(
     *      property="messages",
     *      type="array",
     *
     *      @OA\Items(
     *        type="object",
     *
     *        @OA\Property(property="id", type="string"),
     *        @OA\Property(property="entityType", type="string"),
     *        @OA\Property(property="data", type="object"),
     *        @OA\Property(property="author", type="string"),
     *        @OA\Property(property="preview", type="string"),
     *        @OA\Property(property="children", type="integer"),
     *        @OA\Property(property="lastActivityDate", type="integer"),
     *      )
     *    ),
     *    @OA\Property(property="totalItems", type="integer"),
     *  )
     * )
     *
     * @OA\Tag(name="message")
     *
     * @Security(name="api_key")
     */
    #[Route('/groups/{id}/page/{n}', methods: ['GET'])]
    public function index(string $id, int $n): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Group not found'], JsonResponse::HTTP_NOT_FOUND);
        }
        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $groupId = $group->getId();
        $cacheKey = 'group_'.$groupId.'_page_'.$n;

        $data = $this->cache->get($cacheKey, function (ItemInterface $item) use ($groupId, $n) {
            $item->expiresAfter(3600 * 24 * 7);
            $item->tag('group_'.$groupId);

            $query = $this->em->createQuery(
                'SELECT m.id FROM App\Entity\Message m'
                ." WHERE m.group = '".$groupId."'"
                .' AND m.isInFront = 1'
                .' ORDER BY m.lastActivityDate DESC'
            );
            $query->setMaxResults(30);
            $query->setFirstResult(30 * $n);
            $messages = $query->getArrayResult();

            $query = $this->em->createQuery(
                'SELECT COUNT(m.id) AS totalItems FROM App\Entity\Message m'
                ." WHERE m.group = '".$groupId."'"
                .' AND m.isInFront = 1'
            );
            $totalItems = $query->getArrayResult();
            $data = [
                'messages' => array_map(static function ($e) {
                    return $e['id'];
                }, $messages),
                'totalItems' => $totalItems[0]['totalItems'],
            ];

            return $data;
        });

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }
}
