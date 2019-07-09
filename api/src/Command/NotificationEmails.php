<?php

namespace App\Command;

use App\Entity\Message;
use App\Entity\User;
use App\Service\Mailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class NotificationEmails extends Command
{
    private $em;
    private $mailer;
    private $logger;

    public function __construct (
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
        $this->setName("zusam:notification-emails")
             ->setDescription("Send notification emails.")
            ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list user ids that would get a notification.')
             ->setHelp("Send a notification email to the users that asked for it.");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->logger->info($this->getName());
        $users = $this->em->getRepository(User::class)->findAll();
        foreach ($users as $user) {

            if (empty($user->getNews())) {
                continue;
            }

            $data = $user->getData();
            $notif = isset($data["notification_emails"]) ? $data["notification_emails"] : "";
            if (
                empty($notif) || $notif == "none"
                || ($notif == "monthly" && date("j-G") != "1-1")
                || ($notif == "weekly" && date("N-G") != "1-1")
                || ($notif == "daily" && date("G") != "1")
            ) {
                continue;
            }

            // fix a max_age for messages to be notified
            // avoids sending multiple mails for the same message
            switch ($notif) {
                case "hourly":
                    $max_age = 60*60;
                    break;
                case "daily":
                    $max_age = 60*60*24;
                    break;
                case "weekly":
                    $max_age = 60*60*24*7;
                    break;
                case "monthly":
                    $max_age = 60*60*24*7*30;
                    break;
                default:
                    $max_age = 0;
            }

            foreach ($user->getNews() as $new) {
                $message = $this->em->getRepository(Message::class)->findOneById($new);
                $news = [];
                if (
                    !empty($message)
                    && (time() - $message->getLastActivityDate()) < $max_age
                ) {
                    $news[] = $message;
                }
            }

            if (count($news) > 0) {
                if ($input->getOption("verbose") || $input->getOption("only-list")) {
                    $output->writeln([
                        "<info>Notification email sent to ".$user->getId().".</info>",
                    ]);
                }
                if (!$input->getOption("only-list")) {
                    $this->mailer->sendNotificationEmail($user, $news);
                }
                break;
            }
        }
    }
}
