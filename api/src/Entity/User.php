<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Annotation\ApiSubresource;
use App\Controller\Me;
use App\Controller\PutUser;
use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`user`")
 * @ORM\Entity()
 * @ApiResource(
 *     attributes={
 *        "access_control"="is_granted('ROLE_USER')",
 *        "normalization_context"={"groups"={"read_user"}},
 *        "denormalization_context"={"groups"={"write_user"}}
 *     },
 *     itemOperations={
 *          "get"={
 *              "normalization_context"={"groups"={"read_user"}},
 *          },
 *          "put"={
 *              "method"="PUT",
 *              "path"="/users/{id}.{_format}",
 *              "controller"=PutUser::class,
 *              "normalization_context"={"groups"={"read_user"}},
 *          },
 *          "delete",
 *          "me"={
 *              "method"="GET",
 *              "path"="/me",
 *              "controller"=Me::class,
 *              "defaults"={"_api_receive"=false},
 *              "normalization_context"={"groups"={"read_user", "read_me"}},
 *          }
 *     }
 * )
 */
class User implements UserInterface, \Serializable
{
    /**
     * @ORM\Id
     * @ORM\Column(type="guid")
     * @Groups({"read_user", "write_user", "read_message"})
     * @Assert\NotBlank()
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"read_user", "write_user"})
     * @Assert\Type("integer")
     * @Assert\NotNull()
     */
    private $createdAt;

    /**
     * @ORM\Column(type="string", unique=true)
     * @Groups({"read_user", "write_user"})
     * @Assert\NotBlank()
     */
    private $login;

    /**
     * @ORM\Column(type="string")
     * @Groups({"write_user"})
     * @Assert\NotBlank()
     */
    private $password;

    /**
     * @ORM\Column(type="guid", unique=true)
     * @Assert\NotBlank()
     */
    private $secretKey;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Group", inversedBy="users")
     * @ORM\JoinTable(name="users_groups")
     * @Groups({"read_me"})
     * @ApiSubresource
     */
    private $groups;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="author")
     */
    private $messages;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\File")
     * @ORM\JoinColumn(name="avatar_id", referencedColumnName="id")
     * @Groups({"read_user", "write_user", "read_message"})
     * @ApiSubresource
     */
    private $avatar;

    /**
     * @ORM\Column(type="string")
     * @Groups({"read_user", "write_user", "read_message"})
     * @Assert\NotBlank()
     */
    private $name;

    /**
     * @ORM\Column(type="json", nullable=true)
     * @Groups({"read_user", "write_user"})
     * @Assert\NotBlank()
     */
    private $data;

    /**
     * @ORM\Column(type="simple_array", nullable=true)
     * @Groups({"read_user"})
     */
    private $news;

    /**
     * @Groups({"read_user"})
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
        $this->files = new ArrayCollection();
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

    public function getAvatar(): ?File
    {
        if ($this->avatar && $this->avatar->getId()) {
            return $this->avatar;
        }
        return null;
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

    public function getNews(): ?array
    {
        return $this->news;
    }

    public function setNews(array $news): void
    {
        $this->news = $news;
    }

    public function addNews(string $newsId): void
    {
        if (!in_array($newsId, $this->news)) {
            array_push($this->news, $newsId);
        }
        if (count($this->news) > 1024) {
            array_shift($this->news);
        }
    }

    public function removeNews(string $newsId): void
    {
        if (($key = array_search($newsId, $this->news)) !== false) {
            unset($this->news[$key]);
        }
    }

    // necessary for UserInterface
    public function getUsername()
    {
        return $this->login;
    }

    // necessary for UserInterface
    public function getSalt()
    {
        return null;
    }

    // necessary for UserInterface
    public function getRoles()
    {
        return array('ROLE_USER');
    }

    // necessary for UserInterface
    public function eraseCredentials()
    {
    }

    /** @see \Serializable::serialize() */
    public function serialize()
    {
        return serialize(array(
            $this->id,
            $this->login,
            $this->password,
        ));
    }

    /** @see \Serializable::unserialize() */
    public function unserialize($serialized)
    {
        list (
            $this->id,
            $this->login,
            $this->password,
        ) = unserialize($serialized, ['allowed_classes' => false]);
    }
}
