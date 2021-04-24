<?php

namespace App\Service;

use App\Entity\File;
use App\Entity\Message;
use App\Service\Url as UrlService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class Preview
{
    private $em;
    private $params;

    public function __construct(
        EntityManagerInterface $em,
        ParameterBagInterface $params,
        UrlService $urlService
    ) {
        $this->em = $em;
        $this->params = $params;
        $this->urlService = $urlService;
    }

    public function genPreview(Message $message, bool $urlBased = true): ?File
    {
        // get preview with files
        if (count($message->getFiles()) > 0) {
            $firstFile = null;
            foreach ($message->getFiles() as $file) {
                if (!$firstFile || $file->getFileIndex() < $firstFile->getFileIndex()) {
                    $firstFile = $file;
                }
            }

            return $firstFile;
        }

        // We don't want to generate a preview based on urls when just creating the message
        if ($urlBased) {
            $urls = $message->getUrls();
            if (count($urls) > 0) {
                return $this->urlService->getLink($urls[0])->getPreview();
            }
        }

        return null;
    }
}
