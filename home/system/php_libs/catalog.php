<?php
// タカハマラフアート
// 商品カタログ　クラス
// charset euc-jp

require_once dirname(__FILE__).'/config.php';
require_once dirname(__FILE__).'/MYDB.php';

class Catalog{
/**
*	sort_size			サイズ名でソート（getTableListのsizerangeで使用）
*	getCatalog			指定カテゴリ又は、Master ID の商品の情報を配列で返す。（Static）
*	getSizename			size ID からサイズ名を返す。例外は''
*	getColorcode		アイテムカラー名とアイテムIDからカラーコードを返す
*	getTableList		テーブルリストを返す
*	getItemPrice		当該商品の単価を返す
*	getItemData			item code と color code から商品の情報を配列で返す（Static）
*	getPrintposition	item code からプリント位置の画像情報を返す（Static）
*	getItemStock		在庫数を返す
*	getTable			指定されたテーブルの情報を返す（Static）
*	exists				選択済アイテムの変更の際に当該条件でのマスターIDの取得（Static）
*	salestax			一般の商品単価に使用する消費税率を返す（private Static）
*	getSalesTax			消費税率を返す（public: 見積・納品・請求書の出力ファイルで呼出）
*	validdate			日付の妥当性を確認し不正値は今日の日付を返す（static）
*/


	/***************************************************************************************************************
	*	サイズ名でソートする
	*	usortのユーザー定義関数
	*	getTableList::sizerange で使用
	*/
	private function sort_size($a, $b){
		$tmp=array(
	    	'70'=>1,'80'=>2,'90'=>3,'100'=>4,'110'=>5,'120'=>6,'130'=>7,'140'=>8,'150'=>9,'160'=>10,
	    	'JS'=>11,'JM'=>12,'JL'=>13,'WS'=>14,'WM'=>15,'WL'=>16,'GS'=>17,'GM'=>18,'GL'=>19,
	    	'SSS'=>20,'SS'=>21,'XS'=>22,
	    	'S'=>23,'M'=>24,'L'=>25,'XL'=>26,
	    	'XXL'=>27,
	    	'O'=>28,'XO'=>29,'2XO'=>30,'YO'=>31,
	    	'3L'=>32,'4L'=>33,'5L'=>34,'6L'=>35,'7L'=>36,'8L'=>37);
		return ($tmp[$a] == $tmp[$b]) ? 0 : ($tmp[$a] < $tmp[$b]) ? -1 : 1;
	}
	
	
	/**
	*	商品情報（called dbinfo.orderlist）
	*		@search_key		category_key、'all'は全て
	*		@master_id		Master ID から商品情報を取得
	*		@curdate		抽出条件に使用する日付。NULL＝今日
	*
	*		@return			商品の情報の配列
	*/
	public static function getCatalog($search_key, $master_id="", $curdate=NULL){
		try{
			$conn = db_connect();
			$isExe = 1;
			$curdate = self::validdate($curdate);

			if($master_id!=""){
				$sql = "SELECT * FROM ((( catalog inner join category on catalog.category_id=category.id)
						 inner join item on catalog.item_id=item.id)
						 left join itemcolor on catalog.color_id=itemcolor.id)
						 inner join maker on item.maker_id=maker.id
						 where catalog.id=%d";
				if(empty($search_key)){
					$sql .= " and catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s'";
					$sql = sprintf($sql, $master_id, $curdate, $curdate, $curdate, $curdate);
				}else{
					$sql = sprintf($sql, $master_id);	// 確定注文 by dbinfo.php orderlist
				}
				/*
				$sql = sprintf("SELECT * FROM ((( catalog inner join category on catalog.category_id=category.id)
						 inner join item on catalog.item_id=item.id)
						 left join itemcolor on catalog.color_id=itemcolor.id)
						 inner join maker on item.maker_id=maker.id
						 WHERE catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s' and catalog.id=%d", 
						$curdate, $curdate, $curdate, $curdate, $master_id);
				*/
				$result = exe_sql($conn, $sql);
				$rs = mysqli_fetch_array($result);
				$isExe = 0;
			}else if($search_key=="all"){
				$sql = sprintf("SELECT * FROM ((( catalog inner join category on catalog.category_id=category.id)
						 inner join item on catalog.item_id=item.id)
						 left join itemcolor on catalog.color_id=itemcolor.id)
						 inner join maker on item.maker_id=maker.id
						 WHERE catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s' ORDER BY category_id, item_id", 
						$curdate, $curdate, $curdate, $curdate);
			}else{
				$search_key	= quote_smart($conn, $search_key);
				$sql = sprintf("SELECT * FROM ((( catalog inner join category on catalog.category_id=category.id)
						 inner join item on catalog.item_id=item.id)
						 left join itemcolor on catalog.color_id=itemcolor.id)
						 inner join maker on item.maker_id=maker.id
						 WHERE catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s' and category_key='%s' ORDER BY item_id, color_code", 
						$curdate, $curdate, $curdate, $curdate, $search_key);
			}

			if($isExe){
				$result = exe_sql($conn, $sql);
				while ($rec = mysqli_fetch_array($result)) {
					foreach($rec as $key=>$val){
						$rec[$key] = $val;
					}
					$rs[] = $rec;
				}
			}
		}catch(Exception $e){
			$rs = '';
		}

		mysqli_close($conn);

		return $rs;
	}



	/**
	*	size id からサイズ名を返す。例外は''
	*		@search_key		サイズＩＤ
	*
	*		@return			サイズ名
	*/
	public function getSizename($search_key){
		try{
			$conn = db_connect();
			$search_key	= quote_smart($conn, $search_key);
			$sql = sprintf("SELECT * FROM size WHERE id=%d", $search_key);
			$result = exe_sql($conn, $sql);
			$rec = mysqli_fetch_array($result);
			$rs = $rec['size_name'];
		}catch(Exception $e){
			$rs = '';
		}

		mysqli_close($conn);

		return $rs;
	}
	
	
	
	/**
	*	アイテムカラー名とアイテムIDからカラーコードを返す
	*	@item_id		アイテムID
	*	@item_color		カラー名
	*	
	*	return			カラーコード
	*/
	public function getColorcode($item_id, $item_color){
		try{
			$conn = db_connect();
			$item_color	= quote_smart($conn, $item_color);
			$sql = sprintf("select color_code from catalog inner join itemcolor on color_id=itemcolor.id where item_id=%d and color_name='%s'", $item_id, $item_color);
			$result = exe_sql($conn, $sql);
			$rec = mysqli_fetch_array($result);
			$rs = $rec['color_code'];
		}catch(Exception $e){
			$rs = '';
		}

		mysqli_close($conn);

		return $rs;
	}




	/**
	*	データベースのテーブルリストを返す
	*		@mode			データベースのテーブル名
	*		@current_id		item: category id 
	*						size: item id
	*						sizerange: item id
	*		@code			size: item のカラーコード
	*						sizerange: size id
	*		@curdate		抽出条件に使用する日付。NULL＝今日
	*		@period			抽出期間　NULL:登録日から中止日(default)　true:中止日がcurdateより大きいデータ全て
	*
	*		@return			テーブルのフィールドリスト
	*/
	public function getTableList($mode, $current_id=0, $code='000', $curdate=NULL, $period=NULL){
		try{
			$conn = db_connect();
			$curdate = self::validdate($curdate);
			$isExe = true;
			$table = quote_smart($conn, $mode);
			switch($table){
				case 'staff':
					if(is_NULL($period)){
						$applydate = $curdate;
					}else{
						$applydate = '3000-01-01';
					}
					if($current_id!=0){
						$sql = sprintf("select * from staff where staffapply<='%s' and staffdate>'%s' and rowid%d>0 order by rowid%d ASC", 
								$applydate, $curdate, $current_id,$current_id);
					}else{
						$sql = sprintf("select * from staff where staffapply<='%s' and staffdate>'%s' order by rowid ASC", $applydate, $curdate);
					}
					break;
				case 'category':
					if(empty($current_id)){
						$sql = "select * from category";
					}else{
						$sql = sprintf("select * from item inner join catalog on item.id=catalog.item_id 
							 where catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s' and item.id=%d group by item.id", 
								$curdate, $curdate, $curdate, $curdate, $current_id);
					}
					break;
				case 'item':
					$isExe = false;
					// ドライ商品の判定用
					$result = exe_sql($conn, 'select * from itemtag where tag_id=2');
					while($rec = mysqli_fetch_array($result)){
						$isDry[$rec['tag_itemid']] = true;
					}
					
					$current_id = quote_smart($conn, $current_id);
					$sql = sprintf("select * from (item inner join catalog on item.id=catalog.item_id)
					 inner join category on catalog.category_id=category.id
					 where catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s' and catalog.category_id=%d group by item.id order by item_row, item.id", 
							$curdate, $curdate, $curdate, $curdate, $current_id);
					$result = exe_sql($conn, $sql);
					$rs = array();
					while($rec = mysqli_fetch_array($result)){
						$rec['dry'] = ($isDry[$rec['item_id']])? 'DRY': '';
						$rs[] = $rec;
					}
					break;
				case 'size':
					$isExe = false;
					$result = exe_sql($conn, "SELECT * FROM size");
					$size_list = array();
					while($rec = mysqli_fetch_array($result)){
						$size_list[$rec['id']] = $rec['size_name'];
					}
					$size_list["0"] = "未定";
					if($current_id==0){
						$rs = $size_list;
						break;
					}

					$current_id = quote_smart($conn, $current_id);
					if($code=='000'){
						$sql = sprintf("SELECT * FROM (itemsize INNER JOIN catalog ON itemsize.series=catalog.size_series)
								 left join itemstock on catalog.item_id=stock_item_id and size_from=stock_size_id and catalog.id=stock_master_id
								 WHERE catalog.color_code='000' and itemsizeapply<='%s' and itemsizedate>'%s' and catalog.item_id=%d
								 group by size_from ORDER BY series, size_from", 
							$curdate, $curdate, $current_id);
					}else{
						$sql = sprintf("SELECT * FROM (((item
								 inner join itemsize on item.id=itemsize.item_id)
								 INNER JOIN catalog ON item.id=catalog.item_id and catalog.size_series=itemsize.series)
								 LEFT JOIN itemcolor ON catalog.color_id=itemcolor.id)
								 left join itemstock on catalog.item_id=stock_item_id and size_from=stock_size_id and catalog.id=stock_master_id
								 WHERE itemapply<='%s' and itemdate>'%s' and itemsizeapply<='%s' and itemsizedate>'%s' and catalogapply<='%s' and catalogdate>'%s' and item.id=%d and catalog.color_code='%s' group by size_from ORDER BY size_from",
						$curdate, $curdate, $curdate, $curdate, $curdate, $curdate, $current_id, $code);
					}
					$result = exe_sql($conn, $sql);
					$data = array();
					while($rec = mysqli_fetch_array($result)){
						$data[] = $rec;
					}
					
					// カラー指定がある場合に白色（トートのナチュラル含む）の判別
					if($code!='000' && (($data[0]['color_id']==59 && $current_id!=112) || ($data[0]['color_id']==42 && ($current_id==112 || $current_id==212))) ){
						$isWhite=1;
					}else{
						$isWhite=0;
					}
					
					$sql = sprintf("SELECT * FROM item inner join itemprice on item.id=item_id WHERE itempriceapply<='%s' and itempricedate>'%s' and item.id=%d", $curdate, $curdate, $current_id);
					$result = exe_sql($conn, $sql);
					$price = array();
					while($rec = mysqli_fetch_array($result)){
						$price[] = $rec;
					}
					
					/**
					 * 量産用の掛け率指定
					 * [149枚以下（通常）, 150-299枚, 300枚以上]
					 * 
					 * 2021-01-28から一般のTシャツとスウェットに限り以下とする
					 * [149枚以下（通常）, 150-299枚, 300-499枚、500枚以上]
					 */
					$margin = self::getMargin($data[0]['category_id'], $curdate);
					if (empty($margin)) {
						$margin[] = $price[0]['margin_pvt'];
						if($price[0]['maker_id']==10){	// ザナックスは変更なし
							$margin[] = $price[0]['margin_pvt'];
							$margin[] = $price[0]['margin_pvt'];
						}else{
							$margin[] = _MARGIN_1;	// 1.6
							$margin[] = _MARGIN_2;	// 1.35
						}
					}
					
					// 消費税
					$tax = self::salestax($conn, $curdate);
					$tax /= 100;
					
					$cost = array();
					$cost_noprint = array();
					for($i=0; $i<count($price); $i++){
						for($t=$price[$i]['size_from']; $t<=$price[$i]['size_to']; $t++){
							if($isWhite==1 && $price[$i]['price_1']>0){
								$first_cost = $price[$i]['price_1'];
								$wholesale[$t] = round( (($price[$i]['price_1'] * $price[$i]['margin_biz']) + 4), -1);	// 業者への売値
							}else{
								$first_cost = $price[$i]['price_0'];
								$wholesale[$t] = round( (($price[$i]['price_0'] * $price[$i]['margin_biz']) + 4), -1);	// 業者への売値
							}
							for($j=0; $j<count($margin); $j++){
								$cost[$t][$j] = round( ($first_cost * $margin[$j] * (1+$tax))+4, -1 );
								// プリントなし
								$tmp = $cost[$t][$j]*1.1;
								$cost_noprint[$t][$j] = round($tmp+4, -1);
							}
						}
					}

					$rs = array();
					$r=0;
					$series = $data[0]['series'];
					for($i=0; $i<count($data); $i++){
						if($data[$i]['series']!=$series) continue;
						for($t=$data[$i]['size_from']; $t<=$data[$i]['size_to']; $t++){
							$rs[$r]['id'] = $t;
							$rs[$r]['size_name'] = $size_list[$t];
							$rs[$r]['color_name'] = $data[$i]['color_name'];
							for($j=0; $j<count($cost[$t]); $j++){
								$rs[$r]['cost'][$j] = $cost[$t][$j];
								$rs[$r]['cost_noprint'][$j] = $cost_noprint[$t][$j];
							}
							$rs[$r]['wholesale'] = $wholesale[$t];
							if($data[$i]['stock_volume']==""){
								$rs[$r]['stock'] = '-';
							}else{
								if($data[$i]['stock_volume']==0){
									$rs[$r]['stock'] = '×';
								}else if($data[$i]['stock_volume']<1000){
									$rs[$r]['stock'] = $data[$i]['stock_volume'];
								}else{
									$rs[$r]['stock'] = '〇';
								}
							}
							$r++;
						}
					}
					break;
					
				case 'sizerange':
					/************************************************
					*	指定サイズの商品単価で展開しているサイズリストを返す。納品書（documents/invoice.php）
					*************************************************/
					if(empty($curdate)) $curdate = date('Y-m-d');
					$sql = sprintf("select * from itemprice inner join size on size_from=size.id where itempriceapply<='%s' and itempricedate>'%s' and item_id=%d order by price_0, size_from", 
						$curdate, $curdate, $current_id);
					$result = exe_sql($conn, $sql);
					$i=-1;
					$r=0;
					$a=array();
					while($res = mysqli_fetch_assoc($result)){
						if($i==-1){
							$i++;
							$a[$i]=$res;
							$a[$i]['range'][] = $res['size_name'];
						}else if($a[$i]['price_0']==$res['price_0']){
							$a[$i]['range'][] = $res['size_name'];
						}else{
							$i++;
							$a[$i]=$res;
							$a[$i]['range'][] = $res['size_name'];
						}
						if($res['size_from']==$code || $res['size_name']==$code) $r = $i;
					}
					
					usort($a[$r]['range'], array('Catalog', 'sort_size'));
					$rs = $a[$r];
					$isExe = false;
					
					break;
					
				case 'cost':
					$isExe = false;
					$result = exe_sql($conn, "SELECT * FROM size");
					$size_list = array();
					while($rec = mysqli_fetch_array($result)){
						$size_list[$rec['id']] = $rec['size_name'];
					}

					if(empty($curdate)) $curdate = date('Y-m-d');
					$current_id = quote_smart($conn, $current_id);
					$sql = sprintf("SELECT * FROM itemprice WHERE itempriceapply<='%s' and itempricedate>'%s' and item_id=%d", $curdate, $curdate, $current_id);
					$result = exe_sql($conn, $sql);
					$i=0;
					$rs = array();
					while($rec = mysqli_fetch_array($result)){
						$rs[$i]['id'] = $rec['id'];
						$rs[$i]['size_from'] = $size_list[$rec['size_from']];;
						$rs[$i]['size_to'] = $size_list[$rec['size_to']];
						$rs[$i]['price_0'] = $rec['price_0'];
						$rs[$i]['price_1'] = $rec['price_1'];
						$i++;
					}
					break;
				case 'printposition':
					$isExe = false;
					$result = exe_sql($conn, "SELECT * FROM printposition");
					$rs = array();
					while($rec = mysqli_fetch_array($result)){
						$rs[] = $rec;
					}
					break;
				case 'itemcolor':
					$sql = "SELECT * FROM itemcolor ORDER BY color_name";
					break;
			}

			if($isExe){
				$result = exe_sql($conn, $sql);
				$rs = array();
				while($rec = mysqli_fetch_array($result)){
					$rs[] = $rec;
				}
			}
		}catch(Exception $e){
			$rs = '';
		}

		mysqli_close($conn);

		return $rs;
	}


	/**
	*		当該商品の単価を返す（未定の場合はＭの単価）
	*		@item_id		アイテムのID
	*		@size_id		サイズのID
	*		@points			プリントポイント数の有無（1..あり or 0..なし）
	*		@isWhite		白Ｔ..1 of それ以外..0(default)
	*		@curdate		抽出条件に使用する日付。NULL＝今日
	*		@ordertype		一般:general(default:null)、業者:industry
	*		@amount			枚数　null or 0-149枚、150-299枚、300枚以上
	*/
	public function getItemPrice($item_id, $size_id, $points, $isWhite=0, $curdate=NULL, $ordertype=null, $amount=null){
		try{
			$conn = db_connect();
			$curdate = self::validdate($curdate);
			$rs = 0;
			$unfixed = false;
			$item_id	= quote_smart($conn, $item_id);
			$size_id	= quote_smart($conn, $size_id);
			$points		= quote_smart($conn, $points);
			if($size_id==0){
				$size_id = 19;		// M
				$unfixed = true;
			}
			$sql = sprintf("SELECT * FROM itemprice inner join item on item.id=item_id WHERE itempriceapply<='%s' and itempricedate>'%s' and
					 item_id=%d AND size_from<=%d AND size_to>=%d", $curdate, $curdate, $item_id, $size_id, $size_id);
			$result = exe_sql($conn, $sql);
			$rec = mysqli_fetch_assoc($result);
			if(!$rec && $unfixed){	// サイズ未指定で且つ当該アイテムにMサイズがない場合は一番大きいサイズの価格を返す
				$sql = sprintf("SELECT * FROM itemprice inner join item on item.id=item_id WHERE itempriceapply<='%s' and itempricedate>'%s' and
					 item_id=%d ORDER BY size_to DESC LIMIT 1", $curdate, $curdate, $item_id);
				$result = exe_sql($conn, $sql);
				$rec = mysqli_fetch_assoc($result);
			}
			if($rec){
				// 消費税
				$tax = self::salestax($conn, $curdate);
				$tax /= 100;

				if($ordertype=='industry'){
					if($isWhite==1 && $rec['price_1']>0){
						$rs = $rec['price_1'] * $rec['margin_biz'];
					}else{
						$rs = $rec['price_0'] * $rec['margin_biz'];
					}
					$rs = round($rs+4, -1);
				}else{
					$margin = $rec['margin_pvt'];
					if(!is_null($amount) && $rec['maker_id']!=10 && $amount>149){
						// 単価の掛け率
						$category_id = self::getCategoryId($item_id);
						$marginPvt = self::getMargin($category_id, $curdate);

						if (empty($marginPvt)) {
							if($amount<300){
								$margin = _MARGIN_1;
							}else{
								$margin = _MARGIN_2;
							}
						} else {
							if ($amount < 300) {
								$margin = $marginPvt[1];
							} else if ($amount < 500) {
								$margin = $marginPvt[2];
							} else {
								$margin = $marginPvt[3];
							}
						}
					}
					if($isWhite==1 && $rec['price_1']>0){
						$rs = $rec['price_1'] * $margin * (1+$tax);
					}else{
						$rs = $rec['price_0'] * $margin * (1+$tax);
					}
					$rs = round($rs+4, -1);
					
					// プリント無し
					if($points==0){
						$rs *= 1.1;
						$rs = round($rs+4, -1);
					}
				}
			}
		}catch(Exception $e){
			$rs = '0';
		}

		mysqli_close($conn);

		return $rs;
	}



	/**
	*		アイテム情報を取得する（カラー指定と全てのカラー）
	*		@itemid			アイテムのID
	*		@color			アイテムカラーのコードか名前、all の場合はカラー未定のレコードを含む
	*		@curdate		抽出条件に使用する日付。NULL＝今日
	*/
	public static function getItemData($itemid, $color='', $curdate=NULL){
		try{
			$conn = db_connect();
			$curdate = self::validdate($curdate);

			if($color==''){
				$prm1 = quote_smart($conn, $itemid);
				$sql= sprintf("SELECT catalog.id as master_id, category_id, item_id, color_id, color_code, category_name,
								 category_key, item_name, item_code, printratio_id, color_name, printposition_id, maker_id, maker_name,
								 item_group1_id, item_group2_id
				 				 FROM (((catalog inner join category on catalog.category_id=category.id)
				 				 inner join item on catalog.item_id=item.id)
				 				 inner join itemcolor on catalog.color_id=itemcolor.id)
				 				 left join maker on item.maker_id=maker.id
				 				 WHERE catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s' and item_id=%d", 
								$curdate, $curdate, $curdate, $curdate, $prm1);
				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_assoc($result)){
					$rs[] = $rec;
				}
			}else if($color=='all'){
				$prm1 = quote_smart($conn, $itemid);
				$sql= sprintf("SELECT catalog.id as master_id, category_id, item_id, color_id, color_code, category_name,
								 category_key, item_name, item_code, printratio_id, color_name, printposition_id, maker_id, maker_name,
								 item_group1_id, item_group2_id
				 				 FROM (((catalog inner join category on catalog.category_id=category.id)
				 				 inner join item on catalog.item_id=item.id)
				 				 left join itemcolor on catalog.color_id=itemcolor.id)
				 				 left join maker on item.maker_id=maker.id
				 				 WHERE catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s' and item_id=%d order by color_code", 
								$curdate, $curdate, $curdate, $curdate, $prm1);
				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_assoc($result)){
					$rs[] = $rec;
				}
			}else{
				$prm1 = quote_smart($conn, $itemid);
				$prm2 = quote_smart($conn, $color);
				$sql= sprintf("SELECT catalog.id as master_id, category_id, item_id, color_id, color_code, category_name,
								 category_key, item_name, item_code, printratio_id, color_name, printposition_id, maker_id, maker_name,
								 item_group1_id, item_group2_id
				 				 FROM (((catalog inner join category on catalog.category_id=category.id)
				 				 inner join item on catalog.item_id=item.id)
				 				 left join itemcolor on catalog.color_id=itemcolor.id)
				 				 left join maker on item.maker_id=maker.id
				 				 WHERE catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s' and item_id=%d AND (catalog.color_code='%s' OR color_name='%s')",
								$curdate, $curdate, $curdate, $curdate, $prm1, $prm2, $prm2);
				$result = exe_sql($conn, $sql);
				$rs = mysqli_fetch_assoc($result);
			}
		}catch(Exception $e){
			$rs = '';
		}

		mysqli_close($conn);

		return $rs;
	}



	/**
	*		プリント位置のタイプを取得
	*		@itemid			アイテムのID
	*		@curdate		抽出条件に使用する日付。NULL＝今日
	*/
	public static function getPrintposition($itemid, $ppid=0, $curdate=NULL){
		try{
			$conn = db_connect();
			$curdate = self::validdate($curdate);

			if($itemid!=0){
				$prm1 = quote_smart($conn, $itemid);
				$sql= sprintf("SELECT * FROM item inner join printposition on item.printposition_id=printposition.id
			 				 WHERE itemapply<='%s' and itemdate>'%s' and item.id=%d", $curdate, $curdate, $prm1);
			}else if($ppid!=0){
				$prm1 = quote_smart($conn, $ppid);
				$sql= sprintf("SELECT * FROM printposition WHERE id=%d", $prm1);
			}else{
				$sql = "SELECT * FROM printposition";
			}
			$result = exe_sql($conn, $sql);
			while($rec = mysqli_fetch_assoc($result)){
				$rs[] = $rec;
			}

		}catch(Exception $e){
			$rs = '';
		}

		mysqli_close($conn);

		return $rs;
	}



	/**
	*		在庫数を返す
	*		@master		マスターID
	*		@size		サイズID
	*
	*		return		在庫数、該当するアイテムがない場合はnull
	*/
	public function getItemStock($master, $size){
		try{
			$conn = db_connect();
			$sql = sprintf("select * from itemstock where stock_master_id=%d and stock_size_id=%d", $master, $size);
			$result = exe_sql($conn, $sql);
			if(mysqli_num_rows($result)==0){
				$rs = null;
			}else{
				$rec = mysqli_fetch_assoc($result);
				$rs = $rec['stock_volume'];
			}
		}catch(Exception $e){
			$rs='';
		}
		mysqli_close($conn);
		
		return $rs;
	}



	/**
	*		指定されたテーブルのデータを返す
	*		@table		テーブル名
	*		@column		フィールド名、空の場合はテーブル全体
	*		@search		検索データ
	*/
	public static function getTable($table, $column, $search){
		try{
			$conn = db_connect();

			$table = quote_smart($conn, $table);
			$column = quote_smart($conn, $column);
			$search = quote_smart($conn, $search);
			$sql = sprintf("select * from %s where %s='%s'", $table,$column,$search);
			$result = exe_sql($conn, $sql);
			$rs = mysqli_fetch_assoc($result);
		}catch(Exception $e){
			$rs='';
		}

		mysqli_close($conn);

		return $rs;
	}



	/**
	*		選択済アイテムの変更の際に当該条件に合致する商品の有無を確認する
	*		@item_id		変更後のアイテムID
	*		@size_id		指定済みサイズID
	*		@color_name		指定済みアイテムカラー名、若しくはアイテムカラーコード
	*		@curdate		抽出条件に使用する日付。NULL＝今日
	*
	*		@return			{Master_id, color_code, maker, position_id}
	*/
	public static function exists($item_id, $size_id, $color_name, $curdate=NULL){
		try{
			$conn = db_connect();
			$curdate = self::validdate($curdate);

			$item_id = quote_smart($conn, $item_id);
			$size_id = quote_smart($conn, $size_id);
			$color_name = quote_smart($conn, $color_name);
			if($size_id==0){
				$sql = sprintf("select * from (((catalog left join itemcolor on catalog.color_id=itemcolor.id)
						 inner join itemsize on catalog.size_series=itemsize.series)
						 inner join item on catalog.item_id=item.id)
						 inner join maker on item.maker_id=maker.id
						 where catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s' and itemsizeapply<='%s' and itemsizedate>'%s'
						 and catalog.item_id=%d and (catalog.color_code='%s' or itemcolor.color_name='%s')",
						$curdate, $curdate, $curdate, $curdate, $curdate, $curdate, $item_id, $color_name, $color_name);
			}else{
				$sql = sprintf("select * from (((catalog left join itemcolor on catalog.color_id=itemcolor.id)
						 inner join itemsize on catalog.size_series=itemsize.series)
						 inner join item on catalog.item_id=item.id)
						 inner join maker on item.maker_id=maker.id
						 where catalogapply<='%s' and catalogdate>'%s' and itemapply<='%s' and itemdate>'%s' and itemsizeapply<='%s' and itemsizedate>'%s'
						 and catalog.item_id=%d and itemsize.size_from<=%d and
						 itemsize.size_to>=%d and (catalog.color_code='%s' or itemcolor.color_name='%s')",
						$curdate, $curdate, $curdate, $curdate, $curdate, $curdate, $item_id, $size_id, $size_id, $color_name, $color_name);
			}

			$result = exe_sql($conn, $sql);

			if(mysqli_num_rows($result)>0){
				$rec = mysqli_fetch_array($result);
				$rs = array('master_id'=>$rec[0], 'color_code'=>$rec['color_code'], 'maker'=>$rec['maker_name'], 'position_id'=>$rec['printposition_id']);
			}else{
				$rs = "";
			}
		}catch(Exception $e){
			$rs="";
		}

		mysqli_close($conn);

		return $rs;
	}


	/**
	*	一般の商品単価に使用する消費税率を返す（Static）	一般で_APPLY_TAX_CLASS以降は外税のため、0%を返す
	*	@curdate		日付(0000-00-00)
	*
	*	return			消費税
	*/
	private static function salestax($conn, $curdate){
		$curdate = self::validdate($curdate);
		if(strtotime($curdate)>=strtotime(_APPLY_TAX_CLASS)) return 0;	// 外税方式
		$sql = sprintf('select taxratio from salestax where taxapply=(select max(taxapply) from salestax where taxapply<="%s")', $curdate);
		$result = exe_sql($conn, $sql);
		$rec = mysqli_fetch_array($result);
		
		return $rec['taxratio'];
	}
	
	
	/**
	*	消費税率を返す		一般で_APPLY_TAX_CLASSより前は外税方式適用前のため、0%を返す
	*	見積・納品・請求書の出力ファイルで呼出
	*	@curdate		日付(0000-00-00)
	*	@ordertype		general, industry
	*
	*	return			消費税
	*/
	public function getSalesTax($curdate, $ordertype='general'){
		try{
			$conn = db_connect();
			$curdate = self::validdate($curdate);
			if(strtotime($curdate)<strtotime(_APPLY_TAX_CLASS) && $ordertype=='general') return 0;	// 外税方式適用前
			$sql = sprintf('select taxratio from salestax where taxapply=(select max(taxapply) from salestax where taxapply<="%s")', $curdate);
			$result = exe_sql($conn, $sql);
			$rec = mysqli_fetch_array($result);
			$rs = $rec['taxratio'];
		}catch(Exception $e){
			$rs="0";
		}
		mysqli_close($conn);
		return $rs;
	}

	/**
	*	日付の妥当性を確認し不正値は今日の日付を返す
	*	@curdate		日付(0000-00-00)
	*	
	*	@return			0000-00-00
	*/
	private static function validdate($curdate)
	{
		if(empty($curdate)){
			$curdate = date('Y-m-d');
		}else{
			$d = explode('-', $curdate);
			if(checkdate($d[1], $d[2], $d[0])==false){
				$curdate = date('Y-m-d');
			}
		}
		return $curdate;
	}

	/**
	 * アイテムが属するカテゴリのIDを返す
	 *
	 * @param int $item_id
	 * @return int|null
	 */
	private static function getCategoryId($item_id)
	{
		try{
			$conn = db_connect();
			$sql = sprintf('select category_id from item inner join catalog on item.id = catalog.item_id where item.id = %d limit 1', $item_id);
			$result = exe_sql($conn, $sql);
			$rec = mysqli_fetch_array($result);
			$rs = $rec['category_id'];
		}catch(Exception $e){
			$rs= null;
		}
		mysqli_close($conn);
		return $rs;
	}

	/**
	 * 一般向け商品単価の掛け率を返す
	 *
	 * @param  float  $category_id
	 * @param  string  $curdate
	 * @return array
	 */
	private static function getMargin($category_id, $curdate)
	{
		$margin = [];

		// 2021-01-28 から掛け率2.0を適用
		if (strtotime($curdate) >= strtotime(_APPLY_EXTRA_MARGIN)){
			// Tシャツとスウェットは2.0、その他は1.8
			if ($category_id == 1 || $category_id == 2) {
				$margin = [2.0, 1.8, 1.6, 1.5];
			}
		}

		return $margin;
	}
}
?>