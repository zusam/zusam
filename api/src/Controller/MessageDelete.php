<?php
namespace App\Controller;

use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class MessageDelete extends Controller
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
            return new JsonResponse([], JsonResponse::HTTP_OK);
        }
        $this->denyAccessUnlessGranted(new Expression("user == object.getAuthor()"), $message);

        $em->remove($message);
        $em->flush();

        return new JsonResponse([], JsonResponse::HTTP_OK);
    }
}
