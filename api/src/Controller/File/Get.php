<?php

namespace App\Controller\File;

use App\Controller\ApiController;
use App\Entity\File;
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
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @OA\Response(
     *  response=200,
     *  description="Get a file",
     *
     *  @Model(type=App\Entity\File::class, groups={"read_file"})
     * )
     *
     * @OA\Tag(name="file")
     *
     * @Security(name="api_key")
     */
    #[Route("/files/{id}", methods: ["GET"])]
    public function index(string $id): Response
    {
        // This controller is public to allow display of public messages
        // $this->denyAccessUnlessGranted('ROLE_USER');

        $file = $this->em->getRepository(File::class)->findOneById($id);
        if (empty($file)) {
            return new JsonResponse(['error' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new Response(
            $this->serialize($file, ['read_file']),
            Response::HTTP_OK
        );
    }
}
