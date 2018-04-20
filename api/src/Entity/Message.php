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
class Message
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
     * @ORM\Column(type="text")
     * @Assert\NotBlank()
     */
    private $data;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="messages")
     */
    private $user;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Group", inversedBy="messages")
     */
    private $group;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Message", inversedBy="children")
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id")
     */
    private $parent;

     /**
     * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="parent")
     */
    private $children;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\File", mappedBy="group")
     */
    private $files;

    public function __construct()
    {
        $this->children = new ArrayCollection();
        $this->files = new ArrayCollection();
        $this->createdAt = time();
    }
}
