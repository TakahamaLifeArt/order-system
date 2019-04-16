<?php
/*
*	セレクターの生成
*	charset euc-jp
*/
	require_once dirname(__FILE__).'/catalog.php';

	$list = "";
	if(isset($_POST['act'])){
		$catalog = new Catalog();

		$isFirst = true;
		switch($_POST['act']){
			case 'category':
				$row = $catalog->getTableList('category', 0, 0, $_POST['curdate']);

				$list = '<select id="category_selector" onchange="mypage.changeValue(this)">';
				$list .= '<option value="'.$row[0]['id'].'" selected="selected">'.$row[0]['category_name'].'</option>';
				for($i=1; $i<count($row); $i++){
					$list .= '<option value="'.$row[$i]['id'].'">'.$row[$i]['category_name'].'</option>';
				}
				$list .= '<option value="100">'.mb_convert_encoding('持込', 'utf-8', 'euc-jp').'</option>';
				if($_POST['ordertype']=='industry'){
					$list .= '<option value="99">'.mb_convert_encoding('転写シート', 'utf-8', 'euc-jp').'</option>';
				}
				$list .= '<option value="0">'.mb_convert_encoding('その他', 'utf-8', 'euc-jp').'</option>';
				$list .= '</select>';
				break;

			case 'item':
				if(isset($_POST['current_id'])){
					$current_id = $_POST['current_id'];
				}else{
					$current_id = 1;
				}
				$row = $catalog->getTableList('item', $current_id, 0, $_POST['curdate']);
				//$list = '<select id="item_selector" onchange="mypage.changeValue(this)">';
				$list = '<option value="'.$row[0]['item_id'].'" rel="'.$row[0]['dry'].'" selected="selected">['.$row[0]['item_code'].']'.$row[0]['item_name'].'</option>';
				for($i=1; $i<count($row); $i++){
					$list .= '<option value="'.$row[$i]['item_id'].'" rel="'.$row[$i]['dry'].'">['.$row[$i]['item_code'].']'.$row[$i]['item_name'].'</option>';
				}
				//$list .= '</select>';
				break;

			case 'staff':
				if(isset($_POST['rowid'])){
					if($_POST['rowid']=='all'){
						for($i=1; $i<7; $i++){
							$row = $catalog->getTableList('staff', $i, 0, $_POST['curdate'], true);
							$list .= '<option value="0">----</option>';
							foreach($row as $key=>$val){
								$list .= '<option value="'.$val['id'].'">'.$val['staffname'].'</option>';
							}
							$list .= '|';
						}
						$list = substr($list,0,-1);
					}else{
						$row = $catalog->getTableList('staff', $_POST['rowid'], 0, $_POST['curdate'], true);
						$list = '<option value="0">----</option>';
						foreach($row as $key=>$val){
							$list .= '<option value="'.$val['id'].'">'.$val['staffname'].'</option>';
						}
					}
				}else{
					$row = $catalog->getTableList('staff', 0, 0, $_POST['curdate'], true);
					$list = '<option value="0">----</option>';
					foreach($row as $key=>$val){
						$list .= '<option value="'.$val['id'].'">'.$val['staffname'].'</option>';
					}
				}
				break;
		}
	}
	$list = mb_convert_encoding($list, 'euc-jp', 'utf-8');
	echo $list;

	//rename size
	function rename_size($txt){
		$size_text = $txt;
		switch($txt){
			case 'GS':	$size_text = "Girl's-S";
						break;
			case 'GM':	$size_text = "Girl's-M";
						break;
			case 'GL':	$size_text = "Girl's-L";
						break;
			case 'JS':	$size_text = 'Jr.S';
						break;
			case 'JM':	$size_text = 'Jr.M';
						break;
			case 'JL':	$size_text = 'Jr.L';
						break;
		}
		return $size_text;
	}
?>