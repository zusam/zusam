<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\ExistsFilter;
use App\Controller\NewMessage;
use App\Controller\ReadMessage;
use App\Service\Uuid;
use App\Service\Url as UrlService;
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
 *          "order"={"lastActivityDate": "DESC"},
 *     },
 *     itemOperations={
 *          "get"={
 *              "method"="GET",
 *              "path"="/messages/{id}.{_format}",
 *              "controller"=ReadMessage::class,
 *              "normalization_context"={"groups"={"read_message"}},
 *          },
 *          "put",
 *          "delete",
 *     },
 *     collectionOperations={
 *          "get",
 *          "post"={
 *              "method"="POST",
 *              "path"="/messages.{_format}",
 *              "controller"=NewMessage::class,
 *          },
 *     },
 * )
 * @ApiFilter(ExistsFilter::class, properties={"parent"})
 */
class Message
{
    private $linkByUrl;

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
     * @ORM\Column(type="json", nullable=true)
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
     */
    private $lastActivityDate;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\File")
     * @ORM\JoinColumn(name="preview_id", referencedColumnName="id")
     * @Groups({"read_message"})
     */
    private $preview;

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->children = new ArrayCollection();
        $this->files = new ArrayCollection();
        $this->createdAt = time();
        $this->lastActivityDate = time();
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

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(array $data): self
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

    public function setPreview(?File $preview): self
    {
        $this->preview = $preview;
        return $this;
    }

    public function getPreview(): ?File
    {
        return $this->preview;
    }

    public function getUrls(): array
    {
        $text = $this->getData()["text"];
        if (!empty($text)) {
            return self::getUrlsFromText($text);
        }
        return [];
    }

    public static function getUrlsFromText(string $text): array
    {
        preg_match("/(\([^()]*)?https?:\/\/[-A-Za-z0-9+&@#\/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#\/%=~_()|]/i", $text, $urls);
        return array_map(function ($url) {
            if (!empty($url) && substr($url, 0, 1) === "(") {
                $url = substr($url, stripos($url, "http"));
                if (substr($url, -1) === ")") {
                    $url = substr($url, 0, -1);
                }
            }
            return $url;
        }, $urls);
    }
}
