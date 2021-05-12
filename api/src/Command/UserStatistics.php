<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class UserStatistics extends Command
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
        $this->setName('zusam:statistics:users')
       ->setDescription('Users statistics')
       ->setHelp('This command outputs statistics about users.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());

        $c = $this->pdo->query('SELECT * FROM "user";');
        $users = [];
        if ($c !== false) {
            while ($user = $c->fetch()) {

                $groups = [];
                $messages = [];
                $messages_last_month = 0;

                $groups_query = $this->pdo->query('SELECT * from users_groups ug WHERE ug.user_id = "'.$user['id'].'";');
                if ($groups_query !== false) {
                    while ($g = $groups_query->fetch()) {
                        $groups[] = $g['group_id'];
                    }
                }

                $messages_query = $this->pdo->query('SELECT * from message m WHERE m.author_id = "'.$user['id'].'";');
                if ($messages_query !== false) {
                    while ($m = $messages_query->fetch()) {
                        $messages[] = $m['id'];
                        if ($m["created_at"] > time() - 60*60*24*30) {
                            $messages_last_month++;
                        }
                    }
                }

                $users[] = [
                    $user['id'],
                    $messages_last_month,
                    count($messages),
                    count($groups),
                    date('Y-m-d H:i:s', $user['last_activity_date']),
                ];
            }
        }
        uasort($users, function ($a, $b) {
            return $a[4] < $b[4];
        });
        $table = new Table($output);
        $table
            ->setHeaders(['user id', 'messages last month', 'messages', 'groups', 'last activity'])
            ->setRows($users);
        $table->render();
        return 0;
    }
}
