<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Service\Group as GroupService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class AddInvitedUser extends ApiController
{
    private $groupService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        GroupService $groupService
    ) {
        parent::__construct($em, $serializer);
        $this->groupService = $groupService;
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Add the logged in user to the group",
     *
     *  @OA\JsonContent(type="string")
     * )
     *
     * @OA\Tag(name="group")
     *
     * @Security(name="api_key")
     */
    #[Route("/groups/invitation/{inviteKey}", methods: ["POST"])]
    public function index(string $inviteKey): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $group = $this->em->getRepository(Group::class)->findOneByInviteKey($inviteKey);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Invalid invite key !'], Response::HTTP_BAD_REQUEST);
        }

        $this->groupService->addUser($group, $this->getUser());

        return new JsonResponse(['id' => $group->getId()], Response::HTTP_OK);
    }
}
