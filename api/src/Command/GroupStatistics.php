<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class GroupStatistics extends Command
{
    private $pdo;
    private $logger;
    private $targetDir;

    public function __construct(
        string $dsn,
        string $targetDir,
        LoggerInterface $logger
    ) {
        parent::__construct();
        $this->pdo = new \PDO($dsn, null, null);
        $this->logger = $logger;

        @mkdir($targetDir, 0777, true);
        $this->targetDir = realpath($targetDir);

        if (!$this->targetDir) {
            throw new \Exception('Target directory ('.$targetDir.') could not be found !');
        }

        if (!is_writeable($this->targetDir)) {
            throw new \Exception('Target directory ('.$targetDir.') is not writable !');
        }
    }

    protected function configure()
    {
        $this->setName('zusam:statistics:groups')
       ->setDescription('Group statistics')
       ->setHelp('This command outputs statistics about groups.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());

        $c = $this->pdo->query('SELECT * FROM "group";');
        $groups = [];
        if ($c !== false) {
            while ($group = $c->fetch()) {

                $users = [];
                $messages = [];
                $messages_last_month = 0;

                $users_query = $this->pdo->query('SELECT * from users_groups ug WHERE ug.group_id = "'.$group['id'].'";');
                if ($users_query !== false) {
                    while ($u = $users_query->fetch()) {
                        $users[] = $u['user_id'];
                    }
                }

                $messages_query = $this->pdo->query('SELECT * from message m WHERE m.group_id = "'.$group['id'].'";');
                if ($messages_query !== false) {
                    while ($m = $messages_query->fetch()) {
                        $messages[] = $m['id'];
                        if ($m["created_at"] > time() - 60*60*24*30) {
                            $messages_last_month++;
                        }
                    }
                }

                $groups[] = [
                    $group['id'],
                    count($users),
                    count($messages),
                    date('Y-m-d H:i:s', $group['last_activity_date']),
                    $messages_last_month,
                ];
            }
        }
        uasort($groups, function ($a, $b) {
            return $a[1] < $b[1];
        });
        $table = new Table($output);
        $table
            ->setHeaders(['group id', 'users', 'messages', 'last activity', 'messages last month'])
            ->setRows($groups);
        $table->render();
        return 0;
    }
}
