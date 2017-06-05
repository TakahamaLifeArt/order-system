<?php
/**
*	B2送り状CSVダウンロード
*
*	除外：	配送方法が引取
*/
	require_once dirname(__FILE__).'/MYDB.php';
	require_once dirname(__FILE__).'/phonedata.php';

	try{
		$conn = db_connect();
		
		// 配達時間指定
		$deliverytime = array('', '0812', '1214', '1416', '1618', '1820', '2021');
		
		$rs = array();
		$sql2 = '';

		if(!empty($_REQUEST['term_from'])){
			$sql2 .= ' and schedule3 >= "'.$_REQUEST['term_from'].'"';
		}
		if(!empty($_REQUEST['term_to'])){
			$sql2 .= ' and schedule3 <= "'.$_REQUEST['term_to'].'"';
		}
		if(!empty($_REQUEST['factory'])){
			$sql2 .= ' and orders.factory = '.$_REQUEST['factory'];
		}

		// 出荷準備：完了
		$sql2 .= ' and readytoship = 1';
		// 発送方法:ヤマト
		$sql2 .= ' and deliver = 2';
		$sql2 .= ' and shipped = 1';

		// 入金
		if(!empty($_REQUEST['deposit'])){
			$sql2 .= ' and deposit = '.$_REQUEST['deposit'];
		}

		// 注文番号
		if(!empty($_REQUEST['orderid'])){
			$sql2 .= ' and orders.id = '.$_REQUEST['orderid'];
		}

		// 届き先
		if(!empty($_REQUEST['organization'])){
			$sql2 .= ' and organization LIKE "%'.$_REQUEST['organization'].'%"';
		}

		$sql2 .= " and orders.id IN (". $_REQUEST['orderidlist']. ")";

		$sql = 'SELECT *, orders.id as orders_real_id FROM ((((((orders
		 LEFT JOIN customer ON orders.customer_id=customer.id)
		 LEFT JOIN delivery ON orders.delivery_id=delivery.id)
		 LEFT JOIN shipfrom ON orders.shipfrom_id=shipid)
		 LEFT JOIN progressstatus ON orders.id=progressstatus.orders_id)
		 LEFT JOIN acceptstatus ON orders.id=acceptstatus.orders_id)
		 LEFT JOIN estimatedetails ON orders.id=estimatedetails.orders_id)
		 LEFT JOIN acceptprog ON acceptstatus.progress_id=acceptprog.aproid';
		$sql .= ' WHERE created>"2011-06-05" and progress_id=4';
		$sql .= ' and (carriage!="accept" or (payment="cod" and (estimated>=300000 or boxnumber>1)))';
		$sql .= $sql2;
		$sql .= ' order by schedule3, customer.id, carriage';
		$result = exe_sql($conn, $sql);
		$tmp = array(
"お客様管理番号",
"送り状種類",
"クール区分",
"伝票番号",
"出荷予定日",
"お届け予定日",
"配達時間帯",
"お届け先コード",
"お届け先電話番号",
"お届け先電話番号枝番",
"お届け先郵便番号",
"お届け先住所",
"お届け先アパートマンション名",
"お届け先会社・部門１",
"お届け先会社・部門２",
"お届け先名",
"お届け先名(ｶﾅ)",
"敬称",
"ご依頼主コード",
"ご依頼主電話番号",
"ご依頼主電話番号枝番",
"ご依頼主郵便番号",
"ご依頼主住所",
"ご依頼主アパートマンション",
"ご依頼主名",
"ご依頼主名(ｶﾅ)",
"品名コード１",
"品名１",
"品名コード２",
"品名２",
"荷扱い１",
"荷扱い２",
"記事",
"ｺﾚｸﾄ代金引換額（税込)",
"内消費税額等",
"止置き",
"営業所コード",
"発行枚数",
"個数口表示フラグ",
"請求先顧客コード",
"請求先分類コード",
"運賃管理番号",
"注文時カード払いデータ登録",
"注文時カード払い加盟店番号",
"注文時カード払い申込受付番号１",
"注文時カード払い申込受付番号２",
"注文時カード払い申込受付番号３",
"お届け予定ｅメール利用区分",
"お届け予定ｅメールe-mailアドレス",
"入力機種",
"お届け予定ｅメールメッセージ",
"お届け完了ｅメール利用区分",
"お届け完了ｅメールe-mailアドレス",
"お届け完了ｅメールメッセージ");

		$rs[] = implode(',', $tmp);
		$itemIdx = -1;
		while($rec = mysqli_fetch_assoc($result)){
			$itemIdx = checkCode($rec['orders_real_id']);
			if($itemIdx == -1) {
				continue;
			}
//1	"お客様管理番号
				$tmp = array(strtoupper($rec['cstprefix'].str_pad($rec['number'], 6, "0", STR_PAD_LEFT)));
//2	"送り状種類
				array_push($tmp, $_REQUEST['invoiceKind'][$itemIdx]);
//3	"クール区分
				array_push($tmp, "");
//4	"伝票番号
				array_push($tmp, "");
//5	"出荷予定日
				array_push($tmp, preg_replace('/-/','/',$rec['schedule3']));
//6	"お届け予定日
				array_push($tmp, preg_replace('/-/','/',$rec['schedule4']));
//7	"配達時間帯
				array_push($tmp, $deliverytime[$rec['deliverytime']]);
//8	"お届け先コード
				array_push($tmp, $rec['delivery_id']);
//9	"お届け先電話番号
				array_push($tmp, $rec['delitel']);
//10	"お届け先電話番号枝番
				array_push($tmp, "");
//11	"お届け先郵便番号
				array_push($tmp, $rec['delizipcode']);
//12	"お届け先住所
				array_push($tmp, $rec['deliaddr0'].$rec['deliaddr1']);
//13	"お届け先アパートマンション名
				array_push($tmp, $rec['deliaddr2']);
//14	"お届け先会社・部門１
				array_push($tmp, $rec['deliaddr3']);
//15	"お届け先会社・部門２
				array_push($tmp, $rec['deliaddr4']);
//16	"お届け先名
				array_push($tmp, $rec['organization']);
//17	"お届け先名(ｶﾅ)
				array_push($tmp, "");
//18	"敬称
				array_push($tmp, "様");
//19	"ご依頼主コード
				array_push($tmp, $rec['shipfrom_id']);
//20	"ご依頼主電話番号
				if($rec['shipfrom_id'] != 0) {
					array_push($tmp, $rec['shiptel']);
				} else {
					array_push($tmp, "03-5670-0787");
				}
//21	"ご依頼主電話番号枝番
					array_push($tmp, "");
//22	"ご依頼主郵便番号
				if($rec['shipfrom_id'] != 0) {
					array_push($tmp, $rec['shipzipcode']);
				} else {
					array_push($tmp, "124-0025");
				}
//23	"ご依頼主住所
				if($rec['shipfrom_id'] != 0) {
					array_push($tmp, $rec['shipaddr0'].$rec['shipaddr1']);
				} else {
					array_push($tmp, "東京都葛飾区西新小岩３－１４－２６");
				}
//24	"ご依頼主アパートマンション
				if($rec['shipfrom_id'] != 0) {
					array_push($tmp, $rec['shipaddr2'].$rec['shipaddr3'].$rec['shipaddr4']);
				} else {
					array_push($tmp, "");
				}
//25	"ご依頼主名
				if($rec['shipfrom_id'] != 0) {
					array_push($tmp, $rec['shipfromname']);
				} else {
					array_push($tmp, "有限会社タカハマライフアート");
				}
//26	"ご依頼主名(ｶﾅ)
				if($rec['shipfrom_id'] != 0) {
//					array_push($tmp, $rec['shipfromruby']);
					array_push($tmp, "");
				} else {
					array_push($tmp, "");
				}
//27	"品名コード１
				array_push($tmp, "");
//28	"品名１
				array_push($tmp, "衣類");
//29	"品名コード２
				array_push($tmp, "");
//30	"品名２
				array_push($tmp, "");
//31	"荷扱い１
				array_push($tmp, "");
//32	"荷扱い２
				array_push($tmp, "");
//33	"記事
				array_push($tmp, "");
//34	"ｺﾚｸﾄ代金引換額（税込) 
			if($_REQUEST['invoiceKind'][$itemIdx] == "2") {
				array_push($tmp, $rec['basefee'] + $rec['salestax']);
			} else {
				array_push($tmp, "");
			}
//35	"内消費税額等
			if($_REQUEST['invoiceKind'][$itemIdx] == "2") {
				array_push($tmp, $rec['salestax']);
			} else {
				array_push($tmp, "");
			}
//36	"止置き
				array_push($tmp, "");
//37	"営業所コード
				array_push($tmp, "");
//38	"発行枚数
				array_push($tmp, $_REQUEST['printCount'][$itemIdx]);
//39	"個数口表示フラグ
				array_push($tmp, "3");
//40	"請求先顧客コード
				array_push($tmp, "035670078701");
//41	"請求先分類コード
				array_push($tmp, "");
//42	"運賃管理番号
				array_push($tmp, "01");
//43	"注文時カード払いデータ登録
				array_push($tmp, "0");
//44	"注文時カード払い加盟店番号
				array_push($tmp, "");
//45	"注文時カード払い申込受付番号１
				array_push($tmp, "");
//46	"注文時カード払い申込受付番号２
				array_push($tmp, "");
//47	"注文時カード払い申込受付番号３
				array_push($tmp, "");
//48	"お届け予定ｅメール利用区分
				array_push($tmp, "0");
//49	"お届け予定ｅメールe-mailアドレス
				array_push($tmp, "");
//50	"入力機種
				array_push($tmp, "");
//51	"お届け予定ｅメールメッセージ
				array_push($tmp, "");
//52	"お届け完了ｅメール利用区分
				array_push($tmp, "0");
//53	"お届け完了ｅメールe-mailアドレス
				array_push($tmp, "");
//54	"お届け完了ｅメールメッセージ
				array_push($tmp, "");

/* 古いソース
			$payment = $rec['payment']=="cod"? 2: 0;
			$delitel = PhoneData::phonemask($rec['delitel']);
			if(empty($rec['shipid'])){
				$tmp = array(
					'"'.$payment.'"',
					'"'.$delitel['c'].'"',
					'"'.$rec['delizipcode'].'"',
					'"'.$rec['deliaddr0'].$rec['deliaddr1'].'"',
					'"'.$rec['deliaddr2'].'"',
					'"'.$rec['deliaddr3'].'"',
					'"'.$rec['deliaddr4'].'"',
					'"'.$rec['organization'].'"',
					'"03-5670-0787"',
					'"124-0025"',
					'"東京都葛飾区西新小岩３－１４－２６"',
					'',
					'"有限会社タカハマライフアート"',
					'"'.preg_replace('/-/','/',$rec['schedule3']).'"',
					'"'.preg_replace('/-/','/',$rec['schedule4']).'"',
					'"'.$deliverytime[$rec['deliverytime']].'"',
					'"'.$rec['estimated'].'"',
					'',	// tax
					'"'.$rec['boxnumber'].'"',
					'"衣類'.$rec['order_amount'].'枚"'
				);
			}else{
				$shiptel = PhoneData::phonemask($rec['shiptel']);
				$tmp = array(
					'"'.$payment.'"',
					'"'.$delitel['c'].'"',
					'"'.$rec['delizipcode'].'"',
					'"'.$rec['deliaddr0'].$rec['deliaddr1'].'"',
					'"'.$rec['deliaddr2'].'"',
					'"'.$rec['deliaddr3'].'"',
					'"'.$rec['deliaddr4'].'"',
					'"'.$rec['organization'].'"',
					'"'.$shiptel['c'].'"',
					'"'.$rec['shipzipcode'].'"',
					'"'.$rec['shipaddr0'].$rec['shipaddr1'].'"',
					'"'.$rec['shipaddr2'].'"',
					'"'.$rec['shipfromname'].'"',
					'"'.preg_replace('/-/','/',$rec['schedule3']).'"',
					'"'.preg_replace('/-/','/',$rec['schedule4']).'"',
					'"'.$deliverytime[$rec['deliverytime']].'"',
					'"'.$rec['estimated'].'"',
					'',	// tax
					'"'.$rec['boxnumber'].'"',
					'"衣類'.$rec['order_amount'].'枚"'
				);
			}
*/
			$rs[] = implode(',', $tmp);
		}
		$scv = implode("\r\n", $rs);
	}catch(Exception $e){
		print("\n\nCSVファイルが作成できませんでした。<a href=\"../shippinglist.php?req=su\">発注画面に戻ります</a>");
	}

	mysqli_close($conn);

	//ダウンロード前に表示するダイアログの指定
	header("Content-Type: application/octet-stream");
	header("Content-Disposition: attachment; filename=B2_".date(Ymd).".csv");
	ob_clean();
	print(mb_convert_encoding($scv, 'sjis', 'utf-8'));


function checkCode($orderid) {
	for($i = 0; $i< count($_REQUEST['b2printchk']); $i++) {
		if($orderid."_checked" == $_REQUEST['b2printchk'][$i]) {
			return $i;
		}
	}
	return -1;
}

?>
