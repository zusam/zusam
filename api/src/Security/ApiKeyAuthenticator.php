<?php

namespace App\Security;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

use App\Entity\User;

// https://symfony.com/doc/current/security/access_token.html#using-the-access-token-authenticator
class ApiKeyAuthenticator implements AccessTokenHandlerInterface
{
    private $em;

    public function __construct(
        EntityManagerInterface $em,
    ) {
        $this->em = $em;
    }

    public function getUserBadgeFrom(string $apiKey): UserBadge
    {
        $user = $this->em->getRepository(User::class)->findOneBySecretKey($apiKey);
        if (null === $user->getSecretKey()) {
            throw new BadCredentialsException('Invalid credentials.');
        }

        return new UserBadge($user->getSecretKey());
    }
}
