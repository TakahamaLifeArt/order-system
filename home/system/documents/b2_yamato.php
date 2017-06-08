<?php
/*
	発送予定リストのPDF変換と印刷処理
	charset UTF-8
*/

	if(isset($_REQUEST['mode']) && $_REQUEST['mode']=='print'){
		// クラスの読み込みとインスタンス生成
		$root_path = "../";
		require_once dirname(__FILE__).'/'.$root_path.'php_libs/orders.php';
		$DB = new Orders();
		
		// 検索パラメータをハッシュに代入
		$a = explode('&', $_SERVER['QUERY_STRING']);
		$i = 0;
		while ($i<count($a)) {
			$b = preg_split('/=/', $a[$i]);
			$params[htmlspecialchars(urldecode($b[0]))] = htmlspecialchars(urldecode($b[1]));
			$i++;
		}
		
		// 出力データを取得
		$info = $DB->db('search', 'b2_yamato', $params);
		if(empty($info)) exit('No such data exists');
		
		// 保存用PDFのファイル名
		$document_name = 'shipment_'.date('Ymd').'.pdf';
		
		/* PDF変換 */
		require_once("../MPDF_6_0/mpdf.php");
		$pdf = new mPDF('ja','A4', '10','',15, 15, 16, 6, 9, 0);
		$pdf->mirrorMargins = 0;
		
		$pdf->defaultheaderfontsize = 10;	/* in pts */
		$pdf->defaultheaderfontstyle = I;	/* blank, B, I, or BI */
		
		$header = array(
			'R' => array(
				'content' => 'Page {PAGENO}/{nb}',
				'font-size' => '9'
			),
			'C' => array(
				'content' => '発送リスト',
				'font-style' => 'B',
				'font-size' => '12',
				'color' => '#000000'
			),
			'line' => 0,
		);
		$footer = array(
			'C' => array(
				'content' => 'Takahama Life Art',
				'font-style' => 'BI',
				'font-size' => '9',
				'color' => '#aaaaaa'
			),
			'line' => 0,
		);
		$pdf->SetHeader($header, 'O');
		$pdf->SetHeader($header, 'E');
		$pdf->SetFooter($footer, 'O');
		$pdf->SetFooter($footer, 'E');
				
		$stylesheet = file_get_contents("./css/list_a4.css");
		$stylesheet = mb_convert_encoding($stylesheet, "UTF-8");
		$pdf->WriteHTML($stylesheet,1);
		$carry = array(					// 発送方法
			'normal'=>'宅急便',
			'accept'=>'引取',
			'telephonic'=>'できtel',
			'other'=>'その他',
			''=>'未定'
		);
		$ready = array('-','可');		// 発送準備
		
		// 出力
		$factory = array('1'=>'[1]', '2'=>'[2]', '9'=>'[1,2]');
		
		$doc = '<table class="shipping"><thead>';
		$doc .= '<tr><th>受注No.<br>工場</th><th>顧客</th><th>発送日<br>配達時間</th><th>袋詰</th><th>送り状種類</th><th>個口数</th><th>お届け先名</th><th>商品種類</th><th>入金方法</th><th>同梱</th><th>発送方法</th></tr>';
		$doc .= '</thead>';

		$doc .= '<tbody>';
		for($c=0; $c<count($info); $c++){
			$doc .= '<tr class="row">';
			$doc .= '<td class="ac">'.$info[$c]['orders_id'].'<br>';
			$doc .= $factory[$info[$c]['factory']].'</td>';
			$doc .= '<td class="ac">'.$info[$c]['customername'].'<br>';
			$doc .= $info[$c]['deliaddr0'].$info[$c]['deliaddr1'].'</td>';
			$doc .= '<td class="ac">'.$info[$c]['schedule3'].'<br>';
			$doc .= strDeliverytime($info[$c]['deliverytime']).'</td>';
			// 袋詰
			if($info[$c]['package_no']==1){
				$pack = '-';
			}else{
				$pack_mode = array();
				if($info[$c]['package_yes']==1) $pack_mode[] = '〇';
				if($info[$c]['package_nopack']==1) $pack_mode[] = '袋のみ';
				$pack = implode(', ', $pack_mode);
			}
			$doc .= '<td class="ac">'.$pack.'</td>';
			$doc .= '<td class="ac">'.$_REQUEST['invoiceKind'][$c].'</td>';
			$doc .= '<td class="ac">'.$_REQUEST['printCount'][$c].'</td>';
			$doc .= '<td>'.$info[$c]['organization'].'</td>';
			$doc .= '<td>'.$info[$c]['category_name'].'</td>';
			$doc .= '<td>'.strPayment($info[$c]['payment']).'</td>';
			$doc .= '<td class="ac">'.strBundle($info[$c]['bundle']).'</td>';
			$doc .= '<td class="ac">'.$carry[$info[$c]['carriage']].'</td>';
			$doc .= '</tr>';
		}
		$doc .= '</tbody></table>';
		
		$pdf->WriteHTML($doc);
		$pdf->Output();
	}

	function strDeliverytime($args){
			$deliverytime_str = "";
			switch($args) {
				case '0': $deliverytime_str="---";
									break;
				case '1': $deliverytime_str="午前中";
									break;
				case '2': $deliverytime_str="12-14";
									break;
				case '3': $deliverytime_str="14-16";
									break;
				case '4': $deliverytime_str="16-18";
									break;
				case '5': $deliverytime_str="18-20";
									break;
				case '6': $deliverytime_str="20-21";
									break;
				default:
									break;
			}
			return $deliverytime_str;
		}
		function strPayment($args){
			$payment_str = "";
			switch($args) {
				case 'wiretransfer': $payment_str="振込";
									break;
				case 'credit': $payment_str="カード";
									break;
				case 'cod': $payment_str="代金引換";
									break;
				case 'cash': $payment_str="現金";
									break;
				case 'check': $payment_str="小切手";
									break;
				case 'note': $payment_str="手形";
									break;
				case '0': $payment_str="未定";
									break;
				default:
									$payment_str=$args;
									break;
			}
			return $payment_str;
		}
		function strBundle($args){
			$bundle_str = "";
			switch($args) {
				case '0': $bundle_str="なし";
									break;
				case '1': $bundle_str="あり";
									break;
				default:
									break;
			}
			return $bundle_str;
		}

?>
