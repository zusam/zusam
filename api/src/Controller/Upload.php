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

            $this->em->persist($file);

            // immediately convert the file if it's an image
            $newContentUrl = pathinfo($file->getContentUrl(), PATHINFO_FILENAME).".jpg";
            if (substr($file->getType(), 0, 6) == "image/") {
                $imageService->createThumbnail(
                    $filesDir."/".$file->getContentUrl(),
                    $filesDir."/".$newContentUrl,
                    2048,
                    2048
                );
                $file->setStatus(File::STATUS_CONVERTED);
                $file->setContentUrl($newContentUrl);
            }

            $file->setFileIndex($request->request->get("fileIndex"));
            $this->em->flush();
            // Prevent the serialization of the file property
            $file->setFile(null);

            return $file;
        }

        // This will be handled by API Platform and returns a validation error.
        throw new ValidationException($this->validator->validate($file));
    }
}
