<?php

namespace App\Service;

use App\Entity\System as SystemEntity;
use Doctrine\ORM\EntityManagerInterface;

class System
{
    private $em;

    public function __construct (EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function set(string $key, $value)
    {
		if (!empty($system = $this->em->getRepository(SystemEntity::class)->findOneByKey($key))) {
            $system->setValue($value);
        } else {
            $system = new SystemEntity($key, $value);
        }
        $this->em->persist($system);
        $this->em->flush();
    }

    public function get(string $key)
    {
		if (!empty($system = $this->em->getRepository(SystemEntity::class)->findOneByKey($key))) {
			return $system->getValue();
		} else {
            return null;
        }
    }
}
