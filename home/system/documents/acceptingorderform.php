<?php
/**
 * 受注票　印刷フォーム
 * log
 * 2016-10-07 電話番号及びFAX番号の表記を廃止
 * 2018-01-12 刺繍の絵型表示を修正
 * 2018-07-31 商品テーブル表示を複数ページに対応
 */
if(!isset($_GET['printkey'],$_GET['orderid'])) exit('No such file exists');
$root_path = "../";
require_once dirname(__FILE__).'/'.$root_path.'php_libs/config.php';
require_once dirname(__FILE__).'/'.$root_path.'php_libs/orders.php';
require_once dirname(__FILE__).'/'.$root_path.'php_libs/phonedata.php';

$DB = new Orders();
$orders_id = htmlspecialchars($_GET['orderid'], ENT_QUOTES, 'utf-8', true);
$print_key = htmlspecialchars($_GET['printkey'], ENT_QUOTES, 'utf-8', true);

// 受注書データを取得
$result = $DB->db( 'search','top',array('id'=>$orders_id) );
if(empty($result)) exit('No such top data exists');
$orders = $result[0];

$tableMaxHeight = 310;	// 商品テーブルの表示領域（高さ）
$extHeight = 740;		// 別紙の際の表示高
$thHeight = 19;			// 商品テーブルのヘッダー高
$tfHeight = 22;			// 商品テーブルのフッター高
switch($print_key){
case 'silk':
	$print_name = 'シルク';
	break;
case 'digit':
	$print_name = 'デジタル転写';
	$extheight = 'style=height:630px;';
	$tableMaxHeight = 340;
	break;
case 'trans':
	$print_name = 'カラー転写';
	break;
case 'inkjet':
	$print_name = 'インクジェット';
	break;
case 'cutting':
	$print_name = 'カッティング';
	break;
case 'embroidery':
	$print_name = '刺繍';
	break;
}
$print_name = $orders['noprint']==1? '商品のみ': $print_name;

$factory_hash = array('1'=>'[１]', '2'=>'[２]', '9'=>'[１･２]');
$factory_name = $factory_hash[$orders['factory']];

if(!empty($orders['number'])){
	if($orders['cstprefix']=='g'){
		$customer_num = 'G'.sprintf('%04d', $orders['number']);
	}else{
		$customer_num = 'K'.sprintf('%06d', $orders['number']);
	}
}
$orders_num = sprintf('%09d', $orders_id);
$customer_ruby = empty($orders['customerruby'])? '　': $orders['customerruby'];
$rep = empty($orders['company'])? '　': '担当：　'.$orders['company'];
$staff = $orders['staffname'];
$zipcode = preg_replace('/^(\d{3})(\d{1,4})$/', '$1-$2', $orders['delizipcode']);
$addr = $orders['deliaddr0'].$orders['deliaddr1'];
if(!empty($orders['deliaddr2'])) $addr .= ' '.$orders['deliaddr2'];
/*
 * 2016-10-07 廃止
$tel = PhoneData::phonemask($orders['tel']);
$tel = $tel['c'];
$fax = PhoneData::phonemask($orders['fax']);
$fax = $fax['c'];
 */ 
$arrival = substr(preg_replace('/-/','/',$orders['arrival']),5);
$shipped = explode('-', $orders['schedule3']);
$shipped['year'] = $shipped[0];
$shipped['month'] = intval($shipped[1], 10);
$shipped['day'] = intval($shipped[2], 10);
$deliverydate = substr(preg_replace('/-/','/',$orders['schedule4']),5);
$deliverytime = array('', 'am', '12-14', '14-16', '16-18', '18-20', '19-21');
$completionimage = $orders['completionimage']==1? 'あり': 'なし';

$ln = mb_strwidth($orders['customername'],'utf-8');
if($ln<=20){
	$fontsize='28px';
}else if($ln>20 && $ln<=26){
	$fontsize='20px';
}else{
	$fontsize='16px';
}

// 袋詰
$package = array();
if($orders['package_yes']==1) $package[] = '<span>あり</span>';
if($orders['package_no']==1)  $package[] = 'なし';
if($orders['package_nopack']==1) $package[] = '<span>袋のみ</span>';
$package = implode(',', $package);
if(empty($package)){
	if($orders['package']=='yes'){
		$package = '<span>あり</span>';		// 赤字
	}else if($orders['package']=='nopack'){
		$package = '<span>袋のみ</span>';		// 赤字
	}else{
		$package = 'なし';
	}
}

switch($orders['payment']){
	case 'wiretransfer': $payment = '銀行振込'; break;
	case 'cod': $payment = '代金引換'; break;
	case 'cash': $payment = '現金'; break;
	case 'credit': $payment = '〆日払い'; break;
	default: $payment = '打合せの上';
}
switch($orders['carriage']){
	case 'normal': $shipment = '宅急便'; break;
	case 'accept': $shipment = '工場渡し'; break;
	case 'telephonic': $shipment = 'できtel'; break;
	case 'other': $shipment = 'その他'; break;
	default: $shipment = '未定';
}

// 混合プリントの判断
$mixtureprint = $_GET['mixture'];
if(empty($mixtureprint)){
	$mixturestyle = 'style="display:none;"';
}else{
	$mixturestyle = '';
}


// ドライタグの判別用
$dry = $DB->db( 'search','itemtag',array('tagid'=>2) );


