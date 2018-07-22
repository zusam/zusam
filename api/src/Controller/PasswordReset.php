<?php
namespace App\Controller;

use App\Entity\User;
use App\Service\Mailer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PasswordReset extends Controller
{

    private $em;
    private $mailer;

    public function __construct(EntityManagerInterface $em, Mailer $mailer)
    {
        $this->em = $em;
        $this->mailer = $mailer;
    }

    /**
     * @Route("/password-reset-mail", name="api_password_reset_mail", methods="post")
     */
    public function sendMail(Request $request)
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
}
