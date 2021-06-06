<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class StorageStatistics extends Command
{
    private $pdo;
    private $logger;
    private $targetDir;

    public function __construct(
        string $dsn,
        LoggerInterface $logger,
        string $targetDir
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
        $this->setName('zusam:statistics:storage')
       ->setDescription('Storage statistics')
       ->setHelp('This command outputs statistics about files stored.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());

        $c = $this->pdo->query('SELECT * FROM "group";');
        $groups = [];
        if ($c !== false) {
            while ($group = $c->fetch()) {
                $messages_query = $this->pdo->query('SELECT * from message m WHERE m.group_id = "'.$group['id'].'";');
                $messages = [];
                $nb_files = 0;
                $nb_videos = 0;
                $nb_images = 0;
                $nb_pdfs = 0;
                $real_total_size = 0;
                $videos_size = 0;
                $images_size = 0;
                $pdfs_size = 0;
                if ($messages_query !== false) {
                    while ($m = $messages_query->fetch()) {
                        $messagesfiles_query = $this->pdo->query('SELECT * from messages_files mf WHERE mf.message_id = "'.$m['id'].'";');
                        $files = [];
                        if ($messagesfiles_query !== false) {
                            while ($mf = $messagesfiles_query->fetch()) {
                                $nb_files++;
                                $file_query = $this->pdo->query('SELECT * from file f WHERE f.id = "'.$mf['file_id'].'";');
                                if ($file_query !== false && $file = $file_query->fetch()) {
                                    $path = $this->targetDir.'/'.$file['content_url'];
                                    $real_total_size += filesize($path);
                                    if (preg_match('/video/', $file['type'])) {
                                        $nb_videos++;
                                        $videos_size += filesize($path);
                                    }
                                    if (preg_match('/image/', $file['type'])) {
                                        $nb_images++;
                                        $images_size += filesize($path);
                                    }
                                    if (preg_match('/pdf/', $file['type'])) {
                                        $nb_pdfs++;
                                        $pdfs_size += filesize($path);
                                    }
                                }
                            }
                        }
                        $messages[] = $m['id'];
                    }
                }
                $groups[] = [
                    $group['id'],
                    $nb_files,
                    floor($real_total_size/(1024*1024)),
                    $nb_videos,
                    floor($videos_size/(1024*1024)),
                    $nb_images,
                    floor($images_size/(1024*1024)),
                    $nb_pdfs,
                    floor($pdfs_size/(1024*1024)),
                ];
            }
        }
        uasort($groups, function ($a, $b) {
            return $a[1] < $b[1];
        });
        $table = new Table($output);
        $table
            ->setHeaders(['group id', 'files', 'Total size', 'videos', 'videos size', 'images', 'images size', 'pdfs', 'pdfs size'])
            ->setRows($groups);
        $table->render();
        return 0;
    }
}
