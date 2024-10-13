<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\ORM\Mapping as ORM;
use OpenApi\Annotations as OA;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`bookmark`")
 *
 * @ORM\Entity()
 */
class Bookmark extends ApiEntity
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
     * @Groups("public")
     *
     * @OA\Property(type="integer")
     *
     * @ORM\Column(type="integer")
     */
    private $createdAt;

    /**
     * @Assert\NotNull()
     *
     * @Groups("public")
     *
     * @OA\Property(type="App\Entity\User")
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="bookmarks")
     */
    private $user;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Message", inversedBy="bookmarks")
     *
     * @Groups({"read_bookmark"})
     *
     * @OA\Property(type="App\Entity\Message")
     */
    private $message;

    /**
     * @Groups("public")
     *
     * @OA\Property(type="string")
     */
    private $entityType;

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

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): void
    {
        $this->user = $user;
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
