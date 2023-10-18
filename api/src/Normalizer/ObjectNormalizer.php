<?php

namespace App\Normalizer;

use App\Entity\ApiEntity;
use Symfony\Component\PropertyAccess\Exception\NoSuchPropertyException;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\PropertyAccess\PropertyAccessorInterface;
use Symfony\Component\PropertyInfo\PropertyTypeExtractorInterface;
use Symfony\Component\Serializer\Exception\LogicException;
use Symfony\Component\Serializer\Mapping\ClassDiscriminatorResolverInterface;
use Symfony\Component\Serializer\Mapping\Factory\ClassMetadataFactoryInterface;
use Symfony\Component\Serializer\NameConverter\NameConverterInterface;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer as SymfonyObjectNormalizer;

/**
 * Changes to Symfony's ObjectNormalizer :.
 *
 * Adds a MAX_TREE_DEPTH limitation
 * The usual objectNormalizer has a MAX_DEPTH limitation that can be used but it's
 * counting depth of objects of the same class (not global depth of the resulting tree).
 * See 4.3 implementation here:
 * https://github.com/symfony/symfony/blob/4.3/src/Symfony/Component/Serializer/Normalizer/AbstractObjectNormalizer.php#L527
 *
 * Removes the "read_me" group if we normalize a user that is not us.
 * This is done to avoid serializing objects the caller shoudn't have access to
 *
 * Returns null for non existent properties instead of throwing
 * I made this choice to be more resilient
 *
 * Returns null for properties that are API entities without id
 * I made this choice to be more resilient
 */
class ObjectNormalizer extends AbstractObjectNormalizer
{
    /**
     * How deep the resulting normalized tree can be.
     * The default value is 1.
     */
    public const TREE_DEPTH_LIMIT = 'tree_depth_limit';

    /**
     * Set to true to respect the max tree depth.
     */
    public const ENABLE_MAX_TREE_DEPTH = 'enable_max_tree_depth';

    /**
     * Handler to call when max tree depth is reached.
     *
     * If you specify no handler, a MaxTreeDepthException is thrown.
     *
     * The method will be called with ($object, $format, $context) and its
     * return value is returned as the result of the normalize call.
     */
    public const MAX_TREE_DEPTH_HANDLER = 'max_tree_depth_handler';

    /**
     * @internal
     */
    protected const TREE_DEPTH_LIMIT_COUNTERS = 'tree_depth_limit_counters';

    public function __construct(
        private SymfonyObjectNormalizer $normalizer,
    ) {
        $this->defaultContext[self::TREE_DEPTH_LIMIT] = 1;
    }

    /**
     * Detects if the configured max tree depth limit is reached.
     *
     * @param object $object
     * @param array  $context
     *
     * @return bool
     *
     * @throws MaxTreeDepthException
     */
    protected function isMaxTreeDepth($object, &$context)
    {
        $enableMaxTreeDepth = $context[self::ENABLE_MAX_TREE_DEPTH] ?? $this->defaultContext[self::ENABLE_MAX_TREE_DEPTH] ?? false;
        if (!$enableMaxTreeDepth) {
            return false;
        }
        $treeDepthLimit = $context[self::TREE_DEPTH_LIMIT] ?? $this->defaultContext[self::TREE_DEPTH_LIMIT];
        if (isset($context[self::TREE_DEPTH_LIMIT_COUNTERS])) {
            if ($context[self::TREE_DEPTH_LIMIT_COUNTERS] >= $treeDepthLimit) {
                unset($context[self::TREE_DEPTH_LIMIT_COUNTERS]);

                return true;
            }
            ++$context[self::TREE_DEPTH_LIMIT_COUNTERS];
        } else {
            $context[self::TREE_DEPTH_LIMIT_COUNTERS] = 1;
        }

        return false;
    }

    /**
     * Handles a max tree depth.
     *
     * If a max tree depth handler is set, it will be called. Otherwise, a
     * {@class MaxTreeDepthException} will be thrown.
     *
     * @param object $object
     *
     * @throws MaxTreeDepthException
     */
    protected function handleMaxTreeDepth($object, string $format = null, array $context = [])
    {
        $maxTreeDepthHandler = $context[self::MAX_TREE_DEPTH_HANDLER] ?? $this->defaultContext[self::MAX_TREE_DEPTH_HANDLER];
        if ($maxTreeDepthHandler) {
            return $maxTreeDepthHandler($object, $format, $context);
        }
        throw new MaxTreeDepthException(sprintf('Max tree depth has been reached when serializing the object of class "%s" (configured limit: %d)', \get_class($object), $this->defaultContext[self::TREE_DEPTH_LIMIT]));
    }

    public function normalize($object, $format = null, array $context = [])
    {
        if ($this->isMaxTreeDepth($object, $context)) {
            return $this->handleMaxTreeDepth($object, $format, $context);
        }

        if (!array_key_exists('groups', $context)) {
            $context['groups'] = [];
        }

        if (is_string($context['groups'])) {
            $context['groups'] = [$context['groups']];
        }

        // Remove the "read_me" group if we normalize a user that is not us.
        if ('User' === array_values(array_slice(explode('\\', get_class($object)), -1))[0]) {
            if (!isset($context['currentUser']) || $object->getId() !== $context['currentUser']) {
                $context['groups'] = array_filter($context['groups'], function ($g) {
                    return 'read_me' !== $g;
                });
            }
        }

        // Always add the '*' group
        $context['groups'][] = '*';

        return $this->normalizer->normalize($object, $format, $context);
    }

    public function supportsNormalization($data, string $format = null, array $context = []): bool
    {
        return $data instanceof ApiEntity;
    }

    public function getSupportedTypes(?string $format): array
    {
        return $this->normalizer->getSupportedTypes($format);
    }

    protected function setAttributeValue(object $object, string $attribute, mixed $value, string $format = null, array $context = [])
    {
        $this->normalizer->setAttributeValue($object, $attribute, $value, $format, $context);
    }

    protected function getAttributeValue(object $object, string $attribute, string $format = null, array $context = []): mixed
    {
        return $this->normalizer->getAttributeValue($object, $attribute, $value, $format, $context);
    }

    protected function extractAttributes(object $object, string $format = null, array $context = []): array
    {
        return $this->normalizer->extractAttributes($object, $format, $context);
    }
}
