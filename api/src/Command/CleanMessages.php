<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CleanMessages extends Command
{
    private $pdo;
    private $logger;

    public function __construct(
        string $dsn,
        LoggerInterface $logger
    ) {
        parent::__construct();
        $this->pdo = new \PDO($dsn, null, null);
        $this->logger = $logger;
    }

    protected function configure()
    {
        $this->setName('zusam:clean:messages')
       ->setDescription('Clean dangling messages.')
       ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list messages that would be deleted.')
       ->setHelp('This command deletes messages not linked to any group.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->logger->info("zusam:clean-dangling-messages");
        $c = $this->pdo->query("SELECT m.id from `message` m LEFT JOIN `group` g ON g.id = m.group_id WHERE g.id IS NULL;");
        while($i = $c->fetch()) {
            if ($input->getOption("verbose") || $input->getOption("only-list")) {
                echo $i["id"]."\n";
            }
            if (!$input->getOption("only-list")) {
                $this->pdo->query("DELETE FROM `message` WHERE id = '" . $i["id"] . "';");
            }
        }
    }
}
