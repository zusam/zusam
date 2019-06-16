<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`log`")
 * @ORM\Entity
 */
class Log
{
    /**
     * @ORM\Id
     * @ORM\Column(type="guid")
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
     * @Assert\Type("string")
     * @Assert\NotNull()
     */
    private $message;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     */
    private $level;

    /**
     * @ORM\Column(type="string")
     * @Assert\Type("string")
     * @Assert\NotBlank()
     */
    private $levelName;

    /**
     * @ORM\Column(type="array")
     * @Assert\Type("array")
     * @Assert\NotNull()
     */
    private $context;

    /**
     * @ORM\Column(type="string")
     * @Assert\Type("string")
     * @Assert\NotBlank()
     */
    private $channel;

    /**
     * @ORM\Column(type="array")
     * @Assert\Type("array")
     * @Assert\NotNull()
     */
    private $extra;

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->createdAt = time();
		$this->message = "";
		$this->levelName = "";
		$this->channel = "";
    }

    public function getEntityType(): string
    {
        return get_class($this);
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

    public function setMessage(string $message): self
    {
        $this->message = $message;
        return $this;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function setLevel(int $level): self
    {
        $this->level = $level;
        return $this;
    }

    public function getLevel(): int
    {
        return $this->level;
    }

    public function setLevelName(string $levelName): self
    {
        $this->levelName = $levelName;
        return $this;
    }

    public function getLevelName(): string
    {
        return $this->levelName;
    }

    public function getContext(): ?array
    {
        return $this->context;
    }

    public function setContext(array $context): self
    {
        $this->context = $context;
        return $this;
    }

    public function setChannel(string $channel): self
    {
        $this->channel = $channel;
        return $this;
    }

    public function getChannel(): string
    {
        return $this->channel;
    }

    public function getExtra(): ?array
    {
        return $this->extra;
    }

    public function setExtra(array $extra): self
    {
        $this->extra = $extra;
        return $this;
    }
}
