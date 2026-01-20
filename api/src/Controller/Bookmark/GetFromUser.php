<?php

namespace App\Controller\Bookmark;

use App\Controller\ApiController;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class GetFromUser extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get all bookmarks from a user",
     *
     *  @OA\JsonContent(
     *    type="array",
     *
     *    @OA\Items(ref=@Model(type=App\Entity\Bookmark::class, groups={"read_bookmark"}))
     *  )
     * )
     *
     * @OA\Tag(name="bookmark")
     *
     * @Security(name="api_key")
     */
    #[Route('/users/{id}/bookmarks', methods: ['GET'])]
    public function get_bookmarks(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $user);

        return new Response(
            $this->serialize($user->getBookmarks(), ['read_bookmark']),
            Response::HTTP_OK,
        );
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get all bookmarks from a user",
     *
     *  @OA\JsonContent(
     *    type="array",
     *
     *    @OA\Items(ref=@Model(type=App\Entity\Bookmark::class, groups={"read_bookmark"}))
     *  )
     * )
     *
     * @OA\Tag(name="bookmark")
     *
     * @Security(name="api_key")
     */
    #[Route('/me/bookmarks', methods: ['GET'])]
    public function my_bookmarks(
        #[CurrentUser]
        User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        return new Response(
            $this->serialize($currentUser->getBookmarks(), ['read_bookmark']),
            Response::HTTP_OK,
        );
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get recent bookmarks from a user",
     *
     *  @OA\JsonContent(
     *    type="array",
     *
     *    @OA\Items(ref=@Model(type=App\Entity\Bookmark::class, groups={"read_bookmark"}))
     *  )
     * )
     *
     * @OA\Tag(name="bookmark")
     *
     * @Security(name="api_key")
     */
    #[Route('/users/{id}/bookmarks/{limit}', methods: ['GET'])]
    public function get_bookmarks_with_limit(string $id, int $limit): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $user);

        $bookmarks = $user->getBookmarks($limit);

        return new Response(
            $this->serialize($bookmarks, ['read_bookmark']),
            Response::HTTP_OK,
        );
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get all bookmarks from a user",
     *
     *  @OA\JsonContent(
     *    type="array",
     *
     *    @OA\Items(ref=@Model(type=App\Entity\Bookmark::class, groups={"read_bookmark"}))
     *  )
     * )
     *
     * @OA\Tag(name="bookmark")
     *
     * @Security(name="api_key")
     */
    #[Route('/me/bookmarks/{limit}', methods: ['GET'])]
    public function my_bookmarks_with_limit(
        int $limit,
        #[CurrentUser]
        User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $bookmarks = $currentUser->getBookmarks($limit);

        return new Response(
            $this->serialize($bookmarks, ['read_bookmark']),
            Response::HTTP_OK,
        );
    }
}
