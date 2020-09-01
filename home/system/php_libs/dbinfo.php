<?php
/*
 * タカハマラフアート
 * 商品データベース接続
 * charset utf-8
 *
 * tax					mypage
 * table
 * itemimage			mypage
 * itemcolor			util
 * itemsize				util
 * size					mypage
 * removeitem			util,mypage
 * additem				mypage
 * changeitem			mypage
 * orderlist			util,mypage
 * orderlistext			mypage
 * totalamount
 * printposition		mypage
 * printpositionlist	util
 * ppbox				mypage
 * positionimage		silklist
 * files
 * itemByToms			util,orderlist
 */
	require_once dirname(__FILE__).'/session_my_handler.php';
	require_once dirname(__FILE__).'/catalog.php';
	require_once dirname(__FILE__).'/cart.php';
	require_once dirname(__FILE__).'/orders.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';


	/*
	*	多次元配列のマルチソート
	*	orderlistext で使用
	*/
	class Multisorter {
		private $mode = '';		// ソートする項目の優先順位
		private $size_hash = array(
			'70'=>1,'80'=>2,'90'=>3,'100'=>4,'110'=>5,'120'=>6,'130'=>7,'140'=>8,'150'=>9,'160'=>10,
			'JS'=>11,'JM'=>12,'JL'=>13,'WS'=>14,'WM'=>15,'WL'=>16,'GS'=>17,'GM'=>18,'GL'=>19,
			'SSS'=>20,'SS'=>21,'XS'=>22,
			'S'=>23,'M'=>24,'L'=>25,'XL'=>26,
			'XXL'=>27,
			'O'=>28,'XO'=>29,'2XO'=>30,'YO'=>31,
			'3L'=>32,'4L'=>33,'5L'=>34,'6L'=>35,'7L'=>36,'8L'=>37);
		
		public function __construct($mode='color'){
			$this->mode = $mode;
		}
				
		public function start($args){
			if($this->mode=='size'){
				foreach($args as $key=>$val){
					$a[$key] = $val['maker'];
					$b[$key] = $val['item_name'];
					$c[$key] = $this->size_hash[$val['size_name']];
					$d[$key] = $val['color_code'];
				}
				array_multisort($a,$b,$c,$d, $args);
			}else if($this->mode=='color'){
				foreach($args as $key=>$val){
					$a[$key] = $val['maker'];
					$b[$key] = $val['item_name'];
					$c[$key] = $val['color_code'];
					$d[$key] = $this->size_hash[$val['size_name']];
				}
				array_multisort($a,$b,$c,$d, $args);
			}
			
			return $args;
		}
	}
	
	if(isset($_POST['act'])){
		switch($_POST['act']){
		case 'tax':
			$catalog = new Catalog();
			$res = $catalog->getSalesTax($_POST['curdate'], $_POST['ordertype']);
			break;
			
		case 'table':
			if(isset($_POST['tablename'])){
				if(isset($_POST['column'],$_POST['search'])){
					$result = catalog::getTable( $_POST['tablename'], $_POST['column'], $_POST['search'] );
					if(!empty($result)){
						$line = '';
						foreach($result as $key=>$val){
							$line .= ','.$key.':'.$val;
						}
						$res = substr($line, 1);
					}
				}else if($_POST['tablename']=='staff'){
					$cata = new Catalog();
					$result = $cata->getTableList('staff');
					if(!empty($result)){
						$line = '';
						foreach($result as $key=>$val){
							$line .= ','.$val['id'].':'.$val['staffname'];
						}
						$res .= substr($line, 1);
					}
				}
			}
			break;
			
		case 'itemimage':
		/*
		 * アイテムの商品情報欄の表示データを返す
		 */
			if(isset($_POST['item_id'])){
				if($_POST['color_code']==""){
					$datas = Catalog::getItemData($_POST['item_id'], "all", $_POST['curdate']);
					$data = $datas[0];
					if(count($datas)==1){
						// 1色のみの商品
						$code = $data['item_code'];
						$color_name = $data['color_name'];
					}else{
						// 複数カラーの商品はデフォルトでカラー未定を表示
						$code = $data['item_code'].'_000';
						$color_name = '未定';
					}
				}else{
					$data = Catalog::getItemData($_POST['item_id'], $_POST['color_code'], $_POST['curdate']);
					if($_POST['color_code']==='000'){
						$color_name = '未定';
					}else{
						$color_name = $data['color_name'];
					}
					$code = $data['item_code'].'_'.$data['color_code'];

				}
				$res = $color_name.','.$data['color_code'].','.$code.','.$data['master_id'].','.$data['printposition_id'].','.$data['maker_name'].','.$data['item_group1_id'].','.$data['item_group2_id'];
			}
			break;

		case 'itemcolor':
		/*
		 * 商品テーブル内でのカラー変更用のポップアップ
		 */
			if(isset($_POST['item_id'])){
				$data = Catalog::getItemData($_POST['item_id'], "all", $_POST['curdate']);
				if(count($data)<=1){
					$res='';	// 1色のみ
				}else{
					$res = '<table cellspacing="0" id="itemcolor_table" class="tablesorter">';
					$res .= '<thead><tr><th>code</th><th>color</th></tr></thead>';
					$res .= '<tbody>';
					if(isset($_POST['master_id'],$_POST['size_id'])){
						// 選択済みの商品テーブルのカラーパレット
						for($i=0; $i<count($data); $i++){
							$color_name = is_null($data[$i]['color_name'])? '未定': $data[$i]['color_name'];
							$res .= '<tr onclick="mypage.changeItemcolor('.$_POST['master_id'].','.$_POST['size_id'].','.$data[$i]['master_id'].',\''.$data[$i]['color_code'].'\')">';
							$res .= 	'<td>'.$data[$i]['color_code'].'</td>';
							$res .= 	'<td>'.$color_name.'</td>';
							$res .= '</tr>';
						}
					}else{
						// 商品情報欄のカラーパレット
						for($i=0; $i<count($data); $i++){
							$color_name = is_null($data[$i]['color_name'])? '未定': $data[$i]['color_name'];
							$res .= '<tr onclick="mypage.changeColorcode('.$_POST['item_id'].',\''.$data[$i]['color_code'].'\')">';
							$res .= 	'<td>'.$data[$i]['color_code'].'</td>';
							$res .= 	'<td>'.$color_name.'</td>';
							$res .= '</tr>';
						}
					}
					$res .= '</tbody></table>';
				}
			}
			break;

		case 'itemsize':
		/*
		 * 商品テーブル内でのサイズ変更用のポップアップ
		 */
			if(isset($_POST['master_id'],$_POST['size_id'],$_POST['item_id'],$_POST['color_code'])){
				$catalog = new Catalog();
				$data = $catalog->getTableList( 'size', $_POST['item_id'], $_POST['color_code'], $_POST['curdate'] );
				$size_count = count($data);
				if($size_count<=1){
					$res='';
				}else{
					$res = '<table cellspacing="0" id="itemsize_table" class="tablesorter">';
					$res .= '<thead><tr><th class="header">size</th></tr></thead>';
					$res .= '<tbody>';
					$res .= '<tr onclick="mypage.changeItemsize('.$_POST['master_id'].','.$_POST['size_id'].',0,\'未定\')">';
					$res .= 	'<td>未定</td>';
					$res .= '</tr>';
					for($i=0; $i<$size_count; $i++){
						$res .= '<tr onclick="mypage.changeItemsize('.$_POST['master_id'].','.$_POST['size_id'].','.$data[$i]['id'].',\''.$data[$i]['size_name'].'\')">';
						$res .= 	'<td>'.$data[$i]['size_name'].'</td>';
						$res .= '</tr>';
					}
					$res .= '</tbody></table>';
				}
			}
			break;

		case 'size':
		/*
		 * サイズと枚数の指定テーブル
		 */
			if(isset($_POST['item_id'])){
				if($_POST['item_id']==0 || $_POST['item_id']==100){
					$res = '<table id="ordersize" cellspacing="0" cellpadding="0">';
					$res .=		'<tr class="heading">';
					$res .=		'<th>サイズ</th>';

					$res .= '<td><input type="text" value="S" size="3" style="text-align:center;" /></td>';
					$res .= '<td><input type="text" value="M" size="3" style="text-align:center;" /></td>';
					$res .= '<td><input type="text" value="L" size="3" style="text-align:center;" /></td>';
					$res .= '<td><input type="text" value="未定" size="3" style="text-align:center;" /></td>';

					$res .=		'<td></td>';
					$res .=		'</tr>';
					$res .=		'<tr>';
					$res .=		'<th>枚　数</th>';
					for($i=0; $i<4; $i++){
						$res .=	'<td><input type="text" class="forReal" value="0" size="3" /></td>';
					}
					$res .=		'<td><input type="button" value="一覧に追加" onclick="mypage.additem()" /></td>';
					$res .=		'</tr></table>';
				}else if($_POST['item_id']==99){
					$res = '<table id="ordersize" cellspacing="0" cellpadding="0">';
					$res .=	'<tr class="heading">';
					$res .=	'<th>サイズ</th>';

					$res .= '<td><input type="hidden" value="" size="3" /></td>';
					$res .=	'<td></td>';
					$res .=	'</tr>';
					$res .=	'<tr>';
					$res .=	'<th>枚　数</th>';
					$res .=	'<td><input type="text" class="forReal" value="0" size="3" /></td>';
					$res .=	'<td><input type="button" value="一覧に追加" onclick="mypage.additem()" /></td>';
					$res .=	'</tr></table>';
				}else{
					$catalog = new Catalog();
					$data = $catalog->getTableList( 'size', $_POST['item_id'], $_POST['itemcolor_code'], $_POST['curdate']);

					$size_count = count($data);
					$res = '<table id="ordersize" cellspacing="0" cellpadding="0">';
					$res .= 	'<tfoot><tr>';
					$res .=		'<th>在　庫</th>';
					for($i=0; $i<$size_count; $i++){
						$res .= '<td>'.mb_convert_encoding($data[$i]['stock'], 'utf-8', 'euc-jp').'</td>';
					}
					$res .=		'<td>-</td><td></td>';
					$res .= 	'</tr></tfoot>';
					$res .= 	'<tbody>';
					$res .=		'<tr class="heading">';
					$res .=		'<th>サイズ</th>';
					for($i=0; $i<$size_count; $i++){
						$res .= '<td>'.$data[$i]['size_name'].'</td>';
					}
					if($size_count>1){
						$res .=		'<td>未定</td>';
					}
					$res .=		'<td></td>';
					$res .=		'</tr>';
					$res .=		'<tr>';
					$res .=		'<th>枚　数</th>';
					
					/*
					*	$param	149枚以下_145枚以上299枚以下_300枚以上の単価
					*/
					for($i=0; $i<$size_count; $i++){
						if($_POST['ordertype']=="industry"){
							$cost_mode = 'wholesale';
							$param = $data[$i][$cost_mode].'_'.$data[$i][$cost_mode].'_'.$data[$i][$cost_mode];
						}else{
							if($_POST['isprint']==1){
								$cost_mode = 'cost';
							}else{
								$cost_mode = 'cost_noprint';
							}
							$param = $data[$i][$cost_mode][0].'_'.$data[$i][$cost_mode][1].'_'.$data[$i][$cost_mode][2];
						}
						$res .=	'<td><input type="text" class="forReal" id="size_'.$data[$i]['id'].'_'.$param.'" value="0" size="3" /></td>';
						if($data[$i]['id']==19) $cost_M = $data[$i][$cost_mode];
					}
					if($size_count>1){
						if(!isset($cost_M)) $cost_M = $data[$size_count-1][$cost_mode];
						$res .=		'<td><input type="text" class="forReal" id="size_0_'.$cost_M.'" value="0" size="3" /></td>';
					}
					$res .=		'<td><input type="button" value="一覧に追加" onclick="mypage.additem()" /></td>';
					$res .=		'</tr></tbody></table>';
				}
			}
			break;

		case 'removeitem':
		/*
		 *	商品情報の削除
		 */
			$cart = new Cart();
			if(isset($_POST['all'])){
				$res = $cart->removeCart(0,0,true);
			}elseif(isset($_POST['master_id'], $_POST['size_id'])){
				$res = $cart->removeCart($_POST['master_id'], $_POST['size_id']);
			}
			break;

		case 'additem':
		/*
		 *	商品情報の追加
		 *	@master_id		取扱商品以外は、'mst_'+category_id+'_'+item_name+'_'+item_color
		 *	@suze_id		取扱商品以外は、サイズ名
		 *	@amount			数量
		 *	@cost			業者入力の場合の商品単価
		 */
		 	$res = 0;
			if(isset($_POST['master_id'], $_POST['size_id'], $_POST['amount'])){
				$cart = new Cart();
				for($i=0; $i<count($_POST['amount']); $i++){
					$stock_number = null;
					$maker = null;
					$plateis = 1;
					$cost = 0;
					$choice = 1;
					if(isset($_POST['cost'][$i])) $cost = $_POST['cost'][$i];
					if(isset($_POST['choice'][$i])) $choice = $_POST['choice'][$i];
					if(isset($_POST['plateis'][$i])) $plateis = $_POST['plateis'][$i];
					if(isset($_POST['stock_number'])) $stock_number = $_POST['stock_number'];
					if(isset($_POST['maker'])) $maker = $_POST['maker'];
					$res = $cart->addCart($_POST['master_id'], 
								   $_POST['size_id'][$i], 
								   $_POST['amount'][$i],
								   $stock_number,
								   $maker,
								   $plateis, 
								   $cost, 
								   $choice
								);
				}
			}
			break;

		case 'changeitem':
		/*
		 * 商品テーブルのアイテム名の変更
		 *	return
		 *		変更不可: 0
		 *		変更可能: {Master_id, color_code, maker, position_id} 変更後のデータ
		 */
		 	$result = array();
			if($_POST['color_name']=="未定") $color_name = '000';
			else $color_name = $_POST['color_name'];
			if(isset($_POST['item_id'], $_POST['size_id'], $_POST['color_name'])){
				$result[] = Catalog::exists($_POST['item_id'], $_POST['size_id'], $color_name, $_POST['curdate']);
				//$pre_master_id = $_POST['master_id'];
			}
			
			$json = new Services_JSON();
			$res = $json->encode($result);
			header("Content-Type: text/javascript; charset=utf-8");
			break;

		case 'orderlist':
		/*
		 *	注文リストのテーブルを生成
		 *		一般の初期表示
		 *		一般・業者の商品の追加と商品テーブルの更新
		 * log: 2020-08-31 POStデータをJSONに変更
		 */
			$res = '';
			$data = json_decode($_POST['data'], true);

			// sessionStorageのデータをアイテムごとに変換
			$order_amount = 0;
			$keynames = array('maker','master_id','item_name','color_code','size_id','size_name','amount','cost','choice','stock_number','group1','group2');
			$keynameLen = count($keynames);
			$masterLen = count($data['master_id']);
			$ls = array();
			for($i = 0; $i < $masterLen; $i++){
				for($a = 0; $a < $keynameLen; $a++){
					$ls[$i][$keynames[$a]] = $data[$keynames[$a]][$i];
				}
				// 注文合計枚数
				if($ls[$i]['choice']==1) $order_amount += $ls[$i]['amount'];
			}
			
			$plateis = '<option value="1">A</option><option value="2">B</option><option value="3">C</option><option value="4">D</option>';
			$tot_amount = 0;
			$tot_cost = 0;
			$existNotBring = 0;	// 1:1つでも持込以外がある、0:全て持込
			$isVolumeSales = 0; // 1:量販価格適用、0:通常価格のみ
			if(!empty($ls)){
				$catalog = new Catalog();
				$len = count($ls);

				for($i = 0; $i < $len; $i++){
					$val = $ls[$i];
					$info = array();

					if( preg_match('/^mst/',$val['master_id']) ){
						$prm = explode('_',$val['master_id']);		// ['mst', category_id, item_name, item_color]
						$info['item_name'] = $prm[2];
						$info['size_name'] = $val['size_name'];
						$info['item_color'] = $prm[3];
						$info['amount'] = intval($val['amount'], 10);
						$info['stock_number'] = $val['stock_number'];
						$info['maker'] = $val['maker'];
						
						$choice = '';
						$opacity = '';
						if($_POST['ordertype']=='general'){
							$choice = '<input type="checkbox" class="choice" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')"';
							if(empty($val['choice'])){
								$opacity = ' style="opacity:0.3"';
							}else{
								$choice .= ' checked="checked"';
								$tot_amount += $info['amount'];
								$tot_cost += intval($val['cost'], 10)*$info['amount'];
							}
							$choice .= ' />';
						}
						$category_id = $prm[1];
						if($prm[1]==99){	// 業者の転写シート
							$item_id = '99999';
							$ppID = '99';
							$category_name = '転写シート';
							$tot_amount += $info['amount'];
							$res .= '<tr><td class="tip"><span class="itemid">'.$item_id.'</span><span class="positionid">'.$ppID.'</span><span class="ratioid">0</span><span class="masterid">'.$val['master_id'].'</span><span class="group1">0</span><span class="group2">0</span></td>';
						}else{				// 持込またはその他
							$item_id = $prm[1].'_'.$info['item_name'];
							$ppID = $prm[1].'_'.$info['item_name'];
							if($prm[1]==100){
								$category_name = '持込';
							}else{
								$category_name = 'その他';
							}
							if($_POST['ordertype']=='industry') $tot_amount += $info['amount'];
							$res .= '<tr'.$opacity.'><td class="tip"><span class="itemid">'.$item_id.'</span><span class="positionid">'.$ppID.'</span><span class="ratioid">0</span><span class="masterid">'.$val['master_id'].'</span><span class="group1">0</span><span class="group2">0</span></td>';
						}
						if($category_name!='持込') $existNotBring = 1;	// 持込以外
						$res .= '<td>'.$choice.'</td>';
						$res .=	'<td class="id_'.$category_id.'_">'.$category_name.'</td>';
						$res .=	'<td class="item_selector">'.$info['item_name'].'</td>';
						$res .=	'<td class="itemsize_name centering">';
						if($prm[1]==99){
							$res .= $val['size_id'].'</td>';
						}else{
							$res .= '<input type="text" value="'.$val['size_id'].'" onchange="mypage.changeItemsize(\''.$val['master_id'].'\',\''.$val['size_id'].'\',\'\',this)" class="extsize" /></td>';
						}
						$res .=	'<td class="itemcolor_name centering">';
						if($prm[1]==99){
							$res .= $info['item_color'].'</td>';
						}else{
							$res .= '<input type="text" value="'.$info['item_color'].'" onchange="mypage.changeItemcolor(\''.$val['master_id'].'\',\''.$val['size_id'].'\',this)" class="extcolor" /></td>';
						}
						$res .=	'<td class="centering"><input type="text" value="'.$info['amount'].'" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')" class="listamount forReal" /></td>';
						$res .=	'<td class="centering"><input type="text" value="'.number_format($val['cost']).'" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')" class="itemcost forPrice" /></td>';
						$subtotal=$val['cost']*$info['amount'];
						$res .= '<td class="subtotal">'.number_format($subtotal).'</td>';
						$res .=	'<td class="centering">';
						$res .= '<select class="plateis" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')">';
						$res .= preg_replace('/value="'.$val['plateis'].'"/', 'value="'.$val['plateis'].'" selected="selected"', $plateis);
						$res .= '</select></td>';
						$res .= '<td class="stock_status">-</td>';
						$res .=	'<td class="none"><input type="button" value="削除" onclick="mypage.removeitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')" /></td>';
						$res .=	'<td class="tip"><span>'.$info['stock_number'].'</span><span>'.$info['maker'].'</span></td></tr>';

					}else{
						$existNotBring = 1;	// 持込以外
						if($_POST['state']=="true"){
							$state = 1;	// 確定注文
							$itemstock = null;	// 在庫数は非表示扱い
						}else{
							$state = '';
							// 在庫数を取得
							$itemstock = $catalog->getItemStock($val['master_id'], $val['size_id']);
						}
						$info = Catalog::getCatalog($state, $val['master_id'], $_POST['curdate']);
						if(empty($info)) continue;
						
						$info['stock_number'] = $info['item_code'].'_'.$info['color_code'];
						if( ($info['color_name']=='ホワイト' && $info['item_id']!=112) || ($info['color_name']=='ナチュラル' && ($info['item_id']==112 || $info['item_id']==212)) ) $isWhite=1;
						else $isWhite=0;
						if(isset($_POST['isprint'])) $isPrint = $_POST['isprint'];
						else $isPrint = 1;
						
						if($_POST['ordertype']=='general' && $_POST['state']!="true"){
							// アイテム毎の枚数にかかわらず、注文合計枚数によって量販価格を適用する
							if($order_amount<150){
								$sales_volume = $val['amount'];
							}else if($order_amount<300){
								$sales_volume = 150;
								$isVolumeSales = 1;
							}else{
								$sales_volume = 300;
								$isVolumeSales = 1;
							} 
							// 一般の未確定注文の表示、商品追加、注文確定日付の変更
							$info['cost'] = intval($catalog->getItemPrice($info['item_id'], $val['size_id'], $isPrint, $isWhite, $_POST['curdate'], $_POST['ordertype'], $sales_volume), 10);
						}else{
							$info['cost'] = intval($val['cost'], 10);	// 業者の商品追加、または一般の確定注文の表示
							if($_POST['ordertype']=='general' && $info['amount']>149){
								$isVolumeSales = 1;
							}
						}
						$info['amount'] = intval($val['amount'], 10);
						
						if($_POST['state']=="true"){
							$list = $val['item_name'];
						}else{
							$fields = $catalog->getTableList('item', $info['category_id'], 0, $_POST['curdate']);
							$list = '<select onchange="mypage.changeitem(this, '.$val['size_id'].','.$val['master_id'].')">';
							for($t=0; $t<count($fields); $t++){
								$list .= '<option value="'.$fields[$t]['item_id'].'">'.$fields[$t]['item_name'].'</option>';
							}
							$list .= '</select>';
							$list = preg_replace('/value="'.$info['item_id'].'"/', 'value="'.$info['item_id'].'" selected="selected"', $list);
						}
						if($val['size_id']==0){
							$info['size_name'] = '未定';
							$bgPendingSize = "style='background:#fdf6f6;color:#c33;'";
						}else{
							$info['size_name'] = $catalog->getSizename($val['size_id']);
							$bgPendingSize = "";
						}
						if(empty($info['color_name'])){
							$color_name = '未定';
							$bgPendingColor = "style='background:#fdf6f6;color:#c33;'";
						}else{
							$color_name = $info['color_name'];
							$bgPendingColor = "";
						}

						$choice = '';
						$opacity = '';
						if($_POST['ordertype']=='general'){
							$choice = '<input type="checkbox" class="choice" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')"';
							if(empty($val['choice'])){
								$opacity = ' style="opacity:0.3"';
							}else{
								$choice .= ' checked="checked"';
								$tot_amount += $info['amount'];
								$tot_cost += $info['cost']*$info['amount'];
							}
							$choice .= ' />';
						}else{
							$tot_amount += $info['amount'];
							$tot_cost += $info['cost']*$info['amount'];
						}

						$res .= '<tr'.$opacity.'><td class="tip"><span class="itemid">'.$info['item_id'].'</span>';
						$res .= '<span class="positionid">'.$info['printposition_id'].'</span><span class="ratioid">'.$info['printratio_id'].'</span>';
						$res .= '<span class="masterid">'.$val['master_id'].'</span><span class="group1">'.$info['item_group1_id'].'</span><span class="group2">'.$info['item_group2_id'].'</span></td>';
						$res .= '<td>'.$choice.'</td>';
						$res .=	'<td class="id_'.$info['category_id'].'_'.$info['category_key'].'">'.$info['category_name'].'</td>';
						$res .=	'<td class="item_selector">'.$list.'</td>';
						$res .=	'<td class="itemsize_name" '.$bgPendingSize.'><img id="size_'.$val['size_id'].'" alt="'.$val['master_id'].'_'.$info['color_code'].'" src="./img/reload.png" width="16" class="change_size" />'.$info['size_name'].'</td>';
						$res .=	'<td class="itemcolor_name" '.$bgPendingColor.'><img id="sizeOfColor'.$i.'_'.$val['size_id'].'" alt="'.$val['master_id'].'" src="./img/circle.png" width="16" class="change_itemcolor" />'.$color_name.'</td>';
						$res .=	'<td class="centering"><input type="text" value="'.$info['amount'].'" onchange="mypage.updateitem(this, '.$val['size_id'].','.$val['master_id'].')" class="listamount forReal" /></td>';
						if($_POST['ordertype']=='general'){
							$res .=	'<td class="itemcost toright">'.number_format($info['cost']).'</td>';
						}else{
							$res .=	'<td class="centering"><input type="text" value="'.number_format($info['cost']).'" onchange="mypage.updateitem(this, '.$val['size_id'].','.$val['master_id'].')" class="itemcost forPrice" /></td>';
						}
						$subtotal=$info['cost']*$info['amount'];
						$res .= '<td class="subtotal">'.number_format($subtotal).'</td>';
						$res .=	'<td class="centering">';
						$res .= '<select class="plateis" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')">';
						$res .= preg_replace('/value="'.$val['plateis'].'"/', 'value="'.$val['plateis'].'" selected="selected"', $plateis);
						$res .= '</select></td>';
						if(is_null($itemstock)){
							$itemstock = '-';
						}else if(empty($itemstock)){
							$itemstock = '×';
						}else if($itemstock>999){
							$itemstock = '〇';
						}
						$res .= '<td class="stock_status">'.$itemstock.'</td>';
						$res .=	'<td class="none"><input type="button" value="削除" onclick="mypage.removeitem(this, '.$val['size_id'].','.$val['master_id'].')" /></td>';
						$res .=	'<td class="tip"><span>'.$info['stock_number'].'</span><span>'.$info['maker_name'].'</span></td></tr>';
					}
				}
				//$res .= '|'.$tot_amount.'|'.$tot_cost;
				
				$result = array($res,$tot_amount,$tot_cost,$existNotBring,$isVolumeSales);
				$json = new Services_JSON();
				$res = $json->encode($result);
			}else{
				$json = new Services_JSON();
				$res = $json->encode(array());
			}
			header("Content-Type: text/javascript; charset=utf-8");
			break;
		
		case 'orderlist_old':
		/*
		 *	注文リストのテーブルを生成
		 *		一般の初期表示
		 *		一般・業者の商品の追加と商品テーブルの更新
		 *
		 */
			$res = '';
			// sessionStorageのデータをアイテムごとに変換
			$order_amount = 0;
			$keynames = array('maker','master_id','item_name','color_code','size_id','size_name','amount','cost','choice','stock_number','group1','group2');
			$keynameLen = count($keynames);
			$masterLen = count($_POST['master_id']);
			$ls = array();
			for($i = 0; $i < $masterLen; $i++){
				for($a = 0; $a < $keynameLen; $a++){
					$ls[$i][$keynames[$a]] = $_POST[$keynames[$a]][$i];
				}
				// 注文合計枚数
				if($ls[$i]['choice']==1) $order_amount += $ls[$i]['amount'];
			}
			
			$plateis = '<option value="1">A</option><option value="2">B</option><option value="3">C</option><option value="4">D</option>';
			$tot_amount = 0;
			$tot_cost = 0;
			$existNotBring = 0;	// 1:1つでも持込以外がある、0:全て持込
			$isVolumeSales = 0; // 1:量販価格適用、0:通常価格のみ
			if(!empty($ls)){
				$catalog = new Catalog();
				$len = count($ls);

				for($i = 0; $i < $len; $i++){
					$val = $ls[$i];
					$info = array();

					if( preg_match('/^mst/',$val['master_id']) ){
						$prm = explode('_',$val['master_id']);		// ['mst', category_id, item_name, item_color]
						$info['item_name'] = $prm[2];
						$info['size_name'] = $val['size_name'];
						$info['item_color'] = $prm[3];
						$info['amount'] = intval($val['amount'], 10);
						$info['stock_number'] = $val['stock_number'];
						$info['maker'] = $val['maker'];
						
						$choice = '';
						$opacity = '';
						if($_POST['ordertype']=='general'){
							$choice = '<input type="checkbox" class="choice" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')"';
							if(empty($val['choice'])){
								$opacity = ' style="opacity:0.3"';
							}else{
								$choice .= ' checked="checked"';
								$tot_amount += $info['amount'];
								$tot_cost += intval($val['cost'], 10)*$info['amount'];
							}
							$choice .= ' />';
						}
						$category_id = $prm[1];
						if($prm[1]==99){	// 業者の転写シート
							$item_id = '99999';
							$ppID = '99';
							$category_name = '転写シート';
							$tot_amount += $info['amount'];
							$res .= '<tr><td class="tip"><span class="itemid">'.$item_id.'</span><span class="positionid">'.$ppID.'</span><span class="ratioid">0</span><span class="masterid">'.$val['master_id'].'</span><span class="group1">0</span><span class="group2">0</span></td>';
						}else{				// 持込またはその他
							$item_id = $prm[1].'_'.$info['item_name'];
							$ppID = $prm[1].'_'.$info['item_name'];
							if($prm[1]==100){
								$category_name = '持込';
							}else{
								$category_name = 'その他';
							}
							if($_POST['ordertype']=='industry') $tot_amount += $info['amount'];
							$res .= '<tr'.$opacity.'><td class="tip"><span class="itemid">'.$item_id.'</span><span class="positionid">'.$ppID.'</span><span class="ratioid">0</span><span class="masterid">'.$val['master_id'].'</span><span class="group1">0</span><span class="group2">0</span></td>';
						}
						if($category_name!='持込') $existNotBring = 1;	// 持込以外
						$res .= '<td>'.$choice.'</td>';
						$res .=	'<td class="id_'.$category_id.'_">'.$category_name.'</td>';
						$res .=	'<td class="item_selector">'.$info['item_name'].'</td>';
						$res .=	'<td class="itemsize_name centering">';
						if($prm[1]==99){
							$res .= $val['size_id'].'</td>';
						}else{
							$res .= '<input type="text" value="'.$val['size_id'].'" onchange="mypage.changeItemsize(\''.$val['master_id'].'\',\''.$val['size_id'].'\',\'\',this)" class="extsize" /></td>';
						}
						$res .=	'<td class="itemcolor_name centering">';
						if($prm[1]==99){
							$res .= $info['item_color'].'</td>';
						}else{
							$res .= '<input type="text" value="'.$info['item_color'].'" onchange="mypage.changeItemcolor(\''.$val['master_id'].'\',\''.$val['size_id'].'\',this)" class="extcolor" /></td>';
						}
						$res .=	'<td class="centering"><input type="text" value="'.$info['amount'].'" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')" class="listamount forReal" /></td>';
						$res .=	'<td class="centering"><input type="text" value="'.number_format($val['cost']).'" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')" class="itemcost forPrice" /></td>';
						$subtotal=$val['cost']*$info['amount'];
						$res .= '<td class="subtotal">'.number_format($subtotal).'</td>';
						$res .=	'<td class="centering">';
						$res .= '<select class="plateis" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')">';
						$res .= preg_replace('/value="'.$val['plateis'].'"/', 'value="'.$val['plateis'].'" selected="selected"', $plateis);
						$res .= '</select></td>';
						$res .= '<td class="stock_status">-</td>';
						$res .=	'<td class="none"><input type="button" value="削除" onclick="mypage.removeitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')" /></td>';
						$res .=	'<td class="tip"><span>'.$info['stock_number'].'</span><span>'.$info['maker'].'</span></td></tr>';

					}else{
						$existNotBring = 1;	// 持込以外
						if($_POST['state']=="true"){
							$state = 1;	// 確定注文
							$itemstock = null;	// 在庫数は非表示扱い
						}else{
							$state = '';
							// 在庫数を取得
							$itemstock = $catalog->getItemStock($val['master_id'], $val['size_id']);
						}
						$info = Catalog::getCatalog($state, $val['master_id'], $_POST['curdate']);
						if(empty($info)) continue;
						
						$info['stock_number'] = $info['item_code'].'_'.$info['color_code'];
						if( ($info['color_name']=='ホワイト' && $info['item_id']!=112) || ($info['color_name']=='ナチュラル' && ($info['item_id']==112 || $info['item_id']==212)) ) $isWhite=1;
						else $isWhite=0;
						if(isset($_POST['isprint'])) $isPrint = $_POST['isprint'];
						else $isPrint = 1;
						
						if($_POST['ordertype']=='general' && $_POST['state']!="true"){
							// アイテム毎の枚数にかかわらず、注文合計枚数によって量販価格を適用する
							if($order_amount<150){
								$sales_volume = $val['amount'];
							}else if($order_amount<300){
								$sales_volume = 150;
								$isVolumeSales = 1;
							}else{
								$sales_volume = 300;
								$isVolumeSales = 1;
							} 
							// 一般の未確定注文の表示、商品追加、注文確定日付の変更
							$info['cost'] = intval($catalog->getItemPrice($info['item_id'], $val['size_id'], $isPrint, $isWhite, $_POST['curdate'], $_POST['ordertype'], $sales_volume), 10);
						}else{
							$info['cost'] = intval($val['cost'], 10);	// 業者の商品追加、または一般の確定注文の表示
							if($_POST['ordertype']=='general' && $info['amount']>149){
								$isVolumeSales = 1;
							}
						}
						$info['amount'] = intval($val['amount'], 10);
						
						if($_POST['state']=="true"){
							$list = $val['item_name'];
						}else{
							$fields = $catalog->getTableList('item', $info['category_id'], 0, $_POST['curdate']);
							$list = '<select onchange="mypage.changeitem(this, '.$val['size_id'].','.$val['master_id'].')">';
							for($t=0; $t<count($fields); $t++){
								$list .= '<option value="'.$fields[$t]['item_id'].'">'.$fields[$t]['item_name'].'</option>';
							}
							$list .= '</select>';
							$list = preg_replace('/value="'.$info['item_id'].'"/', 'value="'.$info['item_id'].'" selected="selected"', $list);
						}
						if($val['size_id']==0){
							$info['size_name'] = '未定';
							$bgPendingSize = "style='background:#fdf6f6;color:#c33;'";
						}else{
							$info['size_name'] = $catalog->getSizename($val['size_id']);
							$bgPendingSize = "";
						}
						if(empty($info['color_name'])){
							$color_name = '未定';
							$bgPendingColor = "style='background:#fdf6f6;color:#c33;'";
						}else{
							$color_name = $info['color_name'];
							$bgPendingColor = "";
						}

						$choice = '';
						$opacity = '';
						if($_POST['ordertype']=='general'){
							$choice = '<input type="checkbox" class="choice" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')"';
							if(empty($val['choice'])){
								$opacity = ' style="opacity:0.3"';
							}else{
								$choice .= ' checked="checked"';
								$tot_amount += $info['amount'];
								$tot_cost += $info['cost']*$info['amount'];
							}
							$choice .= ' />';
						}else{
							$tot_amount += $info['amount'];
							$tot_cost += $info['cost']*$info['amount'];
						}

						$res .= '<tr'.$opacity.'><td class="tip"><span class="itemid">'.$info['item_id'].'</span>';
						$res .= '<span class="positionid">'.$info['printposition_id'].'</span><span class="ratioid">'.$info['printratio_id'].'</span>';
						$res .= '<span class="masterid">'.$val['master_id'].'</span><span class="group1">'.$info['item_group1_id'].'</span><span class="group2">'.$info['item_group2_id'].'</span></td>';
						$res .= '<td>'.$choice.'</td>';
						$res .=	'<td class="id_'.$info['category_id'].'_'.$info['category_key'].'">'.$info['category_name'].'</td>';
						$res .=	'<td class="item_selector">'.$list.'</td>';
						$res .=	'<td class="itemsize_name" '.$bgPendingSize.'><img id="size_'.$val['size_id'].'" alt="'.$val['master_id'].'_'.$info['color_code'].'" src="./img/reload.png" width="16" class="change_size" />'.$info['size_name'].'</td>';
						$res .=	'<td class="itemcolor_name" '.$bgPendingColor.'><img id="sizeOfColor'.$i.'_'.$val['size_id'].'" alt="'.$val['master_id'].'" src="./img/circle.png" width="16" class="change_itemcolor" />'.$color_name.'</td>';
						$res .=	'<td class="centering"><input type="text" value="'.$info['amount'].'" onchange="mypage.updateitem(this, '.$val['size_id'].','.$val['master_id'].')" class="listamount forReal" /></td>';
						if($_POST['ordertype']=='general'){
							$res .=	'<td class="itemcost toright">'.number_format($info['cost']).'</td>';
						}else{
							$res .=	'<td class="centering"><input type="text" value="'.number_format($info['cost']).'" onchange="mypage.updateitem(this, '.$val['size_id'].','.$val['master_id'].')" class="itemcost forPrice" /></td>';
						}
						$subtotal=$info['cost']*$info['amount'];
						$res .= '<td class="subtotal">'.number_format($subtotal).'</td>';
						$res .=	'<td class="centering">';
						$res .= '<select class="plateis" onchange="mypage.updateitem(this, \''.$val['size_id'].'\',\''.$val['master_id'].'\')">';
						$res .= preg_replace('/value="'.$val['plateis'].'"/', 'value="'.$val['plateis'].'" selected="selected"', $plateis);
						$res .= '</select></td>';
						if(is_null($itemstock)){
							$itemstock = '-';
						}else if(empty($itemstock)){
							$itemstock = '×';
						}else if($itemstock>999){
							$itemstock = '〇';
						}
						$res .= '<td class="stock_status">'.$itemstock.'</td>';
						$res .=	'<td class="none"><input type="button" value="削除" onclick="mypage.removeitem(this, '.$val['size_id'].','.$val['master_id'].')" /></td>';
						$res .=	'<td class="tip"><span>'.$info['stock_number'].'</span><span>'.$info['maker_name'].'</span></td></tr>';
					}
				}
				//$res .= '|'.$tot_amount.'|'.$tot_cost;
				
				$result = array($res,$tot_amount,$tot_cost,$existNotBring,$isVolumeSales);
				$json = new Services_JSON();
				$res = $json->encode($result);
			}else{
				$json = new Services_JSON();
				$res = $json->encode(array());
			}
			header("Content-Type: text/javascript; charset=utf-8");
			break;

		case 'orderlistext':
		/*
		 *	業者の初期表示で注文リストのタグを生成
		 *
		 */
		 	// sessionStorageのデータをアイテムごとに変換
			$keynames = array('maker','master_id','item_name','color_code','size_id','size_name','amount','cost','choice','stock_number');
			for($i=0; $i<count($_POST['master_id']); $i++){
				for($a=0; $a<count($keynames); $a++){
					$ls[$i][$keynames[$a]] = $_POST[$keynames[$a]][$i];
				}
			}
			if(empty($ls)) break;
			
			$catalog = new Catalog();
			//$orders = new Orders();
			//$data = $orders->db('search', 'orderitem', array('orders_id'=>$_POST['orders_id']));
			//if(empty($data)) break;
			// sort
			$ms = new Multisorter();
			$ls = $ms->start($ls);
				
			$plateis .= '<option value="1">A</option><option value="2">B</option><option value="3">C</option><option value="4">D</option>';
			
			$res = "";
			for($i=0; $i<count($ls); $i++){
				$data = $ls[$i];
				$bgPendingSize = '';
				$bgPendingColor = '';
				$itemstock = null;	// 在庫数
				$val = array();
				if( preg_match('/^mst/',$data['master_id']) ){
					$prm = explode('_',$data['master_id']);		// ['mst', category_id, item_name, item_color]
					$val['item_name'] = $prm[2];
					$val['size_name'] = $data['size_name'];
					$val['item_color'] = $prm[3];
					$val['amount'] = intval($data['amount'], 10);
					$val['stock_number'] = $data['stock_number'];
					$val['maker'] = $data['maker'];
				}else{
					$prm = null;
				}
				
				if($prm[1]==0 && !is_null($prm)){
				// その他
					$item_id = '0_'.$val['item_name'];
					$ppID = '0_'.$val['item_name'];
					$ratio = '0';
					$category_name = 'その他';
					$category_id = '0_';
					$master_id = $data['master_id'];
					$list = $val['item_name'];
				}else if($prm[1]==100){
				// 持込
					$item_id = '100_'.$val['item_name'];
					$ppID = '100_'.$val['item_name'];
					$ratio = '0';
					$category_name = '持込';
					$category_id = '100_';
					$master_id = $data['master_id'];
					$list = $val['item_name'];
				}else if($prm[1]==99){
				// 転写シート
					$item_id = '99999';
					$ppID = '99';
					$ratio = '0';
					$category_name = '転写シート';
					$category_id = '99_';
					$master_id = $data['master_id'];
					$list = $val['item_name'];
				}else{
				// 取扱商品
					if($_POST['state']=="true"){
						$state = 1;	// 確定注文
					}else{
						$state = '';
						$itemstock = $catalog->getItemStock($data['master_id'], $data['size_id']);
					}
					$info = Catalog::getCatalog($state, $data['master_id'], $_POST['curdate']);
					if(empty($info)) continue;
					//$info = Catalog::getItemData($data[$i]['item_id'], $data[$i]['color_code'], $_POST['curdate']);
					$item_id = $info['item_id'];
					$ppID = $info['printposition_id'];
					$ratio = $info['printratio_id'];
					$category_name = $info['category_name'];
					$category_id = $info['category_id'].'_'.$info['category_key'];
					$master_id = $data['master_id'];
					$code = explode('_', $data['stock_number']);
					if($_POST['state']=="true"){
						$list = $data['item_name'];
					}else{
						$fields = $catalog->getTableList('item', $info['category_id'], 0, $_POST['curdate']);
						$list = '<select onchange="mypage.changeitem(this, '.$data['size_id'].','.$master_id.')">';
						for($t=0; $t<count($fields); $t++){
							$list .= '<option value="'.$fields[$t]['item_id'].'">'.$fields[$t]['item_name'].'</option>';
						}
						$list .= '</select>';
						$list = preg_replace('/value="'.$item_id.'"/', 'value="'.$item_id.'" selected="selected"', $list);
					}
					if($data['size_name']=='未定'){
						$bgPendingSize = "style='background:#fdf6f6;color:#c33;'";
					}
					if($data['color_code']=='000'){
						$bgPendingColor = "style='background:#fdf6f6;color:#c33;'";
						$info['color_name'] = '未定';
					}
				}
				$res .= '<tr><td class="tip"><span class="itemid">'.$item_id.'</span><span class="positionid">'.$ppID.'</span><span class="ratioid">'.$ratio.'</span><span class="masterid">'.$master_id.'</span></td>';
				$res .= '<td></td>';
				$res .=	'<td class="id_'.$category_id.'">'.$category_name.'</td>';
				$res .=	'<td class="item_selector">'.$list.'</td>';
				if(($prm[1]==0 && !is_null($prm)) || $prm[1]==100){
					$res .=	'<td class="itemsize_name centering" '.$bgPendingSize.'>';
					$res .= '<input type="text" value="'.$data['size_name'].'" onchange="mypage.changeItemsize(\''.$master_id.'\',\''.$data['size_id'].'\',\'\',this)" class="extsize" /></td>';
				}else if($prm[1]==99){
					$res .=	'<td class="itemsize_name" '.$bgPendingSize.'>';
					$res .= $data['size_name'].'</td>';
				}else{
					$res .=	'<td class="itemsize_name" '.$bgPendingSize.'>';
					$res .= '<img id="size_'.$data['size_id'].'" alt="'.$master_id.'_'.$code[1].'" src="./img/reload.png" width="16" class="change_size" />';
					$res .= $data['size_name'].'</td>';
				}
				if(($prm[1]==0 && !is_null($prm)) || $prm[1]==100){
					$res .= '<td class="itemcolor_name centering" '.$bgPendingColor.'>';
					$res .=	'<input type="text" value="'.$data['color_code'].'" onchange="mypage.changeItemcolor(\''.$master_id.'\',\''.$data['size_id'].'\',this)" class="extcolor" /></td>';
				}else if($prm[1]==99){
					$res .= '<td class="itemcolor_name" '.$bgPendingColor.'>';
					$res .=	$data['color_code'].'</td>';
				}else{
					$res .= '<td class="itemcolor_name" '.$bgPendingColor.'>';
					$res .= '<img id="sizeOfColor'.$i.'_'.$data['size_id'].'" alt="'.$master_id.'" src="./img/circle.png" width="16" class="change_itemcolor" />';
					$res .=	$info['color_name'].'</td>';
				}
				$res .=	'<td class="centering"><input type="text" value="'.$data['amount'].'" class="listamount forReal" onchange="mypage.updateitem(this, \''.$data['size_id'].'\',\''.$master_id.'\')" /></td>';
				$res .=	'<td class="centering"><input type="text" value="'.$data['cost'].'" class="itemcost forPrice" onchange="mypage.updateitem(this, \''.$data['size_id'].'\',\''.$master_id.'\')" /></td>';
				$subtotal=$data['cost']*$data['amount'];
				$res .= '<td class="subtotal">'.number_format($subtotal).'</td>';
				$res .=	'<td class="centering">';
				$res .= '<select class="plateis" onchange="mypage.updateitem(this, \''.$data['size_id'].'\',\''.$master_id.'\')">';
				$res .= preg_replace('/value="'.$data['plateis'].'"/', 'value="'.$data['plateis'].'" selected="selected"', $plateis);
				$res .= '</select></td>';
				if(is_null($itemstock)){
					$itemstock = '-';
				}else if(empty($itemstock)){
					$itemstock = '×';
				}else if($itemstock>999){
					$itemstock = '〇';
				}
				$res .= '<td class="stock_status">'.$itemstock.'</td>';
				$res .=	'<td class="none"><input type="button" value="削除" onclick="mypage.removeitem(this, \''.$data['size_id'].'\',\''.$master_id.'\')" /></td>';
				$res .=	'<td class="tip"><span>'.$data['stock_number'].'</span><span>'.$data['maker'].'</span></td></tr>';

				//$cart->addCart($master_id, $data[$i]['size_id'], $data[$i]['amount'], $data[$i]['stock_number'], $data[$i]['maker'], $data[$i]['plateis'], $data[$i]['price']);
			}
			break;

		case 'totalamount':
			$cart = new Cart();
			$res = $cart->totalAmount();
			break;

		case 'printposition':
		/*
		 *	商品の追加時に
		 *	プリント情報のタグを生成して返す
		 *
		 */
			$files = array();
			if(strpos($_POST['item_id'], '_')!==false){
			// その他または持込
				$itemname = explode('_', $_POST['item_id']);
				$res = '<div class="printposition_'.$_POST['item_id'].'">';
				$res .= '<p class="pp_box_title">'.$itemname[1].'</p>';
				$res .= '<div class="pp_box">';
				
				$res .= '<div class="position_name_wrapper"><div class="position_name current"><span>front</span></div></div>';
				$res .= '<div class="show_list">list &gt</div>';
				// $res .= '<div class="position_reset">reset</div>';
				
				if($_POST['ordertype']!='industry'){
					$res .= '<div class="repeat_check_wrap"><label>リピ版<input type="checkbox" name="repeat_check" class="repeat_check"></label></div>';
				}
				$res .= '<div class="pp_image">';
				
				$imgfile = file_get_contents(_DOC_ROOT.'txt/t-shirts/normal-tshirts/front.txt');
				$imgfile = preg_replace('/\.\/img\//', _IMG_PSS, $imgfile);
				$res .= preg_replace('/^\xEF\xBB\xBF/', '', $imgfile);
				
				$res .= '</div>';
				
				$res .= '<div class="pp_info"><table><tbody>';
				$res .= '<tr><td colspan="2"><form>色数 ';
				$res .= '<input type="number" min="0" max="10" class="ink_count" value="0" onchange="mypage.changeInkcount(this);">色 ';
				$res .= '<label><input type="radio" value="1" name="silkmethod" class="silkmethod" checked="checked">ラバー</label>　';
				$res .= '<label><input type="radio" value="2" name="silkmethod" class="silkmethod">染込み</label>';
				$res .= '</form>';
				$res .= '</td></tr>';
				$res .= '<tr><td colspan="2">プリント方法 <select class="print_type" onchange="mypage.changePrinttype(this)"><option value="silk" selected="selected">シルク</option><option value="trans">カラー転写</option><option value="digit">デジタル転写</option><option value="inkjet">インクジェット</option><option value="cutting">カッティング</option><option value="embroidery">刺繍</option></select></td></tr>';
				$res .= '<tr><td style="width:160px;">';
				$res .= '版（縦<input type="text" value="35" size="3" class="forNum areasize_from" onchange="mypage.limit_size(this,\'silk\');" />×横<input type="text" value="27" size="3" class="forNum areasize_to" onchange="mypage.limit_size(this,\'silk\');" />）</td>';
				$res .= '<td style="width:110px;">サイズ <input type="text" value="" class="design_size" /></td></tr>';
				$res .= '<tr><td colspan="2"><form>';
				$res .= '<label><input type="radio" value="0" name="jumbo" class="jumbo_plate" onchange="mypage.changePlate(this)" checked="checked" />通常</label>';
				$res .= '<label><input type="radio" value="1" name="jumbo" class="jumbo_plate" onchange="mypage.changePlate(this)" />ジャンボ</label>';
				$res .= '<label><input type="radio" value="2" name="jumbo" class="jumbo_plate" onchange="mypage.changePlate(this)" />スーパージャンボ</label>';
				$res .= '</form></td></tr>';
				$res .= '<tr><td colspan="2">デザイン <select class="designplate" onchange="mypage.calcPrintFee()">';
				$res .= '<option value="1" selected="selected">A</option><option value="2">B</option><option value="3">C</option><option value="4">D</option>';
				$res .= '</select>';
				$res .= '　原稿 <select class="design_type" onchange="mypage.changeDesignType(this)">';
				$res .= '<option value="" selected="selected">未定</option>';
				$res .= '<option value="画像">画像</option>';
				$res .= '<option value="手描き">手描き</option>';
				$res .= '<option value="文字打">文字打</option>';
				$res .= '<option value="イラレ">イラレ</option>';
				$res .= '<option value="PSD">ＰＳＤ</option>';
				$res .= '<option value="PDF">ＰＤＦ</option>';
				$res .= '<option value="その他">その他</option>';
				$res .= '</select>';
				$res .= '<input type="text" value="" class="design_type_note" />';
				$res .= '</td></tr></tbody></table></div>';
				
				$res .= '<div class="pp_ink">';
				
				//$res .= '<div>インクの色<input type="button" value="色替え⇒" class="toggle_exchink" /></div>';
				
				$res .= '<div>色指定</div>';
				for($t=0; $t<4; $t++){
					$res .= '<p><input type="text" value="" alt="" readonly="readonly" class="pos_name" />&nbsp;<img alt="" src="./img/circle.png" width="22" height="22" class="palette" />&nbsp;<input type="text" value="" size="15" readonly="readonly" /><img alt="clear" src="./img/cross.png" width="16" height="16" class="cross" /></p>';
				}
				$res .= '</div>';
				
				/*
				$res .= '<div class="exch_ink">';
				$res .= '<div class="gall">';
				$res .= '<div>インク色替え</div>';
				for($t=0; $t<4; $t++){
					$res .= '<p><span><input type="number" min="0" value="0" alt="" class="exch_vol" onchange="mypage.calcExchinkFee();" />&nbsp;<img alt="" src="./img/circle.png" width="22" height="22" class="palette" />&nbsp;<input type="text" value="" size="15" readonly="readonly" /><img alt="clear" src="./img/cross.png" width="16" height="16" class="cross" /><img alt="addnew" src="./img/plus.png" width="16" height="16" class="plus" /></span></p>';
				}
				$res .= '</div></div>';
				*/
				
				$res .= '<div class="pp_price"><p><input type="button" value="追加" class="add_print_position" /></p></div>';
				$res .= '</div></div>';
				
			}else if($_POST['item_id']=='99999'){
			// 転写シート
				$res = '<div class="printposition_99">';
				$res .= '<div class="pp_box">';
				
				$res .= '<div class="position_name_wrapper"><div class="position_name current"><span>fixed</span></div></div>';
				$res .= '<div class="pp_image">';
				
				$imgfile = file_get_contents(_DOC_ROOT.'txt/misc/others/fixed.txt');
				$imgfile = preg_replace('/\.\/img\//', _IMG_PSS, $imgfile);
				$res .= preg_replace('/^\xEF\xBB\xBF/', '', $imgfile);
				
				$res .= '</div>';
				
				$res .= '<div class="pp_info"><table><tbody><tr style="visibility:hidden;"><td colspan="2">色数 ';
				$res .= '<input type="number" min="0" max="10" class="ink_count" value="0" onchange="mypage.changeInkcount(this);">色</td></tr>';
				$res .= '<tr><td colspan="2">プリント方法 <select class="print_type"><option value="digit" selected="selected">デジタル転写</option></select></td></tr>';
				$res .= '<tr><td style="width:160px;">版 <select class="areasize_id"><option value="0" selected="selected">固定</option></select></td>';
				$res .= '<td style="width:110px;">サイズ <input type="text" value="" class="design_size" /></td></tr>';
				$res .= '<tr><td colspan="2"></td></tr>';
				$res .= '<tr><td colspan="2">デザイン <select class="designplate" onchange="mypage.calcPrintFee()">';
				$res .= '<option value="1" selected="selected">A</option><option value="2">B</option><option value="3">C</option><option value="4">D</option>';
				$res .= '</select>';
				$res .= '　原稿 <select class="design_type" onchange="mypage.changeDesignType(this)">';
				$res .= '<option value="" selected="selected">未定</option>';
				$res .= '<option value="画像">画像</option>';
				$res .= '<option value="手描き">手描き</option>';
				$res .= '<option value="文字打">文字打</option>';
				$res .= '<option value="イラレ">イラレ</option>';
				$res .= '<option value="PSD">ＰＳＤ</option>';
				$res .= '<option value="PDF">ＰＤＦ</option>';
				$res .= '<option value="その他">その他</option>';
				$res .= '</select>';
				$res .= '<input type="text" value="" class="design_type_note" />';
				$res .= '</td></tr></tbody></table></div>';
				
				$res .= '<div class="pp_ink"></div>';
				
				$res .= '<div class="pp_price"></div>';
				$res .= '</div></div>';
			
			}else{

				$info = Catalog::getPrintposition($_POST['item_id'], 0, $_POST['curdate']);
				$path = _DOC_ROOT.'txt/'.$info[0]['category_type'].'/'.$info[0]['item_type'].'/*.txt';

				$res = '<div class="printposition_'.$info[0]['printposition_id'].'">';
				
				$res .= '<div class="pp_box">';
				$res .= '<div class="position_name_wrapper">';
				
				foreach (glob($path) as $filename) {
					$base = basename($filename, '.txt');
					if(strpos($base, 'front')!==false){
						$position_name = '前';
						$files[0] = array('filename'=>$filename, 'position_name'=>$position_name, 'base'=>$base);
					}elseif(strpos($base, 'back')!==false){
						$position_name = '後';
						$files[1] = array('filename'=>$filename, 'position_name'=>$position_name, 'base'=>$base);
					}elseif(strpos($base, 'side')!==false){
						$position_name = '横';
						$files[2] = array('filename'=>$filename, 'position_name'=>$position_name, 'base'=>$base);
					}elseif(strpos($base, 'noprint')!==false){
						$position_name = '';
						$files[0] = array('filename'=>$filename, 'position_name'=>$position_name, 'base'=>$base);
					}
				}
				
				$isFirstIndex = false;
				for($i=0; $i<3; $i++){
					if(empty($files[$i])) continue;
					if ($isFirstIndex === false) {
						$isFirstIndex = $i;
						$res .= '<div class="position_name current"><span>'.$files[$i]['base'].'</span>'.$files[$i]['position_name'].'</div>';
					} else {
						$res .= '<div class="position_name"><span>'.$files[$i]['base'].'</span>'.$files[$i]['position_name'].'</div>';
					}
				}
				
				$res .= '</div>';
				if($_POST['ordertype']!='industry'){
					$res .= '<div class="repeat_check_wrap"><label>リピ版<input type="checkbox" name="repeat_check" class="repeat_check"></label></div>';
				}
				$res .= '<div class="pp_image">';
				
				$imgfile = file_get_contents($files[$isFirstIndex]['filename']);
				$imgfile = preg_replace('/\.\/img\//', _IMG_PSS, $imgfile);
				$res .= preg_replace('/^\xEF\xBB\xBF/', '', $imgfile);
				
				$res .= '</div>';
				
				$res .= '<div class="pp_info"><table><tbody><tr><td colspan="2"><form>色数 ';
				$res .= '<input type="number" min="0" max="10" class="ink_count" value="0" onchange="mypage.changeInkcount(this);">色 ';
				$res .= '<label><input type="radio" value="1" name="silkmethod" class="silkmethod" checked="checked">ラバー</label>　';
				$res .= '<label><input type="radio" value="2" name="silkmethod" class="silkmethod">染込み</label>';
				$res .= '</form>';
				$res .= '</td></tr>';
				$res .= '<tr><td colspan="2">プリント方法 <select class="print_type" onchange="mypage.changePrinttype(this)"><option value="silk" selected="selected">シルク</option><option value="trans">カラー転写</option><option value="digit">デジタル転写</option><option value="inkjet">インクジェット</option><option value="cutting">カッティング</option><option value="embroidery">刺繍</option></select></td></tr>';
				$res .= '<tr><td style="width:160px;">';
				$res .= '版（縦<input type="text" value="35" size="3" class="forNum areasize_from" onchange="mypage.limit_size(this,\'silk\');" />×横<input type="text" value="27" size="3" class="forNum areasize_to" onchange="mypage.limit_size(this,\'silk\');" />）</td>';
				$res .= '<td style="width:110px;">サイズ <input type="text" value="" class="design_size" /></td></tr>';
				$res .= '<tr><td colspan="2"><form>';
				$res .= '<label><input type="radio" value="0" name="jumbo" class="jumbo_plate" onchange="mypage.changePlate(this)" checked="checked" />通常</label>';
				$res .= '<label><input type="radio" value="1" name="jumbo" class="jumbo_plate" onchange="mypage.changePlate(this)" />ジャンボ</label>';
				$res .= '<label><input type="radio" value="2" name="jumbo" class="jumbo_plate" onchange="mypage.changePlate(this)" />スーパージャンボ</label>';
				$res .= '</form></td></tr>';
				$res .= '<tr><td colspan="2">デザイン <select class="designplate" onchange="mypage.calcPrintFee()">';
				$res .= '<option value="1" selected="selected">A</option><option value="2">B</option><option value="3">C</option><option value="4">D</option>';
				$res .= '</select>';
				$res .= '　原稿 <select class="design_type" onchange="mypage.changeDesignType(this)">';
				$res .= '<option value="" selected="selected">未定</option>';
				$res .= '<option value="画像">画像</option>';
				$res .= '<option value="手描き">手描き</option>';
				$res .= '<option value="文字打">文字打</option>';
				$res .= '<option value="イラレ">イラレ</option>';
				$res .= '<option value="PSD">ＰＳＤ</option>';
				$res .= '<option value="PDF">ＰＤＦ</option>';
				$res .= '<option value="その他">その他</option>';
				$res .= '</select>';
				$res .= '<input type="text" value="" class="design_type_note" />';
				$res .= '</td></tr></tbody></table></div>';
				
				$res .= '<div class="pp_ink">';
				
				// $res .= '<div>インクの色<input type="button" value="色替え⇒" class="toggle_exchink" /></div>';
				
				$res .= '<div>色指定</div>';
				for($t=0; $t<4; $t++){
					$res .= '<p><input type="text" value="" alt="" readonly="readonly" class="pos_name" />&nbsp;<img alt="" src="./img/circle.png" width="22" height="22" class="palette" />&nbsp;<input type="text" value="" size="15" readonly="readonly" /><img alt="clear" src="./img/cross.png" width="16" height="16" class="cross" /></p>';
				}
				$res .= '</div>';
				
				/*
				$res .= '<div class="exch_ink">';
				$res .= '<div class="gall">';
				$res .= '<div>インク色替え</div>';
				for($t=0; $t<4; $t++){
					$res .= '<p><span><input type="number" min="0" value="0" alt="" class="exch_vol" onchange="mypage.calcExchinkFee();" />&nbsp;<img alt="" src="./img/circle.png" width="22" height="22" class="palette" />&nbsp;<input type="text" value="" size="15" readonly="readonly" /><img alt="clear" src="./img/cross.png" width="16" height="16" class="cross" /><img alt="addnew" src="./img/plus.png" width="16" height="16" class="plus" /></span></p>';
				}
				$res .= '</div></div>';
				*/
				
				$res .= '<div class="pp_price"><p><input type="button" value="追加" class="add_print_position" /></p></div>';
				$res .= '</div></div>';
			}

			break;

		case 'printpositionlist':
		/*
		 *	プリント位置の絵型のリストを返す
		 */
			$list = Catalog::getPrintposition(0, 0, $_POST['curdate']);

			$res = '<ol>';
			if(isset($_POST['master'])){
			// 商品DBの更新で使用
				for($i=0; $i<count($list); $i++){

					$path = _DOC_ROOT.'img/printposition/'.$list[$i]['category_type'].'/'.$list[$i]['item_type'].'/';

					$web_path = './img/printposition/'.$list[$i]['category_type'].'/'.$list[$i]['item_type'].'/';

					if(is_dir($path)){
						if($dh = opendir($path)){
							$res .= '<li onclick="mypage.setPrintPosition(this,'.$list[$i]['id'].')"><p>'.$list[$i]['id'].'. '.$list[$i]['category_type'].' ( '.$list[$i]['item_type'].' )</p>';
							while(($file = readdir($dh)) !== false){
								if ($file == "." || $file == ".." || $file == ".DS_Store") continue;
								if(!preg_match('/^layout/', $file)) continue;
								if(strpos($file, 'ari')!==false) continue;
								$f = preg_replace('/layout_/','',$file);
								$f = preg_replace('/\.png/','',$f);
								$f = preg_replace('/nashi/','p4',$f);
								//$f = preg_replace('/ari/','p2',$f);
								$res .= '<img alt="'.$f.'" src="'.$web_path.$file.'" width="90" />';
							}
							closedir($dh);
							$res .= '</li>';
						}else die("Cannot open directory:  $path");
					}else {
						$res .= '<li>Path is not a directory:  '.$path.'</li>';
//						die("Path is not a directory:  $path");
					}
				}
			
			}else{
				for($i=0; $i<count($list); $i++){
					$path = _DOC_ROOT.'img/printposition/'.$list[$i]['category_type'].'/'.$list[$i]['item_type'].'/';
					$web_path = './img/printposition/'.$list[$i]['category_type'].'/'.$list[$i]['item_type'].'/';

					if(is_dir($path)){
						if($dh = opendir($path)){
							$res .= '<li><p>'.$list[$i]['category_type'].' ( '.$list[$i]['item_type'].' )</p>';
							while(($file = readdir($dh)) !== false){
								if ($file == "." || $file == ".." || $file == ".DS_Store") continue;
								if(!preg_match('/^layout/', $file)) continue;
								if(strpos($file, 'ari')!==false) continue;
								$f = preg_replace('/layout_/','',$file);
								$f = preg_replace('/\.png/','',$f);
								$f = preg_replace('/nashi/','p4',$f);
								//$f = preg_replace('/ari/','p2',$f);
								$res .= '<img alt="'.$f.'" src="'.$web_path.$file.'" width="90" onclick="mypage.setPrintPosition(this)" />';
							}
							closedir($dh);
							$res .= '</li>';
						}else die("Cannot open directory:  $path");
					}else die("Path is not a directory:  $path");
				}
			}
			$res .= '</ol>';
			break;

		case 'ppbox':

		/*
		 *	修正・リピート版での受注入力画面の初期表示
		 *	受注データを読込みプリント情報のタグを生成
		 *
		 */
			
			// 絵型のパターン
			$pp_pattern = array(
				array('free'=>''),
				array('front'=>'前'),
				array('front'=>'前', 'back'=>'後'),
				array('front'=>'前', 'back'=>'後', 'side'=>'横'),
				array('front'=>'前', 'back'=>'後', 'side'=>'横')
				//array('front'=>'前', 'back'=>'後', 'side_p2'=>'横', 'side_p4'=>'横')
			);
			
			
			$res = '<div class="printposition_'.$_POST['ppID'].'">';
			
			// その他または持ち込みの場合に商品名を表示するタグを追加
			$ppID = $_POST['ppID'];
			if(strpos($_POST['ppID'], '_')!==false){
				$tmp = explode('_', $_POST['ppID']);
				$ppID = $tmp[0];
				$res .= '<p class="pp_box_title">'.$tmp[1].'</p>';
			}
			
			if($ppID==0 || $ppID==100){
				$icons = '<div class="show_list">list &gt</div>';
			}
			
			$printtype = array('silk'=>'シルク','trans'=>'カラー転写','digit'=>'デジタル転写','inkjet'=>'インクジェット','cutting'=>'カッティング','embroidery'=>'刺繍','recommend'=>'おまかせ');
			$inkjet_selector = '版 <select class="areasize_id" onchange="mypage.limit_size(this)">';
			$inkjet_selector .= '<option value="0">大（27×38）</option><option value="1">中（27×18）</option><option value="2">小（10×10）</option></select>';

			$trans_selector = '版 <select class="areasize_id" onchange="mypage.limit_size(this)">';
			$trans_selector .= '<option value="0">大（27×38）</option><option value="1">中（27×18）</option><option value="2">小（10×10）</option></select>';

			$cutting_selector = '版 <select class="areasize_id" onchange="mypage.limit_size(this)">';
			$cutting_selector .= '<option value="0">大（27×38）</option><option value="1">中（27×18）</option><option value="2">小（10×10）</option></select>';
			
			$embroidery_selector = '版 <select class="areasize_id" onchange="mypage.limit_size(this)">';
			$embroidery_selector .= '<option value="0">大（25×25）</option><option value="1">中（18×18）</option><option value="2">小（10×10）</option><option value="3">極小（5×5）</option></select>';
				
			$orders = new Orders();

			$data = $orders->db('search', 'orderarea', array('orders_id'=>$_POST['orders_id'], 'category_id'=>$_POST['category_id'], 'printposition_id'=>$_POST['ppID']));
			if(!empty($data)){
				//$origin = false;
				for($t=0; $t<count($data); $t++){
					//$isSelected = false;
					$val = $data[$t];
					if($_POST['mode']=='repeat'){
						$res .= '<div class="pp_box">';
					}else{
						$res .= '<div id="areaid_'.$val['areaid'].'" class="pp_box">';
					}

					$res .= '<div class="position_name_wrapper">';
					if($ppID==99){
						$res .= '<div class="position_name current"><span>fixed</span></div>';
					}else if($ppID==0 || $ppID==100 || $ppID==46){
						// その他、持込、プリントなし商品（ハンガー等）
						$res .= '<div class="position_name current"><span>'.$val['area_name'].'</span></div>';
					}else{
						$info = Catalog::getPrintposition(0, $_POST['ppID']);
						$pp_types = $pp_pattern[$info[0]['pos_pattern']];
						
						// 絵型のテキストファイル名side_p4.txtとside_p2.txtを廃止してside.txtに統一
						if (strpos($val['area_name'], 'side_p')!==false) {
							$targetArea = 'side';
						} else {
							$targetArea = $val['area_name'];
						}
						
						foreach($pp_types as $position_key=>$position_name){
							$res .= '<div class="position_name';
							if (strpos($targetArea, $position_key)!==false) {
								$res .=' current';
							}
							$res .='"><span>'.$position_key.'</span>'.$position_name.'</div>';
						}
					}
					$res .= '</div>';
					
					$res .= $icons;	// show list button
					
					if($_POST['ordertype']!='industry'){
						$res .= '<div class="repeat_check_wrap"><label>リピ版<input type="checkbox" name="repeat_check" class="repeat_check"';
						if($val['repeat_check']==1 || $_POST['mode']=='repeat'){
							$res .= ' checked="checked"';
						}
						$res .= '></label></div>';
					}
					
					$res .= '<div class="pp_image">';
					if($val['area_name']!='free' && !empty($val['areaid'])){
						$ppImg = file_get_contents(_DOC_ROOT.$val['area_path']);
						$ppImg = preg_replace('/\.\/img\//', _IMG_PSS, $ppImg);
						$ppImg = preg_replace('/^\xEF\xBB\xBF/', '', $ppImg);
						$pos = $orders->db('search', 'orderposition', array('orderarea_id'=>$val['areaid']));
						if(!empty($pos)){
							/*
							if(!$origin){
								$origin = true;
								$isSelected = true;
							}
							*/
							if($val['area_name']!='fixed'){
								$pattern = '/alt="'.$pos[0]['selective_name'].'"(.*?)class="'.$pos[0]['selective_key'].'"/s';
								preg_match($pattern, $ppImg, $matches);
								$replacement = preg_replace('/\.png/','_on.png',$matches[0]);
								$ppImg = preg_replace($pattern, $replacement, $ppImg);
							}
						}
						$res .= $ppImg.'</div>';

					}else{
						$res .= '<img alt="プリント位置" src="./img/blank.gif" /></div>';
					}


					$res .= '<div class="pp_info"><table><tbody><tr style="visibility:';
					if($val['print_type']=='silk') $res .= 'visible';
					else $res .= 'hidden';
					$res .= '"><td colspan="2"><form>色数 ';
					$max_val = '10';
					if($val['print_type']=='silk'){
						if(preg_match('/hood|parker_mae_pocket/', $pos[0]['selective_key'])){
							$max_val = '1';
						}
					}
					$res .= '<input type="number" min="0" max="'.$max_val.'" class="ink_count" value="'.$val['ink_count'].'" onchange="mypage.changeInkcount(this);">色 ';
					$silkmethod = '<label><input type="radio" value="1" name="silkmethod" class="silkmethod">ラバー</label>　';
					$silkmethod .= '<label><input type="radio" value="2" name="silkmethod" class="silkmethod">染込み</label>';
					$res .= str_replace('value="'.$val['silkmethod'].'"','value="'.$val['silkmethod'].'" checked="checked"', $silkmethod);
					$res .= '</form>';
					$res .= '</td></tr>';
					
					if($ppID==99){
						$res .= '<tr><td colspan="2">プリント方法 <select class="print_type">';
						$res .= '<option value="digit" selected="selected">デジタル転写</option>';
						$res .= '</select></td></tr>';
						$res .= '<tr><td style="width:160px;">版 <select class="areasize_id"><option value="0" selected="selected">固定</option></select></td>';
						$res .= '<td style="width:110px;">サイズ <input type="text" value="'.$val['design_size'].'" class="design_size" /></td></tr>';
						$res .= '<tr><td colspan="2"></td></tr>';
					}else{
						$res .= '<tr><td colspan="2">プリント方法 <select class="print_type" onchange="mypage.changePrinttype(this)">';
						foreach($printtype as $tkey=> $tval){
							$res .= '<option value="'.$tkey.'"';
							if($tkey==$val['print_type']) $res .= ' selected="selected"';
							$res .= '>'.$tval.'</option>';
						}
						$res .= '</select></td></tr>';
						$res .= '<tr><td style="width:160px;">';
						switch($val['print_type']){
							case 'silk':
								$selector = '版（縦<input type="text" value="'.$val['areasize_from'].'" size="3" class="areasize_from forNum" onchange="mypage.limit_size(this,\''.$val['print_type'].'\');" />';
								$selector .= '×横<input type="text" value="'.$val['areasize_to'].'" size="3" class="areasize_to forNum" onchange="mypage.limit_size(this,\''.$val['print_type'].'\');" />）';
								break;
							case 'inkjet':
								$selector = str_replace('value="'.$val['areasize_id'].'"','value="'.$val['areasize_id'].'" selected="selected"', $inkjet_selector);
								break;
							case 'trans':
							case 'digit':
								$selector = str_replace('value="'.$val['areasize_id'].'"','value="'.$val['areasize_id'].'" selected="selected"', $trans_selector);
								break;
							case 'cutting':
								$selector = str_replace('value="'.$val['areasize_id'].'"','value="'.$val['areasize_id'].'" selected="selected"', $cutting_selector);
								break;
							case 'embroidery':
								$selector = str_replace('value="'.$val['areasize_id'].'"','value="'.$val['areasize_id'].'" selected="selected"', $embroidery_selector);
								break;
						}
						$res .= $selector.'</td>';
						$res .= '<td style="width:110px;">サイズ <input type="text" value="'.$val['design_size'].'" class="design_size" /></td></tr>';
						if($val['print_type']=='silk'){
							$res .= '<tr><td colspan="2"><form>';
							$res .= '<label><input type="radio" name="jumbo" value="0" class="jumbo_plate" onchange="mypage.changePlate(this)" ';
							if($val['jumbo_plate']==0) $res .='checked="checked" ';
							$res .= '/>通常</label>';
							$res .= '<label><input type="radio" name="jumbo" value="1" class="jumbo_plate" onchange="mypage.changePlate(this)" ';
							if($val['jumbo_plate']==1) $res .='checked="checked" ';
							$res .= '/>ジャンボ</label>';
							$res .= '<label><input type="radio" name="jumbo" value="2" class="jumbo_plate" onchange="mypage.changePlate(this)" ';
							if($val['jumbo_plate']==2) $res .='checked="checked" ';
							$res .= '/>スーパージャンボ</label>';
							$res .= '</form></td></tr>';
						}elseif($val['print_type']=='inkjet'){
							$res .= '<tr><td colspan="2">オプション&nbsp;<select class="inkoption" onchange="mypage.limit_size(this)">';
							$res .= '<option value="0"';
							if($val['print_option']==0) $res.= ' selected="selected"';
							$res .= '>淡色</option>';
							$res .= '<option value="1"';
							if($val['print_option']==1) $res.= ' selected="selected"';
							$res .= '>濃色</option></select></td>';
						}elseif($val['print_type']=='trans'){
							$res .= '<tr><td colspan="2">オプション&nbsp;<select class="inkoption" onchange="mypage.limit_size(this)">';
							$res .= '<option value="0"';
							if($val['print_option']==0) $res.= ' selected="selected"';
							$res .='>淡色</option>';
							$res .= '<option value="1"';
							if($val['print_option']==1) $res.= ' selected="selected"';
							$res .= '>濃色</option></select></td>';
						}elseif($val['print_type']=='embroidery'){
							$res .= '<tr><td colspan="2">オプション&nbsp;<select class="inkoption" onchange="mypage.limit_size(this)">';
							$res .= '<option value="0"';
							if($val['print_option']==0) $res.= ' selected="selected"';
							$res .= '>オリジナル</option>';
							$res .= '<option value="1"';
							if($val['print_option']==1) $res.= ' selected="selected"';
							$res .= '>ネーム</option></select></td>';
						}else{
							$res .= '<tr><td colspan="2"></td>';
						}
						$res .= '</tr>';
					}

					$res .= '<tr><td colspan="2">デザイン <select class="designplate" onchange="mypage.calcPrintFee()">';
					$design_plate = '<option value="1">A</option><option value="2">B</option><option value="3">C</option><option value="4">D</option>';
					$res .= str_replace('value="'.$val['design_plate'].'"', 'value="'.$val['design_plate'].'" selected="selected"', $design_plate);
					$res .= '</select>';
					
					$res .= '　原稿 <select class="design_type" onchange="mypage.changeDesignType(this)">';
					$design_type = '<option value="">未定</option>';
					$design_type .= '<option value="画像">画像</option>';
					$design_type .= '<option value="手描き">手描き</option>';
					$design_type .= '<option value="文字打">文字打</option>';
					$design_type .= '<option value="イラレ">イラレ</option>';
					$design_type .= '<option value="PSD">ＰＳＤ</option>';
					$design_type .= '<option value="PDF">ＰＤＦ</option>';
					$design_type .= '<option value="その他">その他</option>';
					$design_type .= '</select>';
					if(!empty($val['design_type']) && strpos('未定,画像,手描き,文字打,イラレ,PSD,PDF,その他', $val['design_type'])===false){
						$res .= str_replace('value="その他"', 'value="その他" selected="selected"', $design_type);
						$res .= '</select>';
						$res .= '<input type="text" value="'.$val['design_type'].'" class="design_type_note" />';
					}else{
						$res .= str_replace('value="'.$val['design_type'].'"', 'value="'.$val['design_type'].'" selected="selected"', $design_type);
						$res .= '</select>';
						$res .= '<input type="text" value="" class="design_type_note" />';
					}
					$res .= '</td></tr>';
					$res .= '</tbody></table></div>';

					$res .= '<div class="pp_ink">';
					if($ppID!=99){
						$rec = $orders->db('search', 'orderink', array('orders_id'=>$_POST['orders_id'], 'orderarea_id'=>$val['areaid']));
						$inks= array();
						$inks_count = count($rec);
						for($n=0; $n<$inks_count; $n++){
							if(empty($inks[$rec[$n]['inkid']])){
								$inks[$rec[$n]['inkid']] = array('ink_code'=>$rec[$n]['ink_code'],
																 'ink_name'=>$rec[$n]['ink_name']
																 );
							}
							
							/*
							if(!empty($rec[$n]['exchid'])){
								$inks[$rec[$n]['inkid']]['exch'][] = array( 'exchid'=>$rec[$n]['exchid'],
																			'exch_code'=>$rec[$n]['exchink_code'],
																			'exch_name'=>$rec[$n]['exchink_name'],
																			'exch_volume'=>$rec[$n]['exchink_volume']);
							}
							*/
						}
						
						//$res .= '<div>インクの色<input type="button" value="色替え⇒" class="toggle_exchink" /></div>';
						
						$res .= '<div>色指定</div>';
						$n=0;
						foreach($inks as $inkid=>$v){
							if($_POST['mode']=='repeat'){
								$res .= '<p>';
							}else{
								$res .= '<p id="inkid_'.$inkid.'">';
							}
							$res .= '<input type="text" value="'.$pos[0]['selective_name'].'" alt="'.$pos[0]['selective_key'].'" readonly="readonly" class="pos_name" />&nbsp;';
							if($v['ink_code']=='c00'){
								$inksrc = './img/undefined.gif';
								$attr = '';
							}else{
								if($val['print_type']=='cutting'){
									$inksrc = './img/cuttingcolor/'.$v['ink_code'].'.png';
								}else{
									$inksrc = './img/inkcolor/'.$v['ink_code'].'.png';
								}
								$attr = ' readonly="readonly"';
							}
							$res .= '<img alt="'.$v['ink_code'].'" src="'.$inksrc.'" width="22" height="22" class="palette" />&nbsp;';
							$res .= '<input type="text" value="'.$v['ink_name'].'" size="15"'.$attr.' />';
							$res .= '<img alt="clear" src="./img/cross.png" width="16" height="16" class="cross" /></p>';
							$n++;
						}
						
						if ($val['print_type'] != 'embroidery') {
							$inkListCount = 10;
						} else {
							$inkListCount = 12;
						}
						for($i=0; $i<$inkListCount-$n; $i++){
							$res .= '<p><input type="text" value="'.$pos[0]['selective_name'].'" alt="'.$pos[0]['selective_key'].'" readonly="readonly" class="pos_name" />&nbsp;';
							$res .= '<img alt="" src="./img/circle.png" width="22" height="22" class="palette" />&nbsp;<input type="text" value="" size="15" readonly="readonly" /><img alt="clear" src="./img/cross.png" width="16" height="16" class="cross" /></p>';
						}
						$res .= '</div>';
						
						/*
						$res .= '<div class="exch_ink">';
						
						$gall_width = 1;
						$n=0;
						$gall = '<div>インク色替え</div>';
						foreach($inks as $inkid=>$v){
							$gall .= '<p style="visibility:visible;">';
							if(empty($v['exch'])){
								$gall .= '<span>';
								$gall .= '<input type="number" min="0" value="0" alt="" class="exch_vol" onchange="mypage.calcExchinkFee();" />&nbsp;<img alt="" src="./img/circle.png" width="22" height="22" class="palette" />&nbsp;<input type="text" value="" size="15" readonly="readonly" />';
								$gall .= '<img alt="clear" src="./img/cross.png" width="16" height="16" class="cross" /><img alt="addnew" src="./img/plus.png" width="16" height="16" class="plus" /></span></p>';
							}else{
								for($a=0; $a<count($v['exch']); $a++){
									if($_POST['mode']=='repeat'){
										$gall .= '<span>';
									}else{
										$gall .= '<span id="exchid_'.$v['exch'][$a]['exchid'].'">';
									}
									$gall .= '<input type="number" min="0" value="'.$v['exch'][$a]['exch_volume'].'" alt="" class="exch_vol" onchange="mypage.calcExchinkFee();" />&nbsp;';
									if($v['exch'][$a]['exch_code']=='c00'){
										$inksrc = './img/undefined.gif';
										$attr = '';
									}else{
										$inksrc = './img/inkcolor/'.$v['exch'][$a]['exch_code'].'.png';
										$attr = ' readonly="readonly"';
									}
									$gall .= '<img alt="'.$v['exch'][$a]['exch_code'].'" src="'.$inksrc.'" width="22" height="22" class="palette" />&nbsp;';
									$gall .= '<input type="text" value="'.$v['exch'][$a]['exch_name'].'" size="15" readonly="readonly" /><img alt="clear" src="./img/cross.png" width="16" height="16" class="cross" /><img alt="addnew" src="./img/plus.png" width="16" height="16" class="plus" style="opacity:1;" /></span>';
								}
								$gall .= '</p>';
								$gall_width = max($gall_width, count($v['exch']));
							}
							$n++;
						}
						for($i=0; $i<4-$n; $i++){
							$gall .= '<p><span>';
							$gall .= '<input type="number" min="0" value="0" alt="" class="exch_vol" onchange="mypage.calcExchinkFee();" />&nbsp;<img alt="" src="./img/circle.png" width="22" height="22" class="palette" />&nbsp;<input type="text" value="" size="15" readonly="readonly" />';
							$gall .= '<img alt="clear" src="./img/cross.png" width="16" height="16" class="cross" /><img alt="addnew" src="./img/plus.png" width="16" height="16" class="plus" /></span></p>';
						}
						
						$gall_width *= 274;
						$res .= '<div class="gall" style="width:'.$gall_width.'px;">';
						$res .= $gall;
						$res .= '</div></div>';
						*/
						
					}else{
						$res .= '</div>';
					}

					$res .= '<div class="pp_price">';
					if(!$val['origin']) $res .= '<p><input type="button" value="削除" class="del_print_position" /></p>';
					$res .= '<p><input type="button" value="追加" class="add_print_position" /></p></div>';
					
					$res .= '</div>';
				}
				$res .= '</div>';
				$res .= '|'.$data[0]['subprice'];
			}else{
				$res = "";
			}
			break;
		
		case 'positionimage':
		/*
		*	絵型（プリント位置指定済み）のタグを返す
		*/
			$ppImg = file_get_contents(_DOC_ROOT.$_POST['area_path']);
			if(!empty($_POST['selectivekey'])){
				$pattern = '/alt="'.$_POST['selectivename'].'"(.*?)class="'.$_POST['selectivekey'].'"/s';
				preg_match($pattern, $ppImg, $matches);
				$replacement = preg_replace('/\.png/','_on.png',$matches[0]);
				$ppImg = preg_replace($pattern, $replacement, $ppImg);
			}
			$res = $ppImg;
			break;
			
		case 'files':
			$res = "";
			if(isset($_POST['mydir'],$_POST['data'])){
				foreach($_POST['data'] as $val){
					$data = explode('|', $val);
					$mydir = _DOC_ROOT._TEMP_IMAGE_PATH.$_POST['mydir'];
					$contents = $data[1];
					if(!is_dir($mydir)){
						umask(0);
						$di = true;
						$di=mkdir($mydir, 0705);
					}
					$filepath = $mydir.'/'.$data[0].'.txt';
					if($fh=fopen($filepath,"w")){
						if(flock($fh,LOCK_EX)){
							fwrite($fh,$contents);
							flock($fh,LOCK_UN);
						}else{
							$res = "flock error";
						}
						fclose($fh);
					}else{
						$res = $filename;
					}
				}
			}else{
				$res = 'post error';
			}

			break;
		case 'itemsByToms':
			try{
				$conn = db_connect();

				$order_id = htmlspecialchars($_POST['orders_id'], ENT_QUOTES);

				$sql = "select * from ((((((((orderitem inner join orders on orders.id=orderitem.orders_id)";
				$sql .= " inner join catalog on orderitem.master_id=catalog.id)";
				$sql .= " inner join item on catalog.item_id=item.id)";
				$sql .= " inner join category on catalog.category_id=category.id)";
				$sql .= " inner join size on orderitem.size_id=size.id)";
				$sql .= " inner join itemcolor on catalog.color_id=itemcolor.id)";
				$sql .= " inner join customer on orders.customer_id=customer.id)";
				$sql .= " inner join progressstatus on orders.id=progressstatus.orders_id)";
				$sql .= " left join staff on progressstatus.proc_1=staff.id";
				$sql .= " where item.maker_id=1 and orders.id=".$order_id.";";

				$result = exe_sql($conn, $sql);
				$res = mysqli_num_rows($result);
				$rs = mysqli_fetch_array($result);
				$res .= "|".$rs['staffname'];		// 明細数と発注担当者名を返す

			}catch(Exception $e){
				$res = 0;
			}

			mysqli_close($conn);

			break;
		}
	}
$res = mb_convert_encoding($res, 'euc-jp', 'utf-8');

	session_write_close();
	echo $res;

?>
