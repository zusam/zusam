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
        $max_memory = intval($input->getArgument("memory")) ?? 70;
        ini_set('memory_limit', max(128, $max_memory + 10) . "M");

        $c = $this->pdo->query("SELECT id, data FROM message WHERE parent_id IS NULL ORDER BY created_at DESC;");
        $messages = [];
        while($i = $c->fetch()) {
            $messages[] = $i;
        }
        $k = 0;
        foreach($messages as $i) {
            if (memory_get_usage(true) > 1024 * 1024 * $max_memory) {
                echo "\n";
                echo "Memory usage went over $max_memory Mo. Stopping the script.\n";
                echo "\n";
                exit(0);
            }
            $k++;
            $text = json_decode($i["data"], true)["text"];
            preg_match("/https?:\/\/[^\s]+/", $text, $links);
            if (!empty($links) && !empty($links[0])) {
                echo "[$k/".count($messages)."]: ".$links[0]."\n";
                try {
                    $this->linkByUrl->getLinkData($links[0], $filesDir, false, false);
                } catch (\Exception $e) {
                    echo "\n";
                    echo $e->getMessage()."\n";
                    echo "\n";
                    continue;
                }
            }
        }
    }
}
