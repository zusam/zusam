<?php

namespace App\Service;

use App\Entity\Tag as TagEntity;
use Doctrine\ORM\EntityManagerInterface;

class Tag
{
    private $em;

    public function __construct(
        EntityManagerInterface $em,
    ) {
        $this->em = $em;
    }

    public function create($name, $group)
    {
        $tag = new TagEntity();
        $tag->setGroup($group);
        $tag->setName($name);

        return $tag;
    }
}
