<?php

namespace App\Service;

use \Firebase\JWT\JWT;

class Token
{
    public const SUB_RESET_PASSWORD = 1;
    public const SUB_STOP_EMAIL_NOTIFICATIONS = 2;

    public static function encode(array $data, string $key): string
    {
        return JWT::encode($data, $key, "HS256");
    }

    public static function decode(string $jwt, string $key): array
    {
        try {
            (array) return JWT::decode($jwt, $key, ["HS256"]);
        } catch (\Exception $e) {
            return [];
        }
    }
}
