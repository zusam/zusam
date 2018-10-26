<?php

namespace App\Command;

use App\Controller\LinkByUrl;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
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
            ->setHelp('This command preprocesses previews of parent messages for a faster first load.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $dsn = $this->getContainer()->getParameter("database_url");
        $this->pdo = new \PDO($dsn, null, null);
        $publicDir = realpath($this->getContainer()->getParameter("dir.public"));

        $c = $this->pdo->query("SELECT id, data, created_at FROM message WHERE parent_id IS NULL;");
        $messages = [];
        while($i = $c->fetch()) {
            $messages[] = $i;
        }
        // sort messages by creation date to start by the most recent ones
        usort($messages, function($m1, $m2) {
            return $m1["created_at"] > $m2["created_at"] ? -1 : 1;
        });
        $k = 0;
        foreach($messages as $i) {
            if (memory_get_usage(true) > 1024 * 1024 * 70) {
                echo "\n";
                echo "Memory usage went over 70MB. Stopping the script.\n";
                echo "\n";
                exit(0);
            }
            $k++;
            $text = json_decode($i["data"], true)["text"];
            preg_match("/https?:\/\/[^\s]+/", $text, $links);
            if (!empty($links) && !empty($links[0])) {
                echo "[$k/".count($messages)."]: ".$links[0]."\n";
                try {
                    $this->linkByUrl->getLinkData($links[0], $publicDir, false, false);
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
