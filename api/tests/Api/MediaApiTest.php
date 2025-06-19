<?php

namespace App\Tests\Api;

class MediaApiTest extends BaseApiTestCase
{
    public function testGetImage(): void
    {
        $file = $this->createImageFile();
        $id = $file->getId();
        $this->client->request('GET', "/images/thumbnail/100/100/$id");

        $response = $this->client->getResponse();
        $this->assertResponseIsSuccessful();
        $this->assertSame('image/jpeg', $response->headers->get('Content-Type'));
        $this->assertSame(200, $response->getStatusCode());
        $cacheDir = parent::getContainer()->getParameter('dir.cache') . '/images';

        $cachedFiles = glob($cacheDir . '/*.jpg');
        $this->assertNotEmpty($cachedFiles);
        $this->assertFileExists($cachedFiles[0]);
    }


    public function testUploadFile(): void
    {
        $user = $this->getTestUser();
        $uploadedFile = $this->createUploadedImageFile();

        $this->client->request(
            'POST',
            '/files',
            [],
            ['file' => $uploadedFile],
            [
                'HTTP_CONTENT_TYPE' => 'multipart/form-data',
                'HTTP_X-AUTH-TOKEN' => $user->getSecretKey(),
                ]
        );

        $this->assertResponseStatusCodeSame(201);

        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
        $this->assertArrayHasKey('id', $responseData);
        $this->assertArrayHasKey('contentUrl', $responseData);
        $this->assertEquals('ready', $responseData['status']);
    }

    public function testGetFileById(): void
    {
        $file = $this->createImageFile();
        $id = $file->getId();

        $this->client->request('GET', "/files/{$id}");

        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertIsArray($data);
        $this->assertEquals($id, $data['id']);
        $this->assertArrayHasKey('contentUrl', $data);
        $this->assertArrayHasKey('status', $data);
        $this->assertEquals('ready', $data['status']);
    }

    public function testGetFileNotFound(): void
    {
        $id = '1';
        $this->client->request('GET', "/files/{$id}");
        $this->assertResponseStatusCodeSame(404);
    }

    public function testGetLinkByUrlWithGet()
    {
        $this->client->request('GET', '/links/by_url?url=https://example.com');

        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('title', $data['data']);
        $this->assertArrayHasKey('url', $data['data']);
    }

    public function testGetLinkByUrlWithPost()
    {
        $this->getTestUser();
        $body = [
            'url' => 'https://example.com',
            'rescan' => false,
            'onlyData' => false,
        ]   ;

        $this->apiRequestWithAuth('POST', '/links/by_url', $body);

        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('title', $data['data']);
        $this->assertArrayHasKey('url', $data['data']);
    }
}