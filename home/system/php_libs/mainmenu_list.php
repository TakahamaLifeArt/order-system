<?php
	if($_GET['req']!='su' && ($_GET['req']>time() || $_GET['req']<time()-2)) { header("Location: "._SERVER_ROOT."?req=1"); }
	require dirname(__FILE__)."/authentic.php";

	// 受注管理メニューのハッシュ
	$panes = array(
		array('filename'=>'orderform', 'title'=>'注文受付'),
		array('filename'=>'orderlist', 'title'=>'注文一覧'),
		array('filename'=>'ordering', 'title'=>'発注'),
		array('filename'=>'stocklist', 'title'=>'入荷'),
		array('filename'=>'artworklist', 'title'=>'版下'),
		array('filename'=>'platelist', 'title'=>'製版'),
		array('filename'=>'silklist', 'title'=>'シルク'),
		array('filename'=>'translist', 'title'=>'転写紙'),
		array('filename'=>'presslist', 'title'=>'プレス'),
		array('filename'=>'inkjetlist', 'title'=>'インクジェット'),
//		array('filename'=>'shippinglist', 'title'=>'発送'),
	);
	
	for($i=0; $i<count($panes); $i++){
		$menu[] = '<li><a href="'._SERVER_ROOT.'main.php?req='.$panes[$i]['filename'].'&amp;pos='.time().'">'.$panes[$i]['title'].'</a></li>';
		$curr[] = '<li><span>'.$panes[$i]['title'].'</span></li>';
	}
	

//データ出力メニュウ
	$menu[] = '<li><span class="pull"> データ出力 </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=shippinglist&amp;pos='.time().'">発送</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=b2_yamato&amp;pos='.time().'">ヤマト　帳票</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=customercsvlist&amp;pos='.time().'">宛名作成</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=earningscsvlist&amp;pos='.time().'">売上伝票</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=clientcsvlist&amp;pos='.time().'">得意先台帳</a></li>
		</ul></li>';

//発送
	$pull['shippinglist'] = '<li><span> データ出力 </span><ul>
		<li><span class="pull">発送</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=b2_yamato&amp;pos='.time().'">ヤマト　帳票</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=customercsvlist&amp;pos='.time().'">宛名作成</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=earningscsvlist&amp;pos='.time().'">売上伝票</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=clientcsvlist&amp;pos='.time().'">得意先台帳</a></li>
		</ul></li>';

//ヤマト　発送
	$pull['b2_yamato'] = '<li><span> データ出力 </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=shippinglist&amp;pos='.time().'">発送</a></li>
		<li><span class="pull">ヤマト　帳票</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=customercsvlist&amp;pos='.time().'">宛名作成</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=earningscsvlist&amp;pos='.time().'">売上伝票</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=clientcsvlist&amp;pos='.time().'">得意先台帳</a></li>
		</ul></li>';


//宛名作成
	$pull['customercsvlist'] = '<li><span> データ出力 </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=shippinglist&amp;pos='.time().'">発送</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=b2_yamato&amp;pos='.time().'">ヤマト　帳票</a></li>
		<li><span class="pull">宛名作成</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=earningscsvlist&amp;pos='.time().'">売上伝票</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=clientcsvlist&amp;pos='.time().'">得意先台帳</a></li>
		</ul></li>';
//売上伝票
	$pull['earningscsvlist'] = '<li><span> データ出力 </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=shippinglist&amp;pos='.time().'">発送</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=b2_yamato&amp;pos='.time().'">ヤマト　帳票</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=customercsvlist&amp;pos='.time().'">宛名作成</a></li>
		<li><span class="pull">売上伝票</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=clientcsvlist&amp;pos='.time().'">得意先台帳</a></li>
		</ul></li>';

//得意先台帳
	$pull['clientcsvlist'] = '<li><span> データ出力 </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=shippinglist&amp;pos='.time().'">発送</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=b2_yamato&amp;pos='.time().'">ヤマト　帳票</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=customercsvlist&amp;pos='.time().'">宛名作成</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=earningscsvlist&amp;pos='.time().'">売上伝票</a></li>
		<li><span class="pull">得意先台帳</span></li>
		</ul></li>';

	//顧客管理メニュー
	$menu[] = '<li><span class="pull"> 顧客管理 </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=customerlist&amp;pos='.time().'">顧客一覧</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=enquetelist&amp;pos='.time().'">アンケート</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=requestlist&amp;pos='.time().'">資料請求</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=mailhistory&amp;pos='.time().'">メール履歴</a></li>
		</ul></li>';
	$pull['customerlist'] = '<li><span> 顧客管理 </span><ul>
		<li><span class="pull">顧客一覧</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=enquetelist&amp;pos='.time().'">アンケート</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=requestlist&amp;pos='.time().'">資料請求</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=mailhistory&amp;pos='.time().'">メール履歴</a></li>
		</ul></li>';
	$pull['enquetelist'] = '<li><span> 顧客管理 </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=customerlist&amp;pos='.time().'">顧客一覧</a></li>
		<li><span class="pull">アンケート</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=requestlist&amp;pos='.time().'">資料請求</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=mailhistory&amp;pos='.time().'">メール履歴</a></li>
		</ul></li>';
	$pull['requestlist'] = '<li><span> 顧客管理 </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=customerlist&amp;pos='.time().'">顧客一覧</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=enquetelist&amp;pos='.time().'">アンケート</a></li>
		<li><span class="pull">資料請求</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=mailhistory&amp;pos='.time().'">メール履歴</a></li>
		</ul></li>';
	$pull['mailhistory'] = '<li><span> 顧客管理 </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=customerlist&amp;pos='.time().'">顧客一覧</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=enquetelist&amp;pos='.time().'">アンケート</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=requestlist&amp;pos='.time().'">資料請求</a></li>
		<li><span class="pull">メール履歴</span></li>
		</ul></li>';
	
	
	// 販売管理メニュー
	$menu2[] = '<li><span class="pull"> 　会　　計　 </span><ul>';
	$menu2[] = '<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">得意先元帳</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=accountbook&amp;pos='.time().'">入金処理</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=billschedule&amp;pos='.time().'">月〆請求予定</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=billstate&amp;pos='.time().'">回収状況一覧</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=billresults&amp;pos='.time().'">月次回収実績</a></li>
				</ul></li>';
	$menu2[] = '<li><span class="pull"> 　売上管理　 </span><ul>';
	$menu2[] = '<li><a href="'._SERVER_ROOT.'main.php?req=saleslist&amp;pos='.time().'">売上集計表</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=saleschart&amp;pos='.time().'">受注分析</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=printworklist&amp;pos='.time().'">プリント売上</a></li>
				</ul></li>';
	$menu2[] = '<li><a href="'._SERVER_ROOT.'main.php?req=supplierlist&amp;pos='.time().'">仕入先一覧</a></li>';
	$curr2[] = '<li><span> 　会　　計　 </span><ul>';
	$curr2[] = '';
	$curr2[] = '<li><span> 　売上管理　 </span><ul>';
	$curr2[] = '';
	$curr2[] = '<li><span>仕入先一覧</span></li>';
	
	
	// 販売管理へのアクセス権限別のメニュー
	switch($authenticatedUser){
		case "1":
			$mylevel = "administrator";
			$menu[] = '<li><span class="pull"> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">販売管理</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">商品DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">お客様レビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">アイテムレビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">ダウンロード</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">休日管理</a></li>
				</ul></li>';
			$pull['itemdb'] = '<li><span> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">販売管理</a></li>
				<li><span class="pull">商品DB</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">お客様レビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">アイテムレビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">ダウンロード</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">休日管理</a></li>
				</ul></li>';
			$pull['userreview'] = '<li><span> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">販売管理</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">商品DB</a></li>
				<li><span class="pull">お客様レビュー</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">アイテムレビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">ダウンロード</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">休日管理</a></li>
				</ul></li>';
			$pull['itemreview'] = '<li><span> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">販売管理</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">商品DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">お客様レビュー</a></li>
				<li><span class="pull">アイテムレビュー</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">ダウンロード</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">休日管理</a></li>
				</ul></li>';
			$pull['exportdata'] = '<li><span> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">販売管理</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">商品DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">お客様レビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">アイテムレビュー</a></li>
				<li><span class="pull">ダウンロード</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">休日管理</a></li>
				</ul></li>';
			$pull['notice'] = '<li><span> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">販売管理</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">商品DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">お客様レビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">アイテムレビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">ダウンロード</a></li>
				<li><span class="pull">休日管理</span></li>
				</ul></li>';
			$menu2[] = '<li><a href="'._SERVER_ROOT.'main.php?req=orderform&amp;pos='.time().'">受注管理</a></li>';
			break;
		case "2":
			$mylevel = "financial";
			$menu[] = '<li><span class="pull"> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">販売管理</a></li>
				</ul></li>';
			$menu2[] = '<li><a href="'._SERVER_ROOT.'main.php?req=orderform&amp;pos='.time().'">受注管理</a></li>';
			break;
		case "3":
			$mylevel = "dbmanage";
			$menu[] = '<li><span class="pull"> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">商品DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">お客様レビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">アイテムレビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">ダウンロード</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">休日管理</a></li>
				</ul></li>';
			$pull['itemdb'] = '<li><span> 管理MENU </span><ul>
				<li><span class="pull">商品DB</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">お客様レビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">アイテムレビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">ダウンロード</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">休日管理</a></li>
				</ul></li>';
			$pull['userreview'] = '<li><span> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">商品DB</a></li>
				<li><span class="pull">お客様レビュー</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">アイテムレビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">ダウンロード</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">休日管理</a></li>
				</ul></li>';
			$pull['itemreview'] = '<li><span> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">商品DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">お客様レビュー</a></li>
				<li><span class="pull">アイテムレビュー</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">ダウンロード</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">休日管理</a></li>
				</ul></li>';
			$pull['exportdata'] = '<li><span> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">商品DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">お客様レビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">アイテムレビュー</a></li>
				<li><span class="pull">ダウンロード</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">休日管理</a></li>
				</ul></li>';
		case "4":
			$mylevel = "acceptance";
			$menu[] = '<li><span class="pull"> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview.php&amp;pos='.time().'">お客様レビュー</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview.php&amp;pos='.time().'">アイテムレビュー</a></li>
				</ul></li>';
			$pull['userreview'] = '<li><span> 管理MENU </span><ul>
				<li><span class="pull">お客様レビュー</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview.php&amp;pos='.time().'">アイテムレビュー</a></li>
				</ul></li>';
			$pull['itemreview'] = '<li><span> 管理MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview.php&amp;pos='.time().'">お客様レビュー</a></li>
				<li><span class="pull">アイテムレビュー</span></li>
				</ul></li>';
	}
	
	$filename = basename($_SERVER['SCRIPT_FILENAME'], '.php');
	
	// ゲスト用メニューバー
	if($authenticatedUser==9){
		if($filename!='userreview' && $filename!='itemreview') header("Location: "._SERVER_ROOT."?req=1");
		$mylevel = "guest";
		$mainmenu = '<ol class="mainmenu">';
		$mainmenu .= '<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">お客様レビュー</a></li>';
		$mainmenu .= '<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">アイテムレビュー</a></li>';
		$mainmenu .= '</ol>';
	}
	
	
	// 受注管理メニューバーの生成
	if($authenticatedUser<9){
		if($filename=='itemdb' || $filename=='userreview' || $filename=='itemreview'|| $filename=='exportdata'|| $filename=='notice'){
			$mainmenu = '<ol class="mainmenu">';
			for($m=0; $m<count($menu)-1; $m++){
				$mainmenu .= $menu[$m];
			}
			$mainmenu .= $pull[$filename];
			$mainmenu .= '</ol>';
		}else if($filename=='customerlist' || $filename=='enquetelist' || $filename=='useranalyze' || $filename=='requestlist' || $filename=='mailhistory'){
			$mainmenu = '<ol class="mainmenu">';
			for($m=0; $m<count($menu)-2; $m++){
				$mainmenu .= $menu[$m];
			}
			$mainmenu .= $pull[$filename];
			$mainmenu .= $menu[++$m];
			$mainmenu .= '</ol>';
		}else if($filename=='shippinglist'|| $filename=='b2_yamato' || $filename=='customercsvlist' || $filename=='earningscsvlist' || $filename=='itemcsvlist' || $filename=='clientcsvlist' ){
			$mainmenu = '<ol class="mainmenu">';
			for($m=0; $m<count($menu)-3; $m++){
				$mainmenu .= $menu[$m];
			}
			$mainmenu .= $pull[$filename];
			$mainmenu .= $menu[++$m];
			$mainmenu .= $menu[++$m];
			$mainmenu .= '</ol>';
		}else{
			for($i=0; $i<count($panes); $i++){
				if($panes[$i]['filename']==$filename){
					$mainmenu = '<ol class="mainmenu">';
					for($m=0; $m<count($menu); $m++){
						if($i==$m){
							$mainmenu .= $curr[$m];
						}else{
							$mainmenu .= $menu[$m];
						}
					}
					$mainmenu .= '</ol>';
					break;
				}
			}
		}
	}
	
	// 販売管理メニューバー生成
	if(empty($mainmenu)){
		switch($_SERVER['SCRIPT_FILENAME']){
		case _DOC_ROOT.'customerledger.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$curr2[0].$menu2[1].$menu2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'accountbook.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$curr2[0].$menu2[1].$menu2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'billschedule.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$curr2[0].$menu2[1].$menu2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'billstate.php';
			$mainmenu = '<ol class="mainmenu_admin">'.$curr2[0].$menu2[1].$menu2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'billresults.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$curr2[0].$menu2[1].$menu2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'saleslist.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$menu2[0].$menu2[1].$curr2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'saleschart.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$menu2[0].$menu2[1].$curr2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'printworklist.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$menu2[0].$menu2[1].$curr2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'supplierlist.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$menu2[0].$menu2[1].$menu2[2].$menu2[3].$curr2[4].$menu2[5].'</ol>';
			break;
		default:
			//$mainmenu = '<ol class="mainmenu">'.$menu[0].'</ol>';
			$mainmenu = '<ol class="mainmenu"></ol>';
			break;
		}
	}
?>