<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\ORM\Mapping as ORM;
use OpenApi\Annotations as OA;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: '`bookmark`')]
class Bookmark extends ApiEntity
{
    #[ORM\Id]
    #[ORM\Column(type: 'guid')]
    #[Assert\NotBlank]
    #[Groups(['public'])]
    /**
     * @OA\Property(type="guid")
     */
    private string $id;

    #[ORM\Column(type: 'integer')]
    #[Assert\NotNull]
    #[Assert\Type('integer')]
    #[Groups(['public'])]
    /**
     * @OA\Property(type="integer")
     */
    private int $createdAt;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'bookmarks')]
    #[Assert\NotNull]
    #[Groups(['public'])]
    /**
     * @OA\Property(type="App\Entity\User")
     */
    private User $user;

    #[ORM\ManyToOne(targetEntity: Message::class, inversedBy: 'bookmarks')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['read_bookmark'])]
    /**
     * @OA\Property(type="App\Entity\Message")
     */
    private Message $message;

    #[Groups(['public'])]
    /**
     * @OA\Property(type="string")
     */
    private string $entityType;

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

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }
}
