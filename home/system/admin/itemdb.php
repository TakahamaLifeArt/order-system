<?php

	require_once dirname(__FILE__).'/../php_libs/session_my_handler.php';
	require_once dirname(__FILE__).'/../php_libs/mainmenu_list.php';
	require_once dirname(__FILE__).'/../php_libs/MYDB.php';

	if(isset($_GET['mode'])) $mode = $_GET['mode'];
	$conn = db_connect();
	$result = exe_sql($conn, 'select * from category');
	
	if($mode=='addnew'){
		
		$category_list = '<select class="category_id"><option value="" selected="selected">---</option>';
		while($rec = mysqli_fetch_assoc($result)){
			$category_list .= '<option value="'.$rec['id'].'">'.mb_convert_encoding($rec['category_name'],'euc-jp','utf-8').'</option>';
		}
		$category_list .= '</select>';

		$result = exe_sql($conn, "select * from maker");
		$makers = '<select class="maker_id">';
		while($rec = mysqli_fetch_array($result)){
			$makers .= '<option value="'.$rec['id'].'">'.mb_convert_encoding($rec['maker_name'],'euc-jp','utf-8').'</option>';
		}
		$makers .= '</select>';

		$result = exe_sql($conn, "select * from printratio where printratioapply=(select max(printratioapply) from printratio where printratioapply<='".date('Y-m-d')."')");
		$ratio = '<select class="ratio_id">';
		while($rec = mysqli_fetch_array($result)){
			$ratio .= '<option value="'.$rec['ratioid'].'">'.$rec['ratio'].'</option>';
		}
		$ratio .= '</select>';
		
		
		// basic info
		$list = '<tr>';
		$list >= '<td></td>';
		$list .= '<td style="padding:20px 10px 10px"><input type="text" class="item_code" value="" style="width:80px;" /></td>';
		$list .= '<td style="padding:20px 10px 10px"><input type="text" class="item_name" value="" style="width:320px;" /></td>';
		$list .= '<td style="padding:20px 10px 10px" class="ac">'.preg_replace('/value="1"/', 'value="1" selected="selected"', $ratio).'</td>';
		$list .= '<td style="padding:10px 0px 0px" class="ac"><img class="pp_id" alt="1" src="'._IMG_PSS.'printposition/t-shirts/normal-tshirts/layout_front.png" width="70" /></td>';
		$list .= '<td style="padding:20px 10px 10px">'.preg_replace('/value="1"/', 'value="1" selected="selected"', $makers).'</td>';
		$list .= '<td style="padding:20px 10px 10px" class="ac"><input type="number" class="item_row" min="1" step="1" max="99" value="10" /></td>';
		$list .= '<td style="padding:20px 10px 10px" class="ac">';
		$list .= '<select class="opp">';
		$list .= '<option value="0">-</option>';
		$list .= '<option value="1">小</option>';
		$list .= '<option value="2">大</option>';
		$list .= '</select>';
		$list .= '</td>';
		$list .= '<td style="padding:20px 10px 10px" class="ac"><input type="number" class="oz" min="0" step="0.1" max="99" value="0" /></td>';
		$list .= '<td style="padding:20px 10px 10px" class="ac"><input type="checkbox" class="lineup" value="1" /></td>';
		$site_list_id = explode(',',_SITE_ID);
		$site_list_name = explode(',',_SITE_NAME);
		//$site_list = array_combine($site_list_id,$site_list_name);
		if($rec['show_site'] == ""){
			$list .= '<td>';
			for($i=0;$i<count($site_list_id);$i++){
			  $list .= '<input type="checkbox" class="show_site" value="';
				$list .= $site_list_id[$i].'">'.$site_list_name[$i];
			}
/*
				foreach as $key=>$value) {
					$list .= $key;
					$list .= '">';
					$list .= $value;
				}
*/
			$list .='</td>';			
		}else{
			$list .= '<td>';
			$item_site = explode(',',$rec['show_site']);
			for($i=0;$i<count($site_list_id);$i++){
				$list .= '<input type="checkbox" class="show_site"';
				if(in_array($site_list_id[$i],$item_site)){
					$list .='checked="checked"';
				}
				$list .='value="'.$site_list_id[$i].'">'.$site_list_name[$i];
			}
			$list .= '</td>';
    }
		$list .= '<tr>';
		
		// size and price
		$cost_name = array('白色<br>(入値)','白以外<br>(入値)','白色<br>(ﾒｰｶｰ)','白以外<br>(ﾒｰｶｰ)','梱包枚数','梱包枚数(袋詰)');
		$head = '<thead><tr><th>サイズ名</th>';
		for($n=0; $n<count($cost_name); $n++){
			$head .= '<th>'.$cost_name[$n].'</th>';
		}
		$head .= '</tr></thead>';
		
		$result = exe_sql($conn, "select * from size");
		$body = '<tbody>';
		while($rec = mysqli_fetch_array($result)){
			$sizename[$rec['id']] = $rec['size_name'];
			
			$body .= '<tr>';
			$body .= '<th class="size_'.$rec['id'].'">'.$rec['size_name'].'</th>';
			$body .= '<td><input type="text" value="0" class="price_1 forNum" /></td>';
			$body .= '<td><input type="text" value="0" class="price_0 forNum" /></td>';
			$body .= '<td><input type="text" value="0" class="price_maker_1 forNum" /></td>';
			$body .= '<td><input type="text" value="0" class="price_maker_0 forNum" /></td>';
			$body .= '<td><input type="text" value="0" class="numbernopack forNum" /></td>';
			$body .= '<td><input type="text" value="0" class="numberpack forNum" /></td>';
			$body .= '</tr>';
		}
		$body .= '</tbody>';
		$tbl1 = $head.$body;
		
	}else{
		
		$mode = 'edit';
		
		while($rec = mysqli_fetch_assoc($result)){
			$category_list .= '<li><span>'.$rec['id'].'</span>. '.mb_convert_encoding($rec['category_name'],'euc-jp','utf-8').'</li>';
		}
		
		$sql = 'select * from (((item inner join catalog on item.id=catalog.item_id)';
		$sql .= ' inner join printposition on item.printposition_id=printposition.id)';
		$sql .= ' inner join printratio on item.printratio_id=printratio.ratioid)';
		$sql .= ' inner join maker on item.maker_id=maker.id';
		$sql .= ' where printratioapply=(select max(printratioapply) from printratio where printratioapply<="'.date('Y-m-d').'")';
		$sql .= ' and category_id=1 and catalogapply<="'.date('Y-m-d').'" and catalogdate>"'.date('Y-m-d').'"';
		$sql .= ' and itemapply<="'.date('Y-m-d').'" and itemdate>"'.date('Y-m-d').'"';
		$sql .= ' group by item.id order by item.item_row, item.id';
		$result = exe_sql($conn, $sql);
		$itemcount = mysqli_num_rows($result);
		while($rec = mysqli_fetch_assoc($result)){
			$list .= '<tr id="item_'.$rec['item_id'].'" class="act" onclick="$.showItemDetail('.$rec['item_id'].');">';
			$list .= '<td class="ar">'.$rec['item_id'].'</td>';
			$list .= '<td>'.$rec['item_code'].'</td>';
			$list .= '<td>'.mb_convert_encoding($rec['item_name'],'euc-jp','utf-8').'</td>';
			$list .= '<td class="ac">'.$rec['ratio'].'</td>';
			$list .= '<td class="ac">'.$rec['printposition_id'].'<img class="printposition" alt="'.$rec['printposition_id'].'" src="'._IMG_PSS.'printposition/'.$rec['category_type'].'/'.$rec['item_type'].'/layout_front.png" width="50" /></td>';
			$list .= '<td class="maker_'.$rec['maker_id'].'">'.mb_convert_encoding($rec['maker_name'],'euc-jp','utf-8').'</td>';
			$list .= '<td class="ac">'.$rec['item_row'].'</td>';
			
			$list .= '<td class="ac">';
			if($rec['opp']==1){
				$list .= '小';
			}else if($rec['opp']==2){
				$list .= '大</td>';
			}else{
				$list .= '-</td>';
			}
			
			$list .= '<td class="ac">';
			if($rec['oz']=="0.0"){
				$list .= '-</td>';
			}else{
				$list .= $rec['oz'].'</td>';
			}
			$list .= '<td class="ac">';
			
			if($rec['lineup']==1){
				$list .= '表示</td>';
			}else{
				$list .= '-</td>';
			}
  		//show_site 一覧表示と基本情報画面
			$site_list_id = explode(',',_SITE_ID);
  		$site_list_name = explode(',',_SITE_NAME);
			$list .= '<td class="ac">';
  		if($rec['show_site'] == ""){
				  $list .= '-';
			}else{
				$str ="";
				$item_site = explode(',',$rec['show_site']);
				for($i=0; $i<count($site_list_id); $i++){
					if(in_array($site_list_id[$i],$item_site)){
						$str .= $site_list_name[$i].',';
					}
				}
/*
					foreach($site_list as $key=>$value) {
						if(strpos($rec['show_site'],$key) !== false){
							$str .= $value.',';
							//$value += $value.',';
						}
					}
*/
				$str = substr($str, 0, -1);
				$list .= $str;
      }
			$list .= '</td>';
			
			if($rec[$i]['itemdate']==$def_dropping){
			  $list .= '<td style="display:none;"></td>';
			}else{
			  $list .= '<td style="display:none;">'.$rec[$i]['itemdate'].'</td>';
			}

			if($rec['itemdate']=='3000-01-01'){
				$list .= '<td style="display:none;"></td>';
			}else{
				$list .= '<td style="display:none;">'.$rec['itemdate'].'</td>';
			}
			$list .= '</tr>';
		}
	}
	
	$switch = '<input type="radio" name="mode" id="mode1" value="edit" /><label for="mode1">一覧・編集</label>';
	$switch .= '<input type="radio" name="mode" id="mode2" value="addnew" /><label for="mode2">商品登録</label>';
	$switch = preg_replace('/value="'.$mode.'"/', 'value="'.$mode.'" checked="checked"', $switch);
	
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

	<link rel="stylesheet" type="text/css" media="screen" href="../js/ui/cupertino/jquery.ui.all.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="../js/modalbox/css/jquery.modalbox.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="../css/template_main.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="./css/itemdb.css" />
	
	
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js"></script>
	<!--
	<script type="text/javascript" src="../js/jquery.js"></script>
	<script type="text/javascript" src="../js/jquery.smoothscroll.js"></script>
	<script type="text/javascript" src="../js/ui/jquery.ui.core.js"></script>
	<script type="text/javascript" src="../js/ui/jquery.ui.widget.js"></script>
	<script type="text/javascript" src="../js/ui/jquery.ui.position.js"></script>
	<script type="text/javascript" src="../js/ui/jquery.ui.button.js"></script>
	<script type="text/javascript" src="../js/ui/jquery.ui.autocomplete.js"></script>
	<script type="text/javascript" src="../js/ui/jquery.ui.datepicker.js"></script>
 -->
	<script type="text/javascript" src="../js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
	<script type="text/javascript" src="../js/modalbox/jquery.modalbox-min.js"></script>
	<script type="text/javascript" src="./js/master.js"></script>

