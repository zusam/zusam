<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\Notification;
use App\Service\Group as GroupService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;

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
     * @Route("/groups/invitation/{inviteKey}", methods={"POST"})
     * @SWG\Response(
     *  response=200,
     *  description="Add the logged in user to the group",
     *  @SWG\Schema(type="string")
     * )
     * @SWG\Tag(name="group")
     * @Security(name="api_key")
     */
    public function index(string $inviteKey): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $group = $this->em->getRepository(Group::class)->findOneBySecretKey($inviteKey);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Invalid invite key !'], Response::HTTP_BAD_REQUEST);
        }

        $this->groupService->addUser($group, $this->getUser());
        return new JsonResponse(['id' => $group->getId()], Response::HTTP_OK);
    }
}
