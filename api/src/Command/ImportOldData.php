<?php

namespace App\Command;

use App\Service\Uuid;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;

class ImportOldData extends ContainerAwareCommand
{
    private $pdo;
    private $output;
    private $input;

    protected function configure()
    {
        $this->setName("zusam:import-old")
            ->setDescription("Import data from the legacy version of Zusam.")
            ->setHelp("This command parse multiple json files with the legacy data structure and import it into the database.")
            ->addArgument("accounts", InputArgument::REQUIRED, "Where is the accounts file in json format ?")
            ->addArgument("forums", InputArgument::REQUIRED, "Where is the accounts file in json format ?")
            ->addArgument("posts", InputArgument::REQUIRED, "Where is the accounts file in json format ?")
            ->addArgument("files", InputArgument::REQUIRED, "Where is the accounts file in json format ?");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $dsn = $this->getContainer()->getParameter("database_url");
        $this->pdo = new \PDO($dsn, null, null);
        $this->output = $output;
        $this->input = $input;

        // first parse each json file
        $accountsData = json_decode(file_get_contents($input->getArgument("accounts")), true);
        $forumsData = json_decode(file_get_contents($input->getArgument("forums")), true);
        $postsData = json_decode(file_get_contents($input->getArgument("posts")), true);
        $filesData = json_decode(file_get_contents($input->getArgument("files")), true);

        echo "Parsing users...\n";

        // first pass on the users
        $users = [];
        foreach($accountsData as $account) {
            if (
                empty($account["_id"]['$oid'])
                || empty($account["date"]['$date'])
                || empty($account["mail"])
                || empty($account["password"])
                || empty($account["forums"]) // Not a legit account if no forum
                || empty($account["timestamp"]) // Not a legit account if not updated since timestamp update
                || intval($account["timestamp"]) + 60*60*24*30*12 < time() // Not legit if not connected in the last year
            ) {
                continue;
            }

            $u = [];
            $u["id"] = Uuid::uuidv4($account["_id"]['$oid']);
            $u["createdAt"] = strtotime($account["date"]['$date']);
            if (!$u["createdAt"]) {
                $u["createdAt"] = time();
            }
            $u["login"] = $account["mail"];
            $u["password"] = $account["password"];
            $u["files"] = [];
            $u["groups"] = [];
            foreach($account["forums"] as $k=>$v) {
                $u["groups"][] = Uuid::uuidv4($k);
            }
            $users[] = $u;
        }

        echo "Parsing groups...\n";

        $groups = [];
        foreach($forumsData as $forum) {
            if (
                empty($forum["_id"]['$oid'])
                || empty($forum["date"]['$date'])
                || empty($forum["users"])
                || empty($forum["timestamp"]) // Not a legit forum if not updated since timestamp update
                || intval($forum["timestamp"]) + 60*60*24*30*12 < time() // Not legit if not update in the last year
            ) {
                continue;
            }

            $g = [];
            $g["id"] = Uuid::uuidv4($forum["_id"]['$oid']);
            $g["createdAt"] = strtotime($forum["date"]['$date']);
            if (!$g["createdAt"]) {
                $g["createdAt"] = time();
            }
            $g["name"] = $forum["name"];
            $g["files"] = [];
            $g["users"] = [];
            foreach($forum["users"] as $u) {
                $uid = "";
                if (is_string($u)) {
                    $uid = Uuid::uuidv4($u);
                }
                if (is_array($u) && !empty($u['$oid'])) {
                    $uid = Uuid::uuidv4($u['$oid']);
                }
                if ($uid) {
                    foreach($users as $u) {
                        if ($u["id"] === $uid) {
                            $g["users"][] = $uid;
                            break;
                        }
                    }
                }
            }
            // if nobody is in the forum, remove it
            if(count($g["users"])) {
                $groups[] = $g;
            }
        }

        // now, remove users without any group
        foreach($users as $kk=>$u) {
            foreach($u["groups"] as $k=>$gid) {
                $flag = false;
                foreach($groups as $g) {
                    if ($g["id"] === $gid) {
                        $flag = true;
                        break;
                    }
                }
                if (!$flag) {
                    unset($u["groups"][$k]);
                }
            }
            if (!count($u["groups"])) {
                unset($users[$kk]);
            }
        }

        echo "Parsing messages...\n";

        $messages = [];
        $fileList = [];
        foreach($postsData as $post) {
            if (
                empty($post["_id"]['$oid'])
                || empty($post["date"]['$date'])
                || empty($post["text"])
                || empty($post["forum"]['$oid'])
                || empty($post["uid"]['$oid'])
            ) {
                continue;
            }

            $m = [];
            $m["id"] = Uuid::uuidv4($post["_id"]['$oid']);
            $m["createdAt"] = strtotime($post["date"]['$date']);
            if (!$m["createdAt"]) {
                $m["createdAt"] = time();
            }
            $m["data"] = $post["text"];
            $files = [];
            $m["files"] = [];
            if (preg_match_all("/{:[^\s]+:}/", $m["data"], $files)) {
                foreach($files[0] as $file) {
                    $fid = substr($file, 2, -2);
                    $m["files"][] = $fid; // store fileNames for now (fileId)
                    $fileList[] = $fid;
                }
            }
            $m["group"] = Uuid::uuidv4($post["forum"]['$oid']);

            // is the group still valid ?
            $flag = false;
            foreach($groups as $g) {
                if ($g["id"] === $m["group"]) {
                    $flag = true;
                    break;
                }
            }
            if (!$flag) {
                continue;
            }

            $m["author"] = Uuid::uuidv4($post["uid"]['$oid']);

            // is the author still valid ?
            $flag = false;
            foreach($users as $u) {
                if ($u["id"] === $m["author"]) {
                    $flag = true;
                    break;
                }
            }
            if (!$flag) {
                continue;
            }

            if (!empty($post["parent"]['$oid'])) {
                $m["parent"] = Uuid::uuidv4($post["parent"]['$oid']);
            }
            $m["children"] = [];
            if (!empty($post["children"])) {
                foreach($post["children"] as $c) {
                    $cid = "";
                    if (is_string($c)) {
                        $m["children"][] = Uuid::uuidv4($c);
                        continue;
                    }
                    if (is_array($c) && !empty($c['$oid'])) {
                        $m["children"][] = Uuid::uuidv4($c['$oid']);
                        continue;
                    }
                }
            }
            $messages[] = $m;
        }

        echo "Parsing files\n";

        $files = [];
        foreach($filesData as $file) {
            if (
                empty($file["_id"]['$oid'])
                || empty($file["date"]['$date'])
                || empty($file["fileId"])
                || empty($file["owner"]['$oid'])
                || empty($file["links"])
                || !intval($file["links"])
            ) {
                continue;
            }

            $f = [];
            $f["id"] = Uuid::uuidv4($file["_id"]['$oid']);
            $f["name"] = $file["fileId"];
            if (!in_array($f["name"], $fileList)) {
                continue;
            }

            $f["createdAt"] = strtotime($file["date"]['$date']);
            if (!$f["createdAt"]) {
                $f["createdAt"] = time();
            }
            $f["owner"] = Uuid::uuidv4($file["owner"]['$oid']);

            // is the author still valid ?
            $flag = false;
            foreach($users as $u) {
                if ($u["id"] === $f["owner"]) {
                    $flag = true;
                    break;
                }
            }
            if (!$flag) {
                continue;
            }
            $files[] = $f;
        }

        echo "\n";
        echo "users: ".count($accountsData)." => ".count($users)."\n";
        echo "groups: ".count($forumsData)." => ".count($groups)."\n";
        echo "messages: ".count($postsData)." => ".count($messages)."\n";
        echo "files: ".count($filesData)." => ".count($files)."\n";
        echo "\n";

        // give messages the right files and files their group
        // give users and group their messages and files
        foreach($messages as $kkk=>$message) {
            if (!empty($message["files"])) {
                $fileList = [];
                foreach($message["files"] as $fileId) {
                    foreach($files as $kk=>$file) {
                        if ($file["name"] === $fileId) {
                            $fileList[] = $file["id"];
                            break;
                        }
                    }
                }
                $messages[$kkk]["files"] = $fileList;
            }

            foreach($groups as $kgroup=>$group) {
                if ($group["id"] === $message["group"]) {
                    $groups[$kgroup]["messages"][] = $message["id"];
                }
            }

            foreach($users as $kuser=>$user) {
                if ($user["id"] === $message["author"]) {
                    $users[$kuser]["messages"][] = $message["id"];
                }
            }
        }


        // now that messages have their files, we can remove them from the data
        foreach($messages as $k=>$m) {
            $messages[$k]["data"] = preg_replace("/{:[^\s]+:}/", "", $m["data"]);
        }

        echo "Pushing users...\n";
        foreach($users as $user) {
            $query = "INSERT INTO `user` (id, created_at, login, password, last_connection, api_key) VALUES ("
                ."'".$user["id"]."'"
                .", ".$user["createdAt"]
                .", "."'".$user["login"]."'"
                .", "."'".$user["password"]."'"
                .", ".time()
                .", '".Uuid::uuidv4()."'"
                .");";
            $this->pdo->exec($query) or function () use ($user) {
                echo "\n";
                var_dump($user);
                echo "\n";
                die("fail to insert user\n");
            };
        }

        echo "Pushing groups...\n";
        foreach($groups as $group) {
            $query = "INSERT INTO `group` (id, created_at, name) VALUES ("
                ."'".$group["id"]."'"
                .", ".$group["createdAt"]
                .", ".$this->pdo->quote($group["name"])
                .");";
            $this->pdo->exec($query) or function () use ($group) {
                echo "\n";
                var_dump($group);
                echo "\n";
                die("fail to insert group\n");
            };
        }

        echo "Linking users & groups...\n";
        foreach($users as $user) {
            foreach($user["groups"] as $gid) {
                $query = "INSERT INTO `users_groups` (user_id, group_id) VALUES ("
                    ."'".$user["id"]."'"
                    .", "."'".$gid."'"
                    .");";
                $this->pdo->exec($query) or function () use ($gid) {
                    echo "\n";
                    var_dump($gid);
                    echo "\n";
                    die("fail to insert users_groups\n");
                };
            }
        }

        echo "Pushing parent messages...\n";
        foreach($messages as $message) {
            if (!empty($message["parent"])) {
                continue;
            }
            if (empty($message["id"])) {
                // var_dump($message);
                continue;
            }
            $query = "INSERT INTO `message` (id, group_id, author_id, created_at, data) VALUES ("
                ."'".$message["id"]."'"
                .", "."'".$message["group"]."'"
                .", "."'".$message["author"]."'"
                .", ".$message["createdAt"]
                .", ".$this->pdo->quote(trim($message["data"]))
                .");";
            $this->pdo->exec($query) or function () use ($message) {
                echo "\n";
                var_dump($message);
                echo "\n";
                die("fail to insert message\n");
            };
        }

        echo "Pushing child messages...\n";
        foreach($messages as $message) {
            if (empty($message["parent"])) {
                continue;
            }
            $query = "INSERT INTO `message` (id, group_id, parent_id, author_id, created_at, data) VALUES ("
                ."'".$message["id"]."'"
                .", "."'".$message["group"]."'"
                .", "."'".$message["parent"]."'"
                .", "."'".$message["author"]."'"
                .", ".$message["createdAt"]
                .", ".$this->pdo->quote($message["data"])
                .");";
            $this->pdo->exec($query) or function () use ($message) {
                echo "\n";
                var_dump($message);
                echo "\n";
                die("fail to insert message\n");
            };
        }

        echo "Pushing files...\n";
        foreach($files as $file) {
            $query = "INSERT INTO `file` (id, created_at, type, name) VALUES ("
                ."'".$file["id"]."'"
                .", ".$file["createdAt"]
                .", 'file'"
                .", ".$this->pdo->quote($file["name"])
                .");";
            $this->pdo->exec($query) or function () use ($file) {
                echo "\n";
                var_dump($file);
                echo "\n";
                die("fail to insert file\n");
            };
        }

        echo "Linking messages & files...\n";
        foreach($messages as $message) {
            foreach($message["files"] as $fid) {
                $query = "INSERT INTO `messages_files` (message_id, file_id) VALUES ("
                    ."'".$message["id"]."'"
                    .", "."'".$fid."'"
                    .");";
                $this->pdo->exec($query) or function () use ($fid) {
                    echo "\n";
                    var_dump($fid);
                    echo "\n";
                    die("fail to insert messages_files\n");
                };
            }
        }

        echo "Done.\n";
    }
}
