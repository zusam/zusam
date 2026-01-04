<?php

namespace App\Service;

use App\Entity\Group as GroupEntity;
use App\Entity\Notification as NotificationEntity;
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

    public function create($name, $user)
    {
        $group = new GroupEntity();
        $group->setName($name);
        $this->em->persist($group);

        $user->setLastActivityDate(time());
        $this->addUser($group, $user);
        $this->em->persist($user);

        $this->em->flush();

        return $group;
    }

    public function addUser($group, $user)
    {
        $group->addUser($user);
        $user->addGroup($group);
        $this->em->persist($user);
        $this->em->persist($group);

        // Notify users of the group
        foreach ($group->getUsers() as $u) {
            if ($u->getId() == $user->getId()) {
                continue;
            }

            $notif = new NotificationEntity();
            $notif->setTarget($group->getId());
            $notif->setOwner($u);
            $notif->setFromUser($user);
            $notif->setFromGroup($group);
            $notif->setType(NotificationEntity::USER_JOINED_GROUP);
            $this->em->persist($notif);
        }

        $this->em->flush();
    }
}
