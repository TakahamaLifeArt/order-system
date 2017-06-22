<?php
	require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
	require_once dirname(__FILE__).'/php_libs/mainmenu_list.php';
	require_once dirname(__FILE__).'/php_libs/MYDB.php';
	
	$conn = db_connect();
	$selectors = array("website"=>"site");
	foreach($selectors as $key=>$val){
		try{
			$sql= 'SELECT * FROM '.$key;
			$result = exe_sql($conn, $sql);
			$selector[$val] = '<select name="'.$val.'_id"><option value="" selected="selected">---</option>';
			while($rec = mysqli_fetch_assoc($result)){
				$selector[$val] .= '<option value="'.$rec[$val.'id'].'">'.mb_convert_encoding($rec[$val.'name'],'euc-jp','utf-8').'</option>';
			}
			$selector[$val] .= '</select>';
		}catch(Exception $e){
			$selector['site'] = '<select name="website"><option value="">---</option></select>';
		}
	}
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
	<link rel="stylesheet" type="text/css" media="screen" href="./css/template.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/requestlist.css" />

	<script type="text/javascript" src="./js/jquery.js"></script>
	<script type="text/javascript" src="./js/jquery.smoothscroll.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.core.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.datepicker.js"></script>
	<script type="text/javascript" src="./js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
	<script type="text/javascript" src="./js/modalbox/jquery.modalbox-min.js"></script>
	<script type="text/javascript" src="./js/lib/common.js"></script>
	<script type="text/javascript" src="./js/requestlist.js"></script>

</head>
<body class="main_bg" id="page_top">

	<div id="header" class="main_bg">
		<div class="main_header">
			<p class="title">�����������</p>
			<?php echo $mainmenu;?>
		</div>
	</div>

	<div id="main_wrapper" class="wrapper">
		<div class="maincontents">
			<div>
				<fieldset id="search_wrapper">
					<legend>�������ᡡ����</legend>
					<div class="clearfix">
						<form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">
							<div>
								<table>
									<tbody>
										<tr>
											<th>��������</th>
											<td>
												<input type="text" value="" name="term_from" size="10" class="forDate datepicker" /> ��<input type="text" value="" name="term_to" size="10" class="forDate datepicker" />
												<input type="button" value="���ե��ꥢ" title="cleardate" id="cleardate" />
											</td>
										</tr>
										<tr>
											<th>�ᡡ̾</th>
											<td><input type="text" value="" name="customername" size="25" /></td>
										</tr>
									</tbody>
								</table>
							</div>

							<div>
								<table>
									<tbody>
										<tr>
											<th>Web������</th>
											<td><?php echo $selector['site']; ?></td>
										</tr>
										<tr>
											<th>����ȯ������</th>
											<td>
												<select name="phase">
													<option value="" >----</option>
													<option value="1" selected="selected">̤ȯ��</option>
													<option value="2">ȯ���Ѥ�</option>
												</select>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</form>
					</div>
					<p class="btn_area">
						<input type="button" value="����" title="search">
						<input type="button" value="����С������" title="conversion">
						<input type="button" value="reset" title="reset">
					</p>
				</fieldset>

				<div id="result_wrapper">
					<p class="submenu">
						<span class="btn_pagenavi" title="searchform">&lt;&lt; �����ե������</span>
						<span class="btn_pagenavi" title="seal">���������</span><input type="number" value="1" min="1" max="12" step="1" id="start_seal_pos"> (�������ϰ���)
					</p>
					<div class="pagenavi">
						<p style="position: absolute;">�������<span id="result_count">0</span>��</p>
						<span class="btn_pagenavi" title="first">�ǽ�� &lt;&lt;&lt;</span>&nbsp;<span class="btn_pagenavi" title="previous">���� &lt;&lt;</span><span class="pos_pagenavi"></span><span class="btn_pagenavi" title="next">&gt;&gt; ����</span>&nbsp;<span class="btn_pagenavi" title="last">&gt;&gt;&gt; �Ǹ��</span>
					</div>
					<div id="result_searchtop">
						<p class="alert">������ ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>
					</div>
				</div>

			</div>
		</div>

	</div>

	<div id="printform_wrapper"><iframe id="printform" name="printform"></iframe></div>
</body>
</html>