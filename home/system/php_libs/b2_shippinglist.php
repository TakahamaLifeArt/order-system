<?php
/**
 * B2送り状CSVダウンロード
 *
 * 除外： 配送方法が引取
 */

require_once dirname(__FILE__).'/MYDB.php';
require_once dirname(__FILE__).'/phonedata.php';

try{
    $conn = db_connect();
    
    // 配達時間指定
    $deliverytime = array('', '0812', '1214', '1416', '1618', '1820', '2021');
    
    $rs = array();
    $sql2 = '';
    if (!empty($_REQUEST['term_from'])) {
        $sql2 .= ' and schedule3 >= "'.$_REQUEST['term_from'].'"';
    }
    if (!empty($_REQUEST['term_to'])) {
        $sql2 .= ' and schedule3 <= "'.$_REQUEST['term_to'].'"';
    }
    /*
    if(!empty($_REQUEST['carriage'])){
        $sql2 .= ' and carriage = "'.$_REQUEST['carriage'].'"';
    }
    */
    if ($_REQUEST['readytoship']!="") {
        $sql2 .= ' and readytoship = "'.$_REQUEST['readytoship'].'"';
    }
    if(!empty($_REQUEST['shipped'])){
        $sql2 .= ' and shipped = '.$_REQUEST['shipped'];
    }
    if(!empty($_REQUEST['pack'])){
        $sql2 .= ' and package = "'.$_REQUEST['pack'].'"';
    }
    $sql = 'SELECT * FROM (((((orders
        LEFT JOIN customer ON orders.customer_id=customer.id)
        LEFT JOIN delivery ON orders.delivery_id=delivery.id)
        LEFT JOIN shipfrom ON orders.shipfrom_id=shipid)
        LEFT JOIN progressstatus ON orders.id=progressstatus.orders_id)
        LEFT JOIN acceptstatus ON orders.id=acceptstatus.orders_id)
        LEFT JOIN acceptprog ON acceptstatus.progress_id=acceptprog.aproid';
    $sql .= ' WHERE created>"2011-06-05" and progress_id=4';
    $sql .= ' and (carriage!="accept" or (payment="cod" and (estimated>=300000 or boxnumber>1)))';
    $sql .= $sql2;
    $sql .= ' order by schedule3, customer.id, carriage';
    $result = exe_sql($conn, $sql);
    while($rec = mysqli_fetch_assoc($result)){
        $payment = $rec['payment']=="cod"? 2: 0;
        $delitel = PhoneData::phonemask($rec['delitel']);
        if(empty($rec['shipid'])){
            $tmp = array(
                '"'.$payment.'"',
                '"'.$delitel['c'].'"',
                '"'.$rec['delizipcode'].'"',
                '"'.$rec['deliaddr0'].$rec['deliaddr1'].'"',
                '"'.$rec['deliaddr2'].'"',
                '"'.$rec['deliaddr3'].'"',
                '"'.$rec['deliaddr4'].'"',
                '"'.$rec['organization'].'"',
                '"03-5670-0787"',
                '"124-0025"',
                '"東京都葛飾区西新小岩３－１４－２６"',
                '',
                '"有限会社タカハマライフアート"',
                '"'.preg_replace('/-/','/',$rec['schedule3']).'"',
                '"'.preg_replace('/-/','/',$rec['schedule4']).'"',
                '"'.$deliverytime[$rec['deliverytime']].'"',
                '"'.$rec['estimated'].'"',
                '',    // tax
                '"'.$rec['boxnumber'].'"',
                '"衣類'.$rec['order_amount'].'枚"'
            );
        }else{
            $shiptel = PhoneData::phonemask($rec['shiptel']);
            $tmp = array(
                '"'.$payment.'"',
                '"'.$delitel['c'].'"',
                '"'.$rec['delizipcode'].'"',
                '"'.$rec['deliaddr0'].$rec['deliaddr1'].'"',
                '"'.$rec['deliaddr2'].'"',
                '"'.$rec['deliaddr3'].'"',
                '"'.$rec['deliaddr4'].'"',
                '"'.$rec['organization'].'"',
                '"'.$shiptel['c'].'"',
                '"'.$rec['shipzipcode'].'"',
                '"'.$rec['shipaddr0'].$rec['shipaddr1'].'"',
                '"'.$rec['shipaddr2'].'"',
                '"'.$rec['shipfromname'].'"',
                '"'.preg_replace('/-/','/',$rec['schedule3']).'"',
                '"'.preg_replace('/-/','/',$rec['schedule4']).'"',
                '"'.$deliverytime[$rec['deliverytime']].'"',
                '"'.$rec['estimated'].'"',
                '',    // tax
                '"'.$rec['boxnumber'].'"',
                '"衣類'.$rec['order_amount'].'枚"'
            );
        }
        $rs[] = implode(',', $tmp);
    }
    $scv = implode("\r\n", $rs);
}catch(Exception $e){
    print("\n\nCSVファイルが作成できませんでした。<a href=\"../shippinglist.php?req=su\">発注画面に戻ります</a>");
}

mysqli_close($conn);

//ダウンロード前に表示するダイアログの指定
header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=B2_".date(Ymd).".csv");
ob_clean();
print(mb_convert_encoding($scv, 'sjis', 'UTF-8'));
?>
