<?php

namespace App\Tests\Service;

use App\Service\Message;
use App\Service\Notification;
use App\Service\Url;
use App\Entity\Message as MessageEntity;
use App\Entity\User as UserEntity;
use App\Entity\Group as GroupEntity;
use App\Entity\File as FileEntity;
use App\Entity\Notification as NotificationEntity;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Contracts\Cache\TagAwareCacheInterface;

class MessageTest extends KernelTestCase
{
    private $entityManager;
    private $cache;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();

        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();

        $this->cache = $this->createMock(TagAwareCacheInterface::class);

        $schemaTool = new SchemaTool($this->entityManager);
        $metadata = [
            $this->entityManager->getClassMetadata(MessageEntity::class),
            $this->entityManager->getClassMetadata(GroupEntity::class),
            $this->entityManager->getClassMetadata(UserEntity::class),
            $this->entityManager->getClassMetadata(FileEntity::class),
            $this->entityManager->getClassMetadata(NotificationEntity::class),
        ];
        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);
    }

    protected function tearDown(): void
    {
        parent::tearDown();

        $this->entityManager->close();
        $this->entityManager = null;
    }

    public function testCreateMessage()
    {
        // Mock dependencies
        $urlService = $this->createMock(Url::class);
        $notificationService = $this->createMock(Notification::class);

        // Create entities for testing
        $author = new UserEntity();
        $author->setLogin("user1");
        $author->setPassword("user1");
        $author->setName("user1");

        $group = new GroupEntity();
        $group->setName("group1");

        $this->entityManager->persist($author);
        $this->entityManager->persist($group);
        $this->entityManager->flush();

        $messageService = new Message(
            $this->entityManager,
            $urlService,
            $notificationService,
            $this->cache
        );

        $data = [
            'data' => [
                'title' => 'title1',
                'text' => 'text1',
            ]
        ];

        $createdMessage = $messageService->create($data, $author, $group);

        $this->assertInstanceOf(MessageEntity::class, $createdMessage);
        $this->assertEquals($data['data'], $createdMessage->getData());

        // Check that a notification has been created for other group users
        // $notification = $this->entityManager->getRepository(NotificationEntity::class)->findOneBy(['target' => $createdMessage->getId()]);
        // $this->assertNotNull($notification);
        // $this->assertEquals(NotificationEntity::NEW_MESSAGE, $notification->getType());

        // Here, you can assert more specific conditions, such as count of notifications created, 
        // or the values of different fields in the created message and notifications.
    }
}
