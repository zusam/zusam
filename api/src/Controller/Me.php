<?php
namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class Me extends AbstractController
{
    public function __invoke(): User
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        return $this->getUser();
    }
}
