<?php

namespace App\Command;

use App\Entity\File;
use App\Service\Image as ImageService;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CompressGifs extends Command
{
    private $pdo;
    private $imageService;
    private $targetDir;
    private $logger;

    public function __construct(
        string $dsn,
        string $targetDir,
        LoggerInterface $logger,
        ImageService $imageService
    ) {
        parent::__construct();
        $this->imageService = $imageService;
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
        $this->setName('zusam:compress:gifs')
             ->setDescription('Tries to compress gifs.')
             ->addOption('max-compressions', null, InputOption::VALUE_NONE, 'Maximum number of compressions to do.')
             ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list files that would be compressed.')
             ->addOption('target-size', null, InputOption::VALUE_NONE, 'Only list files that would be compressed.')
             ->setHelp('This command search for gif files and compresses them.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());
        $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id IN (SELECT file_id FROM messages_files) AND type = 'image/gif';");
        $i = 0;
        $targetsize = $input->getOption('target-size') ? intval($input->getOption('target-size')) : 480;
        while ($rawFile = $c->fetch()) {
            $framecount = $this->imageService->getGifFrameCount($this->targetDir.'/'.$rawFile['content_url']);
            $filesize = filesize($this->targetDir.'/'.$rawFile['content_url']);
            if (
                $filesize < $targetsize*$targetsize*310*$framecount/1024
                || $filesize < 1024 * 1024 * 2 // 2Mo
                || $framecount < 2
            ) {
                // static gif, highly compressed gif or tiny gif
                continue;
            }
            ++$i;
            $outputFile = $this->targetDir.'/'.$rawFile['id'];
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                $output->writeln($this->targetDir."/".$rawFile['content_url']);
            }
            if (!$input->getOption('only-list')) {
                $this->imageService->compressGif(
                    $this->targetDir.'/'.$rawFile['content_url'],
                    $outputFile.'.converted',
                    $targetsize,
                );
                rename($outputFile.'.converted', $outputFile.'.gif');
                $q = $this->pdo->prepare("UPDATE file SET content_url = '".$rawFile['id'].".gif', status = '".File::STATUS_READY."', type = 'image/gif' WHERE id = '".$rawFile['id']."';");
                $q->execute();
            }
            if (!empty($input->getOption('max-compressions')) && intval($input->getOption('max-compressions')) < $i) {
                return 0;
            }
        }
        return 0;
    }
}
