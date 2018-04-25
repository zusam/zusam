<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class Security extends Controller
{
    /**
     * @Route("/login", name="login")
     */
    public function login(Request $request)
    {
    }
}
