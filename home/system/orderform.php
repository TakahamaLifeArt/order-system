<?php
	require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
	require_once dirname(__FILE__).'/php_libs/mainmenu_list.php';
	// セッション変数を初期化
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
	*	2014-01-23 廃止項目
	*	sales:	取引区分
	*	receipt:入金区分
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
	$selector .= '<option value="1" selected="selected">当月</option><option value="2">翌月</option><option value="3">翌々月</option><option value="4">3ヶ月</option>';
	$selector .= '<option value="5">4ヶ月</option><option value="6">5ヶ月</option><option value="7">6ヶ月</option></select>';
	$selectors['cycle'] = array('def'=>1,'src'=>$selector);

	$selector = '<select name="cutofday">';
	$selector2 = '<select name="paymentday">';
	for($i=1; $i<31; $i++){
		$selector .= '<option value="'.$i.'">'.$i.'日</option>';
		$selector2 .= '<option value="'.$i.'">'.$i.'日</option>';
	}
	$selector .= '<option value="31">末日</option></select>';
	$selector = preg_replace('/value="20"/','value="20" selected="selected"',$selector);
	$selector2 .= '<option value="31" selected="selected">末日</option></select>';
	$selectors['cutofday'] = array('def'=>20,'src'=>$selector);
	$selectors['paymentday'] = array('def'=>31,'src'=>$selector2);

	$selector = '<select name="remittancecharge">';
	$selector .= '<option value="1">当方</option><option value="2" selected="selected">先方</option></select>';
	$selectors['charge'] = array('def'=>2,'src'=>$selector);

	/* 2014-05-01 外税表示へ変更により廃止
	$selector = '<select name="consumptiontax">';
	$selector .= '<option value="0">非課税</option><option value="1" selected="selected">内税</option><option value="2">外税</option></select>';
	$selectors['tax'] = array('def'=>1,'src'=>$selector);
	*/
	
	// 引取時間
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
	<p id="loadingbar">データーの更新中.....</p>
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
				<span id="btn_gotomenu" class="btn_sub">メニューに戻る</span>
				
				<span id="btn_tool" class="btn_sub">ツール</span>
				<span id="btn_firmorder" class="btn_sub">注文確定</span>
				<span id="btn_cancelorder" class="btn_sub">確定解除</span>
				<span id="btn_imageup" class="btn_sub">イメージ画像アップ</span>
				<span id="btn_completionimage" class="btn_sub">イメ画確定</span>
				<p><a href="#order_wrapper">トップ</a><a href="#print_position">プリント位置</a><a href="#order_option">その他料金</a><a href="#order_customer">お客様情報</a><a href="#page_border">フッター</a></p>
			</div>
			<div class="tab_contents clearfix">
				<div id="alertarea">
					<!-- <span id="alert_rakuhan"><img alt="落版済み" src="./img/i_alert.png" width="30" />&nbsp;落版済み</span>-->
					<span id="alert_require"><img alt="未入力あり" src="./img/i_alert.png" width="30" />&nbsp;未入力有</span>
					<span id="alert_comment"><img alt="コメントあり" src="./img/i_alert.png" width="30" />&nbsp;コメント有</span>
					<!--<img alt="saveall" src="./img/btn_save.png" height="25" class="saveall" />-->
					<div id="saveall" class="btn_main saveall">保　存</div>
				</div>

				<p id="enableline">
					受注担当 <select id="reception"><option></option></select>
					<img alt="受付" src="./img/i_uketsuke.png" /><span id="order_id">000000000</span>
					<span id="reuse_plate">新版</span>
					<!--<label id="repeat_checker"><input type="checkbox" name="repeatcheck" value="1" />リピート版</label> | -->
					<label id="rakuhan_checker"><input type="checkbox" name="rakuhan" value="1" />落版</label> | 
					<label id="state_0"><input type="checkbox" name="state_0" value="1" />発注</label> | 
					<input type="radio" name="ordertype" id="ordertype_general" value="general" checked="checked" /><label for="ordertype_general">【一般】</label>
					<input type="radio" name="ordertype" id="ordertype_industry" value="industry" /><label for="ordertype_industry" >【業者】</label>
					<input type="hidden" id="plates_status" value="0" />
				</p>

				<ul id="disableline">
					<li>受注担当</li>
					<li><p></p></li>
					<li><img alt="受付" src="./img/i_uketsuke.png" /></li>
					<li><p></p></li>
					<li>入力モード</li>
					<li><p></p></li>
				</ul>
			</div>
			<div id="btn_customerlog">受付記録</div>
			<div id="maintitle_wrapper">
				題名&nbsp;<input type="text" value="" id="maintitle" name="maintitle" />
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
					<li><p class="act">問い合わせ中</p></li>
				   	<li><p>見積りメール済</p></li>
				   	<li><p>イメ画製作</p></li>
				   	<li id="done_image"><p>イメ画完了</p></li>
				   	<li><p>注文確定</p></li>
				   	<li><p>発送済</p></li>
				   	<li id="order_cancel"><p>注文取消し</p></li>
				</ul>

				<div id="phase_wrapper" class="phasecheck clearfix">
					<div class="phase_label"><p>進</p><p>行</p></div>
					<label><input type="radio" name="phase" value="enq" checked="checked" />問い合わせ中</label>
					<label><input type="radio" name="phase" value="copy" />入稿待ち</label>
					<span class="fontred toright">★</span>
					<ins id="order_estimate">見積り確認中</ins>
					<ins id="order_completed">注文確定済み</ins>
					<ins id="order_stock" class="highlights">未発注</ins>
					<ins id="order_cancel">注文取消し</ins>
				</div>

				<div class="phase_box">
					<h2 class="ordertitle">●メディアチェック</h2>
					<div class="inner" id="mediacheck_wrapper">
						<table>
						<tfoot>
							<tr><td colspan="2"><input type="button" value="リセット" id="mediacheck_reset" /></td></tr>
						</tfoot>
						<tbody>
							<tr>
								<th>新規問い合わせ</th>
								<td>
									<label><input type="radio" name="firstcontact" value="yes" />ファースト</label>
									<label><input type="radio" name="firstcontact" value="no" checked="checked" />リピート</label>
								</td>
							</tr>
							<tr>
								<th>問い合わせ方法</th>
								<td>
									<label><input type="radio" name="mediacheck01" value="phone" />電話</label>
									<label><input type="radio" name="mediacheck01" value="email" />メール</label>
									<label><input type="radio" name="mediacheck01" value="fax" />FAX</label>
								</td>
							</tr>
							<tr>
								<th>何で知ったか</th>
								<td>
									<label><input type="radio" name="mediacheck02" value="428HP" />428HP</label>
									<label><input type="radio" name="mediacheck02" value="print-t" />Print-t</label>
									<label><input type="radio" name="mediacheck02" value="428mobile" />428携帯</label>
									<label><input type="radio" name="mediacheck02" value="sweatjack" />sweatJack</label>
									<label><input type="radio" name="mediacheck02" value="self-design" />SEIF-DESIGN</label>
									<label><input type="radio" name="mediacheck02" value="request" />資料請求から</label>
									<label><input type="radio" name="mediacheck02" value="introduction" />紹介</label>
								</td>
							</tr>
							<tr>
								<th>問い合わせ種類</th>
								<Td>
									<label><input type="radio" name="mediacheck03" value="estimate" />お見積</label>
									<label><input type="radio" name="mediacheck03" value="order" />ご注文</label>
									<label><input type="radio" name="mediacheck03" value="delivery" />納期</label>
									<label><input type="radio" name="mediacheck03" value="other" />その他</label><input type="text" value="その他" id="mediacheck03_other" />
								</Td>
							</tr>
						</tbody>
						</table>
					</div>
				</div>

				<div class="phase_box freeform">
					<h2 class="ordertitle">●スケジュール</h2>
					<div class="inner">
						<table id="schedule_selector">
							<tbody>
								<tr>
									<th>注文枚数の予定</th>
									<td><input type="number" min="0" value="0" id="check_amount" name="check_amount" class="forNum" />&nbsp;枚</td>
								</tr>
								<tr>
									<th>納品先都道府県</th>
									<td>
										<select id="destination">
											<option value="0" selected="selected">-</option>
											<option value="1">北海道</option>
											<option value="2">青森県</option>
											<option value="3">岩手県</option>
											<option value="4">宮城県</option>
											<option value="5">秋田県</option>
											<option value="6">山形県</option>
											<option value="7">福島県</option>
											<option value="8">茨城県</option>
											<option value="9">栃木県</option>
											<option value="10">群馬県</option>
											<option value="11">埼玉県</option>
											<option value="12">千葉県</option>
											<option value="13">東京都</option>
											<option value="48">東京　離島</option>
											<option value="14">神奈川県</option>
											<option value="15">新潟県</option>
											<option value="16">富山県</option>
											<option value="17">石川県</option>
											<option value="18">福井県</option>
											<option value="19">山梨県</option>
											<option value="20">長野県</option>
											<option value="21">岐阜県</option>
											<option value="22">静岡県</option>
											<option value="23">愛知県</option>
											<option value="24">三重県</option>
											<option value="25">滋賀県</option>
											<option value="26">京都府</option>
											<option value="27">大阪府</option>
											<option value="28">兵庫県</option>
											<option value="29">奈良県</option>
											<option value="30">和歌山県</option>
											<option value="31">鳥取県</option>
											<option value="32">島根県</option>
											<option value="49">島根隠岐郡</option>
											<option value="33">岡山県</option>
											<option value="34">広島県</option>
											<option value="35">山口県</option>
											<option value="36">徳島県</option>
											<option value="37">香川県</option>
											<option value="38">愛媛県</option>
											<option value="39">高知県</option>
											<option value="40">福岡県</option>
											<option value="41">佐賀県</option>
											<option value="42">長崎県</option>
											<option value="43">熊本県</option>
											<option value="44">大分県</option>
											<option value="45">宮崎県</option>
											<option value="46">鹿児島県</option>
											<option value="47">沖縄県</option>
										</select>
										<img alt="answer" src="./img/answer.png" class="icon_answer" id="ans_delivery">
									</td>
								</tr>
								<tr>
									<th>納品先の数</th>
									<td><input type="number" min="1" value="1" id="destcount" name="destcount" class="forNum" />&nbsp;ヶ所</td>
								</tr>
								<tr>
									<th>袋詰め</th>
									<td>
										<table id="package_wrap">
											<thead>
												<tr>
													<td><label><input type="checkbox" name="package" value="no" checked="checked" />なし</label></td>
													<td><label><input type="checkbox" name="package" value="nopack" />袋のみ同封</label></td>
													<td><label><input type="checkbox" name="package" value="yes" />あり</label><ins class="remarks">（10枚以上で制作日数に1日追加）</ins></td>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td></td>
													<td><p style="display:none;"><input type="number" min="0" max="0" value="0" id="pack_nopack_volume" name="pack_nopack_volume" class="forNum" />&nbsp;枚</p></td>
													<td><p style="display:none;"><input type="number" min="0" max="0" value="0" id="pack_yes_volume" name="pack_yes_volume" class="forNum" />&nbsp;枚</p></td>
												</tr>
											</tbody>
										</table>
									</td>
								</tr>
								<tr>
									<th>配送方法</th>
									<td>
										<label><input type="radio" name="carriage" value="normal" checked="checked" />宅急便</label>
										<!-- 2012-04-17 廃止
										<label><input type="radio" name="carriage" value="air" />超速便</label>
										<label><input type="radio" name="carriage" value="time" />タイム便</label>
										-->
										<label><input type="radio" name="carriage" value="accept" />工場渡し</label>
										<select id="handover" name="handover"><?php echo $handover; ?></select>
										<label><input type="radio" name="carriage" value="telephonic" />できtel</label>
										<label><input type="radio" name="carriage" value="other" />その他</label>
									</td>
								</tr>
								<tr>
									<th>箱数</th>
									<td><input type="number" min="0" value="0" id="boxnumber" name="boxnumber" class="forNum" />&nbsp;箱</td>
								</tr>
								<tr>
									<th>同梱指定</th>
									<td>
									<input type="button" value="同梱可能注文を表示" id="show_bundle">
									<span id="bundle_status">同梱あり</span>
									</td>
								</tr>
								<!--
								<tr id="express_checker">
									<th>特急製作</th>
									<td>
										<label><input type="checkbox" name="expresscheck" value="1" />特急製作扱い</label>
									</td>
								</tr>
								-->
								<tr>
									<th>商品の入荷予定日</th>
									<td>
										<input type="text" size="10" value="" id="arrival_date" name="arrival" class="forDate" readonly="readonly" />
										<input type="button" value="リセット" id="reset_arrival" />
									</td>
								</tr>
								<tr>
									<th>制作工場</th>
									<td>
										<select id="factory">
											<option value="0" selected="selected">----</option>
											<option value="1">第１工場</option>
											<option value="2">第２工場</option>
											<option value="9">第１・２工場</option>
										</select>
									</td>
								</tr>
								<tr style="display:none;">
									<th>イメ画</th>
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
										<th><ins>(13:00〆)</ins><br />入稿〆</th>
										<th>&nbsp;</th>
										<th><ins>(13:00〆)</ins><br />注文確定</th>
										<th>&nbsp;</th>
										<th>発送日</th>
										<th>&nbsp;</th>
										<th>お届け日</th>
										<th>&nbsp;</th>
									</tr>
									<tr>
										<td><input type="text" size="10" value="" id="schedule_date1" name="schedule1" class="forDate" readonly="readonly" /></td>
										<td>⇒</td>
										<td><input type="text" size="10" value="" id="schedule_date2" name="schedule2" class="forDate" readonly="readonly" /></td>
										<td>⇒</td>
										<td><input type="text" size="10" value="" id="schedule_date3" name="schedule3" class="forDate" readonly="readonly" /></td>
										<td>⇒</td>
										<td><input type="text" size="10" value="" id="schedule_date4" name="schedule4" class="forDate" readonly="readonly" /></td>
										<td><input type="button" value="リセット" id="reset_schedule" /></td>
									</tr>
									<tr class="btn">
										<th><input type="button" value="お届け日を計算" id="calc_schedule_date1" /></th>
										<td>&nbsp;</td>
										<th><input type="button" value="お届け日を計算" id="calc_schedule_date2" /></th>
										<td colspan="3">&nbsp;</td>
										<th><input type="button" value="注文確定日を計算" id="calc_schedule_date4" /></th>
										<td>&nbsp;</td>
									</tr>
									<tr>
										<td colspan="7">
											<div class="schedule_crumbs_toright">
												<p><span>注文確定日を基準</span></p>
											</div>
											<div class="schedule_crumbs_toleft">
												<p><span>お届け日を基準</span></p>
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
					<h2 class="ordertitle">●商品情報</h2>
					<div class="inner">
						<table class="iteminfo">
							<thead>
								<tr><th>商品種類</th><th>商品名</th><th>商品カラー</th><th>品番 ／ メーカー</th></tr>
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
										<img alt="アイテムカラー" src="./img/circle.png" width="25" id="item_color" />
										<input type="text" readonly="readonly" id="itemcolor_name" value="" />
									</td>
									<td>
										品　　番<input type="text" readonly="readonly" id="stock_number" value="" /><br />
										メーカー<input type="text" readonly="readonly" id="maker" value="" />
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
									注文リスト
									<!--
									<select>
										<option value="size" selected="selected">サイズ</option>
										<option value="color">カラー</option>
									</select>
									<input type="button" value="ソート" id="sort_orderlist">
									-->
								</caption>
								<thead>
									<tr>
										<th class="first tip"></th>
										<th class="centering"><img alt="" src="./img/check_32.png" width="20" /></th>
										<th>種類</th>
										<th>商品名</th>
										<th>サイズ</th>
										<th>商品の色</th>
										<th width="40">枚数</th>
										<th width="55">単価</th>
										<th width="80">金額</th>
										<th width="30">版</th>
										<th width="30" class="last">在庫</th>
										<th class="none"></th>
										<th class="tip"></th>
									</tr>
								</thead>
								<tfoot>
									<tr class="total">
										<td class="tip"></td>
										<td colspan="5" class="sum">商品代計</td>
										<td class="br0"><input type="text" value="0" size="8" readonly="readonly" id="total_amount" /></td>
										<td class="bl0" style="text-align:left;">枚</td>
										<td colspan="2"><input type="text" value="0" size="8" readonly="readonly" id="total_cost" /> 円</td>
										<td></td>
										<td class="none"></td>
										<td class="tip"></td>
									</tr>
									<tr class="heading">
										<th class="tip"></th>
										<th colspan="5">商品名</th>
										<th>数量</th>
										<th>単価</th>
										<th>金額</th>
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
										<td class="none"><input type="button" value="削除" class="delete_row" /></td>
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
										<td colspan="4" class="sum">合計</td>
										<td><input type="text" value="0" size="8" readonly="readonly" id="subtotal_estimate" /> 円</td>
										<td class="br0">消費税</td>
										<td class="bl0 toright"><input type="text" value="0" size="8" readonly="readonly" id="sales_tax" /> 円</td>
										<td colspan=2><input type="text" value="0" size="8" readonly="readonly" id="total_estimate_cost" /> 円</td>
										<td></td>
										<td class="none"></td>
										<td class="tip"></td>
									</tr>
								</tfoot>
								<tbody>
									
								</tbody>
							</table>
							<p id="estimation_toolbar">
								<input type="button" value="行の追加" class="add_row" />
							</p>
						</form>
						<p class="toright" id="notice_cost">-- 量販価格 --</p>
					</div>
				</div>

				<div class="phase_box freeform" style="display: none;">
					<p>
						<input type="button" value="インク色替を表示 >>" id="toggle_ink_pattern" /><ins>色替え情報あり</ins>
					</p>
					<div id="ink_pattern_wrapper">
						<h2 class="ordertitle">●インク色替<input type="button" value=">> reset" id="reset_exchink" /></h2>
						<div class="inner"></div>
					</div>
				</div>

				<div class="phase_box freeform">
					<h2 class="ordertitle">●プリント位置</h2>
					<div class="inner">
						<p id="print_position" class="anchorpoint">プリント位置</p>
						<p>
							<input type="checkbox" value="noprint" name="noprint" id="noprint" /><label for="noprint">&nbsp;プリントなし</label>
							<label id="exchink_label">インク色替え数：<input type="number" min="0" value="0" id="exchink_count" class="forNum" /></label>
						</p>
						<div id="pp_wrapper"></div>
						<div>
							<table id="itemprint">
								<caption>アイテムごとの明細【小計】</caption>
								<thead><tr><th>アイテム名</th><th>枚数</th><th>商品代</th><th>印刷代</th><th>印刷代/枚</th><th>小計/枚</th></tr></thead>
								<tfoot><tr><td colspan="6" class="toright"><span class="fontred">※</span> 諸経費は含まれていません<p></td></tr></tfoot>
								<tbody></tbody>
							</table>
						</div>
					</div>
				</div>

				<div class="phase_box">
					<h2 class="ordertitle">●原　稿</h2>
					<div class="inner">
						<p class="scrolltop"><a href="#order_wrapper">ページトップへ</a></p>
						<div class="designfee_wrapper"><p>デザイン代<input type="text" value="0" id="designcharge" name="designcharge" class="forPrice" size="8" />&nbsp;円</p></div>
						<table id="designtype_table">
							<tbody>
								<tr style="display: none;">
									<td>デザイン</td>
									<td>
										<label><input type="radio" name="design" value="手書き" />手書き</label>
										<label><input type="radio" name="design" value="文字打ち" />文字打ち</label>
										<label><input type="radio" name="design" value="画像" />画像</label>
										<label><input type="radio" name="design" value="イラレ" />イラレ</label>
										<label><input type="radio" name="design" value="その他" />その他</label>
									</td>
									<td class="last pending"><label><input type="radio" name="design" value="0" checked="checked" />未定</label></td>
								</tr>
								<tr>
									<td>入稿方法</td>
									<td>
										<label><input type="radio" name="manuscript" value="メール" />メール</label>
										<label><input type="radio" name="manuscript" value="FAX" />ＦＡＸ</label>
										<label><input type="radio" name="manuscript" value="郵送" />郵送（費用お客様負担）</label>
										<label><input type="radio" name="manuscript" value="お客様持参" />お客様持参</label>
										<label><input type="radio" name="manuscript" value="その他" />その他</label>
										<p><label>入稿予定日</label><input type="text" value="" class="fordate datepicker" id="manuscriptdate" /></p>
									</td>
									<td class="last pending"><label><input type="radio" name="manuscript" value="0" checked="checked" />未定</label></td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="phase_box">
					<h2 class="ordertitle">●原稿ファイル</h2>
						<div class="inner">
							<table id="designImg_table" class="design_table">
								<thead></thead><tbody></tbody>
							</table>
							<table id="uploadImg_table">
									<tbody>
										<tr id="uploadimg_table_title"><td>原稿ファイル追加<td></tr>
										<tr><td><img id="wait_img" src="img/pbar-ani.gif" width="144px" height="22px" style="display:none"></td></tr>
										<tr>
										<td>
											<form enctype="multipart/form-data" target="upload_iframe"  method="post"  action="./php_libs/design.php" id="uploaderform">
												<input type="hidden" value="uploadDesFile" name="act" />
												<input type="hidden" value="attatchfile" name="folder" />
												<input type="hidden" id="order_id" name="order_id" />
												<input type="file"  id="attach_des" name="attach_des"/>
												<input type= "button"  value="確認" id = "desImgup" />
												<input type= "button"  value="取消" id = "desImgcancel" />
											</form>
										</td>
										</tr>
									</tbody>
							</table>
						<iframe name="upload_iframe" style="display: none;"></iframe>
						</div>
				</div>

				<div class="phase_box">
					<h2 class="ordertitle">●イメージ画像</h2>
						<div class="inner">
							<table id="designedImg_table" class="design_table">
								<thead></thead><tbody></tbody>
							</table>
							<table id="uploadDesedImg_table">
									<tbody>
										<tr id="uploadimg_table_title"><td>イメージ画像ファイル追加<td></tr>
										<tr><td><img id="wait_img" src="img/pbar-ani.gif" width="144px" height="22px" style="display:none"></td></tr>
										<tr>
										<td>
											<form enctype="multipart/form-data" target="upload_iframe2"  method="post"  action="./php_libs/design.php" id="uploaderform">
												<input type="hidden" value="uploadDesFile" name="act" />
												<input type="hidden" value="imgfile" name="folder" />
												<input type="hidden" id="order_id" name="order_id" />
												<input type="file"  id="attach_img" name="attach_img"/>
												<input type= "button"  value="確認" id = "desedImgup" />
												<input type= "button"  value="取消" id = "desedImgcancel" />
											</form>
										</td>
										</tr>
									</tbody>
							</table>
						<iframe name="upload_iframe2" style="display: none;"></iframe>
						</div>
				</div>


				<div class="phase_box freeform" id="options_wrapper">
					<h2 class="ordertitle">●その他料金</h2>
					<div class="inner">
						<p id="order_option" class="anchorpoint">注文オプション</p>
						<table id="optprice_table">
						 	<tbody>
						 		<tr>
						 			<th>割　引</th>
						 			<td>
						 				<table id="discount_table">
						 				<colgroup class="classification"></colgroup>
						 				<tbody>
						 					<tr>
						 						<td>単独</td>
						 						<td>
						 							<span id="discount_reuse">リピート版</span><br />
						 							<label><input type="checkbox" name="discount" value="blog" />ブログ協力割(<ins>-3％</ins>)</label>
						 							<label><input type="checkbox" name="discount" value="illust" />イラレ割(<ins>-1,000</ins>)</label>
													<!--
														<span id="discount_illust">イラレ割(-1,000)</span>
													-->
						 							<label><input type="checkbox" name="discount" value="quick" disabled="disabled" />早割(-5％)</label>
						 							<label><input type="checkbox" name="discount" value="imgdesign" />イメ画無料</label>

						 						</td>
						 					</tr>
						 					<tr>
						 						<td>学生</td>
						 						<td>
						 							<label><input type="radio" name="discount1" value="student" />学割(<ins>-3%</ins>)</label><br />
									 				<label><input type="radio" name="discount1" value="team2" />クラス割（2ｸﾗｽ　<ins>-5%</ins>）</label>
									 				<label><input type="radio" name="discount1" value="team3" />クラス割（3ｸﾗｽ以上　<ins>-7%</ins>）</label>
									 			</td>
									 		</tr>
									 		<tr>
									 			<td>一般</td>
									 			<td>
						 							<label><input type="radio" name="discount2" value="repeat" />リピート割(<ins>-3％</ins>)</label>
						 							<label><input type="radio" name="discount2" value="introduce" />紹介割(<ins>-3％</ins>)</label>
						 							<label><input type="radio" name="discount2" value="vip" />ＶＩＰ割(<ins>-5％</ins>)</label>
						 							<p class="old_discount2"><label><input type="radio" name="discount2" value="friend" />リピート・紹介割(<ins>-3％</ins>)</label></p>
						 						</td>
						 					</tr>
											<tr>
									 			<td>その他</td>
									 			<td>
													<p>名目&nbsp;<input type="text" value="" name="extdiscountname" id="extradiscountname" /></p>
						 							<label><input type="radio" name="extradiscount" value="3" />-3％</label>
						 							<label><input type="radio" name="extradiscount" value="5" />-5％</label>
													<label><input type="radio" name="extradiscount" value="7" />-7％</label>
													<label><input type="radio" name="extradiscount" value="10" />-10％</label>
													<label><input type="radio" name="extradiscount" value="20" />-20％</label><span>(併用不可)</span>
						 						</td>
						 					</tr>
						 					<tr>
									 			<td>社員割</td>
									 			<td>
													<label><input type="checkbox" name="staffdiscount" id="staffdiscount" value="20" />-20％</label>
						 						</td>
						 					</tr>
						 					<tr>
						 						<td>&nbsp;</td>
						 						<td>
													<input type="button" id="reset_discount" value="割引なし" />
												</td>
						 					</tr>
						 				</tbody>
						 				</table>

						 			</td>
						 			<td class="last">
										<p>割引金額&nbsp;<input type="checkbox" value="1" name="free_discount" id="free_discount" /><label for="free_discount">手入力</label></p>
										<p><span class="fontred">▲</span><input type="text" value="0" name="discountfee" id="discountfee" size="8" readonly="readonly" class="forPrice" />&nbsp;円</p>
									</td>
						 		</tr>
						 		<tr class="separate"><td colspan="2"></td></tr>
						 		<tr>
						 			<th>値引き</th>
						 			<td>
						 				<label>名目&nbsp;<input type="text" value="" name="reductionname" id="reductionname" /></label>
						 				<label class="fontred">▲</label><input type="text" value="0" id="reductionprice" name="reduction" class="forPrice" />&nbsp;円
										<input type="checkbox" value="0" name="freeshipping" id="freeshipping" /><label for="freeshipping">送料無料</label>
						 			</td>
						 			<td class="last">&nbsp;</td>
						 		</tr>
						 		<tr class="separate"><td colspan="2"></td></tr>
								<tr>
						 			<th>追加料金</th>
						 			<td>
										<label>名目&nbsp;<input type="text" value="" name="additionalname" id="additionalname" /></label>
										<label>金額</label><input type="text" value="0" name="additionalfee" id="additionalfee" class="forPrice" />&nbsp;円
						 			</td>
						 			<td class="last">&nbsp;</td>
						 		</tr>
						 		<tr class="separate"><td colspan="2"></td></tr>
						 		<tr class="freeform">
				 					<th>支払方法</th>
						 			<td>
						 				<p>
						 					<label><input type="radio" name="payment" value="wiretransfer" />振込（手数料お客様負担）</label>
						 					<label><input type="radio" name="payment" value="credit" />カード（手数料5%お客様負担）</label>
						 					<label><input type="radio" name="payment" value="conbi" />コンビニ決済</label>
							 			</p>
						 				<p>
						 					<label><input type="radio" name="payment" value="cod" />代金引換</label>
											<label><input type="radio" name="payment" value="cash" />現金</label>
											<label><input type="radio" name="payment" value="other" />その他 <input type="text" value="" id="payment_other" /></label>
											<!--
							 				<label><input type="radio" name="payment" value="check" />小切手</label><img alt="ヘルプ" src="./img/b_wakabamark.png" class="help_mark" />
							 				<label><input type="radio" name="payment" value="note" />手形</label><img alt="ヘルプ" src="./img/b_wakabamark.png" class="help_mark" />
											-->
						 					<label class="pending"><input type="radio" name="payment" value="0" checked="checked" />未定</label>
						 				</p>
						 				<p>
						 					<label>入金予定日</label><input type="text" name="paymentdate" id="paymentdate" class="forDate datepicker" />
							 			</p>
						 			</td>
						 			<td class="last"><p>コンビニ手数料</p><p><input type="text" value="0" id="conbifee" size="8" readonly="readonly" />&nbsp;円</p><p>代引手数料</p><p><input type="text" value="0" id="codfee" size="8" readonly="readonly" />&nbsp;円</p></td>
						 		</tr>
						 		<tr class="separate"><td colspan="2"></td></tr>
						 		<tr class="freeform">
						 			<th>発送方法</th>
						 			<td>
						 				<p id="deliver_wrapper">
						 					<label><input type="radio" name="deliver" value="1" />佐川急便</label>
						 					<label><input type="radio" name="deliver" value="2" />ヤマト運輸</label>
						 					<label><input type="radio" name="deliver" value="3" />西濃運輸</label>
						 					<label><input type="radio" name="deliver" value="99" />その他</label>
						 					<label class="pending"><input type="radio" name="deliver" value="0" checked="checked" />未定</label>
							 			</p>
										<p>
											<label>お問い合わせ番号</label><input type="text" name="contact_number" value="" id="contact_number" />
										</p>
						 				<p>
						 					<span id="carriage_name">宅急便</span>
						 					<label id="deliverytime_wrapper">配達時間帯
						 					<select name="deliverytime" id="deliverytime">
						 						<option value="0">---</option>
						 						<option value="1">午前中</option>
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
					<h2 class="ordertitle">●お客様情報</h2>
					<div class="inner">
						<p id="order_customer" class="anchorpoint">顧客情報</p>
						<form id="customer_form" name="customer_form" action="" onsubmit="return false;">
							<p><input type="button" value="検索する" id="search_customer" />
							<input type="button" value="お客様情報を修正する" id="modify_customer" />&nbsp;<ins>修正中です。保存されていません！</ins>
							<input type="button" value="リセット" id="cancel_customer" />
							<input type="button" value="上書保存する" id="update_customer" /></p>
							<div class="pulldown">
								<div id="result_customer_wrapper" class="popup_wrapper">
									<div class="inner">
										<p class="popup_title">検索結果<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
										<div class="result_list"></div>
									</div>
								</div>
							</div>

							<fieldset>
								<legend>●</legend>
								<table>
									<tbody>
										<tr>
											<th>顧客ID</th>
											<td colspan="3"><input type="text" name="number" value="" size="15" readonly="readonly" class="nostyle" /></td>
											<td><input type="hidden" name="cstprefix" value="k" /></td>
											<td><input type="hidden" name="customer_id" value="0" /></td>
										</tr>
										<tr>
											<th>フリガナ</th><td colspan="2"><input type="text" name="customerruby" value="" size="36" id="customerkana" /></td>
											<td colspan="2"><span class="header">フリガナ</span><input type="text" name="companyruby" value="" size="20" /></td>
											<td class="fontred"><p id="alert_exist"><img alt="ダブり確認" src="./img/i_alert.png" width="30" />&nbsp;ダブり確認</p></td>
										</tr>
										<tr>
											<th>顧客名</th><td colspan="2"><input type="text" name="customername" value="" size="36" id="customername" maxlength="80" class="restrict" /></td>
											<td colspan="3"><span class="header">担　当　</span><input type="text" name="company" value="" size="20" maxlength="80" class="restrict" /></td>
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
											<td colspan="5"><input type="button" value="e-Mail テスト" id="check_email" /></td>
										</tr>
									</tbody>
								</table>
							</fieldset>

							<p>●月〆請求情報を<input type="button" value="開く" id="switch_cyclebill" /></p>
							<div id="cyclebill_wrapper">
								<table>
									<caption>月締め請求情報</caption>
									<tbody>
										<tr>
											<th>請求区分</th>
											<td><?php echo $selectors['bill']['src'];?></td>
											<th>請求〆日</th>
											<td><?php echo $selectors['cutofday']['src'];?></td>
											<th>回収サイクル</th>
											<td><?php echo $selectors['cycle']['src'];?></td>
											<th>回収日</th>
											<td><?php echo $selectors['paymentday']['src'];?></td>
										</tr>
										<tr>
											<!-- 2014-01-23 廃止
											<th>取引区分</th>
											<td><?php echo $selectors['sales']['src'];?></td>
											<th>入金区分</th>
											<td><?php echo $selectors['receipt']['src'];?></td>
											-->
											<!-- 2014-05-01 廃止
											<th>税計算区分</th>
											<td><?php echo $selectors['tax']['src'];?></td>
											-->
											<th>振込手数料</th>
											<td><?php echo $selectors['charge']['src'];?>&nbsp;負担</td>
											<td colspan="4"></td>
										</tr>
									</tbody>
								</table>
							</div>

							<table>
								<tbody>
									<tr>
										<th>郵便番号</th>
										<td>
											<input type="text" name="zipcode" value="" size="10" id="zipcode1" class="forZip" onchange="AjaxZip3.zip2addr(this,'','addr0','addr1');">
										</td>
									</tr>
									<tr>
										<th>都道府県</th>
										<td>
											<input type="text" name="addr0" value="" size="10" id="addr0" placeholder="都道府県" maxlength="4">
										</td>
									</tr>
									<tr><th>住所１</th>
										<td>
											<input type="text" name="addr1" value="" size="100" id="addr1" maxlength="56" class="restrict">
											<div class="pulldown">
												<div id="address_wrapper1" class="popup_wrapper">
													<div class="inner">
														<p class="popup_title">Address List<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
														<div id="address_list1" class="result_list"></div>
													</div>
												</div>
											</div>
										</td>
									</tr>
									<tr><th>住所２</th><td><input type="text" name="addr2" value="" size="100" id="addr2" placeholder="マンション・ビル名" maxlength="32" class="restrict" /></td></tr>
									<tr><th>会社・部門１</th><td><input type="text" name="addr3" value="" size="100" id="addr3" maxlength="50" class="restrict" /></td></tr>
									<tr><th>会社・部門２</th><td><input type="text" name="addr4" value="" size="100" id="addr4" maxlength="50" class="restrict" /></td></tr>
									<tr><th>備　考</th><td><textarea name="customernote" rows="4" id="customernote"></textarea></td></tr>
								</tbody>
							</table>
						</form>

					</div>
				</div>

				<div class="phase_box freeform" id="delivery_address_wrapper">
					<h2 class="ordertitle">●納品先住所</h2>
					<div class="inner">
						<form id="delivery_form" name="delivery_form" action="" onsubmit="return false;">
							<p>
								<input type="button" value="修整する" id="modify_delivery" />&nbsp;
								<input type="button" value="住所と同じ" id="deliveryaddr" />&nbsp;
								<input type="button" value="一覧を表示する" id="show_delivery" />
								<input type="reset" value="リセット" id="clear_delivery" />
							</p>
							<div class="pulldown">
								<div id="result_delivery_wrapper" class="popup_wrapper">
									<div class="inner">
										<p class="popup_title">検索結果<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
										<div class="result_list"></div>
									</div>
								</div>
							</div>
							<fieldset>
								<legend>●</legend>
								<table>
									<tbody>
										<tr>
											<th>納品先ID</th>
											<td><input type="text" name="delivery_id" value="" size="15" readonly="readonly" class="nostyle" /></td>
										</tr>
										<tr>
											<th>お届先</th>
											<td><input type="text" name="organization" value="" size="64" maxlength="32" class="restrict" /></td>
										</tr>
										<!--
										<tr>
											<th>担当者</th><td><input type="text" name="agent" value="" size="20" /></td>
											<th>クラス</th><td><input type="text" name="team" value="" size="20" /></td>
											<th>先生</th><td><input type="text" name="teacher" value="" size="20" /></td>
										</tr>
										-->
									</tbody>
								</table>
							</fieldset>
							<table>
								<tbody>
									<tr>
										<th>郵便番号</th>
										<td>
											<input type="text" name="delizipcode" value="" size="10" id="zipcode2" class="forZip" onchange="AjaxZip3.zip2addr(this,'','deliaddr0','deliaddr1');">
										</td>
									</tr>
									<tr>
										<th>都道府県</th>
										<td>
											<input type="text" name="deliaddr0" value="" size="10" id="deliaddr0" placeholder="都道府県" maxlength="4">
										</td>
									</tr>
									<tr><th>住所１</th>
										<td>
											<input type="text" name="deliaddr1" value="" size="100" id="deliaddr1" maxlength="56" class="restrict" />
											<div class="pulldown">
												<div id="address_wrapper2" class="popup_wrapper">
													<div class="inner">
														<p class="popup_title">Address List<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
														<div id="address_list2" class="result_list"></div>
													</div>
												</div>
											</div>
										</td>
									</tr>
									<tr><th>住所２</th><td><input type="text" name="deliaddr2" value="" size="100" id="deliaddr2" placeholder="マンション・ビル名" maxlength="32" class="restrict" /></td></tr>
									<tr><th>会社・部門１</th><td><input type="text" name="deliaddr3" value="" size="100" id="deliaddr3" maxlength="50" class="restrict" /></td></tr>
									<tr><th>会社・部門２</th><td><input type="text" name="deliaddr4" value="" size="100" id="deliaddr4" maxlength="50" class="restrict2" /></td></tr>
									<tr><th>TEL</th><td><input type="text" name="delitel" value="" size="24" class="forPhone" /></td></tr>
								</tbody>
							</table>
						</form>
					</div>
					
					<h2 class="ordertitle">●発送元</h2>
					<div class="inner">
						<form id="shipfrom_form" name="shipfrom_form" action="" onsubmit="return false;">
							<p>
								<input type="button" value="住所と同じ" id="shipfromaddr" />&nbsp;
								<input type="button" value="一覧を表示する" id="show_shipfrom" />
							</p>
							<div class="pulldown">
								<div id="result_shipfrom_wrapper" class="popup_wrapper">
									<div class="inner">
										<p class="popup_title">検索結果<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
										<div class="result_list"></div>
									</div>
								</div>
							</div>
							<fieldset>
								<legend>●</legend>
								<table>
									<tbody>
										<tr><th>フリガナ</th><td><input type="text" name="shipfromruby" value="" size="64" /></td></tr>
										<tr><th>依頼主名</th><td><input type="text" name="shipfromname" value="" size="64" maxlength="32" class="restrict" /></td></tr>
									</tbody>
								</table>
							</fieldset>
							<table>
								<tbody>
									<tr>
										<th>郵便番号</th>
										<td colspan="3">
											<input type="text" name="shipzipcode" value="" size="10" id="zipcode3" class="forZip" onchange="AjaxZip3.zip2addr(this,'','shipaddr0','shipaddr1');">
										</td>
									</tr>
									<tr>
										<th>都道府県</th>
										<td colspan="3">
											<input type="text" name="shipaddr0" value="" size="10" id="shipaddr0" placeholder="都道府県" maxlength="4">
										</td>
									</tr>
									<tr>
										<th>住所１</th>
										<td colspan="3">
											<input type="text" name="shipaddr1" value="" size="100" id="shipaddr1" maxlength="56" class="restrict" />
											<div class="pulldown">
												<div id="address_wrapper3" class="popup_wrapper">
													<div class="inner">
														<p class="popup_title">Address List<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
														<div id="address_list3" class="result_list"></div>
													</div>
												</div>
											</div>
										</td>
									</tr>
									<tr><th>住所２</th><td colspan="3"><input type="text" name="shipaddr2" value="" size="100" id="shipaddr2" placeholder="マンション・ビル名" maxlength="32" class="restrict" /></td></tr>
									<tr><th>会社・部門１</th><td colspan="3"><input type="text" name="shipaddr3" value="" size="100" id="shipaddr3" maxlength="50" class="restrict" /></td></tr>
									<tr><th>会社・部門２</th><td colspan="3"><input type="text" name="shipaddr4" value="" size="100" id="shipaddr4" maxlength="50" class="restrict" /></td></tr>
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
					<h2 class="ordertitle">●アンケート</h2>
					<div class="inner">
						<table id="questionnaire_table">
							<tbody>
								<tr>
									<td rowspan="4" class="separate">用　途</td>
									<td class="label">イベント</td>
									<td>
										<p>
											<label><input type="radio" name="purpose" value="文化祭" />文化祭</label>
											<label><input type="radio" name="purpose" value="体育祭" />体育祭</label>
											<label><input type="radio" name="purpose" value="販促用" />販促用</label>
											<label><input type="radio" name="purpose" value="結婚式" />結婚式</label>
											<label><input type="radio" name="purpose" value="コンサート" />コンサート</label>
											<label><input type="radio" name="purpose" value="企業イベント" />企業イベント</label>
											<br>
											<label><input type="radio" name="purpose" value="スポーツイベント" />スポーツイベント</label>
											<label><input type="radio" name="purpose" value="選挙" />選挙</label>
											<label><input type="radio" name="purpose" value="お祭り" />お祭り</label>
											<label><input type="radio" name="purpose" value="ボランティア" />ボランティア</label>
											<label><input type="radio" name="purpose" value="記念イベント" />記念イベント</label>
											<br>
											<label><input type="radio" name="purpose" value="その他イベント" />その他</label>
											<input type="text" value="" class="purpose_text other_1" />
										</p>
									</td>
								</tr>
								<tr>
									<td class="label">ユニフォーム</td>
									<td>
										<p>
											<label><input type="radio" name="purpose" value="職場ユニフォーム" />職場用</label>
											<label><input type="radio" name="purpose" value="スポーツユニフォーム" />スポーツ用</label>
											<label><input type="radio" name="purpose" value="飲食店用" />飲食店用</label>
											<label><input type="radio" name="purpose" value="医療、介護、福祉用" />医療、介護、福祉用</label>
											<label><input type="radio" name="purpose" value="公務員用" />公務員用</label>
											<br>											
											<label><input type="radio" name="purpose" value="サークル・部活" />サークル・部活</label>
											<label><input type="radio" name="purpose" value="その他ユニフォーム" />その他</label>
											<input type="text" value="" class="purpose_text other_2" />
										</p>
									</td>
								</tr>
								<tr>
									<td class="label">個人</td>
									<td>
										<p>
											<label><input type="radio" name="purpose" value="自分用" />自分用</label>
											<label><input type="radio" name="purpose" value="プレゼント" />プレゼント用</label>
										</p>
									</td>
								</tr>
								<tr class="separate">
									<td class="label">その他</td>
									<td>
										<p>
											<label><input type="radio" name="purpose" value="その他団体" />その他団体</label>
											<input type="text" value="" class="purpose_text other_3" />
											<label><input type="radio" name="purpose" value="" checked="checked" />未定</label>
										</p>
									</td>
								</tr>
								<tr>
									<td>職　業</td>
									<td colspan="2">
										<p>
											<label><input type="radio" name="job" value="法人" />法人</label>
											<label><input type="radio" name="job" value="小学校" />小学校</label>
											<label><input type="radio" name="job" value="中学校" />中学校</label>
											<label><input type="radio" name="job" value="高校" />高校</label>
											<label><input type="radio" name="job" value="大学" />大学</label>
										</p>
										<p>
											<label><input type="radio" name="job" value="専門学校" />専門学校</label>
											<label><input type="radio" name="job" value="会社員" />社会人</label>
											<label><input type="radio" name="job" value="主婦" />主婦</label>
											<label><input type="radio" name="job" value="その他" />その他</label>
										</p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="phase_box freeform" id="page_border">
					<h2 class="ordertitle">●コメント</h2>
					<div class="inner">
						<p class="scrolltop"><a href="#order_wrapper">ページトップへ</a></p>
						<p><textarea id="order_comment" cols="80" rows="8"></textarea></p>
						<div class="clearfix">
							<div class="leftside">
								<p>納品書の摘要</p>
								<p><textarea id="invoicenote" cols="80" rows="3"></textarea></p>
							</div>
							<div class="rightside">
								<p>請求書の備考</p>
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
				<h3>見積り金額</h3>
				<div class="estimate_body">
					<table id="est_table1">
						<tbody>
							<tr><th>商品代</th><td id="est_price">0</td></tr>
							<tr>
								<th>印刷代 <input type="checkbox" value="1" name="free_printfee" id="free_printfee" /><label for="free_printfee">手入力</label></th>
								<td><input type="text" value="0" name="est_printfee" id="est_printfee" readonly="readonly" class="forPrice readonly" /></td>
							</tr>
							<tr><th class="sub">シルク</th><td id="est_silk_printfee">0</td></tr>
							<tr><th class="sub">カラー転写</th><td id="est_color_printfee">0</td></tr>
							<tr><th class="sub">デジタル転写</th><td id="est_digit_printfee">0</td></tr>
							<tr><th class="sub">インクジェット</th><td id="est_inkjet_printfee">0</td></tr>
							<tr><th class="sub">カッティング</th><td id="est_cutting_printfee">0</td></tr>
							<tr><th>インク色替え</th><td id="est_exchink">0</td></tr>
							<tr class="separate"><th>追加料金</th><td id="est_additionalfee">0</td></tr>
							<tr><th><p class="fontred">割引▲</p></th><td id="est_discount" class="fontred">0</td></tr>
							<tr class="separate"><th><p class="fontred">値引▲</p></th><td id="est_reduction" class="fontred">0</td></tr>
							<tr class="separate"><th id="pack_mode">袋詰め代</th><td id="est_package">0</td></tr>
							<tr><th>特急料金</th><td id="est_express">0</td></tr>
							<tr class="separate"><th>送料</th><td id="est_carriage">0</td></tr>
							<!--<tr class="separate"><th>特別送料</th><td id="est_extracarry">0</td></tr>-->
							<tr><th>デザイン代</th><td id="est_designfee">0</td></tr>
							<tr><th>代引手数料</th><td id="est_codfee">0</td></tr>
							<tr><th>コンビニ手数料</th><td id="est_conbifee">0</td></tr>
						</tbody>
					</table>
				</div>

				<table class="estimate_total" id="est_table2">
					<tfoot><tr><td colspan="2"><img alt="firmorder" src="./img/btn_firmorder.png" height="30" id="firm_order" /></td></tr></tfoot>
					<tbody>
						<tr><th>計</th><td id="est_basefee">0</td></tr>
						<tr><th>消費税</th><td id="est_salestax">0</td></tr>
						<tr><th>カード手数料</th><td id="est_creditfee">0</td></tr>
						<tr class="total division"><th>合計</th><td id="est_total_price">0</td></tr>
						<tr class="separate"><td colspan="2"></td></tr>
						<tr><th>枚数</th><td><span id="est_amount">0</span>枚</td></tr>
						<tr class="division"><th>1枚あたり</th><td id="est_perone">0</td></tr>
						<tr class="separate"><td colspan="2"></td></tr>
						<tr class="total"><th>予算</th><td><input type="text" value="0" id="est_budget" name="budget" class="forPrice" />&nbsp;円</td></tr>
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
				<h2 class="directiontitle">●プリントタイプ<span id="direction_selector"></span></h2>
			</div>

			<div id="dire_title" class="clearfix">
				<div>
					<p><span class="printtype_name"></span>　<span>製作指示書</span><span id="factory_name"></span><span id="curr_printtype"></span></p>
					<p>受注日：<span id="created"></span>注文ID：<span></span>顧客No：<span></span>受付担当：<span></span></p>
					<p class=print_title>題名：<span></span></p>
				</div>
				<div>
					<p>発送日：<span id="shipping_date"></span>発</p>
					<p>お届日：<span id="delivery_date"></span><span id="delivery_time"></span>着</p>
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
					<li><a href="#tabs-1">基本データ</a></li>
				</ul>
				<div id="tabs-1">
					<div class="tabs_wrapper">
						<div id="leftarea">
							<table>
								<tbody>
									<tr>
										<td>
											<label>商品手配</label>
											<span id="arrange"></span>
											<!--
											<select id="arrange">
												<option value="1">注文</option>
												<option value="2">持込</option>
											</select>
											-->
										</td>
										<td>
											<label>入荷予定日</label>
											<span id="arrive"></span>
										</td>
									</tr>
								</tbody>
							</table>
							<table id="dire_items_table">
								<thead>
									<tr><th>品番</th><th>メーカー</th><th>商品の色</th><th>サイズ</th><th>枚数</th><th>備考</th></tr>
								</thead>
								<tfoot><tr><td colspan="5">合計</td><td><span></span>枚</td></tr></tfoot>
								<tbody><tr><td colspan="6"></td></tr></tbody>
							</table>
							
							<div id="dire_note_wrapper">
								<div class="direction_note">
									<div><textarea cols="30" rows="10" id="workshop_note"></textarea></div>
									<p>現場の備考<input type="button" value="保存" onclick="mypage.save('direction')" /></p>
								</div>
							</div>
						</div>

						<div id="rightarea">
							<table id="dire_delivery_table">
								<caption>出荷方法</caption>
								<tbody>
									<tr>
										<th>袋詰め</th><td class="package">--</td>
										<th>箱数</th><td><span id="numberofbox">0</span> 箱</td>
										<th>封筒</th>
										<td>
											<select id="envelope">
												<option value="0">なし</option>
												<option value="1">あり</option>
											</select>
										</td>
										<td colspan="2"></td>
									</tr>
									<tr class="sectionSeparator"><td colspan="8"></td></tr>
									<tr>
										<!--<th>返却物</th><td colspan="3"><textarea id="ret_note"></textarea></td>-->
										<th>備考</th><td colspan="7"><textarea id="ship_note"></textarea></td>
									</tr>
									<tr class="sectionSeparator"><td colspan="8"></td></tr>
									<tr>
										<th>送り先</th>
										<td colspan="5">
											<p>〒<span class="zipcode">-</span></p>
											<p class="addr1">登録なし</p>
											<p class="addr2"> </p>
										</td>
										<td colspan="2" style="vertical-align: bottom;"><p>TEL：<span class="delitel"></span></p></td>
									</tr>
								</tbody>
							</table>
							
							<div class="jobtime_wrapper clearfix">
								<div class="title">製版</div>
								<div>
									<select id="platescheck">
										<option value="0">リピ版</option>
										<option value="1" selected="selected">新版</option>
										<option value="2">再版</option>
									</select>
								</div>
								<div class="title">シート糊</div>
								<div>
									<select id="pastesheet">
										<option value="1" selected="selected">ナイロン用</option>
										<option value="2">綿用</option>
									</select>
								</div>
								<div class="title">転写ふち</div>
								<div>
									<select id="edge">
										<option value="1" selected="selected">白ふち</option>
										<option value="2">スーパー</option>
										<option value="3">濃色透明</option>
										<option value="4">淡色透明</option>
										<option value="5">隠ぺい</option>
										<option value="6">シルク転写</option>
									</select>
								</div>
								<div class="title edgecolor_wrap" style="display:none">色</div>
								<div class="edgecolor_wrap" style="display:none">
									<input type="text" value="" id="edgecolor" />
								</div>
							
							</div>
							<div class="jobtime_wrapper clearfix">
								<div class="title">版数</div>
								<div><input type="text" value="" id="platescount" class="forNum" />版</div>
							</div>
							
							<table id="dire_option_table">
								<caption>面付け</caption>
								<tfoot><tr><td colspan="2"></td><td><input type="button" value="追加" id="add_cutpattern" /></td></tr></tfoot>
								<tbody>
									<tr>
										<td><input type="text" value="" class="shotname" /></td>
										<td><input type="text" value="0" class="shot" class="forNum" /> 面 × <input type="text" value="0" class="sheets" class="forNum" /> シート</td>
										<td>　</td>
									</tr>
									
								<!--
									<tr class="type_common">
										<th>版</th>
										<td>
											<select id="platescheck">
												<option value="0">リピ版</option>
												<option value="1" selected="selected">新版</option>
												<option value="2">再版</option>
											</select>
										</td>
										<th>メッシュ</th>
										<td class="mesh_wrap">
											<div id="mesh" style="width:100px; height:30px;"></div>
										</td>
										<th>インク種類</th>
										<td><input type="text" value="" id="medome" readonly="readonly" /></td>
									</tr>
									<tr class="sectionSeparator"><td colspan="6"></td></tr>
									<tr>
										<th class="type_digit">面付</th>
										<td class="type_digit"><input type="text" value="" id="cutpattern" class="forNum" /></td>
										<th class="type_trans" style="width:65px;">シート数</th>
										<td class="type_trans"><input type="text" value="0" id="sheetcount" class="forNum" /></td>
										<th class="type_common">版数</th>
										<td class="type_common"><input type="text" value="" id="platescount" class="forNum" />版</td>
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
					<legend>受注　検索フォーム</legend>
					<div class="clearfix">
						<form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">
							<div>
								<table style="width:100%;">
									<tbody>
										<tr>
											<th>更新日</th>
											<td colspan="3">
												<input type="text" value="" name="lm_from" size="10" class="forDate datepicker" /> 〜<input type="text" value="" name="lm_to" size="10" class="forDate datepicker" />
												<input type="button" value="クリア" id="clear_lastmodified" class="btn" >
												<span style="padding-left:10px;">受注担当</span>
												<select name="staff_id" id="staff_id" class="staff" rel="rowid1">
													<?php echo $staff_selector; ?>
												</select>
											</td>
										</tr>
										<tr>
											<th>発送日</th>
											<td colspan="3">
												<input type="text" value="" name="term_from" id="term_from" size="10" class="forDate datepicker" /> 〜<input type="text" value="" name="term_to" id="term_to" size="10" class="forDate datepicker" />
												<input type="button" value="クリア" id="clear_term" class="btn" >
												<span style="padding-left:10px;">工場</span>
												<select name="factory">
													<option value="0" selected="selected">----</option>
													<option value="1">第１工場</option>
													<option value="2">第２工場</option>
													<option value="9">第１・２工場</option>
												</select>
											</td>
										</tr>
										<tr>
											<th>受注No.</th>
											<td><input type="text" value="" name="id" size="6" class="forBlank" /></td>
											<th>題　　名</th>
											<td><input type="text" value="" name="maintitle" size="30" /></td>
										</tr>
									</tbody>
								</table>
								
								<ul class="crumbs" id="acceptstatus_navi">
									<li><p class="active_crumbs">全て</p></li>
									<li><p>Web注文</p></li>
									<li><p>問合せ</p></li>
									<li><p>見積りメール済</p></li>
									<li><p>イメ画</p></li>
									<li><p>注文確定</p></li>
									<li><p>取消</p></li>
								</ul>
							</div>
							<div>
								<table style="width: 520px;">
									<tbody>
										<tr>
											<th>顧客ID</th>
											<td><input type="text" value="" name="number" size="6" /></td>
											<th>イメ画</th>
											<td>
												<select name="imagecheck">
													<option value="" selected="selected">----</option>
													<option value="2">未送信</option>
													<option value="1">送信済</option>
												</select>
											</td>
										</tr>
										<tr>
											<th>カナ</th>
											<td><input type="text" value="" name="customerruby" size="25" /></td>
											<th>カナ</th>
											<td><input type="text" value="" name="companyruby" size="25" /></td>
										</tr>
										<tr>

											<th>顧客名</th>
											<td><input type="text" value="" name="customername" size="25" /></td>
											<th>担当</th>
											<td><input type="text" value="" name="company" size="25" /></td>
										</tr>
									</tbody>
								</table>
							</div>
						</form>
					</div>

					<p class="btn_area">
						<input type="button" value="検索" title="search" />
						<select id="sort">
							<option value="0">昇順</option>
							<option value="1" selected="selected">降順</option>
						</select>
						<input type="button" value="reset" title="reset" />&nbsp;<input type="button" value="　『 新規注文の受付 』　" title="order" />
						<select id="applyto">
							<option value="0" selected="selected">通常</option>
							<option value="1">Self-Design</option>
						</select>
						<input type="hidden" value="" name="progress_id" id="progress_id" />
					</p>
				</fieldset>

				<div id="result_wrapper" style="display:block;">
				<!--
					<p class="submenu">
						<span class="btn_pagenavi" title="searchform">&lt;&lt; 検索フォームヘ</span>
						<span class="dept">
							<span class="btn_pagenavi" title="order">新規注文の受付</span>
							<span class="chk_pagenavi chk_active corner-left" title="applyto">通常</span><span class="chk_pagenavi corner-right" title="applyto">Self-Design</span>
						</span>
					</p>
				-->
					<p class="pagenavi">検索結果<span id="result_count">0</span>件</p>
					<div id="result_searchtop"></div>
				</div>

			</div>

		</div>

