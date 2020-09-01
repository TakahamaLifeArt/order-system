<?php
	require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
	require_once dirname(__FILE__).'/php_libs/mainmenu_list.php';
	require_once dirname(__FILE__).'/php_libs/MYDB.php';
	
	
	// �������Ϥ�����ä��褿���
	if(isset($_GET['filename'])) {
		$mode = $_GET['mode'];
		$scroll = $_GET['scroll'];
		
		$pos = strpos($_SERVER['QUERY_STRING'], 'filename=');
		$query_string = substr($_SERVER['QUERY_STRING'], $pos);
		
		$hash = explode('&', $query_string);
		for($i=0; $i<count($hash); $i++){
			$tmp = explode('=', $hash[$i]);
			if($tmp[0]=='filename' || $tmp[0]=='reappear') continue;
			$q[$tmp[0]] = $tmp[1];
		}
	}else{
		$mode = 'progress';
	}
	
	// ô��
	$staff_selector = '<select name="state_7" id="state_7" class="staff" rel="rowid5">';
	try{
		$conn = db_connect();
		$result = exe_sql($conn, 'SELECT * FROM staff where rowid5>0 and staffapply<=curdate() and staffdate>adddate(curdate(), interval -30 day) order by rowid5 ASC');
		$staff_selector .= '<option value="0" selected="selected">----</option>';
		if($result){
			while($rec = mysqli_fetch_array($result)){
				$staff_selector .= '<option value="'.$rec['id'].'">'.mb_convert_encoding($rec['staffname'],'euc-jp','utf-8').'</option>';
			}
		}
	}catch(Exception $e){
		$staff_selector .= '<option value="0">----</option>';
	}
	$staff_selector .= '</select>';
	
	mysqli_close($conn);

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
	<link rel="stylesheet" type="text/css" media="screen" href="./css/stocklist.css" />

	<!--[if IE]><script language="javascript" type="text/javascript" src="./js/jqplot/excanvas.min.js"></script><![endif]-->
	<script type="text/javascript" src="./js/jquery.js"></script>
	<script type="text/javascript" src="./js/jquery.smoothscroll.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.core.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.widget.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.datepicker.js"></script>
	<script type="text/javascript" src="./js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
	<script type="text/javascript" src="./js/lib/common.js"></script>
	<script type="text/javascript" src="./js/stocklist.js?v=<?php echo time(); ?>"></script>
	<script type="text/javascript">
		var _my_level = "<?php echo $mylevel; ?>";
		var _scroll = "<?php echo $scroll; ?>";
		var _MAIN = "<?php echo $_SERVER['SCRIPT_NAME']; ?>";
	</script>
</head>
<body class="main_bg" id="page_top">

	<div id="header" class="main_bg">
		<div class="main_header">
			<p class="title">���ٳ�ǧ</p>
			<?php echo $mainmenu;?>
		</div>
	</div>

	<div id="main_wrapper" class="wrapper">
		<div class="maincontents">

			<div>
				<fieldset>
					<legend>���١������ե�����</legend>
					<div class="clearfix">
						<form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">
							<table>
								<tbody>
									<tr>
										<th>ȯ����</th>
										<td colspan="3">
											<input type="text" value="<?php if(isset($q['term_from'])) echo $q['term_from']; ?>" name="term_from" id="term_from" size="10" class="forDate datepicker" /> ���
											<input type="text" value="<?php if(isset($q['term_to'])) echo $q['term_to']; ?>" name="term_to" id="term_to" size="10" class="forDate datepicker" />
											<input type="button" value="���ե��ꥢ" id="cleardate" class="btn" />
										</td>
									</tr>
									<tr>
										<th>����No.</th>
										<td><input type="text" value="<?php if(isset($q['id'])) echo $q['id']; ?>" name="id" id="id" size="6" class="forBlank" /></td>
										<th>�᡼����̾</th>
										<td><input type="text" value="<?php if(isset($q['maker'])) echo $q['maker']; ?>" name="maker" id="maker" size="25" /></td>
									</tr>
									<tr>
										<th>����ͽ����</th>
										<td>
											<input type="text" value="<?php if(isset($q['arrival'])) echo $q['arrival']; ?>" name="arrival" id="arrival" class="forDate datepicker">
										</td>
										<th>����</th>
										<td>
											<select name="factory">
												<option value="0" selected="selected">----</option>
												<option value="1">�裱����</option>
												<option value="2">�裲����</option>
												<option value="9">�裱��������</option>
											</select>
										</td>
									</tr>
								</tbody>
							</table>
							<table>
								<tbody>
									<tr>
										<th>���پ���</th>
										<td>
											<select name="fin_7" id="fin_7">
											<?php
												if(!isset($q['fin_7'])) $q['fin_7'] = 1;
												$tmp = '<option value="0">����</option><option value="1">̤����</option><option value="2">���ٺ�</option>';
												echo preg_replace('/value=\"'.$q['fin_7'].'\"/','value="'.$q['fin_7'].'" selected="selected"',$tmp);
											?>
											</select>
										</td>
									</tr>
									<tr>
										<th>����ô��</th>
										<td>
											<?php echo $staff_selector; ?>
										</td>
									</tr>
								</tbody>
							</table>
						</form>
					</div>
					
					<p class="btn_area">
						<input type="button" value="����" id="search" />
						<input type="button" value="reset" id="reset" />
					</p>
					
				</fieldset>

				<div id="result_wrapper">
					<p class="submenu">
						<span class="btn_pagenavi" title="searchform">&lt;&lt; �����ե������</span>
						<span class="btn_pagenavi" title="label"> ����ɼ�ΰ��� </span>
						<span class="btn_pagenavi" title="statement"> �������ٽ�ΰ��� </span>
					</p>
					<p class="pagenavi">
						<span class="res">������̡�<ins id="result_count">0</ins>��</span>
						<span class="res">���ס�<ins id="total_amount">0</ins>��</span>
						<!-- <span class="btn_pagenavi" title="list"> ���٥����å������Ȥΰ��� </span>&nbsp; -->
					</p>
				</div>
				<div id="result_searchtop"></div>

			</div>

		</div>

	</div>

	<div id="printform_wrapper"><iframe id="printform" name="printform"></iframe></div>
	
</body>
</html>