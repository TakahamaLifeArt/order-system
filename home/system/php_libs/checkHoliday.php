<?php
/**
 *	Takahama Life Art
 *	charset utf-8
 *------------------------------------
 *
 *	check holiday
 *	return {array} day of the holiday
 */
require_once dirname(__FILE__).'/config.php';
require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/package/DateJa/vendor/autoload.php';
use Alesteq\DateJa\DateJa;

$res = "";
if(isset($_REQUEST['datesec'])){
	// holiday
	$jd = new DateJa();
	$fin = $jd->getHolidayList($_REQUEST['datesec']);
	$info = array();
	if(!empty($fin)){
		foreach($fin as $key=>$val){
			$info[] = $key;
		}
	}

	// extra holiday
	$thisYear = date("Y", $_REQUEST['datesec']);
	$thisMonth = date("n", $_REQUEST['datesec']);
	$curdate = str_replace("/", "-", _FROM_HOLIDAY);
	$d = explode('-', $curdate);
	if(checkdate($d[1], $d[2], $d[0])!==false){
		$startTimestamp = mktime(0, 0, 0, $d[1], $d[2]-1, $d[0]);
	}
	$curdate = str_replace("/", "-", _TO_HOLIDAY);
	$d = explode('-', $curdate);
	if(checkdate($d[1], $d[2], $d[0])!==false){
		$endTimestamp = mktime(0, 0, 0, $d[1], $d[2], $d[0]);
	}
	if (isset($startTimestamp) && isset($endTimestamp)) {
		$time_stamp = $startTimestamp;
		while ($time_stamp < $endTimestamp) {
			$time_stamp = mktime(0, 0, 0, date("m", $time_stamp), date("d", $time_stamp) + 1, date("Y", $time_stamp));
			$year = date("Y", $time_stamp);
			$month = date("n", $time_stamp);
			if ($thisYear==$year && $thisMonth==$month) {
				$ext[] = date("j", $time_stamp);
			}
		}
	}
	if(!empty($ext)){
		for($i=0; $i<count($ext); $i++){
			$info[] = $ext[$i];
		}
		$info = array_unique($info);
		$info = array_values($info);
	}

	$res = implode(',', $info);
}
echo $res;
