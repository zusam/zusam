<?php

namespace App\Command;

use App\Entity\Group;
use App\Service\Url;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ListInviteLinks extends Command
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
        $this->setName('zusam:invitations:list')
            ->setDescription('List the invite link for each group')
            ->addOption('group-id', null, InputOption::VALUE_REQUIRED, "What's the ID of the group to fetch invites for?")
            ->setHelp('List the invitation links for each of the groups')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->output = $output;
        if ($input->getOption('group-id')) {
            $group = $this->em->getRepository(Group::class)->find($input->getOption('group-id'));
            if ($group) {
                $inviteKey = $group->getInviteKey();
                if ($inviteKey) {
                    $this->output->writeln([
                        $this->url->getBaseUrl().'/invitation/'.$inviteKey,
                    ]);
                } else {
                    throw new \Exception('Group has no invite key');
                }
            } else {
                $this->output->writeln([
                    'Group ID not found',
                ]);
            }

            return 0;
        }

        $groups = $this->em->getRepository(Group::class)->findAll();
        $table = new Table($output);
        $table->setHeaders(['Group ID', 'Group Name', 'Invite Link']);
        foreach ($groups as $group) {
            $inviteKey = $group->getInviteKey();
            if ($inviteKey) {
                $table->addRow([$group->getId(), $group->getName(), $this->url->getBaseUrl().'/invitation/'.$inviteKey]);
            }
        }
        $table->render();

        return 0;
    }
}
