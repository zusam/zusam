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

            // don't evaluate further if we are not in the right conditions
            if (
                'hourly' != $notif
                && ('monthly' != $notif || '1-1' != date('j-G')) // first of the month at 1AM
                && ('weekly' != $notif || '1-1' != date('N-G')) // monday at 1AM
                && ('daily' != $notif || '1' != date('G')) // 1AM
            ) {
                continue;
            }

            // fix a max_age for messages to be notified
            // avoids sending multiple mails for the same message
            switch ($notif) {
                case 'hourly':
                    $max_age = 60 * 60;
                    break;
                case 'daily':
                    $max_age = 60 * 60 * 24;
                    break;
                case 'weekly':
                    $max_age = 60 * 60 * 24 * 7;
                    break;
                case 'monthly':
                    $max_age = 60 * 60 * 24 * 7 * 30;
                    break;
                default:
                    $max_age = 0;
            }

            // only get recent enough notifications
            $notifications = array_filter($user->getNotifications()->toArray(), function ($n) ($max_age) {
                return time() - $n->getCreatedAt() < $max_age;
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
                    $this->mailer->sendNotificationEmail($user, $notifications);
                }
                break;
            }
        }
        return 0;
    }
}
