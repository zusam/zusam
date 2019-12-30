<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CleanLogs extends Command
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
        $this->setName('zusam:clean:logs')
       ->setDescription('Clean old logs.')
       ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list logs that would be deleted.')
       ->setHelp('This command deletes all logs except for the most 10000 recents.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());
        $c = $this->pdo->query('SELECT id FROM log WHERE created_at < (SELECT MIN(created_at) FROM (SELECT created_at FROM log ORDER BY created_at DESC LIMIT 10000));');
        if ($c === false) {
            return 0;
        }
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                echo $i['id']."\n";
            }
            if (!$input->getOption('only-list')) {
                $this->pdo->query("DELETE FROM `log` WHERE id = '".$i['id']."';");
            }
        }
        return 0;
    }
}
