<?php

namespace App\Service;

use App\Entity\File as FileEntity;
use App\Entity\Reaction as ReactionEntity;
use App\Entity\Notification as NotificationEntity;
use App\Service\Notification as NotificationService;
use App\Service\Url as UrlService;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Cache\TagAwareCacheInterface;

class Reaction
{
    private $em;

    public function __construct(
        EntityManagerInterface $em,
    ) {
        $this->em = $em;
    }

    public function create($reaction, $author, $message): ?ReactionEntity
    {
        $existingReaction = $this->em->getRepository(ReactionEntity::class)->findOneBy([
            'author' => $author,
            'message' => $message,
            'reaction' => $reaction
        ]);

        if ($existingReaction) {
            $this->em->remove($existingReaction);

            $author->setLastActivityDate(time());
            $this->em->persist($author);
            $this->em->flush();
            return null;
        }

        $reactionInstance = new ReactionEntity();
        $reactionInstance->setAuthor($author);
        $reactionInstance->setMessage($message);
        $reactionInstance->setCreatedAt(time());
        $reactionInstance->setReaction($reaction);
        $message->addReaction($reactionInstance);
        $author->setLastActivityDate(time());

        $this->em->persist($reactionInstance);
        $this->em->persist($message);
        $this->em->persist($author);
        $this->em->flush();

        return $reactionInstance;
    }

    public function getReactionSummary($message, $currentUser)
    {

        $reactions = $message->getReactions();
        $summary = [];

        foreach ($reactions as $reaction) {
            $emoji = $reaction->getReaction();
            $author = $reaction->getAuthor();

            if (!isset($summary[$emoji])) {
                $summary[$emoji] = [
                    'emoji' => $emoji,
                    'users' => [],
                    'count' => 0,
                    'currentUserReactionId' => ''
                ];
            }

            $summary[$emoji]['users'][] = $author->getName();
            $summary[$emoji]['count']++;

            if ($author->getId() === $currentUser->getId()) {
                $summary[$emoji]['currentUserReactionId'] = $reaction->getId();
            }
        }

        return array_values($summary);
    }
}