</head>
<body class="main_bg" id="page_top">
	<div id="overlay"></div>
	<div id="header" class="main_bg">
		<div class="main_header">
			<p class="title">商品データベース</p>
			<?php echo $mainmenu;?>
		</div>
	</div>
	
	<div id="main_wrapper">
		
		<div class="maincontents">
			<div class="contents_inner">
				
				<div class="flexible">
					<div class="snavi_wrapper">
						<div><label>適用日：</label><input type="text" value="<?php echo date('Y-m-d');?>" id="apply" class="forDate datepicker" /></div>
						
						<div id="switchover">
							<form name="myform" method="post" action="<?php echo dirname($_SERVER['SCRIPT_NAME']).'/../main.php'; ?>" onsubmit="return false">
								<?php echo $switch; ?>
								<input type="hidden" name="req" value="itemdb" />
								<input type="hidden" name="pos" value="<?php echo time(); ?>" />
							</form>
						</div>
<?php
if($mode=='edit'){
	$html = <<<DOC
		<p>商品カテゴリー</p>
		<ol id="snavi">{$category_list}</ol>

		<p>マスターリスト</p>
		<ol id="slist">
			<li><span>1</span>. アイテムカラー</li>
			<li><span>2</span>. 割増率</li>
			<li><span>3</span>. 絵型</li>
			<li><span>4</span>. メーカー</li>
			<li><span>5</span>. スタッフ</li>
		</ol>

		<p>タグリスト</p>
		<ol id="tags">
			<!-- <li><span>1</span>. 未使用タグ</li> -->
			<li><span>1</span>. シルエット</li>
			<li><span>2</span>. 素材</li>
			<li><span>3</span>. 生地</li>
			<li><span>4</span>. サイズ</li>

		</ol>

	</div>

	<div class="container">

		<p id="submenu">
			<span id="showlist">一覧表示へ</span><span id="editmode">編集画面へ</span>
		</p>
		<div class="button_wraptop">
			<div class="cancel_button_wrap"><input type="button" value="キャンセル" class="cancel_button" /></div>
			<div class="update_button_wrap"><input type="button" value="データベースを更新する" class="update_button" /></div>
			<div class="cancel_button_wrap"><input type="button" value="該当商品を削除する" class="delete_button" /></div>
		</div>

	<table id="basictable">
		<caption>1.Ｔシャツ　<span>t-shirts</span><span>（{$itemcount} アイテム）</span></caption>
		<thead>
			<tr>
				<th>ID</th>
				<th>商品コード</th>
				<th>商品名</th>
				<th>割増率</th>
				<th>絵型</th>
				<th>メーカー</th>
				<th>表示順</th>
				<th>OPP袋</th>
				<th>オンス</th>
				<th>Web表示</th>
				<th>展示サイト</th>
				<th style="display: none;"></th>
			</tr>
		</thead>
		<tbody>{$list}</tbody>
	</table>
	<div id="mastertable_wrap" class="clearfix"></div>
	<div id="updatetable_wrap"></div>
	<div id="pricetable_wrap"></div>
	<div id="colortable_wrap"></div>
	<div id="detailtable_wrap"></div>
	<div id="itemtagtable_wrap"></div>
	<div id="measuretable_wrap"></div>
	
DOC;
	
}else{
	$html = <<<DOC
	</div>

	<div class="container">

		<div class="button_wraptop">
			<div class="addnew_button_wrap"><input type="button" value="新規登録する" class="addnew_button" /></div>
		</div>

		<p class="addnewmenu">
			<span class="step1 cur">Step1</span><span class="step2">Step2</span>
		</p>
	
		<h3>カテゴリー：　{$category_list}</h3>
		<table id="basictable">
			<thead>
				<tr>
					<th>商品コード</th>
					<th>商品名</th>
					<th>割増率</th>
					<th>絵型</th>
					<th>メーカー</th>
					<th>表示順</th>
					<th>OPP袋</th>
					<th>オンス</th>
					<th>Web表示</th>
					<th>展示サイト</th>
					<th style="display: none;"></th>
				</tr>
			</thead>
			<tbody>{$list}</tbody>
			
		</table>

		<div class="step1_wrap">
			<div id="updatetable_wrap" style="display:block;">
				<table id="pricetable"><caption>サイズと価格</caption>{$tbl1}</table>
			</div>
		</div>
	
		<div class="step2_wrap">
			<h3>全てのカラーに対応していないサイズがある場合は、そのサイズのチェックを外してください。<br />サイズに[ 制限あり ] のサイズパターンが設定されます。</h3>
			<table class="seriestable">
				<thead><tr><th></th></tr></thead>
				<tbody><tr><td></td></tr></tbody>
			</table>

			<table class="colortable">
				<caption>商品カラー</caption>
				<thead><th>カラーコード</th><th>カラー名</th><th>対応サイズ</th><th></th></thead>
				<tfoot><tr><td colspan="3"></td><td><input type="button" value="カラーの追加" id="add_color" /></td></tr></tfoot>
				<tbody>
				<tr>
					<td><input type="text" value="" class="color_code" /></td>
					<td><input type="text" value="" class="color_name" /></td>
					<td class="ac"><select class="series"><option value="1" selected="selected">制限なし</option><option value="2">制限あり</option></select></td>
					<td></td>
				</tr>
				</tbody>
			</table>
		</div>
	
		<p class="addnewmenu" style="margin-top:20px;">
			<span class="step1 cur">Step1</span><span class="step2">Step2</span>
		</p>
	
		<div class="button_wrapbottom">
			<div class="addnew_button_wrap"><input type="button" value="新規登録する" class="addnew_button" /></div>
	</div>
DOC;
}

echo $html;
?>
					
				</div>

			</div>
		</div>

		<div class="footer">
			<p>Copyright &copy; 2008-<?php echo date(Y);?> オリジナルＴシャツのタカハマライフアート All rights reserved.</p>
		</div>

	</div>

	<div id="printposition_wrapper" class="popup_wrapper">
		<div class="inner">
			<p class="popup_title">Print Type<img alt="閉じる" src="../img/cross.png" class="close_popup" /></p>
			<div class="popup_header">
				<div id="printposition_list"></div>
			</div>
		</div>
	</div>
	
</body>
</html>