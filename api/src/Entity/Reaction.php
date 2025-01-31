<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use OpenApi\Annotations as OA;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="reaction")
 *
 * @ORM\Entity()
 */
class Reaction extends ApiEntity
{
    /**
     * @Assert\NotBlank()
     *
     * @Groups("public")
     *
     * @OA\Property(type="guid")
     *
     * @ORM\Column(type="guid")
     *
     * @ORM\Id
     */
    private $id;

    /**
     * @Assert\NotNull()
     *
     * @Assert\Type("integer")
     *
     * @Groups({"read_reaction"})
     *
     * @OA\Property(type="integer")
     *
     * @ORM\Column(type="integer")
     */
    private $createdAt;

    /**
     * @Assert\NotBlank()
     *
     * @Groups({"read_reaction"})
     *
     * @OA\Property(type="string")
     *
     * @ORM\Column(type="string")
     */
    private $reaction;

    /**
     * @Groups("public")
     *
     * @OA\Property(type="array", @OA\Items(type="App\Entity\User"))
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="reactions")
     */
    private $author;

    /**
     * @Groups({"read_reaction"})
     *
     * @OA\Property(type="App\Entity\Message")
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Message", inversedBy="reactions")
     */
    private Message $message;

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->createdAt = time();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getCreatedAt(): int
    {
        return $this->createdAt;
    }

    public function setCreatedAt(int $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(User $author): void
    {
        $this->author = $author;
    }

    public function getReaction(): string
    {
        if (null === $this->reaction) {
            return "";
        } else {
            return $this->reaction;
        }
    }

    public function setReaction(string $reaction): void
    {
        $this->reaction = $reaction;
    }

    public function getMessage(): Message
    {
        return $this->message;
    }

    public function setMessage(Message $message): void
    {
        $this->message = $message;
    }
}
