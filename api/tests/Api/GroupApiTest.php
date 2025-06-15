<?php

namespace App\Tests\Api;

use App\Entity\Group;
use App\Entity\User;

class GroupApiTest extends BaseApiTestCase
{
    public function testGetGroup(): void
    {
        $group = $this->getTestGroup();
        $this->apiRequestWithAuth('GET', '/groups/' . $group->getId());

        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertArrayHasKey('id', $data);
        $this->assertEquals($group->getId(), $data['id']);
        $this->assertEquals($group->getName(), $data['name']);
        $this->assertEquals($group->getSecretKey(), $data['secretKey']);
        $this->assertEquals('group', $data['entityType']);
        $this->assertArrayHasKey('lastActivityDate', $data);
    }

    public function testGetGroupNotLinkedForbidden(): void
    {
        $group = $this->getTestGroupNotLinked();
        $this->apiRequestWithAuth('GET', '/groups/' . $group->getId());
        $this->assertResponseStatusCodeSame(403);
    }

    public function testCreateGroup(): void
    {
        $body = [
            'name' => 'test',
            'createdAt' => 1749874327,
        ];
        $this->apiRequestWithAuth('POST', '/groups', $body);

        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertArrayHasKey('id', $data);
        $this->assertEquals('test', $data['name']);
        $this->assertEquals('group', $data['entityType']);
        $this->assertArrayHasKey('secretKey', $data);
        $this->assertNotEmpty($data['secretKey']);
    }

    public function testEditGroup(): void
    {
        $group = $this->getTestGroup();

        $body = [
            'name' => 'edited name',
        ];

        $this->apiRequestWithAuth('PUT', '/groups/' . $group->getId(), $body);

        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertEquals('edited name', $data['name']);
    }

    public function testEditGroupNotLinkedForbidden(): void
    {
        $group = $this->getTestGroupNotLinked();

        $body = [
            'name' => 'edited name',
        ];
        $this->apiRequestWithAuth('PUT', '/groups/' . $group->getId(), $body);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testLeaveGroup(): void
    {
        $user = $this->getTestUser();
        $group = $this->getTestGroup();

        $this->apiRequestWithAuth('POST', '/groups/' . $group->getId() . '/leave');
        $this->assertResponseIsSuccessful();

        $group = $this->getEntityManager()->getRepository(Group::class)->find($group->getId());

        $groupUsers = $group->getUsers();

        $this->assertFalse(
            $groupUsers->contains($user),
            'User should no longer belong to the group after leaving.'
        );
    }

    public function testGetRandomMessageFromGroup(): void
    {
        $group = $this->getTestGroup();
        $this->getTestMessage();

        $this->apiRequestWithAuth('GET', '/groups/' . $group->getId() . '/random');

        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertArrayHasKey('id', $data, 'ID is missing');
        $this->assertEquals($group->getId(), $data['group']['id'], 'ID does not match');
    }

    public function testInviteAddsToGroup(): void
    {
        $user = $this->getTestUser();
        $group = $this->getTestGroupNotLinked();
        $inviteKey = $group->getInviteKey();
        $this->apiRequestWithAuth('POST', '/groups/invitation/' . $inviteKey);

        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertEquals($group->getId(), $data['id']);

        $group = $this->getEntityManager()->getRepository(Group::class)->find($group->getId());
        $user = $this->getEntityManager()->getRepository(User::class)->find($user->getId());
        $groupUsers = $group->getUsers();
        $this->assertTrue(
            $groupUsers->contains($user),
            'User does not belong to the group after invitation.'
        );
    }

    public function testResetInviteKey(): void
    {
        $user = $this->getTestUser();
        $group = $this->getTestGroup();
        $inviteKey = $group->getInviteKey();
        $this->apiRequestWithAuth('POST', '/groups/' . $group->getId() . '/reset-invite-key');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertNotEquals($inviteKey, $data['inviteKey']);

        $group = $this->getEntityManager()->getRepository(Group::class)->find($group->getId());
        $newInviteKey = $group->getInviteKey();
        $this->assertNotEquals($inviteKey, $newInviteKey);
        $this->assertEquals($newInviteKey, $data['inviteKey']);
    }

    public function testResetInviteKeyNotLinked(): void
    {
        $group = $this->getTestGroupNotLinked();
        $inviteKey = $group->getInviteKey();
        $this->apiRequestWithAuth('POST', '/groups/' . $group->getId() . '/reset-invite-key');
        $this->assertResponseStatusCodeSame(403);

        $group = $this->getEntityManager()->getRepository(Group::class)->find($group->getId());
        $newInviteKey = $group->getInviteKey();
        $this->assertEquals($inviteKey, $newInviteKey);
    }

    public function testGetGroupMessages(): void
    {
        $group = $this->getTestGroup();
        $this->getTestMessage();
        $this->apiRequestWithAuth('GET', '/groups/' . $group->getId() . '/page/0');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertArrayHasKey('messages', $data, 'Message array is missing');
        $this->assertEquals($this->getTestMessage()->getId(), $data['messages'][0]);
        $this->assertGreaterThanOrEqual(1, (int) $data['totalItems']);
    }

    public function testGetGroupMessagesNotLinked(): void {
        $group = $this->getTestGroupNotLinked();
        $this->apiRequestWithAuth('GET', '/groups/' . $group->getId() . '/page/0');
        $this->assertResponseStatusCodeSame(403);
    }
}