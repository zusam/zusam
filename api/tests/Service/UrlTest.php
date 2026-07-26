<?php

namespace App\Tests\Service;

use App\Service\Url;
use PHPUnit\Framework\TestCase;

class UrlTest extends TestCase
{
    /**
     * Only IP-literal urls are used here so the test never performs DNS lookups.
     */
    public function testIsPublicHttpUrlRejectsInternalAndNonHttp(): void
    {
        $blocked = [
            'http://127.0.0.1',
            'http://127.0.0.1:6379/',
            'http://169.254.169.254/latest/meta-data/', // cloud metadata
            'http://10.0.0.1',
            'http://172.16.0.1',
            'http://192.168.1.1',
            'http://[::1]/',
            'http://[::ffff:127.0.0.1]/', // ipv4-mapped loopback
            'ftp://93.184.216.34/',
            'file:///etc/passwd',
            'gopher://93.184.216.34/',
            'not a url',
            '',
        ];

        foreach ($blocked as $url) {
            $this->assertFalse(Url::isPublicHttpUrl($url), "{$url} should be blocked");
        }
    }

    public function testIsPublicHttpUrlAllowsPublicAddress(): void
    {
        $this->assertTrue(Url::isPublicHttpUrl('http://93.184.216.34/'));
        $this->assertTrue(Url::isPublicHttpUrl('https://93.184.216.34/some/path?q=1'));
        $this->assertTrue(Url::isPublicHttpUrl('http://[2606:2800:220:1:248:1893:25c8:1946]/'));
    }
}
