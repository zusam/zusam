<?php

namespace App\Tests\Api;

use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserApiTest extends BaseApiTestCase
{
    public function testGetUserBookmarks(): void
    {
        $user =  $this->getTestUser();
        $bookmarks = $this->getBookmarks();
        $this->apiRequestWithAuth('GET', '/users/' . $user->getId() . '/bookmarks');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertCount(2, $data);
        for ($i = 0; $i < 2; $i++) {
            $this->assertEquals($bookmarks[$i]->getId(), $data[$i]['id'], 'Bookmark ID does not match');
            $this->assertEquals($user->getId(), $data[$i]['user']['id'], 'User ID does not match');
            $this->assertEquals('bookmark', $data[$i]['entityType']);
        }
    }

    public function testGetUserBookmarksOtherUser(): void
    {
        $user = $this->getOtherUser();
        $this->apiRequestWithAuth('GET', '/users/' . $user->getId() . '/bookmarks');
        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetUserBookmarksWithLimit(): void
    {
        $user = $this->getTestUser();
        $bookmarks = $this->getBookmarks();
        $this->apiRequestWithAuth('GET', '/users/' . $user->getId() . '/bookmarks/1');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertCount(1, $data);
        $this->assertEquals($bookmarks[0]->getId(), $data[0]['id'], 'Bookmark ID does not match');
        $this->assertEquals($user->getId(), $data[0]['user']['id'], 'User ID for bookmark does not match');
        $this->assertEquals('bookmark', $data[0]['entityType']);
    }

    public function testGetUserBookmarksWithLimitOtherUser(): void
    {
        $user = $this->getOtherUser();
        $this->apiRequestWithAuth('GET', '/users/' . $user->getId() . '/bookmarks/1');
        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetUser(): void
    {
        $user = $this->getTestUser();
        $this->apiRequestWithAuth('GET', '/users/' . $user->getId());
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertEquals($user->getId(), $data['id'], 'User ID does not match');
        $this->assertEquals('Test User', $data['name'], 'Name does not match');
        $this->assertEquals('user', $data['entityType'], 'Entity type does not match');
        $this->assertArrayHasKey('data', $data);
    }

    public function testGetOtherUser(): void
    {
        $user = $this->getOtherUser();
        $this->apiRequestWithAuth('GET', '/users/' . $user->getId());
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertEquals($user->getId(), $data['id'], 'Other user ID does not match');
        $this->assertEquals('Test User', $data['name'], 'Name does not match');
        $this->assertEquals('user', $data['entityType'], 'Entity type does not match');
        $this->assertArrayHasKey('data', $data);
    }

    public function testDeleteUser(): void
    {
        $user = $this->getTestUser();
        $this->apiRequestWithAuth('DELETE', '/users/' . $user->getId());
        $this->assertResponseIsSuccessful();
        $searchUser = $this->getEntityManager()->getRepository(User::class)->find($user->getId());
        $this->assertNull($searchUser);
    }

    public function testDeleteOtherUser(): void
    {
        $user = $this->getOtherUser();
        $this->apiRequestWithAuth('DELETE', '/users/' . $user->getId());
        $this->assertResponseStatusCodeSame(403);
    }

    public function testEditUser(): void
    {
        $user = $this->getTestUser();

        $body = [
            'name' => 'edited-name',
            'password' => 'edited-password',
            'login' => 'edited-login',
            'data' => [
                'test-key' => 'edited-data',
                'notification_emails' => 'none'
            ],
        ];

        $response = $this->apiRequestWithAuth('PUT', '/users/' . $user->getId(), $body);

        $this->assertResponseIsSuccessful();
        $data = json_decode($response->getContent(), true);

        $this->assertIsArray($data);
        $this->assertEquals($user->getId(), $data['id']);
        $this->assertEquals('edited-name', $data['name']);
        $this->assertEquals($body['data'], $data['data']);

        $searchUser = $this->getEntityManager()->getRepository(User::class)->find($user->getId());
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        $this->assertTrue($hasher->isPasswordValid($searchUser, 'edited-password'));
        $this->assertEquals('edited-login', $searchUser->getLogin());
    }

    public function testEditOtherUser(): void
    {
        $user = $this->getOtherUser();
        $body = [
            'name' => 'edited-name',
        ];

        $this->apiRequestWithAuth('PUT', '/users/' . $user->getId(), $body);
        $this->assertResponseStatusCodeSame(403);
    }


    public function testResetApiKey(): void
    {
        $user = $this->getTestUser();
        $apiKey = $user->getSecretKey();
        $this->apiRequestWithAuth('POST', '/users/' . $user->getId() . '/reset-api-key');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertNotEquals($apiKey, $data['apiKey']);

        $user = $this->getEntityManager()->getRepository(User::class)->find($user->getId());
        $newApiKey = $user->getSecretKey();
        $this->assertNotEquals($apiKey, $newApiKey);
        $this->assertEquals($newApiKey, $data['apiKey']);
    }

    public function testUserNotifications(): void
    {
        $user = $this->getTestUser();
        $notifications = $this->getNotifications();
        $this->apiRequestWithAuth('GET', '/users/' . $user->getId() . '/notifications');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertCount(2, $data);
        for ($i = 0; $i < 2; $i++) {
            $this->assertEquals($notifications[$i]->getId(), $data[$i]['id'], 'Notification ID does not match');
            $this->assertEquals('notification', $data[$i]['entityType']);
            $this->assertEquals('Test Notification ' . $i, $data[$i]['data']['text']);
        }
    }

    public function testOtherUserNotifications(): void
    {
        $this->getTestUser();
        $otherUser = $this->getOtherUser();
        $this->getNotifications();
        $this->apiRequestWithAuth('GET', '/users/' . $otherUser->getId() . '/notifications');
        $this->assertResponseStatusCodeSame(403);
    }

    public function testUserNotificationsWithLimit(): void
    {
        $user = $this->getTestUser();
        $notifications = $this->getNotifications();
        $this->apiRequestWithAuth('GET', '/users/' . $user->getId() . '/notifications/1');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertCount(1, $data);
        $this->assertEquals($notifications[0]->getId(), $data[0]['id'], 'Notification ID does not match');
        $this->assertEquals('notification', $data[0]['entityType']);
        $this->assertEquals('Test Notification 0', $data[0]['data']['text']);
    }
}