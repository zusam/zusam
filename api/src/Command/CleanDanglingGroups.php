<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CleanDanglingGroups extends Command
{
    private $pdo;

    public function __construct(string $dsn)
    {
        parent::__construct();
        $this->pdo = new \PDO($dsn, null, null);
    }

    protected function configure()
    {
        $this->setName('zusam:clean-dangling-groups')
       ->setDescription('Clean dangling groups.')
       ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list groups that would be deleted.')
       ->setHelp('This command deletes groups not linked to any user.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $c = $this->pdo->query("SELECT g.id from `group` g LEFT JOIN users_groups ug ON ug.group_id = g.id WHERE ug.group_id IS NULL;");
        while($i = $c->fetch()) {
            if ($input->getOption("verbose") || $input->getOption("only-list")) {
                echo $i["id"]."\n";
            }
            if (!$input->getOption("only-list")) {
                $this->pdo->query("DELETE FROM `group` WHERE id = '" . $i["id"] . "';");
            }
        }
    }
}
