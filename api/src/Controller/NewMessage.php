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
}
