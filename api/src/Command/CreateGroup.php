<?php

namespace App\Command;

use App\Entity\Group;
use App\Entity\User;
use App\Service\Group as GroupService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateGroup extends Command
{
    private $em;
    private $output;
    private $groupService;

    public function __construct(
        EntityManagerInterface $em,
        GroupService $groupService,
    ) {
        parent::__construct();
        $this->em = $em;
        $this->groupService = $groupService;
    }

    protected function configure()
    {
        $this->setName('zusam:group:create')
            ->setDescription('Create a new group')
            ->addArgument('name', InputArgument::REQUIRED, 'Name to use for the new group.')
            ->addOption('user-id', null, InputOption::VALUE_OPTIONAL, 'GUID of the user to be added as the first user of the new group.')
            ->addOption('login', null, InputOption::VALUE_OPTIONAL, 'login email of the user to be added as the first user of the new group.')
            ->setHelp('Creates a new Zusam group. One of --login or --user-id must be provided, to be added as the first user of the group.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $userid = $input->getOption('user-id');
        $login = $input->getOption('login');
        $name = $input->getArgument('name');

        if (!$login && !$userid) {
            $output->writeln([
                'Please provide either --login or --user-id of the user to be added as the first member of the group.',
            ]);

            return Command::FAILURE;
        }

        if ($login && $userid) {
            $output->writeln([
                'Please provide only one of --login or --user-id.',
            ]);

            return Command::FAILURE;
        }

        if ($userid) {
            $user = $this->em->getRepository(User::class)->find($userid);
        } else {
            $user = $this->em->getRepository(User::class)->findOneBy(['login' => $login]);
        }

        if (!$user) {
            $output->writeln([
                'User not found.',
            ]);

            return Command::FAILURE;
        }

        $group = $this->groupService->create($name, $user);

        if ($group instanceof Group) {
            $output->writeln([
                'Group created with ID: '.$group->getId(),
            ]);

            return Command::SUCCESS;
        }
        $output->writeln([
            'Failed to create group.',
        ]);

        return Command::FAILURE;
    }
}
