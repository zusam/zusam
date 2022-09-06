<?php

namespace App\Command;

use App\Entity\User as USerEntity;
use App\Entity\Message as MessageEntity;
use App\Entity\Bookmark as BookmarkEntity;
use App\Service\Bookmark as BookmarkService;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class Migration extends Command
{
    private $pdo;
    private $logger;
    private $em;
    private $bookmarkService;

    public function __construct(
        string $dsn,
        LoggerInterface $logger,
        EntityManagerInterface $em,
        BookmarkService $bookmarkService,
    ) {
        parent::__construct();
        $this->em = $em;
        $this->pdo = new \PDO($dsn, null, null);
        $this->logger = $logger;
        $this->bookmarkService = $bookmarkService;
    }

    protected function configure()
    {
        $this->setName('zusam:migration')
            ->setDescription('Migration helper.')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Execute a dry run of the migration without touching any data.')
            ->setHelp('This command executes some migrations automagically.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());

        $c = $this->pdo->query("SELECT id, data FROM user;");
        $users = [];
        while ($i = $c->fetch()) {
            if ($input->getOption('verbose') || $input->getOption('dry-run')) {
            }
            $data = json_decode($i['data'], true);
            if (!empty($data['bookmarks'])) {
                $users[] = $i["id"];
            }
        }
        foreach ($users as $user_id) {
            $userEntity = $this->em->getRepository(UserEntity::class)->findOneById($user_id);
            $data = $userEntity->getData();
            if (!empty($data['bookmarks'])) {
                if ($input->getOption('verbose') || $input->getOption('dry-run')) {
                    $output->writeln("user " . $user_id . " has " . count($data["bookmarks"]) . " bookmarks.");
                }
                foreach ($data["bookmarks"] as $message_id) {
                    $messageEntity = $this->em->getRepository(MessageEntity::class)->findOneById($message_id);
                    if (!empty($messageEntity)) {
                        $bookmark = $this->bookmarkService->create($userEntity, $messageEntity);
                        if (!$input->getOption('dry-run')) {
                            $this->em->persist($bookmark);
                            $this->em->flush();
                        }
                        if ($input->getOption('verbose') || $input->getOption('dry-run')) {
                            $output->writeln("Added " . $message_id . " to the user's bookmarks.");
                        }
                    }
                }
                unset($data["bookmarks"]);
                $userEntity->setData($data);
                if (!$input->getOption('dry-run')) {
                    $this->em->persist($userEntity);
                    $this->em->flush();
                }
                if ($input->getOption('verbose') || $input->getOption('dry-run')) {
                    $output->writeln("Removed old bookmarks from the user's data.");
                }
            }
        }
        return 0;
    }
}
