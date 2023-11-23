<?php

namespace App\Tests\Service;

use App\Service\Group;
use App\Entity\Group as GroupEntity;
use App\Entity\Notification as NotificationEntity;
use App\Entity\User as UserEntity;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\Tools\SchemaTool;

class GroupTest extends KernelTestCase
{
    private $entityManager;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();

        $this->entityManager = $kernel->getContainer()->get('doctrine')->getManager();

        // Create the schema for the Group, User, and Notification entities
        $schemaTool = new SchemaTool($this->entityManager);
        $metadata = [
            $this->entityManager->getClassMetadata(GroupEntity::class),
            $this->entityManager->getClassMetadata(NotificationEntity::class),
            $this->entityManager->getClassMetadata(UserEntity::class),
        ];
        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        
        // Avoid memory leaks
        $this->entityManager->close();
        $this->entityManager = null;
    }

    public function testAddUser()
    {
        $groupService = new Group($this->entityManager);

        $group = new GroupEntity();
        $group->setName("group1");

        $user1 = new UserEntity();
        $user1->setLogin("user1");
        $user1->setPassword("user1");
        $user1->setName("user1");

        $user2 = new UserEntity();
        $user2->setLogin("user2");
        $user2->setPassword("user2");
        $user2->setName("user2");

        # Add user1 to the group
        # (so that there's a notification created for him)
        $group->addUser($user1);
        $user1->addGroup($group);

        $this->entityManager->persist($group);
        $this->entityManager->persist($user1);
        $this->entityManager->persist($user2);
        $this->entityManager->flush();

        // Add $user2 to $group
        $groupService->addUser($group, $user2);

        // Assert that the $user2 is added to $group
        $this->assertTrue($group->getUsers()->contains($user2));

        // Assert that a Notification is created for $user1
        $notification = $this->entityManager->getRepository(NotificationEntity::class)
            ->findOneBy([
                'owner' => $user1->getId(),
                'fromUser' => $user2->getId(),
                'target' => $group->getId()
            ]);

        $this->assertNotNull($notification);
        $this->assertEquals(NotificationEntity::USER_JOINED_GROUP, $notification->getType());
    }
}
