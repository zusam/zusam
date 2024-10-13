<?php

namespace App\Service;

class Uuid
{
    /**
     * Return a UUID (version 4) using random bytes
     * Note that version 4 follows the format:
     *     xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     * where y is one of: [8, 9, A, B].
     */
    public static function uuidv4(?string $seed = null): string
    {
        if (null == $seed) {
            return uuid_create(UUID_TYPE_RANDOM);
        }

        // if we have a seed, use it to generate the uuidv4
        $str = hash('sha512', $seed);
        $num = intval(preg_replace("/[^\d]/", '', substr($str, 0, 10)));

        return implode('-', [
            substr($str, 0, 8),
            substr($str, 8, 4),
            4 .substr($str, 12, 3),
            [8, 9, 'a', 'b'][$num % 4].substr($str, 15, 3),
            substr($str, 18, 12),
        ]);
    }

    public static function is_uuid(string $uuid): bool
    {
        // Regular expression to match a valid UUID
        $pattern = '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i';

        return 1 === preg_match($pattern, $uuid);
    }
}
