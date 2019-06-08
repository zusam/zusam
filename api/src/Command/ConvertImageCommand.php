<?php

namespace App\Command;

use App\Entity\File;
use App\Service\Image as ImageService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ConvertImageCommand extends Command
{
    private $pdo;
    private $imageService;

    public function __construct(ImageService $imageService)
    {
        parent::__construct();
        $this->imageService = $imageService;
    }

    protected function configure()
    {
        $this->setName('zusam:convert-image')
            ->setDescription('Converts a raw image file.')
            ->setHelp('This command search for a raw image file in the database and converts it.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (file_exists("/tmp/zusam_image_convert.lock")) {
            return;
        }
        file_put_contents("/tmp/zusam_image_convert.lock", "lock");
        $dsn = $this->getContainer()->getParameter("database_url");
        $this->pdo = new \PDO($dsn, null, null);
        $filesDir = realpath($this->getContainer()->getParameter("dir.files"));
        $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id IN (SELECT file_id FROM messages_files) AND status = '".File::STATUS_RAW."' AND type LIKE 'image%';");
        while($rawFile = $c->fetch()) {
            $outputFile = $filesDir."/".$rawFile["id"];
            $output->writeln(["Converting ".$rawFile["content_url"]]);	
            $this->imageService->createThumbnail(
                $filesDir."/".$rawFile["content_url"],
                $outputFile.".converted",
                2048,
                2048
            );
            rename($outputFile.".converted", $outputFile.".jpg");
            $q = $this->pdo->prepare("UPDATE file SET content_url = '".$rawFile["id"].".jpg', status = '".File::STATUS_READY."', type = 'image/jpeg' WHERE id = '".$rawFile["id"]."';");
            $q->execute();
            unlink("/tmp/zusam_image_convert.lock");
            return;
        }
        unlink("/tmp/zusam_image_convert.lock");
    }
}
