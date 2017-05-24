<?php
/*
*	見積り計算　クラス
*	charset euc-jp
*	log:	2014-02-10 組付け代への割増率の適用を2014-03-01から廃止
*			2014-04-04 mysqliに変更
*			2014-04-26 検索条件の適用日付を注文確定日から発送日に変更
*			2014-07-25 転写の計算を変更
*			2014-08-29 カッティングのプレス準備代への割増率の計上を廃止
*			2014-09-15 商品情報の検索条件の適用日付を発送日から注文確定日に変更（割増率はプリント代計算関連とし従前どおり発送日で抽出）
*			2014-10-15 プリント業務ごとの売上集計のため返り値のハッシュを更新
*			2015-03-05 濃色インクジェットのプリント単価を変更
*			2017-05-24 プリント代計算の仕様変更、変更後はTLAのAPIを使用のため旧バージョン用として使用
*/
require_once dirname(__FILE__).'/catalog.php';
require_once dirname(__FILE__).'/MYDB2.php';
class Estimate extends MYDB2 {
/**
*	calcSilkPrintFee			シルクスクリーンのプリント代を返す
*	calcInkjetFee				インクジェットのプリント代を返す
*	calcTransFee2				デジタル転写のプリント代を返す
*	calcCuttingFee				カッティングのプリント代を返す
*	getExtraCharge				割増金額を返す
*
*	getPrintRatio				当該アイテムのプリント割増率を返す
*	getEstimation				当該注文の金額情報とアイテム毎のプリント代を算出した1枚あたり金額、少数点以下を切上げ
*	
*/

	private $curdate;		// 発送日
	
	/*
	*	setting	:	組付け代への割増率適用を廃止
	*	spec_v2 :	プリント代計算の仕様変更
	*/
	private $calcType = array(
		'setting'=>'2014-03-01',
		'spec_v2'=>'2017-05-24',
	);
	
	
	public function __construct($args){
		if(empty($args)){
			$this->curdate = date('Y-m-d');
		}else{
			$d = explode('-', $args);
			if(checkdate($d[1], $d[2], $d[0])==false){
				$this->curdate = date('Y-m-d');
			}else{
				$this->curdate = $args;
			}
		}
	}
	
	
	private function setCurdate($args){
		if(empty($args)){
			$this->curdate = date('Y-m-d');
		}else{
			$d = explode('-', $args);
			if(checkdate($d[1], $d[2], $d[0])==false){
				$this->curdate = date('Y-m-d');
			}else{
				$this->curdate = $args;
			}
		}
	}
	
	
	/**
	 * 割増金額を抽出
	 * @param {array} itemid アイテムIDをキーにした配列
	 * @return {array|boolean} s結果の配列を返す。失敗の場合は{@code FALSE}を返す
	 */
	private function getExtraCharge($itemid){
		try {
			$conn = parent::db_connect();
			$len = count($itemid);
			$sql = 'SELECT item.id as item_id, item_group2_id, price FROM item
				 inner join print_group on print_group.id=print_group_id
				 where item.id in('.implode( ' , ', array_fill(0, $len, '?') ).')
				 and itemapply<=? and itemdate>? and print_group_apply<=? and print_group_stop>?';
			$stmt = $conn->prepare($sql);
			$marker = '';
			$arr = array();
			$stmtParams = array();
			foreach ($itemid as $id=>$val) {
				$marker .= 'i';
				$arr[] = $id;
			}
			array_push($arr, $this->curdate,$this->curdate,$this->curdate,$this->curdate);
			$marker .= 'ssss';
			array_unshift($arr, $marker);
			foreach ($arr as $key => $value) {
				$stmtParams[$key] =& $arr[$key];	// bind_paramへの引数を参照渡しにする
			}
			call_user_func_array(array($stmt, 'bind_param'), $stmtParams);
			$stmt->execute();
			$stmt->store_result();
			$r = self::fetchAll($stmt);
		} catch (Exception $e) {
			$r = FALSE;
		}
		$stmt->close();
		$conn->close();
		return $r;
	} 
	
	
	/**
	 *	シルクスクリーンのプリント代を返す
	 *		@amount		数量
	 *		@area		プリント箇所数、1で固定
	 *		@inkcount	インク色数
	 *		@itemid		アイテムIDをキーにした当該アイテムの枚数の配列
	 *		@ratio		（未使用）割増率ID
	 *		@size		0:通常　1:ジャンボ版　2:スーパージャンボ
	 *		@extra		（未使用） スウェットの割増適用箇所の場合　default 1　（通常のカテゴリごとの割増率ratioを再割増）
	 *		@repeat		同版分類IDをキーにした版代を計上するかどうか判別する値、0:版代を計上　1:版代を引く（リピート）　2:版代を引く（同版）の配列
	 *		@return		{'tot':プリント代合計, 'plates':{同版分類ID:版代}, 'press':インク代計, 'extra':{アイテムID:割増金額}, 'group2':{同版分類ID:[アイテムID]}}
	 *
	 *------ 旧バージョン
	 *		@amount		数量
	 *		@area		プリント箇所数
	 *		@inkcount	インク色数
	 *		@itemid		アイテムID
	 *		@ratio		割増率ID
	 *		@size		0:通常　1:ジャンボ版　2:スーパージャンボ
	 *		@extra		スウェットの割増適用箇所の場合　default 1　（通常のカテゴリごとの割増率ratioを再割増）
	 *		@repeat		0：新版
	 *					1：リピート版		版代とデザイン代を引く
	 *					99：				版代とデザイン代と組付け代を引く
	 *
	 *		return		{'tot':プリント代, 'plates':版代＋デザイン代, 'setting':組付け代, 'press':インク代}
	 */
	public function calcSilkPrintFee($amount, $area, $inkcount, $itemid=0, $ratio=1, $size=0, $extra=1, $repeat=0){
		try{
			if($area<1 || $inkcount<1 || $amount<1) return 0;
			
			if (strtotime($this->calcType['spec_v2']) <= strtotime($this->curdate)) {
				// 仕様変更後
				if (empty($itemid) || !is_array($itemid)) {
					return 0;
				}
				
				// 割増金額を取得
				$r1 = $this->getExtraCharge($itemid);
				if(empty($r1)) return 0;
				
				// 割増金額をアイテム毎に算出
				// 同版分類でアイテムIDを集計
				$rs['extra'] = array();
				$extraCharge = 0;
				$len = count($r1);
				for ($i=0; $i<$len; $i++) {
					// 同版分類
					$rs['group2'][ $r1[$i]['item_group2_id'] ][] = $r1[$i]['item_id'];
					// 割増金額
					if (empty($r1[$i]['price'])) continue;
					$amountOfItem = $itemid[ $r1[$i]['item_id'] ];
					$rs['extra'][$r1[$i]['item_id']] = $r1[$i]['price'] * $amountOfItem * $inkcount;
					$extraCharge += $rs['extra'][$r1[$i]['item_id']];
				}
				
				// プリント代計算の単価を取得
				$plateName = array( 'silk-normal', 'silk-jumbo', 'silk-spjumbo' );
				$mode = $plateName[$size];
				$sql = 'select plate_charge.price as plateCharge, print_cost.price as inkFee from (print_method
				 inner join print_cost on print_method.id=print_cost.print_method_id)
				 left join plate_charge on print_method.id=plate_charge.print_method_id
				 where mode=? and num_over<=? and (num_less>=? or num_less=0) and 
				 print_method_apply<=? and print_method_stop>? and print_cost_apply<=? and print_cost_stop>?
				 and plate_charge_apply<=? and plate_charge_stop>? order by operand_index asc';
				$conn = parent::db_connect();
				$stmt = $conn->prepare($sql);
				$stmt->bind_param("siissssss", $mode, $amount, $amount, $this->curdate, $this->curdate, $this->curdate, $this->curdate, $this->curdate, $this->curdate);
				$stmt->execute();
				$stmt->store_result();
				$r2 = self::fetchAll($stmt);
				if(empty($r2)) return 0;
				
				// インク代
				$tot = 0;
				$tot += $r2[0]['inkFee'] * $amount;	// 1色目
				if ($inkcount>1) {
					$tot += $r2[1]['inkFee'] * $amount * ($inkcount - 1);	// 2色目以降
				}
				$rs['press'] = $tot;
				
				// 版代
				// 同版分類IDをキーにした版代の配列
				$plates = 0;
				foreach ($repeat as $group2Id => $isRepeat) {
					$rs['plates'][$group2Id] = $isRepeat==0? $r2[0]['plateCharge'] * $inkcount: 0;
					$plates += $rs['plates'][$group2Id];
				}
				
				// プリント代合計
				$rs['tot'] = $rs['press'] + $plates + $extraCharge;
			} else {
				// 旧計算仕様
				if($itemid!=0){
					$ratio = $this->getPrintRatio($itemid);
				}else{
					$ratio = $this->getPrintRatio(0, $ratio);
				}
				$ratio *= $extra;
				$superjumbo = $size==2? 2: 1;	// スーパージャンボは版代とプリント代とインク代を2倍

				$sql = "SELECT * FROM silkprice where silkapply<=? order by silkapply desc limit 1";
				$conn = parent::db_connect();
				$stmt = $conn->prepare($sql);
				$stmt->bind_param("s", $this->curdate);
				$stmt->execute();
				$stmt->store_result();
				$r = self::fetchAll($stmt);
				if(empty($r)) return 0;
				$rec = $r[0];

				if($repeat==0){
					$plates = $rec['plate']*$superjumbo + $rec['design'];
					$design = $rec['design'];
				}else{
					$plates = 0;
					$design = 0; 
				}

				$setting = $rec['operationcost'];
				if($repeat!=99){
					$setting += $rec['setting'];
				}

				$ink = ($rec['print']+$rec['ink'])*$superjumbo;
				if($size==1){
					$ink *= 1.5;
					$plates *= 1.5;
					$design *= 1.5;
				}
				$inkfee = ceil( (($ink*$amount) * $ratio) / 10 ) * 10;
				if(strtotime($this->calcType['setting'])<=strtotime($this->curdate)){	// 組付け代に割増率を適用しない
					$printfee = $setting + $inkfee;
				}else{
					$setting = ceil( ($setting * $ratio) / 10 ) * 10;
					$printfee = $setting + $inkfee;
				}
				$tot = ($plates + $printfee) * $area;	// 1色目

				// 2色以上ある場合
				$inkfee2 = 0;
				if($area<$inkcount){
					$rest = $inkcount-$area;
					$ink = ($rec['print']/2+$rec['ink'])*$superjumbo;
					if($size==1) $ink *= 1.5;
					$inkfee2 = ceil( (($ink*$amount) * $ratio) / 10 ) * 10 * $rest;
					$tot += ($plates + $setting)*$rest + $inkfee2;
				}
				// プリント代合計
				$rs['tot'] = $tot;
				// デザイン代
				$rs['design'] = $design*$inkcount;
				// 版代とデザイン代
				$rs['plates'] = $plates*$inkcount;
				// 組付け代
				$rs['setting'] = $setting*$inkcount;
				// インク代
				$rs['press'] = $inkfee+$inkfee2;
			}
		}catch(Exception $e){
			$rs = 0;
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/**
	 *	インクジェットのプリント代を返す
	 *		@option		淡色:0, 濃色:1
	 *		@amount		数量
	 *		@area		プリント箇所数、1で固定
	 *		@size		プリントサイズ（0:大、1:中、2:小）
	 *		@itemid		アイテムIDをキーにした当該アイテムの枚数の配列
	 *		@ratio		（未使用）割増率ID
	 *		@extra		（未使用） スウェットの割増適用箇所の場合　default 1　（通常のカテゴリごとの割増率ratioを再割増）
	 *		@repeat		（未使用）0:版代を計上　1:版代を引く（リピート）
	 *		@return		{'tot':プリント代合計, 'press':プレス代計, 'extra':{アイテムID:割増金額}}
	 *
	 *------ 旧バージョン
	 *		@option		白Ｔ:0(default), 黒Ｔ:1
	 *		@amount		数量
	 *		@area		プリント箇所数
	 *		@size		プリントサイズ（0:大、1:中、2:小）
	 *		@itemid		アイテムＩＤ
	 *		@ratio		割増率ID
	 *		@extra		スウェットの割増適用箇所の場合　default 1　（通常のカテゴリごとの割増率ratioを再割増）
	 *		@repeat		0：新版
	 *					1：リピート版		デザイン代を引く
	 *					99：				デザイン代と組付け代を引く
	 *
	 *		return		{'tot':プリント代, 'plates':版代＋デザイン代, 'setting':組付け代, 'press':プレス代}
	 */
	public function calcInkjetFee($option, $amount, $area, $size, $itemid=0, $ratio=1, $extra=1, $repeat=0){
		try{
			if($amount<1) return 0;
			
			if (strtotime($this->calcType['spec_v2']) <= strtotime($this->curdate)) {
				// 仕様変更後
				if (empty($itemid) || !is_array($itemid)) {
					return 0;
				}
				
				// 割増金額を取得
				$r1 = $this->getExtraCharge($itemid);
				if(empty($r1)) return 0;

				// 割増金額をアイテム毎に算出
				$rs['extra'] = array();
				$extraCharge = 0;
				$len = count($r1);
				for ($i=0; $i<$len; $i++) {
					if (empty($r1[$i]['price'])) continue;
					$amountOfItem = $itemid[ $r1[$i]['item_id'] ];
					$rs['extra'][$r1[$i]['item_id']] = $r1[$i]['price'] * $amountOfItem;
					$extraCharge += $rs['extra'][$r1[$i]['item_id']];
				}

				// プリント代計算の単価を取得
				$plateName = array( 'inkjet-pale', 'inkjet-deep' );
				$mode = $plateName[$option];
				$sql = 'select print_cost.price as fee from print_method
				 inner join print_cost on print_method.id=print_cost.print_method_id
				 where mode=? and operand_index=? and num_over<=? and (num_less>=? or num_less=0) and 
				 print_method_apply<=? and print_method_stop>? and print_cost_apply<=? and print_cost_stop>?';
				$conn = parent::db_connect();
				$stmt = $conn->prepare($sql);
				$stmt->bind_param("siiissss", $mode, $size, $amount, $amount, $this->curdate, $this->curdate, $this->curdate, $this->curdate);
				$stmt->execute();
				$stmt->store_result();
				$r2 = self::fetchAll($stmt);
				if(empty($r2)) return 0;

				// プリント代
				$rs['press'] = $r2[0]['fee'] * $amount;
				
				// プリント代合計
				$rs['tot'] = $rs['press'] + $extraCharge;
			} else {
				if($itemid!=0){
					$ratio = $this->getPrintRatio($itemid);
				}else{
					$ratio = $this->getPrintRatio(0, $ratio);
				}
				$ratio *= $extra;

				$sql = "SELECT * FROM inkjetprice where inkjetapply<=? order by inkjetapply desc limit 1";
				$conn = parent::db_connect();
				$stmt = $conn->prepare($sql);
				$stmt->bind_param("s", $this->curdate);
				$stmt->execute();
				$stmt->store_result();
				$r = self::fetchAll($stmt);
				if(empty($r)) return 0;
				$rec = $r[0];

				if($repeat==0){
					if($option==1){	// 黒T
						$design = $rec['design_1'];
					}else{
						$design = $rec['design'];
					}
				}else{
					$design = 0;
				}

				$setting = 0;
				if($repeat!=99){
					if($option==1){	// 黒T
						$setting += $rec['setting_1'];
					}else{
						$setting += $rec['setting'];
					}
				}

				$pressfee = $rec['press_0']*$amount;
				$printfee = $rec['print_0']+$rec['ink_'.$size];
				if($option==1){	// 黒T
					$printfee += $rec['paste']+$rec['press_1']+$rec['print_1']+$rec['ink_'.$size];
				}
				$printfee *= $amount;
				$press = ceil( (($pressfee+$printfee)*$ratio)/10 )*10 * $area;
				if(strtotime($this->calcType['setting'])<=strtotime($this->curdate)){	// 組付け代に割増率を適用しない
					$tot = ($design + $setting)*$area + $press;
				}else{
					$setting = ceil( (($setting)*$ratio)/10 )*10;
					$tot = ($design + $setting)*$area + $press;
				}
				// プリント代合計
				$rs['tot'] = $tot;
				// デザイン代
				$rs['plates'] = $design;
				$rs['design'] = $design;
				// 組付け代
				$rs['setting'] = $setting;
				// プレス代
				$rs['press'] = $press;
			}
		}catch(Exception $e){
			$rs = 0;
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/**
	 *		カッティングのプリント代を返す
	 *		@amount		数量
	 *		@area		プリント箇所数、1で固定
	 *		@size		プリントサイズ（0:大、1:中、2:小）
	 *		@itemid		アイテムIDをキーにした当該アイテムの枚数の配列
	 *		@ratio		（未使用）割増率
	 *		@extra		（未使用）スウェットの割増適用箇所の場合　default 1　（通常のカテゴリごとの割増率ratioを再割増）
	 *		@repeat		（未使用）0:版代を計上　1:版代を引く（リピート）
	 *		@return		{'tot':プリント代合計, 'press':プレス代計, 'extra':{アイテムID:割増金額}}
	 *
	 *------ 旧バージョン
	 *		@amount		数量
	 *		@area		プリント箇所数
	 *		@size		プリントサイズ（0:大、1:中、2:小）
	 *		@itemid		アイテムＩＤ
	 *		@ratio		割増率
	 *		@extra		スウェットの割増適用箇所の場合　default 1　（通常のカテゴリごとの割増率ratioを再割増）
	 *		@repeat		0：新版
	 *					1：リピート版		デザイン代を引く
	 *					99：				デザイン代と組付け代とプレス準備代を引く
	 *
	 *		return		{'tot':プリント代, 'plates':版代＋デザイン代, 'setting':組付け代, 'press':プレス代}
	 */
	public function calcCuttingFee($amount, $area, $size, $itemid=0, $ratio=1, $extra=1, $repeat=0){
		try{
			if($amount<1) return 0;
			if (strtotime($this->calcType['spec_v2']) <= strtotime($this->curdate)) {
				// 仕様変更後
				if (empty($itemid) || !is_array($itemid)) {
					return 0;
				}

				// 割増金額を取得
				$r1 = $this->getExtraCharge($itemid);
				if(empty($r1)) return 0;

				// 割増金額をアイテム毎に算出
				$rs['extra'] = array();
				$extraCharge = 0;
				$len = count($r1);
				for ($i=0; $i<$len; $i++) {
					if (empty($r1[$i]['price'])) continue;
					$amountOfItem = $itemid[ $r1[$i]['item_id'] ];
					$rs['extra'][$r1[$i]['item_id']] = $r1[$i]['price'] * $amountOfItem;
					$extraCharge += $rs['extra'][$r1[$i]['item_id']];
				}

				// プリント代計算の単価を取得
				$mode = 'cutting';
				$sql = 'select print_cost.price as fee from print_method
				 inner join print_cost on print_method.id=print_cost.print_method_id
				 where mode=? and operand_index=? and num_over<=? and (num_less>=? or num_less=0) and 
				 print_method_apply<=? and print_method_stop>? and print_cost_apply<=? and print_cost_stop>?';
				$conn = parent::db_connect();
				$stmt = $conn->prepare($sql);
				$stmt->bind_param("siiissss", $mode, $size, $amount, $amount, $this->curdate, $this->curdate, $this->curdate, $this->curdate);
				$stmt->execute();
				$stmt->store_result();
				$r2 = self::fetchAll($stmt);
				if(empty($r2)) return 0;

				// プリント代
				$rs['press'] = $r2[0]['fee'] * $amount;

				// プリント代合計
				$rs['tot'] = $rs['press'] + $extraCharge;
			} else {
				if($itemid!=0){
					$ratio = $this->getPrintRatio($itemid);
				}else{
					$ratio = $this->getPrintRatio(0, $ratio);
				}
				$ratio *= $extra;

				$sql = "SELECT * FROM cuttingprice where cuttingapply<=? order by cuttingapply desc limit 1";
				$conn = parent::db_connect();
				$stmt = $conn->prepare($sql);
				$stmt->bind_param("s", $this->curdate);
				$stmt->execute();
				$stmt->store_result();
				$r = self::fetchAll($stmt);
				if(empty($r)) return 0;
				$rec = $r[0];

				if($repeat==0){
					$design = $rec['design'];
				}else{
					$design = 0;
				}

				$setting = 0;
				$press = 0;
				if($repeat!=99){
					$setting += $rec['setting'];
					$press += $rec['prepress'];	//	2014-08-29 Tシャツと一部絵型でプレス準備を共有
				}
				/*	2014-08-29 プレス準備代への割増率の計上を廃止
				*	$press = ceil( (($rec['prepress']+$rec['press']*$amount)*$ratio)/10 ) * 10;
				*/
				$press += ceil( (($rec['press']*$amount)*$ratio)/10 ) * 10;
				if(strtotime($this->calcType['setting'])<=strtotime($this->curdate)){	// 組付け代に割増率を適用しない
					$pressfee = $setting + $press;
				}else{
					$setting = ceil( (($setting)*$ratio)/10 ) * 10;
					$pressfee = $setting + $press;
				}
				$sheetfee = ($rec['sheet_'.$size]+$rec['detach']+$rec['inpfee']+$rec['cutting']) * $amount;
				$tot = ($design+$pressfee+$sheetfee) * $area;
				// プリント代合計
				$rs['tot'] = $tot;
				// デザイン代
				$rs['plates'] = $design;
				$rs['design'] = $design;
				// 組付け代
				$rs['setting'] = $setting;
				// プレス代
				$rs['press'] = $press+$sheetfee;
			}
		}catch(Exception $e){
			$rs = 0;
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/**
	 *		デジタル転写のプリント代を返す
	 *		@amount		数量
	 *		@size		プリントサイズ（0:大、1:中、2:小）
	 *		@itemid		アイテムIDをキーにした当該アイテムの枚数の配列
	 *		@repeat		0:版代を計上　1:版代を引く（リピート）
	 *		@return		{'tot':プリント代合計, 'press':プレス代計, 'plates':版代, 'extra':{アイテムID:割増金額}}
	 */
	public function calcTransFee2($amount, $size, $itemid, $repeat=0){
		try{
			if ($amount<1) return 0;
			if (empty($itemid) || !is_array($itemid)) {
				return 0;
			}

			// 割増金額を取得
			$r1 = $this->getExtraCharge($itemid);
			if(empty($r1)) return 0;

			// 割増金額をアイテム毎に算出
			$rs['extra'] = array();
			$extraCharge = 0;
			$len = count($r1);
			for ($i=0; $i<$len; $i++) {
				if (empty($r1[$i]['price'])) continue;
				$amountOfItem = $itemid[ $r1[$i]['item_id'] ];
				$rs['extra'][$r1[$i]['item_id']] = $r1[$i]['price'] * $amountOfItem;
				$extraCharge += $rs['extra'][$r1[$i]['item_id']];
			}

			// プリント代計算の単価を取得
			$mode = 'trans';
			$sql = 'select plate_charge.price as plateCharge, print_cost.price as fee from (print_method
			 inner join print_cost on print_method.id=print_cost.print_method_id)
			 left join plate_charge on print_method.id=plate_charge.print_method_id and operand_index=plate_index
			 where mode=? and operand_index=? and num_over<=? and (num_less>=? or num_less=0) and 
			 print_method_apply<=? and print_method_stop>? and print_cost_apply<=? and print_cost_stop>?
			 and plate_charge_apply<=? and plate_charge_stop>?';
			$conn = parent::db_connect();
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("siiissssss", $mode, $size, $amount, $amount, $this->curdate, $this->curdate, $this->curdate, $this->curdate, $this->curdate, $this->curdate);
			$stmt->execute();
			$stmt->store_result();
			$r2 = self::fetchAll($stmt);
			if(empty($r2)) return 0;
			
			// プリント代
			$rs['press'] = $r2[0]['fee'] * $amount;
			
			// 版代
			$rs['plates'] = $repeat==0? $r2[0]['plateCharge'] : 0;

			// プリント代合計
			$rs['tot'] = $rs['press'] + $rs['plates'] + $extraCharge;
		}catch(Exception $e){
			$rs = 0;
		}

		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/**
	 *		刺繍のプリント代を返す
	 *		@option		0:オリジナル, 1:ネーム
	 *		@amount		数量
	 *		@size		プリントサイズ（0:大、1:中、2:小）
	 *		@itemid		アイテムIDをキーにした当該アイテムの枚数の配列
	 *		@repeat		0:版代を計上　1:版代を引く（リピート）
	 *		@return		{'tot':プリント代合計, 'press':プレス代計, 'plates':版代, 'extra':{アイテムID:割増金額}}
	 */
	public function calcEmbroideryFee($option, $amount, $size, $itemid, $repeat=0){
		try{
			if ($amount<1) return 0;
			if (empty($itemid) || !is_array($itemid)) {
				return 0;
			}

			// 割増金額を取得
			$r1 = $this->getExtraCharge($itemid);
			if(empty($r1)) return 0;

			// 割増金額をアイテム毎に算出
			$rs['extra'] = array();
			$extraCharge = 0;
			$len = count($r1);
			for ($i=0; $i<$len; $i++) {
				if (empty($r1[$i]['price'])) continue;
				$amountOfItem = $itemid[ $r1[$i]['item_id'] ];
				$rs['extra'][$r1[$i]['item_id']] = $r1[$i]['price'] * $amountOfItem;
				$extraCharge += $rs['extra'][$r1[$i]['item_id']];
			}

			// プリント代の単価を取得
			$plateName = array( 'embroidery-org', 'embroidery-name' );
			$mode = $plateName[$option];
			$sql = 'select print_method_id, print_cost.price as fee from print_method
			 inner join print_cost on print_method.id=print_cost.print_method_id
			 where mode=? and operand_index=? and num_over<=? and (num_less>=? or num_less=0) and 
			 print_method_apply<=? and print_method_stop>? and print_cost_apply<=? and print_cost_stop>?';
			$conn = parent::db_connect();
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("siiissss", $mode, $size, $amount, $amount, $this->curdate, $this->curdate, $this->curdate, $this->curdate);
			$stmt->execute();
			$stmt->store_result();
			$r2 = self::fetchAll($stmt);
			if(empty($r2)) return 0;
			
			// 型代を取得
			$sql = 'select coalesce(plate_charge.price, 0) as plateCharge from plate_charge
			 where print_method_id=? and plate_index=? and plate_charge_apply<=? and plate_charge_stop>?';
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("iiss", $r2[0]['print_method_id'], $size, $this->curdate, $this->curdate);
			$stmt->execute();
			$stmt->store_result();
			$r3 = self::fetchAll($stmt);
			if(empty($r3)) return 0;
			
			// プリント代
			$rs['press'] = $r2[0]['fee'] * $amount;

			// 型代
			$rs['plates'] = $repeat==0? $r3[0]['plateCharge'] : 0;

			// プリント代合計
			$rs['tot'] = $rs['press'] + $rs['plates'] + $extraCharge;
		}catch(Exception $e){
			$rs = 0;
		}

		$stmt->close();
		$conn->close();
		return $rs;
	}


	/**
	 *		転写のプレス代を返す（デジタル、カラー（白Ｔと黒Ｔ））
	 *		@tablename	プリント方法
	 *		@amount[]	プリント箇所ごとの枚数
	 *		@extra[]	スウェットの割増の配列、　default 1　（通常のカテゴリごとの割増率ratioを再割増）
	 *		@itemid		アイテムＩＤ
	 *		@ratio		割増率ID
	 *		@press[]	プリント箇所ごとのプレス準備代の有無（990,991: プレス準備代なし）
	 *
	 * 		return		プレス代
	 */
	public function calcTransFee($tablename, $amount, $extra, $itemid=0, $ratio=1, $press=0){
		try{
			if(max($amount)<1) return;
			if($itemid!=0){
				$ratio = $this->getPrintRatio($itemid);
			}else{
				$ratio = $this->getPrintRatio(0, $ratio);
			}
			
			if($tablename=='digit'){
				$sql = "SELECT * FROM digitprice where digitapply<=? order by digitapply desc limit 1";
				$paper = 'paper';
			}else{
				$sql = "SELECT * FROM colorprice where colorapply<=? order by colorapply desc limit 1";
				if(preg_match('/^dark/', $tablename)){
					$paper = 'paper_1';
				}else{
					$paper = 'paper_0';
				}
			}
			$conn = parent::db_connect();
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("s", $this->curdate);
			$stmt->execute();
			$stmt->store_result();
			$r = self::fetchAll($stmt);
			if(empty($r)) return 0;
			$rec = $r[0];
			
			/*
			if($repeat==0){
				$plate = $rec['plate'];
				$design = $rec['design'];
			}else{
				$plate = 0;
				$design = 0;
			}
			*/
			
			/* 版代＋デザイン代＋組付け代
			if(strtotime($this->calcType['setting'])<=strtotime($this->curdate)){	// 組付け代に割増率を適用しない
				//$platefee = $plate+$design + $rec['setting'];
				$setting = $rec['setting'];
			}else{
				//$platefee = $plate+$design + ceil( ($rec['setting']*$ratio)/10 ) * 10;
				$setting = ceil( ($rec['setting']*$ratio)/10 ) * 10;
			}
			*/
			
			// シート代
			//$sheetfee = $rec['ink']+$rec[$paper]+$rec['printer']+$rec['print'];
			// プレス代（箇所ごと）
			for($i=0; $i<count($amount); $i++){
				if(empty($amount[$i])) continue;
				/* 2014-07-26 仕様変更、プレス準備代に割増率をかけない
				*	$pressfee += ($rec['prepress']+$rec['press']*$amount[$i])*($ratio * $extra[$i]);
				*/
				
				// Tシャツと一部絵型でプレス準備を共有（990,991）
				if($press[$i]<990){
					$pressfee += $rec['prepress'];
				}
				$pressfee += ($rec['press']*$amount[$i])*($ratio * $extra[$i]);
			}
			$pressfee = ceil($pressfee/10)*10;
			
			/* [版数,シート数]
			if(empty($hash)){
				$hash = $this->getSheetCount($sheet, $shot);
			}
			*/
			/*
			$charge = $setting;
			$charge += $pressfee;
			$charge += $rec['presheet'];
			
			$sheetfee *= $hash[1];
			$rs = $charge;
			*/
			
			$rs = $pressfee;
		}catch(Exception $e){
			$rs = 0;
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/**
	 *		転写の版代とシート代を返す（デジタル、カラー（白Ｔと黒Ｔ））
	 *		@tablename	プリント方法
	 *		@sheet[]	版ごとのプリント位置をキーにしたデザインの大きさのシートに対する割合（1, 0.5, 0.25）絵型に関係なく同じプリント位置を同デザインとみなす
	 *		@shot[]		版ごとのプリント箇所ごとの枚数
	 *		@repeat		0：新版
	 *					1：リピート版		版代（デジタル）とデザイン代を引く
	 *
	 * 		return		[版代, シート代, デザイン代, プリント作業売上]
	 */
	public function calcTransCommonFee($tablename, $sheet, $shot, $repeat=0){
		try{
			if($tablename=='digit'){
				$sql = "SELECT * FROM digitprice where digitapply<=? order by digitapply desc limit 1";
				$paper = 'paper';
			}else{
				$sql = "SELECT * FROM colorprice where colorapply<=? order by colorapply desc limit 1";
				if(preg_match('/^dark/', $tablename)){
					$paper = 'paper_1';
				}else{
					$paper = 'paper_0';
				}
			}
			$conn = parent::db_connect();
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("s", $this->curdate);
			$stmt->execute();
			$stmt->store_result();
			$r = self::fetchAll($stmt);
			if(empty($r)) return 0;
			$rec = $r[0];
			
			// 版数とシート数を取得
			$hash = self::getSheetCount($sheet, $shot);
			
			// 版代とデザイン代
			if($repeat==0){
				$platefee = $rec['plate']+$rec['design'];
				$design = $rec['design'];
			}else{
				$platefee = 0;
				$design = 0;
			}
			
			// 組付け代
			if(strtotime($this->calcType['setting'])<=strtotime($this->curdate)){	// 組付け代に割増率を適用しない
				$setting += $rec['setting'];
			}else{
				$setting += ceil( ($rec['setting']*$ratio)/10 ) * 10;
			}
			$platefee += $setting;
			
			// シート準備代
			$platefee += $rec['presheet'];
			
			// 版数をかける
			$platefee *= $hash[0];
			$design *= $hash[0];
			
			// シート代
			$sheetfee = $rec['ink']+$rec[$paper]+$rec['printer']+$rec['print'];
			$sheetfee *= $hash[1];
			
			// プリント作業売上
			$printwork = ($setting+$rec['presheet'])*$hash[0] + $sheetfee;
			
			$rs = array($platefee, $sheetfee, $design, $printwork);
		}catch(Exception $e){
			$rs = array(0, 0, 0, 0);
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/**
	 *		転写のシート数と版数を返す（デジタル、カラー（白Ｔと黒Ｔ））(Static)
	 *		@sheet[]	版ごとのプリント位置をキーにしたデザインの大きさのシートに対する割合（1, 0.5, 0.25）絵型に関係なく同じプリント位置を同デザインとみなす
	 *		@shot[]		版ごとのプリント箇所ごとの枚数
	 *
	 *		return		[版数,シート数]
	 */
	public static function getSheetCount($sheet, $shot){
		try{
			foreach($sheet as $plates=>$val){
				// デザインの大きい順、枚数の多い順でソート
				$tmp = array();
				foreach($val as $pos=>$size){
					$tmp[] = array('size'=>$size, 'volume'=>$shot[$plates][$pos]);
				}
				for($i=0; $i<count($tmp); $i++){
					$a[$i] = $tmp[$i]['size'];
					$b[$i] = $tmp[$i]['volume'];
				}
				array_multisort($a,SORT_DESC, $b,SORT_DESC, $tmp);
				
				// 版数
				$base = array();	// 面付けされた各デザインの枚数
				for($i=0; $i<count($tmp); $i++){
					$court += $tmp[$i]['size'];
					$idx = floor($court);	// 版数-1
					if(fmod($court,1)==0) $idx--;
					$base[$idx][] = $tmp[$i]['volume'];
					
					//$sheets += $shot[$plates][$pos]*$size; // シート数
				}
			}
			
			// シート数
			$sheets = 0;
			$cnt = count($base)-1;
			for($i=0; $i<$cnt; $i++){
				$sheets += max($base[$i]);
			}
			// 面付けで端数の部分
			$a = fmod($court,1);	// 端数
			if($a==0.25){		// 小
				$sheets += ceil($base[$cnt][0]/4);
			}else if($a==0.5){
				if(count($base[$cnt])==1){	// 中
					$sheets += ceil($base[$cnt][0]/2);
				}else{						// 小,小
					if($base[$cnt][0]!=$base[$cnt][1]){
						$max = max($base[$cnt]);
						$min = min($base[$cnt]);
						$s1 = ceil(max($base[$cnt])/2);	// 面付け「2,2」
						$s2 = min($base[$cnt]);			// 面付け「1,3」
						$sheets += min($s1, $s2); // シート数が少なくなる面付けを適用したシート数
					}else{
						$sheets += ceil($base[$cnt][0]/2);
					}
				}
			}else if($a==0.75){
				if(count($base[$cnt])==2){	// 中,小
					$sheets += max($base[$cnt][0], ceil($base[$cnt][1]/2));
				}else{						// 小,小,小
					// 一番枚数の多いデザインを2面付け
					$sheets += max(ceil($base[$cnt][0]/2), $base[$cnt][1], $base[$cnt][2]);
				}
			}else{
				$sheets += max($base[$cnt]);
			}
			
			// 基シート数（版数）
			$base = ceil($court);
			
			$res = array($base, $sheets);
			
			/*
			$a = fmod($court,1);	// 端数
			$b = floor($court);		// 整数値
			if($a==0.75){
				$sheets = $volume + $b*$volume;
				if($volume>3 && $platefee+$rec['presheet'] < floor($volume/4)*$sheetfee){
					$sheets = $volume-floor($volume/4) + $b*$volume;
					$base++;
				}
			}else{
				$sheets = ceil($a*$amount[0]) + $b*$amount[0];
			}
			*/
		}catch(Exception $e){
			$res = array(0, 0);;
		}
		return $res;
	}
	
	
	/**
	 *		当該アイテムのプリント割増率を返す
	 *		@itemid		アイテムのID
	 *		@ratioid		割増率ID（default is 0）
	 *
	 *		return			割増率
	 */
	public function getPrintRatio($itemid, $ratioid=null){
		try{
			if(is_null($ratioid)){
				$param = $itemid;
				$sql= "SELECT * FROM item inner join printratio on item.printratio_id=printratio.ratioid WHERE item.id=? and printratioapply<=? order by printratioapply desc limit 1";
			}else{
				$param = $ratioid;
				$sql= "SELECT * FROM printratio WHERE ratioid=? and printratioapply<=? order by printratioapply desc limit 1";
			}
			$conn = parent::db_connect();
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("is", $param, $this->curdate);
			$stmt->execute();
			$stmt->store_result();
			$rec = self::fetchAll($stmt);
			$rs = $rec[0]['ratio'];
		}catch(Exception $e){
			$rs = '';
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/**
	 *		転写の版数を返す（デジタル、カラー（白Ｔと黒Ｔ））(Static)
	 *		@tablename		プリント方法（テーブル名）
	 *		@amount		数量
	 *		@sheet			初期シートを構成する各プリントの大きさの配列（0.25,　0.5,　1）
	 *		@repeat		原版：0
	 *						リピート版：版代とデザイン代を引く
	 *							1:初回リピート
	 *							2:2回目以降リピート
	 * 						   99:既に同じ版でプリントされている場合
	 *		@connent		データベースへの接続を指定（default=0: 新たに接続する, 1: 接続済み）
	 *
	 *		return			版数
	 */
	public static function getBaseCount($tablename, $amount, $sheet, $repeat=0, $connect=0){
		try{
			if($connect==0) $conn = db_connect();
			if(preg_match('/^dark/', $tablename)){
				$tablename = preg_replace('/dark/', '', $tablename);
				$paper = 'paper_1';
			}elseif(preg_match('/^colorprice/', $tablename)){
				$paper = 'paper_0';
			}else{
				$paper = 'paper';
			}
			$sql= sprintf("SELECT * FROM %s ", $tablename);
			$result = exe_sql($conn, $sql);
			$rec = mysqli_fetch_array($result);
			
			if($repeat==0){
				$plate = $rec['plate'];
				$design = $rec['design'];
			}else{
				$plate = 0;
				$design = 0;
			}
			
			$platefee = $plate+$design+$rec['setting'];
			$sheetfee = $rec['ink']+$rec[$paper]+$rec['printer']+$rec['print'];
			
			for($i=0; $i<count($sheet); $i++){
				$court += $sheet[$i]; 
			}
			
			$base = ceil($court);
			$a = fmod($court,1);
			$b = floor($court);
			if($a==0.75){
				if($amount>3 && $platefee+$rec['presheet'] < floor($amount/4)*$sheetfee){
					$base++;
				}
			}
			
		}catch(Exception $e){
			$base = '0';
		}
		
		if($connect==0) mysqli_close($conn);
	
		return $base;
	}
	
	
	/**
	*	当該注文の金額情報とアイテム毎のプリント代と商品単価
	*	その他と持込を除外
	*	@args	order ID
	*
	*	return	[見積情報]
	*/
	public function getEstimation($args){
		try{
			if(empty($args)) return;
			
			$conn = parent::db_connect();
			
			// 注文リストを取得
			//	その他 itemid:0			category:0
			//	持込み itemid:100000	category:100
			$sql = "select *, 
				coalesce(orderitemext.item_id, item.id) as itemid,
				coalesce(category_id, (case when orderitemext.item_id=0 then 0 else 100 end)) as categoryid,
				coalesce(printratio_id, 0) as ratioid,
				coalesce(printposition_id, (case when orderitemext.item_id=0 then concat(0,'_',orderitemext.item_name) else concat(100,'_',orderitemext.item_name) end)) as ppid
				 from (((((orders 
				 inner join acceptstatus on orders.id=acceptstatus.orders_id)
				 inner join estimatedetails on orders.id=estimatedetails.orders_id)
				 inner join orderitem on orders.id=orderitem.orders_id)
				 left join orderitemext on orderitem.id=orderitem_id)
				 left join catalog on master_id=catalog.id)
				 left join item on catalog.item_id=item.id
				 where orders.id=?";
			if($stmt = $conn->prepare($sql)){
				$stmt->bind_param("i", $args);
				$stmt->execute();
				$stmt->store_result();
				$items = self::fetchAll($stmt);
			}else{
				throw new Exception('Error: orderlist');
			}
			
			$isFirmOrder = $items[0]['progress_id']==4? true: false;
			$item_curdate = $items[0]['schedule2'];
			$curdate = $items[0]['schedule3'];
			$this->setCurdate($curdate);		// 発送日の設定
			$ordertype = $items[0]['ordertype'];
			$reuse = $items[0]['reuse']==255? 0: $items[0]['reuse'];		// リピート割の適用状態
			
			$catalog = new Catalog();
			$item = array();
			$estimated = empty($items[0]['basefee'])? $items[0]['estimated']: $items[0]['basefee'];	// 税抜きの見積合計を使用する
			$print_fee = array('tot'=>0, 
							   'order_amount'=>$items[0]['order_amount'], 
							   'estimated'=>$estimated, 
							   'productfee'=>$items[0]['productfee'], 
							   'printfee'=>$items[0]['printfee'], 
							   'discountfee'=>$items[0]['discountfee'],
							   'reductionfee'=>$items[0]['reductionfee'],
							   'expressfee'=>$items[0]['expressfee'],
							   'additionalfee'=>$items[0]['additionalfee'],
							   );
			
			// 割増率、デザイン、カテゴリ、絵型ごとの枚数とアイテム毎の枚数を集計
			for($i=0; $i<count($items); $i++){
				// アイテム単価
				if( ($items[$i]['color_id']==59 && $items[$i]['item_id']!=112) || ($items[$i]['color_name']==42 && ($items[$i]['item_id']==112 || $items[$i]['item_id']==212)) ) $isWhite=1;
				else $isWhite=0;
				if($items[$i]['noprint']==1) $isPrint = 0;
				else $isPrint = 1;
				if($ordertype=='general'){
					if($isFirmOrder){
						$cost = intval($items[$i]['item_cost'], 10);
					}else{
						$cost = intval($catalog->getItemPrice($items[$i]['item_id'], $items[$i]['size_id'], $isPrint, $isWhite, $item_curdate, $ordertype, $items[$i]['amount']), 10);
					}
				}else{
					$cost = intval($items[$i]['price'], 10);
				}
				
				$cat = $items[$i]['categoryid'];
				$itemid = $items[$i]['itemid'];
				$ratio = $items[$i]['ratioid'];
				$ppID = $items[$i]['ppid'];
				$plate = $items[$i]['plateis'];
				
				$item[$plate][$cat][$ppID][$ratio]['item_id'][$itemid] += $items[$i]['amount'];
				$item[$plate][$cat][$ppID][$ratio]['volume'] += $items[$i]['amount'];
				$print_fee['item'][$itemid]['amount'] += $items[$i]['amount'];
				$print_fee['item'][$itemid]['fee'] = 0;
				$print_fee['item'][$itemid]['discount'] = 0;
				$print_fee['item'][$itemid]['cost'] += $cost * $items[$i]['amount'];
			}
			
			// プリント情報を取得（その他と持込を除外）
			$sql = "select * from (orderprint inner join orderarea on orderprint.id=orderarea.orderprint_id)
				 inner join orderselectivearea on orderarea.areaid=orderselectivearea.orderarea_id
				 where category_id!=0 and category_id<99 and orderprint.orders_id=?";
			if($stmt = $conn->prepare($sql)){
				$stmt->bind_param("i", $args);
				$stmt->execute();
				$stmt->store_result();
				$press = self::fetchAll($stmt);
			}else{
				throw new Exception('Error: printinfo');
			}
			
			// プリント位置ごとに対応するアイテムのプリント代計算のパラメータを集計
			$param = array();
			for($i=0; $i<count($press); $i++){
				$plate = $press[$i]['design_plate'];			// デザイン
				$cat = $press[$i]['category_id'];				// カテゴリ
				$ppID = $press[$i]['printposition_id'];			// 絵型
				$print_type = $press[$i]['print_type'];			// プリント方法
				$extra_class = $press[$i]['selective_key'];		// プリント位置
				$pos_name = $press[$i]['selective_name'];		// プリント位置
				$printoption = $press[$i]['print_option'];		// インクジェットとカラー転写のオプション
				$rep_check = $press[$i]['repeat_check'];		// 絵型ごとのリピート版チェック
				$extra = 1;										// スウェットの再割増率
				if($cat==2 && ($extra_class=="mae_hood" || $extra_class=="hood_left" || $extra_class=="hood_right")){
					$extra = 1.5;
				}else if($cat==2 && ($extra_class=="parker_mae_pocket" || $extra_class=="parker_mae_mini_zip"
				 || $extra_class=="jacket_mae_mini" || $extra_class=="osiri" || $extra_class=="pants_osiri")){
					$extra = 2;
				}
				
				switch($print_type){
					case 'silk':	$ink = $press[$i]['ink_count'];
									$shot = $press[$i]['jumbo_plate'];
									break;
					case 'inkjet':	
					case 'cutting':	$shot = $press[$i]['areasize_id'];
									break;
					case 'trans':	
					case 'digit':	$shot = $press[$i]['areasize_id'];
									if($printoption==1 and $print_type=='trans') $print_type = 'dark'.$print_type;
									break;
				}
				
				$designStatus = $pos_name.'_'.$shot;	// デザイン指定が同じデータを集計するキー
				
				// プリント箇所ごとのパラメータを設定
				if(isset($item[$plate][$cat][$ppID])){
					$target = $item[$plate][$cat][$ppID];
					foreach($target as $ratio=>$val){
						
						$repeat_id = 0;
						$setting_group = '';
						if($print_type=='silk' || $print_type=='inkjet' || $print_type=='cutting'){
							if($cat==7){	// キャップは常に版代を計上する
								$repeat_id = $reuse;
							}else if( $cat==1 || preg_match('/^(1|2|3|4|5|12|13|14|15)$/', $ppID) ){
								// Tシャツと一部絵型で同じプリント位置指定がすでにある場合は組付け代を引く
								if(empty($plate_check[$print_type][$plate][$designStatus])){
									$repeat_id = $reuse;
								}else if($plate_check[$print_type][$plate][$designStatus]==2){
									$repeat_id = 99;	// 版代とデザイン代と組付け代を差引く
								}else{
									$repeat_id = 1;		// 版代とデザイン代を差引く
								}
								$plate_check[$print_type][$plate][$designStatus] = 2;
								$setting_group = $designStatus;
							}else if(empty($plate_check[$print_type][$plate][$designStatus])){
								$repeat_id = $reuse;
								$plate_check[$print_type][$plate][$designStatus] = 1;
							}else{
								$repeat_id = 1;			// 版代とデザイン代を差引く
							}
						}else{
							if( $cat==1 || preg_match('/^(1|2|3|4|5|12|13|14|15)$/', $ppID) ){
								// Tシャツと一部絵型で同じプリント位置指定がすでにある場合はプレス準備代を引く
								if(empty($plate_check[$print_type][$plate][$designStatus])){
									$repeat_id = $reuse;
								}else  if($plate_check[$print_type][$plate][$designStatus]==2){
									// プレス準備代を差引く
									if(repeat==0){
										$repeat_id = 990;	// 新版
									}else{
										$repeat_id = 991;	// リピ版
									}
								}else{
									$repeat_id = $reuse;
								}
								$plate_check[$print_type][$plate][$designStatus] = 2;
							}else if(empty($plate_check[$print_type][$plate][$designStatus])){
								$repeat_id = $reuse;
								$plate_check[$print_type][$plate][$designStatus] = 1;
							}else{
								$repeat_id = $reuse;
							}
						}
						
						$param[] = array(
							'area'=>1,
							'extra'=>$extra,
							'ink'=>$ink,
							'size'=>$shot,
							'printkey'=>$print_type,
							'amount'=>$val['volume'],
							'item_id'=>$val['item_id'],
							'repeat'=>$repeat_id,
							'ratio'=>$ratio,
							'plates'=>$plate,
							'option'=>$printoption,
							'pos'=>$designStatus,
							'setting'=>$setting_group,
						);
					}
				}
			}
			
			/*
			*	箇所ごとにプリント代を計算してアイテムごとに集計
			*	転写は割増率とデザイン毎にまとめる
			*/
			$sheetsize = array(1, 0.5, 0.25);
			$basedata = array();
			$transdata = array();
			$temporary = array();	// シルク、インクジェット、カッティングの集計用
			for($i=0; $i<count($param); $i++){
				$printtype = $param[$i]['printkey'];
				$tmp = array();
				switch($printtype){
					case 'silk':
						$tmp = $this->calcSilkPrintFee($param[$i]['amount'], $param[$i]['area'], $param[$i]['ink'], 0, $param[$i]['ratio'], $param[$i]['size'], $param[$i]['extra'], $param[$i]['repeat']);
						break;
					case 'trans':
					case 'darktrans':
					case 'digit':
						// シート数と版数の算出用
						$rep = $param[$i]['repeat']==990 || $param[$i]['repeat']==0? 0: 1;
						$pos = $param[$i]['pos'].'_'.$param[$i]['size'];
						$basedata[$printtype][$rep]['size'][$param[$i]['plates']][$pos] = $sheetsize[$param[$i]['size']];	// プリント位置ごと（同じ版とみなす）
						$basedata[$printtype][$rep]['shot'][$param[$i]['plates']][$pos] += $param[$i]['amount'];				// プリント位置ごとの枚数
						$basedata[$printtype][$rep]['volume'] += $param[$i]['amount'];		// プリント方法ごとの延べ枚数
						$basedata[$printtype][$rep]['item_id'][] = $param[$i]['item_id'];	// 箇所ごとのアイテム
						// プリント割増率別で計算
						$key = $param[$i]['ratio'];
						$transdata[$printtype][$key]['amount'][] = $param[$i]['amount'];	// 箇所ごとの枚数
						$transdata[$printtype][$key]['extra'][] = $param[$i]['extra'];
						$transdata[$printtype][$key]['press'][] = $param[$i]['repeat'];
						// アイテムごとのプリント代集計用
						$transdata[$printtype][$key]['item_id'][] = $param[$i]['item_id'];	// 箇所ごとのアイテム
						$transdata[$printtype][$key]['totamount'] += $param[$i]['amount'];	// 延べ枚数
						break;
					case 'inkjet':
						$tmp = $this->calcInkjetFee($param[$i]['option'], $param[$i]['amount'], $param[$i]['area'], $param[$i]['size'], 0, $param[$i]['ratio'], $param[$i]['extra'], $param[$i]['repeat']);
						break;
					case 'cutting':
						$tmp = $this->calcCuttingFee($param[$i]['amount'], $param[$i]['area'], $param[$i]['size'], 0, $param[$i]['ratio'], $param[$i]['extra'], $param[$i]['repeat']);
						break;
				}
				
				// アイテムごとのプリント代を集計（転写を除く）
				if(!empty($tmp)){
					$print_fee['tot'] += $tmp['tot'];
					$print_fee[$printtype] += $tmp['tot'];
					
					// プリント作業の売上集計用
					$print_fee['sales'][$printtype] += $tmp['setting']+$tmp['press'];
					$print_fee['sales']['design'] += $tmp['design'];
					
					// 共通コストの集計用
					$tmp['amount'] = $param[$i]['amount'];
					$tmp['item_id'] = $param[$i]['item_id'];
					$tmp['repeat'] = $param[$i]['repeat'];
					$tmp['setting_group'] = $param[$i]['setting'];
					$temporary[$printtype][$param[$i]['pos']][] = $tmp;
				}
			}
			
			// シルク、インクジェット、カッティングのアイテムごとの集計
			if(!empty($temporary)){
				foreach($temporary as $printname=>$data){	// プリント方法ごと
					foreach($data as $posname=>$val){		// プリント位置ごと（同じ版とみなす）
						$sub_amount = 0;
						$sub_plates = 0;
						$sub_setting = array();
						$sub_setting_amount = array();
						$sub_settingfee = array();
						$is99 = false;
						
						// 共通コスト
						for($i=0; $i<count($val); $i++){
							$sub_amount += $val[$i]['amount'];	// 同じ版でプリントする枚数合計
							$sub_plates += $val[$i]['plates'];	// 版代とデザイン代
							
							// 違う絵型で組付け代を除外するケース
							if(empty($val[$i]['setting_group'])) continue;
							$sub_setting[$val[$i]['setting_group']] += $val[$i]['setting'];	// 組付け代
							$sub_setting_amount[$val[$i]['setting_group']] += $val[$i]['amount'];
							if($val[$i]['repeat']==99) $is99 = true;
						}
						$plates_fee = $sub_plates/$sub_amount;				// 1枚あたりの版代とデザイン代
						if($is99){
							foreach($sub_setting as $setting=>$charge){
								$sub_settingfee[$setting] = $charge/$sub_setting_amount[$setting];	// 組付け代を引く場合に該当するアイテム1枚あたり
							}
						}
						
						// アイテムごとのプリント代
						for($i=0; $i<count($val); $i++){
							$sub_press = $val[$i]['press']/$val[$i]['amount'];	// インク代やプレス代は箇所ごと
							if( $is99 && isset($sub_settingfee[$val[$i]['setting_group']]) ){
								$perone = $plates_fee+$sub_press+$sub_settingfee[$val[$i]['setting_group']];
							}else{
								$perone = $plates_fee+$sub_press+($val[$i]['setting']/$val[$i]['amount']);
							}
							/*
							switch($val[$i]['repeat']){
								case 0:	if($is99){
											$perone = $sub_plates+$sub_press+$sub_settingfee;
										}else{
											$perone = $sub_plates+$sub_press+($val[$i]['setting']/$val[$i]['amount']);
										}
										break;
								case 1:	$perone = $sub_plates+$sub_press+($val[$i]['setting']/$val[$i]['amount']);
										break;
								case 99:$perone = $sub_plates+$sub_press+$sub_settingfee;
										break;
							}
							*/
							// 当該プリント箇所に対応するアイテム
							foreach($val[$i]['item_id'] as $itemid=>$volume){
								$print_fee['item'][$itemid]['fee'] += ($perone*$volume);
								$print_fee['item'][$itemid]['amount'] = $volume;
							}
						}
					}
				}
			}
			
			// 転写
			if(!empty($transdata)){
				foreach($transdata as $tbl=>$dat){
					foreach($basedata[$tbl] as $rep=>$val){
						// プリント方法ごとの[版代, シート代]
						$common_cost = $this->calcTransCommonFee($tbl, $val['size'], $val['shot'], $rep);
						$cost = $common_cost[0]+$common_cost[1];
						$print_fee[$tbl] += $cost;
						$print_fee['tot'] += $cost;
						$perone = $cost/$val['volume'];
						
						// アイテム毎に版代とシート代を案分
						for($i=0; $i<count($val['item_id']); $i++){
							foreach($val['item_id'][$i] as $itemid=>$volume){
								$print_fee['item'][$itemid]['fee'] += ($perone*$volume);
							}
						}
						
						// デザイン代
						$print_fee['sales']['design'] += $common_cost[2];
						
						// 売上集計用
						$worktype = $tbl=='darktrans'? 'trans': $tbl;
						$print_fee['sales'][$worktype] += $common_cost[3];
					}
					
					// 割増率ごと
					foreach($transdata[$tbl] as $ratio=>$val){
						// 組付け代＋プレス代
						$tmp = $this->calcTransFee($tbl, $val['amount'], $val['extra'], 0, $ratio, $val['press']);
						$print_fee[$tbl] += $tmp;
						$print_fee['tot'] += $tmp;
						
						// 売上集計用
						$worktype = $tbl=='darktrans'? 'trans': $tbl;
						$print_fee['sales'][$worktype] += $tmp;
						
						// アイテム毎のプリント代
						$perone = $tmp/$val['totamount'];
						for($i=0; $i<count($val['item_id']); $i++){
							foreach($val['item_id'][$i] as $itemid=>$volume){
								$print_fee['item'][$itemid]['fee'] += ($perone*$volume);
								$print_fee['item'][$itemid]['amount'] = $volume;
							}
						}
					}
				}
			}
			
			// アイテムごとに浮動小数点を丸める
			foreach($print_fee['item'] as &$val){
				$val['fee'] = round($val['fee']);
			}
			unset($val);
			
			// アイテムごとの割引額
			if($print_fee['discountfee']!=0){
				$p1 = $print_fee['productfee']+$print_fee['printfee'];
				foreach($print_fee['item'] as &$val){
					$sub = $val['fee']+$val['cost'];
					$val['discount'] = round($print_fee['discountfee']*(($sub)/$p1));
				}
			}
			unset($val);
			
			// プリント代手入力の場合
			if($items[0]['free_printfee']==1){
				// プリント作業の売上集計用
				//$print_fee['subtotal'] = $print_fee['tot'];			// DEBUG
				foreach($print_fee['sales'] as $key=>&$val){
					$ratio = $print_fee[$key]/$print_fee['tot'];	// 各プリント方法の割合
					$sales_ratio = $val/$print_fee[$key];			// プリント作業の売上に計上する金額の当該プリント方法のプリント代に対する割合
					$val = ceil($items[0]['printfee']*$ratio*$sales_ratio);
				}
				unset($val);
				
				$print_fee['tot'] = $items[0]['printfee'];
				$print_fee['perone'] = ceil($items[0]['printfee']/$items[0]['order_amount']);
				
			}
			
			
		}catch(Exception $e){
			$print_fee = $e->getMessage();
		}
		
		$stmt->close();
		$conn->close();
		
		return $print_fee;
	}
}
?>