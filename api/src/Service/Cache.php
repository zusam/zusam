<?php

namespace App\Service;

use Symfony\Component\Cache\Adapter\TagAwareAdapter;
use Symfony\Component\Cache\Adapter\AdapterInterface;

class Cache extends TagAwareAdapter
{
    public function __construct(AdapterInterface $adapter)
    {
        parent::__construct($adapter);
    }
}
