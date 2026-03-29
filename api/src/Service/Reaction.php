<?php

namespace App\Service;

use App\Entity\Reaction as ReactionEntity;
use Doctrine\ORM\EntityManagerInterface;

class Reaction
{
    private $em;

    public function __construct(
        EntityManagerInterface $em,
    ) {
        $this->em = $em;
    }

    public function create($reactionValue, $author, $message): ?ReactionEntity
    {
        $existingReaction = $this->em->getRepository(ReactionEntity::class)->findOneBy([
            'author' => $author,
            'message' => $message,
            'value' => $reactionValue,
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
        $reactionInstance->setValue($reactionValue);
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
            $emoji = $reaction->getValue();
            $author = $reaction->getAuthor();

            if (!isset($summary[$emoji])) {
                $summary[$emoji] = [
                    'emoji' => $emoji,
                    'unified' => $this->emojiToUnified($emoji),
                    'users' => [],
                    'count' => 0,
                    'currentUserReactionId' => '',
                ];
            }

            $summary[$emoji]['users'][] = $author->getName();
            ++$summary[$emoji]['count'];

            if ($author->getId() === $currentUser->getId()) {
                $summary[$emoji]['currentUserReactionId'] = $reaction->getId();
            }
        }

        return array_values($summary);
    }

    private function emojiToUnified($emoji)
    {
        $chars = preg_split('//u', $emoji, -1, PREG_SPLIT_NO_EMPTY);
        $codes = array_map(fn($c) => dechex(mb_ord($c, 'UTF-8')), $chars);
        return strtolower(implode('-', $codes));
    }
}
