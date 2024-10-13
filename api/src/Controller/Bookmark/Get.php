<?php

namespace App\Controller\Bookmark;

use App\Controller\ApiController;
use App\Entity\Bookmark;
use App\Service\Bookmark as BookmarkService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Get extends ApiController
{
    private $bookmarkService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        BookmarkService $bookmarkService,
    ) {
        parent::__construct($em, $serializer);
        $this->bookmarkService = $bookmarkService;
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get a bookmark",
     *
     *  @Model(type=App\Entity\Bookmark::class, groups={"read_bookmark"})
     * )
     *
     * @OA\Tag(name="bookmark")
     *
     * @Security(name="api_key")
     */
    #[Route("/bookmarks/{id}", methods: ["GET"])]
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $bookmark = $this->em->getRepository(Bookmark::class)->findOneById($id);
        if (empty($bookmark)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        return new Response(
            $this->serialize($bookmark, ['read_bookmark']),
            Response::HTTP_OK,
        );
    }
}
