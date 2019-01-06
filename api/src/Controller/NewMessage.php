<?php

namespace App\Controller;

use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;

class NewMessage
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function __invoke(Message $data)
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $parent = $data->getParent();
        if (!empty($parent)) {
            $parent->setLastActivityDate(time());
            $this->em->persist($parent);
        }
        return $data;
    }
}
