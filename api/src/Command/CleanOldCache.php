<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CleanOldCache extends Command
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
        $this->targetDir = realpath($targetDir);

        if (!$this->targetDir) {
            throw new \Exception("Target directory (".$this->targetDir.") could not be found !");
        }

        if (!is_writeable($this->targetDir)) {
            throw new \Exception("Target directory (".$this->targetDir.") is not writable !");
        }
    }

    protected function configure()
    {
        $this->setName('zusam:clean-old-cache')
            ->setDescription('Clean old cache files')
            ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list files that would be deleted.')
            ->setHelp('This command removes cache files older than one month.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->logger->info("zusam:clean-old-cache");
        foreach(scandir($this->targetDir."/images/") as $file) {
            if (
                $file != "." && $file != ".." &&
                filemtime($this->targetDir."/images/".$file) < time() - 60*60*24*30
            ) {
                if ($input->getOption("verbose") || $input->getOption("only-list")) {
                    echo $this->targetDir."/$file\n";
                }
                if (!$input->getOption("only-list")) {
                    unlink($this->targetDir."/images/".$file);
                }
            }
        }
    }
}
