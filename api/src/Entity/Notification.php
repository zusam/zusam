<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`notification`")
 * @ORM\Entity()
 */
class Notification
{
    // notification types
    const NEW_MESSAGE = 'new_message';
    const USER_JOINED_GROUP = 'user_joined_group';

    /**
     * @ORM\Id
     * @ORM\Column(type="guid")
     * @Groups({"read_me"})
     * @Assert\NotBlank()
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"read_me"})
     * @Assert\Type("integer")
     * @Assert\NotNull()
     */
    private $createdAt;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"read_me"})
     * @Assert\Type("integer")
     */
    private $readAt;

    /**
     * @ORM\Column(type="string")
     * @Groups({"read_me"})
     * @Assert\NotBlank()
     */
    private $type;

    /**
     * @ORM\Column(type="guid", unique=true)
     * @Assert\NotBlank()
     */
    private $secretKey;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="notifications")
     * @ORM\JoinColumn(name="owner_id", referencedColumnName="id")
     */
    private $owner;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\File")
     * @ORM\JoinColumn(name="miniature_id", referencedColumnName="id")
     * @Groups({"read_me"})
     */
    private $miniature;

    /**
     * @ORM\Column(type="string")
     * @Groups({"read_me"})
     */
    private $target;

    /**
     * @ORM\Column(type="json", nullable=true)
     * @Groups({"read_me"})
     * @Assert\NotBlank()
     */
    private $data;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User")
     * @ORM\JoinColumn(name="from_user_id", referencedColumnName="id")
     * @Groups({"read_me"})
     */
    private $fromUser;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Group")
     * @ORM\JoinColumn(name="from_group_id", referencedColumnName="id")
     * @Groups({"read_me"})
     */
    private $fromGroup;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Message")
     * @ORM\JoinColumn(name="from_message_id", referencedColumnName="id")
     */
    private $fromMessage;

    /**
     * @Groups({"read_me"})
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
        $this->secretKey = Uuid::uuidv4();
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

    public function getReadAt(): ?int
    {
        return $this->readAt;
    }

    public function setReadAt(int $readAt): void
    {
        $this->readAt = $readAt;
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