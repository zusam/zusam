<?php

namespace App\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\File;

class ConvertVideoCommand extends ContainerAwareCommand
{
    private $em;
	private $ffmpegPath;

    public function __construct(EntityManagerInterface $em, $binaries)
    {
        parent::__construct();
        $this->em = $em;
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
        $filesDir = realpath($this->getContainer()->getParameter("dir.files"));
        $rawFiles = $this->em->getRepository(File::class)->findByStatus(File::STATUS_RAW);
        foreach($rawFiles as $rawFile) {
            if (substr($rawFile->getType(), 0, 5) === "video") {
                $outputFile = $rawFile->getId().".mp4";
				$output->writeln(["Converting ".$rawFile->getContentUrl()]);	
                exec(
                    $this->ffmpegPath
                    ." -y -i ".$filesDir."/".$rawFile->getContentUrl()
                    ." -c:v libx264 -filter:v scale=-2:720 -crf 22 -threads 1 -preset slower -c:a libmp3lame -y -f mp4 "
                    .$filesDir."/".$outputFile
                );
                $rawFile->setContentUrl($outputFile); 
                $rawFile->setStatus(File::STATUS_READY); 
                $rawFile->setType("video/mp4"); 
                $this->em->persist($rawFile);
                $this->em->flush();
                return;
            }
        }
    }
}
