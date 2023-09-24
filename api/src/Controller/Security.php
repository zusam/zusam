<?php

namespace App\Controller;

use App\Entity\Group;
use App\Entity\Notification;
use App\Entity\User;
use App\Service\Mailer;
use App\Service\Token;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RateLimiter\RequestRateLimiterInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\TooManyLoginAttemptsAuthenticationException;
use Symfony\Component\Security\Core\Security as SymfonySecurity;

class Security extends AbstractController
{
    private $em;
    private $mailer;
    private $passwordHasher;
    private $logger;
    private $limiter;

    public function __construct(
        LoggerInterface $logger,
        RequestRateLimiterInterface $limiter,
        EntityManagerInterface $em,
        Mailer $mailer,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->logger = $logger;
        $this->em = $em;
        $this->mailer = $mailer;
        $this->passwordHasher = $passwordHasher;
        $this->limiter = $limiter;
    }

    /**
     * @Route("/login", methods={"POST"})
     */
    public function login(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $login = $data['login'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($login)) {
            return $this->json(['message' => 'Login cannot be empty'], Response::HTTP_BAD_REQUEST);
        }

        if (empty($password)) {
            return $this->json(['message' => 'Password cannot be empty'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->em->getRepository(User::class)->findOneByLogin($login);

        if (empty($user)) {
            return $this->json(['message' => 'Invalid login/password'], Response::HTTP_UNAUTHORIZED);
        }

        // Throttle login attempts
        $request->attributes->set(SymfonySecurity::LAST_USERNAME, $user->getUserIdentifier());
        $limit = $this->limiter->consume($request);
        if (!$limit->isAccepted()) {
            throw new TooManyLoginAttemptsAuthenticationException(intval(ceil(($limit->getRetryAfter()->getTimestamp() - time()) / 60)));
        }

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            $this->logger->notice('Invalid password for '.$user->getId(), ['ip' => $_SERVER['REMOTE_ADDR']]);

            return $this->json(['message' => 'Invalid login/password'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json(['api_key' => $user->getSecretKey()], Response::HTTP_OK);
    }

    /**
     * @Route("/signup", methods={"POST"})
     */
    public function signup(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $login = $data['login'] ?? '';
        $password = $data['password'] ?? '';
        $inviteKey = $data['invite_key'] ?? '';

        if (empty($login)) {
            return $this->json(['message' => 'Login cannot be empty'], Response::HTTP_BAD_REQUEST);
        }

        if (empty($password)) {
            return $this->json(['message' => 'Password cannot be empty'], Response::HTTP_BAD_REQUEST);
        }

        if (empty($inviteKey)) {
            return $this->json(['message' => 'You need to have an invite key'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->em->getRepository(User::class)->findOneByLogin($login);

        if (!empty($user)) {
            // if the user tries to login from an invitation, let's test to eventually connect him
            if (!$this->passwordHasher->isPasswordValid($user, $password)) {
                $this->logger->notice('Invalid password for '.$user->getId(), ['ip' => $_SERVER['REMOTE_ADDR']]);

                return $this->json(['message' => 'Invalid login/password'], Response::HTTP_UNAUTHORIZED);
            }
        }

        $group = $this->em->getRepository(Group::class)->findOneBySecretKey($inviteKey);

        if (empty($group)) {
            return $this->json(['message' => 'Invalid invite key !'], Response::HTTP_BAD_REQUEST);
        }

        // if the user didn't already exist, let's create him
        if (empty($user)) {
            $user = new User();
            $user->setLogin($login);
            $user->setPassword($this->passwordHasher->hashPassword($user, $password));
            $user->setName(explode('@', $login)[0]);
            $user->setData(['mail' => $login]);
        }

        // add the user to the group
        $user->addGroup($group);
        $group->addUser($user);
        $this->em->persist($user);
        $this->em->persist($group);

        // notify users of the group
        foreach ($group->getUsers() as $u) {
            if ($u->getId() != $user->getId()) {
                $notif = new Notification();
                $notif->setTarget($group->getId());
                $notif->setOwner($u);
                $notif->setFromUser($user);
                $notif->setFromGroup($group);
                $notif->setType(Notification::USER_JOINED_GROUP);
                $this->em->persist($notif);
            }
        }

        $this->em->flush();

        return $this->json(['api_key' => $user->getSecretKey()], Response::HTTP_OK);
    }

    /**
     * @Route("/password-reset-mail", methods={"POST"})
     */
    public function sendPasswordResetMail(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $mail = $data['mail'] ?? '';
        $user = $this->em->getRepository(User::class)->findOneByLogin($mail);
        if (!$user) {
            return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        $ret = $this->mailer->sendPasswordReset($user);
        if (true === $ret) {
            return $this->json([], Response::HTTP_OK);
        } else {
            return $this->json($ret, Response::HTTP_BAD_GATEWAY);
        }
    }

    /**
     * @Route("/new-password", methods={"POST"})
     */
    public function newPassword(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $mail = $data['mail'] ?? '';
        $password = $data['password'] ?? '';
        $key = $data['key'] ?? '';
        $user = $this->em->getRepository(User::class)->findOneByLogin($mail);
        if (!$user) {
            return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        if (empty($password)) {
            return $this->json(['message' => 'Password cannot be blank'], Response::HTTP_BAD_REQUEST);
        }
        $token_data = Token::decode($key, $user->getPassword());
        if (empty($token_data) || Token::SUB_RESET_PASSWORD != $token_data['sub']) {
            return $this->json(['message' => 'Key is invalid'], Response::HTTP_BAD_REQUEST);
        }
        $user->setPassword(password_hash($password, PASSWORD_DEFAULT));
        $this->em->persist($user);
        $this->em->flush();

        return $this->json(['api_key' => $user->getSecretKey()], Response::HTTP_OK);
    }
}
