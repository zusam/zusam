<?php

namespace App\Command;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class IssueNotification extends Command
{
    private $em;
    private $logger;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em
    ) {
        parent::__construct();
        $this->em = $em;
        $this->logger = $logger;
    }

    protected function configure()
    {
        $this->setName('zusam:notification:issue')
             ->setDescription('Issue global notification.')
             ->setHelp('This command sends a notification to all users.')
             ->addArgument('text', InputArgument::REQUIRED, "What's the notification text ?")
             ->addArgument('target', InputArgument::REQUIRED, 'Target URL when notification is clicked.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->logger->info($this->getName());

        $users = $this->em->getRepository(User::class)->findAll();
        foreach($users as $user) {
            $notification = new Notification();
            $notification->setType(Notification::GLOBAL_NOTIFICATION);
            $notification->setTarget($input->getArgument('target'));
            $notification->setData(['text' => $input->getArgument('text')]);
            $notification->setOwner($user);
            $user->addNotification($notification);
            $this->em->persist($user);
            $this->em->persist($notification);
        }

        $this->em->flush();
    }
}
