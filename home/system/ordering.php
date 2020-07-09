<?php
	require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
	require_once dirname(__FILE__).'/php_libs/mainmenu_list.php';
	require_once dirname(__FILE__).'/php_libs/MYDB.php';
	
	
	/*
	*	受注・発注担当者
	*	30日前から在籍しているスタッフで固定
	*/
	$staff_selector = '';
	try{
		$conn = db_connect();
		$result = exe_sql($conn, 'SELECT * FROM staff where rowid1>0 and staffapply<=curdate() and staffdate>adddate(curdate(), interval -30 day) order by rowid1 ASC');
		$staff_selector .= '<option value="0" selected="selected">----</option>';
		if($result){
			while($rec = mysqli_fetch_array($result)){
				$staff_selector .= '<option value="'.$rec['id'].'">'.mb_convert_encoding($rec['staffname'],'euc-jp','utf-8').'</option>';
			}
		}
	}catch(Exception $e){
		$staff_selector = '<option value="0">----</option>';
	}
	mysqli_close($conn);
	
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
	<link rel="stylesheet" type="text/css" media="screen" href="./css/ordering.css" />

	<script type="text/javascript" src="./js/jquery.js"></script>
	<script type="text/javascript" src="./js/jquery.tablefix.js"></script>
	<script type="text/javascript" src="./js/jquery.smoothscroll.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.core.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.widget.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.datepicker.js"></script>
	<script type="text/javascript" src="./js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
	<script type="text/javascript" src="./js/lib/common.js"></script>
	<script type="text/javascript" src="./js/ordering.js?q=<?php echo time();?>"></script>
	<script type="text/javascript">
		var _my_level = "<?php echo $mylevel; ?>";
		var _scroll = "<?php echo $scroll; ?>";
		var _MAIN = "<?php echo $_SERVER['SCRIPT_NAME']; ?>";
	</script>
</head>
<body class="main_bg" id="page_top">
	<div id="overlay"></div>
	<p id="loadingbar">データーの更新中.....</p>
	<div id="header" class="main_bg">
		<div class="main_header">
			<p class="title">発注</p>
			<?php echo $mainmenu;?>
		</div>
	</div>

	<div id="main_wrapper" class="wrapper">
		<div class="maincontents">
			<div>
				<fieldset>
					<legend>発注　検索フォーム</legend>
					<div class="clearfix">
						<form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">
							<table>
								<tbody>
									<tr>
										<th>受注担当</th>
										<td>
											<select name="staff" id="staff">
												<?php echo $staff_selector; ?>
											</select>
										</td>
										<th>発注状況</th>
										<td>
											<select name="state" id="state">
											<?php
												if(!isset($q['state'])) $q['state'] = 0;
												$tmp = '<option value="0">未発注</option><option value="1">回答待ち</option><option value="2">不足分あり</option>';
												echo preg_replace('/value=\"'.$q['state'].'\"/','value="'.$q['state'].'" selected="selected"',$tmp);
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
									</tr>
								</tbody>
							</table>
						</form>
					</div>
					
					<p class="btn_area">
						<input type="button" value="検索" id="search" />
						<input type="button" value="reset" id="reset" />
						<input type="button" value="ダウンロード" id="export" />
					</p>
					
				</fieldset>
				
				<div id="result_wrapper">
					<p class="pagenavi">検索結果：<span id="result_count">0</span>件</p>
					<p style="padding-left:25px; margin:10px 0; font-weight:bold;">
						発注担当：
						<select id="order_staff">
							<?php echo $staff_selector; ?>
						</select>
					</p>
				</div>
				<div id="result_searchtop"></div>
			</div>
		</div>
	</div>

</body>
</html>