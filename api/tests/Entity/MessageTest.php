<?php

namespace App\Tests\Entity;

use App\Entity\Message;
use PHPUnit\Framework\TestCase;

class MessageTest extends TestCase
{
    // Old format (plain text) — backwards compat
    public function testGetUrlsFromPlainText(): void
    {
        $message = new Message();
        $message->setData(['text' => 'Check https://example.com now']);
        $urls = $message->getUrls();
        $this->assertSame('https://example.com', $urls[0]);
    }

    // New Quill format — the actual bug case
    public function testGetUrlsFromQuillJson(): void
    {
        $textOnly = "https://example.com\n";  // actual newline, as Quill produces
        $quillText = json_encode([
            'delta' => ['ops' => [['insert' => $textOnly]]],
            'textOnly' => $textOnly,
        ]);
        $message = new Message();
        $message->setData(['text' => $quillText]);
        $urls = $message->getUrls();
        $this->assertNotEmpty($urls);
        $this->assertSame('https://example.com', $urls[0]);
    }

    // No URL
    public function testGetUrlsReturnsEmptyWhenNoUrl(): void
    {
        $message = new Message();
        $message->setData(['text' => 'Hello world']);
        $this->assertSame([], $message->getUrls());
    }

    // No text field
    public function testGetUrlsReturnsEmptyWhenNoTextField(): void
    {
        $message = new Message();
        $message->setData(['title' => 'No text']);
        $this->assertSame([], $message->getUrls());
    }
}
