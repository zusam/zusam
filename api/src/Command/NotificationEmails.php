<?php

namespace App\Command;

use App\Entity\Message;
use App\Entity\User;
use App\Service\Mailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class NotificationEmails extends Command
{
    private $em;
    private $mailer;
    private $logger;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        Mailer $mailer
    ) {
        parent::__construct();
        $this->em = $em;
        $this->mailer = $mailer;
        $this->logger = $logger;
    }

    protected function configure()
    {
        $this->setName('zusam:notification:emails')
             ->setDescription('Send notification emails.')
             ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list user ids that would get a notification.')
             ->addOption('log-send', null, InputOption::VALUE_NONE, 'Log when sending an email.')
             ->addOption('log-as-error', null, InputOption::VALUE_NONE, 'Log sent emails as errors.')
             ->setHelp('Send a notification email to the users that asked for it.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());
        $users = $this->em->getRepository(User::class)->findAll();
        foreach ($users as $user) {
            if (empty($user->getNotifications())) {
                continue;
            }

            $data = $user->getData();
            $notif = isset($data['notification_emails']) ? $data['notification_emails'] : '';
            $lastNotificationEmailCheck = $user->getLastNotificationEmailCheck();
            $now = time();

            // don't evaluate further if we are not in the right conditions
            $firstOfMonth1AM = strtotime('first day of this month 1:00 AM');
            $lastMonday1AM = strtotime('last monday at 1:00 AM');
            $today1AM = strtotime('today 1:00 AM');

            $isHourlyDue = ('hourly' === $notif && (date('i', $now) === '00' || ($now - $lastNotificationEmailCheck) > 3600));
            $isMonthlyDue = ('monthly' === $notif && (date('j-G', $now) === '1-1' || $lastNotificationEmailCheck < $firstOfMonth1AM));
            $isWeeklyDue = ('weekly' === $notif && (date('N-G', $now) === '1-1' || $lastNotificationEmailCheck < $lastMonday1AM));
            $isDailyDue = ('daily' === $notif && (date('G', $now) === '1' || $lastNotificationEmailCheck < $today1AM));

            if ('immediately' !== $notif && !$isHourlyDue && !$isMonthlyDue && !$isWeeklyDue && !$isDailyDue) {
                continue;
            }

            // Update last email sent time regardless of if email is sent, as we don't want monthly to retry all month
            // until there is an email to send. Same for weekly/daily/hourly

            $user->setLastNotificationEmailCheck(time());

            $notifications = array_filter($user->getNotifications()->toArray(), function ($n) use ($lastNotificationEmailCheck) {
                return $n->getCreatedAt() > $lastNotificationEmailCheck;
            });
            if (count($notifications) > 0) {
                if ($input->getOption('verbose') || $input->getOption('only-list')) {
                    $output->writeln([
                        '<info>Notification email sent to '.$user->getId().' for '.count($notifications).' notifications.</info>',
                    ]);
                }
                if ($input->getOption('log-send')) {
                    if ($input->getOption('log-as-error')) {
                        $this->logger->error('Notification email sent to '.$user->getId().' for '.count($notifications).' notifications.');
                    } else {
                        $this->logger->info('Notification email sent to '.$user->getId().' for '.count($notifications).' notifications.');
                    }
                }
                if (!$input->getOption('only-list')) {
                    $this->em->persist($user);
                    $this->mailer->sendNotificationEmail($user, $notifications);
                }
            }
        }
        $this->em->flush();
        return 0;
    }
}
