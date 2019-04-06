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

    public function sendWeeklyEmail(User $user)
    {
		if (empty($user->getData()["lang"])) {
			$lang = $this->lang;
		} else {
			$lang = $user->getData()["lang"];
		}

        $email = (new \Swift_Message("Zusam Weekly Email")
            ->setFrom("noreply@".$this->domain)
            ->setTo($user->getLogin())
            ->setBody(
                $this->twig->render(
                    "weekly-email.$lang.txt.twig",
                    [
                        "name" => ucfirst($user->getName()),
                        "url" => "https://".$this->domain,
                    ]
                ),
                "text/plain"
            )
        ;

        if (!$this->swift->send($email, $failures)) {
            return $failures;
        }
        return true;
    }

    public function sendPasswordReset(User $user)
    {
		if (empty($user->getData()["lang"])) {
			$lang = $this->lang;
		} else {
			$lang = $user->getData()["lang"];
		}	

        $email = (new \Swift_Message("Zusam Password Reset"))
            ->setFrom("noreply@".$this->domain)
            ->setTo($user->getLogin())
            ->setBody(
                $this->twig->render(
                    "password-reset-mail.$lang.txt.twig",
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

        if (!$this->swift->send($email, $failures)) {
            return $failures;
        }
        return true;
    }
}
