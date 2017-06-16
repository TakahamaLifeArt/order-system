<?php
	require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
	require_once dirname(__FILE__).'/php_libs/mainmenu_list.php';
	require_once dirname(__FILE__).'/php_libs/MYDB.php';
	
	
	// �������Ϥ�����ä��褿���
	if(isset($_GET['filename'])) {
		$detailID = $_GET['customer_id'];
		$start_row = $_GET['start_row'];
		
		$pos = strpos($_SERVER['QUERY_STRING'], 'filename=');
		$query_string = substr($_SERVER['QUERY_STRING'], $pos);
		
		$hash = explode('&', $query_string);
		for($i=0; $i<count($hash); $i++){
			$tmp = explode('=', $hash[$i]);
			if($tmp[0]=='filename' || $tmp[0]=='reappear') continue;
			$q[$tmp[0]] = $tmp[1];
		}
	}else{
		$start_row = 0;
	}

	// ��ʸ�������������
	if(isset($_GET['cst'])) $customerID = $_GET['cst'];
	
	
	$conn = db_connect();
	$selectors = array('sales'=>array('def'=>2,'src'=>null),'receipt'=>array('def'=>3,'src'=>null),'bill'=>array('def'=>1,'src'=>null));
	foreach($selectors as $key=>$val){
		try{
			$sql= 'SELECT * FROM '.$key.'type';
                        $result = exe_sql($conn, $sql);
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
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="EUC-JP" />
	<meta name="robots" content="noindex" />
	<title><?php echo _TITLE_SYSTEM; ?></title>
	<meta http-equiv="Content-Style-Type" content="text/css" />
	<meta http-equiv="Content-Script-Type" content="text/javascript" />

	<link rel="stylesheet" type="text/css" media="screen" href="./js/theme/style.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./js/ui/cupertino/jquery.ui.all.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/template.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/customerlist.css" />

	<script type="text/javascript" src="./js/jquery.js"></script>
	<script type="text/javascript" src="./js/jquery.smoothscroll.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.core.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.datepicker.js"></script>
	<script type="text/javascript" src="./js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
	<script type="text/javascript" src="https://ajaxzip3.github.io/ajaxzip3.js" charset="UTF-8" async></script>
	<script type="text/javascript" src="./js/phonedata.js"></script>
	<script type="text/javascript" src="./js/lib/common.js"></script>
	<script type="text/javascript" src="./js/customerlist.js"></script>
	<script type="text/javascript">
		var _ID = "<?php echo $customerID; ?>";
		var _detail = "<?php echo $detailID; ?>";
		var _my_level = "<?php echo $mylevel; ?>";
		var _start_row = <?php echo $start_row; ?>;
	</script>
</head>
<body class="main_bg" id="page_top">
	<div id="overlay"></div>
	<div id="header" class="main_bg">
		<div class="main_header">
			<p class="title">�ܵҰ���</p>
			<?php echo $mainmenu;?>
		</div>
	</div>

	<div id="main_wrapper" class="wrapper">
		<div class="maincontents">

			<div>
				<fieldset id="search_wrapper">
					<legend>�ܵҡ������ե�����</legend>
					<div class="clearfix">
						<form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">

							<table style="width:1100px; float:none;">
								<tbody>
									<tr>
										<th>�ܵ�ID</th>
										<td>
											<input type="text" value="<?php if(isset($q['number'])) echo $q['number']; ?>" name="number" size="6" />
											<input type="hidden" name="id" value="0" />
										</td>
										<th>�ܵ���Ͽ������</th>
										<td colspan="3">
												<select name="reg_site">
													<option value="-1" selected="selected">----</option>
													<option value="1">takahama428</option>
													<option value="5">sweatjack</option>
													<option value="6">staff-tshirt</option>
												</select>
										</td>
									</tr>
									<tr>
										<th>�ܵҥե�</th>
										<td><input type="text" value="<?php if(isset($q['customerruby'])) echo urldecode($q['customerruby']); ?>" name="customerruby" size="30" /></td>
										<th>ô���ե�</th>
										<td><input type="text" value="<?php if(isset($q['companyruby'])) echo urldecode($q['companyruby']); ?>" name="companyruby" size="25" /></td>
										<th>TEL</th>
										<td><input type="text" value="<?php if(isset($q['tel'])) echo $q['tel']; ?>" name="tel" size="20" class="forPhone" /></td>
									</tr>
									<tr>
										<th>�ܵ�̾</th>
										<td><input type="text" value="<?php if(isset($q['customername'])) echo urldecode($q['customername']); ?>" name="customername" size="30" /></td>
										<th>ô����</th>
										<td><input type="text" value="<?php if(isset($q['company'])) echo urldecode($q['company']); ?>" name="company" size="25" /></td>
										<th>E-Mail</th>
										<td><input type="text" value="<?php if(isset($q['email'])) echo $q['email']; ?>" name="email" size="36" /></td>
									</tr>
								</tbody>
							</table>
						
						</form>
					</div>
					<p class="btn_area">
						<input type="button" value="����" title="search" />
						<input type="button" value="reset" title="reset" />
						<input type="button" value=" ������Ͽ " title="addnew" />
					</p>
				</fieldset>

				<div id="result_wrapper">
					<div class="pagenavi">
						<p style="position: absolute;">�������<span id="result_count">0</span>��</p>
						<span class="btn_pagenavi" title="first">�ǽ�� &lt;&lt;&lt;</span>&nbsp;<span class="btn_pagenavi" title="previous">���� &lt;&lt;</span><span class="pos_pagenavi"></span><span class="btn_pagenavi" title="next">&gt;&gt; ����</span>&nbsp;<span class="btn_pagenavi" title="last">&gt;&gt;&gt; �Ǹ��</span>
					</div>
				</div>
				<div id="result_searchtop"></div>

				<div id="detail_wrapper" class="clearfix">
					<p class="submenu"><span class="btn_pagenavi" title="resultlist">&lt;&lt; ���������</span></p>
					
					<div class="pulldown">
						<div id="address_wrapper1" class="popup_wrapper">
							<div class="inner">
								<p class="popup_title">Address List<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
								<div id="address_list1" class="result_list"></div>
							</div>
						</div>
					</div>
					<div class="pulldown">
						<div id="result_customer_wrapper" class="popup_wrapper">
							<div class="inner">
								<p class="popup_title">�������<img alt="�Ĥ���" src="./img/cross.png" class="close_popup" /></p>
								<div class="result_list"></div>
							</div>
						</div>
					</div>

					<div id="input_wrapper">
						<div class="inner">
							<p class="form_title">�ܵҾ���ե�����</p>
							<form action="" name="input_form" onsubmit="return false;">
								<table>
									<tbody>
										<tr>
											<th>�եꥬ��</th><td><input type="text" name="customerruby" value="" size="30" id="customerkana" /></td>
											<th>�եꥬ��</th><td colspan="2"><input type="text" name="companyruby" value="" size="25" /></td>
											<td>�ܵ�ID<span id="customer_num"></span><br>
											��Ͽ������
												<select name="reg_site" id="reg_site">
													<option value="1">takahama428</option>
													<option value="5">sweatjack</option>
													<option value="6">staff-tshirt</option>
												</select></td>
										</tr>
										<tr>
											<th>�ܵ�̾</th><td><input type="text" name="customername" value="" size="30" id="customername" maxlength="32" class="restrict" /></td>
											<th>ô����</th><td colspan="2"><input type="text" name="company" value="" size="25" maxlength="32" class="restrict" /></td>
											<td>
												<select name="cstprefix" id="cstprefix">
													<option value="k" selected="selected">����</option>
													<option value="g">�ȼ�</option>
												</select>
												<input type="hidden" name="customer_id" value="" />
											</td>
										</tr>
										<tr>
											<th>TEL1</th><td><input type="text" name="tel" value="" size="15" id="cus_tel" class="forPhone" /></td>
											<th>TEL2</th><td><input type="text" name="mobile" value="" size="15" class="forPhone" /></td>
											<th>FAX</th><td><input type="text" name="fax" value="" size="15" class="forPhone" /></td>
										</tr>
										<tr>
											<th>Mail1</th><td><input type="text" name="email" value="" size="30" class="imeoff" /></td>
											<th>Mail2</th><td colspan="3"><input type="text" name="mobmail" value="" size="30" class="imeoff" /></td>
										</tr>
										<tr>
											<th>��</th><td><input type="button" value="E-Mail �ƥ���" title="check_email" /></td><td colspan="4"></td>
										</tr>

										<tr>
											<th>͹���ֹ�</th>
											<td colspan="2">
												<input type="text" name="zipcode" value="" size="10" id="zipcode1" class="forZip" onchange="AjaxZip3.zip2addr(this,'','addr0','addr1');" />
											</td><td colspan="3"></td>
										</tr>
										<tr>
											<th>��ƻ�ܸ�</th>
											<td colspan="5"><input type="text" name="addr0" value="" size="10" id="addr0" maxlength="4" /></td>
										</tr>
										<tr>
											<th>���꣱</th>
											<td colspan="5"><input type="text" name="addr1" value="" size="80" id="addr1" maxlength="56" class="restrict" /></td>
										</tr>
										<tr>
											<th>���ꣲ</th>
											<td colspan="5"><input type="text" name="addr2" value="" size="50" id="addr2" maxlength="32" class="restrict" /></td>
										</tr>
										<tr>
											<th>��ҡ����磱</th>
											<td colspan="5"><input type="text" name="addr3" value="" size="80" id="addr3" maxlength="50" class="restrict" /></td>
										</tr>
										<tr>
											<th>��ҡ����磲</th>
											<td colspan="5"><input type="text" name="addr4" value="" size="80" id="addr4" maxlength="50" class="restrict" /></td>
										</tr>
										<tr>
											<td>��°</td>
											<td colspan="5">
												<select id="job" name="job">
													<option value="">-</option>
													<option value="ˡ��">ˡ��</option>
													<option value="�Ŀ�">�Ŀ�</option>
													<option value="���">���</option>
													<option value="�⹻">�⹻</option>
													<option value="���">���</option>
													<option value="����ع�">����ع�</option>
													<option value="����">����</option>
													<option value="����¾">����¾</option>
													<option value="">̤��</option>
												</select>
											</td>
										</tr>
										<tr>
											<th>����</th>
											<td colspan="5"><textarea name="customernote"></textarea></td>
										</tr>
									</tbody>
								</table>

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

								<p class="btn_line">
									<input type="button" value="������" title="update" id="btn_update" onclick="mypage.update_customer(this);" />
									<input type="reset" value="�ꥻ�å�" id="btn_reset_input" />
									<input type="button" value="���" id="btn_delete" onclick="mypage.delete_customer();"/>
								</p>
							</form>

						</div>
					</div>

				</div>

			</div>
		</div>

	</div>

</body>
</html>