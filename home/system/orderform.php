<?php
	require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
	require_once dirname(__FILE__).'/php_libs/mainmenu_list.php';
	// ���å�����ѿ�������
	$_SESSION['cart'] = array();
	/*
	if (isset($_COOKIE[session_name()])) {
		setcookie(session_name(), '', time()-42000, '/');
	}
	session_destroy();
	*/
	require_once dirname(__FILE__).'/php_libs/uploader.php';
	require_once dirname(__FILE__).'/php_libs/MYDB.php';
//2016.11.16
	require_once dirname(__FILE__).'/php_libs/design.php';

	$conn = db_connect();
	/*
	*	2014-01-23 �ѻ߹���
	*	sales:	�����ʬ
	*	receipt:�����ʬ
	*/
	$selectors = array('sales'=>array('def'=>2,'src'=>null),'receipt'=>array('def'=>3,'src'=>null),'bill'=>array('def'=>1,'src'=>null));
	foreach($selectors as $key=>$val){
		try{
			$result = exe_sql($conn, 'SELECT * FROM '.$key.'type');
			if($result){
				$val['src'] = '<select name="'.$key.'" id="'.$key.'_selector">';
				while($rec = mysqli_fetch_array($result)){
					$val['src'] .= '<option value="'.$rec[0].'">'.mb_convert_encoding($rec[1],'euc-jp','utf-8').'</option>';
				}
				$val['src'] .= '</select>';
				$selectors[$key]['src'] = preg_replace('/value=\"'.$val['def'].'\"/','value="'.$val['def'].'" selected="selected"',$val['src']);
			}

		}catch(Exception $e){
			$selectors[$key]['src'] = '<select name="'.$key.'"><option value="0">----</option></select>';
		}
	}

	try{
		$result = exe_sql($conn, 'SELECT * FROM printtype');
		$printtype_selector = '<option value="" selected="selected">----</option>';
		if($result){
			while($rec = mysqli_fetch_array($result)){
				$printtype_selector .= '<option value="'.$rec['print_key'].'">'.mb_convert_encoding($rec['print_name'],'euc-jp','utf-8').'</option>';
			}
		}
	}catch(Exception $e){
		$printtype_selector = '<option value="">----</option>';
	}

	try{
		$result = exe_sql($conn, 'SELECT * FROM staff where rowid1>0 and staffapply<=curdate() and staffdate>adddate(curdate(), interval -10 day) order by rowid1 ASC');
		$staff_selector = '<option value="" selected="selected">----</option>';
		if($result){
			while($rec = mysqli_fetch_array($result)){
				$staff_selector .= '<option value="'.$rec['id'].'">'.mb_convert_encoding($rec['staffname'],'euc-jp','utf-8').'</option>';
			}
		}
	}catch(Exception $e){
		$staff_selector = '<option value="">----</option>';
	}
	/*
	try{
		$result = exe_sql($conn, 'SELECT * FROM category');
		$category_selector = '<option value="" selected="selected">----</option>';
		if($result){
			while($rec = mysqli_fetch_array($result)){
				$category_selector .= '<option value="'.$rec['category_key'].'">'.mb_convert_encoding($rec['category_name'],'euc-jp','utf-8').'</option>';
			}
		}
	}catch(Exception $e){
		$category_selector = '<option value="">----</option>';
	}

	try{
		$result = exe_sql($conn, 'SELECT * FROM acceptprog');
		$progress_selector = '<option value="" selected="selected">----</option>';
		if($result){
			while($rec = mysqli_fetch_array($result)){
				$progress_selector .= '<option value="'.$rec['aproid'].'">'.mb_convert_encoding($rec['progressname'],'euc-jp','utf-8').'</option>';
				$status_selector .= '<option value="'.$rec['aproid'].'">'.mb_convert_encoding($rec['progressname'],'euc-jp','utf-8').'</option>';
			}
		}
	}catch(Exception $e){
		$progress_selector = '<option value="">----</option>';
		$status_selector = '<option value="">----</option>';
	}
	*/
	mysqli_close($conn);

	$selector = '<select name="cyclebilling">';
	$selector .= '<option value="1" selected="selected">����</option><option value="2">���</option><option value="3">�⡹��</option><option value="4">3����</option>';
	$selector .= '<option value="5">4����</option><option value="6">5����</option><option value="7">6����</option></select>';
	$selectors['cycle'] = array('def'=>1,'src'=>$selector);

	$selector = '<select name="cutofday">';
	$selector2 = '<select name="paymentday">';
	for($i=1; $i<31; $i++){
		$selector .= '<option value="'.$i.'">'.$i.'��</option>';
		$selector2 .= '<option value="'.$i.'">'.$i.'��</option>';
	}
	$selector .= '<option value="31">����</option></select>';
	$selector = preg_replace('/value="20"/','value="20" selected="selected"',$selector);
	$selector2 .= '<option value="31" selected="selected">����</option></select>';
	$selectors['cutofday'] = array('def'=>20,'src'=>$selector);
	$selectors['paymentday'] = array('def'=>31,'src'=>$selector2);

	$selector = '<select name="remittancecharge">';
	$selector .= '<option value="1">����</option><option value="2" selected="selected">����</option></select>';
	$selectors['charge'] = array('def'=>2,'src'=>$selector);

	/* 2014-05-01 ����ɽ�����ѹ��ˤ���ѻ�
	$selector = '<select name="consumptiontax">';
	$selector .= '<option value="0">�����</option><option value="1" selected="selected">����</option><option value="2">����</option></select>';
	$selectors['tax'] = array('def'=>1,'src'=>$selector);
	*/
	
	// �������
	$handover = '<option value="0">---</option>';
	for($h=9; $h<19; $h++){
		for($m=0; $m<60; $m+=30){
			$v = sprintf('%02d', $h).':'.sprintf('%02d', $m);
			$handover .= '<option value="'.$v.'">'.$v.'</option>';
		}
	}
	
	if(isset($_GET['order'])) {
		$orderID = $_GET['order'];
		
		$pos = strpos($_SERVER['QUERY_STRING'], 'filename=');
		$query_string = substr($_SERVER['QUERY_STRING'], $pos);
		$query_string = str_replace('filename', 'req', $query_string).'&reappear=1';
	}

?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="EUC-JP" />
	<meta name="robots" content="noindex" />
	<title><?php echo _TITLE_SYSTEM; ?></title>
	<meta http-equiv="Content-Style-Type" content="text/css" />
	<meta http-equiv="Content-Script-Type" content="text/javascript" />
	<!--<script>window.dhx_globalImgPath = "./js/lib/codebase/imgs/";</script>-->
	<link rel="stylesheet" type="text/css" media="screen" href="./js/theme/style.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./js/ui/cupertino/jquery.ui.all.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./js/modalbox/css/jquery.modalbox.css" />
	<!--<link rel="stylesheet" type="text/css" media="screen" href="./js/lib/codebase/dhtmlxcombo.css">-->
	<link rel="stylesheet" type="text/css" media="screen" href="./css/template.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/orders.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/confirm.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/direction.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/mainmenu.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/inkcolor.css" />

	<script type="text/javascript" src="./js/jquery.js"></script>
	<script type="text/javascript" src="./js/jquery.tablefix.js"></script>
	<script type="text/javascript" src="./js/jquery.tablesorter.min.js"></script>
	<script type="text/javascript" src="./js/jquery.smoothscroll.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.core.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.widget.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.button.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.position.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.autocomplete.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.datepicker.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.tabs.js"></script>
	<script type="text/javascript" src="./js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.effects.core.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.effects.pulsate.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.effects.drop.js"></script>
	<script type="text/javascript" src="./js/modalbox/jquery.modalbox-min.js"></script>
	<script type="text/javascript" src="https://ajaxzip3.github.io/ajaxzip3.js" charset="UTF-8" async></script>
	<script type="text/javascript" src="./js/phonedata.js"></script>
	<script type="text/javascript" src="./js/mypage.js"></script>
	<script type="text/javascript" src="./js/util.js"></script>

	<script type="text/javascript">
		var _my_level = "<?php echo $mylevel; ?>";
		var _MAIN = "<?php echo $_SERVER['SCRIPT_NAME']; ?>";
		var _ID = "<?php echo $orderID; ?>";
	</script>

</head>
<body class="main_bg" id="page_top">
	<div id="overlay"></div>
	<p id="loadingbar">�ǡ������ι�����.....</p>
	<div id="header" class="main_bg">
		<div class="inner">
			<div id="tab_order"></div>
			<div id="tab_direction" class="headertabs"></div>
			<div class="btnarea">
				<?php
					if(!empty($orderID)){
						echo '<a href="./main.php?pos=428&'.$query_string.'" id="goback"><img alt="" src="./img/arrow_left.png"></a>';
					}
				?>
				<!--
				<input type="image" src="./img/btn_gomenu.png" class="gotomenu" />
				<img alt="toolbutton" src="./img/btn_tool.png" height="25" class="toolbutton" />
				<img alt="firmorder" src="./img/btn_firmorder1.png" height="25" class="firm_order" />
				-->
				<span id="btn_gotomenu" class="btn_sub">��˥塼�����</span>
				
				<span id="btn_tool" class="btn_sub">�ġ���</span>
				<span id="btn_firmorder" class="btn_sub">��ʸ����</span>
				<span id="btn_cancelorder" class="btn_sub">������</span>
				<span id="btn_imageup" class="btn_sub">���᡼���������å�</span>
				<span id="btn_completionimage" class="btn_sub">��������</span>
				<p><a href="#order_wrapper">�ȥå�</a><a href="#print_position">�ץ��Ȱ���</a><a href="#order_option">����¾����</a><a href="#order_customer">�����;���</a><a href="#page_border">�եå���</a></p>
			</div>
			<div class="tab_contents clearfix">
				<div id="alertarea">
					<!-- <span id="alert_rakuhan"><img alt="���ǺѤ�" src="./img/i_alert.png" width="30" />&nbsp;���ǺѤ�</span>-->
					<span id="alert_require"><img alt="̤���Ϥ���" src="./img/i_alert.png" width="30" />&nbsp;̤����ͭ</span>
					<span id="alert_comment"><img alt="�����Ȥ���" src="./img/i_alert.png" width="30" />&nbsp;������ͭ</span>
					<!--<img alt="saveall" src="./img/btn_save.png" height="25" class="saveall" />-->
					<div id="saveall" class="btn_main saveall">�ݡ�¸</div>
				</div>

				<p id="enableline">
					����ô�� <select id="reception"><option></option></select>
					<img alt="����" src="./img/i_uketsuke.png" /><span id="order_id">000000000</span>
					<span id="reuse_plate">����</span>
					<!--<label id="repeat_checker"><input type="checkbox" name="repeatcheck" value="1" />��ԡ�����</label> | -->
					<label id="rakuhan_checker"><input type="checkbox" name="rakuhan" value="1" />����</label> | 
					<label id="state_0"><input type="checkbox" name="state_0" value="1" />ȯ��</label> | 
					<input type="radio" name="ordertype" id="ordertype_general" value="general" checked="checked" /><label for="ordertype_general">�ڰ��̡�</label>
					<input type="radio" name="ordertype" id="ordertype_industry" value="industry" /><label for="ordertype_industry" >�ڶȼԡ�</label>
					<input type="hidden" id="plates_status" value="0" />
				</p>

				<ul id="disableline">
					<li>����ô��</li>
					<li><p></p></li>
					<li><img alt="����" src="./img/i_uketsuke.png" /></li>
					<li><p></p></li>
					<li>���ϥ⡼��</li>
					<li><p></p></li>
				</ul>
			</div>
			<div id="btn_customerlog">���յ�Ͽ</div>
			<div id="maintitle_wrapper">
				��̾&nbsp;<input type="text" value="" id="maintitle" name="maintitle" />
			</div>
			<div id="customer_id">000000000</div>
			<div id="customer_info">
				<p></p>
				<p></p>
			</div>
			<div class="contact_area">
				<p><img alt="TEL" src="./img/i_tel.png" /><span>&nbsp;</span></p>
				<p><img alt="FAX" src="./img/i_fax.png" /><span>&nbsp;</span></p>
				<p><img alt="EMail" src="./img/i_mail.png" /><span>&nbsp;</span></p>
			</div>
		</div>
		<div class="main_header">
			<p class="title">Main Menu</p>
			<?php echo $mainmenu; ?>
		</div>

	</div>


	<div id="order_wrapper" class="wrapper">

		<div class="maincontents">
			<div class="contents">

				<ul class="crumbs" id="accept_navi">
					<li><p class="act">�䤤��碌��</p></li>
				   	<li><p>���Ѥ�᡼���</p></li>
				   	<li><p>���������</p></li>
				   	<li id="done_image"><p>����贰λ</p></li>
				   	<li><p>��ʸ����</p></li>
				   	<li><p>ȯ����</p></li>
				   	<li id="order_cancel"><p>��ʸ��ä�</p></li>
				</ul>

				<div id="phase_wrapper" class="phasecheck clearfix">
					<div class="phase_label"><p>��</p><p>��</p></div>
					<label><input type="radio" name="phase" value="enq" checked="checked" />�䤤��碌��</label>
					<label><input type="radio" name="phase" value="copy" />�����Ԥ�</label>
					<span class="fontred toright">��</span>
					<ins id="order_estimate">���Ѥ��ǧ��</ins>
					<ins id="order_completed">��ʸ����Ѥ�</ins>
					<ins id="order_stock" class="highlights">̤ȯ��</ins>
					<ins id="order_cancel">��ʸ��ä�</ins>
				</div>

				<div class="phase_box">
					<h2 class="ordertitle">����ǥ��������å�</h2>
					<div class="inner" id="mediacheck_wrapper">
						<table>
						<tfoot>
							<tr><td colspan="2"><input type="button" value="�ꥻ�å�" id="mediacheck_reset" /></td></tr>
						</tfoot>
						<tbody>
							<tr>
								<th>�����䤤��碌</th>
								<td>
									<label><input type="radio" name="firstcontact" value="yes" />�ե�������</label>
									<label><input type="radio" name="firstcontact" value="no" checked="checked" />��ԡ���</label>
								</td>
							</tr>
							<tr>
								<th>�䤤��碌��ˡ</th>
								<td>
									<label><input type="radio" name="mediacheck01" value="phone" />����</label>
									<label><input type="radio" name="mediacheck01" value="email" />�᡼��</label>
									<label><input type="radio" name="mediacheck01" value="fax" />FAX</label>
								</td>
							</tr>
							<tr>
								<th>�����Τä���</th>
								<td>
									<label><input type="radio" name="mediacheck02" value="428HP" />428HP</label>
									<label><input type="radio" name="mediacheck02" value="print-t" />Print-t</label>
									<label><input type="radio" name="mediacheck02" value="428mobile" />428����</label>
									<label><input type="radio" name="mediacheck02" value="sweatjack" />sweatJack</label>
									<label><input type="radio" name="mediacheck02" value="self-design" />SEIF-DESIGN</label>
									<label><input type="radio" name="mediacheck02" value="request" />�������ᤫ��</label>
									<label><input type="radio" name="mediacheck02" value="introduction" />�Ҳ�</label>
								</td>
							</tr>
							<tr>
								<th>�䤤��碌����</th>
								<Td>
									<label><input type="radio" name="mediacheck03" value="estimate" />������</label>
									<label><input type="radio" name="mediacheck03" value="order" />����ʸ</label>
									<label><input type="radio" name="mediacheck03" value="delivery" />Ǽ��</label>
									<label><input type="radio" name="mediacheck03" value="other" />����¾</label><input type="text" value="����¾" id="mediacheck03_other" />
								</Td>
							</tr>
						</tbody>
						</table>
					</div>
				</div>

				<div class="phase_box freeform">
					<h2 class="ordertitle">���������塼��</h2>
					<div class="inner">
						<table id="schedule_selector">
							<tbody>
								<tr>
									<th>��ʸ�����ͽ��</th>
									<td><input type="number" min="0" value="0" id="check_amount" name="check_amount" class="forNum" />&nbsp;��</td>
								</tr>
								<tr>
									<th>Ǽ������ƻ�ܸ�</th>
									<td>
										<select id="destination">
											<option value="0" selected="selected">-</option>
											<option value="1">�̳�ƻ</option>
											<option value="2">�Ŀ���</option>
											<option value="3">��긩</option>
											<option value="4">�ܾ븩</option>
											<option value="5">���ĸ�</option>
											<option value="6">������</option>
											<option value="7">ʡ�縩</option>
											<option value="8">��븩</option>
											<option value="9">���ڸ�</option>
											<option value="10">���ϸ�</option>
											<option value="11">��̸�</option>
											<option value="12">���ո�</option>
											<option value="13">�����</option>
											<option value="48">�����Υ��</option>
											<option value="14">�����</option>
											<option value="15">���㸩</option>
											<option value="16">�ٻ���</option>
											<option value="17">���</option>
											<option value="18">ʡ�温</option>
											<option value="19">������</option>
											<option value="20">Ĺ�</option>
											<option value="21">���츩</option>
											<option value="22">�Ų���</option>
											<option value="23">���θ�</option>
											<option value="24">���Ÿ�</option>
											<option value="25">���츩</option>
											<option value="26">������</option>
											<option value="27">�����</option>
											<option value="28">ʼ�˸�</option>
											<option value="29">���ɸ�</option>
											<option value="30">�²λ���</option>
											<option value="31">Ļ�踩</option>
											<option value="32">�纬��</option>
											<option value="49">�纬������</option>
											<option value="33">������</option>
											<option value="34">���縩</option>
											<option value="35">������</option>
											<option value="36">���縩</option>
											<option value="37">���</option>
											<option value="38">��ɲ��</option>
											<option value="39">���θ�</option>
											<option value="40">ʡ����</option>
											<option value="41">���츩</option>
											<option value="42">Ĺ�긩</option>
											<option value="43">���ܸ�</option>
											<option value="44">��ʬ��</option>
											<option value="45">�ܺ긩</option>
											<option value="46">�����縩</option>
											<option value="47">���츩</option>
										</select>
										<img alt="answer" src="./img/answer.png" class="icon_answer" id="ans_delivery">
									</td>
								</tr>
								<tr>
									<th>Ǽ����ο�</th>
									<td><input type="number" min="1" value="1" id="destcount" name="destcount" class="forNum" />&nbsp;����</td>
								</tr>
								<tr>
									<th>�޵ͤ�</th>
									<td>
										<table id="package_wrap">
											<thead>
												<tr>
													<td><label><input type="checkbox" name="package" value="no" checked="checked" />�ʤ�</label></td>
													<td><label><input type="checkbox" name="package" value="nopack" />�ޤΤ�Ʊ��</label></td>
													<td><label><input type="checkbox" name="package" value="yes" />����</label><ins class="remarks">��10��ʾ������������1���ɲá�</ins></td>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td></td>
													<td><p style="display:none;"><input type="number" min="0" max="0" value="0" id="pack_nopack_volume" name="pack_nopack_volume" class="forNum" />&nbsp;��</p></td>
													<td><p style="display:none;"><input type="number" min="0" max="0" value="0" id="pack_yes_volume" name="pack_yes_volume" class="forNum" />&nbsp;��</p></td>
												</tr>
											</tbody>
										</table>
									</td>
								</tr>
								<tr>
									<th>������ˡ</th>
									<td>
										<label><input type="radio" name="carriage" value="normal" checked="checked" />�����</label>
										<!-- 2012-04-17 �ѻ�
										<label><input type="radio" name="carriage" value="air" />Ķ®��</label>
										<label><input type="radio" name="carriage" value="time" />��������</label>
										-->
										<label><input type="radio" name="carriage" value="accept" />�����Ϥ�</label>
										<select id="handover" name="handover"><?php echo $handover; ?></select>
										<label><input type="radio" name="carriage" value="telephonic" />�Ǥ�tel</label>
										<label><input type="radio" name="carriage" value="other" />����¾</label>
									</td>
								</tr>
								<tr>
									<th>Ȣ��</th>
									<td><input type="number" min="0" value="0" id="boxnumber" name="boxnumber" class="forNum" />&nbsp;Ȣ</td>
								</tr>
								<tr>
									<th>Ʊ������</th>
									<td>
									<input type="button" value="Ʊ����ǽ��ʸ��ɽ��" id="show_bundle">
									<span id="bundle_status">Ʊ������</span>
									</td>
								</tr>
								<!--
								<tr id="express_checker">
									<th>�õ�����</th>
									<td>
										<label><input type="checkbox" name="expresscheck" value="1" />�õ������</label>
									</td>
								</tr>
								-->
								<tr>
									<th>���ʤ�����ͽ����</th>
									<td>
										<input type="text" size="10" value="" id="arrival_date" name="arrival" class="forDate" readonly="readonly" />
										<input type="button" value="�ꥻ�å�" id="reset_arrival" />
									</td>
								</tr>
								<tr>
									<th>�����</th>
									<td>
										<select id="factory">
											<option value="0" selected="selected">----</option>
											<option value="1">�裱����</option>
											<option value="2">�裲����</option>
											<option value="9">�裱��������</option>
										</select>
									</td>
								</tr>
								<tr style="display:none;">
									<th>�����</th>
									<td><input type="checkbox" name="completionimage" id="completionimage" value="1" readonly="readonly"></td>
								</tr>
							</tbody>
						</table>
					</div>
					
					<div class="inner clearfix">
						<div class="clock_wrapper">
							<ul id="clock">
								<li id="sec"></li>
								<li id="hour"></li>
								<li id="min"></li>
							</ul>
						</div>
						<div class="schedulebox">
							<table id="schedule">
								<tfoot>
									<tr>
										<th colspan="7"><p id="express_message">&nbsp;</p></th>
										<td>&nbsp;</td>
									</tr>
								</tfoot>
								<tbody>
									<tr>
										<th><ins>(13:00��)</ins><br />���ơ�</th>
										<th>&nbsp;</th>
										<th><ins>(13:00��)</ins><br />��ʸ����</th>
										<th>&nbsp;</th>
										<th>ȯ����</th>
										<th>&nbsp;</th>
										<th>���Ϥ���</th>
										<th>&nbsp;</th>
									</tr>
									<tr>
										<td><input type="text" size="10" value="" id="schedule_date1" name="schedule1" class="forDate" readonly="readonly" /></td>
										<td>��</td>
										<td><input type="text" size="10" value="" id="schedule_date2" name="schedule2" class="forDate" readonly="readonly" /></td>
										<td>��</td>
										<td><input type="text" size="10" value="" id="schedule_date3" name="schedule3" class="forDate" readonly="readonly" /></td>
										<td>��</td>
										<td><input type="text" size="10" value="" id="schedule_date4" name="schedule4" class="forDate" readonly="readonly" /></td>
										<td><input type="button" value="�ꥻ�å�" id="reset_schedule" /></td>
									</tr>
									<tr class="btn">
										<th><input type="button" value="���Ϥ�����׻�" id="calc_schedule_date1" /></th>
										<td>&nbsp;</td>
										<th><input type="button" value="���Ϥ�����׻�" id="calc_schedule_date2" /></th>
										<td colspan="3">&nbsp;</td>
										<th><input type="button" value="��ʸ��������׻�" id="calc_schedule_date4" /></th>
										<td>&nbsp;</td>
									</tr>
									<tr>
										<td colspan="7">
											<div class="schedule_crumbs_toright">
												<p><span>��ʸ����������</span></p>
											</div>
											<div class="schedule_crumbs_toleft">
												<p><span>���Ϥ�������</span></p>
											</div>
										</td>
										<td>&nbsp;</td>
									</tr>
								</tbody>
							</table>

						</div>
					</div>
				</div>

				<div class="phase_box freeform">
					<h2 class="ordertitle">�����ʾ���</h2>
					<div class="inner">
						<table class="iteminfo">
							<thead>
								<tr><th>���ʼ���</th><th>����̾</th><th>���ʥ��顼</th><th>���� �� �᡼����</th></tr>
							</thead>
							<tfoot>
								<tr>
									<td><input type="hidden" size="5" id="master_id" value="" /></td>
									<td><input type="hidden" size="5" id="itemcolor_code" value="" /></td>
									<td><input type="hidden" size="5" id="printpos_id" value="" /></td>
									<td></td>
								</tr>
							</tfoot>
							<tbody>
								<tr>
									<td id="categoryIs"></td>
									<td id="itemIs"><select id="item_selector" onchange="mypage.changeValue(this)"></select></td>
									<td>
										<img alt="�����ƥ५�顼" src="./img/circle.png" width="25" id="item_color" />
										<input type="text" readonly="readonly" id="itemcolor_name" value="" />
									</td>
									<td>
										�ʡ�����<input type="text" readonly="readonly" id="stock_number" value="" /><br />
										�᡼����<input type="text" readonly="readonly" id="maker" value="" />
									</td>
								</tr>
							</tbody>
						</table>
						
						<form name="size_amount_form" action="" onsubmit="return false;">
							<div id="size_table"></div>
						</form>
						
					</div>
				</div>

				<div class="phase_box freeform">
					<div class="inner">
						<form name="orderlist" action="" onsubmit="return false;">
							<table id="orderlist" class="tablesorter">
								<caption>
									��ʸ�ꥹ��
									<!--
									<select>
										<option value="size" selected="selected">������</option>
										<option value="color">���顼</option>
									</select>
									<input type="button" value="������" id="sort_orderlist">
									-->
								</caption>
								<thead>
									<tr>
										<th class="first tip"></th>
										<th class="centering"><img alt="" src="./img/check_32.png" width="20" /></th>
										<th>����</th>
										<th>����̾</th>
										<th>������</th>
										<th>���ʤο�</th>
										<th width="40">���</th>
										<th width="55">ñ��</th>
										<th width="80">���</th>
										<th width="30">��</th>
										<th width="30" class="last">�߸�</th>
										<th class="none"></th>
										<th class="tip"></th>
									</tr>
								</thead>
								<tfoot>
									<tr class="total">
										<td class="tip"></td>
										<td colspan="5" class="sum">�������</td>
										<td class="br0"><input type="text" value="0" size="8" readonly="readonly" id="total_amount" /></td>
										<td class="bl0" style="text-align:left;">��</td>
										<td colspan="2"><input type="text" value="0" size="8" readonly="readonly" id="total_cost" /> ��</td>
										<td></td>
										<td class="none"></td>
										<td class="tip"></td>
									</tr>
									<tr class="heading">
										<th class="tip"></th>
										<th colspan="5">����̾</th>
										<th>����</th>
										<th>ñ��</th>
										<th>���</th>
										<th colspan="2" class="last"></th>
										<th class="none"></th>
										<th class="tip"></th>
									</tr>
									<tr class="estimate">
										<td class="tip">0</td>
										<td colspan="5"><input type="text" value="" class="summary" /></td>
										<td><input type="text" value="0" class="amount forNum" /></td>
										<td><input type="text" value="0" class="cost" /></td>
										<td><input type="text" value="0" class="price" readonly="readonly" /></td>
										<td colspan="2"></td>
										<td class="none"><input type="button" value="���" class="delete_row" /></td>
										<td class="tip"></td>
									</tr>
									<!--
									<tr class="total_estimate">
										<td class="tip"></td>
										<td colspan="5"></td>
										<td class="br0"><input type="text" value="0" size="8" readonly="readonly" id="total_estimate_amount" /></td>
										<td class=" br0 bl0" style="text-align:left;"></td>
										<td colspan="2" class="bl0"></td>
										<td class="none"></td>
										<td class="tip"></td>
									</tr>
									-->
									<tr class="total_estimate">
										<td class="tip"></td>
										<td colspan="4" class="sum">���</td>
										<td><input type="text" value="0" size="8" readonly="readonly" id="subtotal_estimate" /> ��</td>
										<td class="br0">������</td>
										<td class="bl0 toright"><input type="text" value="0" size="8" readonly="readonly" id="sales_tax" /> ��</td>
										<td colspan=2><input type="text" value="0" size="8" readonly="readonly" id="total_estimate_cost" /> ��</td>
										<td></td>
										<td class="none"></td>
										<td class="tip"></td>
									</tr>
								</tfoot>
								<tbody>
									
								</tbody>
							</table>
							<p id="estimation_toolbar">
								<input type="button" value="�Ԥ��ɲ�" class="add_row" />
							</p>
						</form>
						<p class="toright" id="notice_cost">-- ���β��� --</p>
					</div>
				</div>

				<div class="phase_box freeform" style="display: none;">
					<p>
						<input type="button" value="���󥯿��ؤ�ɽ�� >>" id="toggle_ink_pattern" /><ins>���ؤ����󤢤�</ins>
					</p>
					<div id="ink_pattern_wrapper">
						<h2 class="ordertitle">�����󥯿���<input type="button" value=">> reset" id="reset_exchink" /></h2>
						<div class="inner"></div>
					</div>
				</div>

				<div class="phase_box freeform">
					<h2 class="ordertitle">���ץ��Ȱ���</h2>
					<div class="inner">
						<p id="print_position" class="anchorpoint">�ץ��Ȱ���</p>
						<p>
							<input type="checkbox" value="noprint" name="noprint" id="noprint" /><label for="noprint">&nbsp;�ץ��Ȥʤ�</label>
							<label id="exchink_label">���󥯿��ؤ�����<input type="number" min="0" value="0" id="exchink_count" class="forNum" /></label>
						</p>
						<div id="pp_wrapper"></div>
						<div>
							<table id="itemprint">
								<caption>�����ƥऴ�Ȥ����١ھ��ס�</caption>
								<thead><tr><th>�����ƥ�̾</th><th>���</th><th>������</th><th>������</th><th>������/��</th><th>����/��</th></tr></thead>
								<tfoot><tr><td colspan="6" class="toright"><span class="fontred">��</span> ������ϴޤޤ�Ƥ��ޤ���<p></td></tr></tfoot>
								<tbody></tbody>
							</table>
						</div>
					</div>
				</div>

				<div class="phase_box">
					<h2 class="ordertitle">��������</h2>
					<div class="inner">
						<p class="scrolltop"><a href="#order_wrapper">�ڡ����ȥåפ�</a></p>
						<div class="designfee_wrapper"><p>�ǥ�������<input type="text" value="0" id="designcharge" name="designcharge" class="forPrice" size="8" />&nbsp;��</p></div>
						<table id="designtype_table">
							<tbody>
								<tr style="display: none;">
									<td>�ǥ�����</td>
									<td>
										<label><input type="radio" name="design" value="���" />���</label>
										<label><input type="radio" name="design" value="ʸ���Ǥ�" />ʸ���Ǥ�</label>
										<label><input type="radio" name="design" value="����" />����</label>
										<label><input type="radio" name="design" value="�����" />�����</label>
										<label><input type="radio" name="design" value="����¾" />����¾</label>
									</td>
									<td class="last pending"><label><input type="radio" name="design" value="0" checked="checked" />̤��</label></td>
								</tr>
								<tr>
									<td>������ˡ</td>
									<td>
										<label><input type="radio" name="manuscript" value="�᡼��" />�᡼��</label>
										<label><input type="radio" name="manuscript" value="FAX" />�ƣ���</label>
										<label><input type="radio" name="manuscript" value="͹��" />͹�������Ѥ�������ô��</label>
										<label><input type="radio" name="manuscript" value="�����ͻ���" />�����ͻ���</label>
										<label><input type="radio" name="manuscript" value="����¾" />����¾</label>
										<p><label>����ͽ����</label><input type="text" value="" class="fordate datepicker" id="manuscriptdate" /></p>
									</td>
									<td class="last pending"><label><input type="radio" name="manuscript" value="0" checked="checked" />̤��</label></td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="phase_box">
					<h2 class="ordertitle">�����ƥե�����</h2>
						<div class="inner">
							<table id="designImg_table" class="design_table">
								<thead></thead><tbody></tbody>
							</table>
							<table id="uploadImg_table">
									<tbody>
										<tr id="uploadimg_table_title"><td>���ƥե������ɲ�<td></tr>
										<tr><td><img id="wait_img" src="img/pbar-ani.gif" width="144px" height="22px" style="display:none"></td></tr>
										<tr>
										<td>
											<form enctype="multipart/form-data" target="upload_iframe"  method="post"  action="./php_libs/design.php" id="uploaderform">
												<input type="hidden" value="uploadDesFile" name="act" />
												<input type="hidden" value="attatchfile" name="folder" />
												<input type="hidden" id="order_id" name="order_id" />
												<input type="file"  id="attach_des" name="attach_des"/>
												<input type= "button"  value="��ǧ" id = "desImgup" />
												<input type= "button"  value="���" id = "desImgcancel" />
											</form>
										</td>
										</tr>
									</tbody>
							</table>
						<iframe name="upload_iframe" style="display: none;"></iframe>
						</div>
				</div>

				<div class="phase_box">
					<h2 class="ordertitle">�����᡼������</h2>
						<div class="inner">
							<table id="designedImg_table" class="design_table">
								<thead></thead><tbody></tbody>
							</table>
							<table id="uploadDesedImg_table">
									<tbody>
										<tr id="uploadimg_table_title"><td>���᡼�������ե������ɲ�<td></tr>
										<tr><td><img id="wait_img" src="img/pbar-ani.gif" width="144px" height="22px" style="display:none"></td></tr>
										<tr>
										<td>
											<form enctype="multipart/form-data" target="upload_iframe2"  method="post"  action="./php_libs/design.php" id="uploaderform">
												<input type="hidden" value="uploadDesFile" name="act" />
												<input type="hidden" value="imgfile" name="folder" />
												<input type="hidden" id="order_id" name="order_id" />
												<input type="file"  id="attach_img" name="attach_img"/>
												<input type= "button"  value="��ǧ" id = "desedImgup" />
												<input type= "button"  value="���" id = "desedImgcancel" />
											</form>
										</td>
										</tr>
									</tbody>
							</table>
						<iframe name="upload_iframe2" style="display: none;"></iframe>
						</div>
				</div>


				<div class="phase_box freeform" id="options_wrapper">
					<h2 class="ordertitle">������¾����</h2>
					<div class="inner">
						<p id="order_option" class="anchorpoint">��ʸ���ץ����</p>
						<table id="optprice_table">
						 	<tbody>
						 		<tr>
						 			<th>�䡡��</th>
						 			<td>
						 				<table id="discount_table">
						 				<colgroup class="classification"></colgroup>
						 				<tbody>
						 					<tr>
						 						<td>ñ��</td>
						 						<td>
						 							<span id="discount_reuse">��ԡ�����</span><br />
						 							<label><input type="checkbox" name="discount" value="blog" />�֥����ϳ�(<ins>-3��</ins>)</label>
						 							<label><input type="checkbox" name="discount" value="illust" />������(<ins>-1,000</ins>)</label>
													<!--
														<span id="discount_illust">������(-1,000)</span>
													-->
						 							<label><input type="checkbox" name="discount" value="quick" disabled="disabled" />���(-5��)</label>
						 							<label><input type="checkbox" name="discount" value="imgdesign" />�����̵��</label>

						 						</td>
						 					</tr>
						 					<tr>
						 						<td>����</td>
						 						<td>
						 							<label><input type="radio" name="discount1" value="student" />�س�(<ins>-3%</ins>)</label><br />
									 				<label><input type="radio" name="discount1" value="team2" />���饹���2���׎���<ins>-5%</ins>��</label>
									 				<label><input type="radio" name="discount1" value="team3" />���饹���3���׎��ʾ塡<ins>-7%</ins>��</label>
									 			</td>
									 		</tr>
									 		<tr>
									 			<td>����</td>
									 			<td>
						 							<label><input type="radio" name="discount2" value="repeat" />��ԡ��ȳ�(<ins>-3��</ins>)</label>
						 							<label><input type="radio" name="discount2" value="introduce" />�Ҳ��(<ins>-3��</ins>)</label>
						 							<label><input type="radio" name="discount2" value="vip" />�֣ɣг�(<ins>-5��</ins>)</label>
						 							<p class="old_discount2"><label><input type="radio" name="discount2" value="friend" />��ԡ��ȡ��Ҳ��(<ins>-3��</ins>)</label></p>
						 						</td>
						 					</tr>
											<tr>
									 			<td>����¾</td>
									 			<td>
													<p>̾��&nbsp;<input type="text" value="" name="extdiscountname" id="extradiscountname" /></p>
						 							<label><input type="radio" name="extradiscount" value="3" />-3��</label>
						 							<label><input type="radio" name="extradiscount" value="5" />-5��</label>
													<label><input type="radio" name="extradiscount" value="7" />-7��</label>
													<label><input type="radio" name="extradiscount" value="10" />-10��</label>
													<label><input type="radio" name="extradiscount" value="20" />-20��</label><span>(ʻ���Բ�)</span>
						 						</td>
						 					</tr>
						 					<tr>
									 			<td>�Ұ���</td>
									 			<td>
													<label><input type="checkbox" name="staffdiscount" id="staffdiscount" value="20" />-20��</label>
						 						</td>
						 					</tr>
						 					<tr>
						 						<td>&nbsp;</td>
						 						<td>
													<input type="button" id="reset_discount" value="����ʤ�" />
												</td>
						 					</tr>
						 				</tbody>
						 				</table>

						 			</td>
						 			<td class="last">
										<p>������&nbsp;<input type="checkbox" value="1" name="free_discount" id="free_discount" /><label for="free_discount">������</label></p>
										<p><span class="fontred">��</span><input type="text" value="0" name="discountfee" id="discountfee" size="8" readonly="readonly" class="forPrice" />&nbsp;��</p>
									</td>
						 		</tr>
						 		<tr class="separate"><td colspan="2"></td></tr>
						 		<tr>
						 			<th>�Ͱ���</th>
						 			<td>
						 				<label>̾��&nbsp;<input type="text" value="" name="reductionname" id="reductionname" /></label>
						 				<label class="fontred">��</label><input type="text" value="0" id="reductionprice" name="reduction" class="forPrice" />&nbsp;��
										<input type="checkbox" value="0" name="freeshipping" id="freeshipping" /><label for="freeshipping">����̵��</label>
						 			</td>
						 			<td class="last">&nbsp;</td>
						 		</tr>
						 		<tr class="separate"><td colspan="2"></td></tr>
								<tr>
						 			<th>�ɲ�����</th>
						 			<td>
										<label>̾��&nbsp;<input type="text" value="" name="additionalname" id="additionalname" /></label>
										<label>���</label><input type="text" value="0" name="additionalfee" id="additionalfee" class="forPrice" />&nbsp;��
						 			</td>
						 			<td class="last">&nbsp;</td>
						 		</tr>
						 		<tr class="separate"><td colspan="2"></td></tr>
						 		<tr class="freeform">
				 					<th>��ʧ��ˡ</th>
						 			<td>
						 				<p>
						 					<label><input type="radio" name="payment" value="wiretransfer" />�����ʼ������������ô��</label>
						 					<label><input type="radio" name="payment" value="credit" />�����ɡʼ����5%��������ô��</label>
						 					<label><input type="radio" name="payment" value="conbi" />����ӥ˷��</label>
							 			</p>
						 				<p>
						 					<label><input type="radio" name="payment" value="cod" />������</label>
											<label><input type="radio" name="payment" value="cash" />����</label>
											<label><input type="radio" name="payment" value="other" />����¾ <input type="text" value="" id="payment_other" /></label>
											<!--
							 				<label><input type="radio" name="payment" value="check" />���ڼ�</label><img alt="�إ��" src="./img/b_wakabamark.png" class="help_mark" />
							 				<label><input type="radio" name="payment" value="note" />���</label><img alt="�إ��" src="./img/b_wakabamark.png" class="help_mark" />
											-->
						 					<label class="pending"><input type="radio" name="payment" value="0" checked="checked" />̤��</label>
						 				</p>
						 				<p>
						 					<label>����ͽ����</label><input type="text" name="paymentdate" id="paymentdate" class="forDate datepicker" />
							 			</p>
						 			</td>
						 			<td class="last"><p>����ӥ˼����</p><p><input type="text" value="0" id="conbifee" size="8" readonly="readonly" />&nbsp;��</p><p>��������</p><p><input type="text" value="0" id="codfee" size="8" readonly="readonly" />&nbsp;��</p></td>
						 		</tr>
						 		<tr class="separate"><td colspan="2"></td></tr>
						 		<tr class="freeform">
						 			<th>ȯ����ˡ</th>
						 			<td>
						 				<p id="deliver_wrapper">
						 					<label><input type="radio" name="deliver" value="1" />�������</label>
						 					<label><input type="radio" name="deliver" value="2" />��ޥȱ�͢</label>
						 					<label><input type="radio" name="deliver" value="3" />��ǻ��͢</label>
						 					<label><input type="radio" name="deliver" value="99" />����¾</label>
						 					<label class="pending"><input type="radio" name="deliver" value="0" checked="checked" />̤��</label>
							 			</p>
										<p>
											<label>���䤤��碌�ֹ�</label><input type="text" name="contact_number" value="" id="contact_number" />
										</p>
						 				<p>
						 					<span id="carriage_name">�����</span>
						 					<label id="deliverytime_wrapper">��ã������
						 					<select name="deliverytime" id="deliverytime">
						 						<option value="0">---</option>
						 						<option value="1">������</option>
						 						<option value="2">12-14</option>
						 						<option value="3">14-16</option>
						 						<option value="4">16-18</option>
						 						<option value="5">18-20</option>
						 						<option value="6">20-21</option>
						 					</select></label>
						 				</p>
						 			</td>
						 		</tr>
							</tbody>
						</table>

					</div>
				</div>

				<div class="phase_box freeform" id="modify_customer_wrapper">
					<h2 class="ordertitle">�������;���</h2>
					<div class="inner">
						<p id="order_customer" class="anchorpoint">�ܵҾ���</p>
						<form id="customer_form" name="customer_form" action="" onsubmit="return false;">
							<p><input type="button" value="��������" id="search_customer" />
							<input type="button" value="�����;����������" id="modify_customer" />&nbsp;<ins>������Ǥ�����¸����Ƥ��ޤ���</ins>
							<input type="button" value="�ꥻ�å�" id="cancel_customer" />
							<input type="button" value="�����¸����" id="update_customer" /></p>
							<div class="pulldown">
								<div id="result_customer_wrapper" class="popup_wrapper">
									<div class="inner">
										<p class="popup_title">�������<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
										<div class="result_list"></div>
									</div>
								</div>
							</div>

							<fieldset>
								<legend>��</legend>
								<table>
									<tbody>
										<tr>
											<th>�ܵ�ID</th>
											<td colspan="3"><input type="text" name="number" value="" size="15" readonly="readonly" class="nostyle" /></td>
											<td><input type="hidden" name="cstprefix" value="k" /></td>
											<td><input type="hidden" name="customer_id" value="0" /></td>
										</tr>
										<tr>
											<th>�եꥬ��</th><td colspan="2"><input type="text" name="customerruby" value="" size="36" id="customerkana" /></td>
											<td colspan="2"><span class="header">�եꥬ��</span><input type="text" name="companyruby" value="" size="20" /></td>
											<td class="fontred"><p id="alert_exist"><img alt="���֤��ǧ" src="./img/i_alert.png" width="30" />&nbsp;���֤��ǧ</p></td>
										</tr>
										<tr>
											<th>�ܵ�̾</th><td colspan="2"><input type="text" name="customername" value="" size="36" id="customername" maxlength="80" class="restrict" /></td>
											<td colspan="3"><span class="header">ô������</span><input type="text" name="company" value="" size="20" maxlength="80" class="restrict" /></td>
										</tr>
										<tr>
											<th>TEL1</th><td><input type="text" name="tel" value="" size="20" id="cus_tel" class="forPhone" /></td>
											<th>TEL2</th><td><input type="text" name="mobile" value="" size="20" class="forPhone" /></td>
											<th>FAX</th><td><input type="text" name="fax" value="" size="20" class="forPhone" /></td>
										</tr>
										<tr>
											<th>Mail1</th><td colspan="2"><input type="text" name="email" value="" size="36" /></td>
											<td colspan="3"><span class="header">Mail2</span><input type="text" name="mobmail" value="" size="36" /></td>
										</tr>
										<tr>
											<td></td>
											<td colspan="5"><input type="button" value="e-Mail �ƥ���" id="check_email" /></td>
										</tr>
									</tbody>
								</table>
							</fieldset>

							<p>�����������<input type="button" value="����" id="switch_cyclebill" /></p>
							<div id="cyclebill_wrapper">
								<table>
									<caption>�������������</caption>
									<tbody>
										<tr>
											<th>�����ʬ</th>
											<td><?php echo $selectors['bill']['src'];?></td>
											<th>���᡺��</th>
											<td><?php echo $selectors['cutofday']['src'];?></td>
											<th>�����������</th>
											<td><?php echo $selectors['cycle']['src'];?></td>
											<th>�����</th>
											<td><?php echo $selectors['paymentday']['src'];?></td>
										</tr>
										<tr>
											<!-- 2014-01-23 �ѻ�
											<th>�����ʬ</th>
											<td><?php echo $selectors['sales']['src'];?></td>
											<th>�����ʬ</th>
											<td><?php echo $selectors['receipt']['src'];?></td>
											-->
											<!-- 2014-05-01 �ѻ�
											<th>�Ƿ׻���ʬ</th>
											<td><?php echo $selectors['tax']['src'];?></td>
											-->
											<th>���������</th>
											<td><?php echo $selectors['charge']['src'];?>&nbsp;��ô</td>
											<td colspan="4"></td>
										</tr>
									</tbody>
								</table>
							</div>

							<table>
								<tbody>
									<tr>
										<th>͹���ֹ�</th>
										<td>
											<input type="text" name="zipcode" value="" size="10" id="zipcode1" class="forZip" onchange="AjaxZip3.zip2addr(this,'','addr0','addr1');">
										</td>
									</tr>
									<tr>
										<th>��ƻ�ܸ�</th>
										<td>
											<input type="text" name="addr0" value="" size="10" id="addr0" placeholder="��ƻ�ܸ�" maxlength="4">
										</td>
									</tr>
									<tr><th>���꣱</th>
										<td>
											<input type="text" name="addr1" value="" size="100" id="addr1" maxlength="56" class="restrict">
											<div class="pulldown">
												<div id="address_wrapper1" class="popup_wrapper">
													<div class="inner">
														<p class="popup_title">Address List<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
														<div id="address_list1" class="result_list"></div>
													</div>
												</div>
											</div>
										</td>
									</tr>
									<tr><th>���ꣲ</th><td><input type="text" name="addr2" value="" size="100" id="addr2" placeholder="�ޥ󥷥�󡦥ӥ�̾" maxlength="32" class="restrict" /></td></tr>
									<tr><th>��ҡ����磱</th><td><input type="text" name="addr3" value="" size="100" id="addr3" maxlength="50" class="restrict" /></td></tr>
									<tr><th>��ҡ����磲</th><td><input type="text" name="addr4" value="" size="100" id="addr4" maxlength="50" class="restrict" /></td></tr>
									<tr><th>������</th><td><textarea name="customernote" rows="4" id="customernote"></textarea></td></tr>
								</tbody>
							</table>
						</form>

					</div>
				</div>

				<div class="phase_box freeform" id="delivery_address_wrapper">
					<h2 class="ordertitle">��Ǽ���轻��</h2>
					<div class="inner">
						<form id="delivery_form" name="delivery_form" action="" onsubmit="return false;">
							<p>
								<input type="button" value="��������" id="modify_delivery" />&nbsp;
								<input type="button" value="�����Ʊ��" id="deliveryaddr" />&nbsp;
								<input type="button" value="������ɽ������" id="show_delivery" />
								<input type="reset" value="�ꥻ�å�" id="clear_delivery" />
							</p>
							<div class="pulldown">
								<div id="result_delivery_wrapper" class="popup_wrapper">
									<div class="inner">
										<p class="popup_title">�������<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
										<div class="result_list"></div>
									</div>
								</div>
							</div>
							<fieldset>
								<legend>��</legend>
								<table>
									<tbody>
										<tr>
											<th>Ǽ����ID</th>
											<td><input type="text" name="delivery_id" value="" size="15" readonly="readonly" class="nostyle" /></td>
										</tr>
										<tr>
											<th>������</th>
											<td><input type="text" name="organization" value="" size="64" maxlength="32" class="restrict" /></td>
										</tr>
										<!--
										<tr>
											<th>ô����</th><td><input type="text" name="agent" value="" size="20" /></td>
											<th>���饹</th><td><input type="text" name="team" value="" size="20" /></td>
											<th>����</th><td><input type="text" name="teacher" value="" size="20" /></td>
										</tr>
										-->
									</tbody>
								</table>
							</fieldset>
							<table>
								<tbody>
									<tr>
										<th>͹���ֹ�</th>
										<td>
											<input type="text" name="delizipcode" value="" size="10" id="zipcode2" class="forZip" onchange="AjaxZip3.zip2addr(this,'','deliaddr0','deliaddr1');">
										</td>
									</tr>
									<tr>
										<th>��ƻ�ܸ�</th>
										<td>
											<input type="text" name="deliaddr0" value="" size="10" id="deliaddr0" placeholder="��ƻ�ܸ�" maxlength="4">
										</td>
									</tr>
									<tr><th>���꣱</th>
										<td>
											<input type="text" name="deliaddr1" value="" size="100" id="deliaddr1" maxlength="56" class="restrict" />
											<div class="pulldown">
												<div id="address_wrapper2" class="popup_wrapper">
													<div class="inner">
														<p class="popup_title">Address List<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
														<div id="address_list2" class="result_list"></div>
													</div>
												</div>
											</div>
										</td>
									</tr>
									<tr><th>���ꣲ</th><td><input type="text" name="deliaddr2" value="" size="100" id="deliaddr2" placeholder="�ޥ󥷥�󡦥ӥ�̾" maxlength="32" class="restrict" /></td></tr>
									<tr><th>��ҡ����磱</th><td><input type="text" name="deliaddr3" value="" size="100" id="deliaddr3" maxlength="50" class="restrict" /></td></tr>
									<tr><th>��ҡ����磲</th><td><input type="text" name="deliaddr4" value="" size="100" id="deliaddr4" maxlength="50" class="restrict2" /></td></tr>
									<tr><th>TEL</th><td><input type="text" name="delitel" value="" size="24" class="forPhone" /></td></tr>
								</tbody>
							</table>
						</form>
					</div>
					
					<h2 class="ordertitle">��ȯ����</h2>
					<div class="inner">
						<form id="shipfrom_form" name="shipfrom_form" action="" onsubmit="return false;">
							<p>
								<input type="button" value="�����Ʊ��" id="shipfromaddr" />&nbsp;
								<input type="button" value="������ɽ������" id="show_shipfrom" />
							</p>
							<div class="pulldown">
								<div id="result_shipfrom_wrapper" class="popup_wrapper">
									<div class="inner">
										<p class="popup_title">�������<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
										<div class="result_list"></div>
									</div>
								</div>
							</div>
							<fieldset>
								<legend>��</legend>
								<table>
									<tbody>
										<tr><th>�եꥬ��</th><td><input type="text" name="shipfromruby" value="" size="64" /></td></tr>
										<tr><th>�����̾</th><td><input type="text" name="shipfromname" value="" size="64" maxlength="32" class="restrict" /></td></tr>
									</tbody>
								</table>
							</fieldset>
							<table>
								<tbody>
									<tr>
										<th>͹���ֹ�</th>
										<td colspan="3">
											<input type="text" name="shipzipcode" value="" size="10" id="zipcode3" class="forZip" onchange="AjaxZip3.zip2addr(this,'','shipaddr0','shipaddr1');">
										</td>
									</tr>
									<tr>
										<th>��ƻ�ܸ�</th>
										<td colspan="3">
											<input type="text" name="shipaddr0" value="" size="10" id="shipaddr0" placeholder="��ƻ�ܸ�" maxlength="4">
										</td>
									</tr>
									<tr>
										<th>���꣱</th>
										<td colspan="3">
											<input type="text" name="shipaddr1" value="" size="100" id="shipaddr1" maxlength="56" class="restrict" />
											<div class="pulldown">
												<div id="address_wrapper3" class="popup_wrapper">
													<div class="inner">
														<p class="popup_title">Address List<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
														<div id="address_list3" class="result_list"></div>
													</div>
												</div>
											</div>
										</td>
									</tr>
									<tr><th>���ꣲ</th><td colspan="3"><input type="text" name="shipaddr2" value="" size="100" id="shipaddr2" placeholder="�ޥ󥷥�󡦥ӥ�̾" maxlength="32" class="restrict" /></td></tr>
									<tr><th>��ҡ����磱</th><td colspan="3"><input type="text" name="shipaddr3" value="" size="100" id="shipaddr3" maxlength="50" class="restrict" /></td></tr>
									<tr><th>��ҡ����磲</th><td colspan="3"><input type="text" name="shipaddr4" value="" size="100" id="shipaddr4" maxlength="50" class="restrict" /></td></tr>
									<tr>
										<th>TEL</th><td><input type="text" name="shiptel" value="" size="20" class="forPhone" /></td>
										<th>FAX</th><td><input type="text" name="shipfax" value="" size="20" class="forPhone" /></td>
									</tr>
									<tr>
										<th>E-Mail</th><td colspan="3"><input type="text" name="shipemail" value="" size="36" /></td>
									</tr>
								</tbody>
							</table>
						</form>
					</div>
				</div>

				<div class="phase_box">
					<h2 class="ordertitle">�����󥱡���</h2>
					<div class="inner">
						<table id="questionnaire_table">
							<tbody>
								<tr>
									<td rowspan="4" class="separate">�ѡ���</td>
									<td class="label">���٥��</td>
									<td>
										<p>
											<label><input type="radio" name="purpose" value="ʸ����" />ʸ����</label>
											<label><input type="radio" name="purpose" value="�ΰ��" />�ΰ��</label>
											<label><input type="radio" name="purpose" value="��¥��" />��¥��</label>
											<label><input type="radio" name="purpose" value="�뺧��" />�뺧��</label>
											<label><input type="radio" name="purpose" value="���󥵡���" />���󥵡���</label>
											<label><input type="radio" name="purpose" value="��ȥ��٥��" />��ȥ��٥��</label>
											<br>
											<label><input type="radio" name="purpose" value="���ݡ��ĥ��٥��" />���ݡ��ĥ��٥��</label>
											<label><input type="radio" name="purpose" value="����" />����</label>
											<label><input type="radio" name="purpose" value="���פ�" />���פ�</label>
											<label><input type="radio" name="purpose" value="�ܥ��ƥ���" />�ܥ��ƥ���</label>
											<label><input type="radio" name="purpose" value="��ǰ���٥��" />��ǰ���٥��</label>
											<br>
											<label><input type="radio" name="purpose" value="����¾���٥��" />����¾</label>
											<input type="text" value="" class="purpose_text other_1" />
										</p>
									</td>
								</tr>
								<tr>
									<td class="label">��˥ե�����</td>
									<td>
										<p>
											<label><input type="radio" name="purpose" value="�����˥ե�����" />������</label>
											<label><input type="radio" name="purpose" value="���ݡ��ĥ�˥ե�����" />���ݡ�����</label>
											<label><input type="radio" name="purpose" value="����Ź��" />����Ź��</label>
											<label><input type="radio" name="purpose" value="���š���ʡ����" />���š���ʡ����</label>
											<label><input type="radio" name="purpose" value="��̳����" />��̳����</label>
											<br>											
											<label><input type="radio" name="purpose" value="�������롦����" />�������롦����</label>
											<label><input type="radio" name="purpose" value="����¾��˥ե�����" />����¾</label>
											<input type="text" value="" class="purpose_text other_2" />
										</p>
									</td>
								</tr>
								<tr>
									<td class="label">�Ŀ�</td>
									<td>
										<p>
											<label><input type="radio" name="purpose" value="��ʬ��" />��ʬ��</label>
											<label><input type="radio" name="purpose" value="�ץ쥼���" />�ץ쥼�����</label>
										</p>
									</td>
								</tr>
								<tr class="separate">
									<td class="label">����¾</td>
									<td>
										<p>
											<label><input type="radio" name="purpose" value="����¾����" />����¾����</label>
											<input type="text" value="" class="purpose_text other_3" />
											<label><input type="radio" name="purpose" value="" checked="checked" />̤��</label>
										</p>
									</td>
								</tr>
								<tr>
									<td>������</td>
									<td colspan="2">
										<p>
											<label><input type="radio" name="job" value="ˡ��" />ˡ��</label>
											<label><input type="radio" name="job" value="���ع�" />���ع�</label>
											<label><input type="radio" name="job" value="��ع�" />��ع�</label>
											<label><input type="radio" name="job" value="�⹻" />�⹻</label>
											<label><input type="radio" name="job" value="���" />���</label>
										</p>
										<p>
											<label><input type="radio" name="job" value="����ع�" />����ع�</label>
											<label><input type="radio" name="job" value="��Ұ�" />�Ҳ��</label>
											<label><input type="radio" name="job" value="����" />����</label>
											<label><input type="radio" name="job" value="����¾" />����¾</label>
										</p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="phase_box freeform" id="page_border">
					<h2 class="ordertitle">��������</h2>
					<div class="inner">
						<p class="scrolltop"><a href="#order_wrapper">�ڡ����ȥåפ�</a></p>
						<p><textarea id="order_comment" cols="80" rows="8"></textarea></p>
						<div class="clearfix">
							<div class="leftside">
								<p>Ǽ�ʽ��Ŧ��</p>
								<p><textarea id="invoicenote" cols="80" rows="3"></textarea></p>
							</div>
							<div class="rightside">
								<p>����������</p>
								<p><textarea id="billnote" cols="80" rows="3"></textarea></p>
							</div>
						</div>
						
					</div>
				</div>

			<!--
				<div id="confirm_button"></div>
			 -->

			</div>



			<div id="floatingbox">
				<h3>���Ѥ���</h3>
				<div class="estimate_body">
					<table id="est_table1">
						<tbody>
							<tr><th>������</th><td id="est_price">0</td></tr>
							<tr>
								<th>������ <input type="checkbox" value="1" name="free_printfee" id="free_printfee" /><label for="free_printfee">������</label></th>
								<td><input type="text" value="0" name="est_printfee" id="est_printfee" readonly="readonly" class="forPrice readonly" /></td>
							</tr>
							<tr><th class="sub">���륯</th><td id="est_silk_printfee">0</td></tr>
							<tr><th class="sub">���顼ž��</th><td id="est_color_printfee">0</td></tr>
							<tr><th class="sub">�ǥ�����ž��</th><td id="est_digit_printfee">0</td></tr>
							<tr><th class="sub">���󥯥����å�</th><td id="est_inkjet_printfee">0</td></tr>
							<tr><th class="sub">���åƥ���</th><td id="est_cutting_printfee">0</td></tr>
							<tr><th>���󥯿��ؤ�</th><td id="est_exchink">0</td></tr>
							<tr class="separate"><th>�ɲ�����</th><td id="est_additionalfee">0</td></tr>
							<tr><th><p class="fontred">�����</p></th><td id="est_discount" class="fontred">0</td></tr>
							<tr class="separate"><th><p class="fontred">�Ͱ���</p></th><td id="est_reduction" class="fontred">0</td></tr>
							<tr class="separate"><th id="pack_mode">�޵ͤ���</th><td id="est_package">0</td></tr>
							<tr><th>�õ�����</th><td id="est_express">0</td></tr>
							<tr class="separate"><th>����</th><td id="est_carriage">0</td></tr>
							<!--<tr class="separate"><th>��������</th><td id="est_extracarry">0</td></tr>-->
							<tr><th>�ǥ�������</th><td id="est_designfee">0</td></tr>
							<tr><th>��������</th><td id="est_codfee">0</td></tr>
							<tr><th>����ӥ˼����</th><td id="est_conbifee">0</td></tr>
						</tbody>
					</table>
				</div>

				<table class="estimate_total" id="est_table2">
					<tfoot><tr><td colspan="2"><img alt="firmorder" src="./img/btn_firmorder.png" height="30" id="firm_order" /></td></tr></tfoot>
					<tbody>
						<tr><th>��</th><td id="est_basefee">0</td></tr>
						<tr><th>������</th><td id="est_salestax">0</td></tr>
						<tr><th>�����ɼ����</th><td id="est_creditfee">0</td></tr>
						<tr class="total division"><th>���</th><td id="est_total_price">0</td></tr>
						<tr class="separate"><td colspan="2"></td></tr>
						<tr><th>���</th><td><span id="est_amount">0</span>��</td></tr>
						<tr class="division"><th>1�礢����</th><td id="est_perone">0</td></tr>
						<tr class="separate"><td colspan="2"></td></tr>
						<tr class="total"><th>ͽ��</th><td><input type="text" value="0" id="est_budget" name="budget" class="forPrice" />&nbsp;��</td></tr>
						<tr class="separate"><td colspan="2"></td></tr>
					</tbody>
				</table>
			</div>

		</div>

		<div id="order_footer" class="footer">
			<div class="button_centerarea">
			<!--
				<form action="./documents/" target="_brank" method="post" name="estimatedoc_form" onsubmit="return false">
					<input type="hidden" name="doctype" value="" />
					<input type="hidden" name="orderid" value="" />
					<input type="hidden" name="page_format" value="A4" />
					<input type="hidden" name="page_fontsize" value="8" />
					<input type="hidden" name="param" value="" />
					<input type="hidden" name="mode" value="" />

					<img alt="estimation_mail" src="./img/btn_estimation_mail.png" height="40" />
					<img alt="estimation_print" src="./img/btn_estimation_print.png" height="40" />
				</form>
			-->
			</div>
			<div class="clearfix">
				<img alt="saveall" src="./img/btn_save.png" height="25" class="saveall" />
				<input type="image" src="./img/btn_gomenu.png" class="gotomenu" />
			</div>
		</div>

	</div>

	<div id="direction_wrapper" class="wrapper">
		<div class="maincontents">

			<div class="phase_box">
				<h2 class="directiontitle">���ץ��ȥ�����<span id="direction_selector"></span></h2>
			</div>

			<div id="dire_title" class="clearfix">
				<div>
					<p><span class="printtype_name"></span>��<span>����ؼ���</span><span id="factory_name"></span><span id="curr_printtype"></span></p>
					<p>��������<span id="created"></span>��ʸID��<span></span>�ܵ�No��<span></span>����ô����<span></span></p>
					<p class=print_title>��̾��<span></span></p>
				</div>
				<div>
					<p>ȯ������<span id="shipping_date"></span>ȯ</p>
					<p>��������<span id="delivery_date"></span><span id="delivery_time"></span>��</p>
					<!--
					<table>
					<tbody>
						<tr>
							<th><p id="shipping_year"></p></th>
							<td rowspan="3">
								
							</td>
						</tr>
						<tr><th><p id="shipping_date"></p></th></tr>
						<tr><th id="shipment"></th></tr>
					</tbody>
					</table>
					-->
				</div>
			</div>

			<div id="tabs">
				<ul>
					<li><a href="#tabs-1">���ܥǡ���</a></li>
				</ul>
				<div id="tabs-1">
					<div class="tabs_wrapper">
						<div id="leftarea">
							<table>
								<tbody>
									<tr>
										<td>
											<label>���ʼ���</label>
											<span id="arrange"></span>
											<!--
											<select id="arrange">
												<option value="1">��ʸ</option>
												<option value="2">����</option>
											</select>
											-->
										</td>
										<td>
											<label>����ͽ����</label>
											<span id="arrive"></span>
										</td>
									</tr>
								</tbody>
							</table>
							<table id="dire_items_table">
								<thead>
									<tr><th>����</th><th>�᡼����</th><th>���ʤο�</th><th>������</th><th>���</th><th>����</th></tr>
								</thead>
								<tfoot><tr><td colspan="5">���</td><td><span></span>��</td></tr></tfoot>
								<tbody><tr><td colspan="6"></td></tr></tbody>
							</table>
							
							<div id="dire_note_wrapper">
								<div class="direction_note">
									<div><textarea cols="30" rows="10" id="workshop_note"></textarea></div>
									<p>���������<input type="button" value="��¸" onclick="mypage.save('direction')" /></p>
								</div>
							</div>
						</div>

						<div id="rightarea">
							<table id="dire_delivery_table">
								<caption>�в���ˡ</caption>
								<tbody>
									<tr>
										<th>�޵ͤ�</th><td class="package">--</td>
										<th>Ȣ��</th><td><span id="numberofbox">0</span> Ȣ</td>
										<th>����</th>
										<td>
											<select id="envelope">
												<option value="0">�ʤ�</option>
												<option value="1">����</option>
											</select>
										</td>
										<td colspan="2"></td>
									</tr>
									<tr class="sectionSeparator"><td colspan="8"></td></tr>
									<tr>
										<!--<th>�ֵ�ʪ</th><td colspan="3"><textarea id="ret_note"></textarea></td>-->
										<th>����</th><td colspan="7"><textarea id="ship_note"></textarea></td>
									</tr>
									<tr class="sectionSeparator"><td colspan="8"></td></tr>
									<tr>
										<th>������</th>
										<td colspan="5">
											<p>��<span class="zipcode">-</span></p>
											<p class="addr1">��Ͽ�ʤ�</p>
											<p class="addr2"> </p>
										</td>
										<td colspan="2" style="vertical-align: bottom;"><p>TEL��<span class="delitel"></span></p></td>
									</tr>
								</tbody>
							</table>
							
							<div class="jobtime_wrapper clearfix">
								<div class="title">����</div>
								<div>
									<select id="platescheck">
										<option value="0">�����</option>
										<option value="1" selected="selected">����</option>
										<option value="2">����</option>
									</select>
								</div>
								<div class="title">�����ȸ�</div>
								<div>
									<select id="pastesheet">
										<option value="1" selected="selected">�ʥ������</option>
										<option value="2">����</option>
									</select>
								</div>
								<div class="title">ž�̤դ�</div>
								<div>
									<select id="edge">
										<option value="1" selected="selected">��դ�</option>
										<option value="2">�����ѡ�</option>
										<option value="3">ǻ��Ʃ��</option>
										<option value="4">ø��Ʃ��</option>
										<option value="5">���ڤ�</option>
										<option value="6">���륯ž��</option>
									</select>
								</div>
								<div class="title edgecolor_wrap" style="display:none">��</div>
								<div class="edgecolor_wrap" style="display:none">
									<input type="text" value="" id="edgecolor" />
								</div>
							
							</div>
							<div class="jobtime_wrapper clearfix">
								<div class="title">�ǿ�</div>
								<div><input type="text" value="" id="platescount" class="forNum" />��</div>
							</div>
							
							<table id="dire_option_table">
								<caption>���դ�</caption>
								<tfoot><tr><td colspan="2"></td><td><input type="button" value="�ɲ�" id="add_cutpattern" /></td></tr></tfoot>
								<tbody>
									<tr>
										<td><input type="text" value="" class="shotname" /></td>
										<td><input type="text" value="0" class="shot" class="forNum" /> �� �� <input type="text" value="0" class="sheets" class="forNum" /> ������</td>
										<td>��</td>
									</tr>
									
								<!--
									<tr class="type_common">
										<th>��</th>
										<td>
											<select id="platescheck">
												<option value="0">�����</option>
												<option value="1" selected="selected">����</option>
												<option value="2">����</option>
											</select>
										</td>
										<th>��å���</th>
										<td class="mesh_wrap">
											<div id="mesh" style="width:100px; height:30px;"></div>
										</td>
										<th>���󥯼���</th>
										<td><input type="text" value="" id="medome" readonly="readonly" /></td>
									</tr>
									<tr class="sectionSeparator"><td colspan="6"></td></tr>
									<tr>
										<th class="type_digit">����</th>
										<td class="type_digit"><input type="text" value="" id="cutpattern" class="forNum" /></td>
										<th class="type_trans" style="width:65px;">�����ȿ�</th>
										<td class="type_trans"><input type="text" value="0" id="sheetcount" class="forNum" /></td>
										<th class="type_common">�ǿ�</th>
										<td class="type_common"><input type="text" value="" id="platescount" class="forNum" />��</td>
									</tr>
									<tr class="sectionSeparator"><td colspan="6"></td></tr>
								-->
								</tbody>
							</table>

							<div id="mesh" style="width:100px; height:30px; display:none;"></div>
							
							<div id="printinfo_wrapper"></div>

						</div>
					</div>
				</div>

			</div>

		</div>

		<div id="direciton_footer" class="footer">
			<div class="button_centerarea">
				<img alt="orderform" src="./img/btn_orderform_print.png" height="40" />
			</div>
			<input type="image" src="./img/btn_gomenu.png" class="gotomenu" />
		</div>
	</div>


	<div id="main_wrapper" class="wrapper">
		<div class="maincontents">

			<div>

				<fieldset>
					<legend>���������ե�����</legend>
					<div class="clearfix">
						<form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">
							<div>
								<table style="width:100%;">
									<tbody>
										<tr>
											<th>������</th>
											<td colspan="3">
												<input type="text" value="" name="lm_from" size="10" class="forDate datepicker" /> ��<input type="text" value="" name="lm_to" size="10" class="forDate datepicker" />
												<input type="button" value="���ꥢ" id="clear_lastmodified" class="btn" >
												<span style="padding-left:10px;">����ô��</span>
												<select name="staff_id" id="staff_id" class="staff" rel="rowid1">
													<?php echo $staff_selector; ?>
												</select>
											</td>
										</tr>
										<tr>
											<th>ȯ����</th>
											<td colspan="3">
												<input type="text" value="" name="term_from" id="term_from" size="10" class="forDate datepicker" /> ��<input type="text" value="" name="term_to" id="term_to" size="10" class="forDate datepicker" />
												<input type="button" value="���ꥢ" id="clear_term" class="btn" >
												<span style="padding-left:10px;">����</span>
												<select name="factory">
													<option value="0" selected="selected">----</option>
													<option value="1">�裱����</option>
													<option value="2">�裲����</option>
													<option value="9">�裱��������</option>
												</select>
											</td>
										</tr>
										<tr>
											<th>����No.</th>
											<td><input type="text" value="" name="id" size="6" class="forBlank" /></td>
											<th>�ꡡ��̾</th>
											<td><input type="text" value="" name="maintitle" size="30" /></td>
										</tr>
									</tbody>
								</table>
								
								<ul class="crumbs" id="acceptstatus_navi">
									<li><p class="active_crumbs">����</p></li>
									<li><p>Web��ʸ</p></li>
									<li><p>��礻</p></li>
									<li><p>���Ѥ�᡼���</p></li>
									<li><p>�����</p></li>
									<li><p>��ʸ����</p></li>
									<li><p>���</p></li>
								</ul>
							</div>
							<div>
								<table style="width: 520px;">
									<tbody>
										<tr>
											<th>�ܵ�ID</th>
											<td><input type="text" value="" name="number" size="6" /></td>
											<th>�����</th>
											<td>
												<select name="imagecheck">
													<option value="" selected="selected">----</option>
													<option value="2">̤����</option>
													<option value="1">������</option>
												</select>
											</td>
										</tr>
										<tr>
											<th>����</th>
											<td><input type="text" value="" name="customerruby" size="25" /></td>
											<th>����</th>
											<td><input type="text" value="" name="companyruby" size="25" /></td>
										</tr>
										<tr>

											<th>�ܵ�̾</th>
											<td><input type="text" value="" name="customername" size="25" /></td>
											<th>ô��</th>
											<td><input type="text" value="" name="company" size="25" /></td>
										</tr>
									</tbody>
								</table>
							</div>
						</form>
					</div>

					<p class="btn_area">
						<input type="button" value="����" title="search" />
						<select id="sort">
							<option value="0">����</option>
							<option value="1" selected="selected">�߽�</option>
						</select>
						<input type="button" value="reset" title="reset" />&nbsp;<input type="button" value="���� ������ʸ�μ��� �١�" title="order" />
						<select id="applyto">
							<option value="0" selected="selected">�̾�</option>
							<option value="1">Self-Design</option>
						</select>
						<input type="hidden" value="" name="progress_id" id="progress_id" />
					</p>
				</fieldset>

				<div id="result_wrapper" style="display:block;">
				<!--
					<p class="submenu">
						<span class="btn_pagenavi" title="searchform">&lt;&lt; �����ե������</span>
						<span class="dept">
							<span class="btn_pagenavi" title="order">������ʸ�μ���</span>
							<span class="chk_pagenavi chk_active corner-left" title="applyto">�̾�</span><span class="chk_pagenavi corner-right" title="applyto">Self-Design</span>
						</span>
					</p>
				-->
					<p class="pagenavi">�������<span id="result_count">0</span>��</p>
					<div id="result_searchtop"></div>
				</div>

			</div>

		</div>

<!--
		<div id="main_footer" class="footer">
			<p>Copyright &copy; 2008-<?php echo date('Y');?> ���ꥸ�ʥ�ԥ���ĤΥ����ϥޥ饤�ե����� All rights reserved.</p>
		</div>
-->
	</div>



	<div id="log_wrapper">
		<div class="inner">
			<p>
				<input type="text" value="" id="against" /><input type="button" value="����" id="search_log" />
				<input type="button" value="���ϲ��̤�" id="showtoggle" />
				<input type="button" value="���ꥢ" id="cleareditor" />
				<input type="button" value="���ꥹ�Ȥ򳫤�" id="listtoggle" />
				<img alt="�Ĥ���" src="./img/cross.png" class="close_popup_log" />
			</p>
			<div id="log_editor">
				<form name="logeditor_form" action="" onsubmit="return false">
					<textarea cols="50" rows="6" id="log_text" name="log_text"></textarea>
					<div class="del_wrapper"><input type="button" value="���" id="delete_log" /></div>
					<p>ô����
						<select id="log_staff" name="log_staff"><?php echo $staff_selector; ?></select>
						<input type="button" value="����������" id="modify_log" />
						<input type="button" value="���������" id="save_log" />
					</p>

					<input type="hidden" value="" name="cstlogid" />
				</form>
			</div>
			<div id="list_wrapper">
				<div class="pan">
					<p>������</p>
					<p class="pan_res"><strong id="searchword"></strong> �θ�����̰�����<span id="init_pane">���ƤΥ�������</span></p>
				</div>
				<div class="pane">
					<table>
						<tbody>
							<tr><td colspan="4">��</td></tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<div id="mailer_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Takahama Life Art<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="popup_inner"></div>
			</div>
		</div>
	</div>

	<div id="itemcolor_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Item Color<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="itemcolor_list"></div>
			</div>
		</div>
	</div>

	<div id="itemsize_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Size<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="itemsize_list"></div>
			</div>
		</div>
	</div>

	<div id="inkcolor_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Ink Color<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="inkcolor_list"></div>
			</div>
		</div>
	</div>

	<div id="printposition_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Print Type<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="printposition_list"></div>
			</div>
		</div>
	</div>

	<div id="bundle_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Ʊ���ꥹ��<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="bundle_list"></div>
			</div>
		</div>
	</div>

	<div id="print_calculator" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">�ץ����塡�׻���<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
			<div class="calc_inner">

				<table>
					<thead><tr><th>����</th><th>����</th><th>�礭��</th></tr></thead>
				 	<tbody>
				 	<?php
				 		$html="";
				 		for($c=0; $c<5; $c++){
				 			$html .= '<tr>';
					 		$html .= '	<td>';
					 		$html .= '		<select class="calc_print_position">';
					 		$html .= '			<option value="" selected="selected">-</option>';
							$html .= '			<option value="mae">��</option>';
							$html .= '			<option value="mune_right">����</option>';
							$html .= '			<option value="mune_left">����</option>';
							$html .= '			<option value="suso_right">������</option>';
							$html .= '			<option value="suso_left">������</option>';
							$html .= '			<option value="suso_mae">������</option>';
							$html .= '			<option value="waki_right">����</option>';
							$html .= '			<option value="waki_left">����</option>';
							$html .= '			<option value="sode_right">������</option>';
							$html .= '			<option value="sode_left">������</option>';
							$html .= '			<option value="usiro">��</option>';
							$html .= '			<option value="kubi_usiro">���</option>';
							$html .= '			<option value="usiro_suso_right">�屦��</option>';
							$html .= '			<option value="usiro_suso_left">�庸��</option>';
							$html .= '			<option value="usiro_suso">�夹��</option>';
							$html .= '		</select>';
					 		$html .= '	</td>';
					 		$html .= '	<td>';
					 		$html .= '		<select class="calc_ink_count">';
							$html .= '			<option value="0" selected="selected">0</option>';
							for($i=1; $i<10; $i++){
								$html .= '<option value="'.$i.'">'.$i.'</option>';
							}
							$html .= '		</select>';
					 		$html .= '	</td>';
					 		$html .= '	<td>';
					 		$html .= '		<select class="calc_print_size">';
							$html .= '			<option value="0" selected="selected">��</option>';
							$html .= '			<option value="1">��</option>';
							$html .= '			<option value="2">��</option>';
							$html .= '		</select>';
					 		$html .= '	</td>';
					 		$html .= '	<td><p class="calc_print_type"></p></td>';
					 		$html .= '	<td><p class="calc_price"><span>0</span>&nbsp;��</p></td>';
					 		$html .= '</tr>';
				 		}
				 		echo $html;
				 	?>
				 		<tr>
							<td colspan="3" class="toright"></td>
							<td class="toright">���륯����</td>
							<td><p class="calc_tot_price"><span>0</span>&nbsp;��</p></td>
						</tr>
						<tr>
							<td colspan="3" class="toright"></td>
							<td class="toright">���顼ž�̡���</td>
							<td><p class="calc_tot_price"><span>0</span>&nbsp;��</p></td>
						</tr>
						<tr>
							<td colspan="3" class="toright"></td>
							<td class="toright">���󥯥����åȡ���</td>
							<td><p class="calc_tot_price"><span>0</span>&nbsp;��</p></td>
						</tr>
						<tr>
							<td colspan="3" class="toright"></td>
							<td class="toright">�硡��</td>
							<td><p class="calc_tot_price"><span>0</span>&nbsp;��</p></td>
						</tr>
				 	</tbody>
				 </table>

				 <table>
				 	<tbody>
				 		<tr>
				 			<td>����Ψ
				 				<select id="calc_ratio">
				 					<option value="1" selected="selected">1</option>
				 					<option value="1.25">1.25</option>
				 					<option value="1.3">1.3</option>
				 					<option value="1.35">1.35</option>
				 					<option value="1.5">1.5</option>
				 					<option value="1.1">1.1</option>
				 				</select>
				 			</td>
				 			<td><input type="checkbox" id="chkRepeat"/><label for="chkRepeat">&nbsp;��ԡ�����</label></td>
				 		</tr>
				 	</tbody>
				</table>

				<p>
					���&nbsp;<input type="text" value="0" id="calc_amount" class="forNum" />&nbsp;��
				 	<input type="button" value="�׻�" id="calc_printfee" />
				 	<input type="button" value="reset" id="calc_reset" />
				</p>
			</div>
		</div>
	</div>

<!-- 2012-08-30 �ݥåץ��åפλ����ѹ�
	<div id="toolbox">
		<div id="tool_inner">

			<h2>TOOL BOX</h2>

			<div class="clearfix">
				<div class="leftside">
					<h3>����<span>Print</span></h3>
					<div>
						<input type="button" value="���ѽ�" alt="print_estimation" />
						<input type="button" value="�����" alt="print_bill" />
						<input type="button" value="Ǽ�ʽ�" alt="print_delivery" />
					</div>
					<div>
						<input type="button" value="�ȥॹȯ���" disabled="disabled" alt="toms_edi" />
					</div>

				</div>

				<div class="rightside">
					<h3>�᡼��<span>E-mail</span></h3>
					<div>
						<input type="button" value="������" alt="mail_estimation" />
					</div>
					<div>
						<p>��ʸ����</p>
						<p><input type="button" value="��ʸ������" alt="mail_orderbank" /></p>
						<p><input type="button" value="��ʸ�����" alt="mail_ordercod" /></p>
						<p><input type="button" value="��ʸ������" alt="mail_ordercash" /></p>
					</div>
				</div>
			</div>
			
			<div>
				<p><label><input type="checkbox" value="1" name="cancelshipmail" onchange="mypage.sendmailcheck(this);" /> ȯ���᡼������</label></p>
				<p><label><input type="checkbox" value="1" name="canceljobmail" onchange="mypage.sendmailcheck(this);" /> ����ϥ᡼������</label></p>
				<p><label><input type="checkbox" value="1" name="cancelarrivalmail" onchange="mypage.sendmailcheck(this);" /> ���ʤ������ǧ�᡼������</label></p>
			</div>
			
			<input class="closeModalBox" type="hidden" name="customCloseButton" value="" />
		</div>
	</div
-->

	<div id="message_wrapper" style="display:none;"></div>

	<iframe name="upload_iframe" style="width: 400px; height: 100px; display: none;"></iframe>
    
    <div id="printform_wrapper"><iframe id="printform" name="printform"></iframe></div>
        
</body>
</html>