<?php
/**
 * 佐川急便CSVダウンロード
 * 除外: 配送方法が引取
 */
require_once dirname(__FILE__).'/MYDB.php';
require_once dirname(__FILE__).'/phonedata.php';

$isError = false;
$notJIS = array();

try {
    $conn = db_connect();
    $rs = array();
    $sql2 = '';

    if (!empty($_REQUEST['term_from'])) {
        $sql2 .= ' and schedule3 >= "'.$_REQUEST['term_from'].'"';
    }
    if (!empty($_REQUEST['term_to'])) {
        $sql2 .= ' and schedule3 <= "'.$_REQUEST['term_to'].'"';
    }
    if (!empty($_REQUEST['factory'])) {
        $sql2 .= ' and orders.factory = '.$_REQUEST['factory'];
    }

    // 出荷準備
    if ($_REQUEST['readytoship']!='') {
        $sql2 .= ' and readytoship = '.$_REQUEST['readytoship'];
    }

    // 発送方法:佐川急便
    $sql2 .= ' and deliver = 1';
    $sql2 .= ' and shipped = 1';

    // 入金
    if (!empty($_REQUEST['deposit'])) {
        $sql2 .= ' and deposit = '.$_REQUEST['deposit'];
    }

    // 注文番号
    if (!empty($_REQUEST['orderid'])) {
        $sql2 .= ' and orders.id = '.$_REQUEST['orderid'];
    }

    // 届き先
    if (!empty($_REQUEST['organization'])) {
        $sql2 .= ' and organization LIKE "%'.$_REQUEST['organization'].'%"';
    }

    $sql2 .= " and orders.id IN (". implode(',', $_REQUEST['order_ids']). ")";

    $sql = 'SELECT *, orders.id as orders_real_id FROM ((((((orders
        LEFT JOIN customer ON orders.customer_id=customer.id)
        LEFT JOIN delivery ON orders.delivery_id=delivery.id)
        LEFT JOIN shipfrom ON orders.shipfrom_id=shipid)
        LEFT JOIN progressstatus ON orders.id=progressstatus.orders_id)
        LEFT JOIN acceptstatus ON orders.id=acceptstatus.orders_id)
        LEFT JOIN estimatedetails ON orders.id=estimatedetails.orders_id)
        LEFT JOIN acceptprog ON acceptstatus.progress_id=acceptprog.aproid';
    $sql .= ' WHERE created>"2011-06-05" and progress_id=4';
    $sql .= ' and (carriage!="accept" or (payment="cod" and (estimated>=300000 or boxnumber>1)))';
    $sql .= $sql2;
    $sql .= ' order by schedule3, customer.id, carriage, bundle';
    $result = exe_sql($conn, $sql);

    $list = array();
    while ($rec = mysqli_fetch_assoc($result)) {
        $itemIdx = checkCode($rec['orders_real_id']);

        // 同梱ありの場合
        if ($rec['bundle'] == 1) {
            // 発送日、顧客番号、お届け先が同じ注文の判別
            if ($bundleKey == $rec['schedule3'].'-'.$rec['customer_id'].'-'.$rec['delivery_id']) {
                $idx = count($list) - 1;

                // コレクトの場合は合算する
                if ($_REQUEST['invoiceKind'][$itemIdx] == "2") {
                    $list[$idx]['colectfee'] += $rec['estimated'];
                    $list[$idx]['colecttax'] += $rec['salestax'];
                }

                // 箱数計算
                $list[$idx]['boxcount'] += $_REQUEST['printCount'][$itemIdx];
                continue;
            } else {
                $bundleKey = $rec['schedule3'].'-'.$rec['customer_id'].'-'.$rec['delivery_id'];
            }
        }
        $rec['colectfee'] = $rec['estimated'];
        $rec['colecttax'] = $rec['salestax'];
        $rec['boxcount'] = $_REQUEST['printCount'][$itemIdx];

        $list[] = $rec;
    }

    // 項目
    $tmp = array(
        "住所録コード",
        "お届け先電話番号",
        "お届け先郵便番号",
        "お届け先住所１",
        "お届け先住所２",
        "お届け先住所３",
        "お届け先名称１",
        "お届け先名称２",
        "お客様管理ナンバー",
        "お客様コード",
        "部署・担当者",
        "荷送人電話番号",
        "ご依頼主電話番号",
        "ご依頼主郵便番号",
        "ご依頼主住所１",
        "ご依頼主住所２",
        "ご依頼主名称１",
        "ご依頼主名称２",
        "荷姿コード",
        "品名１",
        "品名２",
        "品名３",
        "品名４",
        "品名５",
        "出荷個数",
        "便種（スピードで選択）",
        "便種（商品）",
        "配達日",
        "配達指定時間帯",
        "配達指定時間（時分）",
        "代引金額",
        "消費税",
        "決済種別",
        "保険金額",
        "保険金額印字",
        "指定シール１",
        "指定シール２",
        "指定シール３",
        "営業店止め",
        "ＳＲＣ区分",
        "営業店コード",
        "元着区分"
    );

    $rs[] = implode(',', $tmp);

    $itemIdx = -1;
    $len = count($list);
    for ($i=0; $i<$len; $i++) {
        $rec = $list[$i];
        $itemIdx = checkCode($rec['orders_real_id']);
        if ($itemIdx == -1) {
            continue;
        }

        $tmp = [];
        $tmp[] = "";                   // 住所録コード
        $tmp[] = $rec['delitel'];      // お届け先電話番号
        $tmp[] = $rec['delizipcode'];  // お届け先郵便番号

        // お届け先住所１
        $addr0 = mb_convert_kana($rec['deliaddr0'], 'ASKV', 'utf-8');
        $tmp[] = mb_substr($addr0, 0, 16, 'utf-8');

        // お届け先住所２
        $addr1 = mb_convert_kana($rec['deliaddr1'], 'ASKV', 'utf-8');
        $tmp[] = $addr1;
        // $tmp[] = mb_substr($addr1, 0, 16, 'utf-8');

        // お届け先住所３
        $chk = AppCheckUtil::chkJis1or2($rec['deliaddr2']);
        if ($chk != "") {
            $isError = true;
            $notJIS[] = array('number'=>$rec['cstprefix'].$rec['number'],'field'=>'deliaddr2','data'=>$chk);
        }
        $addr2 = mb_convert_kana($rec['deliaddr2'], 'ASKV', 'utf-8');
        $tmp[] = $addr2;
        // $tmp[] = mb_substr($addr2, 0, 16, 'utf-8');

        // お届け先名称１
        $chk = AppCheckUtil::chkJis1or2($rec['organization']);
        if ($chk != "") {
            $isError = true;
            $notJIS[] = array('number'=>$rec['cstprefix'].$rec['number'],'field'=>'organi','data'=>$chk);
        }
        $name = mb_convert_kana($rec['organization'], 'ASKV', 'utf-8');
        $tmp[] = mb_substr($name, 0, 16, 'utf-8');

        // お届け先名称２
        $deli = [];
        $deli[] = mb_convert_kana($rec['deliaddr3'], 'ASKV', 'utf-8');
        $deli[] = mb_convert_kana($rec['deliaddr4'], 'ASKV', 'utf-8');
        $tmp[] = implode(' ', $deli);

        // お客様管理ナンバー
        $tmp[] = strtoupper($rec['cstprefix']) . str_pad($rec['number'], 6, "0", STR_PAD_LEFT);

        // お客様コード
        $tmp[] = "";

        // 部署・担当者
        $staff = mb_convert_kana($rec['staffname'], 'ASKV', 'utf-8');
        $tmp[] = mb_substr($staff, 0, 16, 'utf-8');

        $tmp[] = "";                        // 荷送人電話番号

        // 発送元
        if (! empty($rec['shipfrom_id'])) {
            $tmp[] = $rec['shiptel'];            // ご依頼主電話番号
            $tmp[] = $rec['shipzipcode'];        // ご依頼主郵便番号

            // ご依頼主住所１
            $shipaddr0 = mb_convert_kana($rec['shipaddr0'], 'ASKV', 'utf-8');
            $tmp[] = mb_substr($shipaddr0, 0, 16, 'utf-8');

            // ご依頼主住所2
            $shipaddr1 = mb_convert_kana($rec['shipaddr1'], 'ASKV', 'utf-8');
            // $tmp[] = $addr1;
            // $tmp[] = mb_substr($addr1, 0, 16, 'utf-8');

            $chk = AppCheckUtil::chkJis1or2($rec['shipaddr2']);
            if ($chk != "") {
                $isError = true;
                $notJIS[] = array('number'=>$rec['cstprefix'].$rec['number'],'field'=>'shipaddr2','data'=>$chk);
            }
            $shipaddr2 = mb_convert_kana($rec['shipaddr2'], 'ASKV', 'utf-8');
            $tmp[] = $shipaddr1 . '　' . $shipaddr2; // 全角スペースで区切る

            // お届け先名称１
            $chk = AppCheckUtil::chkJis1or2($rec['shipfromname']);
            if ($chk != "") {
                $isError = true;
                $notJIS[] = array('number'=>$rec['cstprefix'].$rec['number'],'field'=>'shipfromname','data'=>$chk);
            }
            $shipname = mb_convert_kana($rec['shipfromname'], 'ASKV', 'utf-8');
            $tmp[] = mb_substr($shipname, 0, 16, 'utf-8');

            // お届け先名称２
            $ship = [];
            $ship[] = mb_convert_kana($rec['shipaddr3'], 'ASKV', 'utf-8');
            $ship[] = mb_convert_kana($rec['shipaddr4'], 'ASKV', 'utf-8');
            $tmp[] = implode(' ', $ship);
        } else {
            $tmp[] = "03-5670-0787";            // ご依頼主電話番号
            $tmp[] = "124-0025";                // ご依頼主郵便番号
            $tmp[] = "東京都葛飾区";              // ご依頼主住所１
            $tmp[] = "西新小岩３ー１４ー２６";      // ご依頼主住所２
            $tmp[] = "有限会社タカハマライフアート"; // ご依頼主名称１
            $tmp[] = "";                        // ご依頼主名称２    
        }

        $tmp[] = "";                        // 荷姿コード
        $tmp[] = "衣類";                     // 品名１
        $tmp[] = "";                        // 品名２
        $tmp[] = "";                        // 品名３
        $tmp[] = "";                        // 品名４
        $tmp[] = "";                        // 品名５
        $tmp[] = $rec['boxcount'];          // 出荷個数
        $tmp[] = "000";                     // 便種（スピードで選択）
        $tmp[] = "001";                     // 便種（商品）
        $tmp[] = preg_replace('/-/', '', $rec['schedule4']);    // 配達日
        $tmp[] = "00";                      // 配達指定時間帯
        $tmp[] = "";                        // 配達指定時間（時分）
        $tmp[] = $rec['payment'] === 'cod' ? $rec['colectfee'] : "";    // 代引金額
        $tmp[] = $rec['payment'] === 'cod' ? $rec['colecttax'] : "";    // 消費税
        $tmp[] = "2";                       // 決済種別
        $tmp[] = "";                        // 保険金額
        $tmp[] = "";                        // 保険金額印字
        $tmp[] = "";                        // 指定シール１
        $tmp[] = "";                        // 指定シール２
        $tmp[] = "";                        // 指定シール３
        $tmp[] = "";                        // 営業店止め
        $tmp[] = "";                        // ＳＲＣ区分
        $tmp[] = "";                        // 営業店コード
        $tmp[] = "1";                       // 元着区分"

        $rs[] = implode(',', $tmp);
    }
    $scv = implode("\r\n", $rs);
} catch (Exception $e) {
    $isError = true;
    print("CSVファイルが作成できませんでした。<a href=\"../sagawa.php?req=su\">佐川急便の発送検索画面に戻ります</a>");
}

