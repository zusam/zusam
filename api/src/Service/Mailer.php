<?php

namespace App\Service;

use App\Entity\User;

class Mailer
{
    private $swift;
    private $twig;
    private $domain;
    private $lang;

    public function __construct(
        \Swift_Mailer $swift,
        \Twig_Environment $twig,
        $domain,
        $lang
    ) {
        $this->swift = $swift;
        $this->twig = $twig;
        $this->domain = $domain;
        $this->lang = $lang;
    }

    public function sendNotificationEmail(User $user, array $news)
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
                        'messages' => $news,
                        'user' => $user,
                        'unsubscribe_token' => $unsubscribe_token,
                    ]
                ),
                'text/plain'
            )
        ;

        $failures = [];
        if (!$this->swift->send($email, $failures)) {
            return $failures;
        }

        return true;
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

        $failures = [];
        if (!$this->swift->send($email, $failures)) {
            return $failures;
        }

        return true;
    }
}