// 注文商品とプリント位置データを取得
$products = $DB->db( 'search','product',array('order_type'=>$orders['ordertype'],'orders_id'=>$orders_id,'print_type'=>$print_key) );
if(empty($products)) exit('No such products data exists');
$items = array();		// 商品情報
$printpos = array();	// プリント位置ごとの情報

//$position_hash = array('front'=>'正面', 'back'=>'背中', 'side'=>'側面', 'side_p2'=>'側面', 'side_p4'=>'側面', 'free'=>'フリー', 'fixed'=>'転写シート');

$isAllRepeat = true;	// 新版が1つでもあれば false
$isBring = false;		// 持込商品が1つでもあれば true
$makers = array();		// メーカー名の重複チェック
$maker = array();		// メーカー名の配列
$categories = array();	// カテゴリーの重複チェック
$category = array();	// カテゴリー名の配列
$count = count($products);
for($i=0; $i<$count; $i++){
	
	// 一般と業者のフィールド名の違いを調整
	if($orders['ordertype']=='general'){
		//$products[$i]['src'] = $root_path.'img/items/'.$products[$i]['category_key'].'/'.$products[$i]['item_code'].'/'.$products[$i]['stock_number'].'.jpg';
		if($products[$i]['category_id']==0 || $products[$i]['category_id']==100){
			$tmp = explode('_', $products[$i]['stock_number']);
			$products[$i]['item_code'] = $tmp[0];
			$products[$i]['maker_name'] = $products[$i]['maker'];
			$products[$i]['color_name'] = $products[$i]['item_color'];
			//if($tmp[0]=="" || $tmp[1]=='000') $products[$i]['src'] = $root_path.'img/blank.gif';
			//else $products[$i]['src'] = $root_path.'img/items/'.$products[$i]['category_key'].'/'.$products[$i]['item_code'].'/'.$products[$i]['stock_number'].'.jpg';
		}
		$products[$i]['stock_number'] = $products[$i]['item_code'].'_'.$products[$i]['color_code'];
		
		// 一般で1つでも新版があればfalse、全てリピ版の場合はtrue
		if(empty($products[$i]['repeat_check'])) $isAllRepeat = false;
	
	}else{ // industry
		$tmp = explode('_', $products[$i]['stock_number']);
		$products[$i]['item_code'] = $tmp[0];
		$products[$i]['maker_name'] = $products[$i]['maker'];
		$products[$i]['color_name'] = $products[$i]['item_color'];
		if($tmp[0]=="" || $tmp[1]=='000') $products[$i]['src'] = $root_path.'img/blank.gif';
		else $products[$i]['src'] = $root_path.'img/items/'.$products[$i]['category_key'].'/'.$products[$i]['item_code'].'/'.$products[$i]['stock_number'].'.jpg';
	}
	
	$products[$i]['tmpname'] = empty($products[$i]['item_code'])? $products[$i]['item_name']: $products[$i]['item_code'];

	// プリント位置ごとのデータを集計
	$posid = $products[$i]['category_id'].$products[$i]['area_name'].$products[$i]['printposition_id'].$products[$i]['selective_name'];
	if(empty($printpos[$posid])){
		$printpos[$posid] = array( 'ink_name'=>array(),
								   'ink_count'=>$products[$i]['ink_count'],
								   'platesnumber'=>$products[$i]['platesnumber'],
								   'design_type'=>$products[$i]['design_type'],
								   'design_size'=>$products[$i]['design_size'],
								   'vert'=>$products[$i]['areasize_from'],
								   'hori'=>$products[$i]['areasize_to'],
								   'area_path'=>$products[$i]['area_path'],
								   'area_name'=>$products[$i]['area_name'],
								   'category_id'=>$products[$i]['category_id'],
								   'selective_key'=>$products[$i]['selective_key'],
								   'selective_name'=>$products[$i]['selective_name'],
								   'item_name'=>$products[$i]['tmpname'],
								   'printposition_id'=>$products[$i]['printposition_id']
								   );
	}
	if(!empty($products[$i]['ink_name']) && $products[$i]['ink_name']!='undefined'){
		$printpos[$posid]['ink_name'][$products[$i]['inkid']]['code'] = $products[$i]['ink_code'];
		$printpos[$posid]['ink_name'][$products[$i]['inkid']]['name'] = $products[$i]['ink_name'];
	}else if($print_key=="inkjet"){
		$printpos[$posid]['ink_name'][0] = $products[$i]['print_option']==0? '淡色': '濃色';
	}
	
	/*
	if(!empty($products[$i]['exchid']) && $products[$i]['exchid']!='undefined'){
		$printpos[$posid]['exchink'][$products[$i]['inkid']][$products[$i]['exchid']] = array('code'=>$products[$i]['exchink_code'],
																	  						  'name'=>$products[$i]['exchink_name'],
																							  'vol'=>$products[$i]['exchink_volume']
																							  );
	}
	*/
	

	// アイテム（カラーごと）のサイズごとの枚数を集計
	$key = $products[$i]['item_name'].'_'.$products[$i]['category_id'];
	if(empty($items[$key])){
		$items[$key] = $products[$i];
		$items[$key]['color'] = array();
	}
	$items[$key]['color'][$products[$i]['color_name']][$products[$i]['size_name']] = array($products[$i]['amount'], $products[$i]['item_note']);
	

	// メーカー名の集計
	if(empty($makers[$products[$i]['maker_name']])){
		$makers[$products[$i]['maker_name']] = true;
		$maker[] = $products[$i]['maker_name'];
	}
	
	
	// カテゴリー名の集計
	switch($products[$i]['category_id']){
		case 0:
			$category_name = "その他";
			break;
		case 99:
			$category_name = "転写シート";
			break;
		case 100:
			$category_name = "持込";
			$isBring = true;
			break;
		default:
			$category_name = $products[$i]['category_name'];
			if($dry[$products[$i]['item_id']]) $category_name .= '[DRY]';
			
			/*
			*	2013-10-23 アウターの一部商品にDRY表示（タグは登録せず）
			*	325		046-UB　ユーティリティブルゾン
			*	73		068-RSV　リフレクスポーツベスト
			*	254		057-SSJ　スタジアムジャンパー
			*	65		061-RSJ　リフレクスポーツジャケット
			*	253		850-DZ　ドリズラー
			*	158		049-FC　フードインコート
			*	328		048-AJ　アクティブジャケット
			*	326		260-ETB　エコツイルブルゾン
			*	329		001-NFC　アクティブグランドコート
			*	159		230-ABC　アクティブベンチコート
			*	275		P-6880　セミロングボアコート
			*/
			if(
				$products[$i]['item_id']==325 || 
				$products[$i]['item_id']==73 || 
				$products[$i]['item_id']==254 || 
				$products[$i]['item_id']==65 || 
				$products[$i]['item_id']==253 || 
				$products[$i]['item_id']==158 || 
				$products[$i]['item_id']==328 || 
				$products[$i]['item_id']==326 || 
				$products[$i]['item_id']==329 || 
				$products[$i]['item_id']==159 || 
				$products[$i]['item_id']==275 
			){
				$category_name .= '[DRY]';
			}
	}
	
	if(empty($categories[$category_name])){
		$categories[$category_name] = true;
		$category[] = $category_name;
	}

}

// リピ、特急の赤字表記
$expresscheck = '';
$repeatcheck = '';
if($orders['ordertype']=='industry'){
	if($orders['expresscheck']==0){
		$expresscheck = 'style="display:none;"';
	}
	if($orders['repeatcheck']==0 && $orders['repeater']==0){
		$repeatcheck = 'style="display:none;"';
	}
	$fontcolor = 'style="color:#fff;"';
	$borderright = "border-right:1px solid #fff;";
	$bg = '<img src="img/bgCustomerwrap.jpg" class="bg" style="position:absolute;top0:0;left:0">';
}else{
	if($orders['expressfee']==0){
		$expresscheck = 'style="display:none;"';
	}
	if(!$isAllRepeat){
	//if( $orders['repeatdesign']==0 ){
		$repeatcheck = 'style="display:none;"';
	}
	$fontcolor = '';
	$borderright = '';
	$bg = '';
}


// 商品テーブル
$item_assort = implode('・', $category);
$itemlist_overflow = false;	// 商品テーブルが表示領域に収まっているかどうかのフラグ
$items_list = '';			// 商品リスト
$cur_item = '';
$totVolume = 0;
$sizeVolume = array();	// サイズごとの枚数計
$tableHeight = 0;		// 商品テーブルの高さ
// $itemnameFont = 11*1.2;	// 商品名のフォントサイズ11px
$colornameFont = 14*1.2;// カラー名のフォントサイズ14px
$cellHeight = 22;
$rows = 0;

foreach($items as $key=>$val){
	$size_rows = 0;
	$tmpColor = array();
	$tmpHeight = 0;
	foreach($val['color'] as $colorname=>$colors){
		$tmpSize = array();
		$curColor_rows = 0;
		$tmp = '';
		foreach($colors as $sizename=>$arg){
			$tmp = '<td class="td05">'.$sizename.'</td>';
			$tmp .= '<td class="td06">'.$arg[0].'</td>';
			$tmp .= '<td>'.$arg[1].'</td>';
			$tmpSize[] = $tmp;
			$totVolume += $arg[0];
			$sizeVolume[$sizename] += $arg[0];
			$size_rows++;
			$curColor_rows++;
			$rows++;
		}
		
		// 別紙で且つ1ページを超える場合に分割
		if($rows>32){
			$rows = $curColor_rows;
			$size_rows -= $curColor_rows;
			
			$items_list .= '<tr>';
			
			if($size_rows>1){
				$items_list .= '<td class="td01" rowspan="'.$size_rows.'">'.$val['item_name'].'</td>';
				$items_list .= '<td rowspan="'.$size_rows.'">'.$val['maker_name'].'</td>';
				$items_list .= '<td rowspan="'.$size_rows.'">'.$val['item_code'].'</td>';
			}else{
				$items_list .= '<td class="td01">'.$val['item_name'].'</td>';
				$items_list .= '<td>'.$val['maker_name'].'</td>';
				$items_list .= '<td>'.$val['item_code'].'</td>';
				
				$W = ceil(mb_strwidth($val['item_name'], 'utf-8') / 24);
				if($W>1 && $tmpHeight==$cellHeight){
					$tableHeight += 8;	// 商品名が2行で且つサイズが1種類でカラー名が1行の場合
				}
			}
			
			$items_list .= $tmpColor[0];
			for($i=1; $i<$size_rows; $i++){
				$items_list .= $tmpColor[$i];
			}
			
			$tmpColor = array();
			$size_rows = $curColor_rows;
			
			$items_list_ext[] = $items_list;
			$items_list = '';
		}
		
		
		$l = count($tmpSize);
		$W = ceil(mb_strwidth($colorname, 'utf-8') / 24);
		if($l>1){
			if(count($tmpColor)>1){
				$tmpColor[] = '<tr><td class="td04" rowspan="'.$l.'">'.$colorname.'</td>'.$tmpSize[0].'</tr>';
			}else{
				$tmpColor[] = '<td class="td04" rowspan="'.$l.'">'.$colorname.'</td>'.$tmpSize[0].'</tr>';
			}
			for($i=1; $i<$l; $i++){
				$tmpColor[] = '<tr>'.$tmpSize[$i].'</tr>';
			}
			
			$tmpHeight += max($cellHeight*$l, floor($colornameFont*$W+4));
		}else{
			if(count($tmpColor)>1){
				$tmpColor[] = '<tr><td class="td04">'.$colorname.'</td>'.$tmpSize[0].'</tr>';
			}else{
				$tmpColor[] = '<td class="td04">'.$colorname.'</td>'.$tmpSize[0].'</tr>';
			}
			
			$tmpHeight += max($cellHeight, floor($colornameFont*$W+4));
		}
		
	}
	
	
	$items_list .= '<tr>';
	
	if($cur_item!=$val['item_name'].'_'.$val['category_id']){
		if($size_rows>1){
			$items_list .= '<td class="td01" rowspan="'.$size_rows.'">'.$val['item_name'].'</td>';
			$items_list .= '<td rowspan="'.$size_rows.'">'.$val['maker_name'].'</td>';
			$items_list .= '<td rowspan="'.$size_rows.'">'.$val['item_code'].'</td>';
		}else{
			$items_list .= '<td class="td01">'.$val['item_name'].'</td>';
			$items_list .= '<td>'.$val['maker_name'].'</td>';
			$items_list .= '<td>'.$val['item_code'].'</td>';
			
			$W = ceil(mb_strwidth($val['item_name'], 'utf-8') / 24);
			if($W>1 && $tmpHeight==$cellHeight){
				$tableHeight += 8;	// 商品名が2行で且つサイズが1種類でカラー名が1行の場合
			}
		}
		$cur_item = $val['item_name'].'_'.$val['category_id'];
	}
	
	$items_list = $items_list.$tmpColor[0];
	for($i=1; $i<$size_rows; $i++){
		$items_list .= $tmpColor[$i];
	}
	
	$tableHeight += $tmpHeight;
	
}

// サイズごのと枚数計
$size_volume = '';
foreach($sizeVolume as $sizename=>$vol){
	$size_volume .= $sizename.'×'.$vol.'　';
}

if($tableHeight+$thHeight+$tfHeight>$tableMaxHeight){
	$items_list_ext[] = $items_list;
	$items_list = '<tr><td colspan="7" style="padding: 15px 5px;">別紙参照</td></tr>';
	$itemlist_overflow = true;
}


// 受注票データを取得
$result = $DB->db( 'search','printinfo',array('orders_id'=>$orders_id,'print_key'=>$print_key) );
if(empty($result)) exit('No such printing data exists');
$printinfo = $result[0];

$arrange = ($isBring || $printinfo['arrange']==2)? '持込あり': '注文';
// $plates = $printinfo['plates'];
$envelope = $printinfo['envelope']==1? 'あり': 'なし';
$boxnumber = $printinfo['boxnumber'];
$ship_note = $printinfo['ship_note'];
$workshop_note = $printinfo['workshop_note'];

// 同梱の受注Noを取得
$rec = $DB->db( 'search','bundlecount', array('orders_id'=>$orders_id) );
if(count($rec)>0){
	$ids = array();
	for($i=0; $i<count($rec); $i++){
		if($rec[$i]['id']==$orders_id) continue;
		$ids[] = $rec[$i]['id'];
	}
	$ship_note = '同梱：'.implode(',',$ids)."\n".$printinfo['ship_note'];
}

// プリント位置ごとのデータを集計
$pinfo = array();
// $adj = array();
$count = count($result);
for($i=0; $i<$count; $i++){
	$tab = $result[$i]['print_category_id'].$result[$i]['area_key'].$result[$i]['print_posid'].$result[$i]['print_posname'];
	$pinfo[$tab] = $result[$i];
	//　$adj[$result[$i]['pinfoid']][] = array('sizename'=>$result[$i]['sizename'],'vert'=>$result[$i]['vert'],'hori'=>$result[$i]['hori']);
}
ksort($pinfo);

// アップロード済みのデザイン画像のパス
//$design_dir = $root_path._TEMP_IMAGE_PATH.preg_replace('/-/','',$orders['created']).sprintf('%09d', $orders_id).'/';


