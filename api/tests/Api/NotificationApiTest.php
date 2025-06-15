<?php

namespace App\Tests\Api;

use App\Entity\Notification;

class NotificationApiTest extends BaseApiTestCase
{
    public function testGetUserNotifications(): void
    {
        $notification = $this->getNotifications()[0];
        $this->apiRequestWithAuth('GET', '/notifications/' . $notification->getId());
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals($notification->getId(), $data['id'], 'Notification ID does not match');
        $this->assertEquals('notification', $data['entityType']);
        $this->assertEquals('global_notification', $data['type']);
        $this->assertEquals("Test Notification 0", $data['data']['text']);
    }

    public function testEditUserNotification(): void
    {
        $notification = $this->getNotifications()[0];
        $body = [
            'data' => [
                'text' => 'Test Notification 0 edited',
            ],
            'read' => true,
        ];
        $this->assertNotEquals($body['data']['text'], $notification->getData()['text']);
        $this->assertFalse($notification->getRead());
        $this->apiRequestWithAuth('PUT', '/notifications/' . $notification->getId(), $body);
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals($body['data']['text'], $data['data']['text']);
        $this->assertTrue($data['read']);
        $updatedNotification = $this->getEntityManager()->getRepository(Notification::class)->find($notification->getId());
        $this->assertEquals($body['data']['text'], $updatedNotification->getData()['text']);
        $this->assertTrue($updatedNotification->getRead());
        $this->assertEquals($data['id'], $updatedNotification->getId());
    }

    public function testDeleteUserNotification(): void
    {
        $notification = $this->getNotifications()[0];
        $this->apiRequestWithAuth('DELETE', '/notifications/' . $notification->getId());
        $this->assertResponseIsSuccessful();
        $searchNotification = $this->getEntityManager()->getRepository(Notification::class)->find($notification->getId());
        $this->assertNull($searchNotification);
    }
}