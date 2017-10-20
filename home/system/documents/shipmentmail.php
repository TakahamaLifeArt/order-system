<?php
/*
*	商品を発送しましたメール
*	注文一覧画面と発送画面の「発送」チェックで自動送信
*/
	session_cache_limiter('nocache');
	
	if(isset($_POST['orders_id'])) {

		try{
			$root_path = "../";
			require_once dirname(__FILE__).'/'.$root_path.'php_libs/config.php';
			require_once dirname(__FILE__).'/'.$root_path.'php_libs/orders.php';
			require_once dirname(__FILE__).'/'.$root_path.'php_libs/jd/japaneseDate.php';

			$DB = new Orders();
			$jd = new japaneseDate();

			$orders_id = htmlspecialchars($_POST['orders_id'], ENT_QUOTES);
			$result = $DB->db('search', 'top', array('id'=>$orders_id));
			if(empty($result)) exit('ERROR: No such printform data exists');
			$orders = $result[0];

			// メールアドレス
			$email = array();
			if(!empty($orders['email'])){
				if( preg_match('/@/', $orders['email'] )) $email[] = $orders['email'];
			}
			if(!empty($orders['mobmail'])){
				if( preg_match('/@/', $orders['mobmail'] )) $email[] = $orders['mobmail'];
			}
			if(empty($email)){
				exit("ERROR: メールアドレスを確認して下さい。");
			}
			
			if(empty($orders['contact_number'])){
				exit("ERROR: お問い合わせ番号がありません。\n-------- 確認して下さい --------");
			}
			
			// 顧客ID
			if(!empty($orders['number'])){
				if($orders['cstprefix']=='g'){
					$customer_num = 'G'.sprintf('%04d', $orders['number']);
				}else{
					$customer_num = 'K'.sprintf('%06d', $orders['number']);
				}
			}
			
			// お荷物の到着予定日
			$date = explode('-',$orders['schedule4']);
			$baseSec = mktime(0, 0, 0, $date[1], $date[2], $date[0]);
		    $fin = $jd->makeDateArray($baseSec);
		    $weekname = mb_convert_encoding($jd->viewWeekday($fin['Weekday']),'utf-8','euc-jp');
			$deliverydate = $date[1]."月".$date[2]."日（".$weekname."）";
			
			// 配送業者
			switch($orders['deliver']){
				case '1':	$carrier = "佐川急便";
							$carrier_url = "http://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.jsp";
							break;
				case '2':	$carrier = "ヤマト運輸";
							$carrier_url = "http://toi.kuronekoyamato.co.jp/cgi-bin/tneko";
							break;
				default:	
			}
			
			if($orders['ordertype']!='industry'){	// 一般
				$mail_subject = '本日商品を発送いたしました';
				
				// お客様名
				if(!empty($orders['company'])){
					$customer_name .= $orders['customername']."\n　　　".$orders['company']."　　様\n\n";
				}else{
					$customer_name = $orders['customername']."　　様\n\n";
				}
				
				$mail_contents = $customer_name;
				$mail_contents .= "この度はご注文いただきありがとうございました。\n\n";
				$mail_contents .= "発送完了いたしましたので、お荷物のお問い合わせ番号をご連絡させていただきます。\n";
				$mail_contents .= "お荷物の追跡など下記のサイトをご利用くださいませ。\n";
				$mail_contents .= "なお弊社は土日祝がお休みのため、休業日はお電話などでの対応が出来ませんのでご了承ください。\n";
				$mail_contents .= "※メールの行き違いの場合は申し訳ありません。\n\n";
				
				$mail_contents .= "次回のご利用もお待ちしております。\n\n";
				
				$mail_contents .= "到着日：　".$deliverydate."\n";
				$mail_contents .= "配送業者：　".$carrier."\n";
				$mail_contents .= "問い合わせ番号：　".$orders['contact_number']."\n";
				$mail_contents .= "問い合わせ先URL：　".$carrier_url."\n\n";
			}else{	// 業者
				$mail_subject = '商品出荷のご通知';
				
				// お客様名
				if(!empty($orders['company'])){
					$customer_name .= $orders['customername']."　御中\n　　　".$orders['company']."　　様\n\n";
				}else{
					$customer_name = $orders['customername']."　　御中\n\n";
				}
				
				$mail_contents = $customer_name;
				$mail_contents .= "いつもお世話になり、ありがとうございます。\n";
				$mail_contents .= "ご注文いただきました商品を発送いたしましたので、ご連絡いたします。\n";
				$mail_contents .= "ご査収くださいますよう、よろしくお願い意申し上げます。\n\n";
				
				$mail_contents .= "到着予定日：　".$deliverydate."\n";
				$mail_contents .= "配送業者：　".$carrier."\n";
				$mail_contents .= "問い合わせ番号：　".$orders['contact_number']."\n";
				$mail_contents .= "問い合わせ先URL：　".$carrier_url."\n\n";
			}
			
			// 休業の告知文
			$mail_contents .= _NOTICE_HOLIDAY;
			
			$mail_contents .= "オリジナルＴシャツ屋　タカハマライフアート\n";
			$mail_contents .= "〒124-0025　東京都葛飾区西新小岩3-14-26\n";
			$mail_contents .= "（TEL）03-5670-0787\n";
			$mail_contents .= "（FAX）03-5670-0730\n";
			$mail_contents .= "E-mail："._INFO_EMAIL."\n";
			$mail_contents .= "URL：https://www.takahama428.com\n";
			
			
			// メール送信
			require_once dirname(__FILE__).'/../php_libs/http.php';
			$http = new HTTP('https://www.takahama428.com/v1/via_mailer.php');
			$param = array(
				'mail_subject'=>$mail_subject,
				'mail_contents'=>$mail_contents,
				'sendto'=>$email,
				'reply'=>0
			);
			$res = $http->request('POST', $param);
			$res = unserialize($res);
			$reply = implode(',', $res);
			
			if($reply=='SUCCESS'){
				$reply .= ': 送信完了。';
				
				// メール履歴を登録
				$args = array(
					'subject'=>3,
					'mailbody'=>nl2br($mail_contents),
					'mailaddr'=>$orders['email'],
					'orders_id'=>$orders_id,
					'cst_number'=>$orders['number'],
					'cst_prefix'=>$orders['cstprefix'],
					'cst_name'=>$orders['customername'],
					'sendmaildate'=>date('Y-m-d H:i:s'),
					'staff_id'=>$orders['reception']
					);
				$result = $DB->db('insert', 'mailhistory', $args);
				if(!preg_match('/^\d/',$result)) exit('ERROR: insert to the Mailhistory table. '.$result);
				
			}else{
				$reply = 'ERROR: メールの送信が出来ませんでした。\n'.$reply;
			}
			
		}catch (Exception $e) {
			$reply = 'ERROR: メールの送信が出来ませんでした。';
		}

	}else{
		$reply = 'ERROR: 送信データがありません。';
	}

	echo $reply;

?>
