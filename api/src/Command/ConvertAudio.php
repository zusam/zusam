<?php

namespace App\Command;

use App\Entity\File;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class ConvertAudio extends Command
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
        $this->setName('zusam:convert:audio')
            ->setDescription('Converts a raw audio file.')
            ->addOption('threads', null, InputOption::VALUE_NONE, 'Number of threads to use for audio conversion')
            ->setHelp('This command search for a raw audio file in the database and converts it.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());
        if (!is_executable($this->binaryFfmpeg)) {
            $this->logger->error('ffmpeg located at '.$this->binaryFfmpeg.' is not executable.');
            return 0;
        }
        $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id IN (SELECT file_id FROM messages_files) AND status = '".File::STATUS_RAW."' AND type LIKE 'audio%' LIMIT 10;");
        $rows = $c->fetchAll();
        if (count($rows) < 1) {
            $this->logger->info("No audio to convert.");
            return 0;
        }
        $rawFile = $rows[0];
        $outputFile = $this->targetDir.'/'.$rawFile['id'];
        if (is_readable($this->targetDir.'/'.$rawFile['content_url'])) {
            $this->logger->notice('Converting '.$this->targetDir.'/'.$rawFile['content_url']);
        } else {
            $this->logger->error('Audio file '.$this->targetDir.'/'.$rawFile['content_url'].' is not readable.');
            return 0;
        }
        $threads = 1;
        if ($input->getOption('threads')) {
            $threads = max(0, intval($input->getOption('threads')));
        } else {
            $threads = max(0, intval($this->params->get('audio_conversion_threads')));
        }
        $command = $this->binaryFfmpeg
          .' -loglevel 0 -y -i '.$this->targetDir.'/'.$rawFile['content_url']
          .' -threads '.$threads.' -q:a 2 -y -f mp3 '
          .$outputFile.'.converted';
        $this->logger->info($command);
        exec($command);
        if (is_readable($outputFile.'.converted')) {
            rename($outputFile.'.converted', $outputFile.'.mp3');
            $q = $this->pdo->prepare("UPDATE file SET content_url = '".$rawFile['id'].".mp3', status = '".File::STATUS_READY."', type = 'audio/mp3' WHERE id = '".$rawFile['id']."';");
            $q->execute();
        } else {
            $this->logger->error('zusam:convert:audio '.$rawFile['id'].' failed.');
        }
        return 0;
    }
}
