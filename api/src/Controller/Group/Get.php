<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\Cache\TagAwareCacheInterface;

class Get extends ApiController
{
    private $cache;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        TagAwareCacheInterface $cache,
    ) {
        parent::__construct($em, $serializer);
        $this->cache = $cache;
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get a group",
     *
     *  @Model(type=App\Entity\Group::class, groups={"read_group"})
     * )
     *
     * @OA\Tag(name="group")
     *
     * @Security(name="api_key")
     */
    #[Route("/groups/{id}", methods: ["GET"])]
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $cacheKey = 'group_'.$group->getId().'_info';

        $data = $this->cache->get($cacheKey, function (ItemInterface $item) use ($group) {
            $item->expiresAfter(3600 * 24 * 7);
            $item->tag('group_'.$group->getId());
            $serialization_groups = ['read_group'];
            if ($this->getParameter('show.group.invitation.links') == 'true') {
                $serialization_groups[] = 'read_invite_key';
            }
            return $this->serialize($group, $serialization_groups);
        });

        return new Response(
            $data,
            Response::HTTP_OK
        );
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get a random message from the group",
     *
     *  @Model(type=App\Entity\Message::class, groups={"read_message"})
     * )
     *
     * @OA\Tag(name="group")
     *
     * @Security(name="api_key")
     */
    #[Route("/groups/{id}/random", methods: ["GET"])]
    public function random_message(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $messages = $this->em->getRepository(Message::class)->findByGroup($id);

        if (empty($messages)) {
            return new JsonResponse(['error' => 'No messages found'], JsonResponse::HTTP_NO_CONTENT);
        }

        return new Response(
            $this->serialize($messages[random_int(0, count($messages)-1)], ['read_message']),
            Response::HTTP_OK
        );
    }
}
