<?php

namespace App\Service;

class Uuid
{
    /**
     * Return a UUID (version 4) using random bytes
     * Note that version 4 follows the format:
     *     xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     * where y is one of: [8, 9, A, B].
     *
     * We use (random_bytes(1) & 0x0F) | 0x40 to force
     * the first character of hex value to always be 4
     * in the appropriate position.
     *
     * For 4: http://3v4l.org/q2JN9
     * For Y: http://3v4l.org/EsGSU
     * For the whole shebang: http://3v4l.org/BkjBc
     *
     * @see https://paragonie.com/b/JvICXzh_jhLyt4y3
     *
     * @return string
     */
    public static function uuidv4(string $seed = null): string
    {
        if (null == $seed) {
            return implode('-', [
                bin2hex(random_bytes(4)),
                bin2hex(random_bytes(2)),
                bin2hex(chr((ord(random_bytes(1)) & 0x0F) | 0x40)).bin2hex(random_bytes(1)),
                bin2hex(chr((ord(random_bytes(1)) & 0x3F) | 0x80)).bin2hex(random_bytes(1)),
                bin2hex(random_bytes(6)),
            ]);
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
}
