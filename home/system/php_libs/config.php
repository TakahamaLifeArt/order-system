<?php
require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';
require_once dirname(__FILE__).'/conndb_holiday.php';

define('_DOMAIN', 'http://'.$_SERVER['HTTP_HOST']);
define('_ROOTNAME', 'system');
define('_SERVER_ROOT', _DOMAIN.'/'._ROOTNAME.'/');
define('_DOC_ROOT', $_SERVER['DOCUMENT_ROOT'].'/'._ROOTNAME.'/');
define('_SESS_SAVE_PATH', _DOC_ROOT.'sesstmp/');

define('_TEMP_IMAGE_PATH', 'data/temp/');

define('_GUEST_IMAGE_PATH', 'user/guest/data/img/');
define('_GUEST_TEXT_PATH', 'user/guest/data/txt/');
define('_MEMBER_IMAGE_PATH', 'user/member/data/img/');
define('_MEMBER_TEXT_PATH', 'user/member/data/txt/');
define('_ORDER_TEMP_PATH', 'user/member/data/tmp/');
define('_MAXIMUM_SIZE', 20971520);		// max upload file size is 20MB(1024*1024*20).
define('_LIMIT_MAX_WIDTH', 195);
define('_LIMIT_MAX_HEIGHT', 195);
define('_LIMIT_MIN_SIZE', 20);

define('_PRINT_MAX_WIDTH', 27);
define('_PRINT_MAX_HEIGHT', 35);
define('_PIXEL_STANDARD', 4.6);

define('_MARGIN_1', 1.6);		// 149-299枚までの仕入れ値に対する掛け率
define('_MARGIN_2', 1.35);		// 300枚以上の仕入れ値に対する掛け率

// 2021-01-28から、Tシャツとスウェットに適用
define('_APPLY_EXTRA_MARGIN', '2021-01-28');

define('_ALL_EMAIL', 'all@takahama428.com');
define('_INFO_EMAIL', 'info@takahama428.com');
define('_ORDER_EMAIL', 'order@takahama428.com');
define('_REQUEST_EMAIL', 'request@takahama428.com');
define('_ESTIMATE_EMAIL', 'estimate@takahama428.com');

define('_OFFICE_TEL', '03-5670-0787');
define('_OFFICE_FAX', '03-5670-0730');
define('_TOLL_FREE', '0120-130-428');

define('_BEGINNING_OF_PERIOD', '4');
define('_APPLY_TAX_CLASS', '2014/05/26');	// 発送日が2014-05-26以降は外税方式を適用

//識別子
define('_SITE_ID', '1,5,6');
define('_SITE_NAME', 'takahama428,sweatjack,staff-tshirt');
define('_SITE', '1');

define('_TITLE_SYSTEM', mb_convert_encoding('TLA 受注System', 'euc-jp', 'utf-8'));

// テスト環境のサブドメインを判定
if (strpos($_SERVER['HTTP_HOST'], 'test.')===false) {
	$_API_DOMAIN = 'https://takahamalifeart.com/v1';
	$_REST_DOMAIN = 'https://takahamalifeart.com/weblib/api';
} else {
	$_API_DOMAIN = 'http://test.takahamalifeart.com/v1';
	$_REST_DOMAIN = 'http://test.takahamalifeart.com/weblib/api';
}
define('_API_REST', $_REST_DOMAIN);
define('_API', $_API_DOMAIN.'/api');
define('_API_U', $_API_DOMAIN.'/apiu');
define('_IMG_PSS', 'https://takahamalifeart.com/weblib/img/');

define('_PASSWORD_SALT', 'Rxjo:akLK(SEs!8E');

// REST API
define('_ACCESS_TOKEN', 'dR7cr3cHasucetaYA8Re82xUtHuB3A7a');

// Upload API
define('_UPLOAD_ENDPOINT', 'https://takahamalifeart.com/uploader/');
define('_UPLOAD_TOKEN', 'X3J1Z2VjM2EhbHQyLVppYlI3bXV3d3cudGFrYWhhbWE0MjguY29t');

// 休業終始日付、お知らせの取得
$hol = new Conndb_holiday();
$holiday_data = $hol->getHolidayinfo();
if($holiday_data['notice']=="" && $holiday_data['notice-ext']==""){
	$notice = "";
	$extra_noitce = "";
}else{
	$notice = $holiday_data['notice'];
	$extra_noitce = $holiday_data['notice-ext'];
}
$time_start = str_replace("-","/",$holiday_data['start']);
$time_end = str_replace("-","/",$holiday_data['end']);

// 休業終始日付、お知らせ
define('_FROM_HOLIDAY', $time_start);
define('_TO_HOLIDAY', $time_end);

// 告知文
define('_NOTICE_HOLIDAY', $notice);
define('_EXTRA_NOTICE', $extra_noitce);

?>
