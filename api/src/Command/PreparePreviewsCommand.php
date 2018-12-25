<?php

namespace App\Command;

use App\Controller\LinkByUrl;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class PreparePreviewsCommand extends ContainerAwareCommand
{
    private $pdo;
    private $linkByUrl;

    public function __construct(LinkByUrl $linkByUrl)
    {
        parent::__construct();
        $this->linkByUrl = $linkByUrl;
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
        $start_time = microtime(true);
        $number_links = 0;
        $number_previews = 0;
        $number_descriptions = 0;
        $number_titles = 0;

        $c = $this->pdo->query("SELECT id, data FROM message WHERE parent_id IS NULL ORDER BY created_at DESC;");
        $messages = [];
        while($i = $c->fetch()) {
            $messages[] = $i;
        }
        $k = 0;
        foreach($messages as $i) {
            if (memory_get_usage(true) > 1024 * 1024 * $max_memory) {
                $output->writeln([
                    "Memory usage went over $max_memory Mo. Stopping the script.",
                    "Duration: " . (microtime(true) - $start_time),
                    "Number of links: " . $number_links,
                    "Number of previews: " . $number_previews,
                    "Number of descriptions: " . $number_descriptions,
                    "Number of titles: " . $number_titles,
                ]);
                exit(0);
            }
            $k++;
            $text = json_decode($i["data"], true)["text"];
            preg_match("/https?:\/\/[^\s]+/", $text, $links);
            if (!empty($links) && !empty($links[0])) {
                echo "[$k/".count($messages)."]: ".$links[0]."\n";
                try {
                    $number_links++;
                    $data = $this->linkByUrl->getLinkData($links[0], $filesDir, false, false);
                    $embed_data = json_decode($data["data"], true);
                    if (!empty($data["preview"])) {
                        $number_previews++;
                    } else {
                        $output->writeln(["NO PREVIEW"]);
                    }
                    if (!empty($embed_data["description"])) {
                        $number_descriptions++;
                    } else {
                        $output->writeln(["NO DESCRIPTION"]);
                    }
                    if (!empty($embed_data["title"])) {
                        $number_titles++;
                    } else {
                        $output->writeln(["NO TITLE"]);
                    }
                } catch (\Exception $e) {
                    $output->writeln([$e->getMessage()]);
                    continue;
                }
            }
        }
    }
}
