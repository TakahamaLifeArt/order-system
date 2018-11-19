<?php
	require_once dirname(__FILE__).'/php_libs/authentic.php';
	$flg = isset($_GET['req'])? 1: 0;
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="EUC-JP" />
	<meta name="robots" content="noindex" />
	<title>受注管理SYSTEM</title>
	<meta http-equiv="Content-Style-Type" content="text/css" />
	<meta http-equiv="Content-Script-Type" content="text/javascript" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/main.css" />
	<script type="text/javascript">
		function openWindow(windowName){
			if(<?php echo $flg; ?>) return;
			var url = '';
			var userID = <?php echo $authenticatedUser;?>;
			if(userID==9){
				url = "main.php?req=website-userreview&pos=<?php echo time();?>";
			}else{
				url = "main.php?req=orderform&pos=<?php echo time();?>";
			}
			var h = screen.availHeight-60;
		  	var info = 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,left=0,top=0,resizable=yes,width=1250,height='+h+',title=no';
			window.open(url,windowName,info);
			//window1.moveTo(0, 0);
			//window.opener = self;
			//window.close();
		}
	</script>
</head>
<body onload='openWindow("myWindow");'>
	<div><h1>Takahama Life Art 受注管理SYSTEM</h1></div>
	<form action="<?php echo $_SERVER['SCRIPT_NAME'];?>" method="post">
		<input type="hidden" name="logout" value="true" />
		<input type="submit" value="ログアウト" />
		<p>※　ログイン画面で[ キャンセル ]ボタンをクリックすると <ins>ログアウト</ins> します。</p>
	</form>
</body>
</html>