<?php

namespace App\Service;

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

    public function getById($id) {
        return $this->em->getRepository(GroupEntity::class)->findOneById($id);
    }

    public function addUser($group, $user) {
        $group->addUser($user);
        $this->getUser()->addGroup($group);
        $this->em->persist($user);
        $this->em->persist($group);

        // Notify users of the group
        foreach ($group->getUsers() as $u) {
            if ($u->getId() != $this->getUser()->getId()) {
                $notif = new Notification();
                $notif->setTarget($group->getId());
                $notif->setOwner($u);
                $notif->setFromUser($this->getUser());
                $notif->setFromGroup($group);
                $notif->setType(Notification::USER_JOINED_GROUP);
                $this->em->persist($notif);
            }
        }

        $this->em->flush();
    }
}
