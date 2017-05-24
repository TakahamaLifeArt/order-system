<?php
/*
*	Takahama Life Art
*	charset utf-8
*------------------------------------
*
*	check holiday
*	return day:holiday name
*/
	require_once dirname(__FILE__).'/config.php';
	require_once dirname(__FILE__).'/jd/japaneseDate.php';
	
	$res = "";
	if(isset($_REQUEST['datesec'])){
		$jd = new japaneseDate();
		$fin = $jd->getHolidayList($_REQUEST['datesec']);
		$mon = $jd->getMonth($_REQUEST['datesec']);
		$ext = $jd->getExtHoliday(_FROM_HOLIDAY, _TO_HOLIDAY, $mon);
		$info = array();
		if(!empty($fin)){
			foreach($fin as $key=>$val){
				$info[] = $key;
			}
		}
		if(!empty($ext)){
			for($i=0; $i<count($ext); $i++){
				$info[] = $ext[$i]['Day'];
			}
			$info = array_unique($info);
			$info = array_values($info);
		}
		$res = implode(',', $info);
	}
	echo $res;