// プリント位置情報のテーブルを生成
$pp_overflow = false;	// 商品テーブルが表示領域に収まっているかどうかのフラグ
$posCount = 0;			// 絵型の数
$print_hash = array();	// 絵型ごとのタグを格納
$reprint = array('リピ','新','再');
$areaname = array(
	'front'=>'前',
	'back'=>'後',
	'side'=>'横',
	'side_p2'=>'横',
	'side_p4'=>'横',
	'fixed'=>''
);
if($orders['noprint']==0){
	$args = array();
	foreach($pinfo as $tab=>$val){
		$val['tab'] = $tab;
		$val['selective_key'] = $printpos[$tab]['selective_key'];
		$val['printposition_id'] = $printpos[$tab]['printposition_id'];
		$val['ink_count'] = $printpos[$tab]['ink_count'];
		$val['design_type'] = $printpos[$tab]['design_type'];
		$val['design_size'] = $printpos[$tab]['design_size'];
		$val['area_path'] = $printpos[$tab]['area_path'];
		$val['areaname'] = $areaname[$printpos[$tab]['area_name']];
		$args[$tab] = $val;
	}
	// $pinfo = $tmp;
	$pinfo = $DB->sortSelectivekey($args);
	// usort($pinfo, array($DB, 'sortSelectivekey'));
	
	//for($i=0; $i<count($pinfo); $i++){
	foreach($pinfo as $tab=>$val){
	
		$tmp = '<td class="pp_wrap">';
		$tmp .= '<table>';
		$tmp .= '<tbody>';
		if($val['print_posname']=='右胸' || $val['print_posname']=='右そで'){
			$tmp .= '<tr><th>'.$val['areaname'].'</th><th colspan="3" style="color:#f00;">'.$val['print_posname'].'</th></tr>';
		}else{
			$tmp .= '<tr><th>'.$val['areaname'].'</th><th colspan="3">'.$val['print_posname'].'</th></tr>';
		}
		
		if($print_key=='silk'){
			$tmp .= '<tr>';
			$tmp .= '<td colspan="3" class="ink_wrap">';
			if(!empty($printpos[$tab]['ink_name'])){
				foreach($printpos[$tab]['ink_name'] as $ink){
					$tmp .= '<p class="ink">';
					$tmp .= '<img alt="" src="../img/inkcolor/'.$ink['code'].'.png" width="15" height="15" />';
					$tmp .= '<span>'.$ink['code'].' '.$ink['name'].'</span>';
					$tab .= '</p>';
				}
			}
			$tmp .= '</td>';
			$tmp .= '<td class="ac">';
			$tmp .= '<p>色数　<span class="ink_count">'.$val['ink_count'].'</span></p>';
			$tmp .= '<p>版数　<span class="ink_count">'.$val['platesnumber'].'</span></p>';
			$tmp .= '</td>';
			$tmp .= '</tr>';
			$tmp .= '<tr class="attr">';
			$tmp .= '<td>'.$reprint[$val['reprint']].'</td>';
			$tmp .= '<td>'.$val['platesinfo'].'</td>';
			$tmp .= '<td>'.$val['meshinfo'].'</td>';
			$tmp .= '<td>'.$val['attrink'].'</td>';
			$tmp .= '</tr>';
		}else if($print_key=='cutting'){
			$tmp .= '<tr class="cutting_wrap">';
			$tmp .= '<td>';
			$tmp .= '<span class="lbl">シート色</span>';
			$tmp .= '</td>';
			$tmp .= '<td colspan="3">';
			if(!empty($printpos[$tab]['ink_name'])){
				foreach($printpos[$tab]['ink_name'] as $ink){
					$tmp .= '<p class="cutting_color">'.$ink['code'].' '.$ink['name'].'</p>';
				}
			}
			$tmp .= '</td>';
			$tmp .= '</tr>';
		}else if($print_key=='inkjet'){
			$tmp .= '<tr class="cutting_wrap">';
			$tmp .= '<td>';
			$tmp .= '<span class="lbl">カラー</span>';
			$tmp .= '</td>';
			$tmp .= '<td colspan="3">';
			if(!empty($printpos[$tab]['ink_name'])){
				$tmp .= '<p class="cutting_color">'.$printpos[$tab]['ink_name'][0].'</p>';
			}
			$tmp .= '</td>';
			$tmp .= '</tr>';
		}
		$tmp .= '<tr class="ms">';
		$tmp .= '<td colspan="3">';
		$tmp .= '<span class="lbl">原稿</span>';
		$tmp .= '<span class="design_type">'.$val['design_type'].'</span>';
		$tmp .= '</td>';
		$tmp .= '<td class="design_size">'.$val['design_size'].'</td>';
		$tmp .= '</tr>';
		$tmp .= '</tbody>';
		$tmp .= '</table>';
		$tmp .= '			<div class="printposition">';
		
		$designimage = '';
		$fp = fopen('../'.$val['area_path'], 'r');
		if($fp){
			flock($fp, LOCK_SH);
			$img = fgets($fp);
			$img = str_replace('src="./', 'src="../', $img);
			preg_match('/src=\"(.[^\"]*)\"/', $img, $src);
			while(!feof($fp)){
				$buffer = fgets($fp);
				if(strpos($buffer, '"'.$val['selective_key'].'"')!==false){
					$buffer = str_replace('src="./', 'src="../', $buffer);
					if($printpos[$tab]['category_id']!=99){
						$designimage .= str_replace('.png', '_on.png', $buffer);
					}else{
						$designimage .= $buffer;
					}
				}
			}
			flock($fp, LOCK_UN);
		}
		fclose($fp);
		$tmp .= '				<img alt="プリント位置" src="'.$src[1].'" />';
		$tmp .= $designimage;
		$tmp .= '			</div>';
		$tmp .= '			<div class="remark_wrap">';
		$tmp .= '				<div class="lbl">備考</div>';
		$tmp .= '				<textarea class="remark">'.$val['remark'].'</textarea>';
		$tmp .= '			</div>';
		$tmp .= '			<p class="pos"><span class="lbl">位置</span></p>';
		$tmp .= '		</td>';
		
		if ($print_key=='embroidery') {
			$print_hash[] = $tmp;
			$print_info .= $tmp;
			
			$tmp = '<td class="pp_wrap">';
			$tmp .= '<h3 class="lbl">刺繍糸の色</h3>';
			if(!empty($printpos[$tab]['ink_name'])){
				foreach($printpos[$tab]['ink_name'] as $ink){
					$tmp .= '<p class="thread">';
					$tmp .= '<img alt="" src="../img/inkcolor/'.$ink['code'].'.png" width="15" height="15" />';
					$tmp .= '<span>'.$ink['code'].' '.$ink['name'].'</span>';
					$tab .= '</p>';
				}
			}
			$tmp .= '</td>';
			$posCount += 2;
			$print_hash[] = $tmp;
			$print_info .= $tmp;
			
			$tmp = '<td class="pp_wrap"></td>';
		}
		
		$posCount++;
		$print_hash[] = $tmp;
		$print_info .= $tmp;
	}

	$rest = 3-$posCount%3;
	if($rest>0){
		for($i=0; $i<$rest; $i++){
			$print_info .= '<td class="pp_wrap"></td>';
			$print_hash[] = '<td class="pp_wrap"></td>';
		}
	}
	if($pp_overflow===true || $posCount>3){
		$pp_overflow=true;
		$print_info = '<div style="padding:20px 5px;">■プリント位置：　別紙参照</div>';
	}
}else{
	$visible = 'style="visibility:hidden;"';
}

/*
if($orders['rakuhan']!=0){
	$alert_rakuhan = '<img alt="落版済み" src="'.$root_path.'img/i_alert.png" width="20" />&nbsp;落版済み';
}
*/

// デジタル転写の場合のみ表示
if($print_key=='digit'){
	$edge = array('','白縁','スーパー','濃色透明','淡色透明','隠ぺい','シルク転写');
	$paste = array('','ナイロン','綿');

	$digit_table = '<table id="digit_table">';
	$digit_table .= '			<thead>';
	$digit_table .= '				<tr>';
	$digit_table .= '					<td>';
	$digit_table .= '						<span class="lbl">版</span>';
	$digit_table .= '						<span id="platescheck">'.$reprint[$printinfo['platescheck']].'</span> ／ ';
	$digit_table .= '						<span id="platescount">'.$printinfo['platescount'].'</span>';
	$digit_table .= '					</td>';
	$digit_table .= '					<td>';
	$digit_table .= '						<span class="lbl">糊</span>';
	$digit_table .= '						<span id="pastesheet">'.$paste[$printinfo['pastesheet']].'</span>';
	$digit_table .= '					</td>';
	$digit_table .= '				</tr>';
	$digit_table .= '				<tr>';
	$digit_table .= '					<td colspan="2">';
	$digit_table .= '						<span class="lbl">転写ふち</span>';
	$digit_table .= '						<span id="edge">'.$edge[$printinfo['edge']].'</span>';
	$digit_table .= '					</td>';
	$digit_table .= '				</tr>';
	$digit_table .= '			</thead>';
	$digit_table .= '			<tbody>';
	
	$cutpattern = $DB->db( 'search','cutpattern',array('product_id'=>$printinfo['product_id']) );
	for($i=0; $i<count($cutpattern); $i++){
		$digit_table .= '<tr>';
		$digit_table .= '<td>'.$cutpattern[$i]['shotname'].'</td>';
		$digit_table .= '<td><ins>'.$cutpattern[$i]['shot'].'</ins>面 × <ins>'.$cutpattern[$i]['sheets'].'</ins>シート</td>';
		$digit_table .= '</tr>';
	}
	
	$digit_table .= '			</tbody>';
	$digit_table .= '		</table>';
}else{
	$digit_table = '';
}

?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<link rel="stylesheet" type="text/css" media="all" href="../css/printposition.css" />
	<link rel="stylesheet" type="text/css" media="all" href="./css/documents.css" />
	
	<script type="text/javascript" src="../js/jquery.js"></script>
<script>
/***************************************************
*		全ての画像の読込みを完了してから処理を実行させる
*/
$.fn.imagesLoaded = function(callback){
	var elems = this.filter('img'),
    	len = elems.length,
    	blank = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      
	elems.bind('load.imgloaded',function(){
		if(--len <= 0 && this.src !== blank){
			elems.unbind('load.imgloaded');
			callback.call(elems,this);
		}
	}).each(function(){
     	// cached images don't fire load sometimes, so we reset src.
		if (this.complete || this.complete === undefined){
			var src = this.src;
        	// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
        	// data uri bypasses webkit log warning (thx doug jones)
			this.src = blank;
			this.src = src;
		}
	});

	return this;
};

$( function(){
	
	$('.printposition img').imagesLoaded( function(){
		$('.printposition img').each( function(){
			var w = $(this).width()*1.2;
			var h = $(this).height()*1.2;
			var offset = $(this).position();
			var adj = 6;
			$(this).attr({'width':w, 'height':h});
			if(offset.left>0){
				offset.left *= 1.2;
				offset.top *= 1.2;
				$(this).css({'top':(offset.top-adj)+'px','left':(offset.left-adj)+'px'});
			}
		});
	});
});
</script>
</head>

<?php 
$html = <<<DOC

