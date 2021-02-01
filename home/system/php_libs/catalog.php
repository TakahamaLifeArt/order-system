<?php
// �����ϥޥ�ե�����
// ���ʥ����������饹
// charset euc-jp

require_once dirname(__FILE__).'/config.php';
require_once dirname(__FILE__).'/MYDB.php';

class Catalog{
/**
*	sort_size			������̾�ǥ����ȡ�getTableList��sizerange�ǻ��ѡ�
*	getCatalog			���ꥫ�ƥ������ϡ�Master ID �ξ��ʤξ����������֤�����Static��
*	getSizename			size ID ���饵����̾���֤����㳰��''
*	getColorcode		�����ƥ५�顼̾�ȥ����ƥ�ID���饫�顼�����ɤ��֤�
*	getTableList		�ơ��֥�ꥹ�Ȥ��֤�
*	getItemPrice		�������ʤ�ñ�����֤�
*	getItemData			item code �� color code ���龦�ʤξ����������֤���Static��
*	getPrintposition	item code ����ץ��Ȱ��֤β���������֤���Static��
*	getItemStock		�߸˿����֤�
*	getTable			���ꤵ�줿�ơ��֥�ξ�����֤���Static��
*	exists				����ѥ����ƥ���ѹ��κݤ��������ǤΥޥ�����ID�μ�����Static��
*	salestax			���̤ξ���ñ���˻��Ѥ��������Ψ���֤���private Static��
*	getSalesTax			������Ψ���֤���public: ���ѡ�Ǽ�ʡ������ν��ϥե�����ǸƽС�
*	validdate			���դ����������ǧ�������ͤϺ��������դ��֤���static��
*/


	/***************************************************************************************************************
	*	������̾�ǥ����Ȥ���
	*	usort�Υ桼��������ؿ�
	*	getTableList::sizerange �ǻ���
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
	*	���ʾ����called dbinfo.orderlist��
	*		@search_key		category_key��'all'������
	*		@master_id		Master ID ���龦�ʾ�������
	*		@curdate		��о��˻��Ѥ������ա�NULL�ả��
	*
	*		@return			���ʤξ��������
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
					$sql = sprintf($sql, $master_id);	// ������ʸ by dbinfo.php orderlist
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
	*	size id ���饵����̾���֤����㳰��''
	*		@search_key		�������ɣ�
	*
	*		@return			������̾
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
	*	�����ƥ५�顼̾�ȥ����ƥ�ID���饫�顼�����ɤ��֤�
	*	@item_id		�����ƥ�ID
	*	@item_color		���顼̾
	*	
	*	return			���顼������
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
	*	�ǡ����١����Υơ��֥�ꥹ�Ȥ��֤�
	*		@mode			�ǡ����١����Υơ��֥�̾
	*		@current_id		item: category id 
	*						size: item id
	*						sizerange: item id
	*		@code			size: item �Υ��顼������
	*						sizerange: size id
	*		@curdate		��о��˻��Ѥ������ա�NULL�ả��
	*		@period			��д��֡�NULL:��Ͽ�����������(default)��true:�������curdate����礭���ǡ�������
	*
	*		@return			�ơ��֥�Υե�����ɥꥹ��
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
					// �ɥ饤���ʤ�Ƚ����
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
					$size_list["0"] = "̤��";
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
					
					// ���顼���꤬��������򿧡ʥȡ��ȤΥʥ�����ޤ�ˤ�Ƚ��
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
					 * �̻��Ѥγݤ�Ψ����
					 * [149��ʲ����̾��, 150-299��, 300��ʾ�]
					 * 
					 * 2021-01-28������̤�T����Ĥȥ������åȤ˸¤�ʲ��Ȥ���
					 * [149��ʲ����̾��, 150-299��, 300-499�硢500��ʾ�]
					 */
					$margin = self::getMargin($data[0]['category_id'], $curdate);
					if (empty($margin)) {
						$margin[] = $price[0]['margin_pvt'];
						if($price[0]['maker_id']==10){	// ���ʥå������ѹ��ʤ�
							$margin[] = $price[0]['margin_pvt'];
							$margin[] = $price[0]['margin_pvt'];
						}else{
							$margin[] = _MARGIN_1;	// 1.6
							$margin[] = _MARGIN_2;	// 1.35
						}
					}
					
					// ������
					$tax = self::salestax($conn, $curdate);
					$tax /= 100;
					
					$cost = array();
					$cost_noprint = array();
					for($i=0; $i<count($price); $i++){
						for($t=$price[$i]['size_from']; $t<=$price[$i]['size_to']; $t++){
							if($isWhite==1 && $price[$i]['price_1']>0){
								$first_cost = $price[$i]['price_1'];
								$wholesale[$t] = round( (($price[$i]['price_1'] * $price[$i]['margin_biz']) + 4), -1);	// �ȼԤؤ�����
							}else{
								$first_cost = $price[$i]['price_0'];
								$wholesale[$t] = round( (($price[$i]['price_0'] * $price[$i]['margin_biz']) + 4), -1);	// �ȼԤؤ�����
							}
							for($j=0; $j<count($margin); $j++){
								$cost[$t][$j] = round( ($first_cost * $margin[$j] * (1+$tax))+4, -1 );
								// �ץ��Ȥʤ�
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
									$rs[$r]['stock'] = '��';
								}else if($data[$i]['stock_volume']<1000){
									$rs[$r]['stock'] = $data[$i]['stock_volume'];
								}else{
									$rs[$r]['stock'] = '��';
								}
							}
							$r++;
						}
					}
					break;
					
				case 'sizerange':
					/************************************************
					*	���ꥵ�����ξ���ñ����Ÿ�����Ƥ��륵�����ꥹ�Ȥ��֤���Ǽ�ʽ��documents/invoice.php��
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
	*		�������ʤ�ñ�����֤���̤��ξ��ϣͤ�ñ����
	*		@item_id		�����ƥ��ID
	*		@size_id		��������ID
	*		@points			�ץ��ȥݥ���ȿ���̵ͭ��1..���� or 0..�ʤ���
	*		@isWhite		���..1 of ����ʳ�..0(default)
	*		@curdate		��о��˻��Ѥ������ա�NULL�ả��
	*		@ordertype		����:general(default:null)���ȼ�:industry
	*		@amount			�����null or 0-149�硢150-299�硢300��ʾ�
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
			if(!$rec && $unfixed){	// ������̤����ǳ�����������ƥ��M���������ʤ����ϰ����礭���������β��ʤ��֤�
				$sql = sprintf("SELECT * FROM itemprice inner join item on item.id=item_id WHERE itempriceapply<='%s' and itempricedate>'%s' and
					 item_id=%d ORDER BY size_to DESC LIMIT 1", $curdate, $curdate, $item_id);
				$result = exe_sql($conn, $sql);
				$rec = mysqli_fetch_assoc($result);
			}
			if($rec){
				// ������
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
						// ñ���γݤ�Ψ
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
					
					// �ץ���̵��
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
	*		�����ƥ������������ʥ��顼��������ƤΥ��顼��
	*		@itemid			�����ƥ��ID
	*		@color			�����ƥ५�顼�Υ����ɤ�̾����all �ξ��ϥ��顼̤��Υ쥳���ɤ�ޤ�
	*		@curdate		��о��˻��Ѥ������ա�NULL�ả��
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
	*		�ץ��Ȱ��֤Υ����פ����
	*		@itemid			�����ƥ��ID
	*		@curdate		��о��˻��Ѥ������ա�NULL�ả��
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
	*		�߸˿����֤�
	*		@master		�ޥ�����ID
	*		@size		������ID
	*
	*		return		�߸˿����������륢���ƥब�ʤ�����null
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
	*		���ꤵ�줿�ơ��֥�Υǡ������֤�
	*		@table		�ơ��֥�̾
	*		@column		�ե������̾�����ξ��ϥơ��֥�����
	*		@search		�����ǡ���
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
	*		����ѥ����ƥ���ѹ��κݤ��������˹��פ��뾦�ʤ�̵ͭ���ǧ����
	*		@item_id		�ѹ���Υ����ƥ�ID
	*		@size_id		����Ѥߥ�����ID
	*		@color_name		����Ѥߥ����ƥ५�顼̾���㤷���ϥ����ƥ५�顼������
	*		@curdate		��о��˻��Ѥ������ա�NULL�ả��
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
	*	���̤ξ���ñ���˻��Ѥ��������Ψ���֤���Static��	���̤�_APPLY_TAX_CLASS�ʹߤϳ��ǤΤ��ᡢ0%���֤�
	*	@curdate		����(0000-00-00)
	*
	*	return			������
	*/
	private static function salestax($conn, $curdate){
		$curdate = self::validdate($curdate);
		if(strtotime($curdate)>=strtotime(_APPLY_TAX_CLASS)) return 0;	// ��������
		$sql = sprintf('select taxratio from salestax where taxapply=(select max(taxapply) from salestax where taxapply<="%s")', $curdate);
		$result = exe_sql($conn, $sql);
		$rec = mysqli_fetch_array($result);
		
		return $rec['taxratio'];
	}
	
	
	/**
	*	������Ψ���֤�		���̤�_APPLY_TAX_CLASS������ϳ�������Ŭ�����Τ��ᡢ0%���֤�
	*	���ѡ�Ǽ�ʡ������ν��ϥե�����Ǹƽ�
	*	@curdate		����(0000-00-00)
	*	@ordertype		general, industry
	*
	*	return			������
	*/
	public function getSalesTax($curdate, $ordertype='general'){
		try{
			$conn = db_connect();
			$curdate = self::validdate($curdate);
			if(strtotime($curdate)<strtotime(_APPLY_TAX_CLASS) && $ordertype=='general') return 0;	// ��������Ŭ����
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
	*	���դ����������ǧ�������ͤϺ��������դ��֤�
	*	@curdate		����(0000-00-00)
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
	 * �����ƥब°���륫�ƥ����ID���֤�
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
	 * ���̸�������ñ���γݤ�Ψ���֤�
	 *
	 * @param  float  $category_id
	 * @param  string  $curdate
	 * @return array
	 */
	private static function getMargin($category_id, $curdate)
	{
		$margin = [];

		// 2021-01-28 ����ݤ�Ψ2.0��Ŭ��
		if (strtotime($curdate) >= strtotime(_APPLY_EXTRA_MARGIN)){
			// T����Ĥȥ������åȤ�2.0������¾��1.8
			if ($category_id == 1 || $category_id == 2) {
				$margin = [2.0, 1.8, 1.6, 1.5];
			}
		}

		return $margin;
	}
}
?>