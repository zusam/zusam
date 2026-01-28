<?php

namespace App\Service;

use App\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

class Mailer
{
    private $allow_email;
    private $domain;
    private $env;
    private $lang;
    private $logger;
    private $symfonyMailer;
    private $translator;
    private $twig;
    private Url $url;

    public function __construct(
        Environment $twig,
        TranslatorInterface $translator,
        string $domain,
        string $lang,
        string $allow_email,
        string $env,
        LoggerInterface $logger,
        MailerInterface $symfonyMailer,
        Url $url,
    ) {
        $this->allow_email = $allow_email;
        $this->domain = $domain;
        $this->env = $env;
        $this->lang = $lang;
        $this->logger = $logger;
        $this->symfonyMailer = $symfonyMailer;
        $this->translator = $translator;
        $this->twig = $twig;
        $this->url = $url;
    }

    public function sendNotificationEmail(User $user, array $notifications = [])
    {
        if (empty($notifications)) {
            return false;
        }
        if (empty($user->getData()['lang'])) {
            $lang = $this->lang;
        } else {
            $lang = $user->getData()['lang'];
        }
        $this->translator->setLocale($lang);

        $unsubscribe_token = Token::encode([
            'exp' => time() + 86400 * 60,
            'sub' => Token::SUB_STOP_EMAIL_NOTIFICATIONS,
        ], $user->getSecretKey());

        try {
            $email = new TemplatedEmail()
                ->subject($this->translator->trans('notification.email.subject'))
                ->from('noreply@'.$this->domain)
                ->to($user->getLogin())
                ->locale($lang)
                ->text(
                    $this->twig->render(
                        $this->getTemplatePath('notification-email', 'txt'),
                        [
                            'base_url' => $this->url->getBaseUrl(),
                            'notifications' => $notifications,
                            'user' => $user,
                            'unsubscribe_token' => $unsubscribe_token,
                        ]
                    )
                )
                ->html($this->twig->render(
                    $this->getTemplatePath('notification-email', 'html'),
                    [
                        'base_url' => $this->url->getBaseUrl(),
                        'notifications' => $notifications,
                        'user' => $user,
                        'unsubscribe_token' => $unsubscribe_token,
                    ]
                ))
            ;

            return $this->sendMail($email);
        } catch (\Exception $e) {
            $this->logger->error('Could not send email to '.$user->getLogin().'. Error: '.$e->getMessage());

            return false;
        }
    }

    public function sendPasswordReset(User $user)
    {
        if (empty($user->getData()['lang'])) {
            $lang = $this->lang;
        } else {
            $lang = $user->getData()['lang'];
        }
        $this->translator->setLocale($lang);

        // using the user's password hash as seed allows this token to be one-time usage
        $token = Token::encode([
            'exp' => time() + 86400,
            'sub' => Token::SUB_RESET_PASSWORD,
        ], $user->getPassword());

        try {
            $email = new TemplatedEmail()
                ->subject($this->translator->trans('password.reset.email.subject'))
                ->from('noreply@'.$this->domain)
                ->to($user->getLogin())
                ->locale($lang)
                ->text(
                    $this->twig->render(
                        $this->getTemplatePath('password-reset-mail', 'txt'),
                        [
                            'name' => ucfirst($user->getName()),
                            'url' => $this->url->getBaseUrl()
                            .'/password-reset'
                            .'?mail='.urlencode($user->getLogin())
                            .'&key='.$token,
                        ]
                    )
                )
                ->html(
                    $this->twig->render(
                        $this->getTemplatePath('password-reset-mail', 'html'),
                        [
                            'name' => ucfirst($user->getName()),
                            'url' => $this->url->getBaseUrl()
                                .'/password-reset'
                                .'?mail='.urlencode($user->getLogin())
                                .'&key='.$token,
                        ]
                    )
                )
            ;

            return $this->sendMail($email);
        } catch (\Exception $e) {
            $this->logger->error('Could not send email to '.$user->getLogin().'. Error: '.$e->getMessage());

            return false;
        }
    }

    private function sendMail($email)
    {
        if ('true' == $this->allow_email) {
            try {
                $this->symfonyMailer->send($email);
            } catch (\Exception $e) {
                $this->logger->error('Could not send email to '.array_key_first($email->getTo()).'. Error: '.$e->getMessage());

                return [$e->getMessage()];
            }
        }

        return true;
    }

    private function getTemplatePath(string $template, string $type): string
    {
        $templatePath = "{$template}.{$type}.twig";
        if ($this->twig->getLoader()->exists($templatePath)) {
            return $templatePath;
        }

        throw new \Exception('Could not find twig template: '.$templatePath);
    }
}
