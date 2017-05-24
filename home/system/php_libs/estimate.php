<?php
/*
*	���Ѥ�׻������饹
*	charset euc-jp
*	log:	2014-02-10 ���դ���ؤγ���Ψ��Ŭ�Ѥ�2014-03-01�����ѻ�
*			2014-04-04 mysqli���ѹ�
*			2014-04-26 ��������Ŭ�����դ���ʸ����������ȯ�������ѹ�
*			2014-07-25 ž�̤η׻����ѹ�
*			2014-08-29 ���åƥ��󥰤Υץ쥹������ؤγ���Ψ�η׾���ѻ�
*			2014-09-15 ���ʾ���θ�������Ŭ�����դ�ȯ����������ʸ���������ѹ��ʳ���Ψ�ϥץ�����׻���Ϣ�Ȥ������ɤ���ȯ��������С�
*			2014-10-15 �ץ��ȶ�̳���Ȥ���彸�פΤ����֤��ͤΥϥå���򹹿�
*			2015-03-05 ǻ�����󥯥����åȤΥץ���ñ�����ѹ�
*			2017-05-24 �ץ�����׻��λ����ѹ����ѹ����TLA��API����ѤΤ����С�������ѤȤ��ƻ���
*/
require_once dirname(__FILE__).'/catalog.php';
require_once dirname(__FILE__).'/MYDB2.php';
class Estimate extends MYDB2 {
/**
*	calcSilkPrintFee			���륯�����꡼��Υץ�������֤�
*	calcInkjetFee				���󥯥����åȤΥץ�������֤�
*	calcTransFee2				�ǥ�����ž�̤Υץ�������֤�
*	calcCuttingFee				���åƥ��󥰤Υץ�������֤�
*	getExtraCharge				������ۤ��֤�
*
*	getPrintRatio				���������ƥ�Υץ��ȳ���Ψ���֤�
*	getEstimation				������ʸ�ζ�۾���ȥ����ƥ���Υץ�����򻻽Ф���1�礢�����ۡ��������ʲ����ھ夲
*	
*/

	private $curdate;		// ȯ����
	
