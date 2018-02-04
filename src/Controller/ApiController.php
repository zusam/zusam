<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ApiController
{
    /**
     * @Route("/api")
     */
    public function index()
    {
        return new Response("Hello world !");
    }
}