<body>
<div class="page">
	<div class="wrap" {$extheight}>
		<div class="orderid_wrap">注文 ID. <span id="orderid">{$orders_num}</span></div>
		<table class="inspection">
			<thead>
				<tr><td>担当</td><td>商色</td><td>プ色</td><td>プ位置</td><td>枚数</td></tr>
			</thead>
			<tbody>
				<tr><td></td><td></td><td></td><td></td><td></td></tr>
			</tbody>
		</table>
		<p class="print_title">{$factory_name} {$print_name}　受注票</p>
		
		<div class="col1">
			<div id="heading" class="clearfix">
				<div id="date_wrap">
					<p id="shippingyear"><span>{$shipped['year']}</span>年</p>
					<p id="shippingdate"><span>{$shipped['month']}/{$shipped['day']}</span>発</p>
					<p id="carriage">{$shipment}</p>
					<p><span id="deliverydate">{$deliverydate}</span><span id="deliverytime">{$deliverytime[$orders['deliverytime']]}</span>着</p>
				</div>
				
				<div id="customer_wrap" {$fontcolor}>
					$bg
					<table style="position:absolute;top:0;right:0;z-index:5;">
						<tbody>
							<tr>
								<th rowspan="2" style="height:106px; {$borderright}">
									<p>顧客ID</p>
									<p id="customer_id">{$customer_num}</p>
								</th>
								<td colspan="2">
									<p id="customerruby">{$customer_ruby}</p>
									<p class="customername_wrap">
										<span id="customername" style="font-size:{$fontsize};">{$orders['customername']}</span>
										<span class="honorific">様</span>
									</p>
									<p class="rep_wrap">{$rep}</p>
								</td>
							</tr>
DOC
;
							/*
							 * 2016-10-07 廃止
							<tr class="contact">
								<td>tel ： <span>{$tel}</span></td>
								<td>fax ： <span>{$fax}</span></td>
							</tr>
							 * 
							 */
$html .= <<<DOC
						</tbody>
					</table>
				</div>
			</div>
			
			<table id="maintitle_wrap">
				<tbody>
					<tr>
						<td class="lbl">題<br>名</td>
						<td>
							<div id="maintitle">
								<p class="title_text">{$orders['maintitle']}<p>
								<p class="mark">
									<span id="express_mark" {$expresscheck}>特</span>
									<span id="repeat_mark" {$repeatcheck}>リピ</span>
									<span id="mixture_mark" {$mixturestyle}>{$mixtureprint}</span>
								</p>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			
			<table id="summary">
				<tbody>
					<tr>
						<th rowspan="2" class="lbl">種<br>類</th>
						<th rowspan="2"><div class="category_name">{$item_assort}</div></th>
						<td><p>商品手配</p></td>
						<td><p>入荷予定日</p></td>
						<td><p>合計</p></td>
					</tr>
					<tr class="summary_data">
						<td>{$arrange}</td>
						<td>{$arrival}</td>
						<td id="total_amount">{$totVolume}</td>
					</tr>
				</tbody>
			</table>
			
			<table class="item_wrap">
				<thead><th>商品名</th><th>仕入先</th><th>品番</th><th>商品の色</th><th>サイズ</th><th>枚数</th><th>備考</th></thead>
				<tfoot><td colspan="5">{$size_volume}</td><td>{$totVolume}</td><td></td></tfoot>
				<tbody>
					$items_list
				</tbody>
			</table>
		</div>
		
		<div class="col2">
			<p class="pic">担当 ： <span id="staff">{$staff}</span></p>
			
			<table id="check_table1">
				<thead>
					<tr {$visible}><td>版下</td><td></td><td></td><td></td><td></td><td></td></tr>
					<tr><td {$visible}>／</td><td {$visible}>／</td><td {$visible}>／</td><td>／</td><td>出荷</td><td>納品書</td></tr>
				</thead>
				<tbody>
					<tr><td><div {$visible}></div></td><td><div {$visible}></div></td><td><div {$visible}></div></td><td><div></div></td><td><div></div></td><td><div></div></td></tr>
				</tbody>
			</table>
			<table id="check_table2" {$visible}>
				<tfoot>
					<tr>
						<td colspan="4"><span>[ 注意 ]</span></td>
					</tr>
				</tbody>
				<tbody>
					<tr>
						<td>
							<span>イメ画</span>
							<p>{$completionimage}</p>
						</td>
						<td rowspan="2"><span>納期</span></td>
						<td rowspan="2"><span>返事</span></td>
						<td rowspan="2"><span>方法</span></td>
					</tr>
					<tr>
						<td><div>修理<br>済</div></td>
					</tr>
				</tbody>
			</table>
			
			<table id="payment_table">
				<caption>出荷／支払方法</caption>
				<tfoot>
					<tr>
						<td colspan="2">
							<span>[ 送付先 ]</span>〒{$zipcode}<br>
							<div>{$addr}</div>
						</td>
					</tr>
					<tr>
						<td colspan="2">
							<span>[ 備考 ]</span>
							<div>
								<textarea id="ship_note">{$ship_note}</textarea>
							</div>
						</td>
					</tr>
				</tfoot>
				<tbody>
					<tr>
						<td rowspan="2">
							<span class="lbl">袋詰め</span>
							<p id="package">{$package}</p>
						</td>
						<td>
							<span class="lbl">封筒</span>
							<span id="envelope">{$envelope}</span>
						</td>
					</tr>
					<tr>
						<td>
							<span id="payment">{$payment}</span>　／　
							<span id="boxnumber">{$boxnumber}</span> 箱
						</td>
					</tr>
				</tbody>
			</table>
			
			$digit_table
			
			<div id="remarks">
				<div>[ 備考 ]</div>
				<textarea id="workshop_note">{$workshop_note}</textarea>
			</div>
		</div>
	</div>
	
	<table id="printinfo">
		<tbody>
			<tr>
				$print_info
			</tr>
		</tbody>
	</table>
