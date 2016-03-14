<?php

echo('
<form action="" method="POST">
  <script 
	  src="https://checkout.stripe.com/checkout.js" class="stripe-button"
	  data-key="pk_test_6pRNASCoBOKtIshFeQd4XMUh"
	  data-amount="500"
	  data-currecy="eur"
	  data-name="Zusam"
	  data-description="1 mois premium"
	  data-image="../Assets/ogp.png"
	  data-locale="fr">
	</script>
</form>
');
