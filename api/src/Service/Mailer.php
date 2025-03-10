<?php

namespace App\Service;

use App\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class Mailer
{
    private $allow_email;
    private $domain;
    private $env;
    private $lang;
    private $logger;
    private $symfonyMailer;
    private $twig;
    private Url $url;

    public function __construct(
        \Twig\Environment $twig,
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
        $this->twig = $twig;
        $this->url = $url;
    }

    private function sendMail($email)
    {
        if ('prod' == $this->env && 'true' == $this->allow_email) {
            try {
                $this->symfonyMailer->send($email);
            } catch (\Exception $e) {
                $this->logger->error('Could not send email to '.array_key_first($email->getTo()));

                return [$e->getMessage()];
            }
        }

        return true;
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

        $unsubscribe_token = Token::encode([
            'exp' => time() + 86400 * 60,
            'sub' => Token::SUB_STOP_EMAIL_NOTIFICATIONS,
        ], $user->getSecretKey());

        $email = (new Email())
            ->subject('Zusam Notification Email')
            ->from('noreply@'.$this->domain)
            ->to($user->getLogin())
            ->text(
                $this->twig->render(
                    $this->getTemplatePath("notification-email", $lang, 'txt'),
                    [
                        'base_url' => $this->url->getBaseUrl(),
                        'notifications' => $notifications,
                        'user' => $user,
                        'unsubscribe_token' => $unsubscribe_token,
                    ]
                )
            )
            ->html($this->twig->render(
                $this->getTemplatePath("notification-email", $lang, 'html'),
                [
                    'base_url' => $this->url->getBaseUrl(),
                    'notifications' => $notifications,
                    'user' => $user,
                    'unsubscribe_token' => $unsubscribe_token,
                ]
            ))
        ;

        return $this->sendMail($email);
    }

    public function sendPasswordReset(User $user)
    {
        if (empty($user->getData()['lang'])) {
            $lang = $this->lang;
        } else {
            $lang = $user->getData()['lang'];
        }

        // using the user's password hash as seed allows this token to be one-time usage
        $token = Token::encode([
            'exp' => time() + 86400,
            'sub' => Token::SUB_RESET_PASSWORD,
        ], $user->getPassword());

        $email = (new Email())
            ->subject('Zusam Password Reset')
            ->from('noreply@'.$this->domain)
            ->to($user->getLogin())
            ->text(
                $this->twig->render(
                    $this->getTemplatePath("password-reset-mail", $lang, 'txt'),
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
                    $this->getTemplatePath("password-reset-mail", $lang, 'html'),
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
    }

    private function getTemplatePath(string $template, string $lang, string $type): string
    {
        $templatePath = "$template.$lang.$type.twig";
        $defaultTemplatePath = "$template.en_US.$type.twig";
        if ($this->twig->getLoader()->exists($templatePath)) {
            return $templatePath;
        }
        return $defaultTemplatePath;
    }
}
