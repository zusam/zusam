<?php

namespace App\Command;

use App\Entity\File;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class ConvertVideo extends Command
{
    private $pdo;
    private $targetDir;
    private $binaryFfmpeg;
    private $logger;
    private $params;

    public function __construct(
        string $dsn,
        string $targetDir,
        string $binaryFfmpeg,
        LoggerInterface $logger,
        ParameterBagInterface $params,
    ) {
        parent::__construct();
        $this->binaryFfmpeg = $binaryFfmpeg;
        $this->logger = $logger;
        $this->pdo = new \PDO($dsn, null, null);
        $this->params = $params;

        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0o777, true);
        }
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
            ->addOption('threads', null, InputOption::VALUE_NONE, 'Number of threads to use for video conversion')
            ->setHelp('This command search for a raw video file in the database and converts it.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());
        if (!is_executable($this->binaryFfmpeg)) {
            $this->logger->error('ffmpeg located at '.$this->binaryFfmpeg.' is not executable.');

            return 0;
        }
        $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id IN (SELECT file_id FROM messages_files) AND status = '".File::STATUS_RAW."' AND type LIKE 'video%' LIMIT 10;");
        $rows = $c->fetchAll();
        if (count($rows) < 1) {
            $this->logger->info('No video to convert.');

            return 0;
        }
        $rawFile = $rows[0];
        $outputFile = $this->targetDir.'/'.$rawFile['id'];
        if (is_readable($this->targetDir.'/'.$rawFile['content_url'])) {
            $this->logger->notice('Converting '.$this->targetDir.'/'.$rawFile['content_url']);
        } else {
            $this->logger->error('Video file '.$this->targetDir.'/'.$rawFile['content_url'].' is not readable.');

            return 0;
        }
        $threads = 1;
        if ($input->getOption('threads')) {
            $threads = max(0, intval($input->getOption('threads')));
        } else {
            $threads = max(0, intval($this->params->get('video_conversion_threads')));
        }
        $command = $this->binaryFfmpeg
          .' -loglevel 0 -y -i '.$this->targetDir.'/'.$rawFile['content_url']
          .' -c:v libx264 -filter:v scale=-2:720 -crf 22 -threads '.$threads.' -preset slower -c:a aac -vbr 3 -y -f mp4 '
          .$outputFile.'.converted';
        $this->logger->info($command);
        exec($command);
        if (is_readable($outputFile.'.converted')) {
            rename($outputFile.'.converted', $outputFile.'.mp4');
            $q = $this->pdo->prepare("UPDATE file SET content_url = '".$rawFile['id'].".mp4', status = '".File::STATUS_READY."', type = 'video/mp4' WHERE id = '".$rawFile['id']."';");
            $q->execute();
        } else {
            $this->logger->error('zusam:convert:video '.$rawFile['id'].' failed.');
        }

        return 0;
    }
}
