<?php

namespace App\Service;

use App\Entity\File as FileEntity;
use App\Entity\Message as MessageEntity;
use App\Entity\Notification;
use App\Service\Url as UrlService;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;

class Message
{
    private $em;
    private $urlService;

    public function __construct(
        EntityManagerInterface $em,
        UrlService $urlService
    ) {
        $this->em = $em;
        $this->urlService = $urlService;
    }

    public function create($data, $author, $group)
    {
        $message = new MessageEntity();
        $message->setAuthor($author);
        $message->setGroup($group);

        if (!empty($data['createdAt'])) {
            $message->setCreatedAt($data['createdAt']);
        }

        if (!empty($data['parent'])) {
            $parent = $this->em->getRepository(MessageEntity::class)->findOneById($data['parent']);
            $message->setIsInFront(false);
        } else {
            $parent = null;
            $message->setIsInFront(true);
        }
        $message->setParent($parent);

        if (!empty($data['data'])) {
            $message->setData($data['data']);
        }

        if (!empty($data['files'])) {
            $message->setFiles(new ArrayCollection(array_map(function ($fid) {
                return $this->em->getRepository(FileEntity::class)->findOneById($fid);
            }, $data['files'])));
        }

        $message->setPreview($this->genPreview($message, false));
        $this->em->persist($message);

        // Update tasks
        $parent = $message->getParent();
        foreach ($group->getUsers() as $user) {
            if ($user->getId() != $author->getId()) {
                $notif = new Notification();
                $notif->setTarget($message->getId());
                $notif->setOwner($user);
                $notif->setFromUser($author);
                $notif->setFromGroup($group);
                if (!empty($parent)) {
                    $notif->setFromMessage($parent);
                    $notif->setType(Notification::NEW_COMMENT);
                } else {
                    $notif->setFromMessage($message);
                    $notif->setType(Notification::NEW_MESSAGE);
                }
                $this->em->persist($notif);
            }
        }

        $author->setLastActivityDate(time());
        $group->setLastActivityDate(time());
        $this->em->persist($group);
        $this->em->persist($author);

        if (!empty($parent)) {
            $parent->setLastActivityDate(time());
            $this->em->persist($parent);
        }

        $this->em->flush();

        return $message;
    }

    public function genPreview(MessageEntity $message, bool $urlBased = true): ?FileEntity
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
