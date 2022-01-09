<?php

namespace App\Command;

use App\Entity\Notification;
use App\Service\Notification as NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class PrepareNotifications extends Command
{
    private $em;
    private $logger;
    private $notificationService;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        NotificationService $notificationService,
    ) {
        parent::__construct();
        $this->em = $em;
        $this->logger = $logger;
        $this->notificationService = $notificationService;
    }

    protected function configure()
    {
        $this->setName('zusam:prepare-notifications')
            ->setDescription('Preprocess some values for notifications.')
            ->addOption('memory', null, InputOption::VALUE_REQUIRED, 'Maximum RAM usage (defaults to 70Mo).', "70")
            ->setHelp('This command preprocesses notifications for a faster first load.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
      $this->logger->info($this->getName());
      $max_memory = $input->getOption('memory') ? intval($input->getOption('memory')) : 70;
      ini_set('memory_limit', max(128, $max_memory + 10).'M');

      $query = $this->em->createQuery("SELECT n FROM App\Entity\Notification n");
      $notifications = $query->iterate();

      $start_time = microtime(true);
      $k = 0;
      foreach ($notifications as $row) {
        $notification = $row[0];
        if (memory_get_usage(true) > 1024 * 1024 * $max_memory) {
            $output->writeln([
                "Memory usage went over $max_memory Mo. Stopping the script.",
                'Duration: '.(floor(microtime(true) - $start_time)).' seconds',
                'Number of notifications: '.$k,
            ]);
            exit(0);
        }
        ++$k;
        if ($k < 5000) {
          continue;
        }
        echo "[$k]: ".$notification->getId()."\n";

        $this->notificationService->setDataTitle($notification);
        $this->em->persist($notification);
        if ($k % 100) {
          $this->em->flush();
        }
      }
      return 0;
    }
}
