<?php
 /**
  * HTTP Request
  * charset utf-8
  */
class HTTP2
{
    /**
     * @var string
     */
    private $url;

    /**
     * construct
     *
     * @param string  $args
     */
    public function __construct($args)
    {
        $this->url = $args;
    }

    /**
     * リクエスト
     *
     * @param string $method
     * @param array $params
     */
    public function request($method, $params = array())
    {
        $url = $this->url;
        $data = http_build_query($params);
        if ($method == 'GET') {
            $url = ($data != '') ? $url.'?'.$data : $url;
        }

        $ch = curl_init($url);

        if ($method == 'POST') {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        //curl_setopt($ch, CURLOPT_TIMEOUT, 2);
        $res = curl_exec($ch);

        //ステータスをチェック
        $respons = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if (preg_match("/^(404|403|500)$/", $respons)) {
            return false;
        }

        return $res;
    }

    /**
     * リクエスト
     *
     * @param string $method
     * @param array $params
     * @return string|bool
     */
    public function request2($method, $params = array())
    {
        $url = $this->url;
        $data = http_build_query($params);
        $header = array("Content-Type: application/x-www-form-urlencoded");
        $options = array('http' => array(
            'method' => $method,
            'header'  => implode("\r\n", $header),
        ));

        //ステータスをチェック / PHP5専用 get_headers()
        $respons = get_headers($url);
        if (preg_match("/(404|403|500)/", $respons['0'])) {
            return false;
        }

        if ($method == 'GET') {
            $url = ($data != '')?$url.'?'.$data:$url;
        } elseif ($method == 'POST') {
            $options['http']['content'] = $data;
        }
        $content = file_get_contents($url, false, stream_context_create($options));

        return $content;
    }
}
