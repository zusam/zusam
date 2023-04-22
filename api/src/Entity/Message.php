<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Nelmio\ApiDocBundle\Annotation\Model;
use OpenApi\Annotations as OA;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`message`")
 * @ORM\Entity()
 */
class Message
{
    /**
     * @Assert\NotBlank()
     * @Groups("*")
     * @OA\Property(type="guid")
     * @ORM\Column(type="guid")
     * @ORM\Id
     */
    private $id;

    /**
     * @Assert\NotNull()
     * @Assert\Type("integer")
     * @Groups({"read_message"})
     * @OA\Property(type="integer")
     * @ORM\Column(type="integer")
     */
    private $createdAt;

    /**
     * @Assert\NotBlank()
     * @Groups({"read_message", "read_notification", "read_message_preview"})
     * @OA\Property(type="object")
     * @ORM\Column(type="json", nullable=true)
     */
    private $data;

    /**
     * @Groups("*")
     * @OA\Property(type="array", @OA\Items(type="App\Entity\User"))
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="messages")
     */
    private $author;

    /**
     * @Groups({"read_message"})
     * @OA\Property(type="App\Entity\Group")
     * @ORM\ManyToOne(targetEntity="App\Entity\Group", inversedBy="messages")
     */
    private $group;

    /**
     * @Groups({"read_message"})
     * @OA\Property(type="App\Entity\Message")
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id")
     * @ORM\ManyToOne(targetEntity="App\Entity\Message", inversedBy="children")
     */
    private $parent;

    /**
     * @Groups({"read_message"})
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
     * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="parent")
     */
    private $children;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\File")
     * @ORM\JoinTable(name="messages_files",
     *      joinColumns={@ORM\JoinColumn(name="message_id", referencedColumnName="id")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="file_id", referencedColumnName="id")}
     *      )
     * @ORM\OrderBy({"fileIndex" = "ASC"})
     * @Groups({"read_message"})
     * @OA\Property(type="array", @OA\Items(type="App\Entity\File"))
     */
    private $files;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Tag", mappedBy="messages")
     * @Groups({"read_message", "write_message"})
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Tag"))
     */
    private $tags;

    /**
     * @Assert\NotNull()
     * @Assert\Type("integer")
     * @Groups({"read_message", "read_message_preview"})
     * @OA\Property(type="integer")
     * @ORM\Column(type="integer")
     */
    private $lastActivityDate;

    /**
     * @Groups({"read_message", "read_message_preview"})
     * @OA\Property(type="App\Entity\File")
     * @ORM\JoinColumn(name="preview_id", referencedColumnName="id")
     * @ORM\ManyToOne(targetEntity="App\Entity\File")
     */
    private $preview;

    /**
     * @Assert\NotBlank()
     * @OA\Property(type="guid")
     * @ORM\Column(type="guid", unique=true)
     */
    private $secretKey;

    /**
     * @Assert\NotNull()
     * @Groups({"read_message"})
     * @OA\Property(type="boolean")
     * @ORM\Column(type="boolean")
     */
    private $isInFront;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Bookmark", mappedBy="message")
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Bookmark"))
     */
    private $bookmarks;

    /**
     * @Assert\NotNull()
     * @Groups({"*"})
     * @OA\Property(type="string")
     * @ORM\Column(type="string")
     */
    private $type;

    /**
     * @Groups("*")
     * @OA\Property(type="string")
     */
    private $entityType;

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->children = new ArrayCollection();
        $this->files = new ArrayCollection();
        $this->tags = new ArrayCollection();
        $this->createdAt = time();
        $this->lastActivityDate = time();
        $this->secretKey = Uuid::uuidv4();
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

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(array $data): void
    {
        $this->data = $data;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(User $author): void
    {
        $this->author = $author;
    }

    public function getGroup(): Group
    {
        return $this->group;
    }

    public function setGroup(Group $group): void
    {
        $this->group = $group;
    }

    public function getParent(): ?Message
    {
        return $this->parent;
    }

    public function setParent(?Message $parent): void
    {
        $this->parent = $parent;
    }

    public function getChildren(): Collection
    {
        return $this->children;
    }

    public function addChild(Message $child): void
    {
        $this->children[] = $child;
    }

    public function removeChild(Message $child): void
    {
        $this->children->removeElement($child);
    }

    public function getFiles(): Collection
    {
        return $this->files;
    }

    public function setFiles(Collection $files): void
    {
        $this->files = $files;
    }

    public function addFile(File $file): void
    {
        $this->files[] = $file;
    }

    public function removeFile(File $file): void
    {
        $this->files->removeElement($file);
    }

    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function setTags(Collection $tags): void
    {
        $this->tags = $tags;
    }

    public function addTag(Tag $tag): void
    {
        $this->tags[] = $tag;
    }

    public function removeTag(Tag $tag): void
    {
        $this->tags->removeElement($tag);
    }

    public function getLastActivityDate(): int
    {
        return $this->lastActivityDate;
    }

    public function setLastActivityDate(int $lastActivityDate): void
    {
        $this->lastActivityDate = $lastActivityDate;
    }

    public function getPreview(): ?File
    {
        return $this->preview;
    }

    public function setPreview(?File $preview): void
    {
        $this->preview = $preview;
    }

    public function getUrls(): array
    {
        $text = $this->getData()['text'];
        if (!empty($text)) {
            return self::getUrlsFromText($text);
        }

        return [];
    }

    public static function getUrlsFromText(string $text): array
    {
        preg_match("/(\([^()]*)?https?:\/\/[^[\]\n\r ]*[-A-Za-z0-9+&@#\/%=~_()|.]/i", $text, $urls);

        return array_map(function ($url) {
            if (!empty($url) && '(' === substr($url, 0, 1)) {
                $url = substr($url, stripos($url, 'http'));
                if (')' === substr($url, -1)) {
                    $url = substr($url, 0, -1);
                }
            }

            return $url;
        }, $urls);
    }

    public function getSecretKey(): string
    {
        return $this->secretKey;
    }

    public function resetSecretKey(): void
    {
        $this->secretKey = Uuid::uuidv4();
    }

    public function getIsInFront(): bool
    {
        return $this->isInFront ?? false;
    }

    public function setIsInFront(bool $isInFront): void
    {
        $this->isInFront = $isInFront;
    }

    public function getBookmarks(): Collection
    {
        return $this->bookmarks;
    }

    public function addBookmark(Bookmark $bookmark): void
    {
        $this->bookmarks[] = $bookmark;
    }

    public function removeBookmark(Bookmark $bookmark): void
    {
        $this->bookmarks->removeElement($bookmark);
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): void
    {
        $this->type = $type;
    }
}
