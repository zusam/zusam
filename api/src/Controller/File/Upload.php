<?php

namespace App\Controller\File;

use App\Controller\ApiController;
use App\Entity\File;
use App\Service\File as FileService;
use App\Service\Image as ImageService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Upload extends ApiController
{
    private $fileService;

    public function __construct(
        EntityManagerInterface $em,
        FileService $fileService,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
        $this->fileService = $fileService;
    }

    /**
     * @OA\RequestBody(
     *
     *  @OA\Schema(
     *    type="object",
     *
     *    @OA\Property(
     *      property="file",
     *      type="binary"
     *    )
     *  )
     * )
     *
     * @OA\Response(
     *  response=201,
     *  description="Upload a file",
     *
     *  @Model(type=App\Entity\File::class, groups={"read_file"})
     * )
     *
     * @OA\Tag(name="file")
     *
     * @Security(name="api_key")
     */
    #[Route('/files', methods: ['POST'])]
    public function index(Request $request, ImageService $imageService): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        if (!file_exists($this->getParameter('dir.files'))) {
            mkdir($this->getParameter('dir.files'));
        }
        $filesDir = realpath($this->getParameter('dir.files'));
        if (!is_writeable($filesDir)) {
            throw new \Exception("Target directory ({$filesDir} [".$this->getParameter('dir.files').']) is not writable !');
        }

        $uploadedFile = $request->files->get('file');

        if (empty($uploadedFile)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }

        $file = $this->fileService->createFromSymfonyFile($uploadedFile);

        $this->em->persist($file);
        $this->em->flush();

        return new Response(
            $this->serialize($file, ['read_file']),
            Response::HTTP_CREATED
        );
    }
}
