<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity()]
#[ORM\Table(name: "system")]
class System
{
    /**
     * @Assert\Type("string")
     *
     * @Assert\NotBlank()
     */
    #[ORM\Id]
    #[ORM\Column(type: "guid")]
    private $key;

    /**
     * @Assert\Type("text")
     *
     * @Assert\NotNull()
     */
    #[ORM\Column(type: "text")]
    private $value;

    /**
     * @Assert\Type("integer")
     *
     * @Assert\NotNull()
     */
    #[ORM\Column(type: "integer")]
    private $createdAt;

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
