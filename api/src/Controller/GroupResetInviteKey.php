<?php
namespace App\Controller;

use App\Entity\Group;
use App\Service\Uuid;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\ExpressionLanguage\Expression;

class GroupResetInviteKey extends Controller
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function __invoke(Group $data)
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $this->denyAccessUnlessGranted(new Expression("user in object.getUsersAsArray()"), $data);
        $data->resetSecretKey();
        $this->em->persist($data);
        $this->em->flush();
        return new JsonResponse(["inviteKey" => $data->getSecretKey()], JsonResponse::HTTP_OK);
    }
}
