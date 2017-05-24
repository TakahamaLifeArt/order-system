<?php
	//require_once dirname(__FILE__).'/../home/system/php_libs/conndb_holiday.php';
	//require_once dirname(__FILE__).'/../home/system/php_libs/JSON.php';
	//require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';
	//require_once dirname(__FILE__).'/JSON.php';
	require_once dirname(__FILE__).'/conndb_holiday.php';

	define('_DOMAIN', 'http://original-sweat.com');
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

	define('_API', 'http://takahamalifeart.com/v1/api');
	define('_IMG_PSS', 'http://takahamalifeart.com/weblib/img/');

  //休業終始日付、お知らせの取得
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

	//休業終始日付、お知らせ
	define('_FROM_HOLIDAY', $time_start);
	define('_TO_HOLIDAY', $time_end);

/*
	define('_FROM_HOLIDAY', '2016/12/27');		// start day of the holiday
	define('_TO_HOLIDAY', '2017/01/05');		// end day of the holiday
*/	
/*
	$_NOTICE_HOLIDAY = "\n<==========  年末年始休業のお知らせ  ==========>\n";
	$_NOTICE_HOLIDAY .= "12月27日(火)から1月5日(木)の間、休業とさせて頂きます。\n";
	$_NOTICE_HOLIDAY .= "休業期間中に頂きましたお問合せにつきましては、1月6日(金)以降対応させて頂きます。\n";
	$_NOTICE_HOLIDAY .= "お急ぎの方はご注意下さい。何卒よろしくお願い致します。\n\n";
	
	$_NOTICE_HOLIDAY = '';
*/	
	//define('_NOTICE_HOLIDAY', $_NOTICE_HOLIDAY);
	define('_NOTICE_HOLIDAY', $notice);

/*
	$_EXTRA_NOTICE = "\n\n<==========  価格改定のお知らせ  ==========>\n";
	$_EXTRA_NOTICE .= "タカハマライフアートをご利用頂きありがとうございます。\n";
	$_EXTRA_NOTICE .= "3月14日(月)より下記のブランドのアイテムが価格改定となります。\n";
	$_EXTRA_NOTICE .= "「Printstar」「glimmer」「DALUC」「AIMY」\n";
	$_EXTRA_NOTICE .= "改定前に御見積りいただいた場合でも、ご注文確定が3月14日(月)以降になりますと改定後の価格となりますのでご注意くださいませ。\n";
	$_EXTRA_NOTICE .= "※リピート注文の場合も改定後は改定価格でのご提供となりますのでご了承ください。\n";
	$_EXTRA_NOTICE .= "\n\n";

	$_EXTRA_NOTICE = '';
	
	define('_EXTRA_NOTICE', $_EXTRA_NOTICE);
*/
	define('_EXTRA_NOTICE', $extra_noitce);

?>
