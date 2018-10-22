<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\ExistsFilter;
use App\Controller\NewMessage;
use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`message`")
 * @ORM\Entity
 * @ApiResource(
 *     attributes={
 *          "access_control"="is_granted('ROLE_USER')",
 *          "order"={"lastActivityDate": "DESC"}
 *     },
 *     collectionOperations={
 *          "get",
 *          "post"={
 *              "method"="POST",
 *              "path"="/messages.{_format}",
 *              "controller"=NewMessage::class
 *          },
 *     },
 *     normalizationContext={"groups"={"read_message"}},
 * )
 * @ApiFilter(ExistsFilter::class, properties={"parent"})
 */
class Message
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @Assert\NotBlank()
     * @Groups({"read_message"})
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     * @Groups({"read_message"})
     */
    private $createdAt;

    /**
     * @ORM\Column(type="integer", nullable=true)
     * @Assert\Type("integer")
     * @Groups({"read_message"})
     */
    private $date;

    /**
     * @ORM\Column(type="text")
     * @Assert\NotBlank()
     * @Groups({"read_message"})
     */
    private $data;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="messages")
     * @Groups({"read_message"})
     */
    private $author;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Group", inversedBy="messages")
     * @Groups({"read_message"})
     */
    private $group;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Message", inversedBy="children")
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id")
     * @Groups({"read_message"})
     */
    private $parent;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="parent")
     * @Groups({"read_message"})
     */
    private $children;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\File")
     * @ORM\JoinTable(name="messages_files",
     *      joinColumns={@ORM\JoinColumn(name="message_id", referencedColumnName="id")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="file_id", referencedColumnName="id", unique=true)}
     *      )
     * @Groups({"read_message"})
     */
    private $files;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     * @Groups({"read_message"})
     */
    private $lastActivityDate;

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->children = new ArrayCollection();
        $this->files = new ArrayCollection();
        $this->createdAt = time();
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

    public function getDate(): ?int
    {
        return $this->date;
    }

    public function setDate(?int $date): self
    {
        $this->date = $date;
        return $this;
    }

    public function getData(bool $asArray = false)
    {
        if ($asArray) {
            $data = json_decode($this->getData(), true);
            return $data ? $data : [];
        }
        return $this->data;
    }

    public function setData(string $data): self
    {
        $this->data = $data;
        return $this;
    }

    public function setAuthor(User $author): self
    {
        $this->author = $author;
        return $this;
    }

    public function getAuthor(): User
    {
        return $this->author;
    }

    public function setGroup(Group $group): self
    {
        $this->group = $group;
        return $this;
    }

    public function getGroup(): Group
    {
        return $this->group;
    }

    public function setParent(Message $parent): self
    {
        $this->parent = $parent;
        return $this;
    }

    public function getParent(): ?Message
    {
        return $this->parent;
    }

    public function addChild(Message $child): self
    {
        $this->children[] = $child;
        return $this;
    }

    public function removeChild(Message $child): self
    {
        $this->children->removeElement($child);
        return $this;
    }

    public function getChildren(): Collection
    {
        return $this->children;
    }

    public function addFile(File $file): self
    {
        $this->files[] = $file;
        return $this;
    }

    public function removeFile(File $file): self
    {
        $this->files->removeElement($file);
        return $this;
    }

    public function getFiles(): Collection
    {
        return $this->files;
    }

    public function getLastActivityDate(): int
    {
        return $this->lastActivityDate;
    }

    public function setLastActivityDate(int $lastActivityDate): self
    {
        $this->lastActivityDate = $lastActivityDate;
        return $this;
    }
}
