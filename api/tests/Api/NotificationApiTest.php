<?php

namespace App\Tests\Api;

use App\Entity\Notification;
use App\Entity\Message;
use \App\Service\Notification as NotificationService;

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

    public function testGetUserNotificationsWhenMessageDeleted(): void
    {
        $em = $this->getEntityManager();

        // Setup users and add them to a group
        $author = $this->getTestUser();
        $recipient = $this->getOtherUser();

        $group = $this->createGroup();
        $group->addUser($author);
        $group->addUser($recipient);
        $author->addGroup($group);
        $recipient->addGroup($group);

        $em->persist($group);
        $em->flush();

        // Create a message and a related notification for the other user
        $message = $this->createMessage($group, $author);
        $notificationService = self::getContainer()->get(NotificationService::class);

        $notificationService->create(
            Notification::NEW_MESSAGE,
            $message->getId(),
            $recipient,
            $author,
            $group,
            $message
        );

        // Delete the message - to test that this doesn't break notifications
        $messageRef = $em->getReference(Message::class, $message->getId());
        $em->remove($messageRef);
        $em->flush();
        $em->clear();

        // Log in as the recipient to test their notifications still work after deletion of message
        $response = $this->login($recipient->getLogin(), 'zusam');
        $data = json_decode($response->getContent(), true);
        $this->apiKey = $data['api_key'];

        // Actual test that the endpoint still works
        $response = $this->apiRequestWithAuth('GET', '/me/notifications');

        $this->assertResponseIsSuccessful();

        $data = json_decode($response->getContent(), true);

        $this->assertNotEmpty($data);
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