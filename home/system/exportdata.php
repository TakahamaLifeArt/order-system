<?php
	require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
	require_once dirname(__FILE__).'/php_libs/mainmenu_list.php';
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
	<link rel="stylesheet" type="text/css" media="screen" href="./css/exportdata.css" />

	<script type="text/javascript" src="./js/jquery.js"></script>
	<script type="text/javascript" src="./js/jquery.smoothscroll.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.core.js"></script>
	<script type="text/javascript" src="./js/ui/jquery.ui.datepicker.js"></script>
	<script type="text/javascript" src="./js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
	<script type="text/javascript" src="./js/modalbox/jquery.modalbox-min.js"></script>
	<script type="text/javascript" src="./js/lib/common.js"></script>
	<script type="text/javascript" src="./js/exportdata.js"></script>

</head>
<body class="main_bg" id="page_top">

	<div id="header" class="main_bg">
		<div class="main_header">
			<p class="title">データダウンロード</p>
			<?php echo $mainmenu;?>
		</div>
	</div>

	<div id="main_wrapper" class="wrapper">
		<div class="maincontents">
			<div>
				<fieldset id="search_wrapper">
					<legend>ダウンロードデータ　検索</legend>
					<div class="clearfix">
						<form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">
							<div>
								<table>
									<tbody>
										<tr>
											<th>発送日</th>
											<td>
												<input type="text" value="" name="term_from" size="10" class="forDate datepicker" /> &#65374;<input type="text" value="" name="term_to" size="10" class="forDate datepicker" />
												<input type="button" value="日付クリア" title="cleardate" id="cleardate" />
											</td>
										</tr>
										<tr>
											<th>受注No.</th>
											<td><input type="text" value="" name="id" size="6" class="forBlank" /></td>
										</tr>
									</tbody>
								</table>
							</div>
						</form>
					</div>
					<p class="btn_area">
						<input type="button" value="受注データ" id="orderlist">
						<input type="button" value="プリントデータ" id="printlist">
						<input type="button" value="注文商品データ" id="orderitemlist">
						<input type="button" value="業者注文データ" id="orderitemlist_additional">
						<input type="button" value="仕事量データ" id="worktimelist">
						<input type="button" value="reset" id="reset">
					</p>
				</fieldset>
				<div id="result_searchtop" style="display:none;">
					<p class="alert">Export ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>
				</div>
				<div id="result_wrapper"></div>
			</div>
		</div>

	</div>
</body>
</html>