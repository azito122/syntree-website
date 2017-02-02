<?php
include $_SERVER['DOCUMENT_ROOT'] . '/syntree/db/db-config.php';

if (!class_exists('DB')) {
	class DB {
		function __construct($dbhost,$dbuser,$dbpass,$dbname) {
			$this->db = new mysqli($dbhost,$dbuser,$dbpass,$dbname);
		}

		public function raw_query($sql) {
			return $this->db->query($sql);
		}

		public function get_user($name) {
			$sql = "SELECT * FROM user WHERE username='$name'";
			return $this->db->query($sql)->fetch_assoc();
		}

		public function create_user($id,$uname,$pass,$email,$fname,$lname) {
			$sql = "INSERT INTO user (id,username,password,email,firstname,lastname) VALUES($id,'$uname','$pass','$email','$fname','$lname')";
			echo $sql;	
			return $this->db->query($sql);
		}
	}
}

$DB = new DB($dbhost,$dbuser,$dbpass,$dbname);