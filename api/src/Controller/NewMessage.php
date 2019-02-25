<?php

namespace App\Controller;

use App\Entity\Message;
use App\Entity\File;
use App\Service\Url as UrlService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\ExpressionLanguage\Expression;

class NewMessage extends Controller
{
    private $em;
    private $urlService;

    public function __construct(EntityManagerInterface $em, UrlService $urlService)
    {
        $this->em = $em;
        $this->urlService = $urlService;
    }

    public function __invoke(Message $data)
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $this->denyAccessUnlessGranted(new Expression("user in object.getUsersAsArray()"), $data->getGroup());
        $data->setPreview($this->genPreview($data));
        $parent = $data->getParent();
        $author = $data->getAuthor();
        $group = $data->getGroup();
        $group->setLastActivityDate(time());
        if (!empty($parent)) {
            $newsId = $parent->getId();
        } else {
            $newsId = $data->getId();
        }
        foreach ($group->getUsers() as $user) {
            if ($user->getId() != $author->getId()) {
                $user->addNews($newsId);
                $user->addNews($group->getId());
                $this->em->persist($user);
            }
        }
        $this->em->persist($group);
        if (!empty($parent)) {
            $parent->setLastActivityDate(time());
            $this->em->persist($parent);
        }
        return $data;
    }

    public function genPreview(Message $message): ?File
    {
        // get preview with files
        if (count($message->getFiles()) > 0) {
            $firstFile = null;
            foreach($message->getFiles() as $file) {
                if (!$firstFile || $file->getFileIndex() < $firstFile->getFileIndex()) {
                    $firstFile = $file;
                }
            }
            return $firstFile;
        }
        // if no files, search for preview in text
        $urls = $message->getUrls();
        if (count($urls) > 0) {
            return $this->urlService->getLink($urls[0])->getPreview();
        }
        return null;
    }
}
