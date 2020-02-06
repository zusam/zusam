<?php

namespace App\Command;

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
    private $em;
    private $logger;
    private $input;
    private $output;
    private $running;
    private $system;
    private $tasks;
    private $kernel;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        System $system,
        KernelInterface $kernel
    ) {
        parent::__construct();
        $this->em = $em;
        $this->logger = $logger;
        $this->running = false;
        $this->system = $system;
        $this->kernel = $kernel;
        $this->tasks = [
            [
                'name' => 'zusam:convert:video',
                'period' => 60 * 60, // 1 hour
                'type' => 'heavy',
            ],
            [
                'name' => 'zusam:convert:images',
                'period' => 60 * 60, // 1 hour
                'type' => 'light',
            ],
            [
                'name' => 'zusam:notification:emails',
                'period' => 60 * 60, // 1 hour
                'type' => 'light',
                'options' => [
                    '--log-send' => true,
                ],
            ],
            [
                'name' => 'zusam:compress:gifs',
                'period' => 60 * 60, // 1 hour
                'type' => 'heavy',
                'options' => [
                    '--max-compressions' => 5,
                ],
            ],
            [
                'name' => 'zusam:clean:cache',
                'period' => 1440 * 60, // 1 day
                'type' => 'light',
                'options' => [
                    'max-cache-size' => 512,
                ],
            ],
            [
                'name' => 'zusam:clean:notifications',
                'period' => 1440 * 7 * 60, // 7 days
                'type' => 'light',
            ],
            [
                'name' => 'zusam:clean:files',
                'period' => 1440 * 7 * 60, // 7 days
                'type' => 'light',
            ],
            [
                'name' => 'zusam:clean:messages',
                'period' => 1440 * 7 * 60, // 7 days
                'type' => 'light',
            ],
            [
                'name' => 'zusam:clean:groups',
                'period' => 1440 * 30 * 60, // 30 days
                'type' => 'light',
            ],
            [
                'name' => 'zusam:repair-database',
                'period' => 1440 * 60 * 60, // 60 days
                'type' => 'heavy',
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
            if ($this->output) {
                $this->output->writeln(['<info>Task already running</info>']);
            }
            return false;
        }

        define('TASK_RUNNING', true);
        $this->running = true;

        // check in database for the last running task
        $task_running = $this->system->get('task_running');
        $last_task_timestamp = $this->system->get('last_task_timestamp');
        $last_task_name = $this->system->get('last_task_name');

        // if a task is running and it's not older than 4h, do nothing
        if ($task_running && isset($last_task_timestamp) && $last_task_timestamp > time() - 60 * 60 * 4) {
            if (isset($this->input) && $this->input->getOption('verbose')) {
                $this->output->writeln([
                    '<info>'.$last_task_name.' is already running since '.(time() - $last_task_timestamp).'s</info>',
                ]);
            }
            return false;
        }

        // if a task is running but it's old, it's probably a lockup.
        // continue but log it
        if (isset($last_task_timestamp) && $last_task_timestamp < time() - 60 * 60 * 4) {
            if (isset($this->input) && $this->input->getOption('verbose')) {
                $this->output->writeln([
                    '<info>Ignoring the lock</info>',
                ]);
            }
            $this->logger->notice('Old task lock detected');
        }

        $this->system->set('task_running', true);

        // get idle hours
        if (isset($_SERVER['IDLE_HOURS'])) {
            $idle_hours = explode('-', $_SERVER['IDLE_HOURS']);
        } else {
            $idle_hours = [INF, -INF];
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
                if (isset($this->input) && $this->input->getOption('verbose')) {
                    $this->output->writeln([
                        '<info>Running '.$task['name'].'</info>',
                    ]);
                }
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
            if (null != $this->output) {
                $this->output->writeln(['<error>'.$e->getMessage().'</error>']);
            }
            $this->logger->error($id . ' ' . $e->getMessage());
        }
        if (isset($returnCode) && 0 != $returnCode) {
            if (null != $this->output) {
                $this->output->writeln("<error>$id failed, return code: $returnCode</error>");
            }
            $this->logger->error("$id failed, return code: $returnCode");
        }
    }
}
