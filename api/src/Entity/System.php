<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`system`")
 * @ORM\Entity
 */
class System
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @Assert\Type("string")
     * @Assert\NotBlank()
     */
    private $key;

    /**
     * @ORM\Column(type="text")
     * @Assert\Type("text")
     * @Assert\NotNull()
     */
    private $value;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     */
    private $createdAt;

    private $entityType;

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }

    public function __construct(string $key, $value)
    {
        $this->createdAt = time();
        $this->key = $key;
        $this->value = serialize($value);
    }

    public function getCreatedAt(): int
    {
        return $this->createdAt;
    }

    public function setCreatedAt(int $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getKey(): string
    {
        return $this->key;
    }

    public function setKey(string $key): void
    {
        $this->key = $key;
    }

    public function getValue()
    {
        return unserialize($this->value);
    }

    public function setValue($value): void
    {
        $this->value = serialize($value);
    }
}
