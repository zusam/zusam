<?php

namespace App\Command;

use App\Controller\NewMessage;
use App\Entity\Link;
use App\Entity\Message;
use App\Service\Url as UrlService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class PreparePreviewsCommand extends ContainerAwareCommand
{
    private $em;
    private $pdo;
    private $newMessage;
    private $urlService;

    public function __construct (
        EntityManagerInterface $em,
        NewMessage $newMessage,
        UrlService $urlService
    ) {
        parent::__construct();
        $this->em = $em;
        $this->newMessage = $newMessage;
        $this->urlService = $urlService;
    }

    protected function configure()
    {
        $this->setName('zusam:prepare-previews')
            ->setDescription('Prepare-previews of parent messages.')
            ->addArgument('memory', InputArgument::OPTIONAL, 'Maximum RAM usage (defaults to 70Mo).')
            ->setHelp('This command preprocesses previews of parent messages for a faster first load.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $dsn = $this->getContainer()->getParameter("database_url");
        $this->pdo = new \PDO($dsn, null, null);
        $filesDir = realpath($this->getContainer()->getParameter("dir.files"));
        $max_memory = $input->getArgument("memory") ? intval($input->getArgument("memory")) : 70;
        ini_set('memory_limit', max(128, $max_memory + 10) . "M");

        // stats
        $start_time = microtime();
        $number_links = 0;
        $number_previews = 0;
        $number_descriptions = 0;
        $number_titles = 0;

        $c = $this->pdo->query("SELECT id, data FROM message WHERE parent_id IS NULL AND preview_id IS NULL ORDER BY created_at DESC;");
        $messages = [];
        while($i = $c->fetch()) {
            $messages[] = $i;
        }
        $k = 0;
        foreach($messages as $i) {
            if (memory_get_usage(true) > 1024 * 1024 * $max_memory) {
                $output->writeln([
                    "Memory usage went over $max_memory Mo. Stopping the script.",
                    "Duration: " . (floor(microtime()) - $start_time) . " seconds",
                    "Number of links: " . $number_links,
                ]);
                exit(0);
            }
            $k++;
            $text = json_decode($i["data"], true)["text"];
            $urls = Message::getUrlsFromText($text);
            if (count($urls) > 0) {
                echo "[$k/".count($messages)."]: ".$urls[0]."\n";
                try {
                    $number_links++;
                    $link = $this->urlService->getLink($urls[0]);
                    $this->em->persist($link);
                    $message = $this->em->getRepository(Message::class)->findOneById($i["id"]);
                    $message->setPreview($this->newMessage->genPreview($message));
                    $this->em->persist($message);
                } catch (\Exception $e) {
                    $output->writeln([$e->getMessage()]);
                    continue;
                }
            }
            $this->em->flush();
        }
    }
}
