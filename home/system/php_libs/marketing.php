<?php
/**
 * マーケティング　クラス
 * charset UTF-8
 * log : 2015-03-18 created
 *		 2016-11-01 CSVダウンロード用のデータ集計を実装
 *		 2019-09-02 仕事量（シルク、転写、プレス）のデータ集計
 */
require_once dirname(__FILE__).'/MYDB2.php';
class Marketing Extends MYDB2 {

	private $orders = null;

	public function __construct($orders = null){
		parent::__construct();

		$this->orders = $orders;
	}

	private static function validDate($args, $defDate='2011-06-05')
	{
		if(empty($args)){
			return $defDate;
		}else{
			$args = str_replace("/", "-", $args);
			$d = explode('-', $args);
			if(checkdate($d[1], $d[2], $d[0])==false){
				return $defDate;
			}else{
				return $args;
			}
		}
	}

	/**
	 * 受注データ集計、CSV出力用
	 * @param string $start 受注入力登録日による検索開始日
	 * @param string $end 受注入力登録日による検索終了日
	 * @param int $id 受注No.
	 *
	 * @reutrn [受注情報]
	 */
	public static function getOrderList($start=null, $end=null, $id=null)
	{
		try{
			$sql = "select orders.id as ordersid, staffname, ordertype, progressname, maintitle, pack_yes_volume, pack_nopack_volume, order_amount, ";
			$sql .= " carriage, boxnumber, factory, schedule1, schedule2, schedule3, schedule4, noprint, exchink_count, manuscript, ";
			$sql .= " discount1, discount2, staffdiscount, extradiscount, extradiscountname, free_discount, reductionname, ";
			$sql .= " additionalname, payment, ";
			$sql .= " (case when coalesce(expressfee,0)=0 then 0 else round(expressfee/(productfee+printfee+exchinkfee+packfee+discountfee+designfee),1)+1 end) as express, ";
			$sql .= " carriage, deliverytime, purpose, purpose_text, orders.job as job, repeatdesign, ";
			$sql .= " outsource, business, ";
			$sql .= " productfee, printfee, silkprintfee, colorprintfee, digitprintfee, inkjetprintfee, cuttingprintfee, embroideryprintfee, ";
			$sql .= " discountfee, reductionfee, exchinkfee, estimatedetails.additionalfee as additionalfee, packfee, expressfee, carriagefee, designfee, codfee, creditfee, salestax, basefee, ";
			$sql .= " estimated, ";
			$sql .= " (case when customer.cstprefix='k' then concat('K', lpad(customer.number,6,'0')) else concat('G', lpad(customer.number,4,'0')) end) as customer_num, "; 
			$sql .= " customername, customerruby, company as dept, companyruby as deptruby, ";
			$sql .= " zipcode, addr0, addr1, addr2, addr3, addr4, ";
			$sql .= " tel as tel1, mobile as tel2, email as email1, mobmail as email2, fax";
			
			$sql .= " from (((((orders ";
			$sql .= " inner join acceptstatus on orders.id=acceptstatus.orders_id) ";
			$sql .= " inner join acceptprog on progress_id=aproid) ";
			$sql .= " left join estimatedetails on orders.id=estimatedetails.orders_id) ";
			$sql .= " left join staff on reception=staff.id) ";
			$sql .= " left join customer on customer_id=customer.id) ";
			$sql .= " where progress_id!=6";
			if($id){
				$sql .= " and orders.id=?";
			}
			$sql .= " and schedule3 between ? and ?";
			$sql .= " order by schedule3, orders.id";
			
			$start = self::validDate($start);
			$end = self::validDate($end, date('Y-m-d'));
			$conn = self::db_connect();
			$stmt = $conn->prepare($sql);
			if($id){
				$stmt->bind_param("iss", $id, $start, $end);
			}else{
				$stmt->bind_param("ss", $start, $end);
			}
			$stmt->execute();
			$stmt->store_result();
			$rs = self::fetchAll($stmt);
			
		}catch(Exception $e){
			$rs = '';
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}

	/**
	 * プリントデータ集計、CSV出力用
	 * @param string start 受注入力登録日による検索開始日
	 * @param string end 受注入力登録日による検索終了日
	 * @param int id 受注No.
	 *
	 * @reutrn [プリント情報]
	 */
	public static function getPrintList($start=null, $end=null, $id=null)
	{
		try{
			$sql = "select orders.id as ordersid, ink_count, print_type, print_option, jumbo_plate, design_type, selective_name from (((orders ";
			$sql .= "inner join acceptstatus on orders.id=acceptstatus.orders_id) ";
			$sql .= "left join orderprint on orders.id=orderprint.orders_id) ";
			$sql .= "left join orderarea on orderprint.id=orderprint_id) ";
			$sql .= "left join orderselectivearea on areaid=orderarea_id ";
			$sql .= " where progress_id!=6";
			if($id){
				$sql .= " and orders.id=?";
			}
			$sql .= " and schedule3 between ? and ?";
			$sql .= " order by schedule3, orders.id";
			$conn = self::db_connect();
			$stmt = $conn->prepare($sql);
			$start = self::validDate($start);
			$end = self::validDate($end, date('Y-m-d'));
			if($id){
				$stmt->bind_param("iss", $id, $start, $end);
			}else{
				$stmt->bind_param("ss", $start, $end);
			}
			$stmt->execute();
			$stmt->store_result();
			$rs = self::fetchAll($stmt);
			
		}catch(Exception $e){
			$rs = "";
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}

	/**
	 * 注文商品データ集計、CSV出力用
	 * @param string start	受注入力登録日による検索開始日
	 * @param string end 受注入力登録日による検索終了日
	 * @param int id 受注No.
	 * @param mode NULL(default) or otherwise
	 *
	 * @reutrn[注文商品情報]
	 */
	public static function getOrderItemList($start=null, $end=null, $id=null, $mode=null)
	{
		try{
			if(empty($mode)){
				$sql = "select orders.id as ordersid, coalesce(case orderitemext.item_id 
					 when 100000 then '持込' 
					 when 99999 then '転写シート' 
					 when 0 then 'その他' 
					 else null end, category_name) as catname, ";
				$sql .= " case when item_code is null then '' else item_code end as item_code, ";
				$sql .= " coalesce(item.item_name, orderitemext.item_name) as item_name, ";
				$sql .= " coalesce(size.size_name, orderitemext.size_name) as size_name, ";
				$sql .= " color_code, coalesce(itemcolor.color_name, orderitemext.item_color) as color_name, ";
				$sql .= " coalesce(maker.maker_name, orderitemext.maker) as maker_name,";
				$sql .= " amount, ";
				$sql .= " coalesce(orderitemext.price, orderitem.item_cost) as item_cost";
				$sql .= " from ((((((((orders";
				$sql .= " left join orderitem on orders.id=orderitem.orders_id)";
				$sql .= " left join orderitemext on orderitem.id=orderitemext.orderitem_id)";
				$sql .= " inner join acceptstatus on orders.id=acceptstatus.orders_id)";
				$sql .= " left join size on orderitem.size_id=size.id)";
				$sql .= " left join catalog on orderitem.master_id=catalog.id)";
				$sql .= " left join category on catalog.category_id=category.id)";
				$sql .= " left join item on catalog.item_id=item.id)";
				$sql .= " left join maker on item.maker_id=maker.id)";
				$sql .= " left join itemcolor on catalog.color_id=itemcolor.id";
				$sql .= " where progress_id!=6";
			}else{
				$sql = "select additionalestimate.orders_id as ordersid, addsummary, addamount, addcost, addprice";
				$sql .= " from (orders";
				$sql .= " inner join additionalestimate on orders.id=additionalestimate.orders_id)";
				$sql .= " inner join acceptstatus on orders.id=acceptstatus.orders_id";
				$sql .= " where progress_id!=6";
			}
			if($id){
				$sql .= " and orders.id=?";
			}
			$sql .= " and schedule3 between ? and ?";
			$sql .= " order by orders.id ";
			$conn = self::db_connect();
			$stmt = $conn->prepare($sql);
			$start = self::validDate($start);
			$end = self::validDate($end, date('Y-m-d'));
			if($id){
				$stmt->bind_param("iss", $id, $start, $end);
			}else{
				$stmt->bind_param("ss", $start, $end);
			}
			$stmt->execute();
			$stmt->store_result();
			$rs = self::fetchAll($stmt);
		}catch(Exception $e){
			$rs = array();
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}

	/**
	 * 仕事量（シルク、転写、プレス）のデータ集計、CSV出力用
	 * @param string start 作業終了チェック日による検索開始日
	 * @param string end 作業終了チェック日による検索終了日
	 *
	 * @reutrn [プリント情報]
	 */
	public function getWorktimeList($start=null, $end=null)
	{
		try {
			$rs = [];
			$factoryName = [
				0 => '-',
				1 => '１工場',
				2 => '２工場',
				9 => '１-２工場',
			];
			
			// シルク
			$data = [
				'fin_5' => 3,
				'start' => $start,
				'end' => $end,
			];
			$silkList = $this->orders->db('search', 'silklist', $data);
			foreach ($silkList as $v) {
				$rs[] = [
					'部門' => 'シルク',
					'発送日' => $v['schedule3'],
					'工場' => $factoryName[$v['factory']],
					'担当' => $v['staffname'] ?: '未定',
					'仕事量' => $v['capacity'] + $v['adjworktime'],
				];
			}
			
			// 転写
			$data = [
				'fin_3' => 3,
				'start' => $start,
				'end' => $end,
			];
			$transList = $this->orders->db('search', 'translist', $data);
			foreach ($transkList as $v) {
				$rs[] = [
					'部門' => '転写',
					'発送日' => $v['schedule3'],
					'工場' => $factoryName[$v['factory']],
					'担当' => $v['staffname'] ?: '未定',
					'仕事量' => $v['wt'] + $v['adjtime'],
				];
			}
			
			// プレス
			$data = [
				'fin_4' => 3,
				'start' => $start,
				'end' => $end,
			];
			$pressList = $this->orders->db('search', 'presslist', $data);
			foreach ($pressList as $v) {
				$rs[] = [
					'部門' => 'プレス',
					'発送日' => $v['schedule3'],
					'工場' => $factoryName[$v['factory']],
					'担当' => $v['staffname'] ?: '未定',
					'仕事量' => $v['wt'] + $v['adjtime'],
				];
			}
		} catch (Exception $e) {
			$rs = [];
		}
		
		return $rs;
	}

	/**
	 * 割引データ
	 * @param id 受注No.
	 *
	 * @reutrn [割引情報]
	 */
	public static function getDiscountInfo($id)
	{
		try{
			$sql = "select discount_name from discount where orders_id=? and discount_state=1";
			$conn = self::db_connect();
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("i", $id);
			$stmt->execute();
			$stmt->store_result();
			$rs = self::fetchAll($stmt);

		}catch(Exception $e){
			$rs = "";
		}

		$stmt->close();
		$conn->close();
		return $rs;
	}

	/**
	 * 注文商品データ
	 * @param id 受注No.
	 * @param ordertype general(default) or industry
	 *
	 * @reutrn [注文商品情報]
	 */
	public static function getOrderItem($id, $ordertype="general")
	{
		try{
			$sql = "select coalesce(case orderitemext.item_id 
				 when 100000 then '持込' 
				 when 99999 then '転写シート' 
				 when 0 then 'その他' 
				 else null end, category_name) as catname, ";
			$sql .= " case when item_code is null then '' else item_code end as item_code, ";
			$sql .= " coalesce(item.item_name, orderitemext.item_name) as item_name, ";
			$sql .= " coalesce(size.size_name, orderitemext.size_name) as size_name, ";
			$sql .= " color_code, coalesce(itemcolor.color_name, orderitemext.item_color) as color_name, ";
			$sql .= " coalesce(maker.maker_name, orderitemext.maker) as maker_name,";
			$sql .= " amount, ";
			$sql .= " coalesce(orderitemext.price, orderitem.item_cost) as item_cost";
			$sql .= " from ((((((orderitem";
			$sql .= " left join orderitemext on orderitem.id=orderitemext.orderitem_id)";
			$sql .= " left join size on orderitem.size_id=size.id)";
			$sql .= " left join catalog on orderitem.master_id=catalog.id)";
			$sql .= " left join category on catalog.category_id=category.id)";
			$sql .= " left join item on catalog.item_id=item.id)";
			$sql .= " left join maker on item.maker_id=maker.id)";
			$sql .= " left join itemcolor on catalog.color_id=itemcolor.id";
			$sql .= " where orderitem.orders_id=?";
			$conn = self::db_connect();
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("i", $id);
			$stmt->execute();
			$stmt->store_result();
			$rs_items = self::fetchAll($stmt);

			$rs_aditional = array();
			if($ordertype!="general"){
				$sql = "select addsummary, addamount, addcost, addprice from additionalestimate where orders_id=?";
				$stmt = $conn->prepare($sql);
				$stmt->bind_param("i", $id);
				$stmt->execute();
				$stmt->store_result();
				$rec = self::fetchAll($stmt);
				$rs_aditional = $rec;
			}

			$rs = array("orderitem"=>$rs_items, "additional"=>$rs_aditional);
		}catch(Exception $e){
			$rs = array("orderitem"=>array(), "additional"=>array());
		}

		$stmt->close();
		$conn->close();
		return $rs;
	}

	/**
	 * === 未使用 ===
	 * トムス未発注データ集計、CSV出力用
	 * @param int $factory 工場
	 * @reutrn[注文商品情報]
	 */
	public static function getOrderingList($factory)
	{
		try{
			$conn = self::db_connect();

			// トムスのマスター
			$tomsMaster = [];
			$sqlToms = "select * from tomsmaster";

			if ($result = $conn->query($sqlToms)) {
				while ($row = $result->fetch_assoc()) {
					$itemCode = sprintf("%03d", $row['toms_item_code']);
					$sizeName = $row['toms_size_name'];
					$colorcode = $row['toms_color_code'];
					$key = $itemCode . '--' . $sizeName . '--' . $colorcode;

					// 正規化した「アイテムコード、サイズ名、カラーコード」をキーにしたハッシュ
					$tomsMaster[$key]['item_code'] = $row['toms_item_code'];
					$tomsMaster[$key]['color_code'] = $row['toms_color_code'];
					$tomsMaster[$key]['size_code'] = $row['toms_size_code'];
					$tomsMaster[$key]['size_name'] = $row['toms_size_name'];
				}

				$result->close();
			} else {
				throw new Exception();
			}

			// トムスの未発注データ
			$rs = [];
			$tmp = [];
			$sql = "select orders.id as ordersid, schedule2, staffname, customer_id, customername, color_code, amount, pack_yes_volume,
			 coalesce(case orderitemext.item_id
			 when 100000 then '持込'
			 when 99999 then '転写シート'
			 when 0 then 'その他'
			 else null end, category_name) as catname,
			 case when item_code is null then '' else item_code end as item_code,
			 coalesce(size.size_name, orderitemext.size_name) as sizename
			 from (((((((((((orders
			 inner join customer on customer_id=customer.id)
			 inner join orderitem on orders.id=orderitem.orders_id)
			 inner join staff on orders.reception=staff.id)
			 left join orderitemext on orderitem.id=orderitem_id)
			 left join size on orderitem.size_id=size.id)
			 left join catalog on orderitem.master_id=catalog.id)
			 left join category on catalog.category_id=category.id)
			 left join item on catalog.item_id=item.id)
			 left join maker on item.maker_id=maker.id)
			 left join itemcolor on catalog.color_id=itemcolor.id)
			 inner join acceptstatus on orders.id=acceptstatus.orders_id)
			 inner join progressstatus on orders.id=progressstatus.orders_id
			 where created>'2011-06-05' and progress_id=4 and shipped=1
			 and catalogapply<=schedule2 and catalogdate>schedule2 and itemapply<=schedule2 and itemdate>schedule2
			 and maker.id=1 and ordering=0
			 and orders.factory = ?
			 order by schedule2, customer.id";

			$stmt = $conn->prepare($sql);
			$stmt->bind_param("i", $factory);
			$stmt->execute();
			$stmt->store_result();
			$tmp = self::fetchAll($stmt);

			$sizeIds = array(
				'70'=>1,'80'=>2,'90'=>3,'100'=>4,'110'=>5,'120'=>6,'130'=>7,'140'=>8,'150'=>9,'160'=>10,
				'JS'=>11,'JM'=>12,'JL'=>13,'WS'=>14,'WM'=>15,'WL'=>16,'GS'=>17,'GM'=>18,'GL'=>19,
				'XS'=>20,'S'=>21,'M'=>22,'L'=>23,'XL'=>24,'XXL'=>25,'3L'=>26,'4L'=>27,'5L'=>28,'6L'=>29,'7L'=>30,'8L'=>31);

			$len = count($tmp);
			if (empty($tmp)) {
				throw new Exception();
			}

			for($i = 0; $i < $len; $i++){
				$a[$i] = $tmp[$i]['schedule_2'];
				$b[$i] = $tmp[$i]['customer_id'];
				$c[$i] = $tmp[$i]['ordersid'];
				$d[$i] = $tmp[$i]['catname'];
				$e[$i] = $tmp[$i]['item_code'];
				$f[$i] = $tmp[$i]['color_code'];
				$g[$i] = $sizeIds[$tmp[$i]['sizename']];
			}
			array_multisort($a,$b,$c,$d,$e,$f,$g, $tmp);

			for($i = 0; $i < $len; $i++){
				$key = explode('-', $tmp[$i]['item_code'])[0] . '--' . $tmp[$i]['sizename'] . '--' . $tmp[$i]['color_code'];

				$rs[$i]['item_code'] = $tomsMaster[$key]['item_code'];
				$rs[$i]['color_code'] = $tmp[$i]['color_code'];
				$rs[$i]['size_code'] = $tomsMaster[$key]['size_code'];
				$rs[$i]['quantity'] = $tmp[$i]['amount'];
				$rs[$i]['opp'] = $tmp[$i]['pack_yes_volume'] ?: '';
				$rs[$i]['remarks'] = $tmp[$i]['staffname'] . '、' .  $tmp[$i]['ordersid'] . '、' . $tmp[$i]['customername'];
				$rs[$i]['order_number'] = '';
			}
		}catch(Exception $e){
			$rs = array();
		}

		if ($stmt) $stmt->close();
		$conn->close();

		return $rs;
	}

	/**
	 * トムス未発注データCSV出力用
	 * @param int $factory
	 * @return int|string
	 */
	public static function getCsvOrderForm($factory)
	{
		try {
			$reply = '';
			$record = [];
			$conn = parent::db_connect();

			// 発注データ
			$sql = "select orders.id as ordersid, schedule2, staffname, customer_id, customername, amount, pack_yes_volume, category_name,
				tomsmaster.*
				from ((((((((((orders
				inner join customer on customer_id = customer.id)
				inner join orderitem on orders.id = orderitem.orders_id)
				inner join staff on orders.reception = staff.id)
				inner join catalog on orderitem.master_id = catalog.id)
				inner join category on catalog.category_id = category.id)
				inner join item on catalog.item_id = item.id)
				inner join maker on item.maker_id = maker.id)
				inner join acceptstatus on orders.id = acceptstatus.orders_id)
				inner join progressstatus on orders.id = progressstatus.orders_id)
				inner join itemstock on stock_master_id = catalog.id)
				inner join tomsmaster on tomsmaster.jan_code = itemstock.jan_code
				where created > '2011-06-05' and progress_id = 4 and shipped = 1
				and catalogapply <= schedule2 and catalogdate > schedule2 and itemapply <= schedule2 and itemdate > schedule2
				and orderitem.size_id = stock_size_id and maker.id=1 and ordering=0
				and orders.factory = ?
				order by schedule2, customer.id, orders.id, category_name, item.id, toms_color_code, toms_size_code;";
			$stmt_order = $conn->prepare($sql);

			// 項目
			$fieldName = array(
				'品番',
				'カラーコード',
				'サイズコード',
				'数量',
				'OPP袋同送数',
				'備考（納品書・出荷案内書の行）',
				'お客様注文Ｎｏ．'
			);

			// 工場
			$factories = [
				'1', '2', '9',
			];

			foreach ($factories as $factory) {
				$stmt_order->bind_param("i", $factory);
				$stmt_order->execute();
				$stmt_order->store_result();
				$rec = parent::fetchAll($stmt_order);

				$record[$factory][] = $fieldName;
				$len = count($rec);

				for ($i = 0; $i < $len; $i++) {
					$row_id++;
					$orderId = mb_convert_kana($rec[$i]['ordersid'], 'N', 'utf-8');				// 全角数字に変換
					// $orderId = mb_convert_encoding($orderId, 'sjis', 'utf-8');					// shift_jisに変換
					$customerName = mb_convert_kana($rec[$i]['customername'], 'ASHcV', 'utf-8');// 全角ひらがな英数字に変換
					$customerName = mb_substr($customerName, 0, 16, 'utf-8');					// マルチバイトの切り出し
					// $customerName = mb_convert_encoding($customerName, 'sjis', 'utf-8');		// shift_jisに変換
					$staffName = mb_convert_kana($rec[$i]['staffname'], 'ASHcV', 'utf-8');		// 全角ひらがな英数字に変換
					$staffName = mb_substr($staffName, 0, 16, 'utf-8');							// マルチバイトの切り出し
					// $staffName = mb_convert_encoding($staffName, 'sjis', 'utf-8');				// shift_jisに変換
					$pack = empty($rec[0]['pack_yes_volume']) ?: '';							// OPP袋の枚数、無い場合は空文字
					$comma = '、';
					// $comma = mb_convert_encoding('、', 'sjis', 'utf-8');						// shift_jisに変換
					$remarks = $staffName . $comma .  $orderId . $comma . $customerName;

					$rs = [];
					$rs[] = $rec[$i]['toms_item_code'];		//  1.品番
					$rs[] = $rec[$i]['toms_color_code'];	//  2.カラーコード
					$rs[] = $rec[$i]['toms_size_code'];		//  3.サイズコード
					$rs[] = $rec[$i]['amount'];				//  4.数量
					$rs[] = $pack;							//  5.OPP袋同送数
					$rs[] = $remarks;						//  6.備考（納品書・出荷案内書の行）
					$rs[] = "";								//  7.お客様注文No.（記載不要）

					$record[$factory][] = $rs;
				}

				if ($len > 0) {
					$reply[$factory] = $record[$factory];
				}
			}
		} catch (Exception $e) {
			$reply = '';
		}

		$stmt_order->close();
		$conn->close();

		return $reply;
	}

	/**
	 * CSV出力
	 * シルクの受注毎、プリント箇所毎のインク色数とインク色
	 * 受注区分：一般
	 * 注文確定
	 *
	 * @param  string|null  $start
	 * @param  string|null  $end
	 * @param  integer|null  $id
	 * @param  string|null  $mode  
	 * @return array
	 */
	public static function getExportCsv($start = null, $end = null, $id = null, $mode = null)
	{
		try {
			$sql = "select schedule3, ink_name, orders.id as orderid, selective_name from orders ";
			$sql .= "inner join acceptstatus on acceptstatus.orders_id = orders.id ";
			$sql .= "inner join orderprint on orderprint.orders_id = orders.id ";
			$sql .= "inner join orderarea on orderarea.orderprint_id = orderprint.id ";
			$sql .= "inner join orderselectivearea on orderselectivearea.orderarea_id = areaid ";
			$sql .= "inner join orderink on orderink.orderarea_id = orderselectivearea.orderarea_id "; 
			$sql .= "where progress_id = 4 and orderarea.print_type = 'silk' and ordertype = 'general' ";
			if ($id) {
				$sql .= "and orders.id=?";
			}
			$sql .= "and schedule3 between ? and ? ";
			$sql .= "group by schedule3, orders.id, areaid, ink_name ";
			$sql .= "order by schedule3";
	
			$conn = self::db_connect();
			$stmt = $conn->prepare($sql);
			$start = self::validDate($start);
			$end = self::validDate($end, date('Y-m-d'));
			if ($id) {
				$stmt->bind_param("iss", $id, $start, $end);
			} else {
				$stmt->bind_param("ss", $start, $end);
			}
			$stmt->execute();
			$stmt->store_result();
			$rs = self::fetchAll($stmt);
			
		} catch (Exception $e) {
			$rs = [];
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}


/*=========== Pending ========================================*/
	
	
	/*
	*	ユーザー情報（未使用）
	*	@start	注文確定日による検索開始日
	*	@end	注文確定日による検索終了日
	*	@id		ユーザーID
	*
	*	reutrn	[ユーザー情報]
	*/
	public static function getCustomerList($start=null, $end=null, $id=null)
	{
		try{
			$sql = "select (case when customer.cstprefix='k' then concat('K', lpad(customer.number,6,'0')) else concat('G', lpad(customer.number,4,'0')) end) as customer_num,";
			$sql .= " customername, customerruby, company as dept, companyruby as deptruby,";
			$sql .= " insert(zipcode, 4, 0, '-') as zipcode, addr0, addr1, addr2, addr3, addr4,";
			$sql .= " tel as tel1, mobile as tel2, email as email1, mobmail as email2, fax,";
			$sql .= " sum(estimated) as total_price, count(orders.id) as order_count,";
			$sql .= " (case when count(orders.id)>1 then 1 else 0 end) as repeater,";
			$sql .= " min(schedule3) as first_order, max(schedule3) as recent_order, DATE_FORMAT(schedule3, '%Y') as yy from (orders";
			$sql .= " inner join acceptstatus on orders.id=acceptstatus.orders_id)";
			$sql .= " inner join customer on orders.customer_id=customer.id";
			$sql .= " where created>'2011-06-05' and progress_id=4";
			$sql .= " and schedule3 between ? and ?";
			if($id){
				$sql .= " and customer_id=?";
			}
			$sql .= " group by customer_id, DATE_FORMAT(schedule3, '%Y')";
			$sql .= " order by cstprefix desc, number, yy";
			
			if($start){
				$start = str_replace("/", "-", $start);
				$d = explode('-', $start);
				if(checkdate($d[1], $d[2], $d[0])==false){
					$start = "2011-06-05";
				}
			}else{
				$start = "2011-06-05";
			}
			
			if($end){
				$end = str_replace("/", "-", $end);
				$d = explode('-', $end);
				if(checkdate($d[1], $d[2], $d[0])==false){
					$end = date('Y-m-d');
					$curYear = intVal(date('Y'), 10);
				} else {
					$curYear = intVal($d[0], 10);
				}
			}else{
				$end = date('Y-m-d');
				$curYear = intVal(date('Y'), 10);
			}
			
			$conn = self::db_connect();
			$stmt = $conn->prepare($sql);
			if($id){
				$stmt->bind_param("ssi", $start, $end, $id);
			}else{
				$stmt->bind_param("ss", $start, $end);
			}
			$stmt->execute();
			$stmt->store_result();
			$tmp = self::fetchAll($stmt);
			
			// 複数の年度に売り上げがある場合にレコードを集計
			$recordCount = -1;
			$len = count($tmp);
			for ($i = 0; $i < $len; $i++) {
				if ($tmp[$i]['customer_num'] !== $rs[$recordCount]['customer_num']) {
					$recordCount++;
					$rs[$recordCount] = $tmp[$i];
					for ($t = 2011; $t <= $curYear; $t++) {
						$rs[$recordCount][$t.'金額'] = 0;
						$rs[$recordCount][$t.'回数'] = 0;
					}
					$rs[$recordCount][$tmp[$i]['yy'].'金額'] = $tmp[$i]['total_price'];
					$rs[$recordCount][$tmp[$i]['yy'].'回数'] = $tmp[$i]['order_count'];
				} else {
					$rs[$recordCount][$tmp[$i]['yy'].'金額'] = $tmp[$i]['total_price'];
					$rs[$recordCount][$tmp[$i]['yy'].'回数'] = $tmp[$i]['order_count'];
					$rs[$recordCount]['total_price'] += $tmp[$i]['total_price'];
					$rs[$recordCount]['order_count'] += $tmp[$i]['order_count'];
					$rs[$recordCount]['recent_order'] = $tmp[$i]['recent_order'];
				}
			}
			
		}catch(Exception $e){
			$rs = '';
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/*
	*	受注データ（未使用）
	*	@start	受注入力登録日による検索開始日
	*	@end	受注入力登録日による検索終了日
	*	@id		受注No.
	*
	*	reutrn	[販売情報]
	*/
	public static function getSalesList($start=null, $end=null, $id=null)
	{
		try{
			$sql = "select orders.id as ordersid, staffname, ordertype, maintitle, pack_yes_volume, pack_nopack_volume, order_amount, ";
			$sql .= " carriage, boxnumber, factory, schedule1, schedule2, schedule3, schedule4, noprint, exchink_count, manuscript, ";
			$sql .= " discount1, discount2, staffdiscount, extradiscount, extradiscountname, free_discount, reductionname, ";
			$sql .= " additionalname, payment, ";
			$sql .= " (case when coalesce(expressfee,0)=0 then 0 else round(expressfee/(productfee+printfee+exchinkfee+packfee+discountfee+designfee),1)+1 end) as express, ";
			$sql .= " carriage, deliverytime, purpose, orders.job as job, repeatdesign, ";
			$sql .= " productfee, printfee, silkprintfee, colorprintfee, digitprintfee, inkjetprintfee, cuttingprintfee, ";
			$sql .= " discountfee, reductionfee, exchinkfee, estimatedetails.additionalfee as additionalfee, packfee, expressfee, carriagefee, designfee, codfee, creditfee, salestax, basefee, ";
			$sql .= " estimated, ";
			$sql .= " customer_id";
			
			$sql .= " from ((((orders ";
			$sql .= " inner join acceptstatus on orders.id=acceptstatus.orders_id) ";
			$sql .= " left join estimatedetails on orders.id=estimatedetails.orders_id) ";
			$sql .= " left join staff on reception=staff.id) ";
			$sql .= " left join customer on customer_id=customer.id) ";
			
			$sql .= " where created>'2011-06-05' and progress_id=4";
			if($id){
				$sql .= " and orders.id=?";
			}
			$sql .= " and created between ? and ?";
			$sql .= " order by schedule3, orders.id";
			
			if($start){
				$start = str_replace("/", "-", $start);
				$d = explode('-', $start);
				if(checkdate($d[1], $d[2], $d[0])==false){
					$start = "2011-06-05";
				}
			}else{
				$start = "2011-06-05";
			}
			
			if($end){
				$end = str_replace("/", "-", $end);
				$d = explode('-', $end);
				if(checkdate($d[1], $d[2], $d[0])==false){
					$end = date('Y-m-d');
				}
			}else{
				$end = date('Y-m-d');
			}
			
			$conn = self::db_connect();
			$stmt = $conn->prepare($sql);
			if($id){
				$stmt->bind_param("iss", $id, $start, $end);
			}else{
				$stmt->bind_param("ss", $start, $end);
			}
			$stmt->execute();
			$stmt->store_result();
			$rs = self::fetchAll($stmt);
			
			$cnt = count($rs);
			
			// discount info
			for($i=0; $i<$cnt; $i++){
				$rs[$i]["discount0"] = self::getDiscountInfo($rs[$i]["ordersid"]);
			}
			
			// order item
			for($i=0; $i<$cnt; $i++){
				$tmp = self::getOrderItem($rs[$i]["ordersid"], $rs[$i]["ordertype"]);
				$rs[$i]["orderitem"] = $tmp["orderitem"];
				$rs[$i]["additional"] = $tmp["additional"];
			}
			
			// print info
			for($i=0; $i<$cnt; $i++){
				$rs[$i]["printinfo"] = self::getPrintInfo($rs[$i]["ordersid"]);
			}
			
		}catch(Exception $e){
			$rs = '';
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/*
	*	プリントデータ（未使用）
	*	@id		受注No.
	*
	*	reutrn	[プリント情報]
	*/
	public static function getPrintInfo($id)
	{
		try{
			$sql = "select orderprint.id as orderprintid, printposition_id, printposition.item_type as printpositino_type";
			$sql .= " from orderprint left join printposition on orderprint.printposition_id=printposition.id";
			$sql .= " where orderprint.orders_id=?";
			$conn = self::db_connect();
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("i", $id);
			$stmt->execute();
			$stmt->store_result();
			$rs_print = self::fetchAll($stmt);
			
			$sql = "select areaid, area_name, selective_name, print_name, repeat_check, areasize_from, areasize_to, areasize_id,";
			$sql .= " print_option, design_size, jumbo_plate, design_type";
			$sql .= " from (orderarea";
			$sql .= " left join printtype on orderarea.print_type=printtype.print_key)";
			$sql .= " left join orderselectivearea on orderarea.areaid=orderselectivearea.orderarea_id";
			$sql .= " where orderarea.orderprint_id=?";
			$stmt_area = $conn->prepare($sql);
			
			$sql = "select ink_code, ink_name from orderink";
			$sql .= " where orderink.orderarea_id=?";
			$stmt_ink = $conn->prepare($sql);
			
			$rs = array();
			$cnt = count($rs_print);
			for($i=0; $i<$cnt; $i++){
				$stmt_area->bind_param("i", $rs_print[$i]["orderprintid"]);
				$stmt_area->execute();
				$stmt_area->store_result();
				$rs_area = self::fetchAll($stmt_area);
				
				$cnt_area = count($rs_area);
				for($t=0; $t<$cnt_area; $t++){
					$stmt_ink->bind_param("i", $rs_area[$t]["areaid"]);
					$stmt_ink->execute();
					$stmt_ink->store_result();
					$rs_area[$t]["inks"] = self::fetchAll($stmt_ink);
				}
				$rs[$i]["printpositino_type"] = $rs_print[$i][printpositino_type];
				$rs[$i]["area"] = $rs_area;
			}
		}catch(Exception $e){
			$rs = "";
		}
		
		$stmt->close();
		$stmt_area->close();
		$stmt_ink->close();
		$conn->close();
		return $rs;
	}
	
	
	/*
	*	売上伝票データ（未使用）
	*	@start	発送日による検索開始日
	*	@end	発送日による検索終了日
	*	@id		受注No.
	*
	*	reutrn	[売上台帳へのインポートデータ]
	*/
	public static function getSalesLedger($start=null, $end=null, $id=null)
	{
		try{
			$sql = "select orders.id as ordersId, schedule3, customer_id, ordertype, order_amount, ";
			$sql .= " productfee, printfee, silkprintfee, colorprintfee, digitprintfee, inkjetprintfee, cuttingprintfee, ";
			$sql .= " discountfee, reductionfee, exchinkfee, estimatedetails.additionalfee as additionalfee, packfee, ";
			$sql .= " expressfee, carriagefee, designfee, codfee, creditfee, salestax, basefee, estimated, ";
			$sql .= " bill";
			$sql .= " from ((((orders ";
			$sql .= " inner join acceptstatus on orders.id=acceptstatus.orders_id) ";
			$sql .= " left join estimatedetails on orders.id=estimatedetails.orders_id) ";
			$sql .= " left join staff on reception=staff.id) ";
			$sql .= " left join customer on customer_id=customer.id) ";
			
			$sql .= " where created>'2011-06-05' and progress_id=4";
			if($id){
				$sql .= " and orders.id=?";
			}
			$sql .= " and schedule3 between ? and ?";
			$sql .= " order by schedule3, orders.id";
			
			if($start){
				$start = str_replace("/", "-", $start);
				$d = explode('-', $start);
				if(checkdate($d[1], $d[2], $d[0])==false){
					$start = "2011-06-05";
				}
			}else{
				$start = "2011-06-05";
			}
			
			if($end){
				$end = str_replace("/", "-", $end);
				$d = explode('-', $end);
				if(checkdate($d[1], $d[2], $d[0])==false){
					$end = date('Y-m-d');
				}
			}else{
				$end = date('Y-m-d');
			}
			
			$conn = self::db_connect();
			$stmt = $conn->prepare($sql);
			if($id){
				$stmt->bind_param("iss", $id, $start, $end);
			}else{
				$stmt->bind_param("ss", $start, $end);
			}
			$stmt->execute();
			$stmt->store_result();
			$data = self::fetchAll($stmt);
			
			$cnt = count($data);
			
			// detail field
			$fld = array(
						"silkprintfee", "colorprintfee", "digitprintfee", "inkjetprintfee", "cuttingprintfee",
						"discountfee", "reductionfee", "exchinkfee", "additionalfee", "packfee",
						"expressfee", "carriagefee", "designfee", "codfee", "creditfee",
						);
			$fldCount = count($fld);
				
			// order item
			for($i=0; $i<$cnt; $i++){
				$tmp = self::getOrderItem($data[$i]["ordersid"], $data[$i]["ordertype"]);
				$data[$i]["orderitem"] = $tmp["orderitem"];
				$data[$i]["additional"] = $tmp["additional"];
				
				$detailID = 0;	// 明細行番号
				
				// 商品
				for($t=0; $t<count($tmp["orderitem"]); $t++){
					$detailID++;
					$args = array(
							'id' => $data[$i]['ordersId'],
							'orderDate' => $data[$i]['schedule3'],
							'customerId' => $data[$i]['customer_id'],
							'bill' => $data[$i]['bill'],
							'detailId' => $detailID,
							'itemCode' => 0,
							'itemName' => $tmp["orderitem"][$t]["catname"],
							'note' => array("name"=>$tmp["orderitem"][$t]["item_name"],
											"color"=>$tmp["orderitem"][$t]["color_name"],
											"size"=>$tmp["orderitem"][$t]["size_name"],
											),
							'amount' => $tmp["orderitem"][$t]["amount"],
							'cost' => $tmp["orderitem"][$t]["item_cost"],
							'price' => $tmp["orderitem"][$t]["item_cost"] * $tmp["orderitem"][$t]["amount"],
						);
					$rs[] = self::getHash($args);
				}
				
				// 手入力商品データ
				for($t=0; $t<count($tmp["additional"]); $t++){
					$detailID++;
					$args = array(
							'id' => $data[$i]['ordersId'],
							'orderDate' => $data[$i]['schedule3'],
							'customerId' => $data[$i]['customer_id'],
							'bill' => $data[$i]['bill'],
							'detailId' => $detailID,
							'itemCode' => 0,
							'itemName' => $tmp["additional"][$t]["addsummary"],
							'note' => "",
							'amount' => $tmp["additional"][$t]["addamount"],
							'cost' => $tmp["additional"][$t]["addcost"],
							'price' => $tmp["additional"][$t]["addprice"],
						);
					$rs[] = self::getHash($args);
				}
				
				// 金額明細
				for($t=0; $t<$fldCount; $t++){
					if(empty($data[$i][$fld[$t]])) continue;
					$detailID++;
					$args = array(
							'id' => $data[$i]['ordersId'],
							'orderDate' => $data[$i]['schedule3'],
							'customerId' => $data[$i]['customer_id'],
							'bill' => $data[$i]['bill'],
							'detailId' => $detailID,
							'itemCode' => 0,
							'itemName' => "",
							'note' => "",
							'amount' => 1,
							'cost' => $data[$i][$fld[$t]],
							'price' => $data[$i][$fld[$t]],
						);
					$rs[] = self::getHash($args);
				}
			}
		}catch(Exception $e){
			$rs = '';
		}
		
		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/*
	*	販売管理データ用のハッシュを生成（未使用）
	*	@data
	*
	*	reutrn	[]
	*/
	private static function getHash($data)
	{
		try{
			$tmp = array();
			$tmp[] = "1";	// 1.削除マーク（1:通常伝票）
			$tmp[] = "1";	// 2.締めフラグ（1:今回）
			$tmp[] = "0";	// 3.消込チェック（0:未消込）
			$tmp[] = $data['orderDate'];	// 4.伝票日付（発送日）
			$tmp[] = $data['id'];		// 5.伝票番号
			$tmp[] = "24";		// 6.伝票種別（売上）
			$tmp[] = $data['bill']==1? 4: 1;	// 7.取引区分（1:掛売り、4:都度請求）
			$tmp[] = "1";	// 8.税転嫁（外税/伝票計）
			$tmp[] = "1";	// 9.金額端数処理（切り捨て）
			$tmp[] = "1";	// 10.税端数処理（切り捨て）
			$tmp[] = $data['customerId'];	// 11.得意先コード（顧客ID）
			$tmp[] = "";	// 12.納入先コード
			$tmp[] = "";	// 13.担当者コード
			$tmp[] = $data['detailId'];	// 14.明細行番号
			$tmp[] = "1";	// 15.明細区分（1:通常）
			$tmp[] = $data['itemCode'];		// 16.商品コード
			$tmp[] = "";	// 17.入金区分コード（空白）
			$tmp[] = "";	// 18.商品名
			$tmp[] = "12";	// 19.課税区分（12: 8%）
			$tmp[] = "";	// 20.単位
			$tmp[] = "";	// 21.入数
			$tmp[] = "";	// 22.ケース
			$tmp[] = "";	// 23.倉庫コード
			$tmp[] = $data['amount'];		// 24.数量
			$tmp[] = $data['cost'];			// 25.単価
			$tmp[] = $data['price'];		// 26.金額
			$tmp[] = "";	// 27.回収予定日
			$tmp[] = "";	// 28.税抜額
			$tmp[] = "";	// 29.原価
			$tmp[] = "";	// 30.原単価
			$tmp[] = "";	// 31.備考
			$tmp[] = "";	// 32数量少数桁
			$tmp[] = "";	// 33.単価少数桁
			$tmp[] = "";	// 34.規格・型番
			$tmp[] = "";	// 35.色
			$tmp[] = "";	// 36.サイズ
			$tmp[] = "";	// 37.納入期日
			$tmp[] = "";	// 38.分類コード
			$tmp[] = "";	// 39.伝票区分
			$tmp[] = "";	// 40.得意先名称
			$tmp[] = "";	// 41.プロジェクト主コード
			$tmp[] = "";	// 42.プロジェクト副コード
			$tmp[] = "";	// 43.予備1
			$tmp[] = "";	// 44.予備2
			$tmp[] = "";	// 45.予備3
			$tmp[] = "";	// 46.予備4
			$tmp[] = "";	// 47.予備5
			$tmp[] = "";	// 48.予備6
			$tmp[] = "";	// 49.予備7
			$tmp[] = "";	// 50.予備8
			$tmp[] = "";	// 51.予備9
			$tmp[] = "";	// 52.予備10
		}catch(Exception $e){
			$tmp = '';
		}
		
		return $tmp;
	}
	
}
?>