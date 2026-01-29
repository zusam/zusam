<?php

namespace App\Tests\Command;

use App\Command\Cron;
use App\Service\System;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Lock\LockFactory;
use Symfony\Component\Lock\SharedLockInterface;

class CronTest extends TestCase
{
    private Cron $cron;
    private System $system;
    private ParameterBagInterface $params;
    private KernelInterface $kernel;
    private LoggerInterface $logger;

    /** @var array<string, mixed> Tracks System::set() calls */
    private array $systemSetCalls = [];

    /** @var array<string, mixed> Values returned by System::get() */
    private array $systemGetValues = [];

    private function buildCron(array $tasks, string $idleHours = '0-24'): Cron
    {
        $this->systemSetCalls = [];

        $this->system = $this->createMock(System::class);
        $this->system->method('get')->willReturnCallback(function (string $key) {
            return $this->systemGetValues[$key] ?? null;
        });
        $this->system->method('set')->willReturnCallback(function (string $key, $value) {
            $this->systemSetCalls[] = ['key' => $key, 'value' => $value];
        });

        $this->logger = $this->createMock(LoggerInterface::class);
        $this->kernel = $this->createMock(KernelInterface::class);
        $this->kernel->method('getBundles')->willReturn([]);
        $this->kernel->method('getBundle')->willThrowException(new \InvalidArgumentException());

        $this->params = $this->createMock(ParameterBagInterface::class);
        $this->params->method('get')->willReturnCallback(function (string $key) use ($idleHours) {
            if ('idle_hours' === $key) {
                return $idleHours;
            }
            // Return 60 as default period for all cron.* params
            return 60;
        });

        $cron = new Cron($this->logger, $this->system, $this->kernel, $this->params);

        // Override tasks via reflection
        $ref = new \ReflectionClass($cron);
        $prop = $ref->getProperty('tasks');
        $prop->setAccessible(true);
        $prop->setValue($cron, $tasks);

        // Override lockFactory with a mock that always grants locks
        $lock = $this->createMock(SharedLockInterface::class);
        $lock->method('acquire')->willReturn(true);
        $lockFactory = $this->createMock(LockFactory::class);
        $lockFactory->method('createLock')->willReturn($lock);
        $prop = $ref->getProperty('lockFactory');
        $prop->setAccessible(true);
        $prop->setValue($cron, $lockFactory);

        return $cron;
    }

    /**
     * Get the task names that were executed (based on System::set calls).
     * System::set is called with the task name before runCommand, so it's
     * a reliable proxy for execution.
     */
    private function getExecutedTaskNames(): array
    {
        $names = [];
        foreach ($this->systemSetCalls as $call) {
            // Filter out 'last_task_timestamp' and 'last_task_name' meta entries
            if ('last_task_timestamp' !== $call['key'] && 'last_task_name' !== $call['key']) {
                $names[] = $call['key'];
            }
        }

        return $names;
    }

    public function testAllTaskTypesExecuteOnFirstRun(): void
    {
        $currentHour = intval((new \DateTime())->format('H'));
        $tasks = [
            ['name' => 'task:light', 'period' => 60, 'type' => 'light'],
            ['name' => 'task:heavy', 'period' => 60, 'type' => 'heavy'],
            ['name' => 'task:always', 'period' => 60, 'type' => 'always'],
        ];

        // Idle hours include current hour so heavy tasks can run
        $cron = $this->buildCron($tasks, '0-24');
        $result = $cron->runTask();

        $this->assertTrue($result);
        $executed = $this->getExecutedTaskNames();
        $this->assertContains('task:light', $executed);
        $this->assertContains('task:heavy', $executed);
        $this->assertContains('task:always', $executed);
    }

    public function testAlwaysTasksRunEveryTime(): void
    {
        $tasks = [
            ['name' => 'task:light', 'period' => 3600, 'type' => 'light'],
            ['name' => 'task:always', 'period' => 3600, 'type' => 'always'],
        ];

        // Set last execution to very recent (should skip period-based tasks)
        $this->systemGetValues = [
            'task:light' => time() - 10,
            'task:always' => time() - 10,
        ];

        $cron = $this->buildCron($tasks);
        $cron->runTask();

        $executed = $this->getExecutedTaskNames();
        $this->assertContains('task:always', $executed);
        $this->assertNotContains('task:light', $executed);
    }

