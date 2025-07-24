<?php

namespace App\Normalizer;

use App\Entity\ApiEntity;
use App\Entity\User;
use Symfony\Component\Serializer\Exception\LogicException;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareTrait;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer as SymfonyObjectNormalizer;

/**
 * A custom normalizer that adds pre-normalization logic.
 *
 * This normalizer is designed to work with Symfony's serializer and provides
 * functionality that runs before the standard ObjectNormalizer. It is compatible
 * with Symfony versions where ObjectNormalizer is final.
 *
 * This class uses the Decorator pattern by implementing NormalizerAwareInterface,
 * allowing it to delegate the final normalization step to the main serializer chain.
 *
 * Adds a MAX_TREE_DEPTH limitation
 * The usual objectNormalizer has a MAX_DEPTH limitation that can be used but it's
 * counting depth of objects of the same class (not global depth of the resulting tree).
 * See 4.3 implementation here:
 * https://github.com/symfony/symfony/blob/4.3/src/Symfony/Component/Serializer/Normalizer/AbstractObjectNormalizer.php#L527
 *
 * Always adds the '*' serialization group to the context.
 * This is done so that it can be an universal serialization group.
 *
 * Removes the "read_me" group if we normalize a user that is not us.
 * This is done to avoid serializing objects the caller shoudn't have access to.
 *
 * Returns null for non existent properties instead of throwing.
 * I made this choice to be more resilient.
 *
 * Returns null for properties that are API entities without id.
 * I made this choice to be more resilient.
 */
class ObjectNormalizer implements NormalizerInterface, NormalizerAwareInterface
{
    use NormalizerAwareTrait;

    /**
     * A context flag to prevent infinite recursion by ensuring this normalizer
     * does not process an object it has already passed on.
     * @internal
     */
    private const ALREADY_CALLED = 'custom_object_normalizer_already_called';

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
     * Internal context key for tracking the current depth.
     * @internal
     */
    private const TREE_DEPTH_COUNTER = 'tree_depth_counter';

    /**
     * @internal
     */
    protected const TREE_DEPTH_LIMIT_COUNTERS = 'tree_depth_limit_counters';

    private array $defaultContext;

    /**
     * @param array $defaultContext Default context values for this normalizer.
     */
    public function __construct(array $defaultContext = [])
    {
        $this->defaultContext = array_merge([
            self::TREE_DEPTH_LIMIT => 1,
            self::ENABLE_MAX_TREE_DEPTH => false,
        ], $defaultContext);
    }

    /**
     * Normalizes the data after applying custom logic.
     *
     * {@inheritdoc}
     */
    public function normalize(mixed $data, ?string $format = null, array $context = []): \ArrayObject|array|string|int|float|bool|null
    {
        // 1. Check if the max depth has been reached for the current branch.
        if ($this->isMaxTreeDepth($context)) {
            return $this->handleMaxTreeDepth($data, $format, $context);
        }

        // 2. Increment depth counter for the next level of serialization.
        $context = $this->incrementTreeDepth($context);

        // 3. Prepare serialization groups.
        if (is_string($context['groups'])) {
            $context['groups'] = [$context['groups']];
        }

        // 4. Remove the "read_me" group if we normalize a user that is not the current user.
        if ($data instanceof User) {
            $isCurrentUser = isset($context['currentUser']) && $data->getId() === $context['currentUser'];
            if (!$isCurrentUser) {
                $context['groups'] = array_filter($context['groups'], fn($g) => 'read_me' !== $g);
            }
        }

        // 5. Always add the 'public' group and ensure it's unique.
        $context['groups'][] = 'public';
        $context['groups'] = array_values(array_unique($context['groups']));

        // 6. Mark as called and delegate to the main serializer.
        // The main serializer will then find the next appropriate normalizer (e.g., the built-in ObjectNormalizer).
        $context[self::ALREADY_CALLED] = true;

        return $this->normalizer->normalize($data, $format, $context);
    }


    /**
     * Detects if the configured max tree depth limit has been reached.
     *
     * @param array  $context
     *
     * @return bool
     */
    protected function isMaxTreeDepth(&$context)
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
     * @param mixed $data
     *
     * @throws MaxTreeDepthException
     */
    protected function handleMaxTreeDepth(mixed $data, ?string $format = null, array $context = [])
    {
        $maxTreeDepthHandler = $context[self::MAX_TREE_DEPTH_HANDLER] ?? $this->defaultContext[self::MAX_TREE_DEPTH_HANDLER];
        if ($maxTreeDepthHandler) {
            return $maxTreeDepthHandler($data, $format, $context);
        }
        throw new MaxTreeDepthException(sprintf('Max tree depth has been reached when serializing the data of class "%s" (configured limit: %d)', \get_class($data), $this->defaultContext[self::TREE_DEPTH_LIMIT]));
    }

    /**
     * Increments the tree depth counter in the context.
     */
    private function incrementTreeDepth(array $context): array
    {
        if ($context[self::ENABLE_MAX_TREE_DEPTH] ?? $this->defaultContext[self::ENABLE_MAX_TREE_DEPTH]) {
            $context[self::TREE_DEPTH_COUNTER] = ($context[self::TREE_DEPTH_COUNTER] ?? 0) + 1;
        }
        return $context;
    }

    public function supportsNormalization($data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof ApiEntity;
    }

    public function getSupportedTypes(?string $format): array
    {
        return $this->normalizer->getSupportedTypes($format);
    }
}
