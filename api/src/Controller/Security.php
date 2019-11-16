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
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class Security extends AbstractController
{
    private $em;
    private $mailer;
    private $encoder;
    private $logger;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        Mailer $mailer,
        UserPasswordEncoderInterface $encoder
    ) {
        $this->logger = $logger;
        $this->em = $em;
        $this->mailer = $mailer;
        $this->encoder = $encoder;
    }

    /**
     * @Route("/login", methods={"POST"})
     */
    public function login(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $login = urldecode($data['login']) ?? '';
        $password = $data['password'] ?? '';

        if (empty($login)) {
            return new JsonResponse(['message' => 'Login cannot be empty'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (empty($password)) {
            return new JsonResponse(['message' => 'Password cannot be empty'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $this->em->getRepository(User::class)->findOneByLogin($login);

        if (empty($user)) {
            return new JsonResponse(['message' => 'Invalid login/password'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        if (!$this->encoder->isPasswordValid($user, $password)) {
            $this->logger->notice('Invalid password for '.$user->getId(), ['ip' => $_SERVER['REMOTE_ADDR']]);

            return new JsonResponse(['message' => 'Invalid login/password'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse(['api_key' => $user->getSecretKey()], JsonResponse::HTTP_OK);
    }

    /**
     * @Route("/signup", methods={"POST"})
     */
    public function signup(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $login = urldecode($data['login']) ?? '';
        $password = $data['password'] ?? '';
        $inviteKey = $data['invite_key'] ?? '';

        if (empty($login)) {
            return new JsonResponse(['message' => 'Login cannot be empty'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (empty($password)) {
            return new JsonResponse(['message' => 'Password cannot be empty'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (empty($inviteKey)) {
            return new JsonResponse(['message' => 'You need to have an invite key'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $this->em->getRepository(User::class)->findOneByLogin($login);

        if (!empty($user)) {
            // if the user tries to login from an invitation, let's test to eventually connect him
            if (!$this->encoder->isPasswordValid($user, $password)) {
                $this->logger->notice('Invalid password for '.$user->getId(), ['ip' => $_SERVER['REMOTE_ADDR']]);
                return new JsonResponse(['message' => 'Invalid login/password'], JsonResponse::HTTP_UNAUTHORIZED);
            }
        }

        $group = $this->em->getRepository(Group::class)->findOneBySecretKey($inviteKey);

        if (empty($group)) {
            return new JsonResponse(['message' => 'Invalid invite key !'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // if the user didn't already exist, let's create him
        if (empty($user)) {
            $user = new User();
            $user->setLogin($login);
            $user->setPassword($this->encoder->encodePassword($user, $password));
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

        return new JsonResponse(['api_key' => $user->getSecretKey()], JsonResponse::HTTP_OK);
    }

    /**
     * @Route("/password-reset-mail", methods={"POST"})
     */
    public function sendPasswordResetMail(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $mail = $data['mail'] ?? '';
        $user = $this->em->getRepository(User::class)->findOneByLogin($mail);
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }
        $ret = $this->mailer->sendPasswordReset($user);
        if (true === $ret) {
            return new JsonResponse([], JsonResponse::HTTP_OK);
        } else {
            return new JsonResponse($ret, JsonResponse::HTTP_BAD_GATEWAY);
        }
    }

    /**
     * @Route("/new-password", methods={"POST"})
     */
    public function newPassword(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $mail = urldecode($data['mail']) ?? '';
        $password = $data['password'] ?? '';
        $key = $data['key'] ?? '';
        $user = $this->em->getRepository(User::class)->findOneByLogin($mail);
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }
        if (empty($password)) {
            return new JsonResponse(['message' => 'Password cannot be blank'], JsonResponse::HTTP_BAD_REQUEST);
        }
        $token_data = Token::decode($key, $user->getPassword());
        if (empty($token_data) || Token::SUB_RESET_PASSWORD != $token_data['sub']) {
            return new JsonResponse(['message' => 'Key is invalid'], JsonResponse::HTTP_BAD_REQUEST);
        }
        $user->setPassword(password_hash($password, PASSWORD_DEFAULT));
        $this->em->persist($user);
        $this->em->flush();

        return new JsonResponse(['api_key' => $user->getSecretKey()], JsonResponse::HTTP_OK);
    }
}
