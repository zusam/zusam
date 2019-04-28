<?php
namespace App\Controller;

use App\Entity\Group;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class GroupInvitation extends Controller
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function __invoke(string $inviteKey)
    {
        $this->denyAccessUnlessGranted("ROLE_USER");

        $group = $this->em->getRepository(Group::class)->findOneBySecretKey($inviteKey);
        if (empty($group)) {
            return new JsonResponse(["message" => "Invalid invite key !"], JsonResponse::HTTP_BAD_REQUEST);
        }

        $group->addUser($this->getUser());
        $this->getUser()->addGroup($group);
        $this->em->persist($this->getUser());
        $this->em->persist($group);
        $this->em->flush();
        return new JsonResponse(["id" => $group->getId()], JsonResponse::HTTP_OK);
    }
}
