<?php

namespace App\Controller\Bookmark;

use App\Controller\ApiController;
use App\Entity\Bookmark;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class Delete extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @OA\Response(
     *  response=204,
     *  description="Delete a bookmark"
     * )
     *
     * @OA\Tag(name="bookmark")
     *
     * @Security(name="api_key")
     */
    #[Route("/bookmarks/{id}", methods: ["DELETE"])]
    public function index(
        string $id,
        #[CurrentUser] User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $bookmark = $this->em->getRepository(Bookmark::class)->findOneById($id);
        if (empty($bookmark)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $bookmark->getUser());

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);
        $this->em->remove($bookmark);

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);

        $this->em->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
