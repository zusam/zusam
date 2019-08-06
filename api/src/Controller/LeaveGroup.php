<?php
namespace App\Controller;

use App\Entity\Group;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class LeaveGroup extends AbstractController
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function __invoke(Group $group)
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $group->removeUser($this->getUser());
        $this->getUser()->removeGroup($group);
        $this->em->persist($this->getUser());
        $this->em->persist($group);
        $this->em->flush();
        return $group;
    }
}
