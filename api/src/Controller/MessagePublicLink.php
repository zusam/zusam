<?php
namespace App\Controller;

use App\Entity\Message;
use App\Service\Token;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class MessagePublicLink extends Controller
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function __invoke(string $id)
    {
        $this->denyAccessUnlessGranted("ROLE_USER");

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(["message" => "Message not found"], JsonResponse::HTTP_NOT_FOUND);
        }
        $this->denyAccessUnlessGranted(new Expression("user in object.getUsersAsArray()"), $message->getGroup());

        // TODO: remove for v1.0
        // old messages (before 0.2) don't have a secretKey
        if (empty($message->getSecretKey())) {
            $message->resetSecretKey();
            $this->em->persist($message);
            $this->em->flush();
        }

        $token = Token::encode([
            "iat" => time(),
            "sub" => Token::SUB_READ_PUBLIC_MESSAGE,
            "id" => $message->getId(),
        ], $message->getSecretKey());

        return new JsonResponse(["token" => $token], JsonResponse::HTTP_OK);
    }
}
