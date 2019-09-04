<?php
namespace App\Controller\File;

use App\Controller\ApiController;
use App\Entity\File;
use App\Form\FileType;
use App\Service\Image as ImageService;
use App\Service\Uuid;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class Upload extends ApiController
{
    private $factory;
    private $validator;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $factory,
        ValidatorInterface $validator,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
        $this->factory = $factory;
        $this->validator = $validator;
    }

    /**
     * @Route("/files", methods={"POST"})
     */
    public function index(Request $request, ImageService $imageService): Response
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        if (!file_exists($this->getParameter("dir.files"))) {
            mkdir($this->getParameter("dir.files"));
        }
        $filesDir = realpath($this->getParameter("dir.files"));
        if (!is_writeable($filesDir)) {
            throw new \Exception("Target directory ($filesDir [".$this->getParameter("dir.files")."]) is not writable !");
        }

        $file = new File();
        $form = $this->createForm(FileType::class, $file);
        $form->submit($request->files->all());
        if ($form->isValid()) {

            // persist file first to let Vich bundle populate the object attributes
            $this->em->persist($file);

            // don't convert video if it's an mp4 and under 10Mo
            // TODO: the issue is that these mp4 could have libmp3lame audio instead of aac
            // this will cause audio playback issues on iOS.
            if (
                $file->getType() == "video/mp4"
                && $file->getStatus() != File::STATUS_READY
                && $file->getSize() < 10 * 1024 * 1024
            ) {
                $file->setStatus(File::STATUS_READY);
            }

            // don't convert a gif
            // TODO: handle gif correctly, AKA convert them to mp4
            if (
                $file->getType() == "image/gif"
                && $file->getStatus() != File::STATUS_READY
            ) {
                $file->setStatus(File::STATUS_READY);
            }

            // immediately process the file if it's an image
            if (
                substr($file->getType(), 0, 6) == "image/"
                && $file->getStatus() != File::STATUS_READY
            ) {
                list($width, $height) = getimagesize($filesDir."/".$file->getContentUrl());
                // This is a special check for long format images that should not be limited in height
                // example: https://imgs.xkcd.com/comics/earth_temperature_timeline.png
                if ($height/$width > 10) {
                    $newContentUrl = pathinfo($file->getContentUrl(), PATHINFO_FILENAME).".jpg";
                    $imageService->createThumbnail(
                        $filesDir."/".$file->getContentUrl(),
                        $filesDir."/".$newContentUrl,
                        2048,
                        999999
                    );
                    $file->setContentUrl($newContentUrl);
                } else {
                    if ($width > 2048 || $height > 2048 || $file->getType() !== "image/jpeg") {
                        $newContentUrl = pathinfo($file->getContentUrl(), PATHINFO_FILENAME).".jpg";
                        $imageService->createThumbnail(
                            $filesDir."/".$file->getContentUrl(),
                            $filesDir."/".$newContentUrl,
                            2048,
                            2048
                        );
                        $file->setContentUrl($newContentUrl);
                    }
                }
                $file->setStatus(File::STATUS_READY);
            }

            if ($request->request->get("fileIndex")) {
                $file->setFileIndex($request->request->get("fileIndex"));
            }

            $this->em->flush();

            // Prevent the serialization of the file property
            $file->setFile(null);

            return new Response(
                $this->serialize($file, ["read_group"]),
                Response::HTTP_CREATED
            );
        }

        throw new \Exception($this->validator->validate($file));
    }
}
