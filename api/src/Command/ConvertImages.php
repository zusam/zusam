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
        $this->setName('zusam:convert:images')
            ->setDescription('Converts raw image files.')
            ->addOption('--max-convert', null, InputOption::VALUE_NONE, 'Maximum conversions to perform.')
            ->setHelp('This command search for raw image files in the database and converts them.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());
        $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id IN (SELECT file_id FROM messages_files) AND status = '".File::STATUS_RAW."' AND type LIKE 'image%';");
        $rows = $c->fetchAll();
        $i = 0;
        foreach ($rows as $rawFile) {
            ++$i;
            $inputFile = $this->targetDir.'/'.$rawFile['content_url'];
            $outputFile = $this->targetDir.'/'.$rawFile['id'];

            if (is_readable($inputFile)) {
                $this->logger->notice('Converting '.$inputFile);
            } else {
                $this->logger->error('Image file '.$inputFile.' is not readable.');

                return 0;
            }

            [$width, $height] = getimagesize($inputFile);
            // This is a special check for long format images that should not be limited in height
            // example: https://imgs.xkcd.com/comics/earth_temperature_timeline.png
            if (0 != $width && $height / $width > 10) {
                $this->imageService->createThumbnail(
                    $inputFile,
                    $outputFile.'.converted',
                    2048,
                    999999
                );
            } else {
                if ($width > 2048 || $height > 2048 || empty($rawFile['type']) || 'image/jpeg' !== $rawFile['type']) {
                    $this->imageService->createThumbnail(
                        $inputFile,
                        $outputFile.'.converted',
                        2048,
                        2048
                    );
                }
            }

            if (is_writable($outputFile.'.converted')) {
                rename($outputFile.'.converted', $outputFile.'.jpg');
                $q = $this->pdo->prepare("UPDATE file SET content_url = '".$rawFile['id'].".jpg', status = '".File::STATUS_READY."', type = 'image/jpeg' WHERE id = '".$rawFile['id']."';");
                $q->execute();
                if (!empty($input->getOption('max-convert')) && intval($input->getOption('max-convert')) < $i) {
                    return 0;
                }
            } else {
                $this->logger->error('zusam:convert:images '.$rawFile['id'].' failed.');
            }
        }

        return 0;
    }
}
