<?php

namespace App\EventListener;

use App\Command\Cron;
use Symfony\Component\HttpKernel\Event\TerminateEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

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
        if (HttpKernelInterface::MAIN_REQUEST !== $event->getRequestType()) {
            // don't do anything if it's not the main request
            return;
        }

        // Run cron tasks in prod and test environments (test for integration testing)
        if (in_array($this->env, ['prod', 'test'], true)) {
            $this->cron->runTask();
        }
    }
}
