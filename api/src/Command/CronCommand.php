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
    private $monitoringLogger;

    protected function configure()
    {
        $this->setName('zusam:cron')
            ->setDescription('Launch recurrent tasks.')
            ->setHelp('This command launches recurrent tasks defined as symfony commands.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->monitoringLogger = $this->getContainer()->get('monolog.logger.monitoring');
        $this->output = $output;
        $timeStart = microtime(true);
        $this->output->writeln("zusam:cron started");

        // executed every day
        $dailyCron = CronExpression::factory("@daily");
        if ($dailyCron->isDue()) {
            // $this->runCommand("lease:keep-up");
        }

        // executed every hour
        $hourlyCron = CronExpression::factory("@hourly");
        if ($hourlyCron->isDue()) {
            // $this->runCommand("stripe:charge");
        }

        // always executed

        $timeEnd = microtime(true);
        $time = round($timeEnd - $timeStart, 2);
        $output->writeln([
            "<info>zusam:cron finished in $time seconds.</info>",
            "======================================="
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
            //$this->monitoringLogger->critical("$id failed, return code: $returnCode");
        }
    }
}
