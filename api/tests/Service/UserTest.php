<?php

namespace App\Tests\Service;

use App\Service\User;
use App\Entity\User as UserEntity;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\ORM\Tools\SchemaTool;

class UserTest extends KernelTestCase
{
    private $entityManager;
    private $passwordHasher;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();

        $this->entityManager = $kernel->getContainer()->get('doctrine')->getManager();

         // Create the schema for the User entity
        $schemaTool = new SchemaTool($this->entityManager);
        $metadata = [$this->entityManager->getClassMetadata(UserEntity::class)];
        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);

        // Create a mock of the UserPasswordHasherInterface
        $hasherMock = $this->createMock(UserPasswordHasherInterface::class);
        $hasherMock->method('hashPassword')->willReturn('some_hashed_password');
        $this->passwordHasher = $hasherMock;
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
        $userService = new User($this->entityManager, $this->passwordHasher);
        $user = $userService->create($login, $password);
        $this->assertInstanceOf(UserEntity::class, $user);
        $this->assertEquals($login, $user->getLogin());
    }
}
