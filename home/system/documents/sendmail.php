<?php
/*
	見積書、注文確定のメール送信
	charset UTF-8
*/
	session_cache_limiter('nocache');
	require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';
	//define('_TAX', 0.05);
	
	if(isset($_POST['doctype'], $_POST['data']) ) {
		
		try{
			require_once dirname(__FILE__).'/../php_libs/config.php';
			require_once dirname(__FILE__).'/../php_libs/orders.php';
			require_once dirname(__FILE__).'/../php_libs/catalog.php';
			require_once dirname(__FILE__).'/../php_libs/estimate.php';
			require_once dirname(__FILE__).'/../php_libs/jd/japaneseDate.php';
			require_once dirname(__FILE__).'/../php_libs/phonedata.php';
			require_once dirname(__FILE__).'/../php_libs/http.php';
//			require_once dirname(__FILE__).'/../php_libs/member/TLAmember.php';

			/* 2011/4/1 保留
			define(_ORDER_COMPLETED, "https://takahama428.com/ordercompleted.php");
			*/

			$DB = new Orders();
			$catalog = new Catalog();
			$jd = new japaneseDate();
			$estimate = new Estimate();
			
			$isNotRegistForTLA = $_POST['data'][0];	// TLAメンバー登録の有無　0(default)：登録する　1：登録なし
			$doctype = htmlspecialchars($_POST['doctype'], ENT_QUOTES);
			$orders_id = htmlspecialchars($_POST['data'][1], ENT_QUOTES);
			$printform = $DB->db('search', 'printform', array('orders_id'=>$orders_id));
			if(empty($printform)) exit('ERROR: No such printform data exists');
			$orders = $printform[0];
			$curdate = $orders['schedule2'];	// 注文確定日
			
			// 消費税
			$_TAX = $catalog->getSalesTax($orders['schedule3'], $orders['ordertype']);
			$_TAX /= 100;
			
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
			
			
			// 顧客番号
			if(!empty($orders['number'])){
				if($orders['cstprefix']=='g'){
					$customer_num = 'G'.sprintf('%04d', $orders['number']);
				}else{
					$customer_num = 'K'.sprintf('%06d', $orders['number']);
				}
			}
			
			// 担当者
			$staff = $orders['staffname'];

			// 割引種類
			if(empty($_POST['data'][2])){
				$discount_name = '-';
			}else{
				$discount_name = htmlspecialchars($_POST['data'][2], ENT_QUOTES, 'utf-8', true);
			}

			// 追加メッセージ
			if(!empty($_POST['data'][3])){
				$add_msg = htmlspecialchars($_POST['data'][3], ENT_QUOTES, 'utf-8', true);
			}

			// 一般のオプションと業者の見積詳細
			$optionfee = 0;
			if($orders['ordertype']=='general'){
				$optionfee_1 = $orders['exchinkfee']+$orders['packfee']+$orders['expressfee']+$orders['discountfee']+$orders['reductionfee']+$orders['designfee']+$orders['additionalfee'];
				$optionfee_2 = $orders['carriagefee']+$orders['codfee']+$orders['conbifee'];
				$optionfee = $optionfee_1 + $optionfee_2;

				$option_info = "\n【　オプション　】\n";
				$option_info .= "■色替え代：　　".number_format($orders['exchinkfee'])." 円\n";
				
				// 袋詰
				$pack_fee = null;
				if($orders['package_yes']==1){
					$pack_fee = 50*$orders['pack_yes_volume'];
					$option_info .= "■袋詰め代：　　".number_format($pack_fee)." 円\n";
				}
				if($orders['package_nopack']==1){
					$pack_fee = 10*$orders['pack_nopack_volume'];
					$option_info .= "■袋代：　　　　".number_format($pack_fee)." 円\n";
				}
				if(is_null($pack_fee)){
					if($orders['package_no']==1){
						$option_info .= "■袋詰め代：　　0 円\n";
					}else{
					// 旧タイプに対応
						if($orders['package']=='nopack'){
							$option_info .= "■袋代：　　　　".number_format($orders['packfee'])." 円\n";
						}else{
							$option_info .= "■袋詰め代：　　".number_format($orders['packfee'])." 円\n";
						}
					}
				}
				$option_info .= "■特急料金：　　".number_format($orders['expressfee'])." 円\n";
				$option_info .= "■デザイン代：　".number_format($orders['designfee'])." 円\n";
				$option_info .= "■割引種類：　　".$discount_name." \n";
				$option_info .= "■割引金額：　　".number_format($orders['discountfee'])." 円\n";
				$option_info .= "■値引名：　　　".$orders['reductionname']." \n";
				$option_info .= "■値引金額：　　".number_format($orders['reductionfee'])." 円\n\n";
				if(!empty($orders['additionalfee'])){
					$option_info .= "■".$orders['additionalname']."：　　".number_format($orders['additionalfee'])." 円\n\n";
				}
				$option_info .= "■オプション計：　".number_format($optionfee_1)." 円\n";
				$option_info .= "■----------------------------------------\n\n";

				$option_info .= "【　諸経費　】\n";
				$option_info .= "■送　　　料：　".number_format($orders['carriagefee'])." 円\n";
				//$option_info .= "■特別送料：　".number_format($orders['extracarryfee'])." 円\n";
				$option_info .= "■代引手数料：".number_format($orders['codfee'])." 円\n";
				$option_info .= "■コンビニ手数料：".number_format($orders['conbifee'])." 円\n";
				$option_info .= "■諸経費計：　".number_format($optionfee_2)." 円\n";
				$option_info .= "■----------------------------------------\n\n";
			}else{
				$result = $DB->db('search', 'estimatedetails', array('orders_id'=>$orders_id));
				if(!empty($result)){
					foreach($result as $key=>$val){
						$option_info .= "■".$val['addsummary']."：　　".number_format($val['addprice'])." 円\n";
						$optionfee += $val['addprice'];
					}
					$option_info .= "■----------------------------------------\n\n";
				}
			}

			/* 2011/4/1 保留
			// 注文確定するためのアドレス
			if($doctype=="estimation"){
				$hash = md5($orders_id.$orders['email'].time());
				$orderURL = _ORDER_COMPLETED."?req=".$hash."&prm=".rawurlencode($discount_name);
			}
			*/

			/*
			$baseSec = mktime(0, 0, 0, date('m'), date('d'), date('Y'));	// 基準日を秒で取得
		    $addSec = 30 * 86400;											//日数×１日の秒数
		    $targetSec = $baseSec + $addSec;
		    $expire = date("Y 年 m 月 d 日", $targetSec);					// 有効期限
		    */
		    $date = explode('-',$orders['schedule4']);
		    if($date[0]!="0000"){
			    $baseSec = mktime(0, 0, 0, $date[1], $date[2], $date[0]);
			    $fin = $jd->makeDateArray($baseSec);							// 受渡日付情報
			    $deli = $fin;													// 受渡日の曜日を取得
			    $deli['Weekname'] = mb_convert_encoding($jd->viewWeekday($fin['Weekday']),'utf-8','euc-jp');
		    }else{
		    	$deli['Weekname'] = "-";
		    }

		    $date	= explode('-',$orders['schedule2']);
		    if($date[0]!="0000"){
			    $baseSec = mktime(0, 0, 0, $date[1], $date[2], $date[0]);
			    $fin = $jd->makeDateArray($baseSec);							// 注文〆日付情報
			    $cutday = $fin;													// 注文〆日の曜日を取得
			    $cutday['Weekname'] = mb_convert_encoding($jd->viewWeekday($fin['Weekday']),'utf-8','euc-jp');
		    }else{
		    	$cutday['Weekname'] = "-";
		    }

		    $date	= explode('-',$orders['schedule3']);
		    if($date[0]!="0000"){
			    $baseSec = mktime(0, 0, 0, $date[1], $date[2]-1, $date[0]);
			    $fin = $jd->makeDateArray($baseSec);							// 振込期日情報（発送日の前営業日）
			    if( !(($fin['Weekday']>0 && $fin['Weekday']<6) && $fin['Holiday']==0) && ($baseSec<$_from_holiday || $_to_holiday<$baseSec) ){
				    $isHoliday = true;
				    $one_day = -86400;
				    while($isHoliday){
						$baseSec += $one_day;
						$fin = $jd->makeDateArray($baseSec);
						if( (($fin['Weekday']>0 && $fin['Weekday']<6) && $fin['Holiday']==0) && ($baseSec<$_from_holiday || $_to_holiday<$baseSec) ){
							$isHoliday = false;
						}
					}
			    }
			    $expire = $fin;													// 振込期日の曜日を取得
			    $expire['Weekname'] = mb_convert_encoding($jd->viewWeekday($fin['Weekday']),'utf-8','euc-jp');
		    }else{
		    	$expire['Weekname'] = "-";
		    }

		    $customer_name = $orders['customername'];
			$letter_name = $customer_name."　　様";
			if($orders['ordertype']=='general'){
		    	if(!empty($orders['company'])){
			    	$nameis = "■会社名：　".$orders['customername']."　様\n";
			    	$nameis .= "■ご担当：　".$orders['company']."　様\n";
			    	$letter_name = $orders['customername']."\n　　".$orders['company']."　　様";
				}else{
					$nameis = "■お名前：　".$orders['customername']."　様\n";
				}
			}else{
				$nameis = "■会社名：　".$orders['customername']."　御中\n";
				$letter_name = $orders['customername']."　　御中";
			}
			$zipcode = preg_replace('/^(\d{3})(\d{1,4})$/', '$1-$2', $orders['zipcode']);
			$address = $orders['addr0'].$orders['addr1'].' '.$orders['addr2'];
			$tel = PhoneData::phonemask($orders['tel']);
			$tel = $tel['c'];
			$tel2 = PhoneData::phonemask($orders['delitel']);
			$tel2 = $tel2['c'];
			//$message = $orders['order_comment'];

			$deliname = $orders['organization'];
			if(!empty($orders['agent'])) $agent = "■担当者：　".$orders['agent']."　様\n";
			if(!empty($orders['team'])) $team = "■クラス：　".$orders['team']."\n";
			if(!empty($orders['teacher'])) $teacher = "■先生：　　".$orders['teacher']."　様\n";
			$delizip = preg_replace('/^(\d{3})(\d{1,4})$/', '$1-$2', $orders['delizipcode']);
			$deliaddr = $orders['deliaddr0'].$orders['deliaddr1'].' '.$orders['deliaddr2'];

			switch($orders['payment']){
				case 'wiretransfer': $payment = '前払い（銀行振込）'; break;
				case 'cod': $payment = '代金引換'; break;
				case 'cash': $payment = '工場渡し現金払い'; break;
				case 'credit': $payment = 'カード決済'; break;
				case 'conbi': $payment = 'コンビニ決済'; break;
				default: $payment = '打合せの上';
			}

			$customer_info = "【　お客様情報　】\n";
			$customer_info .= $nameis;
			$customer_info .= "■ご住所：　〒 $zipcode\n";
			$customer_info .= "　　　　　  　$address\n";
			if(!empty($orders['addr3'])) $customer_info .= "　　　　　  　".$orders['addr3']."\n";
			if(!empty($orders['addr4'])) $customer_info .= "　　　　　  　".$orders['addr4']."\n";
			$customer_info .= "■電話番号：　$tel\n";
			$customer_info .= "■E-Mail：　".$email['pc']."\n";
			$customer_info .= "■携帯Mail：　".$email['mobile']."\n";
			$customer_info .= "■お支払方法：　$payment\n";
			$customer_info .= "■----------------------------------------\n\n";
			$customer_info .= "【　お届先情報　】\n";
			$customer_info .= "■お名前：　".$deliname."　様\n";
			$customer_info .= $agent.$team.$teacher;
			$customer_info .= "■電話番号：　$tel2\n";
			$customer_info .= "■ご住所：　〒 $delizip\n";
			$customer_info .= "　　　　　  　$deliaddr\n";
			if(!empty($orders['deliaddr3'])) $customer_info .= "　　　　　  　".$orders['deliaddr3']."\n";
			if(!empty($orders['deliaddr4'])) $customer_info .= "　　　　　  　".$orders['deliaddr4']."\n";
			$customer_info .= "■----------------------------------------\n\n";

			$count = count($printform);

			if($orders['ordertype']=='general'){
				// アイテムごとのプリント代を取得
				$print_cost = array();
				$printfee = $estimate->getEstimation($orders_id);
				$isPrint = $orders['noprint']==0? 1: 0;
				for($i=0; $i<$count; $i++){
					$val = $printform[$i];
					if($val['master_id']==0){	// その他、持込
						$cost = $val['price'];
					}else{
						/* 2014-09-22 注文商品の単価をデータベースに登録したことにより処理を変更
						if($orders['progress_id']!=4){
							if( ($val['color_id']==59 && $val['item_id']!=112) || ($val['color_id']==42 && $val['item_id']==112) ) $isWhite=1;
							else $isWhite=0;
							$cost = intval($catalog->getItemPrice($val['item_id'], $val['size_id'], $isPrint, $isWhite, $curdate), 10);
						}else{
							$cost = $val['item_cost'];
						}
						*/
						$cost = $val['item_cost'];
					}
					// プリント単価
					if($isPrint==1 && $orders['free_printfee']==0 && $orders['reuse']!=1 && !empty($val['item_printone'])){
						/*
						$print_cost[$val['item_name']]['fee'] = $printfee['item'][$val['item_id']]['fee'];
						$print_cost[$val['item_name']]['amount'] = $printfee['item'][$val['item_id']]['amount'];
						*/
						
						$print_cost[$val['item_name']]['perone'] = $val['item_printone'];
					}
					
					// 合計枚数を加算
					$tot_amount += $val['amount'];
					
					// サイズとカラーが未定の場合に対応
					if(empty($val['size_name'])) $val['size_name'] = "未定";
					if(empty($val['item_color'])){
						if(empty($val['color_name'])) $val['color_name'] = "未定";
					}else{
						$val['color_name'] = $val['item_color'];
					}
					$item_info .= "[ アイテム ]　　".$val['item_name']."\n";
					$item_info .= "[ サイズ ]　　".$val['size_name']."\n";
					$item_info .= "[ カラー ]　　".$val['color_name']."\n";
					$item_info .= "[ 枚　数 ]　　".number_format($val['amount'])." 枚\n";
					$item_info .= "[ 商品代 ]　　".number_format($cost*$val['amount'])." 円";
					$item_info .= "（".number_format($cost)."円×".number_format($val['amount'])."枚）\n";
					$item_info .= "----------------------------------------\n\n";
				}
				
				if(!empty($print_cost)){
					$item_info .= "[ 1枚あたりプリント代 ]\n";
					foreach($print_cost as $itemname=>$val){
						//$item_info .= "■".$itemname.":　　".number_format(ceil($val['fee']/$val['amount']))." 円\n";
						$item_info .= "■".$itemname.":　　".number_format($val['perone'])." 円\n";
					}
				}
				$item_info .= "\n[ プリント金額合計 ]　".number_format($orders['printfee'])." 円(".number_format($tot_amount)."枚分）\n";
				if(empty($print_cost)){
					$item_info .= "[ 1枚あたりプリント代 ]　".number_format(ceil($orders['printfee']/$tot_amount))." 円\n";
				}
				$item_info .= "■----------------------------------------\n\n";
				
				$tot_price = $orders['productfee'];
				if($isPrint==1) $tot_price += $orders['printfee'];
				$item_info .= "[ 合計枚数 ]　".number_format($tot_amount)." 枚\n";
				$item_info .= "[ 小　　計 ]　".number_format($tot_price)." 円\n";
				$item_info .= "■----------------------------------------\n\n";

				// 消費税
				if($_TAX>0){
					$sum = $tot_price+$optionfee;
					$tax = floor($sum*$_TAX);
					$totalprice = floor($sum*(1+$_TAX))+$orders['creditfee'];
				}else{
					$tax = 0;
					$totalprice = $tot_price+$optionfee+$orders['creditfee'];
				}
			}else{ // industry
				for($i=0; $i<$count; $i++){
					$subtotal = $printform[$i]['price']*$printform[$i]['amount'];
					$tot_amount += $printform[$i]['amount'];
					$tot_price += $subtotal;

					$item_info .= "[ アイテム ]　　".$printform[$i]['item_name']."\n";
					$item_info .= "[ サイズ ]　　".$printform[$i]['size_name']."\n";
					$item_info .= "[ カラー ]　　".$printform[$i]['item_color']."\n";
					$item_info .= "[ 枚　数 ]　　".number_format($printform[$i]['amount'])." 枚\n";
					$item_info .= "[ 商品代 ]　　".number_format($subtotal)." 円";
					$item_info .= "（".number_format($printform[$i]['price'])."円×".number_format($printform[$i]['amount'])."枚）\n";
					$item_info .= "----------------------------------------\n\n";
				}

				$item_info .= "[ 合計枚数 ]　".number_format($tot_amount)." 枚\n";
				$item_info .= "[ 小　　計 ]　".number_format($tot_price)." 円\n";
				$item_info .= "■----------------------------------------\n\n";
				
				$sum = $tot_price+$optionfee;
				
				// 消費税
				$tax = floor($sum*$_TAX);
				$totalprice = floor($sum*(1+$_TAX));
				
				/*
				if($orders['consumptiontax']==1){ // 内税
					$totalprice = $tot_price+$optionfee;
					$tax = $totalprice - ceil(($totalprice)/(1+$_TAX));
				}else if($orders['consumptiontax']==2){	// 外税
					$tax = ceil(($tot_price+$optionfee)*$_TAX);
					$totalprice = $tot_price+$optionfee+$tax;
				}else{
					$tax = 0;
					$totalprice = $tot_price+$optionfee;
				}
				*/
			}

			$perone = ceil( $totalprice/$tot_amount );
			
			
			switch($doctype){
				case 'estimation':
					$date = explode('-',$orders['schedule4']);
		    		if($date[0]!="0000"){
						// 配送にかかる日数
						/*
						if($orders['carriage']=='accept'){
							$cnt = 0;	// 工場渡し
						}else if(($orders['destination']==1 || $orders['destination']>=40) && $orders['carriage']=='normal'){
							$cnt = 2;
						}else{
							$cnt = 1;
						}
		
						// お届け日から発送日（平日）を逆算
						$one_day = -86400;
						$baseSec = mktime(0, 0, 0, $date[1], $date[2], $date[0]) + ($one_day*$cnt);
						
						$fin = $jd->makeDateArray($baseSec);
						while( (($fin['Weekday']==0 || $fin['Weekday']==6) || $fin['Holiday']!=0) || ($baseSec>=$_from_holiday && $_to_holiday>=$baseSec) ){
							$baseSec += $one_day;
							$fin = $jd->makeDateArray($baseSec);
						}
						$sendDay = $fin['Year'].'-'.$fin['Month'].'-'.$fin['Day'];
		
						// 発送日から注文〆日を逆算
						$cnt = 3;
						if($orders['package']=="yes") $cnt = 4;	// 袋詰めありの場合
						$cut = getDeliveryDay($baseSec, $one_day, $cnt);
						$cut['Weekname'] = mb_convert_encoding($jd->viewWeekday($cut['Weekday']),'utf-8','euc-jp');
						
						
						$baseSec = mktime(0, 0, 0, $fin['Month'], $fin['Day'], $fin['Year']);
						$baseDay = $fin['Year'].'-'.$fin['Month'].'-'.$fin['Day'];
						
						// 現在のタイムスタンプを取得、午後(13:00)の場合は翌日扱い
						$time_stamp = time()+46800;
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
							$baseDay = $fin['Year'].'-'.$fin['Month'].'-'.$fin['Day'];
						}
						*/
						
						if($orders['ordertype']=='general'){
							$msg1 = "◆納期希望日：".$deli['Month']."月".$deli['Day']."日（".$deli['Weekname']."）　※左記納期ご注文締切日：".$cutday['Month']."月".$cutday['Day']."日（".$cutday['Weekname']."）午前中まで\n";
							$msg1 .= "※締め切りを過ぎますと特急料金での対応となります。\n\n";
						}else{
							$msg1 = "◆納期予定日：".$deli['Month']."月".$deli['Day']."日（".$deli['Weekname']."）\n\n";
						}
						
					}else{
						if($orders['ordertype']=='general'){
							$msg1 = "◆納期希望日：未定\n\n";
						}else{
							$msg1 = "◆納期予定日：未定\n\n";
						}
					}
					
					$item_title = "\n【　お見積内容　】\n\n";
					$mail_subject = 'お見積り書送付のご案内';
					$total = "　お見積り金額：　　".number_format($totalprice)." 円（税込）";
					$doc_title = "【　御　見　積　書　】\n\n";
					$doc_title .= $letter_name."\n\n";
					$doc_title .= "この度はお見積もりのご依頼ありがとうございます。\n";
					
					if($orders['ordertype']=='general'){
						$doc_title .= "タカハマライフアートでございます。\n\n";
						$doc_title .= $msg1;
						$doc_title .= "　〈〈まだご注文は完了しておりません〉〉\n";
					}else{
						$doc_title .= $msg1;
					}

					$doc_title .= "========================================\n";
					$doc_title .= $total."\n";
					$doc_title .= "========================================\n\n";
					
					if($orders['ordertype']=='general'){
						$doc_title .= "※詳細により金額が変わる可能性がございます。\n";
						$doc_title .= "注文を完了するには、必ずお電話にてのお打ち合わせと最終確認を必要とさせて頂いております。\n";
						$doc_title .= "お手数ですが、フリーダイヤル "._TOLL_FREE." までご連絡下さい。\n\n";
						$doc_title .= "もしくは、ご都合の良い時間帯をお知らせいただければ、こちらからお電話させていただきます。\n\n";
						
						$doc_title .= "なお、誠に恐縮ですが、弊社の営業時間内（10:00〜18:00、土日祝日を除く）での対応とさせていただいておりますので、\n";
						$doc_title .= "ご承知おきいただきますよう、お願いいたします。\n\n";
						
						$doc_title .= "下記をご参照の上、メールまたはFAXでデザインのご入稿をお願いいたします。\n";
						$doc_title .= "【　https://www.takahama428.com/design/designguide.html　】\n\n";
						
					}
					
					
					// 休業の告知文を挿入
					$doc_title .= _NOTICE_HOLIDAY;
					
					
					// 臨時の告知文を挿入
					$doc_title .= _EXTRA_NOTICE;
					
					if($doctype=="estimation" && time()<mktime(0,0,0,10,1,2015)){
						$doc_title .= "なお、価格改定のためお見積りの有効期限を2015/9/30注文確定分までとさせていただきます。\n\n";
					}
					
					if(!is_null($add_msg)){
						$doc_title .= $add_msg."\n";
						$doc_title .= "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n";
					}else if(empty($_POST['parm'])){
						$doc_title .= "<textarea id=\"add_message\" cols=\"50\" rows=\"4\"></textarea>";
						$doc_title .= "\n";
					}
					
					$doc_title .= "\n＜メールアドレス変更のご案内＞\n";
					$doc_title .= "弊社ではこの度メールアドレスが変更となります。\n";
					$doc_title .= "誠に恐縮ではございますが、2018年2月21日（水）以降は、下記変更後アドレスとなりますため、ご登録をお願い致します。\n";
					$doc_title .= "なお、2月20日（火）までは旧メールアドレスで送受信が可能でございます。\n";
					$doc_title .= "変更前のアドレスをご登録いただいておりますお客様には、\n";
					$doc_title .= "お早めのご変更をお願い申し上げます。\n";

					$doc_title .= "運用開始日：2018年2月21日（水）\n";
					$doc_title .= "変更前アドレス：takahamainfo@gmail.com\n";
					$doc_title .= "変更後アドレス：info@takahama428.com\n";
					
					/* 2011/4/1 保留
					$doc_title .= "\nお見積り金額でご予算とあうようでしたら、下記のページにアクセスして下さい、注文の受付が完了いたします。\n";
					$doc_title .= "───────────────────────────────────\n";
					$doc_title .= "$orderURL";
					$doc_title .= "\n───────────────────────────────────\n\n";
					*/
					
					break;

				case 'orderbank':
				case 'ordercod':
				case 'orderconbi':
				case 'ordercash':
				case 'ordercredit':
					// 受注入力で直接登録してパスワードがないユーザーに仮パスワードを設定する
					$args = array($orders['email'], $orders['customer_id']);
					$http = new HTTP(_API);
					$resp = $http->request('POST', array('act'=>'checkexistemail', 'args'=>$args));
					$customerData = unserialize($resp);
					if (!$customerData) throw new Exception("ERROR: ユーザー情報が見つかりませんでした。");
					if (empty($customerData[0]['password'])) {
						$password = substr(sha1(time().mt_rand()),0,10);
						$args = array('userid'=>$orders['customer_id'], 'pass'=>$password, 'temp'=>$password);
						$http = new HTTP(_API_U);
						$http->request('POST', array('act'=>'updatepass', 'args'=>$args));
					} else if (!empty($customerData[0]['temppass'])) {
						$password = $customerData[0]['temppass'];
					} else {
						$password = '';
					}
					
					// 送信前にTLAメンバーの登録を行う必要はない 2017/03/13
/*
					if($orders['ordertype']=='general' && !empty($_POST['parm'])){
						$tla = new TLAmember();
						$regist_data = array(
							'tla_customer_id'=>$orders['customer_id'],
							'uname'=>$orders['customername'],
							'email'=>$email['pc'],
							'agreed'=>'0',
						);
						$res = $tla->user_registration($regist_data);
						if(!is_array($res)){
							throw new Exception("ERROR: ".$res);
						}else if(isset($res['tla_customer_id'])){
							// TLAメンバーの登録でメールアドレスが重複している場合
						}
					}
*/
					// プリント位置情報
					$printinfo = array();
					$pinfo = $DB->db('search', 'printselective', array('orders_id'=>$orders_id));
					for($i=0; $i<count($pinfo); $i++){
						$printname = $pinfo[$i]['print_name'];
						$scale = $pinfo[$i]['design_size'];
						$pos = $pinfo[$i]['selective_name'];
						$ink = array();
						// シルクまたはカッティングのインク情報
						if($pinfo[$i]['print_type']=='silk' || $pinfo[$i]['print_type']=='cutting'){
							$inks = $DB->db('search', 'orderink', array('orderarea_id'=>$pinfo[$i]['areaid']));
							for($t=0; $t<count($inks); $t++){
								$ink[] = $inks[$t]['ink_name'];
							}
						}
						$printinfo[$printname][] = array('scale'=>$scale, 'ink'=>$ink, 'pos'=>$pos);
					}
					
					$deliverytime = array('', '午前中', '12-14時', '14-16時', '16-18時', '18-20時', '19-21時');
					
					$item_title = "\n【　ご注文内容　】\n\n";
					$mail_subject = 'ご注文の受付が完了いたしました※必ずご確認の程お願い申し上げます';
					$total = "　ご注文金額：　　".number_format($totalprice)." 円（税込）";
					$doc_title = "【　ご注文確定のお知らせ　】\n\n";
					$doc_title .= $letter_name."\n\n";
					$doc_title .= "この度はタカハマライフアートをご利用頂きまして誠にありがとうございます。\n";
					$doc_title .= "下記の通りご注文を承りました。ご注文内容にお間違いがないかご確認をお願いいたします。\n\n";
					$doc_title .= "========================================\n";
					$doc_title .= $total."\n";
					$doc_title .= "========================================\n\n";
					foreach($printinfo as $printname=>$info){
						for($i=0; $i<count($info); $i++){
							$doc_title .= "※".$printname.": ";
							$doc_title .= $info[$i]['pos']." ";
							if(!empty($info[$i]['ink'])){
								$doc_title .= count($info[$i]['ink'])."色（";
								$doc_title .= implode(', ', $info[$i]['ink'])."）";
							}
							if(!empty($info[$i]['scale'])) $doc_title .= "・".$info[$i]['scale'];
							$doc_title .= "\n";
						}
					}
					$doc_title .= "\n";
					$doc_title .= "◆お届け日：".$deli['Month']."月".$deli['Day']."日（".$deli['Weekname']."） ";
					if($doctype=='ordercash'){
						$doc_title .= "17:00頃（早目に仕上がった場合はご連絡いたします。）";
					}else{
						$doc_title .= $deliverytime[$orders['deliverytime']];
					}
					$doc_title .= "\n\n";
					
					if($doctype=='orderbank'){
						$doc_title .= "ご入金確認後の発送となりますので、";
						$doc_title .= $expire['Month']."月".$expire['Day']."日（".$expire['Weekname']."）午前中までに\n";
						$doc_title .= "下記弊社指定口座にお振込みをお願いいたします。\n\n";
						$doc_title .= "---------------　≪お振込み先≫　---------------\n\n";
						$doc_title .= "お振込先：　三菱東京ＵＦＪ銀行\n";
						$doc_title .= "支　　店：　新小岩支店７４４\n";
						$doc_title .= "口座番号：　普通預金　３７１６３３３\n";
						$doc_title .= "口座名義：　ユ）タカハマライフアート\n\n";
						$doc_title .= "※お振込みの際には、下記のようにお客様のお名前の前に[ ".$customer_num." ]を必ず記入して下さい。\n";
						$doc_title .= "※お手数ですがご入金完了後、電話かメールでご連絡をお願いいたします。\n\n";
						$doc_title .= "例）　 ".$customer_num." ".$customer_name."\n\n";
						$doc_title .= "------------------------------------------------\n\n";
						/* 2012-03-03 廃止
						$doc_title .= "※お早目にご入金いただいた場合は、商品が仕上がり次第発送させていただきます。（混雑時を除きます）\n";
						*/
						$doc_title .= "※お振込み手数料はお客様のご負担とさせて頂いております。\n\n";
					}else if($doctype=='ordercredit'){
						$doc_title .= "ご入金確認後の発送となりますので、";
						$doc_title .= $expire['Month']."月".$expire['Day']."日（".$expire['Weekname']."）午前中までに\n";
						$doc_title .= "下記の手順に従ってカード決済手続きをお願いいたします。\n\n";
						$doc_title .= "---------------　≪カード決済手順≫　---------------\n\n";
						if($orders['reg_site'] == 6) {
									$doc_title .= "URL：http://www.staff-tshirt.com/user/login.php\n";
						} else if($orders['reg_site'] == 5) {
									$doc_title .= "URL：http://www.sweatjack.jp/user/login.php\n";
						} else {
									$doc_title .= "URL：https://www.takahama428.com/user/login.php\n";
						}
						$doc_title .= "1. 上記のURLからマイページへログインしてください。\n";
						$doc_title .= "　※ログイン情報は下記「マイページのご利用のご案内」をご覧ください。\n";
						$doc_title .= "2. 「お支払い・制作状況」を選択し、該当する注文を選択。\n";
						$doc_title .= "3. “カード決済する”、”カード決済のお申込みはこちらから”の順にボタンを選択。\n";
						$doc_title .= "4. 画面案内に従ってお客様情報を入力してください。（STEP1〜STEP3）\n";
						$doc_title .= "5. 完了画面（STEP3）までいきましたら完了です。\n\n";
						$doc_title .= "------------------------------------------------\n\n";
					}else if($doctype=='orderconbi'){
						$doc_title .= "ご入金確認後の発送となりますので、";
						$doc_title .= $expire['Month']."月".$expire['Day']."日（".$expire['Weekname']."）午前中までに\n";
						$doc_title .= "下記の手順に従ってコンビニ決済手続きをお願いいたします。\n\n";
						$doc_title .= "---------------　≪コンビニ決済手順≫　---------------\n\n";
						if($orders['reg_site'] == 6) {
									$doc_title .= "URL：http://www.staff-tshirt.com/user/login.php\n";
						} else if($orders['reg_site'] == 5) {
									$doc_title .= "URL：http://www.sweatjack.jp/user/login.php\n";
						} else {
									$doc_title .= "URL：https://www.takahama428.com/user/login.php\n";
						}
						$doc_title .= "1. 上記のURLからマイページへログインしてください。\n";
						$doc_title .= "　※ログイン情報は下記「マイページのご利用のご案内」をご覧ください。\n";
						$doc_title .= "2. ご注文情報タブの「お支払い状況」からコンビニ決済ページへ。\n";
						$doc_title .= "3. 画面案内に従っておコンビニ決済情報を入力してください。（STEP1〜STEP3）\n";
						$doc_title .= "4. 完了画面（STEP3）までいきましたら完了です。\n\n";
						$doc_title .= "------------------------------------------------\n\n";
					}
					
					
					// 休業の告知文を挿入
					$doc_title .= _NOTICE_HOLIDAY;
					
					
					if (empty($_POST['parm'])) {
						$doc_title .= "<textarea id=\"add_message\" cols=\"50\" rows=\"4\"></textarea>";
						$doc_title .= "\n";
					}
					if ($isNotRegistForTLA==0) {
						// TLAメンバー登録しない場合は記載しない
						$doc_title .= "\n＜メールアドレス変更のご案内＞\n";
						$doc_title .= "弊社ではこの度メールアドレスが変更となります。\n";
						$doc_title .= "誠に恐縮ではございますが、2018年2月21日（水）以降は、下記変更後アドレスとなりますため、ご登録をお願い致します。\n";
						$doc_title .= "なお、2月20日（火）までは旧メールアドレスで送受信が可能でございます。\n";
						$doc_title .= "変更前のアドレスをご登録いただいておりますお客様には、\n";
						$doc_title .= "お早めのご変更をお願い申し上げます。\n";

						$doc_title .= "運用開始日：2018年2月21日（水）\n";
						$doc_title .= "変更前アドレス：takahamainfo@gmail.com\n";
						$doc_title .= "変更後アドレス：info@takahama428.com\n";
						$doc_title .= "\n=========　≪マイページのご利用のご案内≫　=========\n\n";
						
						$doc_title .= "お客様専用のマイページが\n";
						$doc_title .= "ご利用いただけるようになりましたので是非ご利用下さい！\n\n";
						
						$doc_title .= "マイページでは、製作状況がリアルタイムで確認することができ\n";
						$doc_title .= "オリジナルTシャツの作成が便利で安心してできるようになります！\n\n";
						
						if($orders['reg_site'] == 6) {
							$doc_title .= "http://www.staff-tshirt.com/user/login.php\n\n";
						} else if($orders['reg_site'] == 5) {
							$doc_title .= "http://www.sweatjack.jp/user/login.php\n\n";
						} else {
							$doc_title .= "https://www.takahama428.com/user/login.php\n\n";
						}
						$doc_title .= "上記のURLで以下のメールアドレスで入力しログインして下さい。\n";
//						$doc_title .= "※パスワードは仮発行なので、ログイン後アカウントから変更可能です\n\n";
						
						$doc_title .= "メールアドレス：".$email['pc']."\n";
						if (empty($password)) {
							$doc_title .= "パスワード：**********\n";
							$doc_title .= "※ パスワードをお忘れの場合は下記のページで再発行してください。\n";
							if($orders['reg_site'] == 6) {
								$doc_title .= "http://www.staff-tshirt.com/user/resend_pass.php\n\n";
							} else if($orders['reg_site'] == 5) {
								$doc_title .= "http://www.sweatjack.jp/user/resend_pass.php\n\n";
							} else {
								$doc_title .= "https://www.takahama428.com/user/resend_pass.php\n\n";
							}
						} else {
							$doc_title .= "仮パスワード： ".$password."\n";
							$doc_title .= "※ 仮パスワードはマイページにログインして、アカウントメニューで変更可能です。\n";
						}
						$doc_title .= "=====================================================\n\n\n";
					}
					
					if(!is_null($add_msg)){
						$doc_title .= $add_msg."\n";
						$doc_title .= "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n";
					}
					
					break;

				case 'shipped':
				/*
					$item_title = "\n【　ご注文内容　】\n\n";
					$enquiry_number = htmlspecialchars($_POST['data'][2], ENT_QUOTES);
					$total = "　お支払金額：　　".number_format($totalprice)." 円（税込）1枚当り ".number_format($perone)." 円\n";
					$mail_subject = '本日商品を発送いたしました';
					$doc_title .= $letter_name."\n\n";
					$doc_title .= "この度は、タカハマライフアートをご利用頂き誠にありがとうございました。\n";
					$doc_title .= "以下の内容で、本日商品を発送いたしました。\n\n";
					if(!empty($enquiry_number)){
						$doc_title .= "■商品の配送状況を調べるには\n\n";
						$doc_title .= "[ 配送業者 ]           ヤマト運輸（クロネコ）\n";
								$doc_title .= "[ お問い合わせ番号 ]   $enquiry_number\n";
								$doc_title .= "[ 確認用URL ]          http://toi.kuronekoyamato.co.jp/cgi-bin/tneko?init\n\n";
						$doc_title .= "上記お問い合わせ番号をコピーして確認用ページに貼り付けてください。\n";
						$doc_title .= "（出荷後すぐは、反映されていない場合があります）\n\n";
					}
					$doc_title .= "========================================\n";
					$doc_title .= $total;
					$doc_title .= "========================================\n\n";
					if(!is_null($add_msg)){
						$doc_title .= $add_msg."\n";
						$doc_title .= "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n";
					}else if(empty($_POST['parm'])){
						$doc_title .= "<textarea id=\"add_message\" cols=\"50\" rows=\"4\"></textarea>";
						$doc_title .= "\n";
					}
					break;
				*/
				default:
					$mail_subject = '';
					$doc_title = '\n\n';
			}
			
			
			$mail_contents .= $doc_title.$item_title.$item_info.$option_info;
			if($orders['ordertype']=='industry' || $_TAX>0){
				$mail_contents .= "[ 小　　計 ]　".number_format($sum)." 円\n";
				$mail_contents .= "[ 消費税 ]　　".number_format($tax)." 円\n";
			}
			if(!empty($orders['creditfee'])){
					$mail_contents .= "[ カード決済システム利用料 ]　".number_format($orders['creditfee'])." 円\n";
				}
			$mail_contents .= "[ 合　　計 ]　".number_format($totalprice)." 円\n";
			$mail_contents .= "■----------------------------------------\n\n";
			$mail_contents .= "\n========================================\n";
			$mail_contents .= $total."\n";
			$mail_contents .= "========================================\n\n";
			switch($doctype){
			case 'estimation':
				if($orders['ordertype']=='general'){
					$mail_contents .= "◆下記は注意点になります。必ずご覧ください\n\n";
					$mail_contents .= "※イメージ画像の作成は、";
					$mail_contents .= "通常納期に加えて２営業日の期間が必要となります。\n";
					$mail_contents .= "　ご注文締切日は、イメージ画像をご確認後、あらためての設定となり、\n";
					$mail_contents .= "　お伝えしている締切日が変更となる場合がありますので、ご承知おきください。\n";
					$mail_contents .= "※お支払いがお振込みの場合、振り込み手数料はお客様のご負担となります。\n";
					$mail_contents .= "※代金引換の場合は、手数料800円（税抜）のご負担となります。\n\n";
				}
				/*
				$mail_contents .= "お見積り金額でご予算とあうようでしたら、下記のページにアクセスして下さい、注文の受付が完了いたします。\n";
				$mail_contents .= "───────────────────────────────────\n";
				$mail_contents .= "$orderURL";
				$mail_contents .= "───────────────────────────────────\n\n";
				*/

				break;

			case 'orderbank':
			case 'ordercod':
			case 'orderconbi':
			case 'ordercredit':
				$mail_contents .= "┏━━━━━━━┓\n";
				$mail_contents .= "◆　　ご注意\n";
				$mail_contents .= "┗━━━━━━━┛\n";
				$mail_contents .= "・このメールをもって本発注となります。ご注文のキャンセルは出来ませのでご了承ください。\n";
				$mail_contents .= "・枚数の変更（追加やサイズ変更、数枚のキャンセル）は受付でません。\n";
				if($doctype=='ordercod'){
					$mail_contents .= "・代金引換の方は納品予定日に現金のご用意をお願いいたします。\n";
				}
				$mail_contents .= "\n";
				break;
			case 'ordercash':
				$mail_contents .= "┏━━━━━━━┓\n";
				$mail_contents .= "◆　　ご注意\n";
				$mail_contents .= "┗━━━━━━━┛\n";
				$mail_contents .= "・このメールをもって本発注となります。ご注文のキャンセルは出来ませのでご了承ください。\n";
				$mail_contents .= "・枚数の変更（追加やサイズ変更、数枚のキャンセル）は受付できません。\n";
				$mail_contents .= "・ご来社で現金払いのお客様は、お釣りのないようにご用意くださいますようご協力をお願いいたします。\n\n";
				$mail_contents .= "◆納品方法：　ご来社引き取り\n";
				$mail_contents .= "◆お支払い方法：　現金払い\n\n";
				break;
			}
			$mail_contents .= $customer_info;
			
			// 休業の告知文
			$mail_contents .= _NOTICE_HOLIDAY;
			
			$mail_contents .= "\n※ご不明な点やお気づきのことがございましたら、ご遠慮なくお問い合わせください。\n";
			$mail_contents .= "■営業時間　10:00 - 18:00　　■定休日：　土日祝\n\n";
			if($orders['reg_site'] == 6) {
				$mail_contents .= "━ スタッフTシャツ ━━━━━━━━━━━━━━━━━━━━━━━━━\n";
			} else if($orders['reg_site'] == 5) {
				$mail_contents .= "━ スウェットジャック ━━━━━━━━━━━━━━━━━━━━━━━━\n";
			} else {
				$mail_contents .= "━ タカハマライフアート ━━━━━━━━━━━━━━━━━━━━━━━\n";
			}
			if($doctype!='estimation'){
				$mail_contents .= "　担当:　".$staff."\n";
				/* 2014-01-30 業者の担当固定を廃止
				if($orders['ordertype']=='general'){
					$mail_contents .= "　担当:　".$staff."\n";
				}else{
					$mail_contents .= "　担当:　小林\n";
				}
				*/
			}
			$mail_contents .= "\n";
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

			if(empty($_POST['parm'])){
				// メール内容の確認
				$reply = str_replace("\n", "<br />", $mail_contents);
			}else if(isset($res['tla_customer_id']) && $isNotRegistForTLA==0){
				// TLAメンバーの登録でメールアドレスが重複している場合
				// isNotRegistForTLA==1 の場合は登録なしでメール送信へ
				$data = $DB->db('search', 'customer', array('customer_id'=>$res['tla_customer_id']));
				$reply = $data[0];
			}else{
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
					
					if($doctype=="estimation" && $_POST['parm']!=1){	// 2013-10-23 注文が確定している場合はステータスを変更しない
						$result = $DB->db('update', 'acceptstatus', array('orders_id'=>$orders_id, 'confirmhash'=>$hash, 'estimate'=>date("Y-m-d"), 'acceptingorder'=>"", 'progress_id'=>3));
						if(!preg_match('/^\d/',$result)) exit('ERROR: updating to the Acceptstatus table. '.$result);
						$history_subject = 1;
					}else{
						$history_subject = 2;
					}
					
					// メール送信履歴を登録
					$args = array(
						'subject'=>$history_subject,
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
				/*
				if(!send_mail($mail_subject, $mail_contents, $email, $attach)){
					$reply = 'ERROR: メールの送信が出来ませんでした。';
				}else{
					$reply = 'SUCCESS: 送信完了。';
					if($doctype=="estimation"){
						$result = $DB->db('update', 'acceptstatus', array('orders_id'=>$orders_id, 'confirmhash'=>$hash, 'estimate'=>date("Y-m-d"), 'acceptingorder'=>"", 'progress_id'=>3));
						if(!preg_match('/^\d/',$result)) exit('ERROR: updating to the Acceptstatus table. '.$result);
					}else if($doctype=="ordercompleted" ){
						$result = $DB->db('update', 'acceptstatus', array('orders_id'=>$orders_id, 'confirmhash'=>"", 'acceptingorder'=>date("Y-m-d")));
						if(!preg_match('/^\d/',$result)) exit('ERROR: updating to the Acceptstatus table. '.$result);
					}
				}
				*/
			}
		}catch (Exception $e) {
			$reply = $e->getMessage();
			if(empty($reply)) $reply = 'ERROR: メールの送信が出来ませんでした。';
		}
	}else{
		$reply = 'ERROR: 送信データがありません。';
	}
	
	if(isset($_POST['json'])){
		$json = new Services_JSON();
		$reply = $json->encode(array($reply));
		header("Content-Type: text/javascript; charset=utf-8");
	}
	echo $reply;



	/*
	*	作業に要する営業日数をカウントして発送日を返す
	*
	*	@baseSec	起算日（UNIXタイムスタンプの秒数）
	*	@one_day	一日の秒数（86400）
	*	@cnt		営業日として数える日数（通常は当日含めて３営業日）
	*
	*	return		休みではない日を返す（japaneseDataオブジェクト）
	*/
	function getDeliveryDay($baseSec, $one_day, $cnt){
		global $_from_holiday, $_to_holiday;
		$jd = new japaneseDate();
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
