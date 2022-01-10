<?php

namespace App\Service;

use App\Entity\File as FileEntity;
use App\Entity\Message as MessageEntity;
use App\Entity\Notification as NotificationEntity;
use App\Entity\Link as LinkEntity;
use App\Service\Link as LinkService;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;

class Notification
{
    private $em;
    private $linkService;

    public function __construct(
        EntityManagerInterface $em,
        LinkService $linkService,
    ) {
        $this->em = $em;
        $this->linkService = $linkService;
    }

    public function getTitle($notification): string
    {
      try {
        $notif_data = $notification->getData();
        $message = $notification->getFromMessage();
        if (empty($message)) {
          return "";
        }
        $data = $message->getData();
        $urls = $message->getUrls();
      } catch (\Exception $e) {
        return "";
      }
      $title = "";
      if (!empty($data["title"])) {
        $title = $data["title"];
      }
      if (empty($title) && count($urls) > 0) {
        $link = $this->em->getRepository(LinkEntity::class)->findOneByUrl($urls[0]);
        if (!empty($link)) {
          if (empty($link->getData()["url"])) {
            $this->linkService->hydrateLink($link);
          }
          if (!empty($link->getData()["url"])) {
            $title = $link->getData()["title"] ?? $link->getData()["description"] ?? $link->getData()["url"];
          }
        }
      }

      if (empty($title) && !empty($data["text"])) {
        $title = $data["text"];
      }

      return $title;
    }

    public function getParentAuthorName($notification): string
    {
      try {
        $message = $notification->getFromMessage();
        if (empty($message)) {
          return "";
        }
        $author = $message->getAuthor();
      } catch (\Exception $e) {
        return "";
      }

      return $author->getName();
    }

    public function create($type, $target, $owner, $fromUser = null, $fromGroup = null, $fromMessage = null)
    {
      $notif = new Notification();
      $notif->setTarget($target->getId());
      $notif->setOwner($owner);
      $notif->setFromUser($fromUser);
      $notif->setFromGroup($fromGroup);
      $notif->setType($type);
      $notif->setFromMessage($fromMessage);
      $this->em->persist($notif);
      return $notif;
    }
}
