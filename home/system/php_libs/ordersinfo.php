<?php
/**
	タカハマライフアート
*	受注データベース
*	charset UTF-8
*/

	require_once dirname(__FILE__).'/orders.php';
	require_once dirname(__FILE__).'/marketing.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';

	class OrdersInfo {

		/*
		 * POSTされたデータから配列を生成
		 *	@fld		フィールド名
		 *	@dat		データ
		 *
		 *	return		フィールド名をキーにしたハッシュ
		 */
		public static function hash1($fld, $dat){
			for($i=0; $i<count($fld); $i++){
				if(empty($fld[$i]) || !isset($dat[$i])) continue;
				$hash[$fld[$i]] = $dat[$i];
			}
			return $hash;
		}

		/*
		 * 複数のレコードに対応
		 *  @fld		フィールド名
		 *	@dat		データ [data|data|... , ]
		 *
		 *	return		フィールド名をキーにしたハッシュ
		 */
		public static function hash2($fld, $dat){
			for($i=0; $i<count($dat); $i++){
				if(empty($dat[$i])) continue;
				$tmp = explode("|", $dat[$i]);
				for($c=0; $c<count($fld); $c++){
					$hash[$i][$fld[$c]] = $tmp[$c];
				}
			}
			return $hash;
		}

		/*
		 * シリアライズされたデータをハッシュにする
		 * separator
		 * 	|		table
		 *  ;		records
		 *  ,		fields
		 *
		 *  return	[更新するデータのインデックス][関連するテーブルごとのインデックス][レコードごとのインデックス][フィールド名]
		 *
		 *  	table1[fld0] が1レコード
		 *  	table2[fld1, fld2] が2レコード
		 *
		 *			[0][0][0][fld0]	... table1
		 *  		   [1][0][fld1]	... table2の1レコード
		 *  		   [1][0][fld2]
		 *  			  [1][fld1]	... table2の2レコード
		 *  			  [1][fld2]
		 */
		public static function deserial($fld, $dat){
			for($i=0; $i<count($dat); $i++){
				if(empty($dat[$i])) continue;
				$tbl = explode("|", $dat[$i]);
				$start_id = 0;
				$fld_count = 0;
				$re = array();
				for($c=0; $c<count($tbl); $c++){
					$start_id += $fld_count;
					$tmp = array();
					$rec = explode(";", $tbl[$c]);
					for($r=0; $r<count($rec); $r++){
						$val = explode(',', $rec[$r]);
						$fld_count = count($val);
						for($v=0,$f=$start_id; $v<$fld_count; $v++,$f++){
							$tmp[$r][$fld[$f]] = $val[$v];
						}
					}

					$re[] = $tmp;
				}

				$hash[] = $re;
			}
			return $hash;
		}
	}

	// hash 1
	if(isset($_REQUEST['field1'], $_REQUEST['data1'])){
		$data1 = OrdersInfo::hash1($_REQUEST['field1'], $_REQUEST['data1']);
	}

	if(isset($_REQUEST['field2'], $_REQUEST['data2'])){
		$data2 = OrdersInfo::hash1($_REQUEST['field2'], $_REQUEST['data2']);
	}
	if(isset($_REQUEST['field3'], $_REQUEST['data3'])){
		$data3 = OrdersInfo::hash1($_REQUEST['field3'], $_REQUEST['data3']);
	}
	if(isset($_REQUEST['field12'], $_REQUEST['data12'])){
		$data12 = OrdersInfo::hash1($_REQUEST['field12'], $_REQUEST['data12']);
	}

	// hash 2
	if(isset($_REQUEST['field4'], $_REQUEST['data4'])){
		$data4 = OrdersInfo::hash2($_REQUEST['field4'], $_REQUEST['data4']);
	}
	if(isset($_REQUEST['field5'], $_REQUEST['data5'])){
		$data5 = OrdersInfo::hash2($_REQUEST['field5'], $_REQUEST['data5']);
	}
	if(isset($_REQUEST['field6'], $_REQUEST['data6'])){
		$data6 = OrdersInfo::hash2($_REQUEST['field6'], $_REQUEST['data6']);
	}
	if(isset($_REQUEST['field7'], $_REQUEST['data7'])){
		$data7 = OrdersInfo::hash2($_REQUEST['field7'], $_REQUEST['data7']);
	}
	if(isset($_REQUEST['field8'], $_REQUEST['data8'])){
		$data8 = OrdersInfo::hash2($_REQUEST['field8'], $_REQUEST['data8']);
	}
	if(isset($_REQUEST['field9'], $_REQUEST['data9'])){
		$data9 = OrdersInfo::hash2($_REQUEST['field9'], $_REQUEST['data9']);
	}
	if(isset($_REQUEST['field10'], $_REQUEST['data10'])){
		$data10 = OrdersInfo::hash2($_REQUEST['field10'], $_REQUEST['data10']);
	}

	// boundary
	$boundary_count = 3;
	$data_delimiter = "d".substr(md5(uniqid(rand())), 0, $boundary_count)."|";
	$field_delimiter = "f".substr(md5(uniqid(rand())), 0, $boundary_count)."|";
	$record_delimiter = "r".substr(md5(uniqid(rand())), 0, $boundary_count)."|";
	$boundary_count += 2;

	if(isset($_REQUEST['act'], $_REQUEST['mode'])){
		$orders = new Orders();
		if ($_REQUEST['act']=='sync') {
			// 顧客リストの同期
			try {
				$method = strtoupper($_REQUEST['mode']);
				//				$data = array("curdate"=>date('Y-m-d'));
				//				$json = new Services_JSON(SERVICES_JSON_LOOSE_TYPE);
				//				$param = $json->encode($data);
				$param = "";
				$header = array(
					'X-TLA-Access-Token: '._ACCESS_TOKEN
				);
				$url = _API_REST.'/v1/customers';
				if ($method==='POST') {
					$header[] = 'Content-Type: application/json';
					$url .= '/'.date('Y-m-d');
				}
				if ($method==='IMPORT') {
					$method = 'POST';
					$url .= '/2015-04-01/csv';
				}
				$http = new Http($url);
				$result = $http->requestRest($method, $param, $header);
				if (TRUE !== $result) {
					throw new Exception($result);
				}
			} catch (Exception $e) {
				$result = $e->getMessage();
			}
		} else if($_REQUEST['mode']=='order'){
			// Webサイトからの注文データ
			$file = $_REQUEST['file'];
			$name = $_REQUEST['name'];
			$site = $_REQUEST['site'];
			//$file 添付ファイルデータ；$name　添付ファイル名；$site　注文サイト
			$data = array($data1,$data2,$data3,$data4,$data5,$data6,$data7,$data8,$data9,$data10,$data12,$file,$name,$site);
			$rs = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data);

			switch($_REQUEST['act']){
				case 'insert':
					$result = $rs;
					break;
				case 'update':
					if(!empty($rs) && is_numeric(trim($rs))){
						$result = $data3['id'];
					}else{
						$result = $rs;
					}
					break;
				case 'search':
					$result = $rs;
					break;
			}
		}elseif($_REQUEST['act']=='insert' && ($_REQUEST['mode']=='exchvolume' || $_REQUEST['mode']=='exchoption' ||
			$_REQUEST['mode']=='cashbook' || $_REQUEST['mode']=='additionalestimate') ){
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data4);

		}elseif($_REQUEST['act']=='update' && ($_REQUEST['mode']=='arrive' || $_REQUEST['mode']=='orderselective' ||
			$_REQUEST['mode']=='cashbook' || $_REQUEST['mode']=='additionalestimate') ){
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data4);

		}elseif($_REQUEST['act']=='delete' && ($_REQUEST['mode']=='printinfo' || $_REQUEST['mode']=='printadj' || $_REQUEST['mode']=='cashbook' ||
			$_REQUEST['mode']=='orderprint' || $_REQUEST['mode']=='orderarea' || $_REQUEST['mode']=='orderselectivearea' || $_REQUEST['mode']=='orderink') ){
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data4);

		}elseif($_REQUEST['act']=='update' && $_REQUEST['mode']=='direction'){
			$data = array($data1,$data4,$data5,$data6,$data7,$data8);
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data);

		}elseif($_REQUEST['act']=='update' && ($_REQUEST['mode']=='workplan' || $_REQUEST['mode']=='bundle')){
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data5);

		}elseif($_REQUEST['act']=='update' && $_REQUEST['mode']=='imagecheck'){
			//イメージ画像アップ確認
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $_REQUEST['order_id']);
			//new a mail object

		}elseif($_REQUEST['act']=='update' && $_REQUEST['mode']=='b2print'){
			$data = array($_REQUEST['order_id'], $_REQUEST['b2print']);
			//b2print
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data);
		}elseif($_REQUEST['act']=='update' && $_REQUEST['mode']=='yayoyiprint'){
			$data = array($_REQUEST['order_id'], $_REQUEST['yayoyiprint']);
			//yayoyiprint
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data);
		}elseif($_REQUEST['act']=='update' && $_REQUEST['mode']=='clientprint'){
			$data = array($_REQUEST['client_id'], $_REQUEST['clientprint']);
			//clientprint
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data);


		}elseif($_REQUEST['act']=='search' && $_REQUEST['mode']=='cart'){
			$result = $_SESSION['cart'];
			
		}elseif($_REQUEST['act']=='search' && $_REQUEST['mode']=='numberOfBox'){
			$data = array($data1, $data4);
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data);
			
		}else{
			$result = $orders->db($_REQUEST['act'], $_REQUEST['mode'], $data1);
		}

		if($_REQUEST['act']=='search'){
			switch($_REQUEST['mode']){
				case 'bundlelist':		// 同梱可能リスト
				case 'bundlecount':		// 同梱する注文データ
				case 'itemtag':			// アイテムのタグ
				case 'useranalyze':		// 顧客分析
				case 'saleslist':		// 売上推移表
				case 'orderitem':		// 注文商品
				case 'orderitemlist':	// 注文商品のアイテムID
				case 'orderprint':		// 注文商品のプリント位置情報
				case 'orderink':		// インク情報
				case 'stafflist':		// 担当者リスト
				case 'reuse':			// リピート版注文の情報
				case 'cart':			// 注文リストのセッション情報
				case 'shippinglist':	// 発送確認画面
				case 'b2_yamato':	// b2 ヤマト発送確認画面
				case "enquete1":		// アンケート集計
				case "requestmail":		// 資料請求メール情報
				case "cutpattern":		// 面付け
				case "platelist":		// 製版
				case "platelist1":		// 製版	(年度集計)
				case "platelist2":		// 製版 (月次集計)
				case "platelist3":		// 製版 (日計)
				case "addup":			// 年度集計（シルク、転写紙、プレス、インクジェット）
				case "daily":			// シルクの月次
				case "arrivalsheet":	// 入荷票の印刷
				case "stocklist":		// 入荷
				case "artworklist1":	// 版下	(年度集計)
				case "artworklist2":	// 版下 (月次集計)
				case "artworklist":		// 版下
				case "silklist":		// シルク
				case "translist":		// 転写紙
				case "translist2":		// 転写紙のテスト（2013-09-12）
				case "presslist2":		// プレスのテスト（2013-09-12）
				case "presslist":		// プレス
				case "inkjetlist":		// インクジェット
				case "ordering":		// 発注
				case "orderlist":		// 注文確定一覧
				case "accepting":		// 受注一覧
				case "top":				// 受注入力
				case "graph":			// シルクの作業量グラフ
				case "dedupe":			// 顧客の重複確認
				case "mailhistory":		// メール送信履歴
				case "delivery":		// 納品先
				case "shipfrom":		// 発送元
				case "customer":		// 顧客一覧
				case "customerledger":	// 得意先元帳
				case "cashbook":		// 入金処理
				case "billstate":		// 月締め請求予定、回収状況一覧
				case "billresults":		// 回収実績一覧
				case "userreview":		// ユーザーレビュー
				case "itemreview":		// アイテムレビュー
				case "customerlog":		// 受付記録
					$json = new Services_JSON();
					$result = $json->encode($result);
					header("Content-Type: text/javascript; charset=utf-8");
					break;
					
				case 'numberOfBox':		// 箱数
					break;
					
				default:
					if(!empty($result)){
						switch($_REQUEST['mode']){
						case "discount":	// discount_name
							$result = implode($record_delimiter, $result);
							$result .= $field_delimiter.$data_delimiter.$record_delimiter.$boundary_count;
							break;
							
						case "progress":	// progress ID
							break;
							
						default:
							// レコード・フィールド・データの区切り文字で連結
							for($i=0; $i<count($result); $i++){
								$line = '';
								foreach($result[$i] as $key=>$val){
									$line .= $field_delimiter.$key.$data_delimiter.$val;
								}
								$list[] = substr($line, $boundary_count);
							}
							$result = implode($record_delimiter, $list);
							$result .= $field_delimiter.$data_delimiter.$record_delimiter.$boundary_count;
						}
					}else{
						$result = null;
					}
			}
			
		}else if($_REQUEST['act']=='insert' && is_array($result)){
			foreach($result as $print_key=>$print_name){
				$hash .= $print_key.','.$print_name.'|';
			}
			$result = substr($hash,0, -1);
		}else if($_REQUEST['act']=='export'){
			$dat = array();
			switch($_REQUEST['csv']){
				case 'orderlist':
					$dat=Marketing::getOrderList($_REQUEST['start'], $_REQUEST['end'], $_REQUEST['id']);
					break;

				case 'printlist':
					$dat=Marketing::getPrintList($_REQUEST['start'], $_REQUEST['end'], $_REQUEST['id']);
					break;

				case 'orderitemlist':
					$dat=Marketing::getOrderItemList($_REQUEST['start'], $_REQUEST['end'], $_REQUEST['id'], $_REQUEST['mode']);
					break;
					
				case 'customerlist':
					$dat=Marketing::getCustomerList($_REQUEST['start'], $_REQUEST['end'], $_REQUEST['id']);
					break;
			}
			
			if($_REQUEST['csv']=='customerlist'){
				// 顧客データ
				$fieldName = array(
					'customer_num'=>'顧客ID', 
					'customername'=>'名前',
					'customerruby'=>'フリガナ',
					'dept'=>'担当',
					'deptruby'=>'担当フリガナ',
					'zipcode'=>'郵便番号',
					'addr0'=>'都道府県',
					'addr1'=>'住所１',
					'addr2'=>'住所２',
					'addr3'=>'部門１',
					'addr4'=>'部門２',
					'tel1'=>'電話番号１',
					'tel2'=>'電話番号２',
					'email1'=>'メール１',
					'email2'=>'メール２',
					'fax'=>'ファックス',
					'total_price'=>'注文金額計',
					'order_count'=>'注文回数',
					'repeater'=>'リピーター',
					'first_order'=>'初回注文',
					'recent_order'=>'前回注文',
				);
				$filename = $_REQUEST['csv'].".csv";
				$filepath = "../data/".$filename;
				$fp = fopen($filepath, 'wb');
				if($fp==false) echo 'Error: file open';
				$lbl = array();
				foreach($dat[0] as $key=>$val){
					$lbl[] = $fieldName[$key]? $fieldName[$key]: $key;
				}
				fputcsv($fp, $lbl);
				foreach($dat as $line){
					fputcsv($fp, $line);
				}
			}else if($_REQUEST['csv']=='orderitemlist'){
				// 注文商品データ
				$fieldName = array(
					'ordersid'=>'受注No.', 
					'catname'=>'カテゴリ',
					'item_code'=>'アイテムコード',
					'item_name'=>'アイテム名',
					'size_name'=>'サイズ',
					'color_code'=>'カラーコード',
					'color_name'=>'カラー名',
					'maker_name'=>'メーカー',
					'amount'=>'注文枚数',
					'item_cost'=>'単価',
					'addsummary'=>'摘要',
					'addamount'=>'枚数',
					'addcost'=>'単価',
					'addprice'=>'金額',
				);
				$filename = $_REQUEST['csv'];
				if(! empty($_REQUEST['mode'])){
					$filename .= "-".$_REQUEST['mode'];
				}
				$filename .= ".csv";
				$filepath = "../data/".$filename;
				$fp = fopen($filepath, 'wb');
				if($fp==false) echo 'Error: file open';
				$lbl = array();
				foreach($dat[0] as $key=>$val){
					$lbl[] = $fieldName[$key]? $fieldName[$key]: $key;
				}
				//mb_convert_variables('SJIS', 'UTF-8', $lbl);
				fputcsv($fp, $lbl);
				foreach($dat as $line){
					//mb_convert_variables('SJIS', 'UTF-8', $line);
					fputcsv($fp, $line);
				}
			}else{
				// 受注データ、プリントデータ
				$orderType = array(
					'general'=>'一般',
					'industry'=>'業者'
				);
				$carriage = array(
					'normal'=>'宅配',
					'accept'=>'工場渡し',
					'telephonic'=>'できTel',
					'other'=>'その他',
				);
				$payment = array(
					'wiretransfer'=>'振込',
					'credit'=>'カード',
					'cod'=>'代金引換',
					'cash'=>'現金',
					'other'=>'その他',
				);
				$fieldName = array(
					'ordersid'=>'受注No.', 
					'staffname'=>'受注担当', 
					'ordertype'=>'受注区分', 
					'progressname'=>'注文状況', 
					'maintitle'=>'題名', 
					'pack_yes_volume'=>'袋詰有', 
					'pack_nopack_volume'=>'袋詰無', 
					'order_amount'=>'注文枚数', 
					'carriage'=>'配送方法', 
					'boxnumber'=>'箱数', 
					'factory'=>'工場', 
					'schedule1'=>'入稿〆日', 
					'schedule2'=>'注文確定日', 
					'schedule3'=>'発送日', 
					'schedule4'=>'お届け日', 
					'noprint'=>'プリント無し', 
					'exchink_count'=>'インク色替え数', 
					'manuscript'=>'入稿方法', 
					'discount1'=>'学割', 
					'discount2'=>'一般割引', 
					'staffdiscount'=>'社員割', 
					'extradiscount'=>'その他割引率', 
					'extradiscountname'=>'その他割引名', 
					'free_discount'=>'手入力割引', 
					'reductionname'=>'値引き', 
					'additionalname'=>'追加料金', 
					'payment'=>'支払い方法', 
					'express'=>'特急指定', 
					'carriage'=>'送料', 
					'deliverytime'=>'配達時間指定', 
					'purpose'=>'用途', 
					'purpose_text'=>'その他用途', 
					'job'=>'職業', 
					'repeatdesign'=>'リピートチェック', 
					'productfee'=>'商品代', 
					'printfee'=>'プリント代', 
					'silkprintfee'=>'シルク', 
					'colorprintfee'=>'カラー転写', 
					'digitprintfee'=>'デジタル写真', 
					'inkjetprintfee'=>'インクジェット', 
					'cuttingprintfee'=>'カッティング', 
					'discountfee'=>'割引金額', 
					'reductionfee'=>'値引き金額', 
					'exchinkfee'=>'インク色替え代', 
					'additionalfee'=>'追加料金', 
					'packfee'=>'袋詰代', 
					'expressfee'=>'特急料金', 
					'carriagefee'=>'送料', 
					'designfee'=>'デザイン代', 
					'codfee'=>'代引き手数料', 
					'creditfee'=>'カード手数料', 
					'salestax'=>'消費税', 
					'basefee'=>'税抜き額', 
					'estimated'=>'売上', 
					'customer_num'=>'顧客ID',  
					'customername'=>'顧客名', 
					'customerruby'=>'顧客名フリガナ', 
					'dept'=>'担当', 
					'deptruby'=>'担当フリガナ', 
					'zipcode'=>'郵便番号', 
					'addr0'=>'都道府県', 
					'addr1'=>'住所１', 
					'addr2'=>'住所２', 
					'addr3'=>'会社部門１', 
					'addr4'=>'会社部門２', 
					'tel1'=>'電話番号１', 
					'tel2'=>'電話番号２', 
					'email1'=>'メールアドレス１', 
					'email2'=>'メールアドレス２', 
					'fax'=>'ファックス',

					'ink_count'=>'インク色数',
					'print_type'=>'プリント方法',
					'print_option'=>'オプション',
					'jumbo_plate'=>'ジャンボ版',
					'design_type'=>'原稿',
					'selective_name'=>'プリント箇所名',
				);
				$filename = $_REQUEST['csv'].".csv";
				$filepath = "../data/".$filename;
				$fp = fopen($filepath, 'wb');
				if($fp==false) echo 'Error: file open';

				$lbl = array();
				foreach($dat[0] as $key=>$val){
					$lbl[] = $fieldName[$key]? $fieldName[$key]: $key;
				}
				fputcsv($fp, $lbl);

				foreach($dat as $line){
					//mb_convert_variables('SJIS', 'UTF-8', $line);
					$line['ordertype'] = $orderType[$line['ordertype']];
					$line['carriage'] = $carriage[$line['carriage']];
					$line['payment'] = $payment[$line['payment']];
					fputcsv($fp, $line);
				}
			}
			
			fclose($fp);
	//		header('Access-Control-Allow-Origin: *');
			header("Content-Type: application/octet-stream");
			header("Content-Disposition: attachment; filename=$filename");
			readfile($filepath);
			//unlink($filepath);
		}
	}
	$result = mb_convert_encoding($result, 'euc-jp', 'utf-8');
	echo $result;
?>