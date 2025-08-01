<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use OpenApi\Annotations as OA;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: '`tag`')]
class Tag extends ApiEntity
{
    #[ORM\Id]
    #[ORM\Column(type: 'guid')]
    #[Assert\NotBlank]
    #[Groups(['public'])]
    /**
     * @OA\Property(type="guid")
     */
    private string $id;

    #[ORM\Column(type: 'integer')]
    #[Assert\NotNull]
    #[Assert\Type('integer')]
    #[Groups(['public'])]
    /**
     * @OA\Property(type="integer")
     */
    private int $createdAt;

    #[ORM\ManyToOne(targetEntity: Group::class, inversedBy: 'tags')]
    #[Assert\NotNull]
    #[Groups(['public'])]
    /**
     * @OA\Property(type="App\Entity\Group")
     */
    private Group $group;

    #[ORM\ManyToMany(targetEntity: Message::class, inversedBy: 'tags')]
    #[ORM\JoinTable(name: 'tags_messages')]
    /**
    * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
    */
    private Collection $messages;

    #[ORM\Column(type: 'string')]
    #[Assert\NotBlank]
    #[Groups(['public'])]
    /**
     * @OA\Property(type="string")
     */
    private string $name;

    #[Groups(['public'])]
    /**
     * @OA\Property(type="string")
     */
    private ?string $entityType = null;

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
