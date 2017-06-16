<?php
	require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
	require_once dirname(__FILE__).'/php_libs/mainmenu_list.php';
	require_once dirname(__FILE__).'/php_libs/MYDB.php';
	
	
	// 受注入力から戻って来た場合
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

	// 注文一覧からの遷移
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
			<p class="title">顧客一覧</p>
			<?php echo $mainmenu;?>
		</div>
	</div>

	<div id="main_wrapper" class="wrapper">
		<div class="maincontents">

			<div>
				<fieldset id="search_wrapper">
					<legend>顧客　検索フォーム</legend>
					<div class="clearfix">
						<form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">

							<table style="width:1100px; float:none;">
								<tbody>
									<tr>
										<th>顧客ID</th>
										<td>
											<input type="text" value="<?php if(isset($q['number'])) echo $q['number']; ?>" name="number" size="6" />
											<input type="hidden" name="id" value="0" />
										</td>
										<th>顧客登録サイト</th>
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
										<th>顧客フリ</th>
										<td><input type="text" value="<?php if(isset($q['customerruby'])) echo urldecode($q['customerruby']); ?>" name="customerruby" size="30" /></td>
										<th>担当フリ</th>
										<td><input type="text" value="<?php if(isset($q['companyruby'])) echo urldecode($q['companyruby']); ?>" name="companyruby" size="25" /></td>
										<th>TEL</th>
										<td><input type="text" value="<?php if(isset($q['tel'])) echo $q['tel']; ?>" name="tel" size="20" class="forPhone" /></td>
									</tr>
									<tr>
										<th>顧客名</th>
										<td><input type="text" value="<?php if(isset($q['customername'])) echo urldecode($q['customername']); ?>" name="customername" size="30" /></td>
										<th>担当者</th>
										<td><input type="text" value="<?php if(isset($q['company'])) echo urldecode($q['company']); ?>" name="company" size="25" /></td>
										<th>E-Mail</th>
										<td><input type="text" value="<?php if(isset($q['email'])) echo $q['email']; ?>" name="email" size="36" /></td>
									</tr>
								</tbody>
							</table>
						
						</form>
					</div>
					<p class="btn_area">
						<input type="button" value="検索" title="search" />
						<input type="button" value="reset" title="reset" />
						<input type="button" value=" 新規登録 " title="addnew" />
					</p>
				</fieldset>

				<div id="result_wrapper">
					<div class="pagenavi">
						<p style="position: absolute;">検索結果<span id="result_count">0</span>件</p>
						<span class="btn_pagenavi" title="first">最初ヘ &lt;&lt;&lt;</span>&nbsp;<span class="btn_pagenavi" title="previous">前ヘ &lt;&lt;</span><span class="pos_pagenavi"></span><span class="btn_pagenavi" title="next">&gt;&gt; 次へ</span>&nbsp;<span class="btn_pagenavi" title="last">&gt;&gt;&gt; 最後へ</span>
					</div>
				</div>
				<div id="result_searchtop"></div>

				<div id="detail_wrapper" class="clearfix">
					<p class="submenu"><span class="btn_pagenavi" title="resultlist">&lt;&lt; 一覧に戻る</span></p>
					
					<div class="pulldown">
						<div id="address_wrapper1" class="popup_wrapper">
							<div class="inner">
								<p class="popup_title">Address List<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
								<div id="address_list1" class="result_list"></div>
							</div>
						</div>
					</div>
					<div class="pulldown">
						<div id="result_customer_wrapper" class="popup_wrapper">
							<div class="inner">
								<p class="popup_title">検索結果<img alt="閉じる" src="./img/cross.png" class="close_popup" /></p>
								<div class="result_list"></div>
							</div>
						</div>
					</div>

					<div id="input_wrapper">
						<div class="inner">
							<p class="form_title">顧客情報フォーム</p>
							<form action="" name="input_form" onsubmit="return false;">
								<table>
									<tbody>
										<tr>
											<th>フリガナ</th><td><input type="text" name="customerruby" value="" size="30" id="customerkana" /></td>
											<th>フリガナ</th><td colspan="2"><input type="text" name="companyruby" value="" size="25" /></td>
											<td>顧客ID<span id="customer_num"></span><br>
											登録サイト
												<select name="reg_site" id="reg_site">
													<option value="1">takahama428</option>
													<option value="5">sweatjack</option>
													<option value="6">staff-tshirt</option>
												</select></td>
										</tr>
										<tr>
											<th>顧客名</th><td><input type="text" name="customername" value="" size="30" id="customername" maxlength="32" class="restrict" /></td>
											<th>担当者</th><td colspan="2"><input type="text" name="company" value="" size="25" maxlength="32" class="restrict" /></td>
											<td>
												<select name="cstprefix" id="cstprefix">
													<option value="k" selected="selected">一般</option>
													<option value="g">業者</option>
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
											<th>　</th><td><input type="button" value="E-Mail テスト" title="check_email" /></td><td colspan="4"></td>
										</tr>

										<tr>
											<th>郵便番号</th>
											<td colspan="2">
												<input type="text" name="zipcode" value="" size="10" id="zipcode1" class="forZip" onchange="AjaxZip3.zip2addr(this,'','addr0','addr1');" />
											</td><td colspan="3"></td>
										</tr>
										<tr>
											<th>都道府県</th>
											<td colspan="5"><input type="text" name="addr0" value="" size="10" id="addr0" maxlength="4" /></td>
										</tr>
										<tr>
											<th>住所１</th>
											<td colspan="5"><input type="text" name="addr1" value="" size="80" id="addr1" maxlength="56" class="restrict" /></td>
										</tr>
										<tr>
											<th>住所２</th>
											<td colspan="5"><input type="text" name="addr2" value="" size="50" id="addr2" maxlength="32" class="restrict" /></td>
										</tr>
										<tr>
											<th>会社・部門１</th>
											<td colspan="5"><input type="text" name="addr3" value="" size="80" id="addr3" maxlength="50" class="restrict" /></td>
										</tr>
										<tr>
											<th>会社・部門２</th>
											<td colspan="5"><input type="text" name="addr4" value="" size="80" id="addr4" maxlength="50" class="restrict" /></td>
										</tr>
										<tr>
											<td>所属</td>
											<td colspan="5">
												<select id="job" name="job">
													<option value="">-</option>
													<option value="法人">法人</option>
													<option value="個人">個人</option>
													<option value="中学">中学</option>
													<option value="高校">高校</option>
													<option value="大学">大学</option>
													<option value="専門学校">専門学校</option>
													<option value="主婦">主婦</option>
													<option value="その他">その他</option>
													<option value="">未定</option>
												</select>
											</td>
										</tr>
										<tr>
											<th>備考</th>
											<td colspan="5"><textarea name="customernote"></textarea></td>
										</tr>
									</tbody>
								</table>

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

								<p class="btn_line">
									<input type="button" value="修　正" title="update" id="btn_update" onclick="mypage.update_customer(this);" />
									<input type="reset" value="リセット" id="btn_reset_input" />
									<input type="button" value="削　除" id="btn_delete" onclick="mypage.delete_customer();"/>
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