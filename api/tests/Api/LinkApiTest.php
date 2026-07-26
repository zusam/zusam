<?php

namespace App\Tests\Api;

use App\Entity\Link;

class LinkApiTest extends BaseApiTestCase
{
    private function createLink(string $url, array $data): Link
    {
        $link = new Link($url);
        $link->setData($data);
        $em = $this->getEntityManager();
        $em->persist($link);
        $em->flush();

        return $link;
    }

    public function testGetByUrlRequiresAuthentication(): void
    {
        // No getTestUser() call => no api key => anonymous request.
        $this->apiRequest('GET', '/links/by_url?url=' . urlencode('http://127.0.0.1'));
        $this->assertResponseStatusCodeSame(401);
    }

    public function testGetByUrlBlocksPrivateAddressWhenAuthenticated(): void
    {
        $this->apiRequestWithAuth('GET', '/links/by_url?url=' . urlencode('http://127.0.0.1:6379'));
        $this->assertResponseStatusCodeSame(400);

        $this->apiRequestWithAuth('GET', '/links/by_url?url=' . urlencode('http://169.254.169.254/latest/meta-data/'));
        $this->assertResponseStatusCodeSame(400);
    }

    public function testGetByIdReturnsExistingLinkAnonymously(): void
    {
        $link = $this->createLink('https://example.com/article', [
            'title' => 'An article',
            'description' => 'desc',
        ]);
        $id = $link->getId();

        // Anonymous request (no api key).
        $this->apiRequest('GET', '/links/' . $id);
        $this->assertResponseStatusCodeSame(200);

        $body = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals($id, $body['id']);
        $this->assertEquals('https://example.com/article', $body['url']);
        $this->assertEquals('An article', $body['data']['title']);
        $this->assertArrayHasKey('updatedAt', $body);
        $this->assertArrayHasKey('preview', $body);
    }

    public function testGetByIdReturns404ForUnknownLink(): void
    {
        $this->apiRequest('GET', '/links/00000000-0000-4000-8000-000000000000');
        $this->assertResponseStatusCodeSame(404);
    }
}
