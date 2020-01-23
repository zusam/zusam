<?php

namespace App\Service;

use App\Entity\User;
use Psr\Log\LoggerInterface;

class Mailer
{
    private $swift;
    private $twig;
    private $domain;
    private $lang;
    private $logger;
    private $env;

    public function __construct(
        \Swift_Mailer $swift,
        \Twig\Environment $twig,
        $domain,
        $lang,
        string $env,
        LoggerInterface $logger
    ) {
        $this->env = $env;
        $this->swift = $swift;
        $this->twig = $twig;
        $this->domain = $domain;
        $this->lang = $lang;
        $this->logger = $logger;
    }

    private function sendMail(\Swift_Message $email)
    {
        $failures = [];
        if ('prod' == $this->env) {
            try {
                $ret = $this->swift->send($email, $failures);
                if (!$ret) {
                    $this->logger->error("Could not send email to " . array_key_first($email->getTo()));
                    return $failures;
                }
            } catch (\Exception $e) {
                $this->logger->error("Could not send email to " . array_key_first($email->getTo()));
                return [$e->getMessage()];
            }
        }

        return true;
    }

    public function sendNotificationEmail(User $user)
    {
        if (empty($user->getData()['lang'])) {
            $lang = $this->lang;
        } else {
            $lang = $user->getData()['lang'];
        }

        $unsubscribe_token = Token::encode([
            'exp' => time() + 86400 * 60,
            'sub' => Token::SUB_STOP_EMAIL_NOTIFICATIONS,
        ], $user->getSecretKey());

        $email = (new \Swift_Message('Zusam Notification Email'))
            ->setFrom('noreply@'.$this->domain)
            ->setTo($user->getLogin())
            ->setBody(
                $this->twig->render(
                    "notification-email.$lang.txt.twig",
                    [
                        'domain' => $this->domain,
                        'notifications' => $user->getNotifications()->toArray(),
                        'user' => $user,
                        'unsubscribe_token' => $unsubscribe_token,
                    ]
                ),
                'text/plain'
            )
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

        $email = (new \Swift_Message('Zusam Password Reset'))
            ->setFrom('noreply@'.$this->domain)
            ->setTo($user->getLogin())
            ->setBody(
                $this->twig->render(
                    "password-reset-mail.$lang.txt.twig",
                    [
                        'name' => ucfirst($user->getName()),
                        'url' => 'https://'
                        .$this->domain
                        .'/password-reset'
                        .'?mail='.urlencode($user->getLogin())
                        .'&key='.$token,
                    ]
                ),
                'text/plain'
            )
            ;

        return $this->sendMail($email);
    }
}
