<?php

namespace App\Service;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Token
{
    public const SUB_RESET_PASSWORD = 1;
    public const SUB_STOP_EMAIL_NOTIFICATIONS = 2;
    public const SUB_READ_PUBLIC_MESSAGE = 3;

    public const TYPE_JWT = 1;
    public const TYPE_UUID = 2;

    public const JWT_DEFAULT_ALG = 'HS256';

    public static function is_jwt(string $token): bool
    {
        return self::TYPE_JWT == self::type($token);
    }

    public static function is_uuid(string $token): bool
    {
        return self::TYPE_UUID == self::type($token);
    }

    public static function type(string $token): int
    {
        if (Uuid::is_uuid($token)) {
            return self::TYPE_UUID;
        }

        return self::TYPE_JWT;
    }

    public static function encode(array $data, string $key): string
    {
        return JWT::encode($data, $key, self::JWT_DEFAULT_ALG);
    }

    public static function decode(string $jwt, string $key): array
    {
        try {
            return (array) JWT::decode($jwt, new Key($key, self::JWT_DEFAULT_ALG));
        } catch (\Exception $e) {
            return [];
        }
    }

    public static function extract(string $jwt): array
    {
        try {
            $tks = explode('.', $jwt);

            return json_decode(base64_decode($tks[1]), true);
        } catch (\Exception $e) {
            return [];
        }
    }
}
