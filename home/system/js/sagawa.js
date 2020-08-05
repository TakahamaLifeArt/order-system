/**
 * タカハマライフアート
 * 佐川急便CSV
 * charset euc-jp
 * log 2020-07-30: created
 */

$(function () {
    $('input[type="button"], .btn_pagenavi, p[class^="attach_"], .act', '#main_wrapper').live('click', function () {
        mypage.main('btn', $(this));
    });

    /**
     * clear
     */
    $('#cleardate').click(function () {
        var dt = new Date();
        var d = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2);
        document.forms.searchtop_form.term_from.value = d;
        document.forms.searchtop_form.term_to.value = "";
    });

    /**
     * datepicker
     */
    $('.datepicker', '#searchtop_form').datepicker({
        beforeShowDay: function (date) {
            var weeks = date.getDay();
            var texts = "";
            if (weeks == 0) texts = "休日";
            var YY = date.getFullYear();
            var MM = date.getMonth() + 1;
            var DD = date.getDate();
            var currDate = YY + "/" + MM + "/" + DD;
            var datesec = Date.parse(currDate) / 1000;
            if (!mypage.prop.holidayInfo[YY + "_" + MM]) {
                mypage.prop.holidayInfo[YY + "_" + MM] = new Array();
                $.ajax({
                    url: './php_libs/checkHoliday.php',
                    type: 'GET',
                    dataType: 'text',
                    data: { 'datesec': datesec },
                    async: false,
                    success: function (r) {
                        if (r != "") {
                            var info = r.split(',');
                            for (var i = 0; i < info.length; i++) {
                                mypage.prop.holidayInfo[YY + "_" + MM][info[i]] = info[i];
                            }
                        }
                    }
                });
            }
            if (mypage.prop.holidayInfo[YY + "_" + MM][DD]) weeks = 0;
            if (weeks == 0) return [true, 'days_red', texts];
            else if (weeks == 6) return [true, 'days_blue'];
            return [true];
        }
    });

    /**
     * initialization
     */
    $(window).one('load', function () {
        var dt = new Date();
        var d = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2);
        document.forms.searchtop_form.term_from.value = d;
    });
});

