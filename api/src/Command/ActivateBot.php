<?php

namespace App\Command;

use App\Service\System as SystemService;
use App\Service\Bot as BotService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class ActivateBot extends Command
{
    private $output;
    private $system;
    private $botDir;
    private $allow_bots;
    private $params;
    private $botService;
    private $logger;

    public function __construct(
        $botDir,
        $allow_bots,
        SystemService $systemService,
        ParameterBagInterface $params,
        BotService $botService,
        LoggerInterface $logger,
    ) {
        parent::__construct();
        $this->logger = $logger;
        $this->botDir = $botDir;
        $this->system = $systemService;
        $this->allow_bots = $allow_bots;
        $this->params = $params;
        $this->botService = $botService;
    }

    protected function configure()
    {
        $this->setName('zusam:bot:activate')
            ->setDescription('Activate a bot.')
            ->addArgument('bot_id', InputArgument::REQUIRED, "What's the id of the bot to activate ?")
            ->setHelp("This command activates a bot so that it can do it's action.");
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->output = $output;

        if ($this->allow_bots != "true") {
            $this->output->writeln([
                '<comment>Bots are not allowed to run.</comment>',
            ]);
            return 0;
        }
        if ($input->getArgument('bot_id') != "all") {
            $this->runBot($input->getArgument('bot_id'));
        } else {
            // activate all bots
            foreach (scandir($this->params->get('dir.bots')) as $file) {
                if ($file != "." && $file != ".." && is_dir($this->params->get('dir.bots')."/$file")) {
                    $this->runBot($file);
                }
            }
        }
        return 0;
    }

    private function runBot($bot_id, $options = [])
    {
        $this->system->set('last_bot_timestamp', time());
        $this->system->set('last_bot_id', $bot_id);
        $this->system->set("bot::" . $bot_id, time());
        $action_file = $this->botDir . "/" . $bot_id . "/action.php";
        if (file_exists($action_file) && is_readable($action_file)) {
            try {
                set_error_handler(function ($errno, $errstr, $errfile, $errline) {
                    throw new \ErrorException($errstr, $errno, 0, $errfile, $errline);
                });
                include($action_file);
            } catch (\Exception $e) {
                $this->logger->error($bot_id.": ".$e->getMessage());
            }
        } else {
            $this->output->writeln([
                $action_file,
                '<error>This bot does not have an action.php</error>',
            ]);
        }
    }
}
