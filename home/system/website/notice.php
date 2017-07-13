<?php
require_once dirname(__FILE__).'/../php_libs/session_my_handler.php';
require_once dirname(__FILE__).'/../php_libs/mainmenu_list.php';
require_once dirname(__FILE__).'/../php_libs/MYDB2.php';
require_once dirname(__FILE__).'/../php_libs/http.php';

	
//$http = new HTTP('http://dev_takahamalifeart.com:8081/v1/api.php');

$http = new HTTP(_API);
$rec = $http -> request( 'POST',array('act'=>'holidayinfo', 'mode'=>'r'));
$data = unserialize($rec);
$site_name = explode(',', _SITE_NAME);

?>


<!DOCTYPE html>
<html>
<head>
	<meta charset="EUC-JP" />
	<meta name="robots" content="noindex" />
	<title><?php echo _TITLE_SYSTEM; ?></title>
	<meta http-equiv="Content-Style-Type" content="text/css" />
	<meta http-equiv="Content-Script-Type" content="text/javascript" />
	
	<link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/cupertino/jquery-ui.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="../js/modalbox/css/jquery.modalbox.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/review.css" />

<!-- 
	<script type="text/javascript" src="../js/jquery.js"></script>
	<script type="text/javascript" src="../js/phonedata.js"></script>
	<link rel="stylesheet" type="text/css" media="screen" href="../css/template.css" />

-->	

	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js"></script>

	<script type="text/javascript" src="../js/lib/common.js"></script>
	<script type="text/javascript" src="../js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
	<script type="text/javascript" src="../js/modalbox/jquery.modalbox-min.js"></script>
	<script type="text/javascript" src="./js/notice.js"></script>
</head>

<body class="main_bg" id="page_top">
	<div id="overlay"></div>
	<div id="header" class="main_bg">
		<div class="main_header">
			<p class="title">休日管理</p>
			<?php echo $mainmenu;?>
		</div>
	</div>


	<div align="center">
		<div>
			<div>
				<fieldset>
					<legend>休日管理</legend>
				<!--	<form action=""  id="notice" onsubmit="return false"> -->
						<table>
							<tbody valign="top" align="left" >
								<tr>
									<th>開始日付</th>
									<td>
									<input type="text" value="<?php echo $data['start'];?>" id="start" class="datepicker" />
									</td>
								</tr>

								<tr>
									<th>終了日付</th>
									<td>
									<input type="text" value="<?php echo $data['end'];?>" id="end" class="datepicker" />
									</td>
								</tr>
								<tr><td><hr /></td><td><hr /></td><tr>
								<tr>
									<th>お知らせ文 </th>
									<td>
										<textarea cols=80 rows=8 value="" id="notice" ><?php echo $data['notice'];?></textarea>
									</td>
								</tr>
								<tr>
									<th valign="top">お知らせ文<br>表示サイト</th>
									<td>
									<?php
										$print = "";
										//takahama428
										$print .="<p><input type=checkbox value=1 id='site_1_state'";
										if($data["site"][1]["state"]==1){
											$print .= "checked = checked";
										}
										$print .=">".$site_name[0]."<p>";
										//sweatjack
										$print .="<p><input type=checkbox value=1 id='site_5_state'";
										if($data["site"][5]["state"]==1){
											$print .= "checked = checked";
										}
										$print .=">".$site_name[1]."<p>";
										//stuff-tshirt
										$print .="<p><input type=checkbox value=1 id='site_6_state'";
										if($data["site"][6]["state"]==1){
											$print .= "checked = checked";
										}
										$print .=">".$site_name[2]."<p>";
										echo $print;
									?>
									</td>
								</tr>
								<tr><td><hr /></td><td><hr /></td><tr>
								<tr>
									<th valign="top">臨時の<br>お知らせ文 </th>
									<td>
										<textarea cols=80 rows=8 value="" id="notice_ext" ><?php echo $data['notice-ext'];?></textarea>
									</td>
								</tr>
								<tr>
									<th valign="top">臨時のお知らせ文<br>表示サイト</th>
									<td>
									<?php
										$print = "";
										//takahama428
										$print .="<p><input type=checkbox value=1 id='site_1_state_ext'";
										if($data["site"][1]["state-ext"]==1){
											$print .= "checked = checked";
										}
										$print .=">".$site_name[0]."<p>";
										//sweatjack
										$print .="<p><input type=checkbox value=1 id='site_5_state_ext'";
										if($data["site"][5]["state-ext"]==1){
											$print .= "checked = checked";
										}
										$print .=">".$site_name[1]."<p>";
										//stuff-tshirt
										$print .="<p><input type=checkbox value=1 id='site_6_state_ext'";
										if($data["site"][6]["state-ext"]==1){
											$print .= "checked = checked";
										}
										$print .=">".$site_name[2]."<p>";
										echo $print;
									?>
									</td>
								</tr>
							</tbody>
						</table>
					<p>
						<input type="button" value="更新" id="update" width="100px"/>
					</p>
				<!--	</form> -->
				</fieldset>
			</div>
		</div>
	</div>

</body>
</html>