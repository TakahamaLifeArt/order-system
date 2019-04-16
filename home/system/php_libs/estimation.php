<?php
// �����ϥޥ�ե�����
// ���Ѥ�׻�
// charset euc-jp
	require_once dirname(__FILE__).'/http.php';
	require_once dirname(__FILE__).'/catalog.php';
	require_once dirname(__FILE__).'/estimate.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/package/holiday/DateJa.php';
	use package\holiday\DateJa;
	
	if(isset($_POST['act'])){
		switch($_POST['act']){
			case 'itemcost':
					$catalog = new Catalog();
					$res = $catalog->getItemPrice($_POST['item_id'], $_POST['size_id'], $_POST['points']);
					break;
					
			case 'baseprintfee':
			/*
			 * ����ǻ��Ѥ����Ǹ��ξ�����θ��Ѿ���
			 * 2017-05-25 �ѻ�
			 */
					$estimate = new Estimate();
					$print_fee = $estimate->getEstimation($_POST['orders_id']);
					$json = new Services_JSON();
					$res = $json->encode(array($print_fee));
					header("Content-Type: text/javascript; charset=utf-8");
					break;
			
			case 'printfee2':
			/*
			 * �ץ�����׻��λ����ѹ���ν���
			 * 2017-05-25��ȯ������Ƚ�ǡ�
			 */
			try{
				$json = new Services_JSON(SERVICES_JSON_LOOSE_TYPE);
				$args = $json->decode($_POST['args']);
//				$estimate = new Estimate($_POST['curdate']);
				$http = new HTTP(_API);
				
				$print_fee = array('tot'=>0,'silk'=>0,'trans'=>0,'darktrans'=>0,'digit'=>0,'inkjet'=>0,'darkinkjet'=>0,'cutting'=>0,'embroidery'=>0);
				//param[print_type][pos_name][sect][grp] = {'ids':{}, 'vol':0, 'ink':0, 'size':0, 'opt':0, 'repeat',{}};
				
				foreach ($args as $printMethod=>$param) {			// �ץ�����ˡ
					foreach ($param as $posName=>$sect) {			// �ץ��Ȳս�
						foreach ($sect as $design=>$group) {		// �ǥ�����ʥ��󥯿����Ǽ��ࡢ���ץ������̡�
							$plateCharge = array();					// ���륯Ʊ��ʬ��ڤӥǥ�ž�Ȼɽ������彸����
							foreach ($group as $rangeId=>$val) {	// ������ʬ��
								// printmethod��ɬ��
								$resp = $http->request('POST', array('act'=>'printfee', 'printmethod'=>$printMethod, 'args'=>$val, 'curdate'=>$_POST['curdate']));
								$tmp = unserialize($resp);
								switch($printMethod){
									case 'silk':
//										$tmp = $estimate->calcSilkPrintFee($val['vol'], 1, $val['ink'], $val['ids'], 1, $val['size'], 1, $val['repeat']);
										// ����
										foreach ($tmp['plates'] as $g2Id=>$charge) {
											if ($val['repeat'][$g2Id]==1) continue;	// ��ԡ����ǤϽ���
											$plateCharge[$printMethod][$g2Id]['fee'] += $charge;
											$len = count($tmp['group2'][$g2Id]);
											for ($i=0; $i<$len; $i++) {
												$itemId = $tmp['group2'][$g2Id][$i];
												$plateCharge[$printMethod][$g2Id]['vol'] += $val['ids'][$itemId];
											}
											if (empty($plateCharge[$printMethod][$g2Id]['item'])) {
												$plateCharge[$printMethod][$g2Id]['item'] = $val['ids'];
											} else {
												$plateCharge[$printMethod][$g2Id]['item'] += $val['ids'];
											}
										}
										break;
									case 'inkjet':
//										$tmp = $estimate->calcInkjetFee($val['opt'], $val['vol'], 1, $val['size'], $val['ids']);
										break;
									case 'cutting':
//										$tmp = $estimate->calcCuttingFee($val['vol'], 1, $val['size'], $val['ids']);
										break;
									case 'digit':
//										$tmp = $estimate->calcTransFee2($val['vol'], $val['size'], $val['ids'], $val['repeat']);
										// ����
										if ($val['repeat']!=1) {
											$plateCharge[$printMethod]['fee'] += $tmp['plates'];
											$plateCharge[$printMethod]['vol'] += $val['vol'];
											if (empty($plateCharge[$printMethod]['item'])) {
												$plateCharge[$printMethod]['item'] = $val['ids'];
											} else {
												$plateCharge[$printMethod]['item'] += $val['ids'];
											}
										}
//										
//										if (!empty($tmp['plates'])) {
//											$per = $tmp['plates'] / $val['vol'];
//											foreach ($val['ids'] as $itemId=>$vol) {
//												$print_fee['item'][$itemId]['fee'] += $per * $vol;
//											}
//										}
										break;
									case 'embroidery':
//										$tmp = $estimate->calcEmbroideryFee($val['opt'], $val['vol'], $val['size'], $val['ids'], $val['repeat']);
										// ����
										if ($val['repeat']!=1) {
											// ��ԡ����ǤϽ���
											$plateCharge[$printMethod]['fee'] += $tmp['plates'];
											$plateCharge[$printMethod]['vol'] += $val['vol'];
											if (empty($plateCharge[$printMethod]['item'])) {
												$plateCharge[$printMethod]['item'] = $val['ids'];
											} else {
												$plateCharge[$printMethod]['item'] += $val['ids'];
											}
										}
//										if (!empty($tmp['plates'])) {
//											$per = $tmp['plates'] / $val['vol'];
//											foreach ($val['ids'] as $itemId=>$vol) {
//												$print_fee['item'][$itemId]['fee'] += $per * $vol;
//											}
//										}
										break;
								}

								if (empty($tmp)) continue;
								
								// �����ƥ���˽���
								$pressPer = $tmp['press'] / $val['vol'];
								foreach ($val['ids'] as $itemId=>$vol) {
									$print_fee['item'][$itemId]['fee'] += $pressPer * $vol;
									if (!empty($tmp['extra'][$itemId])) {
										$print_fee['item'][$itemId]['fee'] += $tmp['extra'][$itemId];
									}
								}
								
								// �ץ�����ˡ��ι��
								$print_fee[$printMethod] += $tmp['tot'];
								
								// �ץ�������
								$print_fee['tot'] += $tmp['tot'];
							}
							
							
							if (! empty($plateCharge['silk'])) {
								// ���륯������򽸷�
								foreach ($plateCharge['silk'] as $g2Id=>$v) {
									$per = $v['fee'] / $v['vol'];
									foreach ($v['item'] as $itemId=>$amount) {
										$print_fee['item'][$itemId]['fee'] += $per * $amount;
									}
								}
							} else if (! empty($plateCharge[$printMethod])) {
								// �ǥ�ž�Ȼɽ�������򽸷�
								$per = $plateCharge[$printMethod]['fee'] / $plateCharge[$printMethod]['vol'];
								foreach ($plateCharge[$printMethod]['item'] as $itemId=>$amount) {
									$print_fee['item'][$itemId]['fee'] += $per * $amount;
								}
							}
						}
					}
					
				}
				

				// �����ƥऴ�Ȥ���ư��������ݤ��
				foreach($print_fee['item'] as &$val){
					$val['fee'] = round($val['fee']);
				}
				unset($val);
			} catch(Exception $e) {
				$print_fee['tot'] = 0;
			}
				$res = $json->encode(array($print_fee));
				header("Content-Type: text/javascript; charset=utf-8");
				break;
				
			case 'printfee':
			/**
			 * ��С������
			 * 2017-05-23�ޤǻ���
			 */
					$estimate = new Estimate($_POST['curdate']);
					$sheetsize = array(1, 0.5, 0.25);
					$basedata = array();
					$transdata = array();
					$temporary = array();	// ���륯�����󥯥����åȡ����åƥ��󥰤ν�����
					$print_fee = array('tot'=>0,'silk'=>0,'trans'=>0,'darktrans'=>0,'digit'=>0,'inkjet'=>0,'darkinkjet'=>0,'cutting'=>0);
					
					// �ץ��Ȱ��֤ǥ�����
					// array_multisort($_POST['pos'], $_POST['name'], $_POST['area'], $_POST['ink'], $_POST['size'], $_POST['plates'], $_POST['amount'], $_POST['ratio'], $_POST['extra'], $_POST['item_id'], $_POST['repeat']);
					
					$count = count($_POST['name']);
					for($i=0; $i<$count; $i++){
						$printtype = $_POST['name'][$i];
						$tmp = array();
						$opt = 0;	// ���󥯥����åȤΥ��ץ�����0:��T��1:��T��
						switch($printtype){
							case 'silk':
								$tmp = $estimate->calcSilkPrintFee($_POST['amount'][$i], $_POST['area'][$i], $_POST['ink'][$i], 0, $_POST['ratio'][$i], $_POST['size'][$i], $_POST['extra'][$i], $_POST['repeat'][$i]);
								break;
							case 'trans':
							case 'darktrans':
							case 'digit':
								// �����ȿ����ǿ��λ�����
								$rep = $_POST['repeat'][$i]==990 || $_POST['repeat'][$i]==0? 0: 1;
								$pos = $_POST['pos'][$i].'_'.$_POST['size'][$i];
								$basedata[$printtype][$rep]['size'][$_POST['plates'][$i]][$pos] = $sheetsize[$_POST['size'][$i]];	// �ץ��Ȱ��֤��ȡ�Ʊ���ǤȤߤʤ���
								$basedata[$printtype][$rep]['shot'][$_POST['plates'][$i]][$pos] += $_POST['amount'][$i];			// �ץ��Ȱ��֤��Ȥ������
								$basedata[$printtype][$rep]['volume'] += $_POST['amount'][$i];		// �ץ�����ˡ���Ȥα�����
								$basedata[$printtype][$rep]['item_id'][] = $_POST['item_id'][$i];	// �սꤴ�ȤΥ����ƥ�
								// �ץ��ȳ���Ψ�̤Ƿ׻�
								$key = $_POST['ratio'][$i];
								$transdata[$printtype][$key]['amount'][] = $_POST['amount'][$i];	// �սꤴ�Ȥ����
								$transdata[$printtype][$key]['extra'][] = $_POST['extra'][$i];
								$transdata[$printtype][$key]['press'][] = $_POST['repeat'][$i];
								// �����ƥऴ�ȤΥץ����彸����
								$transdata[$printtype][$key]['item_id'][] = $_POST['item_id'][$i];	// �սꤴ�ȤΥ����ƥ�
								$transdata[$printtype][$key]['totamount'] += $_POST['amount'][$i];	// ������
								break;
							case 'darkinkjet':	$opt = 1;
							case 'inkjet':
								$tmp = $estimate->calcInkjetFee($opt, $_POST['amount'][$i], $_POST['area'][$i], $_POST['size'][$i], 0, $_POST['ratio'][$i], $_POST['extra'][$i], $_POST['repeat'][$i]);
								break;
							case 'cutting':
								$tmp = $estimate->calcCuttingFee($_POST['amount'][$i], $_POST['area'][$i], $_POST['size'][$i], 0, $_POST['ratio'][$i], $_POST['extra'][$i], $_POST['repeat'][$i]);
								break;
						}
						
						// �����ƥऴ�ȤΥץ�����򽸷ס�ž�̤������
						if(!empty($tmp)){
							$print_fee['tot'] += $tmp['tot'];
							$print_fee[$printtype] += $tmp['tot'];
							
							// ���̥����Ȥν�����
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
					
					// ���륯�����󥯥����åȡ����åƥ��󥰤Υ����ƥऴ�Ȥν���
					if(!empty($temporary)){
						foreach($temporary as $printname=>$data){	// �ץ�����ˡ����
							foreach($data as $posname=>$val){		// �ץ��Ȱ��֤��ȡ�Ʊ���ǤȤߤʤ���
								$sub_amount = 0;
								$sub_plates = 0;
								$sub_setting = array();
								$sub_setting_amount = array();
								$sub_settingfee = array();
								$is99 = false;
								
								// ���̥�����
								for($i=0; $i<count($val); $i++){
									$sub_amount += $val[$i]['amount'];	// Ʊ���Ǥǥץ��Ȥ���������
									$sub_plates += $val[$i]['plates'];	// ����ȥǥ�������
									
									// �㤦���������դ����������륱����
									if(empty($val[$i]['setting_group'])) continue;
									$sub_setting[$val[$i]['setting_group']] += $val[$i]['setting'];	// ���դ���
									$sub_setting_amount[$val[$i]['setting_group']] += $val[$i]['amount'];
									if($val[$i]['repeat']==99) $is99 = true;
								}
								
								$plates_fee = $sub_plates/$sub_amount;				// 1�礢���������ȥǥ�������
								if($is99){
									foreach($sub_setting as $setting=>$charge){
										$sub_settingfee[$setting] = $charge/$sub_setting_amount[$setting];	// ���դ����������˳������륢���ƥ�1�礢����
									}
								}
								
								// �����ƥऴ�ȤΥץ�����
								for($i=0; $i<count($val); $i++){
									$sub_press = $val[$i]['press']/$val[$i]['amount'];	// �������ץ쥹��ϲսꤴ��
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
									$hash = explode(',', $val[$i]['item_id']);		// �����ս���б����륢���ƥ�
									for($t=0; $t<count($hash); $t++){
										$dat = explode('|', $hash[$t]);		// �����ƥ�ID�����
										$itemid = $dat[0];
										$print_fee['item'][$itemid]['fee'] += ($perone*$dat[1]);
										$print_fee['item'][$itemid]['amount'] = $dat[1];
									}
								}
							}
						}
					}
					
					// ž��
					if(!empty($transdata)){
						foreach($transdata as $tbl=>$dat){
							foreach($basedata[$tbl] as $rep=>$val){
								// �ץ�����ˡ���Ȥ�[����, ��������]
								$common_cost = $estimate->calcTransCommonFee($tbl, $val['size'], $val['shot'], $rep);
								$cost = $common_cost[0]+$common_cost[1];
								$print_fee[$tbl] += $cost;
								$print_fee['tot'] += $cost;
								$perone = $cost/$val['volume'];
								
								// �����ƥ��������ȥ���������ʬ
								for($j=0; $j<count($val['item_id']); $j++){
									$hash = explode(',', $val['item_id'][$j]);
									for($t=0; $t<count($hash); $t++){
										$dat = explode('|', $hash[$t]);
										$itemid = $dat[0];
										$print_fee['item'][$itemid]['fee'] += ($perone*$dat[1]);
									}
								}
							}
							
							// ����Ψ����
							foreach($transdata[$tbl] as $ratio=>$val){
								// ���դ���ܥץ쥹��
								$tmp = $estimate->calcTransFee($tbl, $val['amount'], $val['extra'], 0, $ratio, $val['press']);
								$print_fee[$tbl] += $tmp;
								$print_fee['tot'] += $tmp;
								
								// �����ƥ���Υץ�����
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
					
					// �����ƥऴ�Ȥ���ư��������ݤ��
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
	*	�ץ�����ˡ���ȹ礻�ѥ����������˳�Ǽ
	*	@pattern		�¤٤����Ǥ�����
	*	@count			�¤٤���
	*
	*	return			�ȹ礻��2��������֤�
	*/
	function getPermutation($pattern, $count){
		$digit = pow(count($pattern),$count);
		$res = permute($pattern, $digit, $digit, $ary);
		return $res;
	}
	
	/*
	*	����Υѥ�������������Ƶ��⥸�塼��
	*	@pattern		�¤٤����Ǥ�����
	*	@digit			�ѥ����������ʺƵ��ƽл����¤٤���ʷ���ˤλ��Ф˻��Ѥ�����
	*	@index			�ѥ���������
	*	@res			��̤�������������
	*
	*	return			�ȹ礻��2��������֤�
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
	*	��������ȯ������������Ķ��������֤�
	*	
	*	@baseSec	��������UNIX�����ॹ����פ��ÿ���
	*	@deliSec	ȯ������UNIX�����ॹ����פ��ÿ���
	*
	*	return		�Ķ�����
	*/
	function getWorkday($baseSec, $deliSec){
		if(!getdate($baseSec) || !getdate($deliSec)) return 0;
		$jd = new DateJa();
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