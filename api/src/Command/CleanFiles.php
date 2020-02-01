<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CleanFiles extends Command
{
    private $pdo;
    private $targetDir;
    private $logger;

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
        $this->setName('zusam:clean:files')
       ->setDescription('Clean dangling files.')
       ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list files that would be deleted.')
       ->setHelp('This command deletes files not linked to any message or user.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());

        // First we remove all files not linked to a user and/or a message
        $c = $this->pdo->query('SELECT f.id, f.content_url FROM file f WHERE NOT EXISTS (SELECT * FROM messages_files mf WHERE mf.file_id = f.id) AND NOT EXISTS (SELECT * FROM user u WHERE u.avatar_id = f.id) AND NOT EXISTS (SELECT * FROM link l WHERE l.preview_id = f.id);');
        if ($c !== false) {
            while ($i = $c->fetch()) {
                if ($input->getOption('verbose') || $input->getOption('only-list')) {
                    echo $this->targetDir.'/'.$i['content_url']."\n";
                }
                if (!$input->getOption('only-list')) {
                    $this->pdo->query("DELETE FROM messages_files WHERE file_id = '".$i['id']."';");
                    $this->pdo->query("DELETE FROM file WHERE id = '".$i['id']."';");
                    unlink($this->targetDir.'/'.$i['content_url']);
                }
            }
        }

        // We need to get all files without an entry in the database
        // Also remove files with 0 filesize
        foreach (scandir($this->targetDir) as $file) {
            if ('.' == $file || '..' == $file || is_dir($file)) {
                continue;
            }

            if (filesize($this->targetDir.'/'.$file) === 0) {
                if ($input->getOption('verbose') || $input->getOption('only-list')) {
                    echo $this->targetDir."/$file\n";
                }
                if (!$input->getOption('only-list')) {
                    unlink($this->targetDir.'/'.$file);
                }
                continue;
            }

            $id = pathinfo($file, PATHINFO_FILENAME);
            $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id = '".$id."';")->fetch();
            // remove the file if not in the database or if the content_url doesn't match the filename
            if (empty($c) || $c['content_url'] != $file) {
                if ($input->getOption('verbose') || $input->getOption('only-list')) {
                    echo $this->targetDir."/$file\n";
                }
                if (!$input->getOption('only-list')) {
                    unlink($this->targetDir.'/'.$file);
                }
            }
        }

        // Remove all file rows whithout any corresponding file on disk
        $c = $this->pdo->query('SELECT f.id, f.content_url FROM file f;');
        if ($c !== false) {
            while ($i = $c->fetch()) {
                if (!file_exists($this->targetDir.'/'.$i['content_url'])) {
                    if ($input->getOption('verbose') || $input->getOption('only-list')) {
                        echo $this->targetDir.'/'.$i['content_url']."\n";
                    }
                    if (!$input->getOption('only-list')) {
                        $this->pdo->query("DELETE FROM messages_files WHERE file_id = '".$i['id']."';");
                        $this->pdo->query("DELETE FROM file WHERE id = '".$i['id']."';");
                    }
                }
            }
        }
        return 0;
    }
}
