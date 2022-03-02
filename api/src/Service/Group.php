<?php

namespace App\Service;

use App\Entity\Notification as NotificationEntity;
use App\Entity\Group as GroupEntity;
use Doctrine\ORM\EntityManagerInterface;

class Group
{
    private $em;

    public function __construct(
        EntityManagerInterface $em
    ) {
        $this->em = $em;
    }

    public function getById($id)
    {
        return $this->em->getRepository(GroupEntity::class)->findOneById($id);
    }

    public function addUser($group, $user)
    {
        $group->addUser($user);
        $user->addGroup($group);
        $this->em->persist($user);
        $this->em->persist($group);

        // Notify users of the group
        foreach ($group->getUsers() as $u) {
            if ($u->getId() != $user->getId()) {
                $notif = new NotificationEntity();
                $notif->setTarget($group->getId());
                $notif->setOwner($u);
                $notif->setFromUser($user);
                $notif->setFromGroup($group);
                $notif->setType(NotificationEntity::USER_JOINED_GROUP);
                $this->em->persist($notif);
            }
        }

        $this->em->flush();
    }
}