<!--
		<div id="main_footer" class="footer">
			<p>Copyright &copy; 2008-<?php echo date('Y');?> オリジナルＴシャツのタカハマライフアート All rights reserved.</p>
		</div>
-->
	</div>



	<div id="log_wrapper">
		<div class="inner">
			<p>
				<input type="text" value="" id="against" /><input type="button" value="検索" id="search_log" />
				<input type="button" value="入力画面へ" id="showtoggle" />
				<input type="button" value="クリア" id="cleareditor" />
				<input type="button" value="全リストを開く" id="listtoggle" />
				<img alt="閉じる" src="./img/cross.png" class="close_popup_log" />
			</p>
			<div id="log_editor">
				<form name="logeditor_form" action="" onsubmit="return false">
					<textarea cols="50" rows="6" id="log_text" name="log_text"></textarea>
					<div class="del_wrapper"><input type="button" value="削除" id="delete_log" /></div>
					<p>担当：
						<select id="log_staff" name="log_staff"><?php echo $staff_selector; ?></select>
						<input type="button" value="ログを修正更新" id="modify_log" />
						<input type="button" value="新規書込み" id="save_log" />
					</p>

					<input type="hidden" value="" name="cstlogid" />
				</form>
			</div>
			<div id="list_wrapper">
				<div class="pan">
					<p>ログ一覧</p>
					<p class="pan_res"><strong id="searchword"></strong> の検索結果一覧　<span id="init_pane">全てのログ一覧へ</span></p>
				</div>
				<div class="pane">
					<table>
						<tbody>
							<tr><td colspan="4">　</td></tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<div id="mailer_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Takahama Life Art<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="popup_inner"></div>
			</div>
		</div>
	</div>

	<div id="itemcolor_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Item Color<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="itemcolor_list"></div>
			</div>
		</div>
	</div>

	<div id="itemsize_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Size<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="itemsize_list"></div>
			</div>
		</div>
	</div>

	<div id="inkcolor_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Ink Color<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="inkcolor_list"></div>
			</div>
		</div>
	</div>

	<div id="printposition_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Print Type<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="printposition_list"></div>
			</div>
		</div>
	</div>

	<div id="bundle_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">同梱リスト<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="bundle_list"></div>
			</div>
		</div>
	</div>

	<div id="print_calculator" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">プリント代　計算機<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
			<div class="calc_inner">

				<table>
					<thead><tr><th>位置</th><th>色数</th><th>大きさ</th></tr></thead>
				 	<tbody>
				 	<?php
				 		$html="";
				 		for($c=0; $c<5; $c++){
				 			$html .= '<tr>';
					 		$html .= '	<td>';
					 		$html .= '		<select class="calc_print_position">';
					 		$html .= '			<option value="" selected="selected">-</option>';
							$html .= '			<option value="mae">前</option>';
							$html .= '			<option value="mune_right">右胸</option>';
							$html .= '			<option value="mune_left">左胸</option>';
							$html .= '			<option value="suso_right">右すそ</option>';
							$html .= '			<option value="suso_left">左すそ</option>';
							$html .= '			<option value="suso_mae">前すそ</option>';
							$html .= '			<option value="waki_right">右脇</option>';
							$html .= '			<option value="waki_left">左脇</option>';
							$html .= '			<option value="sode_right">右そで</option>';
							$html .= '			<option value="sode_left">左そで</option>';
							$html .= '			<option value="usiro">後</option>';
							$html .= '			<option value="kubi_usiro">首後</option>';
							$html .= '			<option value="usiro_suso_right">後右裾</option>';
							$html .= '			<option value="usiro_suso_left">後左裾</option>';
							$html .= '			<option value="usiro_suso">後すそ</option>';
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
							$html .= '			<option value="0" selected="selected">大</option>';
							$html .= '			<option value="1">中</option>';
							$html .= '			<option value="2">小</option>';
							$html .= '		</select>';
					 		$html .= '	</td>';
					 		$html .= '	<td><p class="calc_print_type"></p></td>';
					 		$html .= '	<td><p class="calc_price"><span>0</span>&nbsp;円</p></td>';
					 		$html .= '</tr>';
				 		}
				 		echo $html;
				 	?>
				 		<tr>
							<td colspan="3" class="toright"></td>
							<td class="toright">シルク　計</td>
							<td><p class="calc_tot_price"><span>0</span>&nbsp;円</p></td>
						</tr>
						<tr>
							<td colspan="3" class="toright"></td>
							<td class="toright">カラー転写　計</td>
							<td><p class="calc_tot_price"><span>0</span>&nbsp;円</p></td>
						</tr>
						<tr>
							<td colspan="3" class="toright"></td>
							<td class="toright">インクジェット　計</td>
							<td><p class="calc_tot_price"><span>0</span>&nbsp;円</p></td>
						</tr>
						<tr>
							<td colspan="3" class="toright"></td>
							<td class="toright">合　計</td>
							<td><p class="calc_tot_price"><span>0</span>&nbsp;円</p></td>
						</tr>
				 	</tbody>
				 </table>

				 <table>
				 	<tbody>
				 		<tr>
				 			<td>割増率
				 				<select id="calc_ratio">
				 					<option value="1" selected="selected">1</option>
				 					<option value="1.25">1.25</option>
				 					<option value="1.3">1.3</option>
				 					<option value="1.35">1.35</option>
				 					<option value="1.5">1.5</option>
				 					<option value="1.1">1.1</option>
				 				</select>
				 			</td>
				 			<td><input type="checkbox" id="chkRepeat"/><label for="chkRepeat">&nbsp;リピーター</label></td>
				 		</tr>
				 	</tbody>
				</table>

				<p>
					枚数&nbsp;<input type="text" value="0" id="calc_amount" class="forNum" />&nbsp;枚
				 	<input type="button" value="計算" id="calc_printfee" />
				 	<input type="button" value="reset" id="calc_reset" />
				</p>
			</div>
		</div>
	</div>

<!-- 2012-08-30 ポップアップの仕様変更
	<div id="toolbox">
		<div id="tool_inner">

			<h2>TOOL BOX</h2>

			<div class="clearfix">
				<div class="leftside">
					<h3>印刷<span>Print</span></h3>
					<div>
						<input type="button" value="見積書" alt="print_estimation" />
						<input type="button" value="請求書" alt="print_bill" />
						<input type="button" value="納品書" alt="print_delivery" />
					</div>
					<div>
						<input type="button" value="トムス発注書" disabled="disabled" alt="toms_edi" />
					</div>

				</div>

				<div class="rightside">
					<h3>メール<span>E-mail</span></h3>
					<div>
						<input type="button" value="お見積" alt="mail_estimation" />
					</div>
					<div>
						<p>注文確定</p>
						<p><input type="button" value="注文・振込" alt="mail_orderbank" /></p>
						<p><input type="button" value="注文・代引" alt="mail_ordercod" /></p>
						<p><input type="button" value="注文・現金" alt="mail_ordercash" /></p>
					</div>
				</div>
			</div>
			
			<div>
				<p><label><input type="checkbox" value="1" name="cancelshipmail" onchange="mypage.sendmailcheck(this);" /> 発送メールの中止</label></p>
				<p><label><input type="checkbox" value="1" name="canceljobmail" onchange="mypage.sendmailcheck(this);" /> 製作開始メールの中止</label></p>
				<p><label><input type="checkbox" value="1" name="cancelarrivalmail" onchange="mypage.sendmailcheck(this);" /> 商品の到着確認メールの中止</label></p>
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