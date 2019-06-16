<?php

namespace App\Service;

use App\Entity\Log;
use Doctrine\ORM\EntityManagerInterface;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\Logger as MonologLogger;

class Logger extends AbstractProcessingHandler
{
	private $em;

	public function __construct(EntityManagerInterface $em, int $level = MonologLogger::DEBUG, bool $bubble = true) {
		parent::__construct($level, $bubble);
		$this->em = $em;
	}

	protected function write(array $record): void
	{
		$log = new Log();

		if (isset($record["message"])) {
			$log->setMessage($record["message"]);
		}
		if (isset($record["channel"])) {
			$log->setChannel($record["channel"]);
		}
		if (isset($record["level"])) {
			$log->setLevel($record["level"]);
		}
		if (isset($record["levelName"])) {
			$log->setLevelName($record["levelName"]);
		}
		if (isset($record["extra"])) {
			$log->setExtra($record["extra"]);
		}
		if (isset($record["context"])) {
			$log->setContext($record["context"]);
		}

		$this->em->persist($log);
		$this->em->flush();
	}
}
