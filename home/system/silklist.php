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

	// ���륯�ʥץ쥹��ô��
	$staff_selector = '<select name="state_5" id="state_5" class="staff" rel="rowid6">';
	try{
		$conn = db_connect();
		$result = exe_sql($conn, 'SELECT * FROM staff where rowid6>0 and staffapply<=curdate() and staffdate>adddate(curdate(), interval -3 day) order by rowid6 ASC');
		$staff_selector .= '<option value="0" selected="selected">----</option>';
		if($result){
			while($rec = mysqli_fetch_array($result)){
				$staff_selector .= '<option value="'.$rec['id'].'"';
				if($q['state_5']==$rec['id']) $staff_selector .= ' selected="selected"';
				$staff_selector .= '>'.mb_convert_encoding($rec['staffname'],'euc-jp','utf-8').'</option>';
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
	<link rel="stylesheet" type="text/css" media="screen" href="./js/modalbox/css/jquery.modalbox.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./js/jqplot/jquery.jqplot.min.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/printposition.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/template.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/platelist.css" />

	<!--[if IE]><script language="javascript" type="text/javascript" src="./js/jqplot/excanvas.min.js"></script><![endif]-->
	<script type="text/javascript" src="./js/jquery.js"></script>
	<script type="text/javascript" src="./js/jquery.smoothscroll.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.core.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.widget.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.datepicker.js"></script>
	<script type="text/javascript" src="./js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
	<script type="text/javascript" src="./js/modalbox/jquery.modalbox-min.js"></script>
	<!--
	<script type="text/javascript" src="./js/jqplot/jquery.jqplot.min.js"></script>
	<script type="text/javascript" src="./js/jqplot/plugins/jqplot.dateAxisRenderer.min.js"></script>
	<script type="text/javascript" src="./js/jqplot/plugins/jqplot.canvasTextRenderer.min.js"></script>
	<script type="text/javascript" src="./js/jqplot/plugins/jqplot.canvasAxisTickRenderer.min.js"></script>
	<script type="text/javascript" src="./js/jqplot/plugins/jqplot.categoryAxisRenderer.min.js"></script>
	<script type="text/javascript" src="./js/jqplot/plugins/jqplot.barRenderer.min.js"></script>
	-->
	<script type="text/javascript" src="./js/lib/common.js"></script>
	<script type="text/javascript" src="./js/silklist.js"></script>
	<script type="text/javascript">
		var _my_level = "<?php echo $mylevel; ?>";
		var _mode = "<?php echo $mode; ?>";
		var _scroll = "<?php echo $scroll; ?>";
		var _MAIN = "<?php echo $_SERVER['SCRIPT_NAME']; ?>";
	</script>
</head>
<body class="main_bg" id="page_top">

	<div id="header" class="main_bg">
		<div class="main_header">
			<p class="title">���륯</p>
			<?php echo $mainmenu;?>
		</div>
	</div>

	<div id="main_wrapper" class="wrapper">
		<div class="maincontents">

			<div>
				<fieldset>
					<legend>���륯�������ե�����</legend>
					<div class="clearfix">
						<form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">
							<table>
								<tbody>
									<tr>
										<th>ȯ����</th>
										<td>
											<input type="text" value="<?php if(isset($q['term_from'])) echo $q['term_from']; ?>" name="term_from" id="term_from" size="10" class="forDate datepicker"> ��
											<input type="text" value="<?php if(isset($q['term_to'])) echo $q['term_to']; ?>" name="term_to" id="term_to" size="10" class="forDate datepicker">
											
										</td>
									</tr>
									<tr>
										<th>ͽ����</th>
										<td>
											<input type="text" value="<?php if(isset($q['schedule_from'])) echo $q['schedule_from']; ?>" name="schedule_from" id="schedule_from" size="10" class="forDate datepicker"> ��
											<input type="text" value="<?php if(isset($q['schedule_to'])) echo $q['schedule_to']; ?>" name="schedule_to" id="schedule_to" size="10" class="forDate datepicker">
											
										</td>
									</tr>
								</tbody>
							</table>
							<table>
								<tbody>
									<tr>
										<th>���륯</th>
										<td>
											<select name="fin_5" id="fin_5">
											<?php
												if(!isset($q['fin_5'])) $q['fin_5'] = 1;
												$tmp = '<option value="0">����</option><option value="1">̤��λ</option><option value="2">��λ</option>';
												echo preg_replace('/value=\"'.$q['fin_5'].'\"/','value="'.$q['fin_5'].'" selected="selected"',$tmp);
											?>
											</select>
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
									<tr>
										<th>ô��</th>
										<td><?php echo $staff_selector; ?></td>
										<td colspan="2"></td>
									</tr>
								</tbody>
							</table>
						</form>
					</div>
					
					<p class="btn_area">
						<input type="button" value="������ǧ" id="progress">
						<input type="button" value="���ͽ��" id="schedule">
						<input type="button" value="�����" id="chart">
						<input type="button" value="����" id="print">
						
						<input type="button" value="���ʿ�-ǯ�ٽ���" id="list1">
						<select id="FY" name="FY">
						<?php
							$opt = '';
							for($i=2011; $i<=date('Y'); $i++){
								$opt .= '<option value="'.$i.'">'.$i.'ǯ��</option>';
							}
							echo preg_replace('/value="'.date('Y').'"/', 'value="'.date('Y').'" selected="selected"', $opt);
						?>
						</select>
						
						<input type="button" value="���ʿ�-�����" id="list2">
						<select id="FY2" name="FY">
						<?php
							$opt = '';
							for($i=2011; $i<=date('Y'); $i++){
								$opt .= '<option value="'.$i.'">'.$i.'ǯ��</option>';
							}
							echo preg_replace('/value="'.date('Y').'"/', 'value="'.date('Y').'" selected="selected"', $opt);
						?>
						</select>
						<select id="monthly" name="monthly">
						<?php
							$opt = '';
							for($i=4; $i<=12; $i++){
								$opt .= '<option value="'.$i.'">'.$i.'��</option>';
							}
							for($i=1; $i<=3; $i++){
								$opt .= '<option value="'.$i.'">'.$i.'��</option>';
							}
							echo preg_replace('/value="'.date('n').'"/', 'value="'.date('n').'" selected="selected"', $opt);
						?>
						</select>
						
						<input type="button" value="reset" id="reset">
					</p>
					
				</fieldset>

				<div id="result_wrapper" style="display:block;">
					<!--<p class="submenu"><span class="btn_pagenavi" title="searchform">&lt;&lt; �����ե������</span></p>-->
					<div id="result_table"></div>
					<div class="pagenavi">
						<p style="position: absolute;">�������<span id="result_count">0</span>��</p>
						<span class="pagetitle"></span>
						<input type="button" value="���ͽ��򹹿�����" id="update_workplan">
					</div>
				</div>
				
				<div id="result_searchtop"></div>
				<div id="chart1">
					<div class="inner" class="clearfix">
						<div class="series"></div>
						<div class="series"></div>
						<div class="series"></div>
						<div class="series"></div>
						<div class="series"></div>
						<div class="series"></div>
						<div class="series"></div>
						<div class="series"></div>
						<div class="series"></div>
						<div class="series"></div>
					</div>
					
					<div class="date_wrap clearfix">
						<p></p>
					</div>
					
					<div class="legend_wrap">
						<dl>
							<dt><p class="bar_quota"></p></dt><dd>���ͽ��</dd>
							<dt><p class="bar_results"></p></dt><dd>��ȼ���</dd>
							<dt><p class="bar_shipping"></p></dt><dd>Ǽ��</dd>
							<dt><p class="bar_on100"></p></dt><dd>Ǽ����100��ʾ��</dd>
						</dl>
					</div>
					
					<div class="hori_line l_3000"><p>3000</p><p></p></div>
					<div class="hori_line l_2500"><p>2500</p><p></p></div>
					<div class="hori_line l_2000"><p>2000</p><p></p></div>
					<div class="hori_line l_1500"><p>1500</p><p></p></div>
					<div class="hori_line l_1000"><p>1000</p><p></p></div>
					<div class="hori_line l_500"><p>500</p><p></p></div>
					<div class="hori_line l_0"><p>0</p><p></p></div>
				</div>

			</div>

		</div>

	</div>

	<div id="printform_wrapper"><iframe id="printform" name="printform"></iframe></div>
</body>
</html>