<?php

namespace App\EventListener;

use App\Command\Cron;
use Symfony\Component\HttpKernel\Event\TerminateEvent;

class TerminateListener
{
    private Cron $cron;
    private bool $enableTerminateListener;

    public function __construct(bool $enableTerminateListener, Cron $cron)
    {
        $this->cron = $cron;
        $this->enableTerminateListener = $enableTerminateListener;
    }

    public function onKernelTerminate(TerminateEvent $event)
    {
        if (!$event->isMainRequest()) {
            // don't do anything if it's not the main request
            return;
        }

        if (!$this->enableTerminateListener) {
            return;
        }

        $this->cron->runTask();
    }
}
