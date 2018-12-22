<?php

namespace App\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Cron\CronExpression;

class CronCommand extends ContainerAwareCommand
{
    private $output;

    protected function configure()
    {
        $this->setName('zusam:cron')
            ->setDescription('Launch recurrent tasks.')
            ->setHelp('This command launches recurrent tasks defined as symfony commands.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $cronId = substr(md5(date("Y-m-d H:i:s")), 0, 5);
        $this->output = $output;
        $timeStart = microtime(true);
        $this->output->writeln(["zusam:cron ($cronId) started at ".date("Y-m-d H:i:s")]);

        // executed every day
        $dailyCron = CronExpression::factory("@daily");
        if ($dailyCron->isDue()) {
            $this->runCommand("zusam:clean-files");
        }

        // executed every hour
        $hourlyCron = CronExpression::factory("@hourly");
        if ($hourlyCron->isDue()) {
        }

        // always executed
        $this->runCommand("zusam:convert-video");
        // convert 10 images
        for ($i = 0; $i < 10; $i++) {
            $this->runCommand("zusam:convert-image");
        }

        $timeEnd = microtime(true);
        $time = round($timeEnd - $timeStart, 2);
        $output->writeln([
            "<info>zusam:cron ($cronId) finished in $time seconds.</info>",
        ]);
    }

    private function runCommand($id)
    {
        $command = $this->getApplication()->find($id);
        $this->output->writeln("$id started");
        $returnCode = $command->run(new ArrayInput([]), $this->output);
        if ($returnCode === 0) {
            $this->output->writeln("<info>$id finished successfully</info>");
        } else {
            $this->output->writeln("<error>$id failed, return code: $returnCode</error>");
        }
    }
}
