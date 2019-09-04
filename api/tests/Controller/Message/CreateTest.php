<?php

namespace App\Tests\Controller\Message;

use App\Entity\Message;
use App\Tests\ApiTestCase;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CreateTest extends ApiTestCase
{
    public function __construct() {
        parent::__construct();
    }

    public function testBadRequest()
    {
        $this->client->request("POST", "/messages", [], [], [
            "CONTENT_TYPE" => "application/json",
            "HTTP_X_AUTH_TOKEN" => $this->firstUser->getSecretKey(),
        ], "");
        $this->assertEquals(400, $this->client->getResponse()->getStatusCode(), "Empty body should be considered as bad content");

        $this->client->request("POST", "/messages", [], [], [
            "CONTENT_TYPE" => "application/json",
            "HTTP_X_AUTH_TOKEN" => $this->firstUser->getSecretKey(),
        ], "simple string");
        $this->assertEquals(400, $this->client->getResponse()->getStatusCode(), "Not JSON body should be considered as bad content");
    }

    public function testUnauthorized()
    {
        $this->client->request("POST", "/messages", [], [], ["CONTENT_TYPE" => "application/json"], "{}");
        $this->assertEquals(401, $this->client->getResponse()->getStatusCode(), "Post message without api key should be unauthorized");
    }

    public function testPostMessage()
    {
        $this->client->request("POST", "/messages", [], [], [
            "CONTENT_TYPE" => "application/json",
            "HTTP_X_AUTH_TOKEN" => $this->firstUser->getSecretKey(),
        ], '{
            "group": "'.$this->firstGroup->getId().'",
            "author": "'.$this->firstUser->getId().'"
        }');
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode(), "Failed to post simple message, response: " . $this->client->getResponse()->getContent());

        $content = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertNotEmpty($content["id"], "Returned content should have an id");
        $this->assertNotEmpty($content["createdAt"], "Returned content should have an id");

        $message = $this->em->getRepository(Message::class)->findOneById($content["id"]);

        $this->assertInstanceOf(Message::class, $message, "Entity should be a Message");
        $this->assertEquals($content["createdAt"], $message->getCreatedAt(), "CreatedAt between content returned and persisted entity should be equal");
        // post comment to previous message
        $this->client->request("POST", "/messages", [], [], [
            "CONTENT_TYPE" => "application/json",
            "HTTP_X_AUTH_TOKEN" => $this->firstUser->getSecretKey(),
        ], '{
            "group": "'.$this->firstGroup->getId().'",
            "author": "'.$this->firstUser->getId().'",
            "parent": "'.$content["id"].'"
        }');
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode(), "Failed to post simple comment, response: " . $this->client->getResponse()->getContent());
    }

    public function testPostMessageWithLink()
    {
        $this->client->request("POST", "/messages", [], [], [
            "CONTENT_TYPE" => "application/json",
            "HTTP_X_AUTH_TOKEN" => $this->firstUser->getSecretKey(),
        ], '{
            "group": "'.$this->firstGroup->getId().'",
            "author": "'.$this->firstUser->getId().'",
            "data": {"text": "https://fsf.org"}
        }');
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode(), "Failed to post simple test message, response: " . $this->client->getResponse()->getContent());

        $content = json_decode($this->client->getResponse()->getContent(), true);
    }

    public function testPostMessageWithFile()
    {
        $fileId = $this->addFile(self::$container->get("kernel")->getProjectDir()."/tests/assets/zusam_logo.png");
        $this->client->request("POST", "/messages", [], [], [
            "CONTENT_TYPE" => "application/json",
            "HTTP_X_AUTH_TOKEN" => $this->firstUser->getSecretKey(),
        ], '{
            "group": "'.$this->firstGroup->getId().'",
            "author": "'.$this->firstUser->getId().'",
            "files": ["'.$fileId.'"],
            "data": {"text": "https://fsf.org"}
        }');
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode(), "Failed to post simple test message, response: " . $this->client->getResponse()->getContent());

        $content = json_decode($this->client->getResponse()->getContent(), true);
    }
}
