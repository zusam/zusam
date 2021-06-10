<?php

namespace App\Service;

use App\Entity\User as UserEntity;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class User
{
    private $em;
    private $encoder;

    public function __construct(
        EntityManagerInterface $em,
        UserPasswordEncoderInterface $encoder
    ) {
        $this->em = $em;
        $this->encoder = $encoder;
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

    public function create($login, $password = "")
    {
        $user = $this->em->getRepository(UserEntity::class)->findOneByLogin($login);

        if (!empty($user)) {
            return $user;
        }

        $user = new UserEntity();
        $user->setLogin($login);
        if ($password == "") {
            $user->setPassword("");
        } else {
            $user->setPassword($this->encoder->encodePassword($user, $password));
        }
        $user->setName(explode('@', $login)[0]);
        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }
}
