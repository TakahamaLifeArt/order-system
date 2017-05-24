<?php
	/**
	*		SQLの接続
	*	ストアドプロシージャ使用のためマルチステートメントで接続
	*		define CLIENT_MULTI_STATEMENTS, 65536
	*/
	function db_connect(){
		$dbUser = "tlauser";
		$dbPass = "crystal428";
		$dbHost = "localhost";
		$dbName = "tladata1";
		$dbType = "mysql";

		/*
		$conn = mysql_connect("$dbHost", "$dbUser", "$dbPass", true, 65536)
			or die("MESSAGE : cannot connect!<BR>");
		 */ 
		$conn = mysqli_connect("$dbHost", "$dbUser", "$dbPass", "$dbName", true) 
			or die("MESSAGE : cannot connect!". mysqli_error());
		$conn->set_charset('utf8');
		return $conn;
	}


	/**
	*		エスケープ処理
	*/
	function quote_smart($conn, $value){
		if (!is_numeric($value)) {
			if(get_magic_quotes_gpc()) $value = stripslashes($value);
			$value = mysqli_real_escape_string($conn, $value);
		}
		return $value;
	}

	/**
	*		SQLの発行 SVNテスト
	*/
	function exe_sql($conn, $sql){
		$result = mysqli_query($conn, $sql)
			or die ('Invalid query: '.$sql.' -->> '.mysqli_error());

//if (!$result) {
//	error_log("row count=".mysqli_num_rows($result));
//} else {
//	error_log("row count=0");
//}

		return $result;
	}
?>
