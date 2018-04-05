<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ApiResource()
 */
class User
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue()
     */
    private $id;

    /** @ORM\Column(type="datetime") */
    private $createdAt;

	/**
	 * @ORM\Column(type="string", unique=true)
	 */
	private $login;

	/**
	 * @ORM\Column(type="string")
	 */
	private $password;

	/**
	 * @ORM\Column(type="datetime", nullable=true)
	 */
	private $lastConnection;

	/**
	 * @ORM\ManyToMany(targetEntity="App\Entity\Group", inversedBy="users")
	 * @ORM\JoinTable(name="users_groups")
	 */
	private $groups;

	/**
	 * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="user")
	 */
	private $messages;

	/**
	 * @ORM\OneToMany(targetEntity="App\Entity\File", mappedBy="user")
	 */
	private $files;

	public function __construct()
	{
		$this->groups = new ArrayCollection();
		$this->messages = new ArrayCollection();
		$this->files = new ArrayCollection();
        $this->createdAt = new \DateTime();
	}
}
