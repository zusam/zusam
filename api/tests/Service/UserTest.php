<?php

namespace App\Tests\Service;

use App\Service\User;
use App\Service\Notification as NotificationService;
use App\Entity\User as UserEntity;
use App\Entity\Notification as NotificationEntity;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\ORM\Tools\SchemaTool;

class UserTest extends KernelTestCase
{
    private $entityManager;
    private $passwordHasher;
    private $notificationService;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();

        $this->entityManager = $kernel->getContainer()->get('doctrine')->getManager();

        // Create the schema for User and Notification entities
        $schemaTool = new SchemaTool($this->entityManager);
        $metadata = [
            $this->entityManager->getClassMetadata(UserEntity::class),
            $this->entityManager->getClassMetadata(NotificationEntity::class),
        ];
        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);

        // Create a mock of the UserPasswordHasherInterface
        $hasherMock = $this->createMock(UserPasswordHasherInterface::class);
        $hasherMock->method('hashPassword')->willReturn('some_hashed_password');
        $this->passwordHasher = $hasherMock;

        // Create a mock of the Notification Service
        $this->notificationService = $this->createMock(NotificationService::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();

        // avoid memory leaks
        $this->entityManager->close();
        $this->entityManager = null;
    }

    public function testCreate()
    {
        $login = 'user1';
        $password = 'password1';
        $userService = new User($this->entityManager, $this->passwordHasher, $this->notificationService);
        $user = $userService->create($login, $password);
        $this->assertInstanceOf(UserEntity::class, $user);
        $this->assertEquals($login, $user->getLogin());
    }

    public function testDelete()
    {
        // Create user
        $user = new UserEntity();
        $user->setLogin('user1');
        $user->setPassword('password1');
        $user->setName('Test user');
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Create notifications
        $notification1 = new NotificationEntity();
        $notification1->setOwner($user);
        $notification1->setType(NotificationEntity::GROUP_NAME_CHANGE);
        $notification1->setTarget('');
        $notification2 = new NotificationEntity();
        $notification2->setFromUser($user);
        $notification2->setType(NotificationEntity::USER_JOINED_GROUP);
        $notification2->setTarget('');
        $this->entityManager->persist($notification1);
        $this->entityManager->persist($notification2);
        $this->entityManager->flush();

        // Expect delete() to be called twice on the NotificationService
        $this->notificationService
            ->expects($this->exactly(2))
            ->method('delete');

        $userService = new User($this->entityManager, $this->passwordHasher, $this->notificationService);
        $userService->delete($user);

        // Confirm user no longer exists
        $found = $this->entityManager->getRepository(UserEntity::class)->findOneByLogin('user1');
        $this->assertNull($found);
    }
}
