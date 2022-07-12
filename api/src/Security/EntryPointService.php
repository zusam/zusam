<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

class EntryPointService implements AuthenticationEntryPointInterface
{
    public function start(Request $request, AuthenticationException $authException = null)
    {
        return new Response(
            '{"message":"unauthorized"}',
            Response::HTTP_UNAUTHORIZED,
            ['Content-type' => 'application/json']
        );
    }
}
