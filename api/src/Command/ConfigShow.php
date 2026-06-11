<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Helper\TableSeparator;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class ConfigShow extends Command
{
    private $params;

    /**
     * Map of env-var name => Symfony parameter name (from services.yaml).
     *
     * Variables not in this map are read from $_SERVER/$_ENV directly.
     * Grouped by theme to match dev/configuration.md.
     */
    private const PARAM_GROUPS = [
        'App / features' => [
            'ALLOW_BOTS' => 'allow.bots',
            'ALLOW_IMAGE_UPLOAD' => 'allow.upload.image',
            'ALLOW_VIDEO_UPLOAD' => 'allow.upload.video',
            'ALLOW_PDF_UPLOAD' => 'allow.upload.pdf',
            'ALLOW_AUDIO_UPLOAD' => 'allow.upload.audio',
            'ALLOW_PUBLIC_LINKS' => 'allow.public.links',
            'ALLOW_CREATE_GROUP' => 'allow.create.group',
            'ALLOW_MESSAGE_REACTIONS' => 'allow.message.reactions',
            'SHOW_GROUP_INVITATION_LINKS' => 'show.group.invitation.links',
            'DEFAULT_PAGE' => 'default.page',
            'DEFAULT_NOTIFICATIONS' => 'default.notifications',
            'VERSION' => 'version',
        ],
        'Email' => [
            'ALLOW_EMAIL' => 'allow.email',
            'MAILER_DSN' => null,
            'MAILER_FROM' => null,
        ],
        'Media / cron' => [
            'CRON_CONVERT_IMAGES' => 'cron.convert.images',
            'CRON_CONVERT_VIDEO' => 'cron.convert.video',
            'NOTIFICATION_EMAILS_THROTTLING' => 'cron.notification.emails.throttling',
            'CRON_COMPRESS_GIFS' => 'cron.compress.gifs',
            'CRON_BOT_ACTIVATE' => 'cron.bot.activate',
            'CRON_CLEAN_CACHE' => 'cron.clean.cache',
            'CRON_CLEAN_NOTIFICATIONS' => 'cron.clean.notifications',
            'CRON_CLEAN_FILES' => 'cron.clean.files',
            'CRON_CLEAN_MESSAGES' => 'cron.clean.messages',
            'CRON_CLEAN_GROUPS' => 'cron.clean.groups',
            'IDLE_HOURS' => 'idle_hours',
            'VIDEO_CONVERSION_THREADS' => 'video_conversion_threads',
            'VIDEO_FORMAT_NOT_CONVERTED' => 'video_format_not_converted',
            'VIDEO_SIZE_NOT_CONVERTED' => 'video_size_not_converted',
            'MAX_TASK_LOCK_DURATION' => 'max_task_lock_duration',
            'ENABLE_TERMINATE_LISTENER' => null,
        ],
        'Paths / binaries' => [
            'FFMPEG_PATH' => 'binaries.ffmpeg',
            'GHOSTSCRIPT_PATH' => 'binaries.ghostscript',
            'dir_files' => 'dir.files',
            'dir_cache' => 'dir.cache',
            'dir_bots' => 'dir.bots',
        ],
        'URL' => [
            'PROTOCOL' => 'protocol',
            'DOMAIN' => 'domain',
            'PORT' => 'port',
            'LANG' => 'lang',
        ],
        'Framework' => [
            'APP_ENV' => 'app_env',
            'APP_SECRET' => null,
            'APP_DEBUG' => null,
            'DATABASE_URL' => 'database_url',
            'DATABASE_DRIVER' => null,
            'DATABASE_SERVER_VERSION' => null,
            'DATABASE_CHARSET' => null,
            'LOCK_DSN' => null,
            'CORS_ALLOW_ORIGIN' => null,
            'TRUSTED_PROXIES' => null,
            'TRUSTED_HOSTS' => null,
        ],
        'Container / operational' => [
            'UID' => null,
            'GID' => null,
            'DATABASE_NAME' => null,
            'SUBPATH' => null,
        ],
    ];

    /**
     * Variables whose value must never be printed, only whether they are set.
     */
    private const SECRET_VARS = ['APP_SECRET'];

    public function __construct(
        ParameterBagInterface $params,
    ) {
        parent::__construct();
        $this->params = $params;
    }

    protected function configure()
    {
        $this->setName('zusam:config:show')
            ->setDescription('Show resolved configuration values and their sources.')
            ->setHelp(
                "Dumps every configuration variable as the current process resolves it.\n\n"
                ."The \"OS Env\" column shows whether the variable exists in the real OS\n"
                ."environment (via getenv). If it does, it shadows any value in data/config\n"
                ."for CLI processes -- but FPM workers won't see it (clear_env=yes).\n\n"
                ."Use --format=json for machine-readable output (useful in tests)."
            )
            ->addOption('format', null, InputOption::VALUE_REQUIRED, 'Output format: table or json', 'table')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $format = $input->getOption('format');

        if (!in_array($format, ['table', 'json'], true)) {
            $output->writeln("<error>Unknown format \"{$format}\". Use \"table\" or \"json\".</error>");

            return Command::FAILURE;
        }

        $context = [
            'sapi' => php_sapi_name(),
            'app_env' => $_SERVER['APP_ENV'] ?? $_ENV['APP_ENV'] ?? '(unset)',
            'kernel_env' => $this->params->get('kernel.environment'),
            'debug' => (bool) ($_SERVER['APP_DEBUG'] ?? $_ENV['APP_DEBUG'] ?? false),
        ];

        $variables = [];
        foreach (self::PARAM_GROUPS as $group => $vars) {
            foreach ($vars as $envVar => $paramName) {
                $resolved = $this->redact($envVar, $this->resolveValue($envVar, $paramName));
                $osEnv = getenv($envVar);
                $inOsEnv = false !== $osEnv;

                $variables[$envVar] = [
                    'group' => $group,
                    'value' => $resolved,
                    'in_os_env' => $inOsEnv,
                    'source' => $inOsEnv ? 'os_env' : 'dotenv',
                ];
            }
        }

        if ('json' === $format) {
            $output->writeln(json_encode([
                'context' => $context,
                'variables' => $variables,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } else {
            $this->renderTable($output, $context, $variables);
        }

        return Command::SUCCESS;
    }

    /**
     * Resolve a variable's value: prefer the Symfony parameter bag, fall back
     * to $_SERVER/$_ENV, or report "(unset)".
     */
    private function resolveValue(string $envVar, ?string $paramName): string
    {
        if (null !== $paramName) {
            try {
                $val = $this->params->get($paramName);

                return is_bool($val) ? ($val ? 'true' : 'false') : (string) $val;
            } catch (\Exception $e) {
                // Parameter not found -- fall through to $_SERVER/$_ENV.
            }
        }

        return $_SERVER[$envVar] ?? $_ENV[$envVar] ?? '(unset)';
    }

    /**
     * Hide secrets: APP_SECRET entirely, passwords embedded in DSN userinfo
     * (e.g. smtp://user:pass@host becomes smtp://user:***@host). This output
     * is meant to be pasted into bug reports.
     */
    private function redact(string $envVar, string $value): string
    {
        if (in_array($envVar, self::SECRET_VARS, true)) {
            return '(unset)' === $value ? '(unset)' : '(set)';
        }

        return preg_replace('|^([a-z0-9+.-]+://[^:/@]+:)[^@]+@|i', '$1***@', $value) ?? $value;
    }

    private function renderTable(OutputInterface $output, array $context, array $variables): void
    {
        $output->writeln('');
        $output->writeln(sprintf(
            ' Context: <info>%s</info> | APP_ENV: <info>%s</info> | kernel.environment: <info>%s</info> | debug: <info>%s</info>',
            $context['sapi'],
            $context['app_env'],
            $context['kernel_env'],
            $context['debug'] ? 'true' : 'false',
        ));
        $output->writeln('');

        $table = new Table($output);
        $table->setHeaders(['Variable', 'Value', 'OS Env?', 'Source']);

        $currentGroup = null;
        foreach ($variables as $envVar => $info) {
            if ($info['group'] !== $currentGroup) {
                if (null !== $currentGroup) {
                    $table->addRow(new TableSeparator());
                }
                $currentGroup = $info['group'];
                $table->addRow([sprintf('<comment>%s</comment>', $currentGroup), '', '', '']);
            }

            $osEnvLabel = $info['in_os_env'] ? '<fg=yellow>yes</>' : 'no';
            $sourceLabel = 'os_env' === $info['source'] ? '<fg=yellow>os_env</>' : 'dotenv';

            $table->addRow([$envVar, $info['value'], $osEnvLabel, $sourceLabel]);
        }

        $table->render();
        $output->writeln('');
    }
}
