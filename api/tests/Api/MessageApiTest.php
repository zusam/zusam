<?php

namespace App\Tests\Api;

use App\Entity\Message;
use App\Entity\Reaction;
use App\Service\Token;

class MessageApiTest extends BaseApiTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $_ENV['ALLOW_MESSAGE_REACTIONS'] = 'true';
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $_ENV['ALLOW_MESSAGE_REACTIONS'] = 'false';
    }

    public function testGetMessage(): void
    {
        $user = $this->getTestUser();
        $group = $this->getTestGroup();
        $message = $this->getTestMessage();
        $this->apiRequestWithAuth('GET', '/messages/' . $message->getId());

        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertEquals($message->getId(), $data['id']);
        $this->assertEquals($message->getData(), $data['data']);
        $this->assertEquals($user->getId(), $data['author']['id']);
        $this->assertEquals($group->getId(), $data['group']['id']);
        $this->assertEquals('message', $data['entityType']);
        $this->assertArrayHasKey('lastActivityDate', $data);
    }

    public function testGetMessageNotLinkedForbidden(): void
    {
        $message = $this->getTestMessageFromGroupNotLinked();
        $this->apiRequestWithAuth('GET', '/messages/' . $message->getId());
        $this->assertResponseStatusCodeSame(403);
    }

    public function testCreateMessage(): void
    {
        $user = $this->getTestUser();

        $body = [
            'data' => [
              'title' => 'Message title',
              'text' => 'Message body',
            ],
            'author' => $user->getId(),
            'group' => $this->getTestGroup()->getId(),
        ];
        $this->apiRequestWithAuth('POST', '/messages', $body);
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertEquals($body['data']['title'], $data['data']['title']);
        $this->assertEquals($body['data']['text'], $data['data']['text']);
        $this->assertEquals('message', $data['entityType']);
        $message = $this->getEntityManager()->getRepository(Message::class)->find($data['id']);
        $this->assertNotNull($message);
        $this->assertEquals($data['author']['id'], $message->getAuthor()->getId());
        $this->assertEquals($data['group']['id'], $message->getGroup()->getId());
    }

    public function testCreateMessageNotLinkedForbidden(): void
    {
        $user = $this->getTestUser();

        $body = [
            'data' => [
                'title' => 'Message title',
                'text' => 'Message body',
            ],
            'author' => $user->getId(),
            'group' => $this->getTestGroupNotLinked()->getId(),
        ];
        $this->apiRequestWithAuth('POST', '/messages', $body);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testDeleteMessage(): void
    {
        $message = $this->getTestMessage();
        $messageCheck = $this->getEntityManager()->getRepository(Message::class)->find($message->getId());
        $this->assertNotNull($messageCheck);
        $this->apiRequestWithAuth('DELETE', '/messages/' . $message->getId());
        $this->assertResponseStatusCodeSame(204);
        $messageCheck = $this->getEntityManager()->getRepository(Message::class)->find($message->getId());
        $this->assertNull($messageCheck);
    }

    public function testDeleteMessageNotLinkedForbidden(): void
    {
        $message = $this->getTestMessageFromGroupNotLinked();
        $this->apiRequestWithAuth('DELETE', '/messages/' . $message->getId());
        $this->assertResponseStatusCodeSame(403);
        $messageCheck = $this->getEntityManager()->getRepository(Message::class)->find($message->getId());
        $this->assertEquals($message->getId(), $messageCheck->getId());
    }

    public function testUpdateMessage(): void
    {
        $message = $this->getTestMessage();
        $body = [
            'data' => [
                'title' => 'Message title edited',
                'text' => 'Message body edited',
            ],
        ];
        $this->apiRequestWithAuth('PUT', '/messages/' . $message->getId(), $body);
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertEquals($body['data']['title'], $data['data']['title']);
        $this->assertEquals($body['data']['text'], $data['data']['text']);
        $messageCheck = $this->getEntityManager()->getRepository(Message::class)->find($message->getId());
        $this->assertEquals($body['data']['title'], $messageCheck->getData()['title']);
        $this->assertEquals($body['data']['text'], $messageCheck->getData()['text']);
    }

    public function testUpdateMessageNotLinkedForbidden(): void
    {
        $message = $this->getTestMessageFromGroupNotLinked();
        $body = [
            'data' => [
                'title' => 'Message title edited',
                'text' => 'Message body edited',
            ],
        ];
        $this->apiRequestWithAuth('PUT', '/messages/' . $message->getId());
        $this->assertResponseStatusCodeSame(403);
        $messageCheck = $this->getEntityManager()->getRepository(Message::class)->find($message->getId());
        $this->assertNotEquals($body['data']['title'], $messageCheck->getData()['title']);
    }

    public function testGetPublicLink(): void
    {
        $message = $this->getTestMessage();
        $this->apiRequestWithAuth('GET', '/messages/' . $message->getId() . '/get-public-link');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertNotEmpty($data['token']);
        $token_data = Token::extract($data['token']);
        $this->assertEquals($message->getId(), $token_data['id']);
        $this->assertEquals(Token::SUB_READ_PUBLIC_MESSAGE, $token_data['sub']);
    }

    public function testGetPublicLinkGroupNotLinked(): void
    {
        $message = $this->getTestMessageFromGroupNotLinked();
        $this->apiRequestWithAuth('GET', '/messages/' . $message->getId() . '/get-public-link');
        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetPublicLinkDisabled(): void
    {
        $_ENV['ALLOW_PUBLIC_LINKS'] = 'false';
        $message = $this->getTestMessage();
        $this->apiRequestWithAuth('GET', '/messages/' . $message->getId() . '/get-public-link');
        $this->assertResponseStatusCodeSame(403);
        $_ENV['ALLOW_PUBLIC_LINKS'] = 'true';
    }

    public function testGetMessagePreview(): void
    {
        $message = $this->getTestMessage();
        $this->apiRequestWithAuth('GET', '/messages/' . $message->getId() . '/preview');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertEquals($message->getId(), $data['id']);
        $this->assertEquals($message->getData()['title'], $data['data']['title']);
        $this->assertEquals($message->getData()['text'], $data['data']['text']);
    }

    public function testSearchForMessage(): void
    {
        $this->getTestMessage(); // add another message to have more confidence we got the right one
        $message = $this->getTestSearchForMessage(); // the actual message we are searching for
        $group = $message->getGroup();
        $body = [
            'group' => [$group->getId()],
            'search' => 'search',
            'hashtags' => ''
        ];
        $this->apiRequestWithAuth('POST', '/messages/search', $body);
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertCount(1, $data['messages']);
        $this->assertEquals($message->getId(), $data['messages'][0]['id']);
    }

    public function testAddReaction(): void
    {
        $message = $this->getTestMessage();
        $body = [
            'reaction' => '👍',
        ];
        $this->apiRequestWithAuth('POST', '/messages/' . $message->getId() . '/reactions', $body);
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $reaction = $data[0]['currentUserReactionId'];
        $reactionCheck = $this->getEntityManager()->getRepository(Reaction::class)->find($reaction);
        $this->assertEquals($reactionCheck->getId(), $reaction);
        $this->assertEquals($reactionCheck->getValue(), $body['reaction']);
    }

    public function testAddReactionNotLinked(): void
    {
        $message = $this->getTestMessageFromGroupNotLinked();
        $body = [
            'reaction' => '👍',
        ];
        $this->apiRequestWithAuth('POST', '/messages/' . $message->getId() . '/reactions', $body);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testAddReactionDisabled(): void
    {
        $_ENV['ALLOW_MESSAGE_REACTIONS'] = 'false';
        $message = $this->getTestMessage();
        $body = [
            'reaction' => '👍',
        ];
        $this->apiRequestWithAuth('POST', '/messages/' . $message->getId() . '/reactions', $body);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testDeleteReaction(): void
    {
        $reaction = $this->getTestReaction();
        $message = $this->getTestMessage();
        $reactionCheck = $this->getEntityManager()->getRepository(Reaction::class)->find($reaction->getId());
        $this->assertNotNull($reactionCheck);
        $this->apiRequestWithAuth('DELETE', '/messages/' . $message->getId() . '/reactions/'. $reaction->getId());
        $this->assertResponseIsSuccessful();
        $reactionCheck = $this->getEntityManager()->getRepository(Reaction::class)->find($reaction->getId());
        $this->assertNull($reactionCheck);
    }

    public function testGetReactions(): void
    {
        $reaction =  $this->getTestReaction();
        $message = $this->getTestMessage();
        $this->apiRequestWithAuth('GET', '/messages/' . $message->getId() . '/reactions');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertCount(1, $data);
        $this->assertEquals($reaction->getId(), $data[0]['currentUserReactionId']);
        $this->assertEquals($reaction->getValue(), $data[0]['emoji']);
    }

    public function testGetReactionsDisabled(): void
    {
        $_ENV['ALLOW_MESSAGE_REACTIONS'] = 'false';
        $this->getTestReaction();
        $message = $this->getTestMessage();
        $this->apiRequestWithAuth('GET', '/messages/' . $message->getId() . '/reactions');
        $this->assertResponseStatusCodeSame(403);
    }

    public function testFeedPages():  void
    {
        $this->getTestMessages(40);
        $this->apiRequestWithAuth('GET', '/feed/page/0');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(30, $data['messages']);
        $this->assertArrayHasKey('messages', $data, 'Message array is missing');
        $this->assertSame(40, (int) $data['totalItems']);
    }

    public function testFeedCombinesGroups(): void
    {
        $user = $this->getTestUser();
        $otherGroup = $this->getTestGroupNotLinked();
        $otherGroup->addUser($user);
        $user->addGroup($otherGroup);
        $message = $this->getTestMessage();
        $otherMessage = $this->getTestMessageFromGroupNotLinked();
        $this->apiRequestWithAuth('GET', '/feed/page/0');
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertContains($message->getId(), $data['messages']);
        $this->assertContains($otherMessage->getId(), $data['messages']);
    }
}