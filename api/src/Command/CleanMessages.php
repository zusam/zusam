<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
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

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());


        // remove messages without parent and not in front (hidden messages)
        $c = $this->pdo->query('SELECT m.id from message m LEFT JOIN message p ON p.id = m.parent_id WHERE p.id IS NULL AND (m.is_in_front != 1 OR m.is_in_front IS NULL);');
        if ($c !== false) {
            while ($i = $c->fetch()) {
                if ($input->getOption('verbose') || $input->getOption('only-list')) {
                    echo $i['id']."\n";
                }
                if (!$input->getOption('only-list')) {
                    $this->pdo->query("DELETE FROM `message` WHERE id = '".$i['id']."';");
                }
            }
        }

        // remove messages without groups
        $c = $this->pdo->query('SELECT m.id from `message` m LEFT JOIN `group` g ON g.id = m.group_id WHERE g.id IS NULL;');
        if ($c !== false) {
            while ($i = $c->fetch()) {
                if ($input->getOption('verbose') || $input->getOption('only-list')) {
                    echo $i['id']."\n";
                }
                if (!$input->getOption('only-list')) {
                    $this->pdo->query("DELETE FROM `message` WHERE id = '".$i['id']."';");
                }
            }
        }

        // remove messages without text nor files nor children
        $c = $this->pdo->query("
            SELECT m.id from `message` m
            LEFT JOIN `messages_files` mf ON m.id = mf.message_id
            LEFT JOIN `message` c ON m.id = c.parent_id
            WHERE mf.message_id IS NULL
            AND c.parent_id IS NULL
            AND m.data LIKE '%\"text\":\"\"%';
        ");
        if ($c !== false) {
            while ($i = $c->fetch()) {
                if ($input->getOption('verbose') || $input->getOption('only-list')) {
                    echo $i['id']."\n";
                }
                if (!$input->getOption('only-list')) {
                    $this->pdo->query("DELETE FROM `message` WHERE id = '".$i['id']."';");
                }
            }
        }
        return 0;
    }
}
