<?php

namespace App\Controller\File;

use App\Controller\ApiController;
use App\Entity\File;
use App\Service\Image as ImageService;
use App\Service\File as FileService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;

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
     * @Route("/files", methods={"POST"})
     * @SWG\Parameter(
     *  name="file",
     *  in="formData",
     *  type="file",
     * )
     * @SWG\Parameter(
     *  name="fileIndex",
     *  in="formData",
     *  type="integer",
     * )
     * @SWG\Response(
     *  response=201,
     *  description="Upload a file",
     *  @Model(type=App\Entity\File::class, groups={"read_file"})
     * )
     * @SWG\Tag(name="file")
     * @Security(name="api_key")
     */
    public function index(Request $request, ImageService $imageService): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        if (!file_exists($this->getParameter('dir.files'))) {
            mkdir($this->getParameter('dir.files'));
        }
        $filesDir = realpath($this->getParameter('dir.files'));
        if (!is_writeable($filesDir)) {
            throw new \Exception("Target directory ($filesDir [".$this->getParameter('dir.files').']) is not writable !');
        }

        $uploadedFile = $request->files->get('file');

        if (empty($uploadedFile)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }

        $file = $this->fileService->createFromSymfonyFile($uploadedFile);

        //if (!$this->fileService->isSupportedFileType($file)) {
        //    return new JsonResponse(['error' => 'Unsupported file type'], Response::HTTP_BAD_REQUEST);
        //}

        //$file = $this->fileService->initialConversion($file);

        if ($request->request->get('fileIndex')) {
            $file->setFileIndex($request->request->get('fileIndex'));
        }

        $this->em->flush();

        // Prevent the serialization of the file property
        //$file->setFile(null);

        $this->em->persist($file);

        return new Response(
            $this->serialize($file, ['read_file']),
            Response::HTTP_CREATED
        );
    }
}
