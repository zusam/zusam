<?php
namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class Security extends Controller
{
    /**
     * @Route("/login", name="login")
     */
    public function login(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $login = $data["login"] ?? "";
        $password = $data["password"] ?? "";

        if (empty($login)) {
            return new JsonResponse(["message" => "Login cannot be empty"], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (empty($password)) {
            return new JsonResponse(["message" => "Password cannot be empty"], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $this->getDoctrine()->getRepository(User::class)->findOneByLogin($login);

        if (empty($user)) {
            return new JsonResponse(["message" => "Invalid login/password"], JsonResponse::HTTP_UNAUTHORIZED);
        }

        if (!password_verify($password, $user->getPassword())) {
            return new JsonResponse(["message" => "Invalid login/password"], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse(["api_key" => $user->getApiKey()], JsonResponse::HTTP_OK);
    }
}
