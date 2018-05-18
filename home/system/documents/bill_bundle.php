<?php
/*
	請求書のPDF変換と印刷処理
	charset UTF-8
*/
	//require_once $_SERVER['DOCUMENT_ROOT'].'/php_libs/config.php';
	//define('_TAX', 0.05);

	if(isset($_REQUEST['orderid'],$_REQUEST['param'])){
	
		$orders_id = 	 htmlspecialchars($_REQUEST['orderid'],ENT_QUOTES, 'utf-8', true);
		//$discount_name = htmlspecialchars($_REQUEST['param'], ENT_QUOTES);
		$root_path = "../";
		require_once dirname(__FILE__).'/'.$root_path.'php_libs/orders.php';
		require_once dirname(__FILE__).'/'.$root_path.'php_libs/catalog.php';
		$DB = new Orders();
		$catalog = new Catalog();
		
		$data = $DB->db('search', 'printform', array('orders_id'=>$orders_id));		// 受注データ取得
		if(empty($data)) exit('No such printform data exists');
		
		$discount_data = $DB->db('search', 'discount', array('orders_id'=>$orders_id));		// 複数選択可の割引情報取得
		
		$bundle_id = $DB->db('search', 'bundlecount', array('orders_id'=>$orders_id));		// 同梱する注文データ取得
		if(!empty($bundle_id)){
			for($i=0; $i<count($bundle_id); $i++){
				$bundle_data = $DB->db('search', 'printform', array('orders_id'=>$bundle_id[$i]['id']));
				if(empty($bundle_data)) continue;
				$bundle[] = $bundle_data;
			}
		}else{
			$bundle = array($data);
		}
		
		$orders = 			$data[0];
		$curdate = 			$orders['schedule2'];
		$ordertype = 		$orders['ordertype'];
		$customer_id = 		strtoupper($orders['cstprefix']).$orders['number'];
		$company = 			$orders['company'];
		$customer_name =	$orders['customername'];
		$ic = 				$orders['staffname'];
		$zipcode = 			preg_replace('/^(\d{3})(\d{1,4})$/', '$1-$2', $orders['zipcode']);
		$deli1 = 			$orders['addr0'].$orders['addr1'];
		$deli2 = 			$orders['addr2'];
		$billnote = 		$orders['billnote'];
		
		// 消費税
		$_TAX = $catalog->getSalesTax($orders['schedule3'], $ordertype);
		$_TAX /= 100;
		
		// 差出人
		$sender = '有限会社タカハマライフアート';
		$sender_zipcode = '124-0025';
		$sender_addr = '東京都葛飾区西新小岩3-14-26';
		$sender_tel = _OFFICE_TEL;
		$sender_fax = _OFFICE_FAX;
		$sender_email = _INFO_EMAIL;
		$sender_staff = $orders['staffname'];;
		
		// 別の宛名を指定しいる場合
		if(isset($_REQUEST['altname'])){
			$company = 			"";
			$customer_name =	htmlspecialchars($_REQUEST['altname'], ENT_QUOTES, 'utf-8', true);
			$zipcode = 			htmlspecialchars($_REQUEST['altzipcode'], ENT_QUOTES, 'utf-8', true);
			$deli1 = 			nl2br(htmlspecialchars($_REQUEST['altaddress'], ENT_QUOTES, 'utf-8', true));
			$deli2 = 			"";
		}
		
		// 別の差出人を指定しいる場合
		if(isset($_REQUEST['sendername'])){
			$sender = htmlspecialchars($_REQUEST['sendername'], ENT_QUOTES, 'utf-8', true);
			$sender_zipcode = htmlspecialchars($_REQUEST['senderzipcode'], ENT_QUOTES, 'utf-8', true);
			$sender_addr = htmlspecialchars($_REQUEST['senderaddress'], ENT_QUOTES, 'utf-8', true);
			$sender_tel = htmlspecialchars($_REQUEST['sendertel'], ENT_QUOTES, 'utf-8', true);
			$sender_fax = htmlspecialchars($_REQUEST['senderfax'], ENT_QUOTES, 'utf-8', true);
			$sender_email = htmlspecialchars($_REQUEST['senderemail'], ENT_QUOTES, 'utf-8', true);
			$sender_staff = htmlspecialchars($_REQUEST['senderstaff'], ENT_QUOTES, 'utf-8', true);
		}
		
		
		/* PDF変換 */
		require_once("../MPDF_6_0/mpdf.php");
		$pdf = new mPDF('ja','A4');
		$pdf->mirrorMargins = 0;
		/*
		$pdf->defaultfooterfontsize = 12;
		$pdf->defaultfooterfontstyle = B;
		*/
		
		$pdf->defaultfooterline = 1;
		$footer = array(
		'C' => array(
			'content' => 'Takahama Life Art',
			'font-style' => 'BI',
			'font-size' => '9',
			'color' => '#aaaaaa'
		),
		'line' => 0,
		);
		
		/*
		$header = array(
		'R' => array(
			'content' => 'No. '.sprintf('%09d',$orders_id),
			'font-size' => '9'
		),
		'line' => 0,
		);
		
		$pdf->SetHeader($header, 'O');
		$pdf->SetHeader($header, 'E');
		*/
		
		$pdf->SetFooter($footer, 'O');
		$pdf->SetFooter($footer, 'E');
		
		$stylesheet = file_get_contents("./css/printer.css");
		$stylesheet = mb_convert_encoding($stylesheet, "UTF-8");
		$pdf->WriteHTML($stylesheet,1);
		
		$id = 0;
		$html = '<div style="height:240mm;">';
		
		// 明細
		$details = '<table class="estimation" style="margin:20 0 20 0;">';
		
		if($ordertype=="general"){
		// 一般
			$printfee = 0;
			$exchinkfee = 0;
			$packfee = 0;
			$discountfee = 0;
			$reductionfee = 0;
			$expressfee = 0;
			$carriagefee = 0;
			$designfee = 0;
			$codfee = 0;
			$paymentfee = 0;
			$conbifee = 0;
			$additionalfee = 0;
			$creditfee = 0;
			
			$tbl = '<tbody>';
			$bundle_count = count($bundle);
			for($t=0; $t<$bundle_count; $t++){
				$tot_amount = 0;
				$tot_itemprice = 0;
				$optionfee = 0;
				$info = $bundle[$t];
				$cnt = count($info);
				for($i=0; $i<$cnt; $i++){
					// 商品単価を取得
					if($info[$i]['master_id']==0){
						$tmp = explode('_', $info[$i]['stock_number']);
						$info[$i]['item_code'] = $tmp[0];
						$info[$i]['maker_name'] = $info[$i]['maker'];
						$info[$i]['color_name'] = $info[$i]['item_color'];
						$cost = $info[$i]['price'];
					}else{
						/* 2014-09-22 注文商品の単価をデータベースに登録したことにより処理を変更
						if($orders['progress_id']!=4){
							if( ($info[$i]['color_id']==59 && $info[$i]['item_id']!=112) || ($info[$i]['color_id']==42 && ($info[$i]['item_id']==112 || $info[$i]['item_id']==212)) ) $isWhite=1;
							else $isWhite=0;
							$isPrint = $orders['noprint']==0? 1: 0;
							$cost = intval($catalog->getItemPrice($info[$i]['item_id'], $info[$i]['size_id'], $isPrint, $isWhite, $curdate), 10);
						}else{
							$cost = $info[$i]['item_cost'];
						}
						*/
						$cost = $info[$i]['item_cost'];
					}
					// 商品ごとに小計
					$subtotal = $cost*$info[$i]['amount'];
					// 合計を加算
					$tot_amount += $info[$i]['amount'];
					$tot_itemprice += $subtotal;
					
					// 2013-11-01 金額0円の商品も記載
					// if($cost==0) continue;
					
					$tbl.='<tr><td style="width:25px;text-align:center;">'.++$id.'</td><td style="text-align:left;font-size:90%;">'.$info[$i]['item_name']."<br />色：".$info[$i]['color_name'].'</td>';
					$tbl.='<td>'.$info[$i]['size_name'].'</td>';
					$tbl.='<td>'.number_format($info[$i]['amount']).'</td>';
					$tbl.='<td>'.number_format($cost).'</td>';
					$tbl.='<td>'.number_format($subtotal).'</td></tr>';
				}
				
				$printfee = $info[0]['printfee'];
				$exchinkfee = $info[0]['exchinkfee'];
				$packfee = $info[0]['packfee'];
				$discountfee = $info[0]['discountfee'];
				$reductionfee = $info[0]['reductionfee'];
				$expressfee = $info[0]['expressfee'];
				$carriagefee = $info[0]['carriagefee'];
				$designfee = $info[0]['designfee'];
				$codfee = $info[0]['codfee'];
				$paymentfee = $info[0]['paymentfee'];
				$conbifee = $info[0]['conbifee'];
				$additionalfee = $info[0]['additionalfee'];
				$creditfee = $info[0]['creditfee'];
				
				// 袋詰のチェック状態
				$pack_mode = array("","");
				if($info[0]['package_yes']==1 || $info[0]['package_no']==1){
					$pack_mode[0] = '袋詰め代';
				}
				if($info[0]['package_nopack']==1){
					$pack_mode[1] = '袋代';
				}
				
				// 値引名目
				if(!empty($info[0]['reductionfee'])){
					$reductionname = $info[0]['reductionname'];
				}
				
				// 追加料金名目
				if(!empty($info[0]['additionalfee'])){
					$additionalname = $info[0]['additionalname'];
				}
			
			
				// 旧タイプの袋詰に対応
				$pack_mode = implode(', ', $pack_mode);
				if(empty($pack_mode)){
					if($bundle[0][0]['package']=='nopack'){
						$pack_mode = '袋代';
					}else{
						$pack_mode = '袋詰め代';
					}
				}
				
				$discount_name = array();
				// 学割
				switch($bundle[0][0]['discount1']){
					case 'student': $discount_name[] = '学割'; break;
					case 'team2': $discount_name[] = '2クラス割'; break;
					case 'team3': $discount_name[] = '3クラス割'; break;
				}
				// 一般
				switch($bundle[0][0]['discount2']){
					case 'repeat': $discount_name[] = 'リピーター割'; break;
					case 'introduce': $discount_name[] = '紹介割'; break;
					case 'vip': $discount_name[] = 'VIP割'; break;
				}
				// 複数可
				for($j=0; $j<count($discount_data); $j++){
					switch($discount_data[$j]){
						case 'blog': $discount_name[] = 'ブログ割'; break;
						case 'quick': $discount_name[] = '早割'; break;
						case 'illust': $discount_name[] = 'イラレ割'; break;
					}
				}
				// 社員割
				if(!empty($bundle[0][0]['staffdiscount'])){
					$discount_name[] = '社員割';
				}
				// その他割引
				if(!empty($bundle[0][0]['extradiscountname'])){
					$discount_name[] = $bundle[0][0]['extradiscountname'];
				}
				$discount_names = implode(", ", $discount_name);
				
				$tbl.= '<tr><td colspan="2"></td><th>商品計</th><td>'.number_format($tot_amount).' 枚</td><td colspan="2">'.number_format($tot_itemprice).'</td></tr>
						<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">プリント代</td><td>'.number_format($printfee).'</td></tr>';
				if(!empty($exchinkfee)){
					$tbl.= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">インク色替え代</td><td>'.number_format($exchinkfee).'</td></tr>';
				}
				if(!empty($packfee)){
					$tbl.= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">'.$pack_mode.'</td><td>'.number_format($packfee).'</td></tr>';
				}
				if(!empty($discountfee)){
					$tbl.= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">割　引 ('.$discount_names.')</td><td>'.number_format($discountfee).'</td></tr>';
				}
				if(!empty($reductionfee)){
					$tbl.= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">値　引 ('.$reductionname.')</td><td>'.number_format($reductionfee).'</td></tr>';
				}
				if(!empty($expressfee)){
					$tbl.= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">特急料金</td><td>'.number_format($expressfee).'</td></tr>';
				}
				if(!empty($carriagefee)){
					$tbl.= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">送　料</td><td>'.number_format($carriagefee).'</td></tr>';
				}
				if(!empty($designfee)){
					$tbl.= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">デザイン料</td><td>'.number_format($designfee).'</td></tr>';
				}
				if(!empty($codfee)){
					$tbl.= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">代金引換手数料</td><td>'.number_format($codfee).'</td></tr>';
				}
				if(!empty($paymentfee)){
					$tbl.= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">後払い手数料</td><td>'.number_format($paymentfee).'</td></tr>';
				}
				if(!empty($conbifee)){
					$tbl.= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">コンビニ決済手数料</td><td>'.number_format($conbifee).'</td></tr>';
				}
				if(!empty($additionalfee)){
					$tbl .= '<tr><td style="border-right:none;"></td><td colspan="4" style="text-align:left;border-left:none;">'.$additionalname.'</td><td>'.number_format($additionalfee).'</td></tr>';
				}
				
				// オプション計
				$optionfee = $printfee+$exchinkfee+$packfee+$discountfee+$reductionfee+$expressfee+$carriagefee+$designfee+$codfee+$paymentfee+$conbifee+$additionalfee;
				
				$tot_itemprice += $optionfee;
				
				// 2018-03-20 受注ID毎に消費税と合計を表記
				if($_TAX>0){
					$tax = floor($tot_itemprice*$_TAX);			// 消費税
					$tbl .= '<tr><td colspan="4" style="border:none;"></td><td>小　　計</td><td>'.number_format($tot_itemprice).'</td></tr>';
					$tbl .= '<tr><td colspan="4" style="border:none;"></td><td>消費税額</td><td>'.number_format($tax).'</td></tr>';
					// 総合計
					$total += $tot_itemprice+$tax;
				}else{
					$tbl .= '<tr><td colspan="4" style="border:none;"></td><td>小　　計</td><td>'.number_format($tot_itemprice).'</td></tr>';
					// 総合計
					$total += $tot_itemprice;
				}
			}
			
			
			$details .= '<thead>
					<tr><th>No.</th><th colspan="2">商品名</th><th style="width:100px;">数量</th><th>商品単価</th><th>金額</th></tr>
				</thead>

				<tfoot>
					<tr><td colspan="4" style="border:none;"></td><th>合　　計</th><td>'.number_format($total).'</td></tr>
				</tfoot>';
			
			// 2018-03-20 受注ID毎に消費税と合計を表記
//			if($_TAX>0){
//				$sum = floor($total*(1+$_TAX));		// 見積り合計
//				$details .= '
//					<tr><td colspan="4" style="border:none;"></td><th>小　　計</th><td>'.number_format($total).'</td></tr>
//					<tr><td colspan="4" style="border:none;"></td><th>消費税額</th><td>'.number_format($tax).'</td></tr>';
//				if($bundle[0][0]['payment']=='credit'){
//					$sum += $creditfee;
//					$details .= '<tr><td colspan="4" style="border:none;"></td><th>カード手数料</th><td>'.number_format($creditfee).'</td></tr>';
//				}
//				$details .= '
//					<tr><td colspan="4" style="border:none;"></td><th>合　　計</th><td>'.number_format($sum).'</td></tr>
//				</tfoot>';
//			}else{
//				$sum = $total;					// 見積り合計
//				if($bundle[0][0]['payment']=='credit'){
//					$sum += $creditfee;
//					$details .= '<tr><td colspan="4" style="border:none;"></td><th>カード手数料</th><td>'.number_format($creditfee).'</td></tr>';
//				}
//				$details .= '
//					<tr><td colspan="4" style="border:none;"></td><th>合　　計</th><td>'.number_format($sum).'</td></tr>
//				</tfoot>';
//			}
			$details.= '<tbody>'.$tbl;
			$details .= '</tbody></table>';
			
		}else{
		// 業者
			$tbl = '<tbody>';
			$bundle_count = count($bundle);
			for($t=0; $t<$bundle_count; $t++){
				$tot_amount = 0;
				$tot_itemprice = 0;
				$optionfee = 0;
				$info = $bundle[$t];
				$cnt = count($info);
				for($i=0; $i<$cnt; $i++){
					$tot_amount += $info[$i]['amount'];
					$subtotal = $info[$i]['price']*$info[$i]['amount'];
					$tot_itemprice += $subtotal;
					
					if($subtotal==0) continue;
					
					$tbl.='<tr><td style="width:25px;text-align:center;">'.++$id.'</td><td style="text-align:left;font-size:90%;">'.$info[$i]['item_name']."<br />色：".$info[$i]['item_color'].'</td>';
					$tbl.='<td>'.$info[$i]['size_name'].'</td>';
					$tbl.='<td>'.number_format($info[$i]['amount']).'</td>';
					$tbl.='<td>'.number_format($info[$i]['price']).'</td>';
					$tbl.='<td>'.number_format($subtotal).'</td></tr>';
					
				}
				$tbl.= '<tr><td colspan="2"></td><th>商品計</th><td><p>'.number_format($tot_amount).' 枚</p></td><td colspan="2"><p style="font-size:100%;">'.number_format($tot_itemprice).'</p></td></tr>';
				
				// 追加行情報
				$result = $DB->db('search', 'estimatedetails', array('orders_id'=>$info[0]['orders_id']));
				if(!empty($result)){
					for($i=0; $i<count($result); $i++){
						$tbl .= '
							<tr><td></td><td style="text-align:left;">'.$result[$i]['addsummary'].'</td>
							<td style="text-align:left;">'.$result[$i]['addgroup'].'</td>
							<td>'.number_format($result[$i]['addamount']).'</td>
							<td>'.number_format($result[$i]['addcost']).'</td>
							<td>'.number_format($result[$i]['addprice']).'</td></tr>';
							
						// オプション計
						$optionfee += $result[$i]['addprice'];
					}
				}
				
				$tot_itemprice += $optionfee;
				
				// 2018-03-20 受注ID毎に消費税と合計を表記
				$tax = floor($tot_itemprice*$_TAX);			// 消費税
				$tbl .= '
					<tr><td colspan="4" style="border:none;"></td><td>小　　計</td><td>'.number_format($tot_itemprice).'</td></tr>
					<tr><td colspan="4" style="border:none;"></td><td>消費税額</td><td>'.number_format($tax).'</td></tr>';
					
				// 総合計
				$total += ($tot_itemprice + $tax);
			}
			
			// $tbl.= '<tr><td colspan="2"></td><th>商品計</th><td><p>'.number_format($tot_amount).' 枚</p></td><td colspan="2"><p style="font-size:100%;">'.number_format($tot_price).'</p></td></tr>';

			/* 追加行情報
			for($t=0; $t<$bundle_count; $t++){
				$result = $DB->db('search', 'estimatedetails', array('orders_id'=>$bundle[$t]['id']));
				if(!empty($result)){
					for($i=0; $i<count($result); $i++){
						$tbl .= '
							<tr><td></td><td style="text-align:left;">'.$result[$i]['addsummary'].'</td>
							<td style="text-align:left;">'.$result[$i]['addgroup'].'</td>
							<td>'.number_format($result[$i]['addamount']).'</td>
							<td>'.number_format($result[$i]['addcost']).'</td>
							<td>'.number_format($result[$i]['addprice']).'</td></tr>';
							
						// オプション計
						$optionfee += $result[$i]['addprice'];
					}
				}
			}
			*/
			
			
			$details .= '<thead>
					<tr><th>No.</th><th colspan="2">商品名</th><th style="width:100px;">数量</th><th>商品単価</th><th>金額</th></tr>
				</thead>
				<tfoot>
					<tr><td colspan="4" style="border:none;"></td><th>合　　計</th><td>'.number_format($total).'</td></tr>
				</tfoot>';
				
			//if($orders['consumptiontax']==2){	2014-04-30 税区分を廃止し全て外税
			
			// 2018-03-20 受注ID毎に消費税と合計を表記
//				$tax = floor($total*$_TAX);			// 消費税
//				$sum = floor($total*(1+$_TAX));		// 見積り合計
//				$details .= '
//				<tfoot>
//					<tr><td colspan="4" style="border:none;"></td><th>小　　計</th><td>'.number_format($total).'</td></tr>
//					<tr><td colspan="4" style="border:none;"></td><th>消費税額</th><td>'.number_format($tax).'</td></tr>
//					<tr><td colspan="4" style="border:none;"></td><th>合　　計</th><td>'.number_format($total).'</td></tr>
//				</tfoot>';
			/*
			}else{
				$sum = $total;					// 見積り合計
				$details .= '
				<tfoot>
					<tr><td colspan="4" style="border:none;"></td><th>合　　計</th><td>'.number_format($sum).'</td></tr>
				</tfoot>';
			}
			*/
			$details .= '<tbody>'.$tbl;
			$details .= '</tbody></table>';
		}

		$details .= '<p style="margin:0;">【　備　考　】</p>';
		$details .= '<div style="padding:0px 5px; border:1px solid #a9a9a9;"><p>'.nl2br($billnote).'</p></div>';
				
		// 出力フォーム
		$html .= '
		<div class="heading1" style="margin:-30 auto 20;letter-spacing:5mm;font-size:12pt;">請　求　書<span class="copy"></span></div>
		<div class="toright" style="margin:0;">請求日 '.$orders['schedule4'].'　　請求No. '.sprintf('%09d',$orders_id).'</div>
		<div class="customer_info">
			[ '.$customer_id.' ]
			<p style="margin:0; font-size:13pt;border-bottom:1px solid #000;">';
		if($ordertype=="general"){
			$html .= $customer_name;
			if(!empty($company)){
				$html .= '<br />';
				$html .= '<span style="font-size:13pt;">'.$company.'　様</span></p>';
			}else{
				$html .= '　様</p>';
			}
		}else{
			$html .= '<span style="font-size:13pt;">'.$customer_name.'　御中</span></p>';
		}
		$html .= '<p style="both;margin:0;">〒'.$zipcode.'<br />'.$deli1.'<br />'.$deli2.'</div>';

		$html .= '
		<div style="float:right; width:280px; margin:5px 0px 10px 0px;">
			<p style="font-size:12pt;margin:0;">'.$sender.'</p>
			<p style="margin:0;">〒'.$sender_zipcode.'<br />'.$sender_addr.'<br />TEL： '.$sender_tel.'　　FAX： '.$sender_fax.'<br />E-mail： '.$sender_email.'</p>
			<p class="toright" style="margin:0;">担当： '.$sender_staff.'</p>
		</div>

		<div class="contents">';
			
		$html .= '
		<p style="margin:10 0 0 0;">平素は格別のご高配を賜り、誠にありがとうございます。下記の通り御請求申し上げます</p>
		<p style="font-size:14pt;font-weight:bold;margin:0;">御請求金額　<ins style="font-size:100%;font-weight:bold;color:#003f75;">&yen;'.number_format($total).' －</ins> （消費税含む）</p>';
		
		
		$html .= $details;
		
		$html .= '</div></div>';

		$pdf->WriteHTML($html);
		
		/* 2014-04-08 廃止
		if($ordertype=="general"){
			$doc = '<div style="margin-top:1em;"><table><tbody><tr><td>振込先　三菱東京UFJ銀行　新小岩支店<br />普通預金 3716333　有限会社タカハマライフアート</td>';
			$doc .= '<td>※商品到着後１週間位でお振込みお願いします<br />';
			$doc .= '依頼名の前にコードナンバー<span style="font-size:14pt;font-weight:bold;">'.$orders_id.'</span>を必ずご記入ください</td></tr>';
			$doc .= '</tbody></table></div>';
			$pdf->WriteHTML($doc);
		}
		*/
		
		$pdf->Output();
				
	}
?>
