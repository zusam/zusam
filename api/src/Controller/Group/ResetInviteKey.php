<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class ResetInviteKey extends ApiController
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
     *  description="Reset invite key of a group",
     *
     *  @OA\JsonContent(
     *    type="string",
     *  )
     * )
     *
     * @OA\Tag(name="group")
     *
     * @Security(name="api_key")
     */
    #[Route('/groups/{id}/reset-invite-key', methods: ['POST'])]
    public function index(
        string $id,
        #[CurrentUser]
        User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        if ('true' != $this->getParameter('show.group.invitation.links')) {
            return new JsonResponse(['error' => 'Invitation link reset is restricted'], JsonResponse::HTTP_FORBIDDEN);
        }
        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $group->resetInviteKey();

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);
        $this->em->persist($group);
        $this->em->flush();

        return new JsonResponse(['inviteKey' => $group->getInviteKey()], JsonResponse::HTTP_OK);
    }
}
