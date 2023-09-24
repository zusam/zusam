<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class Leave extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/groups/{id}/leave", methods={"POST"})
     *
     * @OA\Response(
     *  response=200,
     *  description="Leave a group",
     *
     *  @Model(type=App\Entity\Group::class, groups={"read_group"})
     * )
     *
     * @OA\Tag(name="group")
     *
     * @Security(name="api_key")
     */
    public function index(
        string $id,
        #[CurrentUser] User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $group->removeUser($currentUser);
        $currentUser->removeGroup($group);

        // delete all notifications related to this group
        foreach ($currentUser->getNotifications() as $notif) {
            if ($notif->getFromGroup() == $group) {
                $this->em->remove($notif);
            }
        }

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);
        $this->em->persist($group);

        // Notify users of the group
        foreach ($group->getUsers() as $u) {
            if ($u->getId() != $currentUser->getId()) {
                $notif = new Notification();
                $notif->setTarget($group->getId());
                $notif->setOwner($u);
                $notif->setFromUser($currentUser);
                $notif->setFromGroup($group);
                $notif->setType(Notification::USER_LEFT_GROUP);
                $this->em->persist($notif);
            }
        }

        $this->em->flush();

        return new Response(
            $this->serialize($group, ['read_group']),
            Response::HTTP_OK
        );
    }
}
