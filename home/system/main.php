<?php
require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
require_once dirname(__FILE__).'/php_libs/authentic.php';

if(isset($_POST['req'],$_POST['mode'])){
	$f = './admin/'.$_POST['req'].'.php';
	if(file_exists($f)) header("Location: ".$f."?mode=".$_POST['mode']."&req=".time());

}else if(isset($_GET['req'], $_GET['pos'])){
	if(isset($_GET['order'])){					// 受注入力へ遷移.
		$pos = strpos($_SERVER['QUERY_STRING'], '&order=');
        $order = substr($_SERVER['QUERY_STRING'], $pos);
		//$order = '&order='.$_GET['order'];
	}else if(isset($_GET['cst'])){
		$order = '&cst='.$_GET['cst'];			// 会員No.
	}
	if(isset($_GET['FY'])){						// 得意先元帳の期間
		$FY = '&FY='.$_GET['FY'];

	}
	if(isset($_GET['reappear'])){				// 注文一覧、シルク、顧客一覧から受注入力へ行き、戻ってきた時の再表示

		$pos = strpos($_SERVER['QUERY_STRING'], '&req=');
        $query = substr($_SERVER['QUERY_STRING'], $pos);
        $query = str_replace('req=', 'filename=', $query);
	}
	/*
	if(preg_match('/^print/',$_GET['req'])){	// 印刷
		$c = explode('_', $_GET['req']);
		$f = './documents/index.php';
		if(file_exists($f)) header("Location: ".$f."?doctype=".$c[1]."&mode=1&req=".time());
	}else 
	*/
	if(preg_match('/^itemdb$/',$_GET['req'])){	// 商品DB
		$f = './admin/'.$_GET['req'].'.php';
		if(file_exists($f)) header("Location: ".$f."?req=".time());
	}else if(preg_match('/-/',$_GET['req'])){	// ディレクトリ指定あり、website等
		$f = str_replace('-', '/', $_GET['req']).'.php';
		if(file_exists($f)) header("Location: ".$f."?req=".time());
	}else{										// 指定ページへリダイレクト

		$f = './'.$_GET['req'].'.php';
		if(file_exists($f)) header("Location: ".$f."?req=".time().$order.$FY.$query);
	}
}else{
	header("Location: ./?req=1");

}
?>