<?php

namespace App\Service;

use App\Entity\File;
use App\Entity\User;
use App\Service\File as FileService;
use App\Service\Group as GroupService;
use App\Service\Message as MessageService;
use App\Service\User as UserService;
use Doctrine\ORM\EntityManagerInterface;

class Bot
{
    private $botDir;
    private $em;
    private $fileService;
    private $groupService;
    private $messageService;
    private $userService;

    public function __construct(
        $botDir,
        EntityManagerInterface $em,
        FileService $fs,
        GroupService $gs,
        MessageService $ms,
        UserService $us
    ) {
        $this->botDir = $botDir;
        $this->em = $em;
        $this->fileService = $fs;
        $this->groupService = $gs;
        $this->messageService = $ms;
        $this->userService = $us;
    }

    public function get_bot_dir($bot_id)
    {
        return realpath($this->botDir.'/'.$bot_id);
    }

    public function load_memory(string $bot_id): array
    {
        $memory_path = $this->get_bot_dir($bot_id).'/memory.json';
        if (is_file($memory_path) && is_readable($memory_path)) {
            return json_decode(file_get_contents($memory_path), true);
        }

        return [];
    }

    public function dump_memory(string $bot_id, array $memory): void
    {
        $memory_path = $this->get_bot_dir($bot_id).'/memory.json';
        if (is_file($memory_path) && is_writable($memory_path)) {
            $memory_file = fopen($memory_path, 'w');
            fwrite($memory_file, json_encode($memory));
            fclose($memory_file);
        }
    }

    public function get_bot(string $bot_id): User
    {
        $bot = $this->userService->create($bot_id);

        return $bot;
    }

    public function create_file_from_url(string $url): File
    {
        $temp_path = tempnam(sys_get_temp_dir(), 'zusam_bot_from_url');
        $temp_file = fopen($temp_path, 'w');
        fwrite($temp_file, file_get_contents($url));
        fclose($temp_file);
        $file = $this->fileService->createFromPath($temp_path, true);

        return $file;
    }

    public function set_avatar(string $bot_id, string $avatar_path): void
    {
        $bot = $this->get_bot($bot_id);
        $avatar = $this->fileService->createFromPath($avatar_path, true);
        if (!empty($avatar)) {
            $bot->setAvatar($avatar);
            $this->em->persist($bot);
        }
    }

    public function add_bot_to_group(string $bot_id, string $group_id): void
    {
        $this->groupService->addUser(
            $this->groupService->getById($group_id),
            $this->get_bot($bot_id)
        );
    }

    public function create_message(string $bot_id, string $group_id, array $message): void
    {
        $bot = $this->get_bot($bot_id);
        if (null == $bot->getAvatar()) {
            $this->set_avatar($bot_id, $this->get_bot_dir($bot_id).'/avatar.png');
        }
        $group = $this->groupService->getById($group_id);
        $this->messageService->create(
            [
                'data' => $message['data'] ?? [],
                'files' => $message['files'] ?? [],
                'parent' => $message['parent_id'] ?? '',
            ],
            $bot,
            $group
        );
    }
}
