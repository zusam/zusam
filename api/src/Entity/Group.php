<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Annotation\ApiSubresource;
use App\Controller\GroupInvitation;
use App\Controller\GroupResetInviteKey;
use App\Controller\LeaveGroup;
use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`group`")
 * @ORM\Entity
 * @ApiResource(
 *     attributes={
 *        "access_control"="is_granted('ROLE_USER')",
 *        "normalization_context"={"groups"={"read_group"}},
 *        "denormalization_context"={"groups"={"write_group"}}
 *     },
 *     itemOperations={
 *        "get"={
 *            "access_control"="is_granted('ROLE_USER') and user in object.getUsersAsArray()",
 *        },
 *        "put"={
 *            "access_control"="is_granted('ROLE_USER') and user in object.getUsersAsArray()",
 *        },
 *        "invitation"={
 *            "method"="POST",
 *            "path"="/groups/invitation/{inviteKey}",
 *            "controller"=GroupInvitation::class,
 *            "defaults"={"_api_receive"=false}
 *        },
 *        "reset-invite-key"={
 *            "method"="POST",
 *            "path"="/groups/{id}/reset-invite-key",
 *            "controller"=GroupResetInviteKey::class,
 *        },
 *        "leave"={
 *            "method"="POST",
 *            "path"="/groups/{id}/leave",
 *            "controller"=LeaveGroup::class,
 *        }
 *     },
 *     collectionOperations={
 *        "post"
 *     },
 * )
 */
class Group
{
    /**
     * @ORM\Id
     * @ORM\Column(type="guid")
     * @Groups({"read_group", "write_group", "read_user"})
     * @Assert\NotBlank()
     */
    private $id;

    /**
     * @ORM\Column(type="string", unique=true)
     * @Groups({"read_group"})
     * @Assert\NotBlank()
     */
    private $secretKey;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"read_group", "write_group", "read_user"})
     * @Assert\Type("integer")
     * @Assert\NotNull()
     */
    private $createdAt;

    /**
     * @ORM\Column(type="string")
     * @Groups({"read_group", "write_group", "read_user"})
     * @Assert\NotBlank()
     */
    private $name;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\User", mappedBy="groups")
     * @Groups({"read_group", "write_group"})
     */
    private $users;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="group")
     * @Groups({""})
     * @ApiSubresource
     */
    private $messages;

    /**
     * @ORM\Column(type="integer", nullable=true)
     * @Groups({"read_group", "read_user"})
     * @Assert\Type("integer")
     */
    private $lastActivityDate;

    /**
     * @ORM\Column(type="json", nullable=true)
     */
    private $data;

    /**
     * @Groups({"read_group", "read_user"})
     */
    private $entityType;

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->users = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->createdAt = time();
        $this->secretKey = Uuid::uuidv4();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getSecretKey(): string
    {
        return $this->secretKey;
    }

    public function resetSecretKey(): void
    {
        $this->secretKey = Uuid::uuidv4();
    }

    public function getCreatedAt(): int
    {
        return $this->createdAt;
    }

    public function setCreatedAt(int $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): self
    {
        $this->users[] = $user;
        return $this;
    }

    public function removeUser(User $user): self
    {
        $this->users->removeElement($user);
        return $this;
    }

    public function getUsersAsArray(): array
    {
        return $this->users->toArray();
    }

    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Message $message): void
    {
        $this->messages[] = $message;
    }

    public function removeMessage(Message $message): void
    {
        $this->messages->removeElement($message);
    }

    public function getLastActivityDate(): int
    {
        return $this->lastActivityDate ?? 0;
    }

    public function setLastActivityDate(?int $lastActivityDate): void
    {
        $this->lastActivityDate = $lastActivityDate ?? 0;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(?array $data): void
    {
        $this->data = $data;
    }
}
