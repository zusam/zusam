<?php

namespace App\Tests\Api;

class MeApiTest extends BaseApiTestCase
{
    public function testMeEndpointReturnsUserData(): void
    {
        $group = $this->getTestGroup();
        $this->apiRequestWithAuth('GET', '/me');

        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertIsArray($data);
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('login', $data);
        $this->assertArrayHasKey('name', $data);
        $this->assertArrayHasKey('data', $data);
        $this->assertIsArray($data['data']);
        $this->assertArrayHasKey('lastActivityDate', $data);
        $this->assertArrayHasKey('lastNotificationEmailCheck', $data);
        $this->assertArrayHasKey('groups', $data);
        $this->assertIsArray($data['groups']);
        $this->assertContains(
            $group->getId(),
            array_column($data['groups'], 'id'),
            'Expected group ID not found in response.'
        );
        $this->assertArrayNotHasKey('password', $data);
    }

    public function testMeBookmarks(): void
    {
        $user =  $this->getTestUser();
        $bookmarks = $this->getBookmarks();
        $this->apiRequestWithAuth('GET', '/me/bookmarks');
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

    public function testMeBookmarksWithLimit(): void
    {
        $user =  $this->getTestUser();
        $bookmarks = $this->getBookmarks();
        $this->apiRequestWithAuth('GET', '/me/bookmarks/1');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertCount(1, $data);
        $this->assertEquals($bookmarks[0]->getId(), $data[0]['id'], 'Bookmark ID does not match');
        $this->assertEquals($user->getId(), $data[0]['user']['id'], 'User ID for bookmark does not match');
        $this->assertEquals('bookmark', $data[0]['entityType']);
    }

    public function testMeNotifications(): void
    {
        $notifications = $this->getNotifications();
        $this->apiRequestWithAuth('GET', '/me/notifications');
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

    public function testMeNotificationsWithLimit(): void
    {
        $notifications = $this->getNotifications();
        $this->apiRequestWithAuth('GET', '/me/notifications/1');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertCount(1, $data);
        $this->assertEquals($notifications[0]->getId(), $data[0]['id'], 'Notification ID does not match');
        $this->assertEquals('notification', $data[0]['entityType']);
        $this->assertEquals('Test Notification 0', $data[0]['data']['text']);
    }
}