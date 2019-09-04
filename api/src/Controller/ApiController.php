<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;

abstract class ApiController extends AbstractController
{
    protected $em;
    protected $serializer;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        $this->em = $em;
        $this->serializer = $serializer;
    }

    public function serialize($object, array $groups = [])
    {
        return $this->serializer->serialize(
            $object,
            'json',
            [
                AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function ($object, $format = null, array $context = []) {
                    return \method_exists($object, 'getId') ? ['id' => $object->getId()] : null;
                },
                ObjectNormalizer::MAX_DEPTH_HANDLER => function ($object, $format = null, array $context = []) {
                    return \method_exists($object, 'getId') ? ['id' => $object->getId()] : null;
                },
                ObjectNormalizer::SKIP_NULL_VALUES => true,
                ObjectNormalizer::ENABLE_MAX_DEPTH => true,
                ObjectNormalizer::CIRCULAR_REFERENCE_LIMIT => 1, // symfony default
                ObjectNormalizer::ALLOW_EXTRA_ATTRIBUTES => true, // symfony default
                'groups' => $groups,
            ]
        );
    }
}
