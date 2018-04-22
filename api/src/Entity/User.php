<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Service\Uuid;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity()
 * @ApiResource()
 */
class User
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
	 * @ORM\ManyToMany(targetEntity="App\Entity\Group", inversedBy="users")
	 * @ORM\JoinTable(name="users_groups")
	 */
	private $groups;

	/**
	 * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="author")
	 */
	private $messages;

	/**
     * @ORM\ManyToMany(targetEntity="App\Entity\File")
     * @ORM\JoinTable(name="users_files",
     *      joinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="id")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="file_id", referencedColumnName="id", unique=true)}
     *      )
	 */
	private $files;

	public function __construct()
	{
        $this->id = Uuid::uuidv4();
		$this->groups = new ArrayCollection();
		$this->messages = new ArrayCollection();
		$this->files = new ArrayCollection();
        $this->createdAt = time();
        $this->lastConnection = time();
	}
}
