<?php

namespace App\Command;

use App\Entity\Group;
use App\Entity\Message;
use App\Entity\User;
use App\Service\Uuid;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class Initialize extends Command
{
    private $em;
    private $encoder;
    private $newMessage;

    public function __construct(
        EntityManagerInterface $em,
        UserPasswordEncoderInterface $encoder
    ) {
        parent::__construct();
        $this->em = $em;
        $this->encoder = $encoder;
    }

    protected function configure()
    {
        $this->setName('zusam:init')
             ->setDescription('Initialize the database with a first user and group.')
             ->addArgument('user', InputArgument::REQUIRED, "What's the name of the first user ?")
             ->addArgument('group', InputArgument::REQUIRED, "What's the name of the first group ?")
             ->addArgument('password', InputArgument::REQUIRED, "What's the password of the first user ?")
             ->addOption('remove-existing', null, InputOption::VALUE_NONE, 'Remove existing database beforehand.')
             ->addOption('seed', null, InputOption::VALUE_REQUIRED, 'Specify a seed for UUIDs generation.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        if ($input->getOption('remove-existing')) {
            $doctrineDatabaseDrop = $this->getApplication()->find('doctrine:database:drop');
            $doctrineDatabaseDrop->run(new ArrayInput([
                'command' => 'doctrine:database:drop',
                '--force' => true,
            ]), $output);
        }

        $doctrineDatabaseCreate = $this->getApplication()->find('doctrine:database:create');
        $doctrineDatabaseCreate->run(new ArrayInput([
            'command' => 'doctrine:database:create',
        ]), $output);

        $doctrineSchemaUpdate = $this->getApplication()->find('doctrine:schema:update');
        $doctrineSchemaUpdate->run(new ArrayInput([
            'command' => 'doctrine:schema:update',
            '--force' => true,
        ]), $output);


        $user = $this->em->getRepository(User::class)->findOneByLogin($input->getArgument('user'));
        // Only execute the rest of the initialization if the user doesn't exist
        if (empty($user)) {
            $user = new User();
            $user->setLogin($input->getArgument('user'));
            $user->setName(explode('@', $input->getArgument('user'))[0]);
            $user->setPassword($this->encoder->encodePassword($user, $input->getArgument('password')));
            if ($input->getOption('seed')) {
                $reflection = new \ReflectionClass($user);
                $id = $reflection->getProperty('id');
                $id->setAccessible(true);
                $id->setValue($user, Uuid::uuidv4($input->getOption('seed').'_user'));
                $secretKey = $reflection->getProperty('secretKey');
                $secretKey->setAccessible(true);
                $secretKey->setValue($user, Uuid::uuidv4($input->getOption('seed').'_user_secret_key'));
            }

            $group = new Group();
            $group->setName($input->getArgument('group'));
            if ($input->getOption('seed')) {
                $reflection = new \ReflectionClass($group);
                $id = $reflection->getProperty('id');
                $id->setAccessible(true);
                $id->setValue($group, Uuid::uuidv4($input->getOption('seed').'_group'));
                $secretKey = $reflection->getProperty('secretKey');
                $secretKey->setAccessible(true);
                $secretKey->setValue($group, Uuid::uuidv4($input->getOption('seed').'_group_secret_key'));
            }

            $group->addUser($user);
            $user->addGroup($group);

            $message_1 = new Message();
            $message_1->setAuthor($user);
            $message_1->setGroup($group);
            $message_1->setIsInFront(true);
            $message_1->setData([
                'title' => 'Welcome on Zusam !',
                'text' => '
                    This is a simple message.
                    Try to post something yourself by using the new message button on the group page or by leaving a comment here.
                ',
            ]);
            if ($input->getOption('seed')) {
                $reflection = new \ReflectionClass($message_1);
                $id = $reflection->getProperty('id');
                $id->setAccessible(true);
                $id->setValue($message_1, Uuid::uuidv4($input->getOption('seed').'_message'));
                $secretKey = $reflection->getProperty('secretKey');
                $secretKey->setAccessible(true);
                $secretKey->setValue($message_1, Uuid::uuidv4($input->getOption('seed').'_message_secret_key'));
            }

            $this->em->persist($user);
            $this->em->persist($group);
            $this->em->persist($message_1);
        }
        $this->em->flush();
        return 0;
    }
}
