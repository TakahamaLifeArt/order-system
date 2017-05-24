<?php
// タカハマラフアート
// 見積り計算
// charset euc-jp

	require_once dirname(__FILE__).'/catalog.php';
	require_once dirname(__FILE__).'/estimate.php';
	require_once dirname(__FILE__).'/jd/japaneseDate.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';
	
	if(isset($_POST['act'])){
		switch($_POST['act']){
			case 'itemcost':
					$catalog = new Catalog();
					$res = $catalog->getItemPrice($_POST['item_id'], $_POST['size_id'], $_POST['points']);
					break;
					
			case 'baseprintfee':
				/*
				*	初回割で使用する版元の商品毎の見積情報
				*/
					$estimate = new Estimate();
					$print_fee = $estimate->getEstimation($_POST['orders_id']);
					$json = new Services_JSON();
					$res = $json->encode(array($print_fee));
					header("Content-Type: text/javascript; charset=utf-8");
					break;
					
			case 'printfee':
					$estimate = new Estimate($_POST['curdate']);
					$sheetsize = array(1, 0.5, 0.25);
					$basedata = array();
					$transdata = array();
					
					$temporary = array();	// シルク、インクジェット、カッティングの集計用
					$print_fee = array('tot'=>0,'silk'=>0,'trans'=>0,'darktrans'=>0,'digit'=>0,'inkjet'=>0,'darkinkjet'=>0,'cutting'=>0);
					
					// プリント位置でソート
					// array_multisort($_POST['pos'], $_POST['name'], $_POST['area'], $_POST['ink'], $_POST['size'], $_POST['plates'], $_POST['amount'], $_POST['ratio'], $_POST['extra'], $_POST['item_id'], $_POST['repeat']);
					
					$count = count($_POST['name']);
					for($i=0; $i<$count; $i++){
						$printtype = $_POST['name'][$i];
						$tmp = array();
						$opt = 0;	// インクジェットのオプション（0:白T　1:黒T）
						switch($printtype){
							case 'silk':
								$tmp = $estimate->calcSilkPrintFee($_POST['amount'][$i], $_POST['area'][$i], $_POST['ink'][$i], 0, $_POST['ratio'][$i], $_POST['size'][$i], $_POST['extra'][$i], $_POST['repeat'][$i]);
								break;
							case 'trans':
							case 'darktrans':
							case 'digit':
								// シート数と版数の算出用
								$rep = $_POST['repeat'][$i]==990 || $_POST['repeat'][$i]==0? 0: 1;
								$pos = $_POST['pos'][$i].'_'.$_POST['size'][$i];
								$basedata[$printtype][$rep]['size'][$_POST['plates'][$i]][$pos] = $sheetsize[$_POST['size'][$i]];	// プリント位置ごと（同じ版とみなす）
								$basedata[$printtype][$rep]['shot'][$_POST['plates'][$i]][$pos] += $_POST['amount'][$i];			// プリント位置ごとの枚数計
								$basedata[$printtype][$rep]['volume'] += $_POST['amount'][$i];		// プリント方法ごとの延べ枚数
								$basedata[$printtype][$rep]['item_id'][] = $_POST['item_id'][$i];	// 箇所ごとのアイテム
								// プリント割増率別で計算
								$key = $_POST['ratio'][$i];
								$transdata[$printtype][$key]['amount'][] = $_POST['amount'][$i];	// 箇所ごとの枚数
								$transdata[$printtype][$key]['extra'][] = $_POST['extra'][$i];
								$transdata[$printtype][$key]['press'][] = $_POST['repeat'][$i];
								// アイテムごとのプリント代集計用
								$transdata[$printtype][$key]['item_id'][] = $_POST['item_id'][$i];	// 箇所ごとのアイテム
								$transdata[$printtype][$key]['totamount'] += $_POST['amount'][$i];	// 延べ枚数
								break;
							case 'darkinkjet':	$opt = 1;
							case 'inkjet':
								$tmp = $estimate->calcInkjetFee($opt, $_POST['amount'][$i], $_POST['area'][$i], $_POST['size'][$i], 0, $_POST['ratio'][$i], $_POST['extra'][$i], $_POST['repeat'][$i]);
								break;
							case 'cutting':
								$tmp = $estimate->calcCuttingFee($_POST['amount'][$i], $_POST['area'][$i], $_POST['size'][$i], 0, $_POST['ratio'][$i], $_POST['extra'][$i], $_POST['repeat'][$i]);
								break;
						}
						
						// アイテムごとのプリント代を集計（転写を除く）
						if(!empty($tmp)){
							$print_fee['tot'] += $tmp['tot'];
							$print_fee[$printtype] += $tmp['tot'];
							
							// 共通コストの集計用
							$tmp['amount'] = $_POST['amount'][$i];
							$tmp['item_id'] = $_POST['item_id'][$i];
							$tmp['repeat'] = $_POST['repeat'][$i];
							$tmp['setting_group'] = $_POST['setting'][$i];
							$temporary[$printtype][$_POST['pos'][$i]][] = $tmp;
							/*
							$perone = $tmp/$_POST['amount'][$i];
							$hash = explode(',', $_POST['item_id'][$i]);
							for($t=0; $t<count($hash); $t++){
								$dat = explode('|', $hash[$t]);
								$itemid = $dat[0];
								$print_fee['item'][$itemid]['fee'] += ($perone*$dat[1]);
								$print_fee['item'][$itemid]['amount'] = $dat[1];
							}
							*/
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
										case 0:
										case 1:
												if($is99 && isset($sub_settingfee[$val[$i]['setting_group']])){
													$perone = $sub_plates+$sub_press+$sub_settingfee[$val[$i]['setting_group']];
												}else{
													$perone = $sub_plates+$sub_press+($val[$i]['setting']/$val[$i]['amount']);
												}
												break;
										case 99:$perone = $sub_plates+$sub_press+$sub_settingfee[$val[$i]['setting_group']];
												break;
									}
									*/
									$hash = explode(',', $val[$i]['item_id']);		// 当該箇所に対応するアイテム
									for($t=0; $t<count($hash); $t++){
										$dat = explode('|', $hash[$t]);		// アイテムIDと枚数
										$itemid = $dat[0];
										$print_fee['item'][$itemid]['fee'] += ($perone*$dat[1]);
										$print_fee['item'][$itemid]['amount'] = $dat[1];
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
								$common_cost = $estimate->calcTransCommonFee($tbl, $val['size'], $val['shot'], $rep);
								$cost = $common_cost[0]+$common_cost[1];
								$print_fee[$tbl] += $cost;
								$print_fee['tot'] += $cost;
								$perone = $cost/$val['volume'];
								
								// アイテム毎に版代とシート代を案分
								for($j=0; $j<count($val['item_id']); $j++){
									$hash = explode(',', $val['item_id'][$j]);
									for($t=0; $t<count($hash); $t++){
										$dat = explode('|', $hash[$t]);
										$itemid = $dat[0];
										$print_fee['item'][$itemid]['fee'] += ($perone*$dat[1]);
									}
								}
							}
							
							// 割増率ごと
							foreach($transdata[$tbl] as $ratio=>$val){
								// 組付け代＋プレス代
								$tmp = $estimate->calcTransFee($tbl, $val['amount'], $val['extra'], 0, $ratio, $val['press']);
								$print_fee[$tbl] += $tmp;
								$print_fee['tot'] += $tmp;
								
								// アイテム毎のプリント代
								$perone = $tmp/$val['totamount'];
								for($i=0; $i<count($val['item_id']); $i++){
									$hash = explode(',', $val['item_id'][$i]);
									for($t=0; $t<count($hash); $t++){
										$dat = explode('|', $hash[$t]);
										$itemid = $dat[0];
										$print_fee['item'][$itemid]['fee'] += ($perone*$dat[1]);
										$print_fee['item'][$itemid]['amount'] = $dat[1];
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
					
					$json = new Services_JSON();
					$res = $json->encode(array($print_fee));
					header("Content-Type: text/javascript; charset=utf-8");
					break;
					
			case 'compareprice':
					$estimate = new Estimate($_POST['schedule3']);
					$area = count($_POST['ink']);
					$pattern = array('silk','trans','inkjet');
					$ary = getPermutation($pattern, $area);
					
					$min_tot = 0;
					for($i=0; $i<count($ary); $i++){
						$price = array();
						$price_trans = 0;
						$price_silk = 0;
						$price_inkjet = 0;
						$tot = 0;
						$r = 0;
						$sheet = array();
						$area = 0;
						$excl = false;
						
						for($c=count($ary[$i])-1; $c>=0; $c--){
							if($ary[$i][$c]=="silk"){
								$price[$c] = $estimate->calcSilkPrintFee($_POST['amount'], 1, $_POST['ink'][$r], '0', $_POST['ratio'], 0, 1, $_POST['repeat']);
								if($price[$c]==0) $excl = true;
								$price_silk += $price[$c];
							}elseif($ary[$i][$c]=="inkjet"){
								$price[$c] = $estimate->calcInkjetFee('inkjet', $_POST['amount'], 1, $_POST['size'][$r], '0', $_POST['ratio'], 1, $_POST['repeat']);
								$price_inkjet += $price[$c];
							}else{
								$price[$c] = ' ';
								switch($_POST['size'][$r]){
									case '0': $sheet[] = '1'; break;
									case '1': $sheet[] = '0.5'; break;
									case '2': $sheet[] = '0.25'; break;
								}
								$area++;
							}
							
							$r++;
						}
						$tot = $price_silk+$price_inkjet;
												
						if(!empty($sheet)){
							$price_trans = $estimate->calcTransFee('colorprice', $_POST['amount'], $sheet, $area, 1, '0', $_POST['ratio'], $_POST['repeat']);
							$tot += $price_trans;
						}
						
						if( ($min_tot==0 || $min_tot>$tot) && !$excl){
							$min_tot = $tot;
							$res = '';
							for($c=count($ary[$i])-1; $c>=0; $c--){
								$res .= $ary[$i][$c].'_'.$price[$c].';';
							}
							$res .= 'totsilk_'.$price_silk.';tottrans_'.$price_trans.';totinkjet_'.$price_inkjet.';tot_'.$tot;
						}
					}
					break;
			case 'basecount':
					$tbl="";
					switch($_POST['name']){
						case 'trans':
								$tbl = 'colorprice';
								break;
						case 'darktrans':
								$tbl = 'darkcolorprice';
								break;
						case 'digit':
								$tbl = 'digitprice';
								break;
					}
					
					$res = Estimate::getBaseCount($tbl, $_POST['amount'], $_POST['size'], $_POST['repeat']);
					break;
		}
		
		echo $res;
	}
	
	
	
	/*
	*	プリント方法の組合せパターンを配列に格納
	*	@pattern		並べる要素の配列
	*	@count			並べる桁数
	*
	*	return			組合せを2次配列で返す
	*/
	function getPermutation($pattern, $count){
		$digit = pow(count($pattern),$count);
		$res = permute($pattern, $digit, $digit, $ary);
		return $res;
	}
	
	/*
	*	順列のパターンを取得する再帰モジュール
	*	@pattern		並べる要素の配列
	*	@digit			パターンの総数（再起呼出時に並べる数（桁数）の算出に使用される）
	*	@index			パターンの総数
	*	@res			結果を代入する配列
	*
	*	return			組合せを2次配列で返す
	*/
	function permute($pattern, $digit, $index, $res){
		$patterns = count($pattern);
		$digit /= $patterns;
		if($digit!=1) $res = permute($pattern, $digit, $index, $res);
		$d=0;
		$a=1;
		for($i=0; $i<$index; $i++){
			$res[$i][] = $pattern[$d];
			if($a==$digit){
				$a=1;
				$d=$d==$patterns-1? 0: ++$d;
			}else{
				$a++;
			}
		}
		return $res;
	}
		
	
	
	/*
	*	受付日と発送日を除いた営業日数を返す
	*	
	*	@baseSec	受付日（UNIXタイムスタンプの秒数）
	*	@deliSec	発送日（UNIXタイムスタンプの秒数）
	*
	*	return		営業日数
	*/
	function getWorkday($baseSec, $deliSec){
		if(!getdate($baseSec) || !getdate($deliSec)) return 0;
		$jd = new japaneseDate();		
		$one_day = 86400;
		$baseSec += $one_day;
		$fin = $jd->makeDateArray($baseSec);
		$workday = 0;
		while( $deliSec > $baseSec ){
			if( (($fin['Weekday']>0 && $fin['Weekday']<6) && $fin['Holiday']==0) || 
				(($fin['Month']==$_form_holiday_month && $fin['Day']<$_form_holiday_day) || 
				($fin['Month']==$_to_holiday_month && $fin['Day']>$_to_holiday_day)) ){
				
				$workday++;
			}
			$baseSec += $one_day;
			$fin = $jd->makeDateArray($baseSec);
		}
		
		return $workday;
	}
?>