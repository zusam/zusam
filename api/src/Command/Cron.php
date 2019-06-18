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
            "zusam:convert-video" => 15 * 60, // 15 minutes
            "zusam:convert-images" => 30 * 60, // 30 minutes
            "zusam:notification-emails" => 60 * 60, // 1 hour
            "zusam:clean-old-cache" => 1440 * 60, // 1 day
            "zusam:clean-dangling-files" => 1440 * 60, // 1 day
            "zusam:clean-dangling-messages" => 1440 * 7 * 60, // 7 days
            "zusam:clean-old-logs" => 1440 * 7 * 60, // 7 days
            "zusam:clean-dangling-groups" => 1440 * 30 * 60, // 30 days
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

        foreach ($this->tasks as $task => $period) {
            $lastLog = $this->em
                        ->createQuery("SELECT log FROM App\Entity\Log log WHERE log.message = '$task' ORDER BY log.createdAt DESC")
                        ->setMaxResults(1)->getOneOrNullResult();
            if (empty($lastLog) || $lastLog->getCreatedAt() < time() - $period) {
                $this->system->set("task_running", true);
                $this->system->set("last_task_timestamp", time());
                $this->system->set("last_task_name", $task);
                $this->runCommand($task);
                $this->system->set("task_running", false);
                return true;
            }
        }
        return false;
    }

    private function runCommand($id)
    {
        $command = $this->getApplication()->find($id);
        try {
            $returnCode = $command->run(new ArrayInput([]), $this->output);
        } catch (\Exception $e) {
            $this->output->writeln(["<error>".$e->getMessage."</error>"]);
            $this->logger->error($id);
        }
        if ($returnCode != 0) {
            $this->output->writeln("<error>$id failed, return code: $returnCode</error>");
        }
    }
}
