<?php

namespace App\Tests\Api;

use App\Entity\Bookmark;

class BookmarkApiTest extends BaseApiTestCase
{
    public function testGetBookmark(): void
    {
        $bookmark = $this->getBookmarks()[0];
        $message = $bookmark->getMessage();
        $user = $bookmark->getUser();
        $this->apiRequestWithAuth('GET', '/bookmarks/' . $bookmark->getId());
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals($bookmark->getId(), $data['id'], 'Bookmark ID does not match');
        $this->assertEquals('bookmark', $data['entityType']);
        $this->assertEquals($message->getId(), $data['message']['id']);
        $this->assertEquals($user->getId(), $data['user']['id']);

    }

    public function testDeleteBookmark(): void
    {
        $bookmark = $this->getBookmarks()[0];
        $searchBookmark = $this->getEntityManager()->getRepository(Bookmark::class)->find($bookmark->getId());
        $this->assertNotNull($searchBookmark);
        $this->apiRequestWithAuth('DELETE', '/bookmarks/' . $bookmark->getId());
        $this->assertResponseIsSuccessful();
        $searchBookmark = $this->getEntityManager()->getRepository(Bookmark::class)->find($bookmark->getId());
        $this->assertNull($searchBookmark);
    }

    public function testCreateBookmark(): void
    {
        $message = $this->getTestMessage();

        $body = [
            'message_id' => $message->getId(),
        ];
        $this->apiRequestWithAuth('POST', '/bookmarks', $body);
        $this->assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('bookmark', $data['entityType']);
        $this->assertEquals($message->getId(), $data['message']['id']);
        $searchBookmark = $this->getEntityManager()->getRepository(Bookmark::class)->find($data['id']);
        $this->assertEquals($searchBookmark->getUser()->getId(), $data['user']['id']);
        $this->assertEquals($searchBookmark->getMessage()->getId(), $data['message']['id']);
    }
}