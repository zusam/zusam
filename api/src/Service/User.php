<?php

namespace App\Service;

use App\Entity\Notification as NotificationEntity;
use App\Service\Notification as NotificationService;
use App\Entity\User as UserEntity;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class User
{
    private $em;
    private $hasher;
    private NotificationService $notificationService;

    public function __construct(
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
        NotificationService $notificationService
    ) {
        $this->em = $em;
        $this->hasher = $hasher;
        $this->notificationService = $notificationService;
    }

    public function getByLogin($login)
    {
        return $this->em->getRepository(UserEntity::class)->findOneByLogin($login);
    }

    public function getBySecretKey($key)
    {
        return $this->em->getRepository(UserEntity::class)->findOneBySecretKey($key);
    }

    public function getById($id)
    {
        return $this->em->getRepository(UserEntity::class)->findOneById($id);
    }

    public function create($login, $password = '')
    {
        $user = $this->em->getRepository(UserEntity::class)->findOneByLogin($login);

        if (!empty($user)) {
            return $user;
        }

        $user = new UserEntity();
        $user->setLogin($login);
        if ('' == $password) {
            $user->setPassword('');
        } else {
            $user->setPassword($this->hasher->hashPassword($user, $password));
        }
        $user->setName(explode('@', $login)[0]);
        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    public function delete(UserEntity $user){
        $notifications = $this->em->getRepository(NotificationEntity::class)->findBy(['owner' => $user,]);
        foreach ($notifications as $notification) {
                $this->notificationService->delete($notification);
        }
        $notifications = $this->em->getRepository(NotificationEntity::class)->findBy(['fromUser' => $user,]);
        foreach ($notifications as $notification) {
                $this->notificationService->delete($notification);
        }
        $this->em->remove($user);
        $this->em->flush();
    }
}