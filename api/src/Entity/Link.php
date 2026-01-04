<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\ORM\Mapping as ORM;
use OpenApi\Annotations as OA;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: '`link`')]
class Link extends ApiEntity
{
    /**
     * @Assert\NotBlank()
     *
     * @OA\Property(type="guid")
     */
    #[ORM\Id]
    #[ORM\Column(type: 'guid')]
    private $id;

    /**
     * @Assert\Type("integer")
     *
     * @Assert\NotNull()
     *
     * @OA\Property(type="integer")
     */
    #[ORM\Column(type: 'integer')]
    private $createdAt;

    /**
     * @Assert\Type("integer")
     *
     * @Assert\NotNull()
     *
     * @OA\Property(type="integer")
     */
    #[ORM\Column(type: 'integer')]
    private $updatedAt;

    /**
     * @Assert\NotBlank()
     *
     * @OA\Property(type="object")
     */
    #[ORM\Column(type: 'json')]
    private $data;

    /**
     * @Assert\NotBlank()
     *
     * @OA\Property(type="string")
     */
    #[ORM\Column(type: 'string', unique: true)]
    private $url;

    /**
     * @OA\Property(type="App\Entity\File")
     */
    #[ORM\OneToOne(targetEntity: File::class)]
    #[ORM\JoinColumn(name: 'preview_id', referencedColumnName: 'id')]
    private $preview;

    /**
     * @Assert\NotBlank()
     *
     * @OA\Property(type="guid")
     */
    #[ORM\Column(type: 'guid', unique: true)]
    private $secretKey;

    public function __construct(string $url)
    {
        $this->id = Uuid::uuidv4($url);
        $this->url = $url;
        $this->createdAt = time();
        $this->updatedAt = time();
        $this->secretKey = Uuid::uuidv4();
        $this->data = [];
    }

    public function getEntityType(): string
    {
        return strtolower(new \ReflectionClass($this)->getShortName());
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

    public function getUpdatedAt(): int
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(int $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function setData(array $data): void
    {
        $this->data = $data;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function setUrl(string $url): void
    {
        $this->url = $url;
    }

    public function getPreview(): ?File
    {
        return $this->preview;
    }

    public function setPreview(File $preview): void
    {
        $this->preview = $preview;
    }

    public function getSecretKey(): string
    {
        return $this->secretKey;
    }

    public function resetSecretKey(): void
    {
        $this->secretKey = Uuid::uuidv4();
    }
}
