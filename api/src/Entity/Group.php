<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity
 * @ApiResource()
 */
class Group
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue()
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     */
    private $createdAt;

    /**
     * @ORM\Column(type="string")
     * @Assert\NotBlank()
     */
    private $name;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\User", mappedBy="groups")
     */
    private $users;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="group")
     */
    private $messages;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\File", mappedBy="group")
     */
    private $files;

    public function __construct()
    {
        $this->users = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->files = new ArrayCollection();
        $this->createdAt = time();
    }
}
