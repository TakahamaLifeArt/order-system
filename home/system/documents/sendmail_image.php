<?php
/*
	見積書、注文確定のメール送信
	charset UTF-8
*/

	session_cache_limiter('nocache');
	require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';
	
	if(isset($_POST['doctype'], $_POST['data']) ) {
		
		try{
			require_once dirname(__FILE__).'/../php_libs/config.php';
			require_once dirname(__FILE__).'/../php_libs/orders.php';

			$DB = new Orders();
			
			$doctype = htmlspecialchars($_POST['doctype'], ENT_QUOTES);
			$orders_id = htmlspecialchars($_POST['data'][0], ENT_QUOTES);
			$printform = $DB->db('search', 'printform', array('orders_id'=>$orders_id));
			if(empty($printform)) exit('ERROR: No such printform data exists');
			$orders = $printform[0];
			
			$email = array();
			if(!empty($orders['email'])){
				if( preg_match('/@/', $orders['email'] )){
					$email['pc'] = $orders['email'];
					$adr[] = $orders['email'];
				}
			}
			if(!empty($orders['mobmail'])){
				if( preg_match('/@/', $orders['mobmail'] )){
					$email['mobile'] = $orders['mobmail'];
					$adr[] = $orders['mobmail'];
				}
			}
			if(empty($email)){
				exit("ERROR: メールアドレスを確認して下さい。");
			}
			
			
	    $customer_name = $orders['customername'];
			$letter_name = $customer_name."　　様";
			$mail_subject = 'イメージ画像のご案内';

			
			$mail_contents = $letter_name;
			$mail_contents .= "\n";
			$mail_contents .= "\n";
			$mail_contents .= "イメージ画像は作成完了しましたので、マイページでご確認お願いいたします。\n";
			$mail_contents .= "※注文確定後のため、制作したイメージ画像の変更はできません。ご了承ください。\n";
			$mail_contents .= "\n";
			$mail_contents .= "\n";
			$mail_contents .= "マイページ：\n";
			if($orders['reg_site'] == 6) {
						$mail_contents .= "http://www.staff-tshirt.com/user/login.php";
			} else if($orders['reg_site'] == 5) {
						$mail_contents .= "http://www.sweatjack.jp/user/login.php";
			} else {
						$mail_contents .= "https://www.takahama428.com/user/login.php";
			}
			$mail_contents .= "\n";
			$mail_contents .= "\n";
			// 休業の告知文を挿入
			$mail_contents .= _NOTICE_HOLIDAY;
					
					
			// 臨時の告知文を挿入
			$mail_contents .= _EXTRA_NOTICE;
			$mail_contents .= "\n";
			if($orders['reg_site'] == 6) {
				$mail_contents .= "━ スタッフTシャツ ━━━━━━━━━━━━━━━━━━━━━━━\n";
			} else if($orders['reg_site'] == 5) {
				$mail_contents .= "━ スウェットジャック ━━━━━━━━━━━━━━━━━━━━━━\n";
			} else {
				$mail_contents .= "━ タカハマライフアート ━━━━━━━━━━━━━━━━━━━━━\n";
			}
			$mail_contents .= "　Phone：　　"._OFFICE_TEL."\n";
			$mail_contents .= "　E-Mail：　　"._INFO_EMAIL."\n";
			if($orders['reg_site'] == 6) {
				$mail_contents .= "　Web site：　http://www.staff-tshirt.com/\n";
			} else if($orders['reg_site'] == 5) {
				$mail_contents .= "　Web site：　http://www.sweatjack.jp/\n";
			} else {
				$mail_contents .= "　Web site：　https://www.takahama428.com/\n";
			}
			$mail_contents .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

			// メール送信
			$http = new HTTP('https://www.takahama428.com/v1/via_mailer.php');
			$param = array(
				'mail_subject'=>$mail_subject,
				'mail_contents'=>$mail_contents,
				'sendto'=>$adr,
				'reply'=>1
			);
			$res = $http->request('POST', $param);
			$res = unserialize($res);
			$reply = implode(',', $res);
				
			if($reply=='SUCCESS'){
				$reply .= ': 送信完了。';
			}
			if(isset($_POST['json'])){
				$json = new Services_JSON();
				$reply = $json->encode(array($reply));
				header("Content-Type: text/javascript; charset=utf-8");
			}
			echo $reply;
		}catch (Exception $e) {
			$reply = $e->getMessage();
			if(empty($reply)) $reply = 'ERROR: メールの送信が出来ませんでした。';
			echo $reply;
		}
	}	
?>
