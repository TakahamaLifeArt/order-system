<?php
require_once dirname(__FILE__).'/config.php';
require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/package/DateJa/vendor/autoload.php';
use Alesteq\DateJa\DateJa;

/*
*	発送日の計算
*	祝祭日以外の休みがある場合は、$fin['Day']==日　を指定する
*	午後(13:00)からは翌日扱いにするには、13時間の秒数分を足す　$baseSec = time()+46800;
*/

$jd = new DateJa();
$result_date = true;

$_from_holiday = strtotime(_FROM_HOLIDAY);
$_to_holiday	= strtotime(_TO_HOLIDAY);

if(isset($_POST['act'], $_POST['base'])){
	switch($_POST['act']){
	case 'ms':
		// 入稿〆・イメ画確認〆から発送日を計算
			$one_day = 86400;						// 一日の秒数
			$cnt = 3;
			if($_POST['package']=="yes") $cnt = 4;	// 袋詰めありの場合
			$baseSec = $_POST['base'];
			$fin = getDeliveryDay($baseSec, $one_day, $cnt);
			break;

	case 'send':
		// お届け日から発送日と入稿〆日を計算
			$one_day = -86400;

			// 配送にかかる日数
			if(isset($_POST['cnt'])){
				$cnt = $_POST['cnt'];
			}else{
				$cnt = 0;	// 工場渡し
			}

			// お届け日から発送日（平日）を逆算
			$baseSec = $_POST['base'] + ($one_day*$cnt);
			$fin = $jd->makeDateArray($baseSec);
			while( (($fin['Weekday']==0 || $fin['Weekday']==6) || $fin['Holiday']!=0) || ($baseSec>=$_from_holiday && $_to_holiday>=$baseSec) ){
				$baseSec += $one_day;
				$fin = $jd->makeDateArray($baseSec);
			}
			$sendDay = sprintf("%04d-%02d-%02d", $fin['Year'], $fin['Month'], $fin['Day']);

			// 発送日から入稿〆日を逆算
			$cnt = 3;
			if($_POST['package']=="yes") $cnt = 4;	// 袋詰めありの場合
			$fin = getDeliveryDay($baseSec, $one_day, $cnt);
			$baseSec = mktime(0, 0, 0, $fin['Month'], $fin['Day'], $fin['Year']);
			$baseDay = sprintf("%04d-%02d-%02d", $fin['Year'], $fin['Month'], $fin['Day']);

			// 現在のタイムスタンプを取得、午後(13:00)の場合は翌日扱い
			$time_stamp = time()+(60*60*11);
			$year  = date("Y", $time_stamp);
			$month = date("m", $time_stamp);
			$day   = date("d", $time_stamp);
			$today = mktime(0, 0, 0, $month, $day, $year);

			// 発送日が現在よりも前になる場合は当日（午前中）に変更
			if($baseSec<$today){
				$fin = $jd->makeDateArray($today);
				while( (($fin['Weekday']==0 || $fin['Weekday']==6) || $fin['Holiday']!=0) || ($today>=$_from_holiday && $_to_holiday>=$today) ){
					$today += 86400;
					$fin = $jd->makeDateArray($today);
				}
				$baseDay = sprintf("%04d-%02d-%02d", $fin['Year'], $fin['Month'], $fin['Day']);
			}

			echo $sendDay.','.$baseDay;
			exit(0);
			break;

	case 'works':
			$one_day = 86400;
			$baseSec = $_POST['base']+$one_day;
			$workday1 = 0;
			$workday2 = 0;

			if(isset($_POST['deli'])){
			/*
			*	入稿〆とお届け日を除いた営業日数
			*/
				$deliSec = $_POST['deli'];
				$fin = $jd->makeDateArray($baseSec);
				if($baseSec>$deliSec){
					$workday1 = -1;
				}else{
					while( $baseSec < $deliSec ){
						if( (($fin['Weekday']>0 && $fin['Weekday']<6) && $fin['Holiday']==0) && ($baseSec<$_from_holiday || $_to_holiday<$baseSec) ){
							$workday1++;
						}
						$baseSec += $one_day;
						$fin = $jd->makeDateArray($baseSec);
					}
				}
			}

			if(isset($_POST['send'])){
			/*
			*	製作日数
			*	入稿〆日から発送日の前日までの営業日
			*/
				$today = $_POST['base'];
				$sendSec = $_POST['send'];
				if($today>$sendSec){
					$workday2 = -1;
				}else{
					$fin = $jd->makeDateArray($today);
					while( $today < $sendSec ){
						if( (($fin['Weekday']>0 && $fin['Weekday']<6) && $fin['Holiday']==0) && ($today<$_from_holiday || $_to_holiday<$today) ){
							$workday2++;
						}
						$today += $one_day;
						$fin = $jd->makeDateArray($today);
					}
				}
			}

			$result_date = false;
			echo $workday1.','.$workday2;
			break;

	}


}

if($result_date) echo sprintf("%04d-%02d-%02d", $fin['Year'], $fin['Month'], $fin['Day']);


/*
*	作業に要する営業日数をカウントして発送日を返す
*
*	@baseSec	起算日（UNIXタイムスタンプの秒数）
*	@one_day	一日の秒数（86400）
*	@cnt		営業日として数える日数（通常は当日含めて３営業日）
*
*	return		休みではない日を発送日として返す（japaneseDataオブジェクト）
*/
function getDeliveryDay($baseSec, $one_day, $cnt){
	global $_from_holiday, $_to_holiday;
	$jd = new DateJa();
	$workday=0;
	while($workday<=$cnt){

		$fin = $jd->makeDateArray($baseSec);
		if( (($fin['Weekday']>0 && $fin['Weekday']<6) && $fin['Holiday']==0) && ($baseSec<$_from_holiday || $_to_holiday<$baseSec) ){
			$workday++;
		}
		$baseSec += $one_day;
	}

	return $fin;
}
?>