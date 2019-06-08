<?php

namespace App\Command;

use App\Entity\File;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ConvertVideoCommand extends Command
{
    private $pdo;

    protected function configure()
    {
        $this->setName('zusam:convert-video')
            ->setDescription('Converts a raw video file.')
            ->addOption('all-cores', null, InputOption::VALUE_NONE, 'Use all available cores instead of just one.')
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
        $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id IN (SELECT file_id FROM messages_files) AND status = '".File::STATUS_RAW."' AND type LIKE 'video%';");
        while($rawFile = $c->fetch()) {
            $outputFile = $filesDir."/".$rawFile["id"];
            $output->writeln(["Converting ".$rawFile["content_url"]]);	
            if (!$input->getOption("all-cores")) {
                $threads = "-threads 1 ";
            }
            exec(
                "nice -n 19 " // give the process a low priority
                .$this->getContainer()->getParameter("binaries.ffmpeg")
                ." -loglevel 0 -y -i ".$filesDir."/".$rawFile["content_url"]
                ." -c:v libx264 -filter:v scale=-2:720 -crf 22 ".$threads."-preset slower -c:a aac -vbr 3 -y -f mp4 "
                .$outputFile.".converted"
            );
            if (file_exists($outputFile.".converted")) {
                rename($outputFile.".converted", $outputFile.".mp4");
                $q = $this->pdo->prepare("UPDATE file SET content_url = '".$rawFile["id"].".mp4', status = '".File::STATUS_READY."', type = 'video/mp4' WHERE id = '".$rawFile["id"]."';");
                $q->execute();
            } else {
                $output->writeln([
                    "<error>zusam:convert-video ".$rawFile["id"]." failed.</error>",
                ]);
            }
            unlink("/tmp/zusam_video_convert.lock");
            return;
        }
        unlink("/tmp/zusam_video_convert.lock");
    }
}
