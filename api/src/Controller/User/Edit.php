<?php

namespace App\Controller\User;

use App\Controller\ApiController;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Serializer\SerializerInterface;

class Edit extends ApiController
{
    private $encoder;

    public function __construct(
        EntityManagerInterface $em,
        UserPasswordEncoderInterface $encoder,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
        $this->encoder = $encoder;
    }

    /**
     * @Route("/users/{id}", methods={"PUT"})
     */
    public function index(string $id, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $user);

        $requestData = json_decode($request->getcontent(), true);
        if (!empty($requestData['password'])) {
            $user->setPassword($this->encoder->encodePassword($user, $requestData['password']));
        }
        if (!empty($requestData['name'])) {
            $user->setName($requestData['name']);
        }
        if (!empty($requestData['login'])) {
            $user->setLogin($requestData['login']);
        }
        if (!empty($requestData['data'])) {
            $user->setData($requestData['data']);
        }
        $this->em->persist($user);
        $this->em->flush();

        return new Response(
            $this->serialize($user, ['read_user']),
            Response::HTTP_OK
        );
    }
}
