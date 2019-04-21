<?php
require_once dirname(__FILE__).'/config.php';
require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/package/DateJa/vendor/autoload.php';
use Alesteq\DateJa\DateJa;

/*
*	ȯ�����η׻�
*	�˺����ʳ��ε٤ߤ�������ϡ�$fin['Day']==��������ꤹ��
*	���(13:00)��������������ˤ���ˤϡ�13���֤��ÿ�ʬ��­����$baseSec = time()+46800;
*/

$jd = new DateJa();
$result_date = true;

$_from_holiday = strtotime(_FROM_HOLIDAY);
$_to_holiday	= strtotime(_TO_HOLIDAY);

if(isset($_POST['act'], $_POST['base'])){
	switch($_POST['act']){
	case 'ms':
		// ���ơ���������ǧ������ȯ������׻�
			$one_day = 86400;						// �������ÿ�
			$cnt = 3;
			if($_POST['package']=="yes") $cnt = 4;	// �޵ͤᤢ��ξ��
			$baseSec = $_POST['base'];
			$fin = getDeliveryDay($baseSec, $one_day, $cnt);
			break;

	case 'send':
		// ���Ϥ�������ȯ���������ơ�����׻�
			$one_day = -86400;

			// �����ˤ���������
			if(isset($_POST['cnt'])){
				$cnt = $_POST['cnt'];
			}else{
				$cnt = 0;	// �����Ϥ�
			}

			// ���Ϥ�������ȯ������ʿ���ˤ�ջ�
			$baseSec = $_POST['base'] + ($one_day*$cnt);
			$fin = $jd->makeDateArray($baseSec);
			while( (($fin['Weekday']==0 || $fin['Weekday']==6) || $fin['Holiday']!=0) || ($baseSec>=$_from_holiday && $_to_holiday>=$baseSec) ){
				$baseSec += $one_day;
				$fin = $jd->makeDateArray($baseSec);
			}
			$sendDay = sprintf("%04d-%02d-%02d", $fin['Year'], $fin['Month'], $fin['Day']);

			// ȯ�����������ơ�����ջ�
			$cnt = 3;
			if($_POST['package']=="yes") $cnt = 4;	// �޵ͤᤢ��ξ��
			$fin = getDeliveryDay($baseSec, $one_day, $cnt);
			$baseSec = mktime(0, 0, 0, $fin['Month'], $fin['Day'], $fin['Year']);
			$baseDay = sprintf("%04d-%02d-%02d", $fin['Year'], $fin['Month'], $fin['Day']);

			// ���ߤΥ����ॹ����פ���������(13:00)�ξ�����������
			$time_stamp = time()+(60*60*11);
			$year  = date("Y", $time_stamp);
			$month = date("m", $time_stamp);
			$day   = date("d", $time_stamp);
			$today = mktime(0, 0, 0, $month, $day, $year);

			// ȯ���������ߤ������ˤʤ���������ʸ�����ˤ��ѹ�
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
			*	���ơ��Ȥ��Ϥ�����������Ķ�����
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
			*	��������
			*	���ơ�������ȯ�����������ޤǤαĶ���
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
*	��Ȥ��פ���Ķ������򥫥���Ȥ���ȯ�������֤�
*
*	@baseSec	��������UNIX�����ॹ����פ��ÿ���
*	@one_day	�������ÿ���86400��
*	@cnt		�Ķ����Ȥ��ƿ������������̾�������ޤ�ƣ��Ķ�����
*
*	return		�٤ߤǤϤʤ�����ȯ�����Ȥ����֤���japaneseData���֥������ȡ�
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