<?php
namespace App\Controller;

use App\Entity\User;
use App\Service\Mailer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class Security extends Controller
{
    private $em;
    private $mailer;

    public function __construct(EntityManagerInterface $em, Mailer $mailer)
    {
        $this->em = $em;
        $this->mailer = $mailer;
    }

    /**
     * @Route("/login", name="login")
     */
    public function login(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $login = $data["login"] ?? "";
        $password = $data["password"] ?? "";

        if (empty($login)) {
            return new JsonResponse(["message" => "Login cannot be empty"], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (empty($password)) {
            return new JsonResponse(["message" => "Password cannot be empty"], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $this->getDoctrine()->getRepository(User::class)->findOneByLogin($login);

        if (empty($user)) {
            return new JsonResponse(["message" => "Invalid login/password"], JsonResponse::HTTP_UNAUTHORIZED);
        }

        if (!password_verify($password, $user->getPassword())) {
            return new JsonResponse(["message" => "Invalid login/password"], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse(["api_key" => $user->getApiKey()], JsonResponse::HTTP_OK);
    }

    /**
     * @Route("/password-reset-mail", name="api_password_reset_mail", methods="post")
     */
    public function sendPasswordResetMail(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $mail = $data["mail"] ?? "";
        $user = $this->em->getRepository(User::class)->findOneByLogin($mail);
        if (!$user) {
            return new JsonResponse(["message" => "User not found"], JsonResponse::HTTP_NOT_FOUND);
        }
        $ret = $this->mailer->sendPasswordReset($user);
        if ($ret === true) {
            return new JsonResponse([], JsonResponse::HTTP_OK);
        } else {
            return new JsonResponse($ret, JsonResponse::HTTP_BAD_GATEWAY);
        }
    }

    /**
     * @Route("/new-password", name="api_new-password", methods="post")
     */
    public function newPassword(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $mail = $data["mail"] ?? "";
        $password = $data["password"] ?? "";
        $key = $data["key"] ?? "";
        $user = $this->em->getRepository(User::class)->findOneByLogin($mail);
        if (!$user) {
            return new JsonResponse(["message" => "User not found"], JsonResponse::HTTP_NOT_FOUND);
        }
        if (empty($password)) {
            return new JsonResponse(["message" => "Password cannot be blank"], JsonResponse::HTTP_BAD_REQUEST);
        }
        if (!$user->checkResetPasswordKey($key)) {
            return new JsonResponse(["message" => "Key is invalid"], JsonResponse::HTTP_BAD_REQUEST);
        }
        $user->setPassword(password_hash($password, PASSWORD_DEFAULT));
        $this->em->persist($user);
        $this->em->flush();
        return new JsonResponse(["api_key" => $user->getApiKey()], JsonResponse::HTTP_OK);
    }
}
