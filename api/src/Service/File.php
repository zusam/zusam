<?php

namespace App\Service;

use App\Entity\File as FileEntity;
use App\Service\Image as ImageService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\File\File as SymfonyFile;

class File
{
    private $em;
    private $imageService;
    private $params;

    public function __construct(
        EntityManagerInterface $em,
        ImageService $imageService,
        ParameterBagInterface $params
    ) {
        $this->em = $em;
        $this->imageService = $imageService;
        $this->params = $params;
    }

    public function isSupportedFileType($file): bool
    {
        // check if mimetype is in accepted list
        if (
            !in_array(explode("/", $file->getType())[0], ["image", "video", "audio"])
            && $file->getType() !== "application/pdf"
        ) {
            return false;
        }

        // check if mimetype is currently allowed in parameters
        if ('image/' == substr($file->getType(), 0, 6) && $this->params->get('allow.upload.image') != "true") {
            return false;
        }
        if ('video/' == substr($file->getType(), 0, 6) && $this->params->get('allow.upload.video') != "true") {
            return false;
        }
        if ('audio/' == substr($file->getType(), 0, 6) && $this->params->get('allow.upload.audio') != "true") {
            return false;
        }
        if ('application/pdf' == $file->getType() && $this->params->get('allow.upload.pdf') != "true") {
            return false;
        }

        return true;
    }

    public function initialConversion($file): FileEntity
    {

        // don't convert video if it's an mp4 and under 10Mo
        // TODO: the issue is that these mp4 could have libmp3lame audio instead of aac
        // this will cause audio playback issues on iOS.
        if (
            'video/mp4' == $file->getType()
            && FileEntity::STATUS_READY != $file->getStatus()
            && $file->getSize() < 10 * 1024 * 1024
        ) {
            $file->setStatus(FileEntity::STATUS_READY);
        }

        // don't convert a gif
        // TODO: handle gif correctly, AKA convert them to mp4
        if (
            'image/gif' == $file->getType()
            && FileEntity::STATUS_READY != $file->getStatus()
        ) {
            $file->setStatus(FileEntity::STATUS_READY);
        }

        // don't convert a pdf
        if (
            'application/pdf' == $file->getType()
            && FileEntity::STATUS_READY != $file->getStatus()
        ) {
            $file->setStatus(FileEntity::STATUS_READY);
        }

        // immediately process the file if it's an image
        if (
            'image/' == substr($file->getType(), 0, 6)
            && FileEntity::STATUS_READY != $file->getStatus()
        ) {
            list($width, $height) = getimagesize($this->params->get('dir.files').'/'.$file->getContentUrl());
            // This is a special check for long format images that should not be limited in height
            // example: https://imgs.xkcd.com/comics/earth_temperature_timeline.png
            if ($height / $width > 10) {
                $newContentUrl = pathinfo($file->getContentUrl(), PATHINFO_FILENAME).'.jpg';
                $this->imageService->createThumbnail(
                    $this->params->get('dir.files').'/'.$file->getContentUrl(),
                    $this->params->get('dir.files').'/'.$newContentUrl,
                    2048,
                    999999
                );
                $file->setContentUrl($newContentUrl);
            } else {
                if ($width > 2048 || $height > 2048 || 'image/jpeg' !== $file->getType()) {
                    $newContentUrl = pathinfo($file->getContentUrl(), PATHINFO_FILENAME).'.jpg';
                    $this->imageService->createThumbnail(
                        $this->params->get('dir.files').'/'.$file->getContentUrl(),
                        $this->params->get('dir.files').'/'.$newContentUrl,
                        2048,
                        2048
                    );
                    $file->setContentUrl($newContentUrl);
                }
            }
            $file->setStatus(FileEntity::STATUS_READY);
        }

        return $file;
    }

    public function createFromSymfonyFile($symfonyFile, $copy = false): ?FileEntity
    {
        $file = new FileEntity();
        $file->setType($symfonyFile->getMimeType());
        $file->setStatus(FileEntity::STATUS_RAW);
        $file->setSize($symfonyFile->getSize());
        $extension = $symfonyFile->guessExtension() ?? pathinfo($symfonyFile->getRealPath(), PATHINFO_EXTENSION);
        $file->setContentUrl($file->getId() . "." . $extension);

        if (!$this->isSupportedFileType($file)) {
            return null; // TODO throw exception
        }

        if ($copy) {
            copy($symfonyFile->getRealPath(), $this->params->get('dir.files') . "/" . $file->getContentUrl());
        } else {
            rename($symfonyFile->getRealPath(), $this->params->get('dir.files') . "/" . $file->getContentUrl());
        }
        $file = $this->initialConversion($file);
        $this->em->persist($file);
        $this->em->flush();

        return $file;
    }

    public function createFromPath($file_path, $copy = false): ?FileEntity
    {
        if (!is_file($file_path) && !is_readable($file_path)) {
            return null; // TODO throw exception
        }

        $symfonyFile = new SymfonyFile($file_path);
        if (empty($symfonyFile)) {
            return null; // TODO throw exception
        }

        return $this->createFromSymfonyFile($symfonyFile, $copy);
    }
}
