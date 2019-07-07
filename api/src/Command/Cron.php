<?php

namespace App\Command;

use App\Service\System;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class Cron extends Command
{
    private $output;
    private $running;
    private $em;
    private $logger;
    private $tasks;
    private $params;
    private $system;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        ParameterBagInterface $params,
        System $system
    ) {
        parent::__construct();
        $this->em = $em;
        $this->logger = $logger;
        $this->running = false;
        $this->params = $params;
        $this->system = $system;
        $this->tasks = [
            [
                "name" => "zusam:convert-video",
                "period" => 15 * 60, // 15 minutes
                "options" => [],
            ],
            [
                "name" => "zusam:convert-images",
                "period" => 30 * 60, // 30 minutes
                "options" => [],
            ],
            [
                "name" => "zusam:notification-emails",
                "period" => 60 * 60, // 1 hour
                "options" => [],
            ],
            [
                "name" => "zusam:clean-old-cache",
                "period" => 1440 * 60, // 1 day
                "options" => [
                    "command" => "zusam:clean-old-cache",
                    "max-cache-size" => 512,
                ],
            ],
            [
                "name" => "zusam:clean-dangling-files",
                "period" => 1440 * 60, // 1 day
                "options" => [],
            ],
            [
                "name" => "zusam:clean-dangling-messages",
                "period" => 1440 * 7 * 60, // 7 days
                "options" => [],
            ],
            [
                "name" => "zusam:clean-old-logs",
                "period" => 1440 * 7 * 60, // 7 days
                "options" => [],
            ],
            [
                "name" => "zusam:clean-dangling-groups",
                "period" => 1440 * 30 * 60, // 30 days
                "options" => [],
            ],
        ];
    }

    protected function configure()
    {
        $this->setName('zusam:cron')
            ->setDescription('Launch recurrent tasks.')
            ->setHelp('This command launches recurrent tasks defined as symfony commands.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->output = $output;
        $this->runTask();
    }

    // This can be called in controllers to avoid relying on system cron
    // Heavily inspired by wp-cron.php from wordpress
    public function runTask(): bool
    {
        // create context for logs
        $context = [];

        ignore_user_abort(true);
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        }

        // don't run if on a POST or an upload files request. Don't run twice in the same process
        if (!empty($_POST) || !empty($_FILES) || defined('TASK_RUNNING') || $this->running) {
            $this->output->writeln(["<info>Task already running</info>"]);
            die();
        }

        define('TASK_RUNNING', true);
        $this->running = true;

        // check in database for the last running task
        $task_running = $this->system->get("task_running");
        $last_task_timestamp = $this->system->get("last_task_timestamp");
        $last_task_name = $this->system->get("last_task_name");

        // if a task is running and it's not older than 4h, do nothing
        if ($task_running && isset($last_task_timestamp) && $last_task_timestamp > time() - 60*60*4) {
            die();
        }

        // if a task is running but it's old, it's probably a lockup.
        // continue but log it
        if (isset($last_task_timestamp) && $last_task_timestamp < time() - 60*60*4) {
            $this->logger->notice("Old task lock detected");
        }

        foreach ($this->tasks as $task) {
            $lastLog = $this->em
                        ->createQuery("SELECT log FROM App\Entity\Log log WHERE log.message = '".$task["name"]."' ORDER BY log.createdAt DESC")
                        ->setMaxResults(1)->getOneOrNullResult();
            if (empty($lastLog) || $lastLog->getCreatedAt() < time() - $task["period"]) {
                $this->system->set("task_running", true);
                $this->system->set("last_task_timestamp", time());
                $this->system->set("last_task_name", $task["name"]);
                $this->runCommand($task["name"], $task["options"]);
                $this->system->set("task_running", false);
                return true;
            }
        }
        return false;
    }

    private function runCommand($id, $options = [])
    {
        $command = $this->getApplication()->find($id);
        try {
            $returnCode = $command->run(new ArrayInput($options), $this->output);
        } catch (\Exception $e) {
            $this->output->writeln(["<error>".$e->getMessage."</error>"]);
            $this->logger->error($id);
        }
        if ($returnCode != 0) {
            $this->output->writeln("<error>$id failed, return code: $returnCode</error>");
        }
    }
}
