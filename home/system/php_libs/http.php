<?php
/*
*	HTTP Request
*	charset utf-8
*
*/
class HTTP {

	private $_url;

	public function __construct($args){
		$this->_url = $args;
	}

	public function request($method, $params = array(), $headers = array()){
		$url = $this->_url;
		$data = http_build_query($params);
		if ($method == 'GET') {
			$url = ($data != '')?$url.'?'.$data:$url;
		}

		$ch = curl_init($url);

		if ($method == 'POST') {
			curl_setopt($ch,CURLOPT_POST,1);
			curl_setopt($ch,CURLOPT_POSTFIELDS,$data);
		} else if ($method == 'PUT') {
			curl_setopt($ch,CURLOPT_PUT,1);
		}

		curl_setopt($ch, CURLOPT_HEADER,false); //header情報も一緒に欲しい場合はtrue
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		//		curl_setopt($ch, CURLOPT_TIMEOUT_MS, 500);
		curl_setopt($ch, CURLOPT_TIMEOUT_MS, 60000);

		if (!empty($headers)) {
			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		}

		$res = curl_exec($ch);
		//ステータスをチェック
		$respons = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		if(preg_match("/^(400|401|403|404|405|500)$/",$respons)){
			return 'HTTP error: '.$respons;
		}

		return $res;
	}
	
	
	public function setURL($url){
		$this->_url = $url;
	}
	
	
	/**
	 * cURLセッションを実行
	 * REST API 用
	 * @param {string} method HTTPメソッド{@code GET | POST | PUT | DELET} 
	 * @param {string} param POST送信情報、JSON形式の文字列
	 * @param {array} header HTTPヘッダーフィールドの配列、{@code 'Content-Type: application/json'}は必須
	 * @return {boolean|string} 成功した場合はJSON形式の文字列
	 * 							失敗した場合はエラーメッセージ
	 */
	public function requestRest($method, $param="", $header = array())
	{
		$method = strtoupper($method);
		$ch = curl_init($this->_url);
		curl_setopt_array(
			$ch, 
			array(
				CURLOPT_RETURNTRANSFER => TRUE,
				CURLOPT_TIMEOUT => 60,
				CURLOPT_CUSTOMREQUEST => $method,
				CURLOPT_POSTFIELDS => $param,
				CURLOPT_HTTPHEADER => $header
			)
		);

		$response = curl_exec($ch);
		$err = curl_error($ch);

		if ($err) {
			$res = "Error: " . $err;
		} else {
			switch ($http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE)) {
				case 200:
//					if ($method != 'GET') {
//						$res = TRUE;
//					} else {
//						$res = $response;
//					}
					$res = $response;
					break;
				default:
					$res = 'Unexpected HTTP code: ' . $http_code . '. Messeage: '.$response;
			}
		}

		curl_close($ch);
		return $res;
	}
}
?>
