<?php

namespace App\Controller\Link;

use App\Controller\ApiController;
use App\Entity\Link;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class GetById extends ApiController
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
     *  description="Get an already-computed link embed by its id",
     *
     *  @OA\JsonContent(
     *    type="object",
     *
     *    @OA\Property(property="id", type="string"),
     *    @OA\Property(property="data", type="object"),
     *    @OA\Property(property="url", type="string"),
     *    @OA\Property(property="updatedAt", type="integer"),
     *    @OA\Property(
     *      property="preview",
     *      type="object",
     *      @OA\Property(property="id", type="string"),
     *      @OA\Property(property="entityType", type="string")
     *    )
     *  )
     * )
     *
     * @OA\Tag(name="link")
     */
    // Public, read-only endpoint: returns the cached embed data for an existing
    // link without ever performing an outbound request. Used by public posts so
    // they no longer need the (now authenticated) by_url endpoint.
    #[Route('/links/{id}', methods: ['GET'], requirements: ['id' => '[0-9a-fA-F-]{36}'])]
    public function getLinkById(string $id): Response
    {
        $link = $this->em->getRepository(Link::class)->findOneById($id);
        if (empty($link)) {
            return new JsonResponse(['error' => 'Link not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(GetByUrl::formatLink($link), Response::HTTP_OK);
    }
}
