<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CleanCache extends Command
{
    private $targetDir;
    private $logger;

    public function __construct(
        string $targetDir,
        LoggerInterface $logger
    ) {
        parent::__construct();
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
        $this->setName('zusam:clean:cache')
            ->setDescription('Clean old cache files')
            ->addArgument('max-cache-size', InputArgument::OPTIONAL, 'Maximum cache usage in Mo (defaults to 512).')
            ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list files that would be deleted.')
            ->setHelp('This command removes cache files older than one month.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());
        $max_cache_size = 1024 * 1024 * ($input->getArgument('max-cache-size') ?? 512);

        $cache_size = 0;
        $files = [];
        foreach (scandir($this->targetDir.'/images/') as $file) {
            if ('.' != $file && '..' != $file) {
                $files[] = [
                    'path' => $this->targetDir.'/images/'.$file,
                    'mtime' => filemtime($this->targetDir.'/images/'.$file),
                    'size' => filesize($this->targetDir.'/images/'.$file),
                ];
                $cache_size += filesize($this->targetDir.'/images/'.$file);
            }
        }

        usort($files, function ($f1, $f2) {
            return $f1['mtime'] - $f2['mtime'];
        });

        foreach ($files as $file) {
            if ($cache_size < $max_cache_size) {
                break;
            }
            if ($input->getOption('verbose') || $input->getOption('only-list')) {
                $output->writeln([$file['path']]);
            }
            if (!$input->getOption('only-list')) {
                unlink($file['path']);
            }
            $cache_size -= $file['size'];
        }
        return 0;
    }
}
