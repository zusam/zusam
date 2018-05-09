<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Service\Uuid;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`file`")
 * @ORM\Entity
 * @ApiResource(
 *     attributes={"access_control"="is_granted('ROLE_USER')"},
 * )
 */
class File
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
     * @ORM\Column(type="string")
     * @Assert\NotBlank()
     */
    private $type;

    /**
     * @ORM\Column(type="string")
     * @Assert\NotBlank()
     */
    private $extension;

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
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

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getExtension(): string
    {
        return $this->extension;
    }

    public function setExtension(string $extension): self
    {
        $this->extension = $extension;
        return $this;
    }

    public function getPath(): string
    {
        return "/files/".$this->getId().$this->getExtension();
    }
}
