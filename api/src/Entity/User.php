<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Table(name="`user`")
 * @ORM\Entity()
 * @ApiResource(
 *     attributes={"access_control"="is_granted('ROLE_USER')"},
 * )
 */
class User implements UserInterface, \Serializable
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @Assert\NotBlank()
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     */
    private $createdAt;

	/**
	 * @ORM\Column(type="string", unique=true)
     * @Assert\NotBlank()
	 */
	private $login;

	/**
	 * @ORM\Column(type="string")
     * @Assert\NotBlank()
	 */
	private $password;

	/**
	 * @ORM\Column(type="integer", nullable=true)
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
	 */
	private $groups;

	/**
	 * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="author")
	 */
	private $messages;

	public function __construct()
	{
        $this->id = Uuid::uuidv4();
		$this->groups = new ArrayCollection();
		$this->messages = new ArrayCollection();
		$this->files = new ArrayCollection();
        $this->createdAt = time();
        $this->lastConnection = time();
        $this->apiKey = Uuid::uuidv4();
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
