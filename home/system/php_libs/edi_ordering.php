<?php
/*
*	EDI発注
*	log		: 2014-01-09 created
*			: 2014-11-14 トムスとキャブ双方に対応
*			: 2019-05-10 HTTPSに統一
*/
	require_once 'http.php';
	if (isset($_POST['orders_id'], $_POST['maker'])) {
		if ($_POST['maker']=='toms') {
			try {
				$http = new HTTP('https://takahamalifeart.com/toms/toms_order.php');
				$param = array(
					'orders_id'=>$_POST['orders_id'],
					'deliver'=>$_POST['deliver'],
					'destination'=>$_POST['destination'],
					'saturday'=>$_POST['saturday'],
					'holiday'=>$_POST['holiday'],
				);
				$reply = $http->request('POST', $param);
			} catch (Exception $e) {
				$reply = 'ERROR: '.$e;
			}
		} else if ($_POST['maker']=='cab') {
			try {
				$http = new HTTP('https://takahamalifeart.com/cab/cab_order.php');
				$param = array(
					'orders_id'=>$_POST['orders_id'],
					'destination'=>$_POST['destination'],
					'cab_note'=>$_POST['cab_note'],
				);
				$reply = $http->request('POST', $param);
			} catch (Exception $e) {
				$reply = 'ERROR: '.$e;
			}
		}
	}
	echo $reply;
?>
