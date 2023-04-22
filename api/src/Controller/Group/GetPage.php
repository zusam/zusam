<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Service\Preview as PreviewService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class GetPage extends ApiController
{
    private $previewService;

    public function __construct(
        EntityManagerInterface $em,
        PreviewService $previewService,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
        $this->previewService = $previewService;
    }

    /**
     * @Route("/groups/{id}/page/{n}", methods={"GET"})
     * @OA\Response(
     *  response=200,
     *  description="Get a group page",
     *  @OA\JsonContent(
     *    type="object",
     *    @OA\Property(
     *      property="messages",
     *      type="array",
     *      @OA\Items(
     *        type="object",
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
     * @OA\Tag(name="message")
     * @Security(name="api_key")
     */
    public function index(string $id, int $n): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Group not found'], JsonResponse::HTTP_NOT_FOUND);
        }
        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $query = $this->em->createQuery(
            "SELECT m FROM App\Entity\Message m"
            ." WHERE m.group = '".$group->getId()."'"
            .' AND m.isInFront = 1'
            .' ORDER BY m.lastActivityDate DESC'
        );
        $query->setMaxResults(30);
        $query->setFirstResult(30 * $n);
        $messages = $query->getResult();

        $query = $this->em->createQuery(
            "SELECT COUNT(m.id) AS totalItems FROM App\Entity\Message m"
            ." WHERE m.group = '".$group->getId()."'"
            .' AND m.isInFront = 1'
        );
        $totalItems = $query->getResult();

        $data = [
            'messages' => $this->normalize($messages, ['preview_message']),
            'totalItems' => $totalItems[0]['totalItems'],
        ];
        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }
}
