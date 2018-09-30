<?php

namespace App\Service;

use App\Entity\User;

class Mailer
{
    private $swift;
    private $twig;
    private $domain;

    public function __construct(
        \Swift_Mailer $swift,
        \Twig_Environment $twig,
        $domain
    ) {
        $this->swift = $swift;
        $this->twig = $twig;
        $this->domain = $domain;
    }

    public function sendPasswordReset(User $user)
    {
        $message = (new \Swift_Message("Zusam Password Reset"))
            ->setFrom("noreply@".$this->domain)
            ->setTo($user->getLogin())
            ->setBody(
                $this->twig->render(
                    "password-reset-mail.txt.twig",
                    [
                        "name" => ucfirst($user->getName()),
                        "url" => "https://"
                            .$this->domain
                            ."/password-reset"
                            ."?mail="
                            .urlencode($user->getLogin())
                            ."&key="
                            .$user->createResetPasswordKey(),
                    ]
                ),
                "text/plain"
            )
        ;

        if (!$this->swift->send($message, $failures)) {
            return $failures;
        }
        return true;
    }
}
