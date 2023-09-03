<?php

namespace App\Command;

use App\Service\Bot as BotService;
use App\Service\System;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class Cron extends Command
{
    private $logger;
    private $input;
    private $output;
    private $running;
    private $system;
    private $tasks;
    private $kernel;
    private $params;

    public function __construct(
        LoggerInterface $logger,
        System $system,
        KernelInterface $kernel,
        ParameterBagInterface $params,
    ) {
        parent::__construct();
        $this->logger = $logger;
        $this->running = false;
        $this->system = $system;
        $this->kernel = $kernel;
        $this->params = $params;
        $this->tasks = [
            [
                'name' => 'zusam:convert:images',
                'period' => intval($this->params->get('cron.convert.images')),
                'type' => 'light',
            ],
            [
                'name' => 'zusam:convert:audio',
                'period' => intval($this->params->get('cron.convert.audio')),
                'type' => 'light',
            ],
            [
                'name' => 'zusam:convert:video',
                'period' => intval($this->params->get('cron.convert.video')),
                'type' => 'heavy',
            ],
            [
                'name' => 'zusam:notification:emails',
                'period' => intval($this->params->get('cron.notification.emails')),
                'type' => 'light',
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
                    'bot_id' => 'all'
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

        // don't run if on a POST or an upload files request. Don't run twice in the same process
        if (!empty($_POST) || !empty($_FILES) || defined('TASK_RUNNING') || $this->running) {
            $this->logger->info('Task already running');
            return false;
        }

        define('TASK_RUNNING', true);
        $this->running = true;

        // check in database for the last running task
        $task_running = $this->system->get('task_running');
        $last_task_timestamp = $this->system->get('last_task_timestamp');
        $last_task_name = $this->system->get('last_task_name');

        // if a task is running and it's not older than MAX_TASK_LOCK_DURATION, do nothing
        if ($task_running && isset($last_task_timestamp) && $last_task_timestamp > time() - intval($this->params->get('max_task_lock_duration'))) {
            $this->logger->notice($last_task_name.' is already running since '.(time() - $last_task_timestamp).'s');
            return false;
        }

        // if a task is running but it's old, it's probably a lockup.
        // continue but log it
        if (isset($last_task_timestamp) && $last_task_timestamp < time() - intval($this->params->get('max_task_lock_duration'))) {
            $this->logger->notice('Removing old task lock');
        }

        $this->system->set('task_running', true);

        // get idle hours
        if (null !== $this->params->get('idle_hours')) {
            $idle_hours = explode('-', $this->params->get('idle_hours'));
            $idle_hours[0] = intval($idle_hours[0]);
            $idle_hours[1] = intval($idle_hours[1]);
        } else {
            $idle_hours = [0, 24];
        }

        foreach ($this->tasks as $task) {
            // if it's a heavy task and we're not in the idle hours, don't do it
            if (
                isset($task['type'])
                && $task['type'] == 'heavy'
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

        $this->system->set('task_running', false);
        return true;
    }

    private function runCommand($id, $options = [])
    {
        try {
            $this->logger->info("Executing $id from Cron");
            $command = (new Application($this->kernel))->find($id);
            $returnCode = $command->run(new ArrayInput($options), $this->output ?? new NullOutput());
        } catch (\Exception $e) {
            $this->logger->error($id . ' ' . $e->getMessage());
        } finally {
            if (isset($returnCode) && 0 != $returnCode) {
                $this->logger->error("$id failed, return code: $returnCode");
            }
        }
    }
}
