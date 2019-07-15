<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\PostResponseEvent;
use App\Command\Cron;

class TerminateListener
{
    private $cron;

    public function __construct(Cron $cron)
    {
        $this->cron = $cron;
    }

    public function onKernelTerminate(PostResponseEvent $event)
    {
        $this->cron->runTask();
    }
}
