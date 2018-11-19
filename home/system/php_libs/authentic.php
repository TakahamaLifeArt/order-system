<?php
final class AuthTLA{
	/**
	* ダイジェスト認証をかける
	* charset euc-jp
	*/
	public static $realm="Takahama Life Art";
	public static function digest_auth(){
		$realm=self::$realm;
		$failed_text="ユーザー認証に失敗しました";

		// ユーザ情報の取得
		$auth_list = self::getUserinfo();
		if(empty($auth_list)) die($failed_text."(Err: authentic)");

		if (!$_SERVER['PHP_AUTH_DIGEST']){
			$headers = getallheaders();
			if ($headers['Authorization']){
				$_SERVER['PHP_AUTH_DIGEST'] = $headers['Authorization'];
			}
		}

		if ($_SERVER['PHP_AUTH_DIGEST']){
			// PHP_AUTH_DIGEST 変数を精査する、データが失われている場合への対応
			$needed_parts = array(
						'nonce' => true,
						'nc' => true,
						'cnonce' => true,
						'qop' => true,
						'username' => true,
						'uri' => true,
						'response' => true
						);
			$data = array();

			$matches = array();
			preg_match_all('/(\w+)=("([^"]+)"|([a-zA-Z0-9=.\/\_-]+))/',$_SERVER['PHP_AUTH_DIGEST'],$matches,PREG_SET_ORDER);

			foreach ($matches as $m){
				if ($m[3]){
					$data[$m[1]] = $m[3];
				}else{
					$data[$m[1]] = $m[4];
				}
				unset($needed_parts[$m[1]]);
			}

			if ($needed_parts){
				$data = array();
			}

			if ($auth_list[$data['username']]['pass']){
				// 有効なレスポンスを生成する
				$A1 = md5($data['username'].':'.$realm.':'.$auth_list[$data['username']]['pass']);
				$A2 = md5($_SERVER['REQUEST_METHOD'].':'.$data['uri']);
				$valid_response = md5($A1.':'.$data['nonce'].':'.$data['nc'].':'.$data['cnonce'].':'.$data['qop'].':'.$A2);

				if ($data['response'] != $valid_response){
					unset($_SERVER['PHP_AUTH_DIGEST']);
				}else{
					return $auth_list[$data['username']]['level'];
				}
			}
		}

		//認証データが送信されているか
		header('HTTP/1.1 401 Authorization Required');
		header('WWW-Authenticate: Digest realm="'.$realm.'", nonce="'.uniqid(rand(),true).'", algorithm=MD5, qop="auth"');
		header('Content-type: text/html; charset='.mb_internal_encoding());

		die($failed_text);
	}


	/**
	* データベースからユーザ名とパスワードを取得
	*
	*/
	private static function getUserinfo(){
		try{
			$conn = db_connect();
			$sql = <<<EOS
				SELECT * FROM authentic
EOS;
			$result = exe_sql($conn, $sql);
			while($res = mysqli_fetch_array($result)){
				$rs[$res['username']] = array('pass'=>$res['password'],'level'=>$res['authlevel']);
			}
			
			/* 2017-01-06 20:00 password変更
			$timestamp = mktime(20, 0, 0, 1, 6, 2017);
			$today = time();
			if($today>$timestamp){
				$rs['sysope']['pass'] = '新パスワード';
				$rs['front']['pass'] = '新パスワード';
			}
			*/
			
		}catch(Exception $e){
			$rs = array();;
		}

		mysqli_close($conn);

		return $rs;
	}
}

if(isset($_POST['logout'])){
	unset($_SERVER['PHP_AUTH_DIGEST']);
	header('HTTP/1.1 401 Authorization Required');
	header('WWW-Authenticate: Digest realm="'.AuthTLA::$realm.'", nonce="'.uniqid(rand(),true).'", algorithm=MD5, qop="auth"');
	header('Content-type: text/html; charset='.mb_internal_encoding());
	die("ログアウトしました");
}
require_once dirname(__FILE__).'/MYDB.php';
$authenticatedUser = AuthTLA::digest_auth();
?>