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
     * @ORM\Column(type="string")
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
     * @ORM\Column(type="integer", nullable=true)
     * @Groups({"read_user", "write_user"})
     * @Assert\Type("integer")
     * @Assert\NotNull()
     */
    private $lastConnection;

    /**
     * @ORM\Column(type="string", unique=true)
     * @Assert\NotBlank()
     */
    private $apiKey;

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
     * @ORM\Column(type="text")
     * @Assert\NotBlank()
     */
    private $data;

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->groups = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->files = new ArrayCollection();
        $this->createdAt = time();
        $this->lastConnection = time();
        $this->apiKey = Uuid::uuidv4();
        $this->data = "{}";
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getCreatedAt(): int
    {
        return $this->createdAt;
    }

    public function setCreatedAt(int $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getLogin(): string
    {
        return $this->login;
    }

    public function setLogin(string $login): self
    {
        $this->login = $login;
        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }

    public function getLastConnection(): int
    {
        return $this->lastConnection;
    }

    public function setLastConnection(int $lastConnection): self
    {
        $this->lastConnection = $lastConnection;
        return $this;
    }

    public function getApiKey(): string
    {
        return $this->apiKey;
    }

    public function resetApiKey(): self
    {
        $this->apiKey = Uuid::uuidv4();
    }

    public function addGroup(Group $group): self
    {
        $this->groups[] = $group;
        return $this;
    }

    public function removeGroup(Group $group): self
    {
        $this->groups->removeElement($group);
        return $this;
    }

    public function getGroups(): Collection
    {
        return $this->groups;
    }

    public function addMessage(Message $message): self
    {
        $this->messages[] = $message;
        return $this;
    }

    public function removeMessage(Message $message): self
    {
        $this->messages->removeElement($message);
        return $this;
    }

    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function setAvatar(File $avatar): self
    {
        $this->avatar = $avatar;
        return $this;
    }

    public function getAvatar(): ?File
    {
        if ($this->avatar && $this->avatar->getId()) {
            return $this->avatar;
        }
        return null;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getData(): string
    {
        return $this->data;
    }

    public function setData(string $data): self
    {
        $this->data = $data;
        return $this;
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

    // used to create reset password links
    public function createResetPasswordKey(): string
    {
        /*
         * The idea to create the key is to hash the apiKey salted with a daily timestamp
         * This way we don't have to store it and there's no way to retrieve the apiKey from it
         */
        return hash("sha512", $this->getApiKey().(strval(floor(time()/86400))));
    }

    public function checkResetPasswordKey($str): bool
    {
        /*
         * A reset password key is usable for 1 day. So we need to check 2 values : today and yesterday
         */
        if (
            $str === hash("sha512", $this->getApiKey().(strval(floor(time()/86400))))
            || $str === hash("sha512", $this->getApiKey().(strval(floor(time()/86400) - 1)))
        ) {
            return true;
        }
        return false;
    }
}
