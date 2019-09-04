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

    protected function execute(InputInterface $input, OutputInterface $output)
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

        // Add a secret_key to all files, links and messages missing it
        // TODO: Remove this for the v1.0 (This is here for those coming from the 0.2)
        $c = $this->pdo->query("SELECT id FROM file WHERE secret_key = '' OR secret_key IS NULL;");
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                $output->writeln([$i['id']]);
            }
            if (!$input->getOption('only-list')) {
                $this->pdo->query("UPDATE file SET secret_key = '".Uuid::uuidv4()."' WHERE id = '".$i['id']."';");
            }
        }
        $c = $this->pdo->query("SELECT id FROM message WHERE secret_key = '' OR secret_key IS NULL;");
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                $output->writeln([$i['id']]);
            }
            if (!$input->getOption('only-list')) {
                $this->pdo->query("UPDATE message SET secret_key = '".Uuid::uuidv4()."' WHERE id = '".$i['id']."';");
            }
        }
        $c = $this->pdo->query("SELECT id FROM link WHERE secret_key = '' OR secret_key IS NULL;");
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                $output->writeln([$i['id']]);
            }
            if (!$input->getOption('only-list')) {
                $this->pdo->query("UPDATE link SET secret_key = '".Uuid::uuidv4()."' WHERE id = '".$i['id']."';");
            }
        }
    }
}
