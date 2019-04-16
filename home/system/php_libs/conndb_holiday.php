<?php
/*
*	
*	Cha     : utf-8
*
*/

require_once dirname(__FILE__).'/config.php';
require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';
require_once dirname(__FILE__).'/http2.php';


class Conndb_holiday extends HTTP2 {

	/*
	*	お知らせ取得
	*	@return			[]
	************************************************ extends HTTP*/

	public function __construct($args=_API){
		parent::__construct($args);
	}

	public function getHolidayinfo(){
		$res = parent::request('POST', array('act'=>'holidayinfo', 'mode'=>'r', 'site'=>_SITE));
		$data = unserialize($res);
		return $data;
	}

}

?>