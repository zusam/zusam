<?php
namespace App\Controller;

use ApiPlatform\Core\Bridge\Symfony\Validator\Exception\ValidationException;
use App\Entity\File;
use App\Form\FileType;
use App\Service\Image as ImageService;
use App\Service\Uuid;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class Upload extends Controller
{
	private $em;
	private $factory;
	private $validator;

	public function __construct(
		EntityManagerInterface $em,
		FormFactoryInterface $factory,
		ValidatorInterface $validator
	) {
		$this->em = $em;
		$this->factory = $factory;
		$this->validator = $validator;
	}

    public function __invoke(Request $request, ImageService $imageService): File
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

            return $file;
        }

        // This will be handled by API Platform and returns a validation error.
        throw new ValidationException($this->validator->validate($file));
    }
}
