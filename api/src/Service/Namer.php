<?php

namespace App\Service;

use App\Entity\File;
use App\Service\Uuid;
use Vich\UploaderBundle\Mapping\PropertyMapping;
use Vich\UploaderBundle\Naming\NamerInterface;

class Namer implements NamerInterface
{
    public function name($file, PropertyMapping $mapping): string
    {
        /* @var $file UploadedFile */
        $uploadedFile = $mapping->getFile($file);
        if (!$uploadedFile) {
            return "";
        }
        $id = $file->getId() ?? Uuid::uuidv4();
        $extension = $uploadedFile->guessExtension();
        return empty($extension) ? $id : $id.".".$extension;
    }
}
