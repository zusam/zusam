<?php

namespace App\Command;

use App\Controller\Message\Create;
use App\Entity\Message;
use App\Service\Url as UrlService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class PreparePreviews extends Command
{
    private $em;
    private $pdo;
    private $createMessageController;
    private $urlService;
    private $logger;

    public function __construct(
        string $dsn,
        LoggerInterface $logger,
        EntityManagerInterface $em,
        Create $createMessageController,
        UrlService $urlService
    ) {
        parent::__construct();
        $this->pdo = new \PDO($dsn, null, null);
        $this->em = $em;
        $this->createMessageController = $createMessageController;
        $this->urlService = $urlService;
        $this->logger = $logger;
    }

    protected function configure()
    {
        $this->setName('zusam:prepare-previews')
            ->setDescription('Prepare-previews of parent messages.')
            ->addOption('force', null, InputOption::VALUE_NONE, 'Reprepare preview already processed.')
            ->addOption('memory', null, InputOption::VALUE_REQUIRED, 'Maximum RAM usage (defaults to 70Mo).', 70)
            ->addOption('filter', null, InputOption::VALUE_REQUIRED, 'Filter previews to process (substring of url).', null)
            ->setHelp('This command preprocesses previews of parent messages for a faster first load.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->logger->info($this->getName());
        $max_memory = $input->getOption('memory') ? intval($input->getOption('memory')) : 70;
        ini_set('memory_limit', max(128, $max_memory + 10).'M');

        // stats
        $start_time = microtime(true);
        $number_links = 0;
        $number_previews = 0;
        $number_descriptions = 0;
        $number_titles = 0;


        $c = $this->pdo->query('SELECT id, data FROM message ORDER BY created_at DESC;');
        $messages = [];
        while ($i = $c->fetch()) {
            $messages[] = $i;
        }
        $k = 0;
        foreach ($messages as $i) {
            if (memory_get_usage(true) > 1024 * 1024 * $max_memory) {
                $output->writeln([
                    "Memory usage went over $max_memory Mo. Stopping the script.",
                    'Duration: '.(floor(microtime(true) - $start_time)).' seconds',
                    'Number of links: '.$number_links,
                ]);
                exit(0);
            }
            ++$k;
            echo "[$k/".count($messages).']: '.$i['id']."\n";

            // get first url data
            $text = json_decode($i['data'], true)['text'];
            $urls = Message::getUrlsFromText($text);

            // apply filter if any
            if ($input->getOption('filter')) {
                $filter = $input->getOption('filter');
                $urls = array_filter($urls, function($k) use ($filter) {
                    return mb_stripos($k, $filter) !== false;
                });
            }

            if (count($urls) > 0) {
                try {
                    if ($output->isVerbose()) {
                        $output->writeln([$urls[0]]);
                    }
                    ++$number_links;
                    $link = $this->urlService->getLink($urls[0], $input->getOption('force'));
                    $this->em->persist($link);
                } catch (\Exception $e) {
                    $output->writeln([$e->getMessage()]);
                    continue;
                }
            }

            // process preview
            $message = $this->em->getRepository(Message::class)->findOneById($i['id']);
            $message->setPreview($this->createMessageController->genPreview($message, true));
            $this->em->persist($message);

            $this->em->flush();
        }
        return 0;
    }
}
