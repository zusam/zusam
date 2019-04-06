<?php

namespace App\Command;

use App\Entity\Message;
use App\Entity\User;
use App\Service\Mailer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class WeeklyEmailCommand extends ContainerAwareCommand
{
    private $em;
    private $mailer;

    public function __construct (EntityManagerInterface $em, Mailer $mailer)
    {
        parent::__construct();
        $this->em = $em;
        $this->mailer = $mailer;
    }

    protected function configure()
    {
        $this->setName("zusam:weekly-emails")
             ->setDescription("Send weekly emails.")
             ->setHelp("Send a weekly email to the users that asked for it.");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $users = $this->em->getRepository(User::class)->findAll();
        foreach ($users as $user) {
            if (!$user->getData()["weekly_email"]) {
                continue;
            }
            foreach ($user->getNews() as $new) {
                $message = $this->em->getRepository(Message::class)->findOneById($new);
                if (!empty($message)) {
                    $this->mailer->sendWeeklyEmail($user);
                    break;
                }
            }
        }
    }
}
