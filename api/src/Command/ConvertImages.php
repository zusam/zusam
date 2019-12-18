<?php

namespace App\Command;

use App\Entity\File;
use App\Service\Image as ImageService;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ConvertImages extends Command
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

        $this->targetDir = realpath($targetDir);

        if (!$this->targetDir) {
            throw new \Exception('Target directory ('.$this->targetDir.') could not be found !');
        }

        if (!is_writeable($this->targetDir)) {
            throw new \Exception('Target directory ('.$this->targetDir.') is not writable !');
        }
    }

    protected function configure()
    {
        $this->setName('zusam:convert:images')
            ->setDescription('Converts raw image files.')
            ->addOption('--max-convert', null, InputOption::VALUE_NONE, 'Maximum conversions to perform.')
            ->setHelp('This command search for raw image files in the database and converts them.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());
        $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id IN (SELECT file_id FROM messages_files) AND status = '".File::STATUS_RAW."' AND type LIKE 'image%';");
        $i = 0;
        while ($rawFile = $c->fetch()) {
            ++$i;
            $outputFile = $this->targetDir.'/'.$rawFile['id'];
            $output->writeln(['Converting '.$rawFile['content_url']]);
            $this->imageService->createThumbnail(
                $this->targetDir.'/'.$rawFile['content_url'],
                $outputFile.'.converted',
                2048,
                2048
            );
            rename($outputFile.'.converted', $outputFile.'.jpg');
            $q = $this->pdo->prepare("UPDATE file SET content_url = '".$rawFile['id'].".jpg', status = '".File::STATUS_READY."', type = 'image/jpeg' WHERE id = '".$rawFile['id']."';");
            $q->execute();
            if (!empty($input->getOption('max-convert')) && intval($input->getOption('max-convert')) < $i) {
                return 0;
            }
        }
        return 0;
    }
}
