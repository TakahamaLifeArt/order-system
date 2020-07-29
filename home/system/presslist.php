<?php
	require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
	require_once dirname(__FILE__).'/php_libs/mainmenu_list.php';
	require_once dirname(__FILE__).'/php_libs/MYDB.php';
	
	
	// 受注入力から戻って来た場合
	if(isset($_GET['filename'])) {
		$scroll = $_GET['scroll'];
		$pos = strpos($_SERVER['QUERY_STRING'], 'filename=');
		$query_string = substr($_SERVER['QUERY_STRING'], $pos);
		
		$hash = explode('&', $query_string);
		for($i=0; $i<count($hash); $i++){
			$tmp = explode('=', $hash[$i]);
			if($tmp[0]=='filename' || $tmp[0]=='reappear') continue;
			$q[$tmp[0]] = $tmp[1];
		}
	}
	
	// プレス担当
	$staff_selector = '<select name="state_4" id="state_4" class="staff" rel="rowid6">';
	try{
		$conn = db_connect();
		$result = exe_sql($conn, 'SELECT * FROM staff where rowid6>0 and staffapply<=curdate() and staffdate>adddate(curdate(), interval -30 day) order by rowid6 ASC');
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
	<link rel="stylesheet" type="text/css" media="screen" href="./css/platelist.css" />

	<!--[if IE]><script language="javascript" type="text/javascript" src="./js/jqplot/excanvas.min.js"></script><![endif]-->
	<script type="text/javascript" src="./js/jquery.js"></script>
	<script type="text/javascript" src="./js/jquery.smoothscroll.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.core.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.widget.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.datepicker.js"></script>
	<script type="text/javascript" src="./js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
	<script type="text/javascript" src="./js/lib/common.js"></script>
	<script type="text/javascript" src="./js/presslist.js"></script>
	<script type="text/javascript">
		var _my_level = "<?php echo $mylevel; ?>";
		var _MAIN = "<?php echo $_SERVER['SCRIPT_NAME']; ?>";
	</script>
</head>
<body class="main_bg" id="page_top">

	<div id="header" class="main_bg">
		<div class="main_header">
			<p class="title">プレス</p>
			<?php echo $mainmenu;?>
		</div>
	</div>

	<div id="main_wrapper" class="wrapper">
		<div class="maincontents">

			<div>
				<fieldset>
					<legend>プレス　検索フォーム</legend>
					<div class="clearfix">
						<form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">
							<table>
								<tbody>
									<tr>
										<th>発送日</th>
										<td colspan="3">
											<input type="text" value="<?php if(isset($q['term_from'])) echo $q['term_from']; ?>" name="term_from" id="term_from" size="10" class="forDate datepicker" /> 〜
											<input type="text" value="<?php if(isset($q['term_to'])) echo $q['term_to']; ?>" name="term_to" id="term_to" size="10" class="forDate datepicker" />
											<input type="button" value="日付クリア" id="cleardate" class="btn" />
										</td>
									</tr>
									<tr>
										<th>受注No.</th>
										<td><input type="text" value="<?php if(isset($q['id'])) echo $q['id']; ?>" name="id" id="id" size="6" class="forBlank" /></td>
										<th>プリント方法</th>
										<td>
											<select name="print_type" id="print_type">
											<?php
												if(!isset($q['print_type'])) $q['print_type'] = "";
												$tmp = '<option value="">全て</option>
														<option value="digit">デジタル転写</option>
														<option value="trans">カラー転写</option>
														<option value="cutting">カッティング</option>';
												echo preg_replace('/value=\"'.$q['shipped'].'\"/','value="'.$q['shipped'].'" selected="selected"',$tmp);
											?>
											</select>
										</td>
									</tr>
								</tbody>
							</table>
							<table>
								<tbody>
									<tr>
										<th>プレス</th>
										<td>
											<select name="fin_4" id="fin_4">
											<?php
												if(!isset($q['fin_4'])) $q['fin_4'] = 1;
												$tmp = '<option value="0">全て</option>
														<option value="1">未終了</option>
														<option value="2">作成済</option>';
												echo preg_replace('/value=\"'.$q['fin_4'].'\"/','value="'.$q['fin_4'].'" selected="selected"',$tmp);
											?>
											</select>
										</td>
										<th>工場</th>
										<td>
											<select name="factory">
												<option value="0" selected="selected">----</option>
												<option value="1">第１工場</option>
												<option value="2">第２工場</option>
												<option value="9">第１・２工場</option>
											</select>
										</td>
										<td style="display: none;"><?php echo $staff_selector; ?></td>
									</tr>
								</tbody>
							</table>
						</form>
					</div>
					
					<p class="btn_area">
						<input type="button" value="検索" id="search" />
						
						<input type="button" value="商品数-年度集計" id="addup">
						<select id="FY" name="FY">
						<?php
							for($i=2011; $i<=date('Y'); $i++){
								$opt .= '<option value="'.$i.'">'.$i.'年度</option>';
							}
							echo preg_replace('/value="'.date('Y').'"/', 'value="'.date('Y').'" selected="selected"', $opt);
						?>
						</select>
						
						<input type="button" value="reset" id="reset">
					</p>
					
				</fieldset>

				<div id="result_wrapper">
					<p class="submenu">
						<span class="btn_pagenavi" id="searchform">&lt;&lt; 検索フォームヘ</span>
						<span class="btn_pagenavi" id="printout">印刷</span>
					</p>
					<div class="pagenavi">
						<p>検索結果<span id="result_count">0</span>件</p>
						<p class="pagetitle"></p>
					</div>
				</div>
				<div id="result_searchtop"></div>

			</div>

		</div>

	</div>
	
	<div id="printform_wrapper"><iframe id="printform" name="printform"></iframe></div>

</body>
</html>