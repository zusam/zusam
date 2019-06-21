<?php
namespace App\Controller;

use App\Entity\User;
use App\Service\Token;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class StopNotificationEmails extends Controller
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * @Route("/stop-notification-emails/{user_id}/{token}", name="stop-notification-emails")
     */
    public function login(string $user_id, string $token)
    {
        $user = $this->em->getRepository(User::class)->findOneById($user_id);

        if (empty($user)) {
            return new JsonResponse(["message" => "Invalid user"], JsonResponse::HTTP_BAD_REQUEST);
        }

        $token_data = Token::decode($token, $user->getSecretKey());
        if (empty($token_data) || $token_data["sub"] != Token::SUB_STOP_EMAIL_NOTIFICATIONS) {
            return new JsonResponse(["message" => "Token is invalid"], JsonResponse::HTTP_BAD_REQUEST);
        }

        $data = $user->getData();
        $data["notification_emails"] = "none";
        $user->setData($data);
        $this->em->persist($user);
        $this->em->flush();
        return new JsonResponse(["message" => "Email notifications disabled"], JsonResponse::HTTP_OK);
    }
}
