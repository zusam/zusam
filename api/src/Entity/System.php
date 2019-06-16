<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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


	public function __construct(string $key, $value)
	{
		$this->createdAt = time();
		$this->key = $key;
		$this->value = serialize($value);
	}

	public function getEntityType(): string
	{
		return get_class($this);
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

	public function setKey(string $key): self
	{
		$this->key = $key;
		return $this;
	}

	public function getKey(): string
	{
		return $this->key;
	}

	public function setValue($value): self
	{
		$this->value = serialize($value);
		return $this;
	}

	public function getValue()
	{
		return unserialize($this->value);
	}
}
