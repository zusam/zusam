<?php

namespace App\Service;

class SingleActionKey
{
    /*
     * A single action key is a token that can be used to 
     * accomplish one action (optionally in a limited time frame).
     * It's generated in a fashion close to a JWT token.
     *
     * secret: the seed used to generate the secret
     * action: description of the action intended to be made
     * period: interval of time in seconds
     * duration: number of periods during which the single action key is valid
     */
    public static function create(
        string $secret,
        string $action,
        int $period = null,
        int $duration = null,
        string $hash_alg = "sha512"
    ): string
    {
        // generate a short salt
        $salt = bin2hex(random_bytes(3));

        // construct the metadata of the token
        if (!empty($period) && !empty($duration)) {
            $metadata = $salt."-".$action."-".$period."-".$duration;
        } else {
            $metadata = $salt."-".$action;
        }

        // return the generated token
        return $metadata."-".hash($hash_alg, $secret.$metadata);
    }

    public static function verify(
        string $key,
        string $secret,
        string $hash_alg = "sha512"
    ): bool
    {
        $parts = explode("-", $key);

        // check for malformed key
        if (count($parts) < 3 || count($parts) > 5) {
            return false;
        }

        $salt = $parts[0];
        $action = $parts[1];
        if (count($parts) == 5) {
            $period = $parts[2];
            $duration = $parts[3];
            $hash = $parts[4];
        } else {
            $hash = $parts[2];
        }

        //if (empty($period) || empty($duration)) {
        //    if (hash(
    }
}