</div>

DOC;

if($itemlist_overflow){
	$itemslist_count = count($items_list_ext);
	for($i=0; $i<$itemslist_count; $i++){
		if($i==$itemslist_count-1){
			$itemslist_footer = '<tfoot><td colspan="5">'.$size_volume.'</td><td>'.$totVolume.'</td><td></td></tfoot>';
		}
	
		$html .= <<<DOC

<div class="page">
	<div class="wrap" style="height:auto;">
		<div class="orderid_wrap">注文 ID. <span id="orderid">{$orders_num}</span></div>
		<table class="inspection">
			<thead>
				<tr><td>担当</td><td>商色</td><td>プ色</td><td>プ位置</td><td>枚数</td></tr>
			</thead>
			<tbody>
				<tr><td></td><td></td><td></td><td></td><td></td></tr>
			</tbody>
		</table>
		<p class="print_title">{$factory_name} {$print_name}　受注票</p>
		
		<div class="col1">
			<div id="heading" class="clearfix">
				<div id="date_wrap">
					<p id="shippingyear"><span>{$shipped['year']}</span>年</p>
					<p id="shippingdate"><span>{$shipped['month']}/{$shipped['day']}</span>発</p>
					<p id="carriage">{$shipment}</p>
					<p><span id="deliverydate">{$deliverydate}</span><span id="deliverytime">{$deliverytime[$orders['deliverytime']]}</span>着</p>
				</div>
				
				<div id="customer_wrap" {$fontcolor}>
					$bg
					<table>
						<tbody>
							<tr>
								<th rowspan="2" style="height:106px; {$borderright}">
									<p>顧客ID</p>
									<p id="customer_id">{$customer_num}</p>
								</th>
								<td colspan="2">
									<p id="customerruby">{$customer_ruby}</p>
									<p class="customername_wrap">
										<span id="customername" style="font-size:{$fontsize};">{$orders['customername']}</span>
										<span class="honorific">様</span>
									</p>
									<p class="rep_wrap">{$rep}</p>
								</td>
							</tr>
DOC
;
							/*
							 * 2016-10-07 廃止
							<tr class="contact">
								<td>tel ： <span>{$tel}</span></td>
								<td>fax ： <span>{$fax}</span></td>
							</tr>
							 * 
							 */
$html .= <<<DOC
						</tbody>
					</table>
				</div>
			</div>
			
			<table class="item_wrap">
				<thead><th>商品名</th><th>仕入先</th><th>品番</th><th>商品の色</th><th>サイズ</th><th>枚数</th><th>備考</th></thead>
				$itemslist_footer
				<tbody>
					$items_list_ext[$i]
				</tbody>
			</table>
		</div>
		
	</div>
</div>

DOC;
	}
}


if($pp_overflow){

	for($i=0; $i<count($print_hash); $i++){
		if(!$i%3){
		
$html .= <<<DOC

<div class="page">
	<div class="wrap" style="height:auto;">
		<div class="orderid_wrap">注文 ID. <span id="orderid">{$orders_num}</span></div>
		<table class="inspection">
			<thead>
				<tr><td>担当</td><td>商色</td><td>プ色</td><td>プ位置</td><td>枚数</td></tr>
			</thead>
			<tbody>
				<tr><td></td><td></td><td></td><td></td><td></td></tr>
			</tbody>
		</table>
		<p class="print_title">{$factory_name} {$print_name}　受注票</p>
		
		<div class="col1">
			<div id="heading" class="clearfix">
				<div id="date_wrap">
					<p id="shippingyear"><span>{$shipped['year']}</span>年</p>
					<p id="shippingdate"><span>{$shipped['month']}/{$shipped['day']}</span>発</p>
					<p id="carriage">{$shipment}</p>
					<p><span id="deliverydate">{$deliverydate}</span><span id="deliverytime">{$deliverytime[$orders['deliverytime']]}</span>着</p>
				</div>
				
				<div id="customer_wrap" {$fontcolor}>
					$bg
					<table>
						<tbody>
							<tr>
								<th rowspan="2" style="height:106px; {$borderright}">
									<p>顧客ID</p>
									<p id="customer_id">{$customer_num}</p>
								</th>
								<td colspan="2">
									<p id="customerruby">{$customer_ruby}</p>
									<p class="customername_wrap">
										<span id="customername" style="font-size:{$fontsize};">{$orders['customername']}</span>
										<span class="honorific">様</span>
									</p>
									<p class="rep_wrap">{$rep}</p>
								</td>
							</tr>
DOC
;
							/*
							 * 2016-10-07 廃止
							<tr class="contact">
								<td>tel ： <span>{$tel}</span></td>
								<td>fax ： <span>{$fax}</span></td>
							</tr>
 							 *  
 							 */
$html .= <<<DOC
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
	
	<table id="printinfo">
		<tbody>
			<tr class="ext">
			
DOC;
		}
		
		$html .= $print_hash[$i];
	
		if($i%3==2){
	
$html .= <<<DOC

		</tr>

DOC;

		}
	}
	
	if(!$i%3){
	
$html .= <<<DOC

		</tr>
DOC;

	}else{
$html .= <<<DOC

		</tbody>
	</table>
</div>

DOC;
	}

}

$html .= <<<DOC

</body>
</html>

DOC;
echo $html;

?>
