<?php

namespace App\Command;

use App\Entity\Group;
use App\Entity\User;
use App\Entity\Message;
use App\Controller\NewMessage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class Initialize extends ContainerAwareCommand
{
    private $em;
    private $encoder;
    private $newMessage;

    public function __construct (
        EntityManagerInterface $em,
        UserPasswordEncoderInterface $encoder,
        NewMessage $newMessage
    ) {
        parent::__construct();
        $this->em = $em;
        $this->encoder = $encoder;
        $this->newMessage = $newMessage;
    }

    protected function configure()
    {
        $this->setName("zusam:init")
            ->setDescription("Initialize the database with a first user and group.")
            ->addArgument("user", InputArgument::REQUIRED, "What's the name of the first user ?")
            ->addArgument("group", InputArgument::REQUIRED, "What's the name of the first group ?")
            ->addArgument("password", InputArgument::REQUIRED, "What's the password of the first user ?");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $doctrineDatabaseCreate = $this->getApplication()->find("doctrine:database:create");
        $doctrineDatabaseCreate->run(new ArrayInput([
            "command" => "doctrine:database:create",
        ]), $output);

        $doctrineSchemaUpdate = $this->getApplication()->find("doctrine:schema:update");
        $doctrineSchemaUpdate->run(new ArrayInput([
            "command" => "doctrine:schema:update",
            "--force" => true,
        ]), $output);

        $user = new User();
        $user->setLogin($input->getArgument("user"));
        $user->setName(explode("@", $input->getArgument("user"))[0]);
        $user->setPassword($this->encoder->encodePassword($user, $input->getArgument("password")));

        $group = new Group();
        $group->setName($input->getArgument("group"));

        $group->addUser($user);
        $user->addGroup($group);

        $message_1 = new Message();
        $message_1->setAuthor($user);
        $message_1->setGroup($group);
        $message_1->setData([
            "title" => "Welcome on Zusam !",
            "text" => "
                This is a simple message.
                Try to post something yourself by using the new message button on the group page or by leaving a comment here.
            ",
        ]);
        $message_1->setPreview($this->newMessage->genPreview($message_1));

        $this->em->persist($user);
        $this->em->persist($group);
        $this->em->persist($message_1);
        $this->em->flush();
    }
}
