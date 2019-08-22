<?php

namespace App\Tests\Controller\Message;

use App\Entity\Message;
use App\Tests\ApiTestCase;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class NewTest extends ApiTestCase
{
    public function __construct() {
        parent::__construct();
    }

    public function testBadRequest()
    {
        $this->client->request("POST", "/messages", [], [], ["CONTENT_TYPE" => "application/json"], "");
        $this->assertEquals(400, $this->client->getResponse()->getStatusCode(), "Empty body should be considered as bad content");

        $this->client->request("POST", "/messages", [], [], ["CONTENT_TYPE" => "application/json"], "simple string");
        $this->assertEquals(400, $this->client->getResponse()->getStatusCode(), "Not JSON body should be considered as bad content");

        //$client->request("POST", "/messages", [], [], [
        //    "CONTENT_TYPE" => "application/json",
        //    "HTTP_X_AUTH_TOKEN" => "52ceecc0-4cdb-4500-897c-676c2ca632db",
        //], "{}");
        //$this->assertEquals(400, $client->getResponse()->getStatusCode(), "Should not accept empty message");

        //$client->request("POST", "/messages", [], [], [
        //    "CONTENT_TYPE" => "application/json",
        //    "HTTP_X_AUTH_TOKEN" => "52ceecc0-4cdb-4500-897c-676c2ca632db",
        //], '{"group": "f7140199-67e2-45c0-B596-a7a29c1fc901"}');
        //$this->assertEquals(400, $client->getResponse()->getStatusCode(), "Should not accept empty message");
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
            "HTTP_X_AUTH_TOKEN" => "52ceecc0-4cdb-4500-897c-676c2ca632db",
        ], '{
            "createdAt": '.time().',
            "lastActivityDate": '.time().',
            "group": "/groups/f7140199-67e2-45c0-B596-a7a29c1fc901",
            "author": "/users/11752f7e-9624-4986-89b8-636a081262ea",
            "data": {"text": ""},
            "files": {},
            "children": {}
        }');
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode(), "Failed to post simple test message");

        $content = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertNotEmpty($content["id"], "Returned content should have an id");
        $this->assertNotEmpty($content["secretKey"], "Returned content should have a secretKey");

        $message = $this->em->getRepository(Message::class)->findOneById($content["id"]);

        $this->assertInstanceOf(Message::class, $message, "Entity should be a Message");
        $this->assertEquals($content["secretKey"], $message->getSecretKey(), "SecretKey between content returned and persisted entity should be equal");
        $this->assertEquals($content["createdAt"], $message->getCreatedAt(), "CreatedAt between content returned and persisted entity should be equal");
    }
}
