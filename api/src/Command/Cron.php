<?php

namespace App\Command;

use App\Service\System;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Lock\LockFactory;
use Symfony\Component\Lock\Store\FlockStore;

class Cron extends Command
{
    private $logger;
    private $input;
    private $output;
    private $system;
    private $tasks;
    private $kernel;
    private $params;
    private $lockStore;
    private $lockFactory;

    public function __construct(
        LoggerInterface $logger,
        System $system,
        KernelInterface $kernel,
        ParameterBagInterface $params,
    ) {
        parent::__construct();
        $this->logger = $logger;
        $this->system = $system;
        $this->kernel = $kernel;
        $this->params = $params;
        $this->lockStore = new FlockStore();
        $this->lockFactory = new LockFactory($this->lockStore);
        $this->tasks = [
            [
                'name' => 'zusam:convert:images',
                'period' => intval($this->params->get('cron.convert.images')),
                'type' => 'light',
            ],
            [
                'name' => 'zusam:convert:video',
                'period' => intval($this->params->get('cron.convert.video')),
                'type' => 'heavy',
            ],
            [
                'name' => 'zusam:notification:emails',
                'period' => intval($this->params->get('cron.notification.emails.throttling')),
                'type' => 'always',
                'options' => [
                    '--log-send' => true,
                ],
            ],
            [
                'name' => 'zusam:compress:gifs',
                'period' => intval($this->params->get('cron.compress.gifs')),
                'type' => 'heavy',
                'options' => [
                    '--max-compressions' => 5,
                ],
            ],
            [
                'name' => 'zusam:bot:activate',
                'period' => intval($this->params->get('cron.bot.activate')),
                'type' => 'light',
                'options' => [
                    'bot_id' => 'all',
                ],
            ],
            [
                'name' => 'zusam:clean:cache',
                'period' => intval($this->params->get('cron.clean.cache')),
                'type' => 'light',
                'options' => [
                    'max-cache-size' => 512,
                ],
            ],
            [
                'name' => 'zusam:clean:notifications',
                'period' => intval($this->params->get('cron.clean.notifications')),
                'type' => 'light',
            ],
            [
                'name' => 'zusam:clean:files',
                'period' => intval($this->params->get('cron.clean.files')),
                'type' => 'light',
            ],
            [
                'name' => 'zusam:clean:messages',
                'period' => intval($this->params->get('cron.clean.messages')),
                'type' => 'light',
            ],
            [
                'name' => 'zusam:clean:groups',
                'period' => intval($this->params->get('cron.clean.groups')),
                'type' => 'light',
            ],
        ];
    }

    protected function configure()
    {
        $this->setName('zusam:cron')
            ->setDescription('Launch recurrent tasks.')
            ->setHelp('This command launches recurrent tasks defined as symfony commands.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->input = $input;
        $this->output = $output;
        $this->runTask();

        return 0;
    }

    // This can be called in controllers to avoid relying on system cron
    // Inspired by wp-cron.php from wordpress
    public function runTask(): bool
    {
        // create context for logs
        $context = [];
        // get idle hours
        $idle_hours = [0, 24];
        if (null !== $this->params->get('idle_hours')) {
            $idle_hours = explode('-', $this->params->get('idle_hours'));
            $idle_hours[0] = intval($idle_hours[0]);
            $idle_hours[1] = intval($idle_hours[1]);
        }

        // don't run if on a POST or an upload files request.
        if (!empty($_POST) || !empty($_FILES)) {
            return false;
        }

        $lock = $this->lockFactory->createLock('run-task');
        if (!$lock->acquire()) {
            $this->logger->info('Task already running');
            return false;
        }
        try {
            foreach ($this->tasks as $task) {
                // If we are only doing "always" tasks, skip others
                if (
                    !isset($task['type'])
                    || 'always' !== $task['type']
                ) {
                    continue;
                }
                // if it's a heavy task and we're not in the idle hours, don't do it
                if (
                    'heavy' == $task['type']
                    && (
                        (new \DateTime())->format('H') < $idle_hours[0]
                        || (new \DateTime())->format('H') > $idle_hours[1]
                    )
                ) {
                    continue;
                }
                $lastExecution = $this->system->get($task['name']);
                if (empty($lastExecution) || $lastExecution < time() - $task['period']) {
                    $this->logger->notice('Running '.$task['name']);
                    $this->system->set('last_task_timestamp', time());
                    $this->system->set('last_task_name', $task['name']);
                    $this->system->set($task['name'], time());
                    $this->runCommand(
                        $task['name'],
                        $task['options'] ?? []
                    );
                }
            }
        } finally {
            $lock->release();
        }
        return true;
    }

    private function runCommand($id, $options = [])
    {
        try {
            $this->logger->info("Executing $id from Cron");
            $command = (new Application($this->kernel))->find($id);
            $returnCode = $command->run(new ArrayInput($options), $this->output ?? new NullOutput());
        } catch (\Exception $e) {
            $this->logger->error($id.' '.$e->getMessage());
        } finally {
            if (isset($returnCode) && 0 != $returnCode) {
                $this->logger->error("$id failed, return code: $returnCode");
            }
        }
    }
}
