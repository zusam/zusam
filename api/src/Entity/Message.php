<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity
 * @ApiResource()
 */
class Message
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
     * @ORM\Column(type="text")
     * @Assert\NotBlank()
     */
    private $data;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="messages")
     */
    private $author;

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
     * @ORM\ManyToMany(targetEntity="App\Entity\File")
     * @ORM\JoinTable(name="messages_files",
     *      joinColumns={@ORM\JoinColumn(name="message_id", referencedColumnName="id")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="file_id", referencedColumnName="id", unique=true)}
     *      )
     *
     */
    private $files;

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->children = new ArrayCollection();
        $this->files = new ArrayCollection();
        $this->createdAt = time();
    }
}
