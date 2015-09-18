<?php

Class Config {

	public $next_id;
	public $forum_name;
	public $password;
	
	public function initialize($forum_name, $password) {
		$this->forum_name = $forum_name;
		$this->password = $password;
		$this->next_id = 1;
	}
	
	private function fromJSON($json) {
		if($json == false) {
			return false;
		}
		$this->forum_name = $json['forum_name'];
		$this->password = $json['password'];
		$this->next_id = $json['next_id'];
	}

	public function load($location) {
		$this->fromJSON(json_decode(file_get_contents($location), true));
	}

	public function save($location) {
		$fd = fopen($location, "w");
		fwrite($fd, json_encode($this));
		fclose($fd);
	}

}







?>
