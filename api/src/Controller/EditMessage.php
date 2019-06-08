<?php
namespace App\Controller;

use App\Controller\NewMessage;
use App\Entity\Message;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class EditMessage extends Controller
{
    private $em;
    private $newMessage;

    public function __construct(EntityManagerInterface $em, NewMessage $newMessage)
    {
        $this->em = $em;
        $this->newMessage = $newMessage;
    }

    public function __invoke(Message $data): Message
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $this->denyAccessUnlessGranted(new Expression("user == object"), $data->getAuthor());

        // regen message miniature
        $data->setPreview($this->newMessage->genPreview($data));

        return $data;
    }
}
