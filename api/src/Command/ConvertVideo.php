<?php

namespace App\Command;

use App\Entity\File;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ConvertVideo extends Command
{
    private $pdo;
    private $targetDir;
    private $binaryFfmpeg;
    private $logger;

    public function __construct(
        string $dsn,
        string $targetDir,
        string $binaryFfmpeg,
        LoggerInterface $logger
    ) {
        parent::__construct();
        $this->binaryFfmpeg = $binaryFfmpeg;
        $this->logger = $logger;
        $this->pdo = new \PDO($dsn, null, null);

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
        $this->setName('zusam:convert:video')
            ->setDescription('Converts a raw video file.')
            ->addOption('all-cores', null, InputOption::VALUE_NONE, 'Use all available cores instead of just one.')
            ->setHelp('This command search for a raw video file in the database and converts it.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());
        if (!is_executable($this->binaryFfmpeg)) {
            $error = 'ffmpeg located at '.$this->binaryFfmpeg.' is not executable.';
            $this->logger->error($error);
            $output->writeln(['<error>'.$error.'</error>']);
            return 0;
        }
        $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id IN (SELECT file_id FROM messages_files) AND status = '".File::STATUS_RAW."' AND type LIKE 'video%' LIMIT 10;");
        $rows = $c->fetchAll();
        if (count($rows) < 1) {
            $output->writeln(['<info>No video to convert.</info>']);
            return 0;
        }
        $rawFile = $rows[0];
        $outputFile = $this->targetDir.'/'.$rawFile['id'];
        if (is_readable($this->targetDir.'/'.$rawFile['content_url'])) {
            $output->writeln(['<info>Converting '.$this->targetDir.'/'.$rawFile['content_url'].'</info>']);
        } else {
            $error = 'Video file '.$this->targetDir.'/'.$rawFile['content_url'].' is not readable.';
            $this->logger->error($error);
            $output->writeln(['<error>'.$error.'</error>']);
            return 0;
        }
        $threads = '';
        if (!$input->getOption('all-cores')) {
            $threads = '-threads 1 ';
        }
        $commandOutput = [];
        exec(
            $this->binaryFfmpeg
            .' -loglevel 0 -y -i '.$this->targetDir.'/'.$rawFile['content_url']
            .' -c:v libx264 -filter:v scale=-2:720 -crf 22 '.$threads.'-preset slower -c:a aac -vbr 3 -y -f mp4 '
            .$outputFile.'.converted',
            $commandOutput
        );
        if (is_readable($outputFile.'.converted')) {
            rename($outputFile.'.converted', $outputFile.'.mp4');
            $q = $this->pdo->prepare("UPDATE file SET content_url = '".$rawFile['id'].".mp4', status = '".File::STATUS_READY."', type = 'video/mp4' WHERE id = '".$rawFile['id']."';");
            $q->execute();
        } else {
            $error = 'zusam:convert:video '.$rawFile['id'].' failed.';
            $this->logger->error($error);
            $output->writeln(['<error>'.$error.'</error>']);
        }
        return 0;
    }
}
