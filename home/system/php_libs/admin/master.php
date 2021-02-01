<?php
/*
*	タカハマライフアート
*	マスターデータベースの操作
*	charset UTF-8
*	log
*	2018-09-07 アイテムカラーにインクジェットの淡色チェックを追加
*/
	require_once dirname(__FILE__).'/../catalog.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';
	$isJSON = false;
	$def_dropping = '3000-01-01';

	if(isset($_REQUEST['act'], $_REQUEST['curdate'])){

		if(empty($_REQUEST['curdate'])){
			$_REQUEST['act'] = null;
		}else{
			$d = explode('-', $_REQUEST['curdate']);
			if(checkdate($d[1], $d[2], $d[0])){
				$curdate = $_REQUEST['curdate'];
			}else{
				$_REQUEST['act'] = null;
			}
		}
				
		switch($_REQUEST['act']){
		case 'items':
		/*
		*	商品の基本情報テーブル
		*/

			if(isset($_POST['category_id'])){
				
				$rec = Master::getItems( $_POST['category_id'], $_POST['item_id'], $curdate );
				$count = count($rec);
				for($i=0; $i<$count; $i++){
					if(empty($_POST['item_id'])){
						$list .= '<tr id="item_'.$rec[$i]['item_id'].'" class="act" onclick="$.showItemDetail('.$rec[$i]['item_id'].');">';
					}else{
						$list .= '<tr id="item_'.$rec[$i]['item_id'].'" class="act" onclick="$.updatemode();">';
					}
					$list .= '<td class="ar">'.$rec[$i]['item_id'].'</td>';
					$list .= '<td>'.$rec[$i]['item_code'].'</td>';
					$list .= '<td>'.$rec[$i]['item_name'].'</td>';
					$list .= '<td class="ac">'.$rec[$i]['ratio'].'</td>';
					if($rec[$i]['printposition_id']==46){
						$fname = 'layout_noprint';
					}else if($rec[$i]['printposition_id']==51){
						$fname = 'layout_back';
					}else{
						$fname = 'layout_front';
					}
					$list .= '<td class="ac">'.$rec[$i]['printposition_id'].'<img class="printposition" alt="'.$rec[$i]['printposition_id'].'" src="'._IMG_PSS.'printposition/'.$rec[$i]['category_type'].'/'.$rec[$i]['item_type'].'/'.$fname.'.png" width="50" /></td>';
					$list .= '<td class="maker_'.$rec[$i]['maker_id'].'">'.$rec[$i]['maker_name'].'</td>';
					$list .= '<td class="ac">'.$rec[$i]['item_row'].'</td>';
					$list .= '<td class="ac">';
					if($rec[$i]['opp']==1){
						$list .= '小';
					}else if($rec[$i]['opp']==2){
						$list .= '大';
					}else{
						$list .= '-';
					}
					$list .= '</td>';
					$list .= '<td class="ac">';
					if($rec[$i]['oz']=="0.0"){
						$list .= '-';
					}else{
						$list .= $rec[$i]['oz'];
					}
					$list .= '</td>';
					$list .= '<td class="ac">';
					if($rec[$i]['lineup']==1){
						$list .= '表示</td>';
					}else{
						$list .= '-</td>';
					}
					//show_site 一覧表示と基本情報画面
					$site_list_id = explode(',',_SITE_ID);
					$site_list_name = explode(',',_SITE_NAME);
					$list .= '<td class="ac">';
					if($rec[$i]['show_site'] == ""){
					  $list .= '-';
					}else{
						$str ="";
						$item_site = explode(',',$rec[$i]['show_site']);
						for($t=0; $t<count($site_list_id); $t++){
							if(in_array($site_list_id[$t],$item_site)){
								$str .= $site_list_name[$t].',';
							}
						}
						$str = substr($str, 0, -1);
						$list .= $str;
					}
					$list .='</td>';
					if($rec[$i]['itemdate']==$def_dropping){
						$list .= '<td style="display:none;"></td>';
					}else{
						$list .= '<td style="display:none;">'.$rec[$i]['itemdate'].'</td>';
					}
					$list .= '</tr>';
				}
				$list .= '|'.$count.'|'.$rec[0]['category_key'].'|'.$rec[0]['category_name'];
				
				// 商品詳細及び編集画面の場合
				if(! empty($_POST['item_id'])){
					$position_type = trim($rec[0]['position_type']);
					$baseFileName = array('front', 'back', 'side');
					$list .= '|<h3>プリント可能範囲</h3>';
					for($t=0; $t<count($baseFileName); $t++){
						$url = _IMG_PSS.'printarea/'.$position_type.'/base_'.$baseFileName[$t].'.png';
						if(Master::remoteFilesize($url)){
							$list .= '<img class="printarea" alt="" src="'.$url.'" width="200" height="200">';
						}else{
							$list .= '<div class="no-image"><p>'.$baseFileName[$t].'</p></div>';
						}
						
					}
				}
			}
			break;
		case 'updatebasic':
		/*
		*	編集モードの基本情報テーブル
		*/

			if(isset($_POST['item_id'])){
				$conn = db_connect();
				$result = exe_sql($conn, "select * from maker");
				$makers = '<select class="maker_id">';
				while($rec = mysqli_fetch_array($result)){
					$makers .= '<option value="'.$rec['id'].'">'.$rec['maker_name'].'</option>';
				}
				$makers .= '</select>';
				
				$result = exe_sql($conn, "select * from printratio where printratioapply=(select max(printratioapply) from printratio where printratioapply<='".$curdate."')");
				$ratio = '<select class="ratio_id">';
				while($rec = mysqli_fetch_array($result)){
					$ratio .= '<option value="'.$rec['ratioid'].'">'.$rec['ratio'].'</option>';
				}
				$ratio .= '</select>';
				mysqli_close($conn);
				
				$rec = Master::getItems( null, $_POST['item_id'], $curdate );
				$data = $rec[0];
				
				$list .= '<tr id="item_'.$data['item_id'].'">';
				$list .= '<td class="ar">'.$data['item_id'].'</td>';
				$list .= '<td style="padding:20px 10px 10px"><input type="text" class="item_code" value="'.$data['item_code'].'" style="width:80px;" /></td>';
				$list .= '<td style="padding:20px 10px 10px"><input type="text" class="item_name" value="'.$data['item_name'].'" style="width:320px;" /></td>';
				$list .= '<td style="padding:20px 10px 10px" class="ac">'.preg_replace('/value="'.$data['printratio_id'].'"/', 'value="'.$data['printratio_id'].'" selected="selected"', $ratio).'</td>';
				if($data['printposition_id']==46){
					$fname = 'layout_noprint';
				}else if($data['printposition_id']==51){
					$fname = 'layout_back';
				}else{
					$fname = 'layout_front';
				}
				$list .= '<td style="padding:10px 0px 0px" class="ac"><span>'.$data['printposition_id'].'</span><img class="pp_id" alt="'.$data['printposition_id'].'" src="'._IMG_PSS.'printposition/'.$data['category_type'].'/'.$data['item_type'].'/'.$fname.'.png" width="70" /></td>';
				$list .= '<td style="padding:20px 10px 10px">'.preg_replace('/value="'.$data['maker_id'].'"/', 'value="'.$data['maker_id'].'" selected="selected"', $makers).'</td>';
				$list .= '<td style="padding:20px 10px 10px" class="ac"><input type="number" class="item_row" min="1" step="1" max="99" value="'.$data['item_row'].'" /></td>';
				$list .= '<td style="padding:20px 10px 10px" class="ac">';
				$opp = '<select class="opp">';
				$opp .= '<option value="0">-</option>';
				$opp .= '<option value="1">小</option>';
				$opp .= '<option value="2">大</option>';
				$opp .= '</select>';
				$list .= preg_replace('/value="'.$data['opp'].'"/', 'value="'.$data['opp'].'" selected="selected"', $opp);
				$list .= '</td>';
				$list .= '<td style="padding:20px 10px 10px" class="ac"><input type="number" class="oz" min="0" step="0.1" max="99" value="'.$data['oz'].'" /></td>';
				$list .= '<td style="padding:20px 10px 10px" class="ac"><input type="checkbox" class="lineup" value="1" ';
				if($data['lineup']==1){
					$list .='checked="checked" ';
				}
				$list .='/></td>';

				$site_list_id = explode(',',_SITE_ID);
				$site_list_name = explode(',',_SITE_NAME);
				//$site_list = array_combine($site_list_id,$site_list_name);
				if($data['show_site'] == ""){
					$list .= '<td>';
					for($i=0;$i<count($site_list_id);$i++){
  				  $list .= '<input type="checkbox" class="show_site" value="';
						$list .= $site_list_id[$i].'">'.$site_list_name[$i];

					}
					$list .='</td>';
				}else{
					$list .= '<td>';
					$item_site1 = explode(',',$data['show_site']);
					for($i=0; $i<count($site_list_id); $i++){
						$list .= '<input type="checkbox" class="show_site"';
						if(in_array($site_list_id[$i],$item_site1)){
							$list .='checked="checked"';
						}
						$list .='value="'.$site_list_id[$i].'">'.$site_list_name[$i];
					}
					$list .= '</td>';
				}
				$list .= '</tr>';
				if($data['itemdate']==$def_dropping){
					$dt = '';
				}else{
					$dt = $data['itemdate'];
				}
				$list .= '<tr><td></td><td>取扱中止日</td><td colspan="8" style="padding-top:10px"><input type="text" name="droppingitem" value="'.$dt.'" class="datepicker forDate" /></tr>';				
			}
			break;
		case 'cost';
		/*
		*	サイズごとの価格テーブル
		*/
			if(isset($_POST['item_id'])){
				$conn = db_connect();
				$result = exe_sql($conn, "select * from size");
				$sizename = array();
				while($rec = mysqli_fetch_array($result)){
					$sizename[$rec['id']] = $rec['size_name'];
				}
				mysqli_close($conn);
				
				$cost_name = array('白色<br>(入値)','白以外<br>(入値)','白色<br>(ﾒｰｶｰ)','白以外<br>(ﾒｰｶｰ)');
				$rec = Master::getPrice( $_POST['item_id'], $curdate );
				for($i=0; $i<count($rec); $i++){
					$sizeid=$rec[$i]['size_from'];
					$cost[$sizeid]['id'] = $rec[$i]['id'];
					$cost[$sizeid]['colors'] = $rec[$i]['price_0'];
					$cost[$sizeid]['white'] = $rec[$i]['price_1'];
					$cost[$sizeid]['colors_maker'] = $rec[$i]['price_maker_0'];
					$cost[$sizeid]['white_maker'] = $rec[$i]['price_maker_1'];
					if($rec[$i]['itempricedate']==$def_dropping){
						$cost[$sizeid]['itempricedate'] = '';
					}else{
						$cost[$sizeid]['itempricedate'] = $rec[$i]['itempricedate'];
					}
				}
				
				$head = '<thead>';
				$body = '<tbody>';
				
				if(isset($_POST['update'])){
					// 更新用にサイズを縦に配置
					$isSize = true;
					$hash = Master::getSize( $_POST['item_id'], $curdate, 'DESC' );
					$tmp = array();
					if(empty($hash)){
						// 登録サイズがない場合
						$isSize = false;
						$hash = Master::getSizeseries( $_POST['item_id'], $curdate);
						$series_count = count($hash);
						for($i=0; $i<$series_count; $i++){
							$tmp[$hash[$i]] = array('series'=>$hash[$i], 'rec'=>array());
						}
					}else{
						// 全サイズに対応しているシリーズを判断する
						foreach($hash as $series=>$val){
							$tmp[$series] = array('series'=>$series, 'rec'=>$hash[$series]);
							$series_count++;
						}
						ksort($tmp);
					}
					
					$head .= '<tr><th>サイズ名</th>';
					for($n=0; $n<count($cost_name); $n++){
						$head .= '<th>'.$cost_name[$n].'</th>';
					}
					
					$check = array();
					foreach($tmp as $val){
						if(empty($check)){
						// 全サイズ
							$head .= '<th>ﾊﾟﾀｰﾝ '.$val['series'].'</th>';
							if(empty($val['rec'])){
								// 登録サイズがない場合
								$check[0][0] = '<td class="ac"><img alt="" src="../img/checkbox_checked_icon.png" /></td>';
							}else{
								for($i=0; $i<count($val['rec']); $i++){
									$sizeid = $val['rec'][$i]['size_from'];
									$check[$sizeid][0] = '<td class="ac"><img alt="" src="../img/checkbox_checked_icon.png" /></td>';
								}
							}
						}else{
						// サイズに制限あり
							$limit_series = $val['series'];
							$head .= '<th class="series" abbr="'.$val['series'].'">ﾊﾟﾀｰﾝ '.$val['series'].'</th>';
							for($t=0; $t<count($val['rec']); $t++){
								$sizeid = $val['rec'][$t]['size_from'];
								$check[$sizeid][1] = '<td class="series"><input type="checkbox" value="'.$val['rec'][$t]['id'].'" checked="checked" name="series_'.$val['series'].'" /></td>';
							}
						}
					}
					
					
					// サイズに制限があるシリーズで対応しているサイズがないレコードのチェック
					if($series_count>1){
						foreach($check as $key=>$val){
							if(empty($check[$key][1])){
								$check[$key][1] = '<td class="series"><input type="checkbox" value="0" name="series_'.$limit_series.'" /></td>';
							}
						}
					}
					
					$head .= '<th>梱包枚数</th><th>梱包枚数<br>(袋詰)</th>';
					$head .= '<th>プリント１</th><th>プリント２</th><th>プリント３</th><th>プリント４</th><th>プリント５</th><th>プリント６</th><th>プリント７</th>';
					$head .= '<th>Web表示</th><th>取扱中止日</th></tr></thead>';
					
					$sizelist = array();
					$addSeries = array();
					foreach($tmp as $key=>$val){
						$sizelist[$key] = '<tr><td>パターン '.$key.'</td>';
						$addSeries = '<tr><td><input type="button" value="パターンの追加" id="add_series" /></td>';
						for($i=0; $i<count($val['rec']); $i++){
							$sizeid=$val['rec'][$i]['size_from'];
							$sizelist[$key] .= '<td>'.$sizename[$sizeid].'</td>';
							if(isset($chkSize[$sizeid])) continue;
							$chkSize[$sizeid] = true;
							$lineup = $val['rec'][$i]['size_lineup']==1? 'checked="checked"': '';
							$body .= '<tr class="price_'.$cost[$sizeid]['id'].'">';
							$body .= '<th class="size_'.$sizeid.'">'.$sizename[$sizeid].'</th>';
							$body .= '<td><input type="text" value="'.$cost[$sizeid]['white'].'" class="price_1 forBlank" /></td>';
							$body .= '<td><input type="text" value="'.$cost[$sizeid]['colors'].'" class="price_0 forBlank" /></td>';
							$body .= '<td><input type="text" value="'.$cost[$sizeid]['white_maker'].'" class="price_maker_1 forBlank" /></td>';
							$body .= '<td><input type="text" value="'.$cost[$sizeid]['colors_maker'].'" class="price_maker_0 forBlank" /></td>';
							$body .= $check[$sizeid][0].$check[$sizeid][1];
							$body .= '<td><input type="text" value="'.$val['rec'][$i]['numbernopack'].'" class="numbernopack forNum" /></td>';
							$body .= '<td><input type="text" value="'.$val['rec'][$i]['numberpack'].'" class="numberpack forNum" /></td>';
							$body .= '<td><input type="text" value="'.$val['rec'][$i]['printarea_1'].'" class="printarea_1 forChar" /></td>';
							$body .= '<td><input type="text" value="'.$val['rec'][$i]['printarea_2'].'" class="printarea_2 forChar" /></td>';
							$body .= '<td><input type="text" value="'.$val['rec'][$i]['printarea_3'].'" class="printarea_3 forChar" /></td>';
							$body .= '<td><input type="text" value="'.$val['rec'][$i]['printarea_4'].'" class="printarea_4 forChar" /></td>';
							$body .= '<td><input type="text" value="'.$val['rec'][$i]['printarea_5'].'" class="printarea_5 forChar" /></td>';
							$body .= '<td><input type="text" value="'.$val['rec'][$i]['printarea_6'].'" class="printarea_6 forChar" /></td>';
							$body .= '<td><input type="text" value="'.$val['rec'][$i]['printarea_7'].'" class="printarea_7 forChar" /></td>';
							$body .= '<td><input type="checkbox" class="size_lineup" value="1" '.$lineup.'></td>';
							$body .= '<td><input type="text" value="'.$cost[$sizeid]['itempricedate'].'" class="datepicker forDate" /></td>';
							$body .= '</tr>';
							
							$addSeries .= '<td><input type="checkbox" value="'.$sizeid.'" name="addseries" /></td>';
						}
						$sizelist[$key] .= '</tr>';
						$addSeries .= '</tr>';
					}
					ksort($sizelist);
					
					// 登録サイズがない場合
					if(!$isSize){
						$size_selector .= '<select class="change_size" onchange="$.setNewsizeID(this);">';
						foreach($sizename as $sid=>$sname){
							$size_selector .= '<option value="'.$sid.'">'.$sname.'</option>';
						}
						$size_selector .= '</select>';
						
						$body .= '<tr class="price_0">';
						$body .= '<th class="size_19">';
						$body .= preg_replace('/value="19"/', 'value="19" selected="selected"', $size_selector).'</th>';
						$body .= '<td><input type="text" value="" class="price_1 forBlank" /></td>';
						$body .= '<td><input type="text" value="" class="price_0 forBlank" /></td>';
						$body .= '<td><input type="text" value="" class="price_maker_1 forBlank" /></td>';
						$body .= '<td><input type="text" value="" class="price_maker_0 forBlank" /></td>';
						$body .= $check[0][0].$check[0][1];
						$body .= '<td><input type="text" value="0" class="numbernopack forNum" /></td>';
						$body .= '<td><input type="text" value="0" class="numberpack forNum" /></td>';
						$body .= '<td><input type="text" value="" class="printarea_1 forChar" /></td>';
						$body .= '<td><input type="text" value="" class="printarea_2 forChar" /></td>';
						$body .= '<td><input type="text" value="" class="printarea_3 forChar" /></td>';
						$body .= '<td><input type="text" value="" class="printarea_4 forChar" /></td>';
						$body .= '<td><input type="text" value="" class="printarea_5 forChar" /></td>';
						$body .= '<td><input type="text" value="" class="printarea_6 forChar" /></td>';
						$body .= '<td><input type="text" value="" class="printarea_7 forChar" /></td>';
						$body .= '<td><input type="checkbox" class="size_lineup" value="1" checked="checked"></td>';
						$body .= '<td><input type="text" value="" class="datepicker forDate" /></td>';
						$body .= '</tr>';
					}
					
					$body .= '</tbody>|'.implode('',$sizelist);
					
					if($series_count==1){
						$body .= $addSeries;
					}
				
				}else{
					// 一覧表示
					$header_name = array('白色<br />(入値)','白以外<br />(入値)','白色<br />(ﾒｰｶｰ)','白以外<br />(ﾒｰｶｰ)','梱包枚数','梱包枚数(袋詰)','プリント１','プリント２','プリント３','プリント４','プリント５','プリント６','プリント７','Web');
					$hash = Master::getSize( $_POST['item_id'], $curdate );
					$body1 = array();
					foreach($hash as $key=>$rec){
						$head1 = '';
						for($i=0; $i<count($rec); $i++){
							$sizeid = $rec[$i]['size_from'];
							$lineup = $rec[$i]['size_lineup']==1? '表示': '-';
							$head1 .= '<th>'.$sizename[$sizeid].'</th>';
							if($body!='<tbody>') continue;
							$body1[0] .= '<td>'.number_format($cost[$sizeid]['white']).'</td>';
							$body1[1] .= '<td>'.number_format($cost[$sizeid]['colors']).'</td>';
							$body1[2] .= '<td>'.number_format($cost[$sizeid]['white_maker']).'</td>';
							$body1[3] .= '<td>'.number_format($cost[$sizeid]['colors_maker']).'</td>';
							$body1[4] .= '<td>'.number_format($rec[$i]['numbernopack']).'</td>';
							$body1[5] .= '<td>'.number_format($rec[$i]['numberpack']).'</td>';
							$body1[6] .= '<td>'.$rec[$i]['printarea_1'].'</td>';
							$body1[7] .= '<td>'.$rec[$i]['printarea_2'].'</td>';
							$body1[8] .= '<td>'.$rec[$i]['printarea_3'].'</td>';
							$body1[9] .= '<td>'.$rec[$i]['printarea_4'].'</td>';
							$body1[10] .= '<td>'.$rec[$i]['printarea_5'].'</td>';
							$body1[11] .= '<td>'.$rec[$i]['printarea_6'].'</td>';
							$body1[12] .= '<td>'.$rec[$i]['printarea_7'].'</td>';
							$body1[13] .= '<td class="ac">'.$lineup.'</td>';
						}
						
						$head .= '<tr><th></th>'.$head1.'</tr>';
						
						$body = '<tbody>';
						for($n=0; $n<count($body1); $n++){
							$body .= '<tr><th>'.$header_name[$n].'</th>'.$body1[$n].'</tr>';
						}
						
						$body .= '</tbody>';
						break;
					}
					$head .= '</thead>';
				}
				
				$list = $head.$body;
			}
			break;
			
		case 'color':
		/*
		*	商品カラーテーブル
		*	@return		sizeseries, itemcode_colorcode:colorname, ... | ... | カラーに制限のあるサイズ名, ..
		*/
			if(isset($_POST['item_id'])){
				$conn = db_connect();
				$result = exe_sql($conn, "select * from size");
				$sizename = array();
				while($rec = mysqli_fetch_array($result)){
					$sizename[$rec['id']] = $rec['size_name'];
				}
				
				$sql = sprintf("select catalog.id as master_id, size_series, catalogdate, item_code, color_code, color_id, color_name, color_lineup from (catalog
						 inner join itemcolor on color_id=itemcolor.id)
						 inner join item on item_id=item.id 
						 where item_id=%d and color_id!=0
						 and catalogapply<='%s' and catalogdate>'%s'
						 and itemapply<='%s' and itemdate>'%s'
						 order by size_series DESC, color_code", 
						$_POST['item_id'], $curdate, $curdate, $curdate, $curdate);
				$result = exe_sql($conn, $sql);
				$colors = array();
				while($rec = mysqli_fetch_array($result)){
					$colors[$rec['size_series']][] = $rec;
				}
				mysqli_close($conn);
				
				$size = array();
				$limit_size = array();	// カラーに制限があるサイズ
				$n = -1;
				$hash = Master::getSize( $_POST['item_id'], $curdate );
				foreach($hash as $key=>$rec){
					$n++;
					for($i=0; $i<count($rec); $i++){
						$sizeid=$rec[$i]['size_from'];
						$size[$n][$sizeid] = $sizename[$sizeid];
					}
				}
				
				foreach($colors as $series=>$val){
					$tmp = array();
					for($i=0; $i<count($val); $i++){
						if($val[$i]['color_code']==""){
							$code = '';
						}else{
							$code = '_'.$val[$i]['color_code'];
						}
						if($val[$i]['catalogdate']==$def_dropping){
							$dropping = '';
						}else{
							$dropping = $val[$i]['catalogdate'];
						}
						$tmp[] = $val[$i]['master_id'].':'.$val[$i]['item_code'].$code.':'.$val[$i]['color_id'].':'.$val[$i]['color_name'].':'.$dropping.':'.$val[$i]['color_lineup'];
					}
					$list .= $series.','.implode(',', $tmp);
					if($n>0) $list .= '|';
				}
				
				if($n>0){
					$limit_size = array_diff($size[0], $size[1]);
					$list .= implode(',', $limit_size);
				}
				
			}
			break;
		
		case 'series':
		/*
		*	サイズシリーズ別の商品カラー
		*	@return		sizeseries | itemcode_colorcode:colorname, ... | ... 
		*/
			if(isset($_POST['item_id'])){
				$conn = db_connect();
				$result = exe_sql($conn, "select * from size");
				$sizename = array();
				while($rec = mysqli_fetch_array($result)){
					$sizename[$rec['id']] = $rec['size_name'];
				}
				
				$sql = sprintf("select catalog.id as master_id, size_series, catalogdate, item_code, color_code, color_id, color_name, color_lineup from (catalog
						 inner join itemcolor on color_id=itemcolor.id)
						 inner join item on item_id=item.id 
						 where item_id=%d and color_id!=0
						 and catalogapply<='%s' and catalogdate>'%s'
						 and itemapply<='%s' and itemdate>'%s'
						 order by size_series DESC, color_code", 
						$_POST['item_id'], $curdate, $curdate, $curdate, $curdate);
				$result = exe_sql($conn, $sql);
				$colors = array();
				while($rec = mysqli_fetch_array($result)){
					$colors[$rec['size_series']][] = $rec;
				}
				mysqli_close($conn);
				
				$series = array();
				$hash = Master::getSize( $_POST['item_id'], $curdate );
				foreach($hash as $key=>$rec){
					$series[] = $key;
				}
				
				$list = implode(',', $series);
				$list .= '|';
				$n = 0;
				foreach($colors as $series=>$val){
					$tmp = array();
					if(++$n > 1) $list .= '|';
					for($i=0; $i<count($val); $i++){
						if($val[$i]['color_code']==""){
							$code = '';
						}else{
							$code = '_'.$val[$i]['color_code'];
						}
						if($val[$i]['catalogdate']==$def_dropping){
							$dropping = '';
						}else{
							$dropping = $val[$i]['catalogdate'];
						}
						$tmp[] = $val[$i]['master_id'].':'.$val[$i]['item_code'].$code.':'.$val[$i]['color_id'].':'.$val[$i]['color_name'].':'.$dropping.':'.$val[$i]['color_lineup'];
					}
					$list .= $series.','.implode(',', $tmp);
				}
				
			}
			break;
		
		case 'detail':
		/*
		 * アイテム詳細ページ情報
		 */
		 	$list = array();
			if(isset($_POST['item_id'])){
				$conn = db_connect();
				$sql = sprintf("select item_code from item where id=%d  and itemapply<='%s' and itemdate>'%s'", $_POST['item_id'],$curdate,$curdate);
				$result = exe_sql($conn, $sql);
				$item_code = "";
				while($rec = mysqli_fetch_array($result)){
					$item_code = $rec['item_code'];
				}
				
				$sql = sprintf("select * from itemdetail where item_code='%s'", $item_code);
				$result = exe_sql($conn, $sql);
				$list = mysqli_fetch_array($result);
				foreach($list as $key=>$val){
					if($val=='undefined') $list[$key] = "";
				}
				if($_POST['br'] && $list){
					$list["i_description"] = nl2br($list["i_description"]);
					$list["i_material"] = nl2br($list["i_material"]);
					$list["i_note"] = nl2br($list["i_note"]);
				}
				mysqli_close($conn);
			}
			$isJSON = true;
			break;

		case 'showtag':
			/*
			 * タグ詳細ページ情報
			 */
			 	$list = array();
				if(isset($_POST['item_id'])){
					$conn = db_connect();
					$sql = sprintf("SELECT tagtypeid,tagtype_name,tag_name,tag_order FROM (tags INNER JOIN tagtype ON tags.tag_type = tagtype.tagtypeid) 
												 	INNER JOIN itemtag on tags.tagid = itemtag.tag_id 
												 WHERE tag_itemid = %d ORDER BY tagtypeid ", $_POST['item_id']);

					$result = exe_sql($conn, $sql);
					while($rec = mysqli_fetch_array($result)){
						$list[] = $rec;
					}
					mysqli_close($conn);
				}
				$isJSON = true;
				break;
		case 'tags':
		/*
		 * 全タグ
		 */
		 	$list = array();
			if(isset($_POST['item_id'])){
				$conn = db_connect();
				$sql = sprintf("SELECT tag_type, tagid , tag_name FROM tags ORDER BY tag_type ASC");
				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$list[] = $rec;
				}
				$sql = sprintf("SELECT  tag_id FROM itemtag INNER JOIN tags ON itemtag.tag_id = tags.tagid WHERE tag_itemid='%s'", $_POST['item_id']);
				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$list1[] = $rec;
				}
				mysqli_close();
			}
			$isJSON = true;
			break;

		case 'itemtag':
		/*
		 * itemタグ
		 */
		 	$list = array();
			if(isset($_POST['item_id'])){
				$conn = db_connect();

				$sql = sprintf("SELECT  tag_id FROM itemtag INNER JOIN tags ON itemtag.tag_id = tags.tagid WHERE tag_itemid='%s'", $_POST['item_id']);
				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$list[] = $rec;
				}
				mysqli_close($conn);
			}
			$isJSON = true;
			break;
			
		case 'measurelist':
		/*
		 * 寸法
		 */
			$list = array();
			$conn = db_connect();
			$result = exe_sql($conn, "select * from measure order by measure_row");
			while($rec = mysqli_fetch_array($result)){
				$list[] = $rec;
			}
			mysqli_close($conn);
			$isJSON = true;
			break;
			
		case 'measure':
		/*
		 * 寸法
		 */
			$list = array();
			if(isset($_POST['item_id'])){
				$conn = db_connect();
				$sql = sprintf("select item_code from item where id=%d  and itemapply<='%s' and itemdate>'%s'", $_POST['item_id'],$curdate,$curdate);
				$result = exe_sql($conn, $sql);
				$item_code = "";
				while($rec = mysqli_fetch_array($result)){
					$item_code = $rec['item_code'];
				}
				
				$sql = sprintf("select * from (itemmeasure inner join measure on measure_id=measureid) inner join size on size_id=size.id where item_code='%s' order by measure_row, size_row", $item_code);
				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$list[] = $rec;
				}
				mysqli_close($conn);
			}
			$isJSON = true;
			break;
			
		case 'itemcolor':
		/*
		*	商品カラー名一覧
		*	@return		ID:カラー名 | ...
		*/
			$conn = db_connect();
			$result = exe_sql($conn, "select * from itemcolor order by id");
			while($rec = mysqli_fetch_array($result)){
				$tmp[] = $rec['id'].':'.$rec['color_name'];
			}
			$list = implode('|', $tmp);
			mysqli_close($conn);
			
			break;
		case 'size':
		/*
		*	サイズ一覧
		*	@return		ID:サイズ名 | ...
		*/
			if(isset($_POST['item_id'])){
				$n = 0;
				$hash = Master::getSize( $_POST['item_id'], $curdate );
				foreach($hash as $key=>$rec){
					for($i=0; $i<count($rec); $i++){
						$list[$n][] = $rec[$i]['size_from'];
					}
					$n++;
				}
			}else{
				$conn = db_connect();
				$result = exe_sql($conn, "select * from size order by size_row");
				$sizename = array();
				while($rec = mysqli_fetch_array($result)){
					$list[] = $rec;
				}
				mysqli_close($conn);
			}
			$isJSON = true;
			break;
		case 'list':
		/*
		*	アイテムカラー、割増率、絵型、メーカーのマスターデータ
		*/
			if(isset($_REQUEST['list_id'])){
				$rec = Master::getMaster( $_REQUEST['list_id'], $_REQUEST['curdate'] );
				$count = count($rec);
				if ($_REQUEST['list_id'] ==1) {	// itemcolor
					for($i=0; $i<$count; $i++){
						$list[] = array($rec[$i]['id'], $rec[$i][1], $rec[$i][2]);
					}
				} else if($_REQUEST['list_id']==3){	// for print position
					for($i=0; $i<$count; $i++){
						if($rec[$i]['id']==46){
							$fname = 'layout_noprint';
						}else if($rec[$i]['id']==51){	// ツナギの背中のみプリント
							$fname = 'layout_back';
						}else{
							$fname = 'layout_front';
						}
						$webpath = _IMG_PSS.'printposition/'.$rec[$i]['category_type'].'/'.$rec[$i]['item_type'].'/'.$fname.'.png';
						
						// プリント可能範囲
						$areapath = array();
						$baseFileName = array('front', 'back', 'side');
						if(is_null($rec[$i]['position_type'])){
							$areapath[0] = '';
							$areapath[1] = '<div class="no-image"><p>登録なし</p></div>';
						}else{
							$position_type = trim($rec[$i]['position_type']);
							$areapath[] = $position_type;
							for($t=0; $t<count($baseFileName); $t++){
								$url = _IMG_PSS.'printarea/'.$position_type.'/base_'.$baseFileName[$t].'.png';
								if(Master::remoteFilesize($url)){
									$areapath[] = '<img class="printarea" alt="" src="'.$url.'" width="160">';
								}else{
									$areapath[] = '<div class="no-image"><p>'.$baseFileName[$t].'</p></div>';
								}
							}
						}
						$list[] = array($rec[$i]['id'], $rec[$i]['item_type'], $webpath, $areapath);
					}
				}else if($_REQUEST['list_id']==5){	// staff
					for($i=0; $i<$count; $i++){
						for($t=0; $t<9; $t++){
							$list[$i][$t] = $rec[$i][$t];
						}
						if($rec[$i]['staffdate']==$def_dropping){
							$list[$i][$t] = '';
						}else{
							$list[$i][$t] = $rec[$i]['staffdate'];
						}
					}
				}else{
					for($i=0; $i<$count; $i++){
						$list[] = array($rec[$i]['id'], $rec[$i][1]);
					}
				}
				
				$isJSON = true;
			}
			break;

		case 'listTag':
		/*
		*	タグ画面　2016/10/20
		*/
			if(isset($_REQUEST['list_id'])){
				$rec = Master::getMasterTag( $_REQUEST['list_id'], $_REQUEST['curdate'] );
				$count = count($rec);
				if($_REQUEST['list_id']!=0){
					for($i=0; $i<$count; $i++){
						for($t=0; $t<9; $t++){
							$list[$i][$t] = $rec[$i][$t];
						}
					}
				}
				
				$isJSON = true;
			}
			break;

		case 'codeCheck':
		/*
		*		item_code item_ame 重複かのチェック
		*/
			if(isset($_REQUEST['act'])){
				$rec = Master::codeCheck($_REQUEST['item_code'], $_REQUEST['curdate']);
				$count = count($rec);
				if($count==0){
					$list[0] = 0;
				} else {
					$list[0] = 1;
				};
				$isJSON = true;
			}
			break;

		case 'db':
			if(isset($_POST['func'])){
				if(isset($_POST['field1'], $_POST['data1'])){
					$data1 = Master::hash1($_POST['field1'], $_POST['data1']);
				}
				if(isset($_POST['field2'], $_POST['data2'])){
					$data2 = Master::hash2($_POST['field2'], $_POST['data2']);
				}
				if(isset($_POST['field3'], $_POST['data3'])){
					$data3 = Master::hash2($_POST['field3'], $_POST['data3']);
				}
				if(isset($_POST['field4'])){
					$data4 = Master::hash2($_POST['field4'], $_POST['data4']);
				}
				if(isset($_POST['field5'], $_POST['data5'])){
					$data5 = Master::hash1($_POST['field5'], $_POST['data5']);
				}
				if(isset($_POST['field6'], $_POST['data6'])){
					$data6 = Master::hash2($_POST['field6'], $_POST['data6']);
				}
				
				if($_POST['func']=='update'){
					if($_POST['mode']=='item'){
						$data = array($data1, $data2, $data3, $data4, $data5, $data6, $curdate);
					}else if($_POST['mode']=='itemcolor'){
						$data = $data2;
					}else if($_POST['mode']=='maker'){
						$data = $data2;
					}else if($_POST['mode']=='staff'){
						$data = $data2;
					}else if($_POST['mode']=='tag'){
						$data = $data2;
					}
				}else if($_POST['func']=='insert'){
					if($_POST['mode']=='item'){
						$data = array($data1, $data2, $data3, $data4, $curdate);
					}else if($_POST['mode']=='itemAuto'){
						$data = array($data1, $data2, $data4, $data6, $curdate);
					}else if($_POST['mode']=='itemcolor'){
						$data = $data1;
					}else if($_POST['mode']=='maker'){
						$data = $data1;
					}else if($_POST['mode']=='tag'){
						$data = $data1;
					}else if($_POST['mode']=='staff'){
						$data = array($data1, $curdate);
					}else if($_POST['mode']=='sizeseries'){
						$data = array($_POST['size_id'], $_POST['item_id'], $curdate);
					}
				}else if($_POST['func']=='delete'){
					if($_POST['mode']=='item'){
						$data = $data1;
					}
					if($_POST['mode']=='maker'){
						$data = $data1;
					}
					if($_POST['mode']=='tag'){
						$data = $data1;
					}
				}
				
				if(empty($data)) break;
				
				
				$master = new Master();
				$list = $master->db($_POST['func'], $data, $_POST['mode']);
			}
			break;
		}
		
		
		if($isJSON){
			$json = new Services_JSON();
			$list = $json->encode($list);
			header("Content-Type: text/javascript; charset=utf-8");
		}
		
		$list = mb_convert_encoding($list,'euc-jp','utf-8');
		echo $list;
		
	}
	
	
	
	
	class Master{
	/**
	 * remoteFilesize	リモートファイルの存在確認
	 * getMaster		マスターテーブルのデータ取得
	 * getItems			指定したカテゴリーまたはアイテムの一覧を返す
	 * getSize			指定したアイテムのサイズ一覧を返す
	 * getprice			指定したアイテムの価格を返す
	 * getSeries		サイズシリーズを返す
	 * db				データベース処理の呼出
	 */
	
		private $def_dropping = '3000-01-01';
		
		/**
		 * リモートファイルの存在確認
		 * @param url	ファイルのURL
		 * @return		false:無い　true:存在する
		 */
		public static function remoteFilesize($url) {
			$http_response_header = null;
			if(@file_get_contents($url, FALSE, NULL, 0, 1)){
				if(empty($http_response_header)){
					return false;
				}else{
					$statusCode = explode(" ", $http_response_header[0]);
					if($statusCode[1]!=200) return false;
				}
			}else{
				return false;
			}
			return true;
		}


		/**
		*	マスターテーブルのデータ取得
		*	@list_id	テーブル区分
		*	@curdate		抽出条件に使用する日付。NULL＝今日
		*
		*	@return			マスターデータの配列
		*/
		public static function getMaster($list_id, $curdate=NULL){
			try{
				$conn = db_connect();
				
				if(empty($curdate)) $curdate = date('Y-m-d');
				
				switch($list_id){
				case '1':	// item color
					$sql = 'select * from itemcolor';
					break;
				case '2':	// print ratio
					$sql = sprintf('select * from printratio where printratioapply=(select max(printratioapply) from printratio where printratioapply<="%s")',$curdate);
					break;
				case '3':	// print position(flat sketch)
					$sql = 'select * from printposition';
					break;
				case '4':	// maker
					$sql = 'select * from maker order by id';
					break;
				case '5':	// staff
					$sql = sprintf('select * from staff where staffapply<="%s" and staffdate>"%s" order by id', $curdate,$curdate);
				}
				
				if(!$sql) return null;
				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$rs[] = $rec;
				}
				
			}catch(Exception $e){
				$rs = '';
			}

			mysqli_close($conn);

			return $rs;
		}

		/**
		*	タグテーブルのデータ取得
		*	@list_id	テーブル区分
		*	@curdate		抽出条件に使用する日付。NULL＝今日
		*
		*	@return			タグデータの配列
		*/
		public static function getMasterTag($list_id, $curdate=NULL){
			try{
				$conn = db_connect();
				if(empty($curdate)) $curdate = date('Y-m-d');
				$idx = ($list_id);
				$sql = sprintf('select * from tags where tag_type=%d order by tag_order',$idx);
				$result = exe_sql($conn, $sql);
				if(!$sql) return null;
				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$rs[] = $rec;
				}
			}catch(Exception $e){
				$rs = '';
			}
			mysqli_close($conn);
		return $rs;
		}
		/**
		* 1107
		*/
		public static function codeCheck($item_code, $curdate){
			try{
				$conn = db_connect();
				$sql = sprintf("SELECT * FROM item WHERE item_code='%s' and itemapply<='%s' and itemdate>'%s'", $item_code, $curdate, $curdate);
				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$rs[] = $rec;
				}
			}catch(Exception $e){
				$rs = '';
			}
			mysqli_close($conn);
			return $rs;
		}
		

		/**
		*	商品の基本情報一覧
		*	@category_id	カテゴリーID
		*	@item_id		アイテムID。default: NULL
		*	@curdate		抽出条件に使用する日付。NULL＝今日
		*
		*	@return			商品情報の配列
		*/
		public static function getItems($category_id, $item_id=NULL, $curdate=NULL){
			try{
				$conn = db_connect();
				
				if(empty($curdate)) $curdate = date('Y-m-d');

				$parm = 'select * from ((((item inner join catalog on item.id=catalog.item_id)';
				$parm .= ' inner join printposition on item.printposition_id=printposition.id)';
				$parm .= ' inner join printratio on item.printratio_id=printratio.ratioid)';
				$parm .= ' inner join category on catalog.category_id=category.id)';
				$parm .= ' inner join maker on item.maker_id=maker.id';
				$parm .= ' where printratioapply=(select max(printratioapply) from printratio where printratioapply<="%s")';
				if(empty($item_id)){
					$parm .= 'and  category_id=%d and catalogapply<="%s" and catalogdate>"%s" and itemapply<="%s" and itemdate>"%s" group by item.id order by item.item_row,item.id';
					$sql = sprintf($parm, $curdate, $category_id, $curdate, $curdate, $curdate, $curdate);
				}else{
					$parm .= ' and item_id=%d and catalogapply<="%s" and catalogdate>"%s" and itemapply<="%s" and itemdate>"%s" group by item.id order by item.item_row,item.id';
					$sql = sprintf($parm, $curdate, $item_id, $curdate, $curdate, $curdate, $curdate);
				}

				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$rs[] = $rec;
				}
				
			}catch(Exception $e){
				$rs = '';
			}

			mysqli_close($conn);

			return $rs;
		}
		
		
		/**
		*	サイズ情報
		*	@item_id		アイテムID
		*	@curdate		抽出条件に使用する日付。NULL＝今日
		*	@sort			サイズシリーズのソート順　default: ASC
		*
		*	@return			サイズ情報の配列
		*/
		public static function getSize($item_id, $curdate=NULL, $sort='ASC'){
			try{
				$conn = db_connect();
				
				if(empty($curdate)) $curdate = date('Y-m-d');
				
				$parm = 'select * from itemsize inner join size on size_from=size.id where item_id=%d and itemsizeapply<="%s" and itemsizedate>"%s" order by series %s, size_row ASC';
				$sql = sprintf($parm, $item_id, $curdate, $curdate, $sort);

				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$rs[$rec['series']][] = $rec;
				}
				
			}catch(Exception $e){
				$rs = '';
			}

			mysqli_close($conn);

			return $rs;
		}
		
		
		/**
		*	価格情報
		*	@item_id		アイテムID
		*	@curdate		抽出条件に使用する日付。NULL＝今日
		*
		*	@return			価格情報の配列
		*/
		public static function getPrice($item_id, $curdate=NULL){
			try{
				$conn = db_connect();
				
				if(empty($curdate)) $curdate = date('Y-m-d');
				
				$parm = 'select * from itemprice where item_id=%d and itempriceapply<="%s" and itempricedate>"%s" order by size_from';
				$sql = sprintf($parm, $item_id, $curdate, $curdate);

				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$rs[] = $rec;
				}
				
			}catch(Exception $e){
				$rs = '';
			}

			mysqli_close($conn);

			return $rs;
		}
		
		
		/**
		*	登録サイズがない場合に直近のサイズシリーズを返す
		*	@item_id		アイテムID
		*
		*	@return			サイズシリーズIDの配列
		*/
		public static function getSizeseries($item_id, $curdate=NULL){
			try{
				$conn = db_connect();
				
				if(empty($curdate)) $curdate = date('Y-m-d');
				
				$parm = 'select itemsizedate from itemsize where item_id=%d group by series order by itemsizedate desc, series ASC limit 1';
				$sql = sprintf($parm, $item_id);

				$result = exe_sql($conn, $sql);
				$rec = mysqli_fetch_array($result);
				if(empty($rec["itemsizedate"])) return;
				
				$parm = 'select series from itemsize where item_id=%d and itemsizedate="%s" group by series order by series ASC';
				$sql = sprintf($parm, $item_id, $rec["itemsizedate"]);

				$result = exe_sql($conn, $sql);
				while($rec = mysqli_fetch_array($result)){
					$rs[] = $rec['series'];
				}
				
			}catch(Exception $e){
				$rs = '';
			}

			mysqli_close($conn);

			return $rs;
		}
		
		
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
		
		
		/**
		*		マスターデータベースの操作
		*		@func		処理内容
		*		@param		引数の配列
		*		@mode		新規追加の際の処理を切替える
		*
		*		return		返り値
		*/
		public function db($func, $param, $mode=NULL){
			try{
				$conn = db_connect();
				
				switch($func){
				case 'insert':
					mysqli_query($conn, 'BEGIN');
					$result = $this->insert($conn, $param, $mode);
					if(!is_null($result)) mysqli_query($conn, 'COMMIT');
					break;
				case 'update':
					mysqli_query($conn, 'BEGIN');
					$result = $this->update($conn, $param, $mode);
					if(!is_null($result)) mysqli_query($conn, 'COMMIT');
					break;
				case 'delete':
					mysqli_query($conn, 'BEGIN');
					$result = $this->delete($conn, $param, $mode);
					if(!is_null($result)) mysqli_query($conn, 'COMMIT');
					break;

				}
			}catch(Exception $e){
				$result = null;
			}
			
			mysqli_close($conn);

			return $result;
		}
		
	
	/**--------------- private function -------------------------------------
	*
	* 	update			修正
	*	addnew			新規追加
	*
	*------------------------------------------------------------------------/
		
		/**
		*	レコードの修正更新
		*	@data		データの配列
		*				staff
		*				data [ , ...]
		*
		*				item
		*				data1 [category_id, item_id, item_code, item_name, printratio_id, printposition_id, maker_id, item_row, itemdate, curdate]
		*				data2 [0][item_id, size_from, size_to, price_0, price_1, price_maker_0, price_maker_1, itempricedate,
		* 					numbernopack, numberpack, size_lineup, printarea_1, printarea_2, printarea_3, printarea_4, printarea_5, printarea_6, printarea_7, (series)]
		*						(series)は複数あるアイテムの場合だけ、(seriesID)_(checked 0 or 1)
		*				data3 [0][master_id, color_code, color_id, size_series, catalogdate]
		* 				data5 [item_code, i_color_code, i_caption, i_description, i_material]
		*				curdate 抽出条件に使用する日付
		* 				dropping
		* 				data [ , ...]
		*	@mode		item:商品, staff:スタッフ, dropping:取扱中止
		*
		*	return		成功したらTRUE
		*/
		private function update($conn, $data, $mode){
			$res = true;
			try{
				switch($mode){
				case 'itemcolor':
					for($i=0; $i<count($data); $i++){
						foreach($data[$i] as $key=>$val){
							$info[$i][$key] = quote_smart($conn, $val);
						}
						$sql = sprintf("UPDATE itemcolor SET color_name='%s', inkjet_option=%d WHERE id=%d limit 1",
									   $info[$i]["color_name"],
									   $info[$i]["inkjet_option"],
									   $info[$i]["id"]
									  );
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn,'ROLLBACK');
							return null;
						}
					}
					break;

				case 'maker':
					for($i=0; $i<count($data); $i++){
						foreach($data[$i] as $key=>$val){
							$info[$i][$key] = quote_smart($conn, $val);
							
						}
						$sql = sprintf("UPDATE maker SET maker_name='%s' WHERE id=%d limit 1",
							 $info[$i]["maker_name"],
							 $info[$i]["maker_id"]
						);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn,'ROLLBACK');
							return null;
						}
					}
					break;

				case 'tag':
				  for($i=0; $i<count($data); $i++){
						foreach($data[$i] as $key=>$val){
							$info[$i][$key] = quote_smart($conn, $val);
						}
						$sql = sprintf("UPDATE tags SET 
							 tag_name='%s',tag_type=%d,tag_order=%d WHERE tagid=%d limit 1",
							 $info[$i]["tag_name"],
							 $info[$i]["tag_type"],
							 $info[$i]["tag_order"],
							 $info[$i]["tagid"]
						);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
					}
				break;
				
				case 'staff':
					for($i=0; $i<count($data); $i++){
						foreach($data[$i] as $key=>$val){
							$info[$i][$key] = quote_smart($conn, $val);
						}
						
						if(empty($info[$i]['staffdate'])){
							$drop = $this->def_dropping;
						}else{
							$drop = $info[$i]['staffdate'];
						}
						
						$sql = sprintf("UPDATE staff SET 
								 staffname='%s', rowid1=%d, rowid2=%d, rowid3=%d, rowid4=%d, rowid5=%d, rowid6=%d, staffdate='%s' 
								 WHERE id=%d limit 1",
								 $info[$i]["staffname"],
								 $info[$i]["rowid1"],
								 $info[$i]["rowid2"],
								 $info[$i]["rowid3"],
								 $info[$i]["rowid4"],
								 $info[$i]["rowid5"],
								 $info[$i]["rowid6"],
						 		 $drop,
						 		 $info[$i]['id']
						 	);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
					}
					break;
					
				case 'dropping':
					/*
					 * 取扱中止 
					 * 取扱開始が今日よりも前で且つ取扱中止が今日よりも後のデータが対象
					 */
					$sql = sprintf("UPDATE item SET itemdate='%s' WHERE id=%d and itemapply<'%s' and itemdate>'%s' order by itemdate limit 1", $data["droppingdate"], $data["item_id"], $data["curdate"], $data["curdate"]);
					if(!exe_sql($conn, $sql)){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					
					$sql = sprintf("update itemsize set itemsizedate='%s' where item_id=%d and itemsizeapply<'%s' and itemsizedate>'%s'", $data["droppingdate"], $data["item_id"], $data["curdate"], $data["curdate"]);
					if(!exe_sql($conn, $sql)){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					
					$sql = sprintf("update itemprice set itempricedate='%s' where item_id=%d and itempriceapply<'%s' and itempricedate>'%s'", $data["droppingdate"], $data["item_id"], $data["curdate"], $data["curdate"]);
					if(!exe_sql($conn, $sql)){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					
					$sql = sprintf("update catalog set catalogdate='%s' where item_id=%d and catalogapply<'%s' and catalogdate>'%s'", $data["droppingdate"], $data["item_id"], $data["curdate"], $data["curdate"]);
					if(!exe_sql($conn, $sql)){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					
					break;
					
				case 'item':
					list($data1, $data2, $data3, $data4, $data5, $data6, $curdate) = $data;

					foreach($data1 as $key=>$val){
						$info[$key] = quote_smart($conn, $val);
					}
					for($i=0; $i<count($data2); $i++){
						foreach($data2[$i] as $key=>$val){
							$info2[$i][$key] = quote_smart($conn, $val);
						}
					}
					for($i=0; $i<count($data3); $i++){
						foreach($data3[$i] as $key=>$val){
							$info3[$i][$key] = quote_smart($conn, $val);
						}
					}
					for($i=0; $i<count($data4); $i++){
						foreach($data4[$i] as $key=>$val){
							$info4[$i][$key] = quote_smart($conn, $val);
						}
					}
					foreach($data5 as $key=>$val){
						$info5[$key] = quote_smart($conn, $val);
					}

					for($i=0; $i<count($data6); $i++){
						foreach($data6[$i] as $key=>$val){
							$info6[$i][$key] = quote_smart($conn, $val);
						}
					}

					if(empty($info["id"]) || empty($info["category_id"])) return false;
					
					$item_id = $info["id"];
					$category_id = $info["category_id"];
					
					// 当該アイテムを取扱中止
					if($info["itemdate"]!=$this->def_dropping){
						$arrayName = array('droppingdate'=>$info["itemdate"], 'item_id'=>$item_id, 'curdate'=>$curdate);
						$result = $this->update($conn, $arrayName, "dropping");
						if(!$result){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						return true;
					}
					
					// item measure
					if(! empty($info4)){
						$sql = sprintf("delete from itemmeasure where item_code='%s'", $info4[0]["item_code"]);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						$len = count($info4);
						for($i=0; $i<$len; $i++){
							$sql = sprintf("insert into itemmeasure(itemmeasureid,item_code,size_id,measure_id,dimension) values(%d,'%s',%d,%d,'%s')", 
							0,$info4[$i]["item_code"],$info4[$i]["size_id"],$info4[$i]["measure_id"],$info4[$i]["dimension"]);
							if(!exe_sql($conn, $sql)){
								mysqli_query($conn, 'ROLLBACK');
								return null;
							}
						}
					}
					
					// item detail
					if(!$info5["itemdetailid"]){
						$sql = sprintf("insert into itemdetail(item_code,i_color_code,i_caption,i_description,i_material,i_silk,i_digit,i_inkjet,i_cutting,i_embroidery,i_note_label,i_note) values('%s','%s','%s','%s','%s',%d,%d,%d,%d,%d,'%s','%s')",
						$info5["item_code"], $info5["i_color_code"], $info5["i_caption"], $info5["i_description"], $info5["i_material"], 
						$info5["i_silk"], $info5["i_digit"], $info5["i_inkjet"], $info5["i_cutting"], $info5["i_embroidery"], $info5["i_note_label"], $info5["i_note"]);
					}else{
						$sql = sprintf("update itemdetail set item_code='%s', i_color_code='%s', i_caption='%s', i_description='%s', i_material='%s', i_silk=%d, i_digit=%d, i_inkjet=%d, i_cutting=%d, i_embroidery=%d, i_note_label='%s', i_note='%s' where itemdetailid=%d", 
						$info5["item_code"], $info5["i_color_code"], $info5["i_caption"], $info5["i_description"], $info5["i_material"], 
						$info5["i_silk"], $info5["i_digit"], $info5["i_inkjet"], $info5["i_cutting"], $info5["i_embroidery"], $info5["i_note_label"], $info5["i_note"], $info5["itemdetailid"]);
					}
					if(!exe_sql($conn, $sql)){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					
					// item
					$item_name = mb_convert_encoding($info["item_name"], 'euc-jp', 'utf-8');
					$item_name = mb_convert_encoding(mb_convert_kana($item_name,"KV"),'utf-8','euc-jp');
					$sql = sprintf("SELECT * FROM item where id=%d and itemapply<='%s' and itemdate>'%s'", $item_id, $curdate, $curdate);
					$result = exe_sql($conn, $sql);
					if(mysqli_num_rows($result)==0){
						return false;
					}
					$rec = mysqli_fetch_assoc($result);
					//item tag
					$sql = sprintf("delete from itemtag where tag_itemid=%d", $info6[0]["tag_itemid"]);
					if(!exe_sql($conn, $sql)){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					$len = count($info6);
					for($i=0; $i<$len; $i++){
						$sql = sprintf("insert into itemtag(tag_itemid,tag_id) values(%d,%d)", 
								$info6[$i]["tag_itemid"],
								$info6[$i]["tag_id"]);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
					}

					// 変更の有無をチェック
					$isChanged = false;	// 既存データを更新
					$isNew = false;		// 既存データを取扱中止にして新規登録
					foreach ($info as $key => $value) {
						if($key=="item_name"){
							if($rec[$key]!=$item_name) $isChanged = true;
						}else if($key=="printratio_id" || $key=="printposition_id"){
							if($rec[$key]!=$value){
								if($rec["itemapply"]!=$curdate){
									$isNew = true;
								}else{
									$isChanged = true;
								}
							}
						}else{
							if($rec[$key]!=$value) $isChanged = true;	
						}
					}
					
					if($isNew){
						// 変更前のアイテムIDを保持
						$oldItemId = $item_id;
						
						// addnew item
						$item_name = mb_convert_encoding($info["item_name"], 'euc-jp', 'utf-8');
						$item_name = mb_convert_encoding(mb_convert_kana($item_name,"KV"),'utf-8','euc-jp');
						$sql = sprintf("INSERT INTO item(item_code, item_name, printratio_id, printposition_id, maker_id, itemapply, item_row, opp, oz, lineup, show_site) 
							   VALUES('%s','%s',%d,%d,%d,'%s',%d,%d,'%s',%d,'%s')", 
							   $info["item_code"],
							   $item_name,
							   $info["printratio_id"],
							   $info['printposition_id'],
							   $info['maker_id'],
							   $curdate,
							   $info['item_row'],
							   $info['opp'],
							   $info['oz'],
							   $info['lineup'],
								 $info['show_site']
							   );
						if(exe_sql($conn, $sql)){
							$item_id = mysqli_insert_id($conn);
						}else{
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						// itemtagを更新
						$sql = sprintf("insert into itemtag(tag_itemid,tag_id) select %d as tag_itemid, tag_id from itemtag where tag_itemid=%d", $item_id, $oldItemId);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						// itemreviewを更新
						$sql = sprintf("select count(*) as cnt from itemreview where item_id=%d", $oldItemId);
						$result = exe_sql($conn, $sql);
						$rec = mysqli_fetch_array($result);
						if($rec['cnt']>0){
							$sql = sprintf("insert into itemreview(item_id,item_name,printkey,amount,review,vote,posted) 
								select %d as item_id,item_name,printkey,amount,review,vote,posted from itemreview where item_id=%d", $item_id, $oldItemId);
							if(!exe_sql($conn, $sql)){
								mysqli_query($conn, 'ROLLBACK');
								return null;
							}
						}
						
						// userreviewを更新
						$sql = sprintf("select count(*) as cnt from userreview where item_id=%d", $oldItemId);
						$result = exe_sql($conn, $sql);
						$rec = mysqli_fetch_array($result);
						if($rec['cnt']>0){
							$sql = sprintf("insert into userreview(item_id,item_name,printkey,amount,reason,impression,staff_comment,vote_1,vote_2,vote_3,vote_4,posted) 
								select %d as item_id,item_name,printkey,amount,reason,impression,staff_comment,vote_1,vote_2,vote_3,vote_4,posted from userreview where item_id=%d", $item_id, $oldItemId);
							if(!exe_sql($conn, $sql)){
								mysqli_query($conn, 'ROLLBACK');
								return null;
							}
						}
						
						// copy itemsize
						$q = "insert into itemsize";
						$q .= "(series,item_id,size_from,size_to,numbernopack,numberpack,printarea_1,printarea_2,printarea_3,printarea_4,printarea_5,printarea_6,printarea_7,itemsizeapply) ";
						$q .= "select series, %d as item_id,size_from,size_to,numbernopack,numberpack,printarea_1,printarea_2,printarea_3,printarea_4,printarea_5,printarea_6,printarea_7, '%s' as itemsizeapply ";
						$q .= "from itemsize where item_id=%d and itemsizeapply<='%s' and itemsizedate>'%s'";
						$sql = sprintf($q, $item_id, $curdate, $oldItemId, $curdate, $curdate);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						// copy itemprice
						$q = "INSERT INTO itemprice";
						$q .= "(item_id, size_from, size_to, price_0, price_1, price_maker_0, price_maker_1, margin_pvt, itempriceapply) ";
						$q .= "select %d as item_id, size_from, size_to, price_0, price_1, price_maker_0, price_maker_1, margin_pvt, '%s' as itempriceapply ";
						$q .= "from itemprice where item_id=%d and itempriceapply<='%s' and itempricedate>'%s'";
						$sql = sprintf($q, $item_id, $curdate, $oldItemId, $curdate, $curdate);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						// copy catalog
						$q = "INSERT INTO catalog(category_id, item_id, color_id, color_code, size_series, color_lineup, catalogapply) ";
						$q .= "select category_id, %d as item_id, color_id, color_code, size_series, color_lineup, '%s' as catalogapply ";
						$q .= "from catalog where item_id=%d and catalogapply<='%s' and catalogdate>'%s'";
						$sql = sprintf($q, $item_id, $curdate, $oldItemId, $curdate, $curdate);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						// 変更前のアイテムを取扱中止
						$arrayName = array('droppingdate'=>$curdate, 'item_id'=>$oldItemId, 'curdate'=>$curdate);
						$result = $this->update($conn, $arrayName, "dropping");
						if(!$result){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						// サイズパターンが複数あるケース
						/*
						if(isset($info2[0]['series'])){
							$series = array();
							$arg = explode(',', $info2[0]['series']);
							for($a=0; $a<count($arg); $a++){
								list($series, $id, $chk) = explode(':', $arg[$a]);
								if($chk==1){
									$series[] = $info2[$a];
									$data3[$a]["size_series"] = 2;
								}else{
									$data3[$a]["size_series"] = 1;
								}
							}
						}else {
							for ($i=0; $i < count($data3); $i++) { 
								$data3[$i]["size_series"] = 1;
							}
						}
						 */
						// 新規追加
						/*
						$arrayName = array($data1, $data2, $series, $data3, $curdate);
						$result = $this->insert($arrayName, "item");
						if(!$result){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						return true;
						*/
					}else if($isChanged){
						$sql = sprintf("UPDATE item 
							   SET item_name='%s', item_code='%s', printratio_id=%d, printposition_id=%d, maker_id=%d, item_row=%d, itemdate='%s', lineup=%d, opp=%d, oz='%s', show_site='%s'  
							   WHERE id=%d and itemapply<='%s' and itemdate>'%s' order by itemdate limit 1",
							   $item_name, $info["item_code"], $info["printratio_id"], $info["printposition_id"], $info["maker_id"],
							   $info["item_row"], $info["itemdate"], $info["lineup"], $info['opp'], $info['oz'], 
								 //showsite
								 $info['show_site'],
								 $item_id, $curdate, $curdate);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
					}
					
					// itemprice, itemsize
					for($i=0; $i<count($info2); $i++){
						
						if($info2[$i]["price_id"]==0){
							// 全サイズ対応のサイズシリーズIDを取得
							$sql = sprintf("select * from itemsize where item_id=%d and itemsizeapply<='%s' and itemsizedate>'%s' order by series limit 1",
								 $item_id, $curdate, $curdate);
							$result = exe_sql($conn, $sql);
							$tmp = array();
							while($rec = mysqli_fetch_array($result)){
								$tmp[] = $rec;
							}
							
							$sql = sprintf("insert into itemsize (series,item_id,size_from,size_to,numbernopack,numberpack,printarea_1,printarea_2,printarea_3,printarea_4,printarea_5,printarea_6,printarea_7,itemsizeapply) 
									 values(%d,%d,%d,%d,%d,%d,'%s','%s','%s','%s','%s','%s','%s','%s')", 
									 $tmp[0]['series'], $item_id, $info2[$i]["size_id"], $info2[$i]["size_id"], $info2[$i]["numbernopack"], $info2[$i]["numberpack"], 
										   $info2[$i]["printarea_1"], $info2[$i]["printarea_2"], $info2[$i]["printarea_3"], $info2[$i]["printarea_4"], $info2[$i]["printarea_5"], $info2[$i]["printarea_6"], $info2[$i]["printarea_7"], $curdate);
							if(!exe_sql($conn, $sql)){
								mysqli_query($conn, 'ROLLBACK');
								return null;
							}
							
							$margin = $this->getMargin($category_id, $curdate);
							$sql = sprintf("INSERT INTO itemprice(item_id, size_from, size_to, price_0, price_1, price_maker_0, price_maker_1, margin_pvt, itempriceapply) 
									 VALUES(%d,%d,%d,%d,%d,%d,%d,%.1f,'%s')", 
									 $item_id,
									 $info2[$i]["size_id"],
									 $info2[$i]['size_id'],
									 $info2[$i]['price_0'],
									 $info2[$i]['price_1'],
									 $info2[$i]['price_maker_0'],
									 $info2[$i]['price_maker_1'],
									 $margin,
									 $curdate);
							
						}else{

							$sql = sprintf("select count(*) as recordCount from itemprice where item_id=%d and itempriceapply>='%s' and size_from=%d", 
										   $item_id, $info2[$i]['itempricedate'], $info2[$i]["size_id"]);
							$result = exe_sql($conn, $sql);
							$rec = mysqli_fetch_array($result);
							if ( ($info2[$i]['itempricedate'] == $this->def_dropping) || empty($rec['recordCount']) ) {
								$sql = "update itemsize set numbernopack=%d, numberpack=%d, itemsizedate='%s', size_lineup=%d, ";
								$sql .= "printarea_1='%s', printarea_2='%s', printarea_3='%s', printarea_4='%s', printarea_5='%s', printarea_6='%s', printarea_7='%s' ";
								$sql .= "where itemsizeapply<='%s' and itemsizedate>'%s' and item_id=%d and size_from=%d";
								$sql = sprintf($sql, $info2[$i]["numbernopack"], $info2[$i]["numberpack"], $info2[$i]['itempricedate'], $info2[$i]['size_lineup'], 
											   $info2[$i]["printarea_1"], $info2[$i]["printarea_2"], $info2[$i]["printarea_3"], 
											   $info2[$i]["printarea_4"], $info2[$i]["printarea_5"], $info2[$i]["printarea_6"], $info2[$i]["printarea_7"], 
								$curdate, $curdate, $item_id, $info2[$i]["size_id"]);
								if(!exe_sql($conn, $sql)){
									mysqli_query($conn, 'ROLLBACK');
									return null;
								}
							}
							
							$sql = sprintf("select * from itemprice where id=%d", $info2[$i]["price_id"]);
							$result = exe_sql($conn, $sql);
							$rec = mysqli_fetch_array($result);
							if($isNew){
								if(	$rec["price_0"]!=$info2[$i]["price_0"] || $rec["price_1"]!=$info2[$i]["price_1"] || 
									$rec["price_maker_0"]!=$info2[$i]["price_maker_0"] || $rec["price_maker_1"]!=$info2[$i]["price_maker_1"]
								){
									$sql = sprintf("UPDATE itemprice SET 
										 price_0=%d, price_1=%d, price_maker_0=%d, price_maker_1=%d, itempricedate='%s', size_lineup=%d
										 WHERE item_id=%d and size_from=%d limit 1",
										 $info2[$i]["price_0"],
										 $info2[$i]["price_1"],
										 $info2[$i]["price_maker_0"],
										 $info2[$i]["price_maker_1"],
										 $info2[$i]['itempricedate'],
										 $info2[$i]['size_lineup'],
										 $item_id, $info2[$i]["size_id"]
									);
								}
							}else{
								if(	$info2[$i]["itempricedate"]==$this->def_dropping && $rec["itempriceapply"]!=$curdate && 
									($rec["price_0"]!=$info2[$i]["price_0"] || $rec["price_1"]!=$info2[$i]["price_1"] || 
									$rec["price_maker_0"]!=$info2[$i]["price_maker_0"] || $rec["price_maker_1"]!=$info2[$i]["price_maker_1"])
								){
									$sql = sprintf("UPDATE itemprice SET itempricedate='%s' WHERE id=%d",
										 $curdate, $info2[$i]["price_id"]);
									if(!exe_sql($conn, $sql)){
										mysqli_query($conn, 'ROLLBACK');
										return null;
									}

									$margin = $this->getMargin($category_id, $curdate);
									$sql = sprintf("INSERT INTO itemprice(item_id, size_from, size_to, price_0, price_1, price_maker_0, price_maker_1, size_lineup, margin_pvt, itempriceapply) 
										 VALUES(%d,%d,%d,%d,%d,%d,%d,%d,$.1f,'%s')", 
										 $item_id,
										 $info2[$i]["size_id"],
										 $info2[$i]['size_id'],
										 $info2[$i]['price_0'],
										 $info2[$i]['price_1'],
										 $info2[$i]['price_maker_0'],
										 $info2[$i]['price_maker_1'],
										 $info2[$i]['size_lineup'],
										 $margin,
										 $curdate);
								}else{
									$sql = sprintf("UPDATE itemprice SET 
										 price_0=%d, price_1=%d, price_maker_0=%d, price_maker_1=%d, itempricedate='%s', size_lineup=%d
										 WHERE id=%d limit 1",
										 $info2[$i]["price_0"],
										 $info2[$i]["price_1"],
										 $info2[$i]["price_maker_0"],
										 $info2[$i]["price_maker_1"],
										 $info2[$i]['itempricedate'],
										 $info2[$i]['size_lineup'],
										 $info2[$i]["price_id"]
									);
								}
							}
						}
						
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						// カラーによってサイズに制限があるアイテム
						if(isset($info2[$i]['series'])){
							$arg = explode(',', $info2[$i]['series']);
							for($a=0; $a<count($arg); $a++){
								list($series, $size_id, $chk) = explode(':', $arg[$a]);
								
								if($size_id!=0 && $chk==0){			// 制限があるカラーのサイズ展開から外す
									$sql = sprintf("UPDATE itemsize SET itemsizedate='%s' where item_id=%d and size_from=%d limit 1", $curdate, $item_id, $info2[$i]["size_id"]);
									if(!exe_sql($conn, $sql)){
										mysqli_query($conn, 'ROLLBACK');
										return null;
									}
								}else if($size_id==0 && $chk==1){	// 制限があるカラーのサイズ展開を増やす
									$sql = sprintf("select id from itemsize 
										 where item_id=%d and series=%d and size_from=%d and itemsizeapply<='%s' and itemsizedate>'%s' order by itemsizedate limit 1",
										 $item_id, $series, $info2[$i]["size_id"], $curdate, $curdate);
									$result = exe_sql($conn, $sql);
									if(mysqli_num_rows($result)==0){
									// 新規追加
										$sql = sprintf("insert into itemsize (series,item_id,size_from,size_to,numbernopack,numberpack,printarea_1,printarea_2,printarea_3,printarea_4,printarea_5,printarea_6,printarea_7,itemsizeapply) 
										 values(%d,%d,%d,%d,%d,%d,'%s','%s','%s','%s','%s','%s','%s','%s')", 
										 $series, $item_id, $info2[$i]["size_id"], $info2[$i]["size_id"], $info2[$i]["numbernopack"], $info2[$i]["numberpack"], 
													   $info2[$i]["printarea_1"], $info2[$i]["printarea_2"], $info2[$i]["printarea_3"], $info2[$i]["printarea_4"], 
													   $info2[$i]["printarea_5"], $info2[$i]["printarea_6"], $info2[$i]["printarea_7"], $curdate);
									}
									if(!exe_sql($conn, $sql)){
										mysqli_query($conn, 'ROLLBACK');
										return null;
									}
								}
							}
						}
					}
					
					// catalog
					for($i=0; $i<count($info3); $i++){
						if($info3[$i]["master_id"]==0){
							$sql = sprintf("select category_id from catalog where item_id=%d and catalogapply<='%s' and catalogdate>'%s' limit 1",
								 $item_id, $curdate, $curdate);
							$result = exe_sql($conn, $sql);
							$tmp = mysqli_fetch_array($result);
							if($tmp){
								$sql = sprintf("INSERT INTO catalog(category_id, item_id, color_id, color_code, size_series, catalogapply) 
									 VALUES(%d,%d,%d,'%s',%d,'%s')", 
									 $tmp['category_id'],
									 $item_id,
									 $info3[$i]["color_id"],
									 $info3[$i]["color_code"],
									 $info3[$i]["size_series"],
									 $curdate);
								if(!exe_sql($conn, $sql)){
									mysqli_query($conn, 'ROLLBACK');
									return null;
								}
							}
						}else{
							$sql = sprintf("select * from catalog where id=%d", $info3[$i]['master_id']);
							$result = exe_sql($conn, $sql);
							$rec = mysqli_fetch_array($result);
							if($isNew){
								if( $rec["size_series"]!=$info3[$i]["size_series"] ){
									$sql = sprintf("UPDATE catalog SET 
										 color_id=%d, color_code='%s', size_series=%d, catalogdate='%s', color_lineup=%d
										 WHERE item_id=%d and color_id=%d limit 1",
										 $info3[$i]["color_id"],
										 $info3[$i]["color_code"],
										 $info3[$i]["size_series"],
										 $info3[$i]["catalogdate"],
										 $info3[$i]["color_lineup"],
										 $item_id, $info3[$i]["color_id"]
									);
								}
							}else{
								if($info3[$i]["catalogdate"]==$this->def_dropping && $rec["size_series"]!=$info3[$i]["size_series"] && $rec["catalogapply"]!=$curdate){
									$sql = sprintf("UPDATE catalog SET catalogdate='%s' WHERE id=%d",
										$curdate, $info3[$i]['master_id']);
									if(!exe_sql($conn, $sql)){
										mysqli_query($conn, 'ROLLBACK');
										return null;
									}
									$sql = sprintf("INSERT INTO catalog(category_id, item_id, color_id, color_code, size_series, catalogapply) 
										 VALUES(%d,%d,%d,'%s',%d,'%s')", 
										 $rec['category_id'],
										 $item_id,
										 $info3[$i]["color_id"],
										 $info3[$i]["color_code"],
										 $info3[$i]["size_series"],
										 $curdate
									);
								}else{
									$sql = sprintf("UPDATE catalog SET 
										 color_id=%d, color_code='%s', size_series=%d, catalogdate='%s', color_lineup=%d
										 WHERE id=%d limit 1",
										 $info3[$i]["color_id"],
										 $info3[$i]["color_code"],
										 $info3[$i]["size_series"],
										 $info3[$i]["catalogdate"],
										 $info3[$i]["color_lineup"],
										 $info3[$i]['master_id']
									);
								}
								if(!exe_sql($conn, $sql)){
									mysqli_query($conn, 'ROLLBACK');
									return null;
								}
							}
						}
					}
					
					break;
				}
				
				$res = true;
				
			}catch(Exception $e){
				mysqli_query($conn, 'ROLLBACK');
				$res = null;
			}

			return $res;
		}
		
		
		
		/**
		*	レコードの新規追加
		*	@data	データの配列
		*			カラー名の追加
		*			data1 [color_name]
		*
		*			スタッフ
		*			data1 [staff_name, 担当する作業のフィールド名, ...]
		*			curdate 登録する日付
		*
		*			商品の追加
		*			data1 [category_id, item_code, item_name, ratio_id, pp_id, maker_id, item_row, curdate]
		*			data2 [0][size_id, price_0, price_1, price_maker_0, price_maker_1, numbernopack, numberpack]
		*			data3 [0][size_id, price_0, price_1, price_maker_0, price_maker_1]
		*			data4 [0][color_code, color_id, size_series]
		*			curdate 抽出条件に使用する日付
		*				（data3はサイズ制限がある商品だけ）
		*
		*	@mode	item:新商品, staff:スタッフ, itemcolor:カラー名
		*
		*	return	成功したらTRUE
		*/
		private function insert($conn, $data, $mode){
			try{
				switch($mode){
				case 'itemcolor':
					foreach($data as $key=>$val){
						$info[$key] = quote_smart($conn, $val);
					}
					$color_name = mb_convert_encoding($info["color_name"], 'euc-jp', 'utf-8');
					$color_name = mb_convert_encoding(mb_convert_kana($color_name,"KV"),'utf-8','euc-jp');
										
					$sql = sprintf("SELECT id FROM itemcolor where color_name='%s'", $color_name);
					$result = exe_sql($conn, $sql);
					if(mysqli_num_rows($result)>0){
						return true;
					}
					
					$sql = sprintf("INSERT INTO itemcolor(color_name, inkjet_option) VALUES('%s', %d)", $color_name, $info['inkjet_option']);
					if(!exe_sql($conn, $sql)){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					
					$res = true;
					break;

				 case 'maker':
					foreach($data as $key=>$val){
						$info[$key] = quote_smart($conn,$val);
					}
					$maker_name = mb_convert_encoding($info["maker_name"], 'euc-jp', 'utf-8');
					$maker_name = mb_convert_encoding(mb_convert_kana($maker_name,"KV"),'utf-8','euc-jp');
					$sql = sprintf("SELECT id FROM maker where maker_name='%s'", $maker_name);
					$result = exe_sql($conn, $sql);
					if(mysqli_num_rows($result)>0){
						$res = 2;
						break;
					}
					
					$sql = sprintf("INSERT INTO maker(maker_name) VALUES('%s')", $maker_name);
					if(!exe_sql($conn, $sql)){
						mysqli_query('ROLLBACK');
						return null;
					}
					$res = true;
					break;

			  	case 'tag':
					foreach($data as $key=>$val){
						$info[$key] = quote_smart($conn, $val);
					}
					$tag_name = mb_convert_encoding($info["tag_name"], 'euc-jp', 'utf-8');
					$tag_name = mb_convert_encoding(mb_convert_kana($tag_name,"KV"),'utf-8','euc-jp');
					$sql = sprintf("SELECT tagid FROM tags where tag_name='%s' and tag_type=%d", $tag_name, $info["tag_type"]);
					$result = exe_sql($conn, $sql);
					if(mysqli_num_rows($result)>0){
					$res = 2;	
					break;
					}
					
					$sql = sprintf("INSERT INTO tags (tag_name,tag_type,tag_order) VALUES('%s',%d,%d)",$tag_name,$info["tag_type"],$info["tag_order"]);
					if(!exe_sql($conn, $sql)){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					$res = true;
					break;

				case 'staff':
					list($data1, $curdate) = $data;
					$q = array();
					foreach($data1 as $key=>$val){
						$info[$key] = quote_smart($conn, $val);
						if($key!='staffname'){
							$n = quote_smart($conn, $key);
							$q[] = 'max('.$n.')+1 as '.$n;
						}
					}
					$q = implode(',', $q);
					$staff_name = mb_convert_encoding($info["staffname"], 'euc-jp', 'utf-8');
					$staff_name = mb_convert_encoding(mb_convert_kana($staff_name,"KV"),'utf-8','euc-jp');
					
					$sql = sprintf("SELECT max(rowid)+1 as rowid, %s FROM staff where staffapply<='%s' and staffdate>'%s'", $q, $curdate, $curdate);
					$result = exe_sql($conn, $sql);
					if(mysqli_num_rows($result)==0){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}else{
						$rec = mysqli_fetch_assoc($result);
					}
					
					$query = "INSERT INTO staff(staffname,staffapply";
					foreach($rec as $fld=>$dat){
						$query .= ','.$fld;
						$ins[] = $dat;
					}
					$query .= ") VALUES('%s','%s',".implode(',', $ins).")";
					$sql = sprintf($query, $staff_name, $curdate);
					
					if(!exe_sql($conn, $sql)){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					
					$res = true;
					
					break;
					
				case 'sizeseries':
					list($sizeid, $item_id, $curdate) = $data;
					$res = exe_sql($conn, "SELECT max(series)+1 as latest FROM itemsize");
					$size = mysqli_fetch_assoc($res);
					$series_id = $size['latest'];
					
					$sql = sprintf("SELECT * FROM itemsize where itemsizeapply<='%s' and itemsizedate>'%s' and item_id=%d", $curdate, $curdate, $item_id);
					$res = exe_sql($conn, $sql);
					if(!$res){
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					while($rec = mysqli_fetch_array($result)){
						$tmp[$rec['size_from']] = $rec;
					}
					
					for($i=0; $i<count($sizeid); $i++){
						$sql = sprintf("INSERT INTO itemsize(series, item_id, size_from, size_to, numbernopack, numberpack, itemsizeapply) 
								 VALUES(%d,%d,%d,%d,%d,%d,'%s')", 
								 $series_id,
								 $item_id,
								 $sizeid[$i],
								 $sizeid[$i],
								 $tmp[$sizeid[$i]]['numbernopack'],
								 $tmp[$sizeid[$i]]['numberpack'],
								 $curdate);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
					}
					
					$res = true;
					
					break;
					
				case 'item':
					list($data1, $data2, $data3, $data4, $curdate) = $data;
					foreach($data1 as $key=>$val){
						$info[$key] = quote_smart($conn, $val);
					}
					for($i=0; $i<count($data2); $i++){
						foreach($data2[$i] as $key=>$val){
							$info2[$i][$key] = quote_smart($conn, $val);
						}
					}
					for($i=0; $i<count($data3); $i++){
						foreach($data3[$i] as $key=>$val){
							$info3[$i][$key] = quote_smart($conn, $val);
						}
					}
					for($i=0; $i<count($data4); $i++){
						foreach($data4[$i] as $key=>$val){
							$info4[$i][$key] = quote_smart($conn, $val);
						}
					}
					
					//商品登録の基本情報										
					$category_id = $info["category_id"];
					$item_name = mb_convert_encoding($info["item_name"], 'euc-jp', 'utf-8');
					$item_name = mb_convert_encoding(mb_convert_kana($item_name,"KV"),'utf-8','euc-jp');
					$sql = sprintf("INSERT INTO item(item_code, item_name, printratio_id, printposition_id, maker_id, itemapply, item_row, opp, oz, lineup, show_site) 
						   VALUES('%s','%s',%d,%d,%d,'%s',%d,%d,'%s',%d,'%s')", 
						   $info["item_code"],
						   $item_name,
						   $info["printratio_id"],
						   $info['printposition_id'],
						   $info['maker_id'],
						   $curdate,
						   $info['item_row'],
						   $info['opp'],
						   $info['oz'],
						   $info['lineup'],
							 $info['show_site']
						   );
					if(exe_sql($conn, $sql)){
						$item_id = mysqli_insert_id($conn);
					}else{
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}
					
					$res = exe_sql($conn, "SELECT series FROM itemsize order by series desc limit 1");
					$size = mysqli_fetch_array($res);
					$series_id = $size['series']+1;
					$series = array(0,$series_id,0);
					
					for($i=0; $i<count($info2); $i++){
						$sql = sprintf("INSERT INTO itemsize(series, item_id, size_from, size_to, numbernopack, numberpack, itemsizeapply) 
								 VALUES(%d,%d,%d,%d,%d,%d,'%s')", 
								 $series_id,
								 $item_id,
								 $info2[$i]["size_id"],
								 $info2[$i]['size_id'],
								 $info2[$i]['numbernopack'],
								 $info2[$i]['numberpack'],
								 $curdate);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						$margin = $this->getMargin($category_id, $curdate);
						$sql = sprintf("INSERT INTO itemprice(item_id, size_from, size_to, price_0, price_1, price_maker_0, price_maker_1, margin_pvt, itempriceapply) 
								VALUES(%d,%d,%d,%d,%d,%d,%d,%.1f'%s')", 
								$item_id,
								$info2[$i]["size_id"],
								$info2[$i]['size_id'],
								$info2[$i]['price_0'],
								$info2[$i]['price_1'],
								$info2[$i]['price_maker_0'],
								$info2[$i]['price_maker_1'],
								$margin,
								$curdate);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
					}
					
					if(!empty($info3)){
						$series_id++;
						for($i=0; $i<count($info3); $i++){
							$sql = sprintf("INSERT INTO itemsize(series, item_id, size_from, size_to, numbernopack, numberpack, itemsizeapply) 
									 VALUES(%d,%d,%d,%d,%d,%d,'%s')", 
									 $series_id,
									 $item_id,
									 $info3[$i]["size_id"],
									 $info3[$i]['size_id'],
									 $info3[$i]['numbernopack'],
								 	 $info3[$i]['numberpack'],
									 $curdate);
							if(!exe_sql($conn, $sql)){
								mysqli_query($conn, 'ROLLBACK');
								return null;
							}
						}
						$series[2] = $series_id;
					}
					
					// カラー未定[000]を登録
					if(count($info4)>0){
						$size_series = $series[$info4[0]['size_series']];
						if($size_series==0) return null;
						$sql = sprintf("INSERT INTO catalog(category_id, item_id, color_id, color_code, size_series, catalogapply) 
							 VALUES(%d,%d,%d,'%s',%d,'%s')", 
							 $category_id,
							 $item_id,
							 0,
							 "000",
							 $size_series,
							 $curdate);
					
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
					}
					
					// カタログに全カラーを登録
					for($i=0; $i<count($info4); $i++){
						$size_series = $series[$info4[$i]['size_series']];
						if($size_series==0) continue;
						$sql = sprintf("INSERT INTO catalog(category_id, item_id, color_id, color_code, size_series, catalogapply) 
							 VALUES(%d,%d,%d,'%s',%d,'%s')", 
							 $category_id,
							 $item_id,
							 $info4[$i]["color_id"],
							 $info4[$i]["color_code"],
							 $size_series,
							 $curdate);
					
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
					}
					
					$res = true;
					break;
					
				//商品登録ーエクセルから登録する場合
				case 'itemAuto':
					list($data1, $data2, $data4, $data6, $curdate) = $data;

					foreach($data1 as $key=>$val){
						$info[$key] = quote_smart($conn, $val);
					}

					for($i=0; $i<count($data2); $i++){
						foreach($data2[$i] as $key=>$val){
							$info2[$i][$key] = quote_smart($conn, $val);
						}
					}

					for($i=0; $i<count($data4); $i++){
						foreach($data4[$i] as $key=>$val){
							$info4[$i][$key] = quote_smart($conn, $val);
						}
					}
					for($i=0; $i<count($data6); $i++){
						foreach($data6[$i] as $key=>$val){
							$info6[$i][$key] = quote_smart($conn, $val);
						}
					}

					//基本情報	

					$category_id = $info["category_id"];
					$item_name = $info["item_name"];
					$item_name = mb_convert_encoding($item_name, 'euc-jp', 'utf-8');
					$item_name = mb_convert_encoding(mb_convert_kana($item_name,"KV"),'utf-8','euc-jp');
					$sql = sprintf("INSERT INTO item(item_code, item_name, printratio_id, printposition_id, maker_id, itemapply, item_row, lineup) 
						   VALUES('%s','%s',%d,%d,%d,'%s',%d,%d)", $info["item_code"], $item_name,1,1,$info['maker_id'],$curdate,0,0);
					if(exe_sql($conn, $sql)){
						$item_id = mysqli_insert_id($conn);
					}else{
						mysqli_query($conn, 'ROLLBACK');
						return null;
					}


					
					$res = exe_sql($conn, "SELECT series FROM itemsize order by series desc limit 1");
					$size = mysqli_fetch_array($res);
					$series_id = $size['series']+1;
					$series = array(0,$series_id,0);
					
					for($i=0; $i<count($info2); $i++){
						//サイズ
						$sql = sprintf("INSERT INTO itemsize(series, item_id, size_from, size_to, itemsizeapply) 
								 VALUES(%d,%d,%d,%d,'%s')", 
								 $series_id,
								 $item_id,
								 $info2[$i]['size_id'],
								 $info2[$i]['size_id'],
								 $curdate);
						if(exe_sql($conn, $sql)){
							$stock_size_id[i] = mysqli_insert_id($conn);
						}else{
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						
						//価格
						$margin = $this->getMargin($category_id, $curdate);
						$sql = sprintf("INSERT INTO itemprice(item_id, size_from, size_to, price_0, price_1, price_maker_0, price_maker_1, margin_pvt, itempriceapply) 
								 VALUES(%d,%d,%d,%d,%d,%d,%d,%.1f,'%s')", 
								 $item_id,
								 $info2[$i]['size_id'],
								 $info2[$i]['size_id'],
								 $info2[$i]['price_0'],
								 $info2[$i]['price_1'],
								 $info2[$i]['price_maker_0'],
								 $info2[$i]['price_maker_1'],
								 $margin,
								 $curdate);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
					}

					// カタログに全カラーを登録
					for($i=0; $i<count($info4); $i++){
						$size_series = $series_id;
						$sql = sprintf("INSERT INTO catalog(category_id, item_id, color_id, color_code, size_series, catalogapply) 
							 VALUES(%d,%d,%d,'%s',%d,'%s')", 
							 $category_id,
							 $item_id,
							 $info4[$i]['color_id'],
							 $info4[$i]['color_code'],
							 $size_series,
							 $curdate);
						if(exe_sql($conn, $sql)){
							$stock_master_id_arr[$i] = mysqli_insert_id($conn);
							$color_code_arr[$i] = $info4[$i]['color_code'];
						}else{
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
					}
				//Janコード登録
					for($i=0; $i<count($info6); $i++){
						$size_id = $info6[$i]['size_id'];
						for($j=0; $j<(count($info6[$i])-1); $j++){
							$color_code_tmp = $color_code_arr[$j];
							$stock_updated=date('Y-m-d H:i:s');
							$sql = sprintf("INSERT INTO itemstock(stock_master_id, stock_item_id, stock_size_id, stock_maker, jan_code, stock_updated) 
								 VALUES(%d,%d,%d,%d,'%s','%s')", 
								 $stock_master_id_arr[$j],
								 $item_id,
								 $size_id,
							   $info['maker_id'],
								 $info6[$i][$color_code_tmp],
   							 $stock_updated);
							if(!exe_sql($conn, $sql)){
								mysqli_query($conn, 'ROLLBACK');
								return null;
							}
						}
					}

					$res = true;
					break;

				default:
					$res = null;
				}
				
			}catch(Exception $e){
				$res = null;
			}
			return $res;
		}

		private function delete($conn, $data, $mode){
			try{
					switch($mode){
					case 'item':
						foreach($data as $key=>$val){
							$info[$key] = quote_smart($conn, $val);
						}
					  $item_id = $info['item_id'] ;
						//delete form table 'item'
					  $sql = sprintf(" DELETE FROM item WHERE id =%d ",$item_id);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						//delete form table 'itemprice'
					  $sql = sprintf(" DELETE FROM itemprice WHERE item_id =%d ",$item_id);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}

						//delete form table 'itemsize'
					  $sql = sprintf(" DELETE FROM itemsize WHERE item_id =%d ",$item_id);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}

						//delete form table 'itemtag'
					  $sql = sprintf(" DELETE FROM itemtag WHERE tag_itemid =%d ",$item_id);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}

						//delete form table 'itemstock'
					  $sql = sprintf(" DELETE FROM itemstock WHERE stock_item_id =%d ",$item_id);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}

						//delete form table 'catalog'
					  $sql = sprintf(" DELETE FROM catalog WHERE item_id =%d ",$item_id);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						$res = true;
						break;

					case 'maker':
						foreach($data as $key=>$val){
							$info[$key] = quote_smart($conn, $val);
						}
					  $maker_id = $info['maker_id'] ;
					  $sql = sprintf(" DELETE FROM `maker` WHERE id =%d ",$maker_id);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						$res = true;
						break;

					case 'tag':
						foreach($data as $key=>$val){
							$info[$key] = quote_smart($conn, $val);
						}
					  $tagid = $info['tagid'] ;
					  $sql = sprintf(" DELETE FROM tags WHERE tagid =%d ",$tagid);
						if(!exe_sql($conn, $sql)){
							mysqli_query($conn, 'ROLLBACK');
							return null;
						}
						$res = true;
						break;

					default:
						$res = null;
					}
			}catch(Exception $e){
				$res = null;
			}
			return $res;
		}

		/**
		 * 一般向け商品単価の掛け率を返す
		 *
		 * @param  float  $category_id
		 * @param  string  $curdate
		 * @return float
		 */
		private function getMargin($category_id, $curdate)
		{
			// 2021-01-28 から掛け率2.0を適用
			if (strtotime($curdate) >= strtotime(_APPLY_EXTRA_MARGIN)){
				// Tシャツとスウェットは2.0、その他は1.8
				$margin = ($category_id == 1 || $category_id == 2) ? 2.0 : 1.8;
			}else{
				$margin = 1.8;
			}

			return $margin;
		}
	}

?>