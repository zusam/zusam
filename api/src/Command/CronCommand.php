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
        $this->output = $output;
        $timeStart = microtime(true);
        $startDate = date("Y-m-d H:i:s");

        // executed every day
        $dailyCron = CronExpression::factory("@daily");
        if ($dailyCron->isDue()) {
            $this->runCommand("zusam:clean-files");
            $this->runCommand("zusam:clean-old-cache");
        }

        // executed every week
        $weeklyCron = CronExpression::factory("@weekly");
        if ($weeklyCron->isDue()) {
            $this->runCommand("zusam:weekly-emails");
        }

        // executed every hour
        // $hourlyCron = CronExpression::factory("@hourly");
        // if ($hourlyCron->isDue()) {
        // }

        // executed every minute
        $this->runCommand("zusam:convert-video");

        // executed 10 times every minute
        for ($i = 0; $i < 10; $i++) {
            $this->runCommand("zusam:convert-image");
        }

        $timeEnd = microtime(true);
        $time = round($timeEnd - $timeStart, 2);
        if ($time > 1) {
            $output->writeln([
                "<info>zusam:cron [$startDate] finished in $time seconds.</info>",
            ]);
        }
    }

    private function runCommand($id)
    {
        $command = $this->getApplication()->find($id);
        $returnCode = $command->run(new ArrayInput([]), $this->output);
        if ($returnCode != 0) {
            $this->output->writeln("<error>$id failed, return code: $returnCode</error>");
        }
    }
}
