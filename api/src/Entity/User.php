<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use OpenApi\Annotations as OA;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`user`")
 *
 * @ORM\Entity()
 */
class User extends ApiEntity implements UserInterface, PasswordAuthenticatedUserInterface
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
     * @OA\Property(type="integer")
     *
     * @ORM\Column(type="integer")
     */
    private $createdAt;

    /**
     * @Assert\NotBlank()
     *
     * @Groups({"read_me", "write_user"})
     *
     * @OA\Property(type="string")
     *
     * @ORM\Column(type="string", unique=true)
     */
    private $login;

    /**
     * @Assert\NotBlank()
     *
     * @Groups({"write_user"})
     *
     * @OA\Property(type="string")
     *
     * @ORM\Column(type="string")
     */
    private $password;

    /**
     * @Assert\NotBlank()
     *
     * @OA\Property(type="guid")
     *
     * @ORM\Column(type="guid", unique=true)
     */
    private $secretKey;

    /**
     * @Groups({"read_me"})
     *
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Group"))
     *
     * @ORM\JoinTable(name="users_groups")
     *
     * @ORM\ManyToMany(targetEntity="App\Entity\Group", inversedBy="users")
     */
    private $groups;

    /**
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="author")
     */
    private $messages;

    /**
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Bookmark"))
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Bookmark", mappedBy="user")
     */
    private $bookmarks;

    /**
     * @Groups({"read_me", "read_user", "write_user", "read_message_preview"})
     *
     * @OA\Property(type="App\Entity\File")
     *
     * @ORM\JoinColumn(name="avatar_id", referencedColumnName="id")
     *
     * @ORM\OneToOne(targetEntity="App\Entity\File")
     */
    private $avatar;

    /**
     * @Assert\NotBlank()
     *
     * @Groups("public")
     *
     * @OA\Property(type="string")
     *
     * @ORM\Column(type="string")
     */
    private $name;

    /**
     * @Assert\NotBlank()
     *
     * @Groups({"read_me", "read_user", "write_user"})
     *
     * @OA\Property(type="object")
     *
     * @ORM\Column(type="json", nullable=true)
     */
    private $data;

    /**
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Notification"))
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Notification", mappedBy="owner")
     *
     * @ORM\OrderBy({"createdAt" = "DESC"})
     */
    private $notifications;

    /**
     * @Assert\Type("integer")
     *
     * @Groups({"read_me"})
     *
     * @OA\Property(type="integer")
     *
     * @ORM\Column(type="integer", nullable=true)
     */
    private $lastActivityDate;

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
        $this->groups = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->bookmarks = new ArrayCollection();
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

    public function getLogin(): string
    {
        return $this->login;
    }

    public function setLogin(string $login): void
    {
        $this->login = $login;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): void
    {
        $this->password = $password;
    }

    public function getSecretKey(): string
    {
        return $this->secretKey;
    }

    public function resetSecretKey(): void
    {
        $this->secretKey = Uuid::uuidv4();
    }

    public function getGroups(): Collection
    {
        return $this->groups;
    }

    public function addGroup(Group $group): void
    {
        $this->groups[] = $group;
    }

    public function removeGroup(Group $group): void
    {
        $this->groups->removeElement($group);
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

    public function getBookmarks(int $limit = 0): Collection
    {
        if (0 === $limit) {
            return $this->bookmarks;
        } else {
            return new ArrayCollection($this->bookmarks->slice(0, $limit));
        }
    }

    public function addBookmark(Bookmark $bookmark): void
    {
        $this->bookmarks[] = $bookmark;
    }

    public function removeBookmark(Bookmark $bookmark): void
    {
        $this->bookmarks->removeElement($bookmark);
    }

    public function getAvatar(): ?File
    {
        return $this->avatar;
    }

    public function setAvatar(File $avatar): void
    {
        $this->avatar = $avatar;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(array $data): void
    {
        $this->data = $data;
    }

    public function getNotifications(int $limit = 0): Collection
    {
        if (0 === $limit) {
            return $this->notifications;
        } else {
            return new ArrayCollection($this->notifications->slice(0, $limit));
        }
    }

    public function addNotification(Notification $notification): void
    {
        $this->notifications[] = $notification;
    }

    public function removeNotification(Notification $notification): void
    {
        $this->notifications->removeElement($notification);
    }

    public function getLastActivityDate(): int
    {
        return $this->lastActivityDate ?? 0;
    }

    public function setLastActivityDate(?int $lastActivityDate): void
    {
        $this->lastActivityDate = $lastActivityDate ?? 0;
    }

    // necessary for UserInterface
    public function getUserIdentifier(): string
    {
        return $this->id;
    }

    // necessary for UserInterface
    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    // necessary for UserInterface
    public function eraseCredentials()
    {
    }
}
