<?php

namespace App\Command;

use App\Entity\File;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ConvertVideoCommand extends ContainerAwareCommand
{
	private $ffmpegPath;
    private $pdo;

    public function __construct($binaries)
    {
        parent::__construct();
		$this->ffmpegPath = $binaries["ffmpeg"];
    }

    protected function configure()
    {
        $this->setName('zusam:convert-video')
            ->setDescription('Converts a raw video file.')
            ->setHelp('This command search for a raw video file in the database and converts it.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (file_exists("/tmp/zusam_video_convert.lock")) {
            return;
        }
        file_put_contents("/tmp/zusam_video_convert.lock", "lock");
        $dsn = $this->getContainer()->getParameter("database_url");
        $this->pdo = new \PDO($dsn, null, null);
        $filesDir = realpath($this->getContainer()->getParameter("dir.files"));
        $c = $this->pdo->query("SELECT id, content_url FROM file WHERE (id IN (SELECT file_id FROM messages_files) OR id IN (SELECT avatar_id FROM user WHERE avatar_id NOT NULL)) AND status = '".File::STATUS_RAW."' AND type LIKE 'video%';");
        while($rawFile = $c->fetch()) {
            $outputFile = $filesDir."/".$rawFile["id"];
            $output->writeln(["Converting ".$rawFile["content_url"]]);	
            exec(
                "nice -n 19 " // give the process a low priority
                .$this->ffmpegPath
                ." -y -i ".$filesDir."/".$rawFile["content_url"]
                ." -c:v libx264 -filter:v scale=-2:720 -crf 22 -threads 1 -preset slower -c:a libmp3lame -y -f mp4 "
                .$outputFile.".converted"
            );
            rename($outputFile.".converted", $outputFile.".mp4");
            $q = $this->pdo->prepare("UPDATE file SET content_url = '".$rawFile["id"].".mp4', status = '".File::STATUS_READY."', type = 'video/mp4' WHERE id = '".$rawFile["id"]."';");
            $q->execute();
            unlink("/tmp/zusam_video_convert.lock");
            return;
        }
        unlink("/tmp/zusam_video_convert.lock");
    }
}
