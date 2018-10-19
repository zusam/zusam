<?php

namespace App\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Doctrine\ORM\EntityManagerInterface;

class CleanFilesCommand extends ContainerAwareCommand
{
    private $em;
    private $pdo;
    private $output;
    private $input;

    public function __construct(EntityManagerInterface $em)
    {
        parent::__construct();
        $this->em = $em;
    }

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
        $this->output = $output;
        $this->input = $input;


        // First we get all files not linked to a user and/or a message
        $c = $this->pdo->query("SELECT id FROM file WHERE id NOT IN (SELECT file_id FROM messages_files) AND id NOT IN (SELECT avatar_id FROM user);");
        while($i = $c->fetch()) {
            $this->pdo->query("DELETE FROM file WHERE id = '" . $i["id"] . "';");
        }

        // We need to get all files without an entry in the database
        $filesDir = realpath($this->getContainer()->getParameter("dir.files"));
        if (!is_writeable($filesDir)) {
            throw new \Exception("Target directory ($filesDir) is not writable !");
        }
        foreach(scandir($filesDir) as $file) {
            if ($file == "." || $file == ".." || is_dir($file)) {
                continue;
            }
            $id = pathinfo($file, PATHINFO_FILENAME);
            $c = $this->pdo->query("SELECT id FROM file WHERE id = '" . $id . "';")->fetch();
            if (empty($c)) {
                unlink($filesDir."/".$file);
            }
        }
    }
}
