<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\ORM\Mapping as ORM;
use OpenApi\Annotations as OA;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table(name: 'reaction')]
class Reaction extends ApiEntity
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
    #[Groups(['read_reaction'])]
    /**
     * @OA\Property(type="integer")
     */
    private int $createdAt;

    #[ORM\Column(type: 'string')]
    #[Assert\NotBlank]
    #[Groups(['read_reaction'])]
    /**
     * @OA\Property(type="string")
     */
    private string $value;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'reactions')]
    #[Groups(['public'])]
    /**
    * @OA\Property(type="array", @OA\Items(type="App\Entity\User"))
    */
    private ?User $author = null;

    #[ORM\ManyToOne(targetEntity: Message::class, inversedBy: 'reactions')]
    #[Groups(['read_reaction'])]
    /**
     * @OA\Property(type="App\Entity\Message")
     */
    private Message $message;

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }

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

    public function setCreatedAt(int $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(User $author): void
    {
        $this->author = $author;
    }

    public function getValue(): string
    {
        if (null === $this->value) {
            return "";
        } else {
            return $this->value;
        }
    }

    public function setValue(string $value): void
    {
        $this->value = $value;
    }

    public function getMessage(): Message
    {
        return $this->message;
    }

    public function setMessage(Message $message): void
    {
        $this->message = $message;
    }
}
