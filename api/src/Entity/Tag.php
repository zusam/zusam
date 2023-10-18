<?php

namespace App\Entity;

use App\Entity\ApiEntity;
use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use OpenApi\Annotations as OA;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="`tag`")
 *
 * @ORM\Entity()
 */
class Tag extends ApiEntity
{
    /**
     * @Assert\NotBlank()
     *
     * @Groups("*")
     *
     * @OA\Property(type="guid")
     *
     * @ORM\Column(type="guid")
     *
     * @ORM\Id
     */
    private $id;

    /**
     * @Assert\NotNull()
     *
     * @Assert\Type("integer")
     *
     * @Groups("*")
     *
     * @OA\Property(type="integer")
     *
     * @ORM\Column(type="integer")
     */
    private $createdAt;

    /**
     * @Assert\NotNull()
     *
     * @Groups("*")
     *
     * @OA\Property(type="App\Entity\Group")
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Group", inversedBy="tags")
     */
    private $group;

    /**
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
     *
     * @ORM\JoinTable(name="tags_messages")
     *
     * @ORM\ManyToMany(targetEntity="App\Entity\Message", inversedBy="tags")
     */
    private $messages;

    /**
     * @Assert\NotBlank()
     *
     * @Groups("*")
     *
     * @OA\Property(type="string")
     *
     * @ORM\Column(type="string")
     */
    private $name;

    /**
     * @Groups("*")
     *
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
        $this->createdAt = time();
        $this->messages = new ArrayCollection();
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

    public function getGroup(): Group
    {
        return $this->group;
    }

    public function setGroup(Group $group): void
    {
        $this->group = $group;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function setMessages(Collection $messages): void
    {
        $this->messages = $messages;
    }

    public function addMessage(Message $message): void
    {
        $this->messages[] = $message;
    }

    public function removeMessage(Message $message): void
    {
        $this->messages->removeElement($message);
    }
}
