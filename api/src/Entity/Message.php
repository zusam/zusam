<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use OpenApi\Attributes as OA;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: '`message`')]
class Message extends ApiEntity
{
    #[ORM\Id]
    #[ORM\Column(type: 'guid')]
    #[Assert\NotBlank]
    #[Groups(['public'])]
    /**
     * @OA\Property(type="guid")
     */
    private $id;

    #[ORM\Column(type: 'integer')]
    #[Assert\NotNull]
    #[Assert\Type('integer')]
    #[Groups(['read_message'])]
    /**
     * @OA\Property(type="integer")
     */
    private $createdAt;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Assert\NotBlank]
    #[Groups(['read_message', 'read_notification', 'read_message_preview'])]
    /**
     * @OA\Property(type="object")
     */
    private $data;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'messages')]
    #[Groups(['public'])]
    /**
     * @OA\Property(type="array", @OA\Items(type="App\Entity\User"))
     */
    private $author;

    #[ORM\ManyToOne(targetEntity: Group::class, inversedBy: 'messages')]
    #[Groups(['read_message'])]
    /**
     * @OA\Property(type="App\Entity\Group")
     */
    private $group;

    #[ORM\ManyToOne(targetEntity: self::class, inversedBy: 'children')]
    #[ORM\JoinColumn(name: 'parent_id', referencedColumnName: 'id')]
    #[Groups(['read_message'])]
    /**
     * @OA\Property(type="App\Entity\Message")
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
     */
    private $parent;

    #[ORM\OneToMany(mappedBy: 'parent', targetEntity: self::class)]
    /**
    * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
    */
    private $children;

    #[ORM\ManyToMany(targetEntity: File::class)]
    #[ORM\JoinTable(name: 'messages_files')]
    #[ORM\JoinColumn(name: 'message_id', referencedColumnName: 'id')]
    #[ORM\InverseJoinColumn(name: 'file_id', referencedColumnName: 'id')]
    #[ORM\OrderBy(['fileIndex' => 'ASC'])]
    #[Groups(['read_message'])]
    /**
    * @OA\Property(type="array", @OA\Items(type="App\Entity\File"))
    */
    private $files;

    #[ORM\ManyToMany(targetEntity: Tag::class, mappedBy: 'messages')]
    #[Groups(['read_message', 'write_message'])]
    /**
    * @OA\Property(type="array", @OA\Items(type="App\Entity\Tag"))
    */
    private $tags;

    #[ORM\OneToMany(mappedBy: 'message', targetEntity: Reaction::class, cascade: ['remove'], orphanRemoval: true)]
    #[Groups(['read_message', 'write_message'])]
    /**
    * @OA\Property(type="array", @OA\Items(type="App\Entity\Reaction"))
    */
    private Collection $reactions;

    #[ORM\Column(type: 'integer')]
    #[Assert\NotNull]
    #[Assert\Type('integer')]
    #[Groups(['read_message', 'read_message_preview'])]
    /**
     * @OA\Property(type="integer")
     */
    private $lastActivityDate;

    #[ORM\ManyToOne(targetEntity: File::class)]
    #[ORM\JoinColumn(name: 'preview_id', referencedColumnName: 'id')]
    #[Groups(['read_message', 'read_message_preview'])]
    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\File")
     */
    private $preview;

    #[ORM\Column(type: 'guid', unique: true)]
    #[Assert\NotBlank]
    /**
     * @OA\Property(type="guid")
     */
    private $secretKey;

    #[ORM\Column(type: 'boolean')]
    #[Assert\NotNull]
    #[Groups(['read_message'])]
    /**
     * @OA\Property(type="boolean")
     */
    private $isInFront;

    #[ORM\OneToMany(mappedBy: 'message', targetEntity: Bookmark::class)]
    /**
    * @OA\Property(type="array", @OA\Items(type="App\Entity\Bookmark"))
    */
    private $bookmarks;

    #[ORM\Column(type: 'string')]
    #[Assert\NotNull]
    #[Groups(['public'])]
    /**
     * @OA\Property(type="string")
     */    private $type;

    #[Groups(['public'])]
    /**
     * @OA\Property(type="string")
     */
    private $entityType;

    #[ORM\Column(type: 'integer', nullable: true)]
    private $sortOrder;

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
        $this->reactions = new ArrayCollection();
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
        if (null === $this->tags) {
            return new ArrayCollection();
        } else {
            return $this->tags;
        }
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

    public function getReactions()
    {
        return $this->reactions;
    }

    public function setReactions(Collection $reactions): void
    {
        $this->reactions = $reactions;
    }

    public function addReaction(Reaction $reaction): void
    {
        $this->reactions[] = $reaction;
    }

    public function removeReaction(Tag $reaction): void
    {
        $this->reactions->removeElement($reaction);
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
        if (is_array($this->getData()) && array_key_exists('text', $this->getData())) {
            $text = $this->getData()['text'];
            if (!empty($text)) {
                return self::getUrlsFromText($text);
            }
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
        if (null === $this->bookmarks) {
            return new ArrayCollection();
        } else {
            return $this->bookmarks;
        }
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

    public function getSortOrder(): ?int
    {
        return $this->sortOrder;
    }

    public function setSortOrder(?int $sortOrder): static
    {
        $this->sortOrder = $sortOrder;

        return $this;
    }

    #[Groups(['read_message'])]
    #[SerializedName('children')]
    public function getChildrenAsIdObjects(): array
    {
        return $this->children->map(function (Message $child) {
            // Return an associative array instead of just the ID string
            return ['id' => $child->getId()];
        })->toArray();
    }
}