    public function testPeriodBasedScheduling(): void
    {
        $tasks = [
            ['name' => 'task:expired', 'period' => 60, 'type' => 'light'],
            ['name' => 'task:recent', 'period' => 3600, 'type' => 'light'],
            ['name' => 'task:always', 'period' => 60, 'type' => 'always'],
        ];

        $this->systemGetValues = [
            'task:expired' => time() - 120, // past its 60s period
            'task:recent' => time() - 10,   // within its 3600s period
        ];

        $cron = $this->buildCron($tasks);
        $cron->runTask();

        $executed = $this->getExecutedTaskNames();
        $this->assertContains('task:expired', $executed);
        $this->assertNotContains('task:recent', $executed);
        $this->assertContains('task:always', $executed);
    }

    public function testHeavyTasksSkippedOutsideIdleHours(): void
    {
        $currentHour = intval((new \DateTime())->format('H'));
        // Set idle hours to exclude current hour
        $excludedStart = ($currentHour + 2) % 24;
        $excludedEnd = ($currentHour + 4) % 24;
        // Make sure start < end for the range comparison
        if ($excludedStart > $excludedEnd) {
            $excludedStart = ($currentHour + 1) % 24;
            $excludedEnd = ($currentHour + 2) % 24;
            if ($excludedStart > $excludedEnd) {
                $excludedStart = 0;
                $excludedEnd = 0;
            }
        }

        $tasks = [
            ['name' => 'task:heavy', 'period' => 60, 'type' => 'heavy'],
            ['name' => 'task:light', 'period' => 60, 'type' => 'light'],
            ['name' => 'task:always', 'period' => 60, 'type' => 'always'],
        ];

        $cron = $this->buildCron($tasks, "{$excludedStart}-{$excludedEnd}");
        $cron->runTask();

        $executed = $this->getExecutedTaskNames();
        $this->assertNotContains('task:heavy', $executed);
        $this->assertContains('task:light', $executed);
        $this->assertContains('task:always', $executed);
    }

    public function testHeavyTasksRunDuringIdleHours(): void
    {
        $tasks = [
            ['name' => 'task:heavy', 'period' => 60, 'type' => 'heavy'],
        ];

        // 0-24 means all hours are idle
        $cron = $this->buildCron($tasks, '0-24');
        $cron->runTask();

        $executed = $this->getExecutedTaskNames();
        $this->assertContains('task:heavy', $executed);
    }

    public function testTasksWithoutTypeAreSkipped(): void
    {
        $tasks = [
            ['name' => 'task:notype', 'period' => 60],
            ['name' => 'task:always', 'period' => 60, 'type' => 'always'],
        ];

        $cron = $this->buildCron($tasks);
        $cron->runTask();

        $executed = $this->getExecutedTaskNames();
        $this->assertNotContains('task:notype', $executed);
        $this->assertContains('task:always', $executed);
    }

    public function testExecutionOrderMatchesTaskArrayOrder(): void
    {
        $tasks = [
            ['name' => 'task:first', 'period' => 60, 'type' => 'light'],
            ['name' => 'task:second', 'period' => 60, 'type' => 'light'],
            ['name' => 'task:third', 'period' => 60, 'type' => 'always'],
        ];

        $cron = $this->buildCron($tasks);
        $cron->runTask();

        $executed = $this->getExecutedTaskNames();
        $this->assertEquals(['task:first', 'task:second', 'task:third'], $executed);
    }

    public function testPostCausesEarlyReturn(): void
    {
        $tasks = [
            ['name' => 'task:always', 'period' => 60, 'type' => 'always'],
        ];

        $_POST = ['foo' => 'bar'];

        try {
            $cron = $this->buildCron($tasks);
            $result = $cron->runTask();

            $this->assertFalse($result);
            $executed = $this->getExecutedTaskNames();
            $this->assertEmpty($executed);
        } finally {
            $_POST = [];
        }
    }
}
