<?php

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CleanOldCacheCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('zusam:clean-old-cache')
            ->setDescription('Clean old cache files')
            ->setHelp('This command removes cache files older than one week.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $cacheDir = realpath($this->getContainer()->getParameter("dir.cache"));
        foreach(scandir($cacheDir."/images/") as $file) {
            if (
                $file != "." && $file != ".." &&
                filemtime($cacheDir."/images/".$file) < time() - 60*60*24*7
            ) {
                unlink($cacheDir."/images/".$file);
            }
        }
    }
}
