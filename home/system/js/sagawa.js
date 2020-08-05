/**
 * �����ϥޥ饤�ե�����
 * �������CSV
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
            if (weeks == 0) texts = "����";
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
        // �������ϲ��̤ΤؤΥ��󥫡��˥���������֤��ɲ�
        var self = $(my);
        var href = self.attr('href') + '&scroll=' + self.closest('div').scrollTop();
        self.attr('href', href);
    },
    strPackmode: function (args) {
        // �޵ͤξ��֤򼨤�ʸ������֤�
        var res = [];
        if (args['package_no'] == 1) {
            res = '-';
        } else {
            if (args['package_yes'] == 1) res.push('��');
            if (args['package_nopack'] == 1) res.push('�ޤΤ�');
            res = res.join(',');
        }
        return res;
    },
    strDeliverytime: function (args) {
        // ��ã���������
        var deliverytime_str = "";
        switch (args) {
            case '0': deliverytime_str = "---";
                break;
            case '1': deliverytime_str = "������";
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
        // ��ʧ����ˡ
        var payment_str = "";
        switch (args) {
            case 'wiretransfer': payment_str = "����";
                break;
            case 'credit': payment_str = "������";
                break;
            case 'cod': payment_str = "������";
                break;
            case 'cash': payment_str = "����";
                break;
            case 'check': payment_str = "���ڼ�";
                break;
            case 'note': payment_str = "���";
                break;
            case '0': payment_str = "̤��";
                break;
            default:
                payment_str = args;
                break;
        }
        return payment_str;
    },
    strBundle: function (args) {
        // Ʊ����̵ͭ
        var bundle_str = "";
        switch (args) {
            case '0': bundle_str = "�ʤ�";
                break;
            case '1': bundle_str = "����";
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

        // ����
        var search = function () {
            if (document.forms.searchtop_form.term_from.value == "") {
                alert('ȯ��������ꤷ�Ƥ�������');
                return;
            }

            var params = '&filename=sagawa';	// ������̤ؤ����ܤκݤ��Ϥ������ꥹ�ȥ��
            var elem = document.forms.searchtop_form.elements;

            // ������ؤ����
            var field = ['carrier'];
            var data = [1];

            for (var j = 0; j < elem.length; j++) {
                if (elem[j].type == "text" || elem[j].type == "select-one") {
                    field.push(elem[j].name);
                    var tmp = (elem[j].value).trim();
                    data.push(tmp);
                }
                // �����ꥹ�ȥ��
                if (elem[j].value != '') {
                    params += '&' + elem[j].name + '=' + elem[j].value;
                }
            }
            mypage.prop.params = params;
            mypage.prop.searchData = [];
            $('#result_count').text('0');
            $('.pos_pagenavi').text('');
            $('#result_searchtop').html('<p class="alert">������ ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
            $.ajax({
                url: './php_libs/ordersinfo.php', type: 'GET', dataType: 'json', async: true,
                data: { 'act': 'search', 'mode': 'b2_yamato', 'field1[]': field, 'data1[]': data }, success: function (r) {
                    if (r instanceof Array) {
                        if (r.length == 0) {
                            $('#result_searchtop').html('<p class="alert">��������ǡ��������Ĥ���ޤ���Ǥ���</p>');
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

        // ������̰�����ɽ��
        var showList = function () {
            var lines = [];			// ������̤Υ쥳���ɤ���������
            var pack = { 'yes': '��', 'no': '-', 'nopack': '�ޤΤ�' };	// �޵�
            var factory = { 0: '-', 1: '[1]', 2: '[2]', 9: '[1,2]' };	// ����
            var carry = {
                'normal': '�����',
                'accept': '����',
                'telephonic': '�Ǥ�tel',
                'other': '����¾',
                '': '̤��'
            };
            var ready = ['-', '��'];		// ȯ������
            var bundled = '';			// Ʊ�������å��ѡʸܵ�ID��Ǽ����ID��ȯ������
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

                head = '<table><thead><tr><th>����No.</th><th>����</th><th>ȯ����</th><th>��ã����</th><th>ȯ������</th><th>�޵�</th><th>�ĸ�</th>';
                head += '<th>�ܵ�̾</th><th>���Ϥ���̾</th><th>����</th><th>���ʼ���</th><th>������ˡ</th><th>Ʊ��</th><th>ȯ����ˡ</th></tr>';
                head += '</thead>';

                list = "<tbody>";
                for (var i = start_row; i < result_len; i++) {
                    list += '<tr';
                    // Ǽ���ζ��ڤ���
                    if (curdate != lines[i]['schedule3']) {
                        list += ' class="dateline"';
                    }
                    list += '>';
                    curdate = lines[i]['schedule3'];
                    list += '<td style="border-bottom: 1px solid #d8d8d8" class="centering">';
                    list += '<a onclick="mypage.setQuery(this);" href="./main.php?req=orderform&pos=428&order=' + lines[i]['orders_id'] + mypage.prop.params + '">' + lines[i]['orders_id'];
                    list += ' <img alt="������̤�" src="./img/link.png" width="10" /></a></td>';
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

                // 1�Ԥ������طʿ����ѹ�
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
         * CSV���������
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
                alert('CSV�ե�������оݥǡ��������Ĥ���ޤ���Ǥ�����');
                return;
            }

            // ��������ɳ���
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