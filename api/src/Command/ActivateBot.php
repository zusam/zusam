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
    private $em;
    private $logger;
    private $input;
    private $output;
    private $system;
    private $kernel;
    private $botDir;
    private $allow_bots;
    private $botService;
    private $params;

    public function __construct(
        $botDir,
        LoggerInterface $logger,
        $allow_bots,
        EntityManagerInterface $em,
        SystemService $systemService,
        KernelInterface $kernel,
        BotService $botService,
        ParameterBagInterface $params
    ) {
        parent::__construct();
        $this->em = $em;
        $this->logger = $logger;
        $this->botDir = $botDir;
        $this->system = $systemService;
        $this->kernel = $kernel;
        $this->allow_bots = $allow_bots;
        $this->botService = $botService;
        $this->params = $params;
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
        $this->input = $input;
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
            include($action_file);
        } else {
            $this->output->writeln([
                $action_file,
                '<error>This bot does not have an action.php</error>',
            ]);
        }
    }
}
