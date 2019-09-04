<?php

namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\PostResponseEvent;
use App\Command\Cron;

class TerminateListener
{
    private $cron;
    private $env;

    public function __construct(string $env, Cron $cron)
    {
        $this->cron = $cron;
        $this->env = $env;
    }

    public function onKernelTerminate(PostResponseEvent $event)
    {
        // Do not run cron tasks in test env
        // This break tests with the httpClient
        if ('test' != $this->env) {
            $this->cron->runTask();
        }
    }
}
