<?php

namespace App\Tests\Api;

use App\Entity\User;
use App\Service\Token;
use Symfony\Component\Mailer\EventListener\MessageLoggerListener;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PublicApiTest extends BaseApiTestCase
{
    public function testGetPublicMessage(): void
    {
        $message = $this->getTestMessage();
        $user = $this->getTestUser();
        $group = $this->getTestGroup();
        $token = Token::encode([
            'iat' => time(),
            'sub' => Token::SUB_READ_PUBLIC_MESSAGE,
            'id' => $message->getId(),
        ], $message->getSecretKey());

        $this->apiRequest('GET', '/public/' . $token);
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

    public function testUnsubscribe(): void
    {
        $user = $this->getTestUser();
        $this->assertEquals('immediately', $user->getData()['notification_emails']);

        $unsubscribe_token = Token::encode([
            'exp' => time() + 86400 * 60,
            'sub' => Token::SUB_STOP_EMAIL_NOTIFICATIONS,
        ], $user->getSecretKey());

        $this->apiRequest('GET', '/stop-notification-emails/' . $user->getId() . '/' . $unsubscribe_token);
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message',  $data);
        $user = $this->getEntityManager()->getRepository(User::class)->find($user->getId());
        $this->assertEquals('none', $user->getData()['notification_emails']);
    }

    public function testSendPasswordResetEmail(): void
    {
        $this->getTestUser();
        $this->apiRequest('POST', '/password-reset-mail', ['mail' => 'zusam@example.com']);
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertResponseIsSuccessful();
        $this->assertEquals([], $data);
    }

    public function testGetInfo(): void
    {
        $this->apiRequestWithAuth('GET', '/info');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertArrayHasKey('version', $data);
        $this->assertArrayHasKey('upload', $data);
        $this->assertArrayHasKey('default_lang', $data);
        $this->assertArrayHasKey('allow_email', $data);
        $this->assertArrayHasKey('allow_public_links', $data);
        $this->assertArrayHasKey('allow_message_reactions', $data);
        $this->assertArrayHasKey('show', $data);
        $this->assertArrayHasKey('image', $data['upload']);
        $this->assertArrayHasKey('video', $data['upload']);
        $this->assertArrayHasKey('pdf', $data['upload']);
        $this->assertArrayHasKey('group_invitation_links', $data['show']);
    }

    public function testGetInfoLoggedOut(): void
    {
        $this->apiRequest('GET', '/info');
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertArrayHasKey('default_lang', $data);
        $this->assertArrayHasKey('allow_email', $data);

        $this->assertArrayNotHasKey('version', $data);
        $this->assertArrayNotHasKey('upload', $data);
        $this->assertArrayNotHasKey('allow_public_links', $data);
        $this->assertArrayNotHasKey('allow_message_reactions', $data);
        $this->assertArrayNotHasKey('show', $data);
    }

    public function testSignup(): void
    {
        $group =  $this->getTestGroup();
        $inviteKey = $group->getInviteKey();
        $body = [
            'invite_key' => $inviteKey,
            'login' => 'new_user',
            'password' => 'new_password',
        ];
        $this->apiRequest('POST', '/signup', $body);
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $user = $this->getEntityManager()->getRepository(User::class)->findOneBy(['secretKey' => $data['api_key']]);
        $this->assertEquals('new_user', $user->getLogin());
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        $this->assertTrue($hasher->isPasswordValid($user, 'new_password'));
    }

    public function testSetNewPassword(): void
    {
        $user = $this->getTestUser();
        $token = Token::encode([
            'exp' => time() + 86400,
            'sub' => Token::SUB_RESET_PASSWORD,
        ], $user->getPassword());
        $body = [
            'key' => $token,
            'mail' => $user->getLogin(),
            'password' => 'new_password',
        ];
        $this->apiRequest('POST', '/new-password', $body);
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $user = $this->getEntityManager()->getRepository(User::class)->findOneBy(['secretKey' => $data['api_key']]);
        $this->assertEquals('zusam@example.com', $user->getLogin());
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        $this->assertTrue($hasher->isPasswordValid($user, 'new_password'));
    }

    public function testLogin(): void
    {
        // Retrieving the user is also testing login with
        // the right password
        $this->testUser = $this->createUser();

        // Now try logging in with the wrong password
        $loginPayload = [
            'login' => 'zusam@example.com',
            'password' => 'wrong_password',
        ];

        $this->client->request(
            'POST',
            '/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($loginPayload)
        );
        $response = $this->client->getResponse();
        $this->assertResponseStatusCodeSame(401);
    }
}