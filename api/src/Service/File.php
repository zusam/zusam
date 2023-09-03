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
        // don't convert video if it's in a playable format and size
        if (
            in_array($file->getType(), explode(",", $this->params->get('video_format_not_converted')))
            && FileEntity::STATUS_READY != $file->getStatus()
            && $file->getSize() < intval($this->params->get('video_size_not_converted')) * 1024 * 1024
        ) {
            $file->setStatus(FileEntity::STATUS_READY);
        }

        // don't convert audio if it's in a playable format
        if (
            in_array($file->getType(), explode(",", $this->params->get('audio_format_not_converted')))
            && FileEntity::STATUS_READY != $file->getStatus()
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

        // don't convert an already small jpeg
        if (
            'image/jpeg' == $file->getType()
            && FileEntity::STATUS_READY != $file->getStatus()
        ) {
            list($width, $height) = getimagesize($this->params->get('dir.files').'/'.$file->getContentUrl());
            if ($width <= 2048 && $height <= 2048) {
                $file->setStatus(FileEntity::STATUS_READY);
            }
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

        $target = $this->params->get('dir.files') . "/" . $file->getContentUrl();
        if ($copy) {
            copy($symfonyFile->getRealPath(), $target);
        } else {
            rename($symfonyFile->getRealPath(), $target);
        }
        @chmod($target, 0666 & ~umask());
        $file = $this->initialConversion($file);
        $this->em->persist($file);
        $this->em->flush();

        return $file;
    }

    public function createFromPath($file_path, $copy = false): ?FileEntity
    {
        if (!is_file($file_path) || !is_readable($file_path)) {
            return null; // TODO throw exception
        }

        $symfonyFile = new SymfonyFile($file_path);
        return $this->createFromSymfonyFile($symfonyFile, $copy);
    }
}