	/*
	*	setting	:	���դ���ؤγ���ΨŬ�Ѥ��ѻ�
	*	spec_v2 :	�ץ�����׻��λ����ѹ�
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
	 * ������ۤ����
	 * @param {array} itemid �����ƥ�ID�򥭡��ˤ�������
	 * @return {array|boolean} s��̤�������֤������Ԥξ���{@code FALSE}���֤�
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
				$stmtParams[$key] =& $arr[$key];	// bind_param�ؤΰ����򻲾��Ϥ��ˤ���
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
	 *	���륯�����꡼��Υץ�������֤�
	 *		@amount		����
	 *		@area		�ץ��Ȳս����1�Ǹ���
	 *		@inkcount	���󥯿���
	 *		@itemid		�����ƥ�ID�򥭡��ˤ������������ƥ�����������
	 *		@ratio		��̤���ѡ˳���ΨID
	 *		@size		0:�̾1:�������ǡ�2:�����ѡ�������
	 *		@extra		��̤���ѡ� �������åȤγ���Ŭ�Ѳս�ξ�硡default 1�����̾�Υ��ƥ��ꤴ�Ȥγ���Ψratio��Ƴ�����
	 *		@repeat		Ʊ��ʬ��ID�򥭡��ˤ��������׾夹�뤫�ɤ���Ƚ�̤����͡�0:�����׾塡1:���������ʥ�ԡ��ȡˡ�2:����������Ʊ�ǡˤ�����
	 *		@return		{'tot':�ץ�������, 'plates':{Ʊ��ʬ��ID:����}, 'press':�������, 'extra':{�����ƥ�ID:�������}, 'group2':{Ʊ��ʬ��ID:[�����ƥ�ID]}}
	 *
	 *------ ��С������
	 *		@amount		����
	 *		@area		�ץ��Ȳս��
	 *		@inkcount	���󥯿���
	 *		@itemid		�����ƥ�ID
	 *		@ratio		����ΨID
	 *		@size		0:�̾1:�������ǡ�2:�����ѡ�������
	 *		@extra		�������åȤγ���Ŭ�Ѳս�ξ�硡default 1�����̾�Υ��ƥ��ꤴ�Ȥγ���Ψratio��Ƴ�����
	 *		@repeat		0������
	 *					1����ԡ�����		����ȥǥ�����������
	 *					99��				����ȥǥ�����������դ�������
	 *
	 *		return		{'tot':�ץ�����, 'plates':����ܥǥ�������, 'setting':���դ���, 'press':������}
	 */
	public function calcSilkPrintFee($amount, $area, $inkcount, $itemid=0, $ratio=1, $size=0, $extra=1, $repeat=0){
		try{
			if($area<1 || $inkcount<1 || $amount<1) return 0;
			
			if (strtotime($this->calcType['spec_v2']) <= strtotime($this->curdate)) {
				// �����ѹ���
				if (empty($itemid) || !is_array($itemid)) {
					return 0;
				}
				
				// ������ۤ����
				$r1 = $this->getExtraCharge($itemid);
				if(empty($r1)) return 0;
				
				// ������ۤ򥢥��ƥ���˻���
				// Ʊ��ʬ��ǥ����ƥ�ID�򽸷�
				$rs['extra'] = array();
				$extraCharge = 0;
				$len = count($r1);
				for ($i=0; $i<$len; $i++) {
					// Ʊ��ʬ��
					$rs['group2'][ $r1[$i]['item_group2_id'] ][] = $r1[$i]['item_id'];
					// �������
					if (empty($r1[$i]['price'])) continue;
					$amountOfItem = $itemid[ $r1[$i]['item_id'] ];
					$rs['extra'][$r1[$i]['item_id']] = $r1[$i]['price'] * $amountOfItem * $inkcount;
					$extraCharge += $rs['extra'][$r1[$i]['item_id']];
				}
				
				// �ץ�����׻���ñ�������
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
				
				// ������
				$tot = 0;
				$tot += $r2[0]['inkFee'] * $amount;	// 1����
				if ($inkcount>1) {
					$tot += $r2[1]['inkFee'] * $amount * ($inkcount - 1);	// 2���ܰʹ�
				}
				$rs['press'] = $tot;
				
				// ����
				// Ʊ��ʬ��ID�򥭡��ˤ������������
				$plates = 0;
				foreach ($repeat as $group2Id => $isRepeat) {
					$rs['plates'][$group2Id] = $isRepeat==0? $r2[0]['plateCharge'] * $inkcount: 0;
					$plates += $rs['plates'][$group2Id];
				}
				
				// �ץ�������
				$rs['tot'] = $rs['press'] + $plates + $extraCharge;
			} else {
				// ��׻�����
				if($itemid!=0){
					$ratio = $this->getPrintRatio($itemid);
				}else{
					$ratio = $this->getPrintRatio(0, $ratio);
				}
				$ratio *= $extra;
				$superjumbo = $size==2? 2: 1;	// �����ѡ������ܤ�����ȥץ�����ȥ������2��

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
				if(strtotime($this->calcType['setting'])<=strtotime($this->curdate)){	// ���դ���˳���Ψ��Ŭ�Ѥ��ʤ�
					$printfee = $setting + $inkfee;
				}else{
					$setting = ceil( ($setting * $ratio) / 10 ) * 10;
					$printfee = $setting + $inkfee;
				}
				$tot = ($plates + $printfee) * $area;	// 1����

				// 2���ʾ夢����
				$inkfee2 = 0;
				if($area<$inkcount){
					$rest = $inkcount-$area;
					$ink = ($rec['print']/2+$rec['ink'])*$superjumbo;
					if($size==1) $ink *= 1.5;
					$inkfee2 = ceil( (($ink*$amount) * $ratio) / 10 ) * 10 * $rest;
					$tot += ($plates + $setting)*$rest + $inkfee2;
				}
				// �ץ�������
				$rs['tot'] = $tot;
				// �ǥ�������
				$rs['design'] = $design*$inkcount;
				// ����ȥǥ�������
				$rs['plates'] = $plates*$inkcount;
				// ���դ���
				$rs['setting'] = $setting*$inkcount;
				// ������
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
	 *	���󥯥����åȤΥץ�������֤�
	 *		@option		ø��:0, ǻ��:1
	 *		@amount		����
	 *		@area		�ץ��Ȳս����1�Ǹ���
	 *		@size		�ץ��ȥ�������0:�硢1:�桢2:����
	 *		@itemid		�����ƥ�ID�򥭡��ˤ������������ƥ�����������
	 *		@ratio		��̤���ѡ˳���ΨID
	 *		@extra		��̤���ѡ� �������åȤγ���Ŭ�Ѳս�ξ�硡default 1�����̾�Υ��ƥ��ꤴ�Ȥγ���Ψratio��Ƴ�����
	 *		@repeat		��̤���ѡ�0:�����׾塡1:���������ʥ�ԡ��ȡ�
	 *		@return		{'tot':�ץ�������, 'press':�ץ쥹���, 'extra':{�����ƥ�ID:�������}}
	 *
	 *------ ��С������
	 *		@option		���:0(default), ����:1
	 *		@amount		����
	 *		@area		�ץ��Ȳս��
	 *		@size		�ץ��ȥ�������0:�硢1:�桢2:����
	 *		@itemid		�����ƥ�ɣ�
	 *		@ratio		����ΨID
	 *		@extra		�������åȤγ���Ŭ�Ѳս�ξ�硡default 1�����̾�Υ��ƥ��ꤴ�Ȥγ���Ψratio��Ƴ�����
	 *		@repeat		0������
	 *					1����ԡ�����		�ǥ�����������
	 *					99��				�ǥ�����������դ�������
	 *
	 *		return		{'tot':�ץ�����, 'plates':����ܥǥ�������, 'setting':���դ���, 'press':�ץ쥹��}
	 */
	public function calcInkjetFee($option, $amount, $area, $size, $itemid=0, $ratio=1, $extra=1, $repeat=0){
		try{
			if($amount<1) return 0;
			
			if (strtotime($this->calcType['spec_v2']) <= strtotime($this->curdate)) {
				// �����ѹ���
				if (empty($itemid) || !is_array($itemid)) {
					return 0;
				}
				
				// ������ۤ����
				$r1 = $this->getExtraCharge($itemid);
				if(empty($r1)) return 0;

				// ������ۤ򥢥��ƥ���˻���
				$rs['extra'] = array();
				$extraCharge = 0;
				$len = count($r1);
				for ($i=0; $i<$len; $i++) {
					if (empty($r1[$i]['price'])) continue;
					$amountOfItem = $itemid[ $r1[$i]['item_id'] ];
					$rs['extra'][$r1[$i]['item_id']] = $r1[$i]['price'] * $amountOfItem;
					$extraCharge += $rs['extra'][$r1[$i]['item_id']];
				}

				// �ץ�����׻���ñ�������
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

				// �ץ�����
				$rs['press'] = $r2[0]['fee'] * $amount;
				
				// �ץ�������
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
					if($option==1){	// ��T
						$design = $rec['design_1'];
					}else{
						$design = $rec['design'];
					}
				}else{
					$design = 0;
				}

				$setting = 0;
				if($repeat!=99){
					if($option==1){	// ��T
						$setting += $rec['setting_1'];
					}else{
						$setting += $rec['setting'];
					}
				}

				$pressfee = $rec['press_0']*$amount;
				$printfee = $rec['print_0']+$rec['ink_'.$size];
				if($option==1){	// ��T
					$printfee += $rec['paste']+$rec['press_1']+$rec['print_1']+$rec['ink_'.$size];
				}
				$printfee *= $amount;
				$press = ceil( (($pressfee+$printfee)*$ratio)/10 )*10 * $area;
				if(strtotime($this->calcType['setting'])<=strtotime($this->curdate)){	// ���դ���˳���Ψ��Ŭ�Ѥ��ʤ�
					$tot = ($design + $setting)*$area + $press;
				}else{
					$setting = ceil( (($setting)*$ratio)/10 )*10;
					$tot = ($design + $setting)*$area + $press;
				}
				// �ץ�������
				$rs['tot'] = $tot;
				// �ǥ�������
				$rs['plates'] = $design;
				$rs['design'] = $design;
				// ���դ���
				$rs['setting'] = $setting;
				// �ץ쥹��
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
	 *		���åƥ��󥰤Υץ�������֤�
	 *		@amount		����
	 *		@area		�ץ��Ȳս����1�Ǹ���
	 *		@size		�ץ��ȥ�������0:�硢1:�桢2:����
	 *		@itemid		�����ƥ�ID�򥭡��ˤ������������ƥ�����������
	 *		@ratio		��̤���ѡ˳���Ψ
	 *		@extra		��̤���ѡ˥������åȤγ���Ŭ�Ѳս�ξ�硡default 1�����̾�Υ��ƥ��ꤴ�Ȥγ���Ψratio��Ƴ�����
	 *		@repeat		��̤���ѡ�0:�����׾塡1:���������ʥ�ԡ��ȡ�
	 *		@return		{'tot':�ץ�������, 'press':�ץ쥹���, 'extra':{�����ƥ�ID:�������}}
	 *
	 *------ ��С������
	 *		@amount		����
	 *		@area		�ץ��Ȳս��
	 *		@size		�ץ��ȥ�������0:�硢1:�桢2:����
	 *		@itemid		�����ƥ�ɣ�
	 *		@ratio		����Ψ
	 *		@extra		�������åȤγ���Ŭ�Ѳս�ξ�硡default 1�����̾�Υ��ƥ��ꤴ�Ȥγ���Ψratio��Ƴ�����
	 *		@repeat		0������
	 *					1����ԡ�����		�ǥ�����������
	 *					99��				�ǥ�����������դ���ȥץ쥹����������
	 *
	 *		return		{'tot':�ץ�����, 'plates':����ܥǥ�������, 'setting':���դ���, 'press':�ץ쥹��}
	 */
	public function calcCuttingFee($amount, $area, $size, $itemid=0, $ratio=1, $extra=1, $repeat=0){
		try{
			if($amount<1) return 0;
			if (strtotime($this->calcType['spec_v2']) <= strtotime($this->curdate)) {
				// �����ѹ���
				if (empty($itemid) || !is_array($itemid)) {
					return 0;
				}

				// ������ۤ����
				$r1 = $this->getExtraCharge($itemid);
				if(empty($r1)) return 0;

				// ������ۤ򥢥��ƥ���˻���
				$rs['extra'] = array();
				$extraCharge = 0;
				$len = count($r1);
				for ($i=0; $i<$len; $i++) {
					if (empty($r1[$i]['price'])) continue;
					$amountOfItem = $itemid[ $r1[$i]['item_id'] ];
					$rs['extra'][$r1[$i]['item_id']] = $r1[$i]['price'] * $amountOfItem;
					$extraCharge += $rs['extra'][$r1[$i]['item_id']];
				}

				// �ץ�����׻���ñ�������
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

				// �ץ�����
				$rs['press'] = $r2[0]['fee'] * $amount;

				// �ץ�������
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
					$press += $rec['prepress'];	//	2014-08-29 T����ĤȰ��������ǥץ쥹������ͭ
				}
				/*	2014-08-29 �ץ쥹������ؤγ���Ψ�η׾���ѻ�
				*	$press = ceil( (($rec['prepress']+$rec['press']*$amount)*$ratio)/10 ) * 10;
				*/
				$press += ceil( (($rec['press']*$amount)*$ratio)/10 ) * 10;
				if(strtotime($this->calcType['setting'])<=strtotime($this->curdate)){	// ���դ���˳���Ψ��Ŭ�Ѥ��ʤ�
					$pressfee = $setting + $press;
				}else{
					$setting = ceil( (($setting)*$ratio)/10 ) * 10;
					$pressfee = $setting + $press;
				}
				$sheetfee = ($rec['sheet_'.$size]+$rec['detach']+$rec['inpfee']+$rec['cutting']) * $amount;
				$tot = ($design+$pressfee+$sheetfee) * $area;
				// �ץ�������
				$rs['tot'] = $tot;
				// �ǥ�������
				$rs['plates'] = $design;
				$rs['design'] = $design;
				// ���դ���
				$rs['setting'] = $setting;
				// �ץ쥹��
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
	 *		�ǥ�����ž�̤Υץ�������֤�
	 *		@amount		����
	 *		@size		�ץ��ȥ�������0:�硢1:�桢2:����
	 *		@itemid		�����ƥ�ID�򥭡��ˤ������������ƥ�����������
	 *		@repeat		0:�����׾塡1:���������ʥ�ԡ��ȡ�
	 *		@return		{'tot':�ץ�������, 'press':�ץ쥹���, 'plates':����, 'extra':{�����ƥ�ID:�������}}
	 */
	public function calcTransFee2($amount, $size, $itemid, $repeat=0){
		try{
			if ($amount<1) return 0;
			if (empty($itemid) || !is_array($itemid)) {
				return 0;
			}

			// ������ۤ����
			$r1 = $this->getExtraCharge($itemid);
			if(empty($r1)) return 0;

			// ������ۤ򥢥��ƥ���˻���
			$rs['extra'] = array();
			$extraCharge = 0;
			$len = count($r1);
			for ($i=0; $i<$len; $i++) {
				if (empty($r1[$i]['price'])) continue;
				$amountOfItem = $itemid[ $r1[$i]['item_id'] ];
				$rs['extra'][$r1[$i]['item_id']] = $r1[$i]['price'] * $amountOfItem;
				$extraCharge += $rs['extra'][$r1[$i]['item_id']];
			}

			// �ץ�����׻���ñ�������
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
			
			// �ץ�����
			$rs['press'] = $r2[0]['fee'] * $amount;
			
			// ����
			$rs['plates'] = $repeat==0? $r2[0]['plateCharge'] : 0;

			// �ץ�������
			$rs['tot'] = $rs['press'] + $rs['plates'] + $extraCharge;
		}catch(Exception $e){
			$rs = 0;
		}

		$stmt->close();
		$conn->close();
		return $rs;
	}
	
	
	/**
	 *		�ɽ��Υץ�������֤�
	 *		@option		0:���ꥸ�ʥ�, 1:�͡���
	 *		@amount		����
	 *		@size		�ץ��ȥ�������0:�硢1:�桢2:����
	 *		@itemid		�����ƥ�ID�򥭡��ˤ������������ƥ�����������
	 *		@repeat		0:�����׾塡1:���������ʥ�ԡ��ȡ�
	 *		@return		{'tot':�ץ�������, 'press':�ץ쥹���, 'plates':����, 'extra':{�����ƥ�ID:�������}}
	 */
	public function calcEmbroideryFee($option, $amount, $size, $itemid, $repeat=0){
		try{
			if ($amount<1) return 0;
			if (empty($itemid) || !is_array($itemid)) {
				return 0;
			}

			// ������ۤ����
			$r1 = $this->getExtraCharge($itemid);
			if(empty($r1)) return 0;

			// ������ۤ򥢥��ƥ���˻���
			$rs['extra'] = array();
			$extraCharge = 0;
			$len = count($r1);
			for ($i=0; $i<$len; $i++) {
				if (empty($r1[$i]['price'])) continue;
				$amountOfItem = $itemid[ $r1[$i]['item_id'] ];
				$rs['extra'][$r1[$i]['item_id']] = $r1[$i]['price'] * $amountOfItem;
				$extraCharge += $rs['extra'][$r1[$i]['item_id']];
			}

			// �ץ������ñ�������
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
			
			// ��������
			$sql = 'select coalesce(plate_charge.price, 0) as plateCharge from plate_charge
			 where print_method_id=? and plate_index=? and plate_charge_apply<=? and plate_charge_stop>?';
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("iiss", $r2[0]['print_method_id'], $size, $this->curdate, $this->curdate);
			$stmt->execute();
			$stmt->store_result();
			$r3 = self::fetchAll($stmt);
			if(empty($r3)) return 0;
			
			// �ץ�����
			$rs['press'] = $r2[0]['fee'] * $amount;

			// ����
			$rs['plates'] = $repeat==0? $r3[0]['plateCharge'] : 0;

			// �ץ�������
			$rs['tot'] = $rs['press'] + $rs['plates'] + $extraCharge;
		}catch(Exception $e){
			$rs = 0;
		}

		$stmt->close();
		$conn->close();
		return $rs;
	}


	/**
	 *		ž�̤Υץ쥹����֤��ʥǥ����롢���顼����Ԥȹ��ԡˡ�
	 *		@tablename	�ץ�����ˡ
	 *		@amount[]	�ץ��Ȳսꤴ�Ȥ����
	 *		@extra[]	�������åȤγ��������󡢡�default 1�����̾�Υ��ƥ��ꤴ�Ȥγ���Ψratio��Ƴ�����
	 *		@itemid		�����ƥ�ɣ�
	 *		@ratio		����ΨID
	 *		@press[]	�ץ��Ȳսꤴ�ȤΥץ쥹�������̵ͭ��990,991: �ץ쥹������ʤ���
	 *
	 * 		return		�ץ쥹��
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
			
			/* ����ܥǥ�����������դ���
			if(strtotime($this->calcType['setting'])<=strtotime($this->curdate)){	// ���դ���˳���Ψ��Ŭ�Ѥ��ʤ�
				//$platefee = $plate+$design + $rec['setting'];
				$setting = $rec['setting'];
			}else{
				//$platefee = $plate+$design + ceil( ($rec['setting']*$ratio)/10 ) * 10;
				$setting = ceil( ($rec['setting']*$ratio)/10 ) * 10;
			}
			*/
			
			// ��������
			//$sheetfee = $rec['ink']+$rec[$paper]+$rec['printer']+$rec['print'];
			// �ץ쥹��ʲսꤴ�ȡ�
			for($i=0; $i<count($amount); $i++){
				if(empty($amount[$i])) continue;
				/* 2014-07-26 �����ѹ����ץ쥹������˳���Ψ�򤫤��ʤ�
				*	$pressfee += ($rec['prepress']+$rec['press']*$amount[$i])*($ratio * $extra[$i]);
				*/
				
				// T����ĤȰ��������ǥץ쥹������ͭ��990,991��
				if($press[$i]<990){
					$pressfee += $rec['prepress'];
				}
				$pressfee += ($rec['press']*$amount[$i])*($ratio * $extra[$i]);
			}
			$pressfee = ceil($pressfee/10)*10;
			
			/* [�ǿ�,�����ȿ�]
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
	 *		ž�̤�����ȥ���������֤��ʥǥ����롢���顼����Ԥȹ��ԡˡ�
	 *		@tablename	�ץ�����ˡ
	 *		@sheet[]	�Ǥ��ȤΥץ��Ȱ��֤򥭡��ˤ����ǥ�������礭���Υ����Ȥ��Ф������1, 0.5, 0.25�˳����˴ط��ʤ�Ʊ���ץ��Ȱ��֤�Ʊ�ǥ�����Ȥߤʤ�
	 *		@shot[]		�Ǥ��ȤΥץ��Ȳսꤴ�Ȥ����
	 *		@repeat		0������
	 *					1����ԡ�����		����ʥǥ�����ˤȥǥ�����������
	 *
	 * 		return		[����, ��������, �ǥ�������, �ץ��Ⱥ�����]
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
			
			// �ǿ��ȥ����ȿ������
			$hash = self::getSheetCount($sheet, $shot);
			
			// ����ȥǥ�������
			if($repeat==0){
				$platefee = $rec['plate']+$rec['design'];
				$design = $rec['design'];
			}else{
				$platefee = 0;
				$design = 0;
			}
			
			// ���դ���
			if(strtotime($this->calcType['setting'])<=strtotime($this->curdate)){	// ���դ���˳���Ψ��Ŭ�Ѥ��ʤ�
				$setting += $rec['setting'];
			}else{
				$setting += ceil( ($rec['setting']*$ratio)/10 ) * 10;
			}
			$platefee += $setting;
			
			// �����Ƚ�����
			$platefee += $rec['presheet'];
			
			// �ǿ��򤫤���
			$platefee *= $hash[0];
			$design *= $hash[0];
			
			// ��������
			$sheetfee = $rec['ink']+$rec[$paper]+$rec['printer']+$rec['print'];
			$sheetfee *= $hash[1];
			
			// �ץ��Ⱥ�����
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
	 *		ž�̤Υ����ȿ����ǿ����֤��ʥǥ����롢���顼����Ԥȹ��ԡˡ�(Static)
	 *		@sheet[]	�Ǥ��ȤΥץ��Ȱ��֤򥭡��ˤ����ǥ�������礭���Υ����Ȥ��Ф������1, 0.5, 0.25�˳����˴ط��ʤ�Ʊ���ץ��Ȱ��֤�Ʊ�ǥ�����Ȥߤʤ�
	 *		@shot[]		�Ǥ��ȤΥץ��Ȳսꤴ�Ȥ����
	 *
	 *		return		[�ǿ�,�����ȿ�]
	 */
	public static function getSheetCount($sheet, $shot){
		try{
			foreach($sheet as $plates=>$val){
				// �ǥ�������礭���硢�����¿����ǥ�����
				$tmp = array();
				foreach($val as $pos=>$size){
					$tmp[] = array('size'=>$size, 'volume'=>$shot[$plates][$pos]);
				}
				for($i=0; $i<count($tmp); $i++){
					$a[$i] = $tmp[$i]['size'];
					$b[$i] = $tmp[$i]['volume'];
				}
				array_multisort($a,SORT_DESC, $b,SORT_DESC, $tmp);
				
				// �ǿ�
				$base = array();	// ���դ����줿�ƥǥ���������
				for($i=0; $i<count($tmp); $i++){
					$court += $tmp[$i]['size'];
					$idx = floor($court);	// �ǿ�-1
					if(fmod($court,1)==0) $idx--;
					$base[$idx][] = $tmp[$i]['volume'];
					
					//$sheets += $shot[$plates][$pos]*$size; // �����ȿ�
				}
			}
			
			// �����ȿ�
			$sheets = 0;
			$cnt = count($base)-1;
			for($i=0; $i<$cnt; $i++){
				$sheets += max($base[$i]);
			}
			// ���դ���ü������ʬ
			$a = fmod($court,1);	// ü��
			if($a==0.25){		// ��
				$sheets += ceil($base[$cnt][0]/4);
			}else if($a==0.5){
				if(count($base[$cnt])==1){	// ��
					$sheets += ceil($base[$cnt][0]/2);
				}else{						// ��,��
					if($base[$cnt][0]!=$base[$cnt][1]){
						$max = max($base[$cnt]);
						$min = min($base[$cnt]);
						$s1 = ceil(max($base[$cnt])/2);	// ���դ���2,2��
						$s2 = min($base[$cnt]);			// ���դ���1,3��
						$sheets += min($s1, $s2); // �����ȿ������ʤ��ʤ����դ���Ŭ�Ѥ��������ȿ�
					}else{
						$sheets += ceil($base[$cnt][0]/2);
					}
				}
			}else if($a==0.75){
				if(count($base[$cnt])==2){	// ��,��
					$sheets += max($base[$cnt][0], ceil($base[$cnt][1]/2));
				}else{						// ��,��,��
					// ���������¿���ǥ������2���դ�
					$sheets += max(ceil($base[$cnt][0]/2), $base[$cnt][1], $base[$cnt][2]);
				}
			}else{
				$sheets += max($base[$cnt]);
			}
			
			// �𥷡��ȿ����ǿ���
			$base = ceil($court);
			
			$res = array($base, $sheets);
			
			/*
			$a = fmod($court,1);	// ü��
			$b = floor($court);		// ������
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
	 *		���������ƥ�Υץ��ȳ���Ψ���֤�
	 *		@itemid		�����ƥ��ID
	 *		@ratioid		����ΨID��default is 0��
	 *
	 *		return			����Ψ
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
	 *		ž�̤��ǿ����֤��ʥǥ����롢���顼����Ԥȹ��ԡˡ�(Static)
	 *		@tablename		�ץ�����ˡ�ʥơ��֥�̾��
	 *		@amount		����
	 *		@sheet			��������Ȥ�������ƥץ��Ȥ��礭���������0.25,��0.5,��1��
	 *		@repeat		���ǡ�0
	 *						��ԡ����ǡ�����ȥǥ�����������
	 *							1:����ԡ���
	 *							2:2���ܰʹߥ�ԡ���
	 * 						   99:����Ʊ���Ǥǥץ��Ȥ���Ƥ�����
	 *		@connent		�ǡ����١����ؤ���³������default=0: ��������³����, 1: ��³�Ѥߡ�
	 *
	 *		return			�ǿ�
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
	*	������ʸ�ζ�۾���ȥ����ƥ���Υץ�����Ⱦ���ñ��
	*	����¾�Ȼ��������
	*	@args	order ID
	*
	*	return	[���Ѿ���]
	*/
	public function getEstimation($args){
		try{
			if(empty($args)) return;
			
			$conn = parent::db_connect();
			
			// ��ʸ�ꥹ�Ȥ����
			//	����¾ itemid:0			category:0
			//	������ itemid:100000	category:100
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
			$this->setCurdate($curdate);		// ȯ����������
			$ordertype = $items[0]['ordertype'];
			$reuse = $items[0]['reuse']==255? 0: $items[0]['reuse'];		// ��ԡ��ȳ��Ŭ�Ѿ���
			
			$catalog = new Catalog();
			$item = array();
			$estimated = empty($items[0]['basefee'])? $items[0]['estimated']: $items[0]['basefee'];	// ��ȴ���θ��ѹ�פ���Ѥ���
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
			
			// ����Ψ���ǥ����󡢥��ƥ��ꡢ�������Ȥ�����ȥ����ƥ��������򽸷�
			for($i=0; $i<count($items); $i++){
				// �����ƥ�ñ��
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
			
			// �ץ��Ⱦ��������ʤ���¾�Ȼ����������
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
			
			// �ץ��Ȱ��֤��Ȥ��б����륢���ƥ�Υץ�����׻��Υѥ�᡼���򽸷�
			$param = array();
			for($i=0; $i<count($press); $i++){
				$plate = $press[$i]['design_plate'];			// �ǥ�����
				$cat = $press[$i]['category_id'];				// ���ƥ���
				$ppID = $press[$i]['printposition_id'];			// ����
				$print_type = $press[$i]['print_type'];			// �ץ�����ˡ
				$extra_class = $press[$i]['selective_key'];		// �ץ��Ȱ���
				$pos_name = $press[$i]['selective_name'];		// �ץ��Ȱ���
				$printoption = $press[$i]['print_option'];		// ���󥯥����åȤȥ��顼ž�̤Υ��ץ����
				$rep_check = $press[$i]['repeat_check'];		// �������ȤΥ�ԡ����ǥ����å�
				$extra = 1;										// �������åȤκƳ���Ψ
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
				
				$designStatus = $pos_name.'_'.$shot;	// �ǥ�������꤬Ʊ���ǡ����򽸷פ��륭��
				
				// �ץ��Ȳսꤴ�ȤΥѥ�᡼��������
				if(isset($item[$plate][$cat][$ppID])){
					$target = $item[$plate][$cat][$ppID];
					foreach($target as $ratio=>$val){
						
						$repeat_id = 0;
						$setting_group = '';
						if($print_type=='silk' || $print_type=='inkjet' || $print_type=='cutting'){
							if($cat==7){	// ����åפϾ�������׾夹��
								$repeat_id = $reuse;
							}else if( $cat==1 || preg_match('/^(1|2|3|4|5|12|13|14|15)$/', $ppID) ){
								// T����ĤȰ���������Ʊ���ץ��Ȱ��ֻ��꤬���Ǥˤ���������դ�������
								if(empty($plate_check[$print_type][$plate][$designStatus])){
									$repeat_id = $reuse;
								}else if($plate_check[$print_type][$plate][$designStatus]==2){
									$repeat_id = 99;	// ����ȥǥ�����������դ���򺹰���
								}else{
									$repeat_id = 1;		// ����ȥǥ�������򺹰���
								}
								$plate_check[$print_type][$plate][$designStatus] = 2;
								$setting_group = $designStatus;
							}else if(empty($plate_check[$print_type][$plate][$designStatus])){
								$repeat_id = $reuse;
								$plate_check[$print_type][$plate][$designStatus] = 1;
							}else{
								$repeat_id = 1;			// ����ȥǥ�������򺹰���
							}
						}else{
							if( $cat==1 || preg_match('/^(1|2|3|4|5|12|13|14|15)$/', $ppID) ){
								// T����ĤȰ���������Ʊ���ץ��Ȱ��ֻ��꤬���Ǥˤ�����ϥץ쥹����������
								if(empty($plate_check[$print_type][$plate][$designStatus])){
									$repeat_id = $reuse;
								}else  if($plate_check[$print_type][$plate][$designStatus]==2){
									// �ץ쥹������򺹰���
									if(repeat==0){
										$repeat_id = 990;	// ����
									}else{
										$repeat_id = 991;	// �����
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
			*	�սꤴ�Ȥ˥ץ������׻����ƥ����ƥऴ�Ȥ˽���
			*	ž�̤ϳ���Ψ�ȥǥ�������ˤޤȤ��
			*/
			$sheetsize = array(1, 0.5, 0.25);
			$basedata = array();
			$transdata = array();
			$temporary = array();	// ���륯�����󥯥����åȡ����åƥ��󥰤ν�����
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
						// �����ȿ����ǿ��λ�����
						$rep = $param[$i]['repeat']==990 || $param[$i]['repeat']==0? 0: 1;
						$pos = $param[$i]['pos'].'_'.$param[$i]['size'];
						$basedata[$printtype][$rep]['size'][$param[$i]['plates']][$pos] = $sheetsize[$param[$i]['size']];	// �ץ��Ȱ��֤��ȡ�Ʊ���ǤȤߤʤ���
						$basedata[$printtype][$rep]['shot'][$param[$i]['plates']][$pos] += $param[$i]['amount'];				// �ץ��Ȱ��֤��Ȥ����
						$basedata[$printtype][$rep]['volume'] += $param[$i]['amount'];		// �ץ�����ˡ���Ȥα�����
						$basedata[$printtype][$rep]['item_id'][] = $param[$i]['item_id'];	// �սꤴ�ȤΥ����ƥ�
						// �ץ��ȳ���Ψ�̤Ƿ׻�
						$key = $param[$i]['ratio'];
						$transdata[$printtype][$key]['amount'][] = $param[$i]['amount'];	// �սꤴ�Ȥ����
						$transdata[$printtype][$key]['extra'][] = $param[$i]['extra'];
						$transdata[$printtype][$key]['press'][] = $param[$i]['repeat'];
						// �����ƥऴ�ȤΥץ����彸����
						$transdata[$printtype][$key]['item_id'][] = $param[$i]['item_id'];	// �սꤴ�ȤΥ����ƥ�
						$transdata[$printtype][$key]['totamount'] += $param[$i]['amount'];	// ������
						break;
					case 'inkjet':
						$tmp = $this->calcInkjetFee($param[$i]['option'], $param[$i]['amount'], $param[$i]['area'], $param[$i]['size'], 0, $param[$i]['ratio'], $param[$i]['extra'], $param[$i]['repeat']);
						break;
					case 'cutting':
						$tmp = $this->calcCuttingFee($param[$i]['amount'], $param[$i]['area'], $param[$i]['size'], 0, $param[$i]['ratio'], $param[$i]['extra'], $param[$i]['repeat']);
						break;
				}
				
				// �����ƥऴ�ȤΥץ�����򽸷ס�ž�̤������
				if(!empty($tmp)){
					$print_fee['tot'] += $tmp['tot'];
					$print_fee[$printtype] += $tmp['tot'];
					
					// �ץ��Ⱥ�Ȥ���彸����
					$print_fee['sales'][$printtype] += $tmp['setting']+$tmp['press'];
					$print_fee['sales']['design'] += $tmp['design'];
					
					// ���̥����Ȥν�����
					$tmp['amount'] = $param[$i]['amount'];
					$tmp['item_id'] = $param[$i]['item_id'];
					$tmp['repeat'] = $param[$i]['repeat'];
					$tmp['setting_group'] = $param[$i]['setting'];
					$temporary[$printtype][$param[$i]['pos']][] = $tmp;
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
							// �����ץ��Ȳս���б����륢���ƥ�
							foreach($val[$i]['item_id'] as $itemid=>$volume){
								$print_fee['item'][$itemid]['fee'] += ($perone*$volume);
								$print_fee['item'][$itemid]['amount'] = $volume;
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
						$common_cost = $this->calcTransCommonFee($tbl, $val['size'], $val['shot'], $rep);
						$cost = $common_cost[0]+$common_cost[1];
						$print_fee[$tbl] += $cost;
						$print_fee['tot'] += $cost;
						$perone = $cost/$val['volume'];
						
						// �����ƥ��������ȥ���������ʬ
						for($i=0; $i<count($val['item_id']); $i++){
							foreach($val['item_id'][$i] as $itemid=>$volume){
								$print_fee['item'][$itemid]['fee'] += ($perone*$volume);
							}
						}
						
						// �ǥ�������
						$print_fee['sales']['design'] += $common_cost[2];
						
						// ��彸����
						$worktype = $tbl=='darktrans'? 'trans': $tbl;
						$print_fee['sales'][$worktype] += $common_cost[3];
					}
					
					// ����Ψ����
					foreach($transdata[$tbl] as $ratio=>$val){
						// ���դ���ܥץ쥹��
						$tmp = $this->calcTransFee($tbl, $val['amount'], $val['extra'], 0, $ratio, $val['press']);
						$print_fee[$tbl] += $tmp;
						$print_fee['tot'] += $tmp;
						
						// ��彸����
						$worktype = $tbl=='darktrans'? 'trans': $tbl;
						$print_fee['sales'][$worktype] += $tmp;
						
						// �����ƥ���Υץ�����
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
			
			// �����ƥऴ�Ȥ���ư��������ݤ��
			foreach($print_fee['item'] as &$val){
				$val['fee'] = round($val['fee']);
			}
			unset($val);
			
			// �����ƥऴ�Ȥγ����
			if($print_fee['discountfee']!=0){
				$p1 = $print_fee['productfee']+$print_fee['printfee'];
				foreach($print_fee['item'] as &$val){
					$sub = $val['fee']+$val['cost'];
					$val['discount'] = round($print_fee['discountfee']*(($sub)/$p1));
				}
			}
			unset($val);
			
			// �ץ���������Ϥξ��
			if($items[0]['free_printfee']==1){
				// �ץ��Ⱥ�Ȥ���彸����
				//$print_fee['subtotal'] = $print_fee['tot'];			// DEBUG
				foreach($print_fee['sales'] as $key=>&$val){
					$ratio = $print_fee[$key]/$print_fee['tot'];	// �ƥץ�����ˡ�γ��
					$sales_ratio = $val/$print_fee[$key];			// �ץ��Ⱥ�Ȥ����˷׾夹���ۤ������ץ�����ˡ�Υץ�������Ф�����
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