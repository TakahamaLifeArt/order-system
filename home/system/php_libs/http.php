<?php
/*
*	HTTP Request
*	charset utf-8
*
*/


class HTTP {

	private $url;
	
	public function __construct($args){
		$this->url = $args;
	}

    public function request($method, $params = array()){
    	$url = $this->url;
	    $data = http_build_query($params);
	    if($method == 'GET') {
			$url = ($data != '')?$url.'?'.$data:$url;
	    }
		
	    $ch = curl_init($url);
		
	    if($method == 'POST'){
			curl_setopt($ch,CURLOPT_POST,1);
			curl_setopt($ch,CURLOPT_POSTFIELDS,$data);
	    }
		
//	    curl_setopt($ch, CURLOPT_HEADER,false); //header情報も一緒に欲しい場合はtrue
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	    //curl_setopt($ch, CURLOPT_TIMEOUT, 2);
		curl_setopt($ch, CURLOPT_TIMEOUT_MS, 60000);
	    $res = curl_exec($ch);
		
	    //ステータスをチェック
	    $respons = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	    if(preg_match("/^(404|403|500)$/",$respons)){
			return false;
	    }
		
	    return $res;
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
		$ch = curl_init($this->url);
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
	
	
	public function request2($method, $params = array()){
		$url = $this->url;
	    $data = http_build_query($params);
	    $header = Array("Content-Type: application/x-www-form-urlencoded");
	    $options = array('http' => Array(
	        'method' => $method,
	        'header'  => implode("\r\n", $header),
	    ));
	 
	    //ステータスをチェック / PHP5専用 get_headers()
	    $respons = get_headers($url);
	    if(preg_match("/(404|403|500)/",$respons['0'])){
	        return false;
	    }
	 
	    if($method == 'GET') {
	        $url = ($data != '')?$url.'?'.$data:$url;
	    }elseif($method == 'POST') {
	        $options['http']['content'] = $data;
	    }
	    $content = file_get_contents($url, false, stream_context_create($options));
	 
	    return $content;
	}
}
?>
