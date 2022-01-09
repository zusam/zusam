<?php

namespace App\Service;

use App\Entity\File as FileEntity;
use App\Entity\Link as LinkEntity;
use App\Service\Url;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;

class Link
{
    private $em;

    public function __construct(
        EntityManagerInterface $em,
    ) {
        $this->em = $em;
    }

    public function hydrateLink($link)
    {
      $data = Url::getData($link->getUrl());
      $data["loading"] = false;
      $link->setData($data);
      $link->setUpdatedAt(time());
      if (!empty($data['image'])) {
        try {
          $preview = new FileEntity();
          $preview->setType('image/jpeg');
          $preview->setContentUrl($preview->getId().'.jpg');
          $this->imageService->createThumbnail($data['image'], $filesDir.'/'.$preview->getContentUrl(), 2048, 2048);
          $preview->setSize(filesize($filesDir.'/'.$preview->getContentUrl()));
          $link->setPreview($preview);
          $this->em->persist($preview);
        } catch (\Exception $e) {
          // Something went wrong. What should we do ?
          // TODO
        }
      }
      $this->em->persist($link);
      $this->em->flush();
      return $link;
    }

    public function create($url)
    {
      $link = new LinkEntity($url);
      return $this->hydrateLink($link);
    }
}
