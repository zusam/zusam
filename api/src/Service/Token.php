<?php

namespace App\Service;

use Firebase\JWT\JWT;

class Token
{
    public const SUB_RESET_PASSWORD = 1;
    public const SUB_STOP_EMAIL_NOTIFICATIONS = 2;
    public const SUB_READ_PUBLIC_MESSAGE = 3;

    public static function encode(array $data, string $key): string
    {
        return JWT::encode($data, $key, 'HS256');
    }

    public static function decode(string $jwt, string $key): array
    {
        try {
            return (array) JWT::decode($jwt, $key, ['HS256']);
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