mysqli_close($conn);

if (count($notJIS)>0) {
    $lbl = array(
        'organi'=>'お届け先名',
        'deliaddr2'=>'アパート・マンション名',
        'deliaddr3'=>'会社・部門１',
        'deliaddr4'=>'会社・部門２',
    );
    print("B2印刷で対応していない文字が使用されています。<br><br>");
    for ($i=0; $i<count($notJIS); $i++) {
        print("顧客番号：".$notJIS[$i]['number']."　　　　".$lbl[$notJIS[$i]['field']]."：".$notJIS[$i]['data']."<br>");
    }
    print("<br><hr><a href=\"../sagawa.php?req=su\">佐川急便の発送検索画面に戻ります</a>");
} elseif ($isError===false) {
    //ダウンロード
    header("Content-Type: application/octet-stream");
    header("Content-Disposition: attachment; filename=sagawa_".date(Ymdhi).".csv");
    ob_clean();
    mb_convert_variables('SJIS-WIN', 'UTF-8', $scv);
    print($scv);
}

function checkCode($orderid) {
	for($i = 0; $i< count($_REQUEST['b2printchk']); $i++) {
		if($orderid."_checked" == $_REQUEST['b2printchk'][$i]) {
			return $i;
		}
	}
	return -1;
}

class AppCheckUtil
{
    /**
     * JISの半角および、第１、２水準文字であることのチェック。<br>
     * @param    $target    検査する文字列
     * @return    ""：OK、以外:NG文字たち
     */
    public static function chkJIS1or2($target)
    {
        $r = "";
        for ($idx = 0; $idx < mb_strlen($target, 'utf-8'); $idx++) {
            $str0 = mb_substr($target, $idx, 1, 'utf-8');
            // 1文字をSJISにする。
            $str = mb_convert_encoding($str0, "sjis-win", 'utf-8');

            if ((strlen(bin2hex($str)) / 2) == 1) { // 1バイト文字
                $c = ord($str{0});

                // 対応している文字コードなし
                if ($str0!=='?' && $str==='?') {
                    $r = $target;
                }
            } else {
                $c = ord($str{0}); // 先頭1バイト
                $c2 = ord($str{1}); // 2バイト目
                $c3 = $c * 0x100 + $c2; // 2バイト分の数値にする。
                if ((($c3 >= 0x8140) && ($c3 <= 0x84BE)) || // 2バイト文字
                    (($c3 >= 0x8740) && ($c3 <= 0x8775)) || // 2バイト文字
                    (($c3 >= 0x889F) && ($c3 <= 0x9872)) || // 第一水準
                    (($c3 >= 0x989F) && ($c3 <= 0x9FFF)) || // 第二水準
                    (($c3 >= 0xE040) && ($c3 <= 0xEAA4))) { // 第二水準
                } else {
                    $r = $target;
                    //echo "機種依存文字など" . "\n";
                }
            }
        }
        return $r;
    }
}
