<?php

namespace App\Controller;

use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class NewMessage extends Controller
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function __invoke(Message $data)
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $this->denyAccessUnlessGranted(new Expression("user in object.getUsersAsArray()"), $data->getGroup());
        $parent = $data->getParent();
        $group = $data->getGroup();
        $group->setLastActivityDate(time());
        $this->em->persist($group);
        if (!empty($parent)) {
            $parent->setLastActivityDate(time());
            $this->em->persist($parent);
        }
        return $data;
    }
}
