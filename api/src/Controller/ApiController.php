<?php

namespace App\Controller;

use App\Normalizer\ObjectNormalizer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer as SymfonyObjectNormalizer;
use Symfony\Component\Serializer\SerializerInterface;

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

    /*
     * Standard serialize method for all API controllers
     * Returns JSON and handle circular references by returning an json object with only the id
     */
    public function serialize($object, array $groups = [])
    {
        return $this->serializer->serialize(
            $object,
            'json',
            [
                ObjectNormalizer::MAX_TREE_DEPTH_HANDLER => function ($object, $format = null, array $context = []) {
                    return \method_exists($object, 'getId') ? ['id' => $object->getId()] : null;
                },
                AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function ($object, $format = null, array $context = []) {
                    return \method_exists($object, 'getId') ? ['id' => $object->getId()] : null;
                },
                SymfonyObjectNormalizer::SKIP_NULL_VALUES => true,
                SymfonyObjectNormalizer::CIRCULAR_REFERENCE_LIMIT => 1, // symfony default
                SymfonyObjectNormalizer::ALLOW_EXTRA_ATTRIBUTES => true, // symfony default
                ObjectNormalizer::ENABLE_MAX_TREE_DEPTH => true,
                ObjectNormalizer::TREE_DEPTH_LIMIT => 3,
                'groups' => $groups,
            ]
        );
    }
}
