<?php

namespace App\Tests\Service;
use App\Service\Uuid;
use PHPUnit\Framework\TestCase;

class UuidTest extends TestCase
{
    public function testUuidv4()
    {
        $this->assertEquals(Uuid::uuidv4('thisisafixedseed'), Uuid::uuidv4('thisisafixedseed'));
        for ($i = 0; $i < 10; $i++) {
            $this->assertEquals(preg_match("/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/", Uuid::uuidv4()), 1);
        }
    }
}