var mypage = {
    prop: {
        'holidayInfo': {},
        'searchData': [],
        'params': '',
        'orderList': ''
    },
    setQuery: function (my) {
        // 受注入力画面のへのアンカーにスクロール状態を追加
        var self = $(my);
        var href = self.attr('href') + '&scroll=' + self.closest('div').scrollTop();
        self.attr('href', href);
    },
    strPackmode: function (args) {
        // 袋詰の状態を示す文字列を返す
        var res = [];
        if (args['package_no'] == 1) {
            res = '-';
        } else {
            if (args['package_yes'] == 1) res.push('〇');
            if (args['package_nopack'] == 1) res.push('袋のみ');
            res = res.join(',');
        }
        return res;
    },
    strDeliverytime: function (args) {
        // 配達指定時間帯
        var deliverytime_str = "";
        switch (args) {
            case '0': deliverytime_str = "---";
                break;
            case '1': deliverytime_str = "午前中";
                break;
            // case '2': deliverytime_str="12-14";
            //     break;
            case '3': deliverytime_str = "14-16";
                break;
            case '4': deliverytime_str = "16-18";
                break;
            case '5': deliverytime_str = "18-20";
                break;
            case '6': deliverytime_str = "19-21";
                break;
            default:
                break;
        }
        return deliverytime_str;
    },
    strPayment: function (args) {
        // 支払い方法
        var payment_str = "";
        switch (args) {
            case 'wiretransfer': payment_str = "振込";
                break;
            case 'credit': payment_str = "カード";
                break;
            case 'cod': payment_str = "代金引換";
                break;
            case 'cash': payment_str = "現金";
                break;
            case 'check': payment_str = "小切手";
                break;
            case 'note': payment_str = "手形";
                break;
            case '0': payment_str = "未定";
                break;
            default:
                payment_str = args;
                break;
        }
        return payment_str;
    },
    strBundle: function (args) {
        // 同梱の有無
        var bundle_str = "";
        switch (args) {
            case '0': bundle_str = "なし";
                break;
            case '1': bundle_str = "あり";
                break;
            default:
                break;
        }
        return bundle_str;
    },
    main: function (func) {
        var LEN = 20;
        var start_row = $('.pos_pagenavi').text().split('-')[0] - 0;
        var btn = function (my) {
            var myTitle = my.attr('title');
            var result_len = $('#result_count').text() - 0;
            switch (myTitle) {
                case 'next':
                    if (result_len == 0 || $('.pos_pagenavi').text().split('-')[1] - 0 == result_len) return;
                    start_row = start_row - 1 + LEN;
                    $('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility', 'visible');
                    if (start_row + LEN >= result_len) {
                        $('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility', 'hidden');
                    }
                    break;
                case 'previous':
                    if (result_len == 0 || start_row == 1) return;
                    start_row -= (LEN + 1);
                    if (start_row < 0) start_row = 0;
                    $('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility', 'visible');
                    if (start_row == 0) {
                        $('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility', 'hidden');
                    }
                    break;
                case 'last':
                    if (result_len == 0 || $('.pos_pagenavi').text().split('-')[1] - 0 == result_len) return;
                    start_row = start_row - 1 + LEN;
                    while (start_row < result_len) {
                        start_row += LEN;
                    }
                    start_row -= LEN;
                    $('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility', 'visible');
                    $('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility', 'hidden');
                    break;
                case 'first':
                    if (result_len == 0 || start_row == 1) return;
                    start_row = 0;
                    $('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility', 'visible');
                    $('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility', 'hidden');
                    break;
                case 'search':
                    start_row = 0;
                    $('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility', 'hidden');
                    $('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility', 'hidden');
                    break;
                default:
                    return;
                    break;
            }
            if (myTitle != 'search') {
                showList();
            } else {
                search();
            }
        }

        // 検索
        var search = function () {
            if (document.forms.searchtop_form.term_from.value == "") {
                alert('発送日を指定してください');
                return;
            }

            var params = '&filename=sagawa';	// 受注画面への遷移の際に渡すクエリストリング
            var elem = document.forms.searchtop_form.elements;

            // 佐川急便を指定
            var field = ['carrier'];
            var data = [1];

            for (var j = 0; j < elem.length; j++) {
                if (elem[j].type == "text" || elem[j].type == "select-one") {
                    field.push(elem[j].name);
                    var tmp = (elem[j].value).trim();
                    data.push(tmp);
                }
                // クエリストリング
                if (elem[j].value != '') {
                    params += '&' + elem[j].name + '=' + elem[j].value;
                }
            }
            mypage.prop.params = params;
            mypage.prop.searchData = [];
            $('#result_count').text('0');
            $('.pos_pagenavi').text('');
            $('#result_searchtop').html('<p class="alert">検索中 ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
            $.ajax({
                url: './php_libs/ordersinfo.php', type: 'GET', dataType: 'json', async: true,
                data: { 'act': 'search', 'mode': 'b2_yamato', 'field1[]': field, 'data1[]': data }, success: function (r) {
                    if (r instanceof Array) {
                        if (r.length == 0) {
                            $('#result_searchtop').html('<p class="alert">該当するデータが見つかりませんでした</p>');
                        } else {
                            mypage.prop.searchData = r;
                            if (r.length > LEN) {
                                $('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility', 'visible');
                            }
                            showList();
                        }
                    } else {
                        $('#result_searchtop').html('');
                        alert('Error: 369\n' + r);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    $('#result_searchtop').html('');
                    alert('Error: 374\n' + textStatus + '\n' + errorThrown);
                }
            });
        }

        // 検索結果一覧を表示
        var showList = function () {
            var lines = [];			// 検索結果のレコードを代入する
            var pack = { 'yes': '〇', 'no': '-', 'nopack': '袋のみ' };	// 袋詰
            var factory = { 0: '-', 1: '[1]', 2: '[2]', 9: '[1,2]' };	// 工場
            var carry = {
                'normal': '宅急便',
                'accept': '引取',
                'telephonic': 'できtel',
                'other': 'その他',
                '': '未定'
            };
            var ready = ['-', '可'];		// 発送準備
            var bundled = '';			// 同梱チェック用（顧客ID、納品先ID、発送日）
            var html = '';
            var list = '';
            var head = '';
            var curdate = '';
            var result_len = mypage.prop.searchData.length;
            mypage.prop.orderList = '';
            for (i = 0; i < result_len; i++) {
                if (i > 0) {
                    mypage.prop.orderList += ',';
                }
                mypage.prop.orderList += mypage.prop.searchData[i]['orders_id'];
            }
            if (result_len > 0) {
                lines = mypage.prop.searchData;
                curdate = lines[0]['schedule3'];
                $('#result_count').text(result_len);

                if (start_row + LEN <= result_len) {
                    result_len = start_row + LEN;
                }

                $('.pos_pagenavi').text(start_row + 1 + '-' + result_len);

                head = '<table><thead><tr><th>受注No.</th><th>工場</th><th>発送日</th><th>配達時間</th><th>発送準備</th><th>袋詰</th><th>個口</th>';
                head += '<th>顧客名</th><th>お届け先名</th><th>住所</th><th>商品種類</th><th>入金方法</th><th>同梱</th><th>発送方法</th></tr>';
                head += '</thead>';

                list = "<tbody>";
                for (var i = start_row; i < result_len; i++) {
                    list += '<tr';
                    // 納期の区切り線
                    if (curdate != lines[i]['schedule3']) {
                        list += ' class="dateline"';
                    }
                    list += '>';
                    curdate = lines[i]['schedule3'];
                    list += '<td style="border-bottom: 1px solid #d8d8d8" class="centering">';
                    list += '<a onclick="mypage.setQuery(this);" href="./main.php?req=orderform&pos=428&order=' + lines[i]['orders_id'] + mypage.prop.params + '">' + lines[i]['orders_id'];
                    list += ' <img alt="受注画面へ" src="./img/link.png" width="10" /></a></td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8" class="centering">' + factory[lines[i]['factory']] + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8" class="centering">' + lines[i]['schedule3'] + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8" class="centering">' + mypage.strDeliverytime(lines[i]['deliverytime']) + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8" class="centering">' + ready[lines[i]['readytoship']] + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8" class="centering">' + mypage.strPackmode(lines[i]) + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8" class="centering">' + lines[i]['boxnumber'] + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8">' + lines[i]['customername'] + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8">' + lines[i]['organization'] + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8">' + lines[i]['deliaddr0'] + lines[i]['deliaddr1'] + lines[i]['deliaddr2'] + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8">' + lines[i]['category_name'] + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8">' + mypage.strPayment(lines[i]['payment']) + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8" class="centering">' + mypage.strBundle(lines[i]['bundle']) + '</td>';
                    list += '<td style="border-bottom: 1px solid #d8d8d8" class="centering">' + carry[lines[i]['carriage']] + '</td>';
                    list += '</tr>';

                    bundled = lines[i]['schedule3'] + '_' + lines[i]['customer_id'] + '_' + lines[i]['delivery_id'];
                }
                list += '</tbody></table>';
                html = head + list;
                $('#result_searchtop').html(html);

                // 1行おきに背景色を変更
                $('#result_searchtop tbody tr:odd td').css({ 'background': '#f6f6f6' });

                $('#main_wrapper fieldset').hide();
                $('#result_wrapper').show();
            } else {
                $('#result_searchtop').html('');
                $('#result_count').text('0');
                $('.pos_pagenavi').text('');
            }
        }

        /**
         * CSVダウンロード
         */
        var exportCsv = function () {
            var idx = 0;
            var param = [];
            var bChecked = false;
            var elem = document.forms.searchtop_form.elements;

            for (var j = 0; j < elem.length; j++) {
                if (elem[j].type == "text" || elem[j].type == "select-one") {
                    param[idx++] = elem[j].name + '=' + (elem[j].value).trim();
                }
            }

            $.each(mypage.prop.searchData, function (index, val) {
                if (val['payment'] == "cod") {
                    param[idx++] = 'invoiceKind[]=2';
                } else {
                    param[idx++] = 'invoiceKind[]=0';
                }
                param[idx++] = 'printCount[]=' + val['boxnumber'];
                param[idx++] = 'b2printchk[]=' + (val['orders_id']).trim() + '_checked';
                param[idx++] = 'order_ids[]=' + (val['orders_id']).trim();

                bChecked = true;
            });

            if (bChecked == false) {
                alert('CSVファイルの対象データが見つかりませんでした。');
                return;
            }

            // ダウンロード開始
            location.href = './php_libs/sagawa.php?' + param.join('&');
        }

        switch (func) {
            case 'btn':
                var title = arguments[1].attr('title');
                if (title == 'reset') {
                    $('#result_searchtop').html('');
                    $('#result_count').text('0');
                    $('.pos_pagenavi').text('');
                    document.forms.searchtop_form.reset();
                } else if (title == 'searchform') {
                    $('#result_searchtop').html('');
                    $('#result_wrapper').hide();
                    $('fieldset', '#main_wrapper').show();
                } else if (title == 'csv') {
                    exportCsv();
                } else {
                    btn(arguments[1]);
                }
                break;
        }
    }
}