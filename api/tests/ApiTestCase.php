<?php

namespace App\Tests;

use App\Entity\File;
use App\Entity\Group;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\NullOutput;

abstract class ApiTestCase extends WebTestCase
{
    protected $em;
    protected $client;
    protected $firstUser;
    protected $firstGroup;

    public function setUp(): void
    {
        $this->standardSetUp();
    }

    public function tearDown(): void
    {
        $this->standardTearDown();
    }

    /*
     * Sets the standard initialization set of data
     */
    public function standardSetUp()
    {
        $this->client = static::createClient();
        self::bootKernel();

        $application = new Application(static::$kernel);
        $application->setAutoExit(false);

        // Remove existing test db
        $application->run(new ArrayInput([
            "command" => "zusam:init",
            "user" => "zusam",
            "group" => "zusam",
            "password" => "zusam",
            "--seed" => "zusam",
            "--remove-existing" => true,
            "--env" => "test",
        ]), new NullOutput());

        $this->em = static::$kernel->getContainer()->get('doctrine')->getManager();

        $this->firstUser = $this->em->getRepository(User::class)->findOneByLogin("zusam");
        $this->firstGroup = $this->em->getRepository(Group::class)->findOneByName("zusam");
    }

    public function standardTearDown()
    {
        parent::tearDown();
        $this->em->close();
        $this->em = null;
        $this->client = null;
        gc_collect_cycles();
    }

    public function addFile(string $pathToFile)
    {
        if (!file_exists($pathToFile)) {
            throw \Exception("File does not exists: ".$pathToFile);
        }
        $safeName = uniqid("testfile", true);
        $ext = pathinfo($pathToFile, PATHINFO_EXTENSION);
        $target = self::$container->getParameter("dir.files")."/".$safeName.".".$ext;
        if (!copy($pathToFile, $target)) {
            throw \Exception("Failed to copy to: ".$target);
        }

        $file = new File();
        $file->setType(mime_content_type($pathToFile));
        $file->setContentUrl($safeName.".".$ext);
        $file->setSize(filesize($pathToFile));
        $this->em->persist($file);
        $this->em->flush();
        return $file->getId();
    }
}
