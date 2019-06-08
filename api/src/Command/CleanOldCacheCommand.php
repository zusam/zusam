<?php

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CleanOldCacheCommand extends Command
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

        if (!$cacheDir) {
            throw new \Exception("Target directory ($cacheDir) could not be found !");
        }
        
        if (!is_writeable($cacheDir)) {
            throw new \Exception("Target directory ($cacheDir) is not writable !");
        }

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
