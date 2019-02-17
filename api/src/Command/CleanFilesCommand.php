<?php

namespace App\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;

class CleanFilesCommand extends ContainerAwareCommand
{
    private $pdo;

    protected function configure()
    {
        $this->setName('zusam:clean-files')
            ->setDescription('Clean dangling files.')
            ->setHelp('This command cleans files not linked to any message or user.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $dsn = $this->getContainer()->getParameter("database_url");
        $this->pdo = new \PDO($dsn, null, null);
        $filesDir = realpath($this->getContainer()->getParameter("dir.files"));

        if (!$filesDir) {
            throw new \Exception("Target directory ($filesDir) could not be found !");
        }
        
        if (!is_writeable($filesDir)) {
            throw new \Exception("Target directory ($filesDir) is not writable !");
        }

        // First we get all files not linked to a user and/or a message
        $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id NOT IN (SELECT file_id FROM messages_files) AND id NOT IN (SELECT avatar_id FROM user WHERE avatar_id NOT NULL) AND id NOT IN (SELECT preview_id FROM link);");
        while($i = $c->fetch()) {
            $this->pdo->query("DELETE FROM file WHERE id = '" . $i["id"] . "';");
            if ($input->getOption("verbose")) {
                echo "unlink $filesDir/".$i["content_url"]."\n";
            }
            unlink($filesDir."/".$i["content_url"]);
        }

        // We need to get all files without an entry in the database
        foreach(scandir($filesDir) as $file) {
            if ($file == "." || $file == ".." || is_dir($file)) {
                continue;
            }
            $id = pathinfo($file, PATHINFO_FILENAME);
            $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id = '" . $id . "';")->fetch();
            // remove the file if not in the database or if the content_url doesn't match the filename
            if (empty($c) || $c["content_url"] != $file) {
                if ($input->getOption("verbose")) {
                    echo "unlink $filesDir/$file\n";
                }
                unlink($filesDir."/".$file);
            }
        }
    }
}
