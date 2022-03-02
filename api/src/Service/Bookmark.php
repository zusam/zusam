<?php

namespace App\Service;

use App\Entity\Bookmark as BookmarkEntity;
use Doctrine\ORM\EntityManagerInterface;

class Bookmark
{
    private $em;

    public function __construct(
        EntityManagerInterface $em,
    ) {
        $this->em = $em;
    }

    public function create($user, $message)
    {
        $bookmark = new BookmarkEntity();
        $bookmark->setUser($user);
        $bookmark->setMessage($message);
        return $bookmark;
    }
}
