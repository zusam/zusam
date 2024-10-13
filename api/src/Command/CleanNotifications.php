<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CleanNotifications extends Command
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
        $this->setName('zusam:clean:notifications')
       ->setDescription('Clean dangling notifications.')
       ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list notifications that would be deleted.')
       ->setHelp('This command deletes notifications from removed users/groups and related to groups in which the user is not anymore.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());

        // remove notifications without owner
        $c = $this->pdo->query('SELECT n.id from `notification` n LEFT JOIN `user` u ON u.id = n.owner_id WHERE u.id IS NULL;');
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                echo $i['id']."\n";
            }
            if (!$input->getOption('only-list')) {
                $this->pdo->query("DELETE FROM `notification` WHERE id = '".$i['id']."';");
            }
        }

        // remove notifications without groups
        $c = $this->pdo->query('SELECT n.id from `notification` n LEFT JOIN `group` g ON g.id = n.from_group_id WHERE g.id IS NULL;');
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                echo $i['id']."\n";
            }
            if (!$input->getOption('only-list')) {
                $this->pdo->query("DELETE FROM `notification` WHERE id = '".$i['id']."';");
            }
        }

        // remove notifications related to groups where their owner is not
        $c = $this->pdo->query('
            SELECT n.id FROM notification as n WHERE NOT EXISTS (
                SELECT * FROM users_groups as ug WHERE ug.user_id = n.owner_id AND ug.group_id = n.from_group_id
            );
        ');
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                echo $i['id']."\n";
            }
            if (!$input->getOption('only-list')) {
                $this->pdo->query("DELETE FROM `notification` WHERE id = '".$i['id']."';");
            }
        }

        return 0;
    }
}
