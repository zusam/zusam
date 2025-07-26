<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\ORM\Mapping as ORM;
use OpenApi\Attributes as OA;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: '`notification`')]
class Notification extends ApiEntity
{
    // notification types
    public const NEW_MESSAGE = 'new_message';
    public const NEW_COMMENT = 'new_comment';
    public const USER_JOINED_GROUP = 'user_joined_group';
    public const USER_LEFT_GROUP = 'user_left_group';
    public const GLOBAL_NOTIFICATION = 'global_notification';
    public const GROUP_NAME_CHANGE = 'group_name_change';

    #[ORM\Id]
    #[ORM\Column(type: 'guid')]
    #[Groups(['read_notification'])]
    #[Assert\NotBlank]
    #[OA\Property(type: 'guid')]
    private string $id;

    #[ORM\Column(type: 'integer')]
    #[Groups(['read_notification'])]
    #[Assert\Type('integer')]
    #[Assert\NotNull]
    #[OA\Property(type: 'integer')]
    private int $createdAt;

    #[ORM\Column(type: 'string')]
    #[Groups(['read_notification'])]
    #[Assert\NotBlank]
    #[OA\Property(type: 'string')]
    private string $type;

    #[ORM\Column(type: 'guid', unique: true)]
    #[Assert\NotBlank]
    #[OA\Property(type: 'guid')]
    private string $secretKey;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'notifications')]
    #[ORM\JoinColumn(name: 'owner_id', referencedColumnName: 'id')]
    #[OA\Property(type: User::class)]
    private ?User $owner = null;

    #[ORM\ManyToOne(targetEntity: File::class)]
    #[ORM\JoinColumn(name: 'miniature_id', referencedColumnName: 'id')]
    #[Groups(['read_notification'])]
    #[OA\Property(type: File::class)]
    private ?File $miniature = null;

    #[ORM\Column(type: 'string')]
    #[Groups(['read_notification'])]
    #[OA\Property(type: 'string')]
    private string $target;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['read_notification'])]
    #[OA\Property(type: 'boolean')]
    private bool $read;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['read_notification'])]
    #[Assert\NotBlank]
    #[OA\Property(type: 'object')]
    private ?array $data = [];

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'from_user_id', referencedColumnName: 'id')]
    #[Groups(['read_notification'])]
    #[OA\Property(type: User::class)]
    private ?User $fromUser = null;

    #[ORM\ManyToOne(targetEntity: Group::class)]
    #[ORM\JoinColumn(name: 'from_group_id', referencedColumnName: 'id')]
    #[Groups(['read_notification'])]
    #[OA\Property(type: Group::class)]
    private ?Group $fromGroup = null;

    #[ORM\ManyToOne(targetEntity: Message::class)]
    #[ORM\JoinColumn(name: 'from_message_id', referencedColumnName: 'id')]
    #[Groups(['read_notification'])]
    #[OA\Property(type: Message::class)]
    private ?Message $fromMessage = null;

    #[Groups(['public'])]
    #[OA\Property(type: 'string')]
    private string $entityType;

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->createdAt = time();
        $this->secretKey = Uuid::uuidv4();
        $this->read = false;
        $this->data = [];
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

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): void
    {
        $this->type = $type;
    }

    public function getSecretKey(): string
    {
        return $this->secretKey;
    }

    public function resetSecretKey(): void
    {
        $this->secretKey = Uuid::uuidv4();
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(User $owner): void
    {
        $this->owner = $owner;
    }

    public function getMiniature(): ?File
    {
        return $this->miniature;
    }

    public function setMiniature(File $miniature): void
    {
        $this->miniature = $miniature;
    }

    public function getTarget(): string
    {
        return $this->target;
    }

    public function setTarget(string $target): void
    {
        $this->target = $target;
    }

    public function getRead(): bool
    {
        return $this->read;
    }

    public function setRead(bool $read): void
    {
        $this->read = $read;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(array $data): void
    {
        $this->data = $data;
    }

    public function getFromUser(): ?User
    {
        return $this->fromUser;
    }

    public function setFromUser(User $fromUser): void
    {
        $this->fromUser = $fromUser;
    }

    public function getFromGroup(): ?Group
    {
        return $this->fromGroup;
    }

    public function setFromGroup(Group $fromGroup): void
    {
        $this->fromGroup = $fromGroup;
    }

    public function getFromMessage(): ?Message
    {
        return $this->fromMessage;
    }

    public function setFromMessage(Message $fromMessage): void
    {
        $this->fromMessage = $fromMessage;
    }
}
