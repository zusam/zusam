<?php

namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\TerminateEvent;
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

    public function onKernelTerminate(TerminateEvent $event)
    {
        if (!$event->isMasterRequest()) {
            // don't do anything if it's not the master request
            return;
        }

        // Do not run cron tasks in test or dev env
        // This break tests with the httpClient
        if ('prod' == $this->env) {
            $this->cron->runTask();
        }
    }
}
