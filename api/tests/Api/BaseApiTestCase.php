<?php

namespace App\Tests\Api;

use App\Entity\Bookmark as BookmarkEntity;
use App\Entity\File;
use App\Entity\Group as GroupEntity;
use App\Entity\Message as  MessageEntity;
use App\Entity\Notification as NotificationEntity;
use App\Entity\Reaction as ReactionEntity;
use App\Entity\User as UserEntity;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class BaseApiTestCase extends WebTestCase
{
    protected $client;
    protected $apiKey;
    protected $entityManager;
    protected UserEntity|null $testUser = null;
    protected GroupEntity|null $testGroup =  null;
    protected MessageEntity|null $testMessage = null;
    protected array $testMessages = [];
    protected MessageEntity|null $testSearchForMessage = null;
    protected ReactionEntity|null $testReaction = null;
    protected array $testNotifications = [];
    protected array $testBookmarks = [];

    protected UserEntity|null $otherUser = null;
    protected GroupEntity|null $testGroupNotLinked = null;
    protected MessageEntity|null $testMessageNotLinked = null;


    protected function setUp(): void
    {
        parent::setUp();

        $this->client = static::createClient();

        $this ->rebuildSchema();
    }

    protected function tearDown(): void
    {
        $this->getEntityManager()->close();
        parent::tearDown();
    }

    protected function rebuildSchema(): void
    {
        $em = $this->getEntityManager();
        $schemaTool = new SchemaTool($em);
        $metadata = $em->getMetadataFactory()->getAllMetadata();
        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);
    }

    protected function getEntityManager(): EntityManagerInterface
    {
        if (!$this->entityManager) {
            $this->entityManager = $this->client->getContainer()->get('doctrine.orm.entity_manager');
        }
        return $this->entityManager;
    }

    protected function apiRequestWithAuth(string $method, string $uri, array $body = [])
    {
        $this->getTestUser();
        return $this->apiRequest($method, $uri, $body);
    }
    protected function apiRequest(string $method, string $uri, array $body = [])
    {
        $this->client->request(
            $method,
            $uri,
            [],
            [],
            [
                'HTTP_X-AUTH-TOKEN' => $this->apiKey,
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
            ],
            !empty($body) ? json_encode($body) : null
        );
        return $this->client->getResponse();
    }

    protected function createUser(string $login = 'zusam@example.com', string $password = 'zusam'): UserEntity
    {
        $user = new UserEntity();
        $user->setLogin($login);
        $user->setName('Test User');
        $user->setPassword(
            self::getContainer()->get(UserPasswordHasherInterface::class)->hashPassword($user, $password)
        );
        $user->setData(
            [
                'notification_emails' => 'immediately',
            ]
        );
        $em = $this->getEntityManager();
        $em->persist($user);
        $em->flush();
        return $user;
    }

    public function getTestUser(): UserEntity
    {
        if (!$this->testUser) {
            $this->testUser = $this->createUser();

            $response = $this->login('zusam@example.com', 'zusam');
            $this->assertResponseIsSuccessful("Login failed: " . $response->getContent());

            $data = json_decode($response->getContent(), true);
            $this->assertArrayHasKey('api_key', $data);
            $this->apiKey = $data['api_key'];
        }

        return $this->testUser;
    }

    public function login($username, $password)
    {
        $loginPayload = [
            'login' => $username,
            'password' => $password,
        ];
        return $this->apiRequest('POST', '/login',  $loginPayload);
    }

    public function getOtherUser(): UserEntity
    {
        if (!$this->otherUser) {
            $this->otherUser = $this->createUser('otherUser');
        }
    return $this->otherUser;
    }

    protected function createGroup($name = 'Test Group'): GroupEntity
    {
        $group = new GroupEntity();
        $group->setName($name);
        $em = $this->getEntityManager();
        $em->persist($group);
        $em->flush();
        return $group;
    }

    public function getTestGroup(): GroupEntity
    {
        if (!$this->testGroup) {
            $this->testGroup = $this->createGroup();
            $this->testGroup->addUser($this->getTestUser());
            $this->testUser->addGroup($this->testGroup);
            $em = $this->getEntityManager();
            $em->persist($this->testGroup);
            $em->flush();
        }

        return $this->testGroup;
    }

    public function getTestGroupNotLinked(): GroupEntity
    {
        if (!$this->testGroupNotLinked) {
            $this->testGroupNotLinked = $this->createGroup('Not linked group');
        }
        return $this->testGroupNotLinked;
    }

    protected function createMessage($group, $user, $title = 'Test message'): MessageEntity
    {
        $message = new MessageEntity();
        $message->setAuthor($user);
        $message->setGroup($group);
        $message->setData([
            'title' => $title,
            'text' => 'Message body',
        ]);
        $message->setType('standard');
        $message->setIsInFront(true);
        $em = $this->getEntityManager();
        $em->persist($message);
        $em->persist($user);
        $em->persist($group);
        $em->flush();

        return $message;
    }

    public function getTestMessage(): MessageEntity
    {
        if (!$this->testMessage) {
            $this->testMessage = $this->createMessage($this->getTestGroup(), $this->getTestUser());
        }
        return $this->testMessage;
    }

    public function getTestMessages($number = 1): array
    {
            for ($i = 0; $i < $number; $i++) {
            $this->testMessages[$i] = $this->createMessage($this->getTestGroup(), $this->getTestUser(), 'Test message ' . $i);
        }
        return  $this->testMessages;
    }

    public function getTestSearchForMessage(): MessageEntity
    {
        if (!$this->testSearchForMessage) {
            $this->testSearchForMessage = $this->createMessage($this->getTestGroup(), $this->getTestUser(), 'Search for me');
        }
        return $this->testSearchForMessage;
    }

    public function getTestMessageFromGroupNotLinked(): MessageEntity
    {
        if (!$this->testMessageNotLinked) {
            $this->testMessageNotLinked = $this->createMessage($this->getTestGroupNotLinked(), $this->getOtherUser());
        }
        return $this->testMessageNotLinked;
    }

    protected function createBookmark($user, $message): BookmarkEntity
    {
        $bookmark = new BookmarkEntity();
        $bookmark->setUser($user);
        $bookmark->setMessage($message);
        return $bookmark;
    }

    protected function getBookmarks(): array
    {
        if (empty($this->testBookmarks)) {
            $em =  $this->getEntityManager();
            for ($i = 0; $i < 2; $i++) {
                $this->testBookmarks[$i] = $this->createBookmark($this->getTestUser(),$this->getTestMessage());
                $em->persist($this->testBookmarks[$i]);
            }
            $em->flush();
        }
        return $this->testBookmarks;
    }

    protected function createNotification($user, $text): NotificationEntity
    {
        $notification = new NotificationEntity();
        $notification->setType(NotificationEntity::GLOBAL_NOTIFICATION);
        $notification->setTarget('');
        $notification->setData(['text' => $text]);
        $notification->setOwner($user);
        $user->addNotification($notification);

        return $notification;
    }

    public function getNotifications(): array
    {
        if (empty($this->testNotifications)) {
            $em  =  $this->getEntityManager();
            for ($i = 0; $i < 2; $i++) {
                $this->testNotifications[$i] = $this->createNotification($this->getTestUser(), 'Test Notification ' . $i);
                $em->persist($this->testNotifications[$i]);
            }
            $em->flush();
        }
        return $this->testNotifications;
    }

    protected function createReaction(UserEntity $user, MessageEntity $message): ReactionEntity
    {
        $reaction = new ReactionEntity();
        $reaction->setAuthor($user);
        $reaction->setMessage($message);
        $reaction->setValue('👍');
        $message->addReaction($reaction);

        return $reaction;
    }

    public function getTestReaction(): ReactionEntity
    {
        if (empty($this->testReaction)) {
            $this->testReaction =  $this->createReaction($this->getTestUser(),  $this->getTestMessage());
            $em = $this->getEntityManager();
            $em->persist($this->testReaction);
            $em->flush();
        }

        return $this->testReaction;
    }

    protected function prepImageFileOnDisk(): string
    {
        $filesDir = self::getContainer()->getParameter('dir.files');

        if (!is_dir($filesDir)) {
            mkdir($filesDir, 0777, true);
        }

        $cacheDir = self::getContainer()->getParameter('dir.cache') . '/images';
        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0777, true);
        }

        array_map('unlink', glob($cacheDir . '/*.jpg'));

        $sourceFileName = 'icon-512x512.png';
        $sourcePath = __DIR__ . '/' . $sourceFileName;
        $targetPath = $filesDir . '/' . uniqid('upload_', true) . '.jpg';

        copy($sourcePath, $targetPath);

        return $targetPath;
    }

    protected function createImageFile(): File
    {
        $path = $this->prepImageFileOnDisk();

        $file = new File();
        $file->setType('image/png');
        $file->setContentUrl(basename($path));
        $file->setSize(filesize($path));

        $em = $this->getEntityManager();
        $em->persist($file);
        $em->flush();

        return $file;
    }

    protected function createUploadedImageFile(): UploadedFile
    {
        $path = $this->prepImageFileOnDisk();

        return new UploadedFile(
            $path,
            basename($path),
            'image/png',
            null,
            true
        );
    }
}