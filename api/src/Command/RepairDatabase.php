<?php

namespace App\Command;

use App\Service\Uuid;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class RepairDatabase extends Command
{
    private $pdo;
    private $logger;

    public function __construct(
        string $dsn,
        LoggerInterface $logger
    ) {
        parent::__construct();
        $this->logger = $logger;
        $this->pdo = new \PDO($dsn, null, null);
    }

    protected function configure()
    {
        $this->setName('zusam:repair-database')
            ->setDescription('Repairs the database.')
            ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list rows that would be modified.')
            ->setHelp('Tries to "repair" the database by doing some housekeeping actions on it.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());

        if ($input->getOption('verbose')) {
            $output->writeln(['Cleaning users_groups relations']);
        }

        // Remove all users_groups relation with non existing users
        $c = $this->pdo->query('SELECT ug.user_id as id FROM users_groups ug LEFT JOIN user u ON ug.user_id = u.id WHERE u.id IS NULL;');
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                $output->writeln([$i['id']]);
            }
            if (!$input->getOption('only-list')) {
                $this->pdo->query("DELETE FROM users_groups WHERE user_id = '".$i['id']."';");
            }
        }

        if ($input->getOption('verbose')) {
            $output->writeln(['Nullifying false author_id properties in messages']);
        }

        // Remove all author_id referring to non existing users
        $c = $this->pdo->query('SELECT m.id as id FROM message m LEFT JOIN user u ON m.author_id = u.id WHERE u.id IS NULL AND m.author_id IS NOT NULL;');
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                $output->writeln([$i['id']]);
            }
            if (!$input->getOption('only-list')) {
                $this->pdo->query("UPDATE message SET author_id = NULL WHERE id = '".$i['id']."';");
            }
        }

        if ($input->getOption('verbose')) {
            $output->writeln(['Nullifying false group_id properties in messages']);
        }

        // Remove all group_id referring to non existing groups
        $c = $this->pdo->query('SELECT m.id as id FROM message m LEFT JOIN `group` g ON m.group_id = g.id WHERE g.id IS NULL AND m.group_id IS NOT NULL;');
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                $output->writeln([$i['id']]);
            }
            if (!$input->getOption('only-list')) {
                $this->pdo->query("UPDATE message SET group_id = NULL WHERE id = '".$i['id']."';");
            }
        }

        if ($input->getOption('verbose')) {
            $output->writeln(['Adding missing secret_key']);
        }
        return 0;
    }
}
