<?php

namespace App\Command;

use App\Entity\Group;
use App\Service\Url;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ResetInviteLink extends Command
{
    private $em;
    private $output;
    private Url $url;

    public function __construct(
        EntityManagerInterface $em,
        Url $url,
    ) {
        parent::__construct();
        $this->em = $em;
        $this->url = $url;
    }

    protected function configure()
    {
        $this->setName('zusam:invitations:reset')
            ->setDescription('Resets the invitation key for a group')
            ->addOption('group-id', null, InputOption::VALUE_REQUIRED, "What's the ID of the group to fetch invites for?")
            ->setHelp('Resets the invitation key for the selected group and outputs the new invitation link')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->output = $output;
        if ($input->getOption('group-id')) {
            $group = $this->em->getRepository(Group::class)->find($input->getOption('group-id'));
            if ($group) {
                $group->resetInviteKey();
                $this->em->persist($group);
                $this->em->flush();

                $this->output->writeln([
                    $this->url->getBaseUrl().'/invitation/'.$group->getInviteKey(),
                ]);
            } else {
                $this->output->writeln([
                    'Group ID not found',
                ]);
            }

            return 0;
        }

        return 0;
    }
}
