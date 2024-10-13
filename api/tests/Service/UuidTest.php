<?php

namespace App\Tests\Service;
use App\Service\Uuid;
use PHPUnit\Framework\TestCase;

class UuidTest extends TestCase
{
    public function testUuidv4()
    {
        $uuids = [];
        for ($i = 0; $i < 10; $i++) {
            $uuid = Uuid::uuidv4();
            $this->assertFalse(in_array($uuid, $uuids));
            $this->assertEquals(Uuid::uuidv4($uuid), Uuid::uuidv4($uuid));
            $this->assertMatchesRegularExpression("/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/", $uuid);
            $uuids[] = $uuid;
        }
    }
}
