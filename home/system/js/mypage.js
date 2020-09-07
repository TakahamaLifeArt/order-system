/*
 *	�����ϥޥ饤�ե�����
 *	my page
 *	charset euc-jp
 */
var mypage = {
	prop: {
		'env': 'prd',	// �⡼�ɤ����� (prd:����, dev:��ȯ)
		'modified': false, // �����ե饰��true: ��������
		'isCheckbill': false, // �������ݡ���true: ������ȯ���ǡ���������ƹ����ԲĤˤ���
		'schedule_date': "", // �������塼��Υ����Ȥ����դ����ݻ�
		'curr_inkcolor': {}, // ���󥯥��顼�ѥ�åȤ����򤵤�Ƥ��륪�֥�������
		'curr_ppImage': {}, // �ץ��Ȱ��ֲ�����ɽ����������
		'holidayInfo': {}, // ���������ν˺�������
		'ordertype': "general", // ���ϥ⡼��:���̤��ȼ�
		'applyto': "0", // �׻���ˡ���Ѥ��롡0:default, 1:self-design
		'repeat': "0", // ��ԡ���(Ʊ���Ǥ�Ȥ�)���ɤ�������ԡ���:�Ǹ��μ���ID������:0(default)
		'reuse': "0", // ��ԡ����ǻ��ѻ��γ���μ����1:����, 2:2���ܰʹߡ�
		'isRepeat': false, // ��ݡ�����ʸ�κݤ˥�ԡ��ȳ��Ŭ�Ѥ��뤫�ɤ�����true:Ŭ��, false:Ŭ�Ѥ��ʤ���
		'isRepeatFirst': false, // �����Ŭ�Ѥ��뤫�ɤ�����true:Ŭ��, false:Ŭ�Ѥ��ʤ���
		'isRepeatCheck': false, // ��ԡ��ȥ����å���1�ĤǤ�����å�����Ƥ��뤫�ɤ�����true:�����å�ͭ, false:�����å�̵��
		'shipped': 1, // ȯ���ѤߤΥ����å���1:̤ȯ����2:ȯ���Ѥߡ�
		'firmorder': false, // ��ʸ�����̵ͭ��0:̤����, 1:�����
		'firmorderdate': "", // ��ʸ��������0000-00-00�˥������塼�������ʸ���������
		'acceptingdate': "", // ȯ��������0000-00-00��
		'created': "", // ��������0000-00-00�˼������Ϥ�ô���ԥ��쥯����������Фξ��Ȥ��Ƽ������˺��Ҥ��Ƥ��륹���åդȤ��뤿��
		'calcbasis': 0, // Ǽ���׻��δ������1:���Ƥޤ�����ʸ������, 2:���Ϥ���
		'boundary': {}, // ���ڤ�ʸ���ʿ�Ľ�����ξܺ٥ܥ�����Ϥ��ǡ����ζ��ڤ�ʸ����
		'itemdata': [], // ��ʸ�ꥹ�Ȥ��Խ���ιԤˤ��륢���ƥ����[category_id, category_name, ppID]
		'customer_list': [], // �ܵҾ���θ������
		'delivery_list': [], // Ǽ�������θ������
		'shipfrom_list': [], // ȯ��������θ������
		'tax': 0, // ������
		'credit_rate': 0.05, // �����ɷ�Ѽ���� - ��ʸ��������2018-01-29����ѻߡ������������ʸ����ˤ�Ŭ��
		'intervalID': 0,
		'attach_file_number': 0, // �ե������
		'show_design_time': 0, // �ե�����ɽ�����
		'spec_v2': "2017/5/25", // �ץ�����׻��λ����ѹ�Ŭ����
		'img_path': 'https://takahamalifeart.com/weblib/img/'
	},
	order_info: {
		id: ['order_id', 'reception', 'destination', 'order_comment', 'paymentdate', 'exchink_count', 'exchthread_count', 'deliverytime',
			 'manuscriptdate', 'invoicenote', 'billnote','contact_number', 'additionalname', 'extradiscountname', 'boxnumber', 'handover',
			 'factory', 'destcount', 'receipt_address', 'receipt_price', 'receipt_proviso'
			],
		name: ['ordertype', 'schedule1', 'schedule2', 'schedule3', 'schedule4', 'arrival', 'carriage', 'check_amount', 'noprint', 'design',
				'manuscript', 'discount1', 'discount2', 'reduction', 'reductionname', 'freeshipping', 'payment', 'phase', 'budget', 'deliver', 'purpose', 'designcharge', 'job',
			   'free_printfee', 'free_discount', 'additionalfee', 'extradiscount', 'rakuhan', 'completionimage', 'staffdiscount', 'imega', 'outsource', 'business'
			]
	},
	init: function () {
		$.ajax({
			url: './php_libs/set_tablelist.php',
			type: 'POST',
			dataType: 'text',
			data: {
				'act': 'staff',
				'rowid': 1,
				'curdate': mypage.prop.created
			},
			async: false,
			success: function (r) {
				$('#reception').html(r);
				$('#log_staff').html(r);
			}
		});
		$('#stock_number, #maker').show();
		$('#itemcolor_name, #stock_number, #maker').attr('readonly', 'readonly').addClass('readonly');
		$.ajax({
			url: './php_libs/set_tablelist.php',
			type: 'POST',
			dataType: 'text',
			async: false,
			data: {
				'act': 'category',
				'ordertype': mypage.prop.ordertype,
				'curdate': mypage.prop.firmorderdate
			},
			success: function (r) {
				$('#categoryIs').html(r);
			}
		});
		$.ajax({
			url: './php_libs/set_tablelist.php',
			type: 'POST',
			datatype: 'text',
			async: false,
			data: {
				'act': 'item',
				'current_id': 1,
				'curdate': mypage.prop.firmorderdate
			},
			success: function (r) {
				$('#itemIs').html('<select id="item_selector" onchange="mypage.changeValue(this)">' + r + '</select>');
				mypage.changeColorcode($('#item_selector').val(), '', true);
			}
		});
		mypage.setTAX(mypage.prop.acceptingdate);
	},

	setTAX: function (args) {
		/*
		 *	������Ψ������
		 */
		$.ajax({
			url: './php_libs/dbinfo.php',
			type: 'POST',
			dataType: 'text',
			data: {
				'act': 'tax',
				'curdate': args,
				'ordertype': mypage.prop.ordertype
			},
			async: false,
			success: function (r) {
				if (r.match(/^\d+?$/)) {
					r /= 100;
				} else {
					r = 0;
				}
				mypage.prop.tax = r;
			}
		});
	},
	screenOverlay: function (mode) {
		var body_w = $(document).width();
		var body_h = $(document).height();
		if (mode) {
			$('#overlay').css({
				'width': body_w + 'px',
				'height': body_h + 'px',
				'opacity': 0.2
			}).show();
			if (arguments.length > 1) {
				$('#loadingbar').css({
					'top': body_h / 2 + 'px',
					'left': body_w / 2 - 150 + 'px'
				}).show();
			}
		} else {
			if ($('#loadingbar:visible').length > 0) $('#loadingbar').hide();
			$('#overlay').css({
				'width': '0px',
				'height': '0px'
			}).hide("1000");
		}
	},
	hide_uploader: function () {
		if (!arguments[0]) {
			alert('���åץ����ɤǤ��ޤ���Ǥ�����');
			wrapper.children('.freeimage').hide();
			return;
		}
		var newsrc = './' + arguments[0];
		var orgname = arguments[1];
		var tabs_id = $('#tabs').tabs('option', 'selected') + 1;
		var wrapper = $('#tabs-' + tabs_id).find('.dire_design_wrapper');
		var pos = wrapper.children('.freeimage:visible').find('input[name="positionname"]');
		var positionname = pos.val();
		var currImg = wrapper.find('img.' + positionname);
		var w = currImg.attr('width');
		currImg.attr({
			'src': newsrc,
			'alt': orgname,
			'width': w
		}).show();
		pos.val("");
		wrapper.children('.freeimage').hide();
	},
	addFigure: function (arg) {
		/*
		 *	��ۤη���ڤ�
		 *	@arg		�оݤ���
		 *
		 *	@return		����ڤꤷ��ʸ����
		 */
		var str = String(arg);
		str = str.replace(/[��-��]/g, function (m) {
			var a = "��������������������";
			var r = a.indexOf(m);
			return r == -1 ? m : r;
		});
		str -= 0;
		var num = String(str);
		if (num.match(/^[-]?\d+(\.\d+)?/)) {
			while (num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
		} else {
			num = "0";
		}
		return num;
	},
	check_NaN: function (my) {
		/*
		 *	���������ɤ���
		 *	@my			Object
		 *
		 *	@return		�������Ǥʤ�����0���֤����������������С��������ʳ��ΤȤ����֤��ͤȤ��ƻ���
		 */
		var err = arguments.length > 1 ? arguments[1] : 0;
		var str = my.value.trim().replace(/[��-��]/g, function (m) {
			var a = "��������������������";
			var r = a.indexOf(m);
			return r == -1 ? m : r;
		});
		my.value = (str.match(/^\d+$/)) ? str - 0 : err;
		return my.value;
	},
	check_Real: function (my) {
		/*
		 *	�¿����ɤ�������������������
		 *	@my		Object
		 *
		 *	@return		�����ͤ�0
		 */
		var str = my.value.trim().replace(/[��-��]/g, function (m) {
			var a = "��������������������";
			var r = a.indexOf(m);
			return r == -1 ? m : r;
		});
		my.value = (str.match(/^-?[0-9]+([\.]{1}[0-9]+)?$/)) ? str - 0 : 0;
		return my.value;
	},
	restrict_num: function (n, my) {
		/*
		 *	���ͤ����Ϸ��������
		 */
		var c = my.value;
		c = c.replace(/[^\d]/g, '');
		my.maxLength = n;
		my.value = c;
		var self = my;
		$(self).select();
	},
	check_zipcode: function (zipcode) {
		/*
		 *	͹���ֹ�������������å�
		 */
		if (!zipcode) return false;
		if (!zipcode.match(/^[0-9]{3}[-]?[0-9]{0,4}$/)) return false;

		return true;
	},
	zip_mask: function (args) {
		/*
		 *	͹���ֹ��"-"�Ƕ��ڤ�
		 */
		var c = args.replace(/[��-��]/g, function (m) {
			var a = "��������������������";
			var r = a.indexOf(m);
			return r == -1 ? m : r;
		});
		c = c.replace(/[^\d]/g, '');
		if (c.length >= 3) c = c.substr(0, 3) + '-' + c.substr(3, 4);

		return c;
	},
	phone_mask: function (args) {
		/*
		 *	�����ֹ��"-"�Ƕ��ڤ�
		 */
		var l = 12;
		var c = args.replace(/[��-��]/g, function (m) {
			var a = "��������������������";
			var r = a.indexOf(m);
			return r == -1 ? m : r;
		});
		c = c.replace(/[^\d]/g, '');
		if (mypage.check_phone_separate(c, 5)) {
			c = c.substr(0, 5) + '-' + c.substr(5, 1) + '-' + c.substr(6, 4);
		} else if (mypage.check_phone_separate(c, 4)) {
			c = c.substr(0, 4) + '-' + c.substr(4, 2) + '-' + c.substr(6, 4);
		} else {
			var tel1 = c.substr(0, 3);
			if (tel1.match(/^0[5789]0$/)) {
				c = c.substr(0, 3) + '-' + c.substr(3, 4) + '-' + c.substr(7, 4);
				l = 13;
			} else if (mypage.check_phone_separate(c, 3)) {
				c = c.substr(0, 3) + '-' + c.substr(3, 3) + '-' + c.substr(6, 4);
			} else if (mypage.check_phone_separate(c, 2)) {
				c = c.substr(0, 2) + '-' + c.substr(2, 4) + '-' + c.substr(6, 4);
			}
		}

		return {
			'c': c,
			'l': l
		};
	},
	/*
	 *	͹���ֹ�λԳ����֤�Ƚ��
	 */
	check_phone_separate: function (c, count) {
		var tel1 = c.substr(0, count);
		var flg = false;
		var phone = '';
		switch (count) {
			case 5:
				phone = phone5;
				break;
			case 4:
				phone = phone4;
				break;
			case 3:
				phone = phone3;
				break;
			case 2:
				phone = phone2;
				break;
			default:
				return flg;
		}

		for (var i = 0; i < phone.length; i++) {
			if (phone[i] == tel1) {
				flg = true;
				break;
			}
		}

		return flg;
	},
	countDate: function (dd, addDays) {
		/*
		 *	���դη׻�
		 */
		dd = dd.replace(/-/g, "/");
		var baseSec = Date.parse(dd);
		var addSec = addDays * 86400000;
		var targetSec = baseSec + addSec;
		var dt = new Date();
		dt.setTime(targetSec);
		return dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2);
	},
	compareDate: function (d1) {
		/*
		 *	���դ����
		 */
		d1 = d1.replace(/-/g, "/");
		var startSec = Date.parse(d1);
		var endSec = '';
		if (arguments.length > 1) {
			var d2 = arguments[1].replace(/-/g, "/");
			endSec = Date.parse(d2);
		} else {
			var dt = new Date();
			endSec = dt.getTime();
		}
		return (endSec - startSec) / 86400000;
	},
	dateCheck: function (e, my) {
		/*
		 *	���դ������������å�
		 */
		var val = my.value;
		var date = new Date();
		var res = [];
		var yy, mm, dd;
		if (val.match(/^(\d{4})-([01]?\d{1})-([0123]?\d{1})$/)) {
			res = val.split('-');
			yy = res[0] - 0;
			mm = res[1] - 0;
			dd = res[2] - 0;
		} else if (val.match(/^([01]?\d{1})-([0123]?\d{1})$/)) {
			res = val.split('-');
			yy = date.getFullYear();
			mm = res[0] - 0;
			dd = res[1] - 0;
		}
		date = new Date(yy, mm - 1, dd);
		if (yy == date.getFullYear() && mm - 1 == date.getMonth() && dd == date.getDate()) {
			mm = ("" + mm).length == 1 ? "0" + mm : mm;
			dd = ("" + dd).length == 1 ? "0" + dd : dd;
			my.value = yy + '-' + mm + '-' + dd;
		} else {
			my.value = "";
		}
		var evt = e ? e : event;
		evt.preventDefault();
	},
	setItemInfo: function (val) {
		/*
		 *	���ʤ��ѹ���ȼ��ɽ����
		 */
		var data = val.split(',');
		$('#itemcolor_name').val(data[0]);
		$('#itemcolor_code').val(data[1]);
		$('#stock_number').val(data[2]);
		$('#master_id').val(data[3]);
		$('#printpos_id').val(data[4]);
		$('#maker').val(data[5]);
		$('#group1').val(data[6]);
		$('#group2').val(data[7]);
		return data;
	},
	setEstimation: function (data, modified) {
		/*
		 *	��ʸ�ꥹ�ȹ�����ȼ�����ʤ�����ȶ�ۤ�ɽ����
		 */
		var price = mypage.addFigure(data[2]);
		if (data[0] != null) $('#orderlist tbody').html(data[0]);
		$('#total_amount').val(data[1]);
		$('#est_amount').html(data[1]);
		$('#total_cost').val(price);
		$('#est_price').html(price);

		if (data[1] > 0 && data[3] != 1) { // ���ƻ����ξ��ϡ�̤ȯ���פ�ɽ�����ʤ�
			$('#order_stock').hide();
		} else {
			mypage.setMaxnumberOfPack(); // �޵ͤ��б�����κ����ͤ�����򹹿�

			// ���ɽ���ʳ��ι�����Ȣ����׻�
			if (arguments.length == 2) {
				mypage.getNumberOfBox();
			}
		}

		if (modified) {
			mypage.prop.modified = true;
			mypage.calcPrintFee();
		}
	},
	getNumberOfBox: function () {
		/*
		 *	Ȣ�������
		 */
		var field1 = ['curdate', 'package'];
		var data1 = [mypage.prop.firmorderdate, 'no'];
		if ($('input[value="yes"]', '#package_wrap').is(':checked')) data1[1] = 'yes';
		var field4 = ['item_id', 'size_id', 'amount'];
		var data4 = [];
		var tmp = [];
		$('#orderlist tbody tr').each(function () {
			if (!$(this).find('.choice').is(':checked') && mypage.prop.ordertype == 'general') return true;
			var itemid = $(this).children('td:first').children('.itemid').text();
			if (itemid.indexOf('_') > -1 || itemid == 99999) return true; // ����������¾��ž�̥����ȤϽ���
			tmp[0] = itemid;
			tmp[1] = $(this).find('.itemsize_name').children('img').attr('id').split('_')[1];
			tmp[2] = $(this).find('.listamount').val();
			data4.push(tmp.join('|'));
		});
		$.ajax({
			url: './php_libs/ordersinfo.php',
			type: 'POST',
			dataType: 'text',
			async: true,
			data: {
				'act': 'search',
				'mode': 'numberOfBox',
				'field1[]': field1,
				'data1[]': data1,
				'field4[]': field4,
				'data4[]': data4
			},
			success: function (r) {
				if (r.match(/^\d+?$/)) {
					$('#boxnumber').val(r);
				} else {
					alert('Error: p634' + r);
				}
			}
		});
	},
	setMaxnumberOfPack: function () {
		/*
		 *	�޵ͤ��ޤΤߤ��б�����ξ�»���
		 */
		var max_volume = $('#total_amount').val() - 0;
		var chk = $('input[name="package"]:checked', '#package_wrap').length;
		$('input[type="number"]', '#package_wrap').each(function () {
			$(this).attr('max', max_volume);
			if ($(this).is(':visible')) {
				if (chk == 1) {
					$(this).val(max_volume);
				} else {
					if ($(this).val() - 0 > max_volume) {
						$(this).val(max_volume);
					}
				}
			}
		});
	},
	multisorter: function (args) {
		/*
		 *	��ʸ�ꥹ�ȤΥޥ��������
		 *		maker, item_name, color_code, size_name
		 *		��color_code: ��谷���ʤϥ��顼̾
		 *
		 *	@args	sessionStorage ��쥳���ɤ��Ȥˤ�������
		 */
		var size_hash = {
			'70': 1,
			'80': 2,
			'90': 3,
			'100': 4,
			'110': 5,
			'120': 6,
			'130': 7,
			'140': 8,
			'150': 9,
			'160': 10,
			'JS': 11,
			'JM': 12,
			'JL': 13,
			'WS': 14,
			'WM': 15,
			'WL': 16,
			'GS': 17,
			'GM': 18,
			'GL': 19,
			'XS': 20,
			'S': 21,
			'M': 22,
			'L': 23,
			'XL': 24,
			'XXL': 25,
			'3L': 26,
			'4L': 27,
			'5L': 28,
			'6L': 29,
			'7L': 30,
			'8L': 31
		};

		var compare = function (a, b) {
			if (a['maker'] < b['maker']) return -1;
			if (a['maker'] > b['maker']) return 1;
			if (a['item_name'] < b['item_name']) return -1;
			if (a['item_name'] > b['item_name']) return 1;
			if (a['color_code'] < b['color_code']) return -1;
			if (a['color_code'] > b['color_code']) return 1;
			if (size_hash[a['size_name']] < size_hash[b['size_name']]) return -1;
			if (size_hash[a['size_name']] > size_hash[b['size_name']]) return 1;
			return 0;
		};

		args.sort(compare);
	},
	sessKey: {
		/*
		 *	sessionStorage�Υ���
		 *	
		 *	maker:		�᡼����̾
		 *	master_id:	�谷���ʰʳ��ϡ�mst_���ƥ���ID_�����ƥ�̾_���顼̾
		 *	item_name:	�����ƥ�̾
		 *	size_id:	�谷���ʰʳ��ϡ�������̾
		 *	color_code: �������ѡ��谷���ʰʳ��ϡ����顼̾
		 *	size_name:	��������
		 *	amount:		��ʸ���
		 *	cost:		ñ��
		 *	stock_number:����_���顼������
		 *	group1:		������ID
		 *	group2:		Ʊ��ʬ��ID�ʥ��륯�Τ��б���
		 */
		name: ['maker', 'master_id', 'item_name', 'color_code', 'size_id', 'size_name', 'amount', 'cost', 'choice', 'stock_number', 'group1', 'group2']
	},
	checkStorage: function (id, size, newID, newName, mode) {
		/*
		 *	��ʸ�ꥹ�ȤΥ������ޤ��ϥ��顼���ѹ���sessionStorage�Υǡ�����ʣ���ǧ������
		 *  	@id			master id
		 *  	@size		size id
		 *  	@newID		�ѹ�����ID
		 *	@newName	�ѹ�����°����
		 *  	@mode		master:���顼�ѹ�,��size:�������ѹ�
		 *
		 *	return		false:��ʣ���ꡡtrue:��ʣ�ʤ�������λ
		 */
		var sess = sessionStorage;
		var store = mypage.getStorage();
		var lenRec = store['master_id'].length;
		var result = false;
		var isExist = false;
		var changeID = null;
		if (mode == 'master') {
			// ���顼���ѹ�
			for (var i = 0; i < lenRec; i++) {
				if (store['size_id'][i] == size) {
					if (store['master_id'][i] == newID) isExist = true;
					if (store['master_id'][i] == id) changeID = i;
				}
			}
			if (!isExist && changeID != null) {
				store['master_id'][changeID] = newID;
				if (newName instanceof Array) {
					// �����ƥ�̾���ѹ�
					store['color_code'][changeID] = newName[0]; // �������ѡ����顼�����ɤޤ��ϥ��顼̾
					store['maker'][changeID] = newName[1];
					store['item_name'][changeID] = newName[2];
				} else {
					// ���顼���ѹ�
					store['color_code'][changeID] = newName; // �������ѡ����顼�����ɤޤ��ϥ��顼̾
				}
				result = true;
			}
		} else {
			// ���������ѹ�
			for (var i = 0; i < lenRec; i++) {
				if (store['master_id'][i] == id) {
					if (store['size_id'][i] == newID) isExist = true;
					if (store['size_id'][i] == size) changeID = i;
				}
			}
			if (!isExist && changeID != null) {
				store['size_id'][changeID] = newID;
				store['size_name'][changeID] = newName; // �������ѡ�������̾
				//store['cost'][changeID] = cost;
				result = true;
			}
		}
		if (result) {
			var list = [];
			// �����Ȥ��뤿��쥳�������������Ѵ�
			for (var i = 0; i < lenRec; i++) {
				list[i] = {};
				for (var n = 0; n < mypage.sessKey.name.length; n++) {
					list[i][mypage.sessKey.name[n]] = store[mypage.sessKey.name[n]][i];
				}
			}
			mypage.multisorter(list);

			// �ƥ����˳�Ǽ���륪�֥������Ȥ����
			store = {};
			for (var i = 0; i < lenRec; i++) {
				for (var n = 0; n < mypage.sessKey.name.length; n++) {
					if (typeof store[mypage.sessKey.name[n]] == 'undefined') store[mypage.sessKey.name[n]] = [];
					store[mypage.sessKey.name[n]][i] = list[i][mypage.sessKey.name[n]];
				}
			}
			// SessionStorage�˳�Ǽ
			sess.clear();
			for (var key in store) {
				sess.setItem(key, JSON.stringify(store[key]));
			}
		}
		return result;
	},
	getStorage: function () {
		/*
		 *	sessionStorage�����ǡ��������
		 *	return		{key:[], key:[], ...}
		 */
		var sess = sessionStorage;
		// Session����Ȥ����
		var store = {};
		for (var key in sess) {
			store[key] = JSON.parse(sess.getItem(key));
		}
		return store;
	},
	setStorage: function (list) {
		/*
		 *	sessionStorage�˳�Ǽ
		 *	@list	[{'maker', 'master_id','item_name','color_code','size_id','size_name','amount','cost','choice','stock_number','group1','group2'},{},{}]
		 *			default
		 *				cost:0
		 *				choice:1
		 *				stock_number = ''
		 *				maker = ''
		 *	return	sessionStorage�����ǡ���: {key:[], key:[], ...}
		 */
		var sess = sessionStorage;
		var lenRec = 0;
		var store = {};
		// Session����Ȥ����
		var lenSS = sess.length;
		if (list.length == 0) {
			store = mypage.getStorage();
			return store;
		} else if (lenSS == 0 || !sess['master_id'] instanceof Array) {
			// sessionstorage�˥ǡ������ʤ����
			mypage.multisorter(list);
			lenRec = list.length;
		} else {
			// ���ǡ�������
			try {
				store = mypage.getStorage();
				lenRec = store['master_id'].length;
				// Ʊ���ޥ�����ID��Ʊ������������Ͽ�Ѥߤξ��Ͻ���
				var isExist = false;
				var aryNew = [];
				for (var a = 0; a < list.length; a++) {
					isExist = false;
					for (var i = 0; i < lenRec; i++) {
						if (store['master_id'][i] == list[a]['master_id'] && store['size_id'][i] == list[a]['size_id']) {
							if (list['amount'] == false) {
								// �����0�ξ��Ϻ��
								if (lenSS == 1) {
									sess.clear();
								} else {
									for (var t = 0; t < mypage.sessKey.name.length; t++) {
										store[mypage.sessKey.name[t]].splice(i, 1);
									}
								}
							} else {
								// ��¸�ǡ����򹹿�
								store['amount'][i] = list[a]['amount'];
								store['cost'][i] = list[a]['cost'];
								store['choice'][i] = list[a]['choice'];
								store['stock_number'][i] = list[a]['stock_number'];
								store['maker'][i] = list[a]['maker'];
							}
							isExist = true;
							break;
						}
					}
					// �����ɲåǡ��������ݻ�
					if (!isExist) {
						aryNew.push(list[a]);
					}
				}
				// �����ɲåǡ�����������
				if (aryNew.length > 0) {
					for (var a = 0; a < aryNew.length; a++) {
						for (var t = 0; t < mypage.sessKey.name.length; t++) {
							store[mypage.sessKey.name[t]][lenRec] = aryNew[a][mypage.sessKey.name[t]];
						}
						lenRec++;
					}
				}
				// �����Ȥ��뤿��쥳�������������Ѵ�
				list = [];
				for (var i = 0; i < lenRec; i++) {
					list[i] = {};
					for (var n = 0; n < mypage.sessKey.name.length; n++) {
						list[i][mypage.sessKey.name[n]] = store[mypage.sessKey.name[n]][i];
					}
				}
				mypage.multisorter(list);
			} catch (e) {
				mypage.multisorter(list);
				lenRec = list.length;
			}
		}
		// �ƥ����˳�Ǽ���륪�֥������Ȥ����
		store = {};
		for (var i = 0; i < lenRec; i++) {
			for (var n = 0; n < mypage.sessKey.name.length; n++) {
				if (typeof store[mypage.sessKey.name[n]] == 'undefined') store[mypage.sessKey.name[n]] = [];
				store[mypage.sessKey.name[n]][i] = list[i][mypage.sessKey.name[n]];
			}
		}
		// SessionStorage�˳�Ǽ
		sess.clear();
		for (var key in store) {
			sess.setItem(key, JSON.stringify(store[key]));
		}

		return store;
	},
	removeStorage: function (args) {
		/*
		 *	sessionStorage��ǡ����κ��
		 *	@args	{master_id,size_id}
		 *	return	sessionStorage�Υ쥳���ɿ�
		 */
		var store = mypage.getStorage();
		if (Object.keys(store).length == 0) {
			return 0;
		}

		var sess = sessionStorage;
		var masterId = args['master_id'] || null;
		var sizeId = args['size_id'] || null;
		var lenRec = store['master_id'].length;
		if (lenRec == 1) {
			sess.clear();
			return 0;
		}
		for (var i = 0; i < lenRec; i++) {
			if (store['master_id'][i] == masterId && store['size_id'][i] == sizeId) {
				for (var t = 0; t < mypage.sessKey.name.length; t++) {
					store[mypage.sessKey.name[t]].splice(i, 1);
				}
				break;
			}
		}
		sess.clear();
		for (var key in store) {
			sess.setItem(key, JSON.stringify(store[key]));
		}

		return lenRec;
	},
	updateStorage: function (args) {
		/*
		 *	sessionStorage�ι���
		 *	@args	{master_id, size_id, target_key, value}
		 */
		var sess = sessionStorage;
		var store = mypage.getStorage();
		var lenRec = store['master_id'].length;
		for (var i = 0; i < lenRec; i++) {
			if (store['master_id'][i] == args['master_id'] && store['size_id'][i] == args['size_id']) {
				store[args['target_key']][i] = args['value'];
				break;
			}
		}
		sess.clear();
		for (var key in store) {
			sess.setItem(key, JSON.stringify(store[key]));
		}
	},
	additem: function () {
		/*
		 *	��ʸ�ꥹ�Ȥ��ɲ�
		 */
		mypage.prop.modified = true;
		var maker = $('#maker').val();
		var master_id = $('#master_id').val();
		var item_name = '';
		var color_code = $('#itemcolor_code').val();
		var item_color = $('#itemcolor_name').val().trim();
		var stock_number = $('#stock_number').val();
		var category_id = $('#category_selector').val().trim();
		var category_name = $('#category_selector option:selected').text();
		var ppID = $('#printpos_id').val();
		var item_id = 0;
		var dry = '';
		var tmp = '';
		var group1 = $('#group1').val();
		var group2 = $('#group2').val();

		if (category_id == '0' || category_id == '100') { // ����¾�Ȼ���
			item_name = ($('#itemIs').children().val()).trim();
			if (item_name == "" || item_color == "") {
				alert('����̾�ȥ��顼̾�����Ϥ��Ƥ���������');
				return;
			}
			item_id = category_id + '_' + item_name;
			master_id = 'mst_' + category_id + '_' + item_name + '_' + item_color;
			color_code = item_color; // ��������
			ppID = item_id;
			tmp = item_id.replace(/ /g, '\\ ');
			tmp = tmp.replace(/��/g, '\\��');

		} else if (category_id == '99') { // ž�̥�����
			item_name = 'ž�̥�����';
			item_id = 99999;
			master_id = 'mst_' + category_id + '_' + item_name + '_' + item_color;
			color_code = item_color; // ��������
			ppID = 99;
			tmp = item_id;
		} else {
			dry = $('#item_selector option:selected').attr('rel');
			if (dry != "") dry = '[' + dry + ']';
			item_name = $('#item_selector option:selected').text();
			item_name = item_name.replace(/\[.+?\]/, '');
			item_id = $('#item_selector').val().trim();
			tmp = item_id;

			/*
			 *	2013-10-23 ���������ΰ������ʤ�DRYɽ���ʥ�������Ͽ������
			 *	325		046-UB���桼�ƥ���ƥ��֥륾��
			 *	73		068-RSV����ե쥯���ݡ��ĥ٥���
			 *	254		057-SSJ�����������ॸ���ѡ�
			 *	65		061-RSJ����ե쥯���ݡ��ĥ��㥱�å�
			 *	253		850-DZ���ɥꥺ�顼
			 *	158		049-FC���ա��ɥ��󥳡���
			 *	328		048-AJ�������ƥ��֥��㥱�å�
			 *	326		260-ETB�������ĥ���֥륾��
			 *	329		001-NFC�������ƥ��֥����ɥ�����
			 *	159		230-ABC�������ƥ��֥٥��������
			 *	275		P-6880�����ߥ��󥰥ܥ�������
			 */
			if (
				item_id == 325 ||
				item_id == 73 ||
				item_id == 254 ||
				item_id == 65 ||
				item_id == 253 ||
				item_id == 158 ||
				item_id == 328 ||
				item_id == 326 ||
				item_id == 329 ||
				item_id == 159 ||
				item_id == 275
			) {
				dry = '[DRY]';
			}
		}
		var sizename = '';
		var sizeids = [];
		var sizedata = [];
		var amountdata = [];
		var costdata = [];
		$('#ordersize tbody').find('tr:eq(1)').children('td:not(:last)').each(function (index) {
			var amount = $(this).children().val();
			if (amount != 0) {
				amountdata.push(amount);
				var size_name = '';
				if (category_id == '0' || category_id >= 99) {
					master_id = 'mst_' + category_id + '_' + item_name + '_' + item_color;
					sizename = $(this).parent().prev('tr').children('td:eq(' + index + ')').children().val();
					sizeids.push(sizename);
					sizedata.push(sizename); // ��������
					costdata.push(0);
				} else {
					sizeids.push($(this).children().attr('id').split('_')[1]);
					sizedata.push($(this).parent().prev('tr').children('td:eq(' + index + ')').text()); // ��������
					var wholesale = $(this).children().attr('id').split('_')[2];
					if (!wholesale) {
						costdata.push(0);
					} else {
						costdata.push(wholesale);
					}
				}
				$(this).children().val('0');
			}
		});
		if (amountdata.lengh == 0) return;

		var isExistitem = false;
		$('#orderlist tbody tr').each(function () {
			if (item_id == $(this).children('td:eq(0)').children('.itemid').text()) {
				isExistitem = true;
				return false; // break;
			}
		});

		/*
		 *	sessionStorage����¸
		 *	[{'maker','master_id','item_name','color_code','size_id','size_name','amount','cost','choice','stock_number','group1','group2'},{}.{}]
		 */
		var args = [];
		for (var i = 0; i < sizedata.length; i++) {
			args[i] = {
				'maker': maker,
				'master_id': master_id,
				'item_name': item_name,
				'color_code': color_code,
				'size_id': sizeids[i],
				'size_name': sizedata[i],
				'amount': amountdata[i],
				'cost': costdata[i],
				'choice': 1,
				'stock_number': stock_number,
				'group1': group1,
				'group2': group2
			};
		}
		var store = mypage.setStorage(args);
		var list = {
			'act': 'orderlist',
			'ordertype': mypage.prop.ordertype,
			'isprint': isPrint,
			'curdate': mypage.prop.firmorderdate,
			'data' : JSON.stringify(store)
		};

		// ��ʸ�ꥹ�Ȥν�
		var isPrint = $('#noprint').is(':checked') ? 0 : 1;
		$.ajax({
			url: './php_libs/dbinfo.php',
			type: 'POST',
			dataType: 'json',
			async: false,
			data: list,
			success: function (r) {
				if (r instanceof Array) {
					mypage.setEstimation(r, false);
					if (!isExistitem) {
						var itemname = item_name + dry;
						mypage.addPrintPos(category_id, category_name, item_id, itemname, ppID);
					}
					mypage.calcPrintFee();
				} else {
					alert('Error: p911\n' + r);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error: p940\n' + textStatus + '\n' + errorThrown);
			}
		});
	},
	addPrintPos: function (category_id, category_name, item_id, item_name, ppID) {
		/*
		 *	�ץ��Ȱ��֤Υ������ɲ�
		 */
		if ($('#pp_toggler_' + category_id).length == 0) {
			var category_name = $('#category_selector option:selected').text();
			$.ajax({
				url: './php_libs/dbinfo.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: {
					'act': 'printposition',
					'item_id': item_id,
					'curdate': mypage.prop.firmorderdate,
					'ordertype': mypage.prop.ordertype
				},
				success: function (data) {
					var togglebody = '<div class="pp_toggle_body">' + data + '</div>';
					var html = '<div class="pp_toggler" id="pp_toggler_' + category_id + '">';
					html += '<div class="rightside">';
					if (mypage.prop.ordertype == 'general') {
						html += '&nbsp;����&nbsp;<input type="text" value="0" size="8" readonly="readonly" class="sub_price" />';
						html += '<input type="hidden" value="0" size="8" class="silk_price" />';
						html += '<input type="hidden" value="0" size="8" class="color_price" />';
						html += '<input type="hidden" value="0" size="8" class="digit_price" />';
						html += '<input type="hidden" value="0" size="8" class="inkjet_price" />';
						html += '<input type="hidden" value="0" size="8" class="embroidery_price" />';
					}
					html += '</div>';
					html += '<p class="title">' + category_name + '<span title="item_' + item_id + '">' + item_name + '</span></p>';
					html += '</div>';
					$('#pp_wrapper').append(html).append(togglebody);
					$('#pp_wrapper :input').change(function () {
						mypage.prop.modified = true;
					});
				}
			});
		} else {
			var isExistPos = false;
			$('#pp_toggler_' + category_id).next().children('div').each(function () {
				if ($(this).attr('class') == 'printposition_' + ppID) {
					isExistPos = true;
					return false; // break
				}
			});
			if (!isExistPos) {
				$.ajax({
					url: './php_libs/dbinfo.php',
					type: 'POST',
					dataType: 'text',
					async: false,
					data: {
						'act': 'printposition',
						'item_id': item_id,
						'curdate': mypage.prop.firmorderdate,
						'ordertype': mypage.prop.ordertype
					},
					success: function (data) {
						$('#pp_toggler_' + category_id).next().append(data);
						$('#pp_wrapper :input').change(function () {
							mypage.prop.modified = true;
						});
					}
				});
			}

			$('#pp_toggler_' + category_id + ' p').append('<span title="item_' + item_id + '">' + item_name + '</span>');
		}
		$('#pp_wrapper').find('.repeat_check').change(function () {
			mypage.calcPrintFee();
		});
	},

	/**********************************************
			���ƥե��������
			2016.11.22
	***********************************************/

	showDesignImg: function (orders_id_i) {
		var orders_id = orders_id_i;
		if (orders_id == null || orders_id == undefined) {
			orders_id = $('#uploadImg_table').find("#order_id").val();
		}

		$("#downloadImg").die("click");
		$("#deleteImg").die("click");
		$('#designImg_table thead').html("");
		$('#designImg_table tbody').html("");

		$.ajax({
			url: './php_libs/design.php',
			type: 'POST',
			dataType: 'json',
			async: false,
			data: {
				'act': 'showDesignImg',
				'order_id': orders_id,
				'folder': 'attachfile'
			},
			success: function (data) {
				if (data == "") {
					var thead = "<p>������ʸ�ˤϸ��ƥե����뤬����ޤ���</p>";
					$('#designImg_table thead').html(thead);

				} else {
					var thead = "<tr><td>����</td><td>�ե�����̾</td><td class='last pending'>���</td></tr>";
					$('#designImg_table thead').html(thead);
					var tbody = "",
						href = "",
						ord = 0,
						ary = [],
						fileName = '';
					for (var i = 0; i < data.length; i++) {
						fileName = data[i]['name'];
						href = data[i]['path'];
						ord = i + 1;
						tbody += "<tr><td>" + ord + "</td>";
						tbody += "<td>" + fileName + "</td>";
						tbody += "<td class='last pending'><input type='button'  value='�����������' id ='downloadImg' name='" + href + "'>   <input type= 'button'  value='���' id ='deleteImg' name='" + fileName + "'></td></tr>";
					}
					$('#designImg_table tbody').html(tbody);
				}

				if (orders_id_i == null || orders_id_i == undefined) {
					mypage.prop.show_design_time++;
					if (mypage.prop.attach_file_number != (data.length - 2) || mypage.prop.show_design_time > 10) {
						$('#uploadImg_table').find("#wait_img").hide();
						$('#designImg_table tbody').html(tbody);
						$('#uploadImg_table').find("#attach_des").val("");
						if (mypage.prop.show_design_time > 300) {
							alert('���ƥե����륢�åץ����ɥ����ॢ����');
							mypage.prop.show_design_time = 0;
						}
					} else {
						window.setTimeout(mypage.showDesignImg, 1000);
					}
				}
			}
		});

		//�ե����������������
		$('#downloadImg').live('click', function () {
			var href = $(this).attr('name');
			var a = window.open(href);

		});

		//�ե��������
		$('#deleteImg').live('click', function () {
			var file_name = $(this).attr('name');
			if (!confirm(file_name + ' �������ޤ�����������Ǥ��礦����')) {
				return;
			}
			$.ajax({
				url: './php_libs/design.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: {
					'act': 'deleteDesFile',
					'order_id': orders_id,
					'file_name': file_name,
					'folder': 'attachfile'
				},
				success: function (r) {
					if (r == 1) {
						mypage.showDesignImg(orders_id);
						mypage.prop.show_design_time = 0;
					} else {
						alert('���ƥե�����������');
					}
				}
			});
		});

	},


	uploadDesignImg: function (orders_id_i) {
		var orders_id = "";
		orders_id = orders_id_i - 0;
		if (orders_id == 0) $('#uploadImg_table').hide();
		var tbody = "";
		tbody += "<input type=hidden value=" + orders_id + " name=order_id />";
		$('#uploadImg_table').find("#order_id").val(orders_id);
		$("#desImgup").die("click");
		$("#desImgcancel").die("click");
		//upload
		$('#desImgup').live('click', function () {
			var file_name = $('#uploadImg_table').find("#attach_des").val();
			if (!file_name) {
				$.msgbox('�ե���������򤷤Ƥ�������');
				return;
			}
			orders_id = $('#uploadImg_table').find("#order_id").val();
			$.ajax({
				url: './php_libs/design.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: {
					'act': 'checkFileName',
					'order_id': orders_id,
					'file_name': file_name,
					'folder': 'attachfile'
				},
				success: function (r) {
					if (r) {
						$.msgbox('Ʊ̾�ե������¸�ߤ��Ƥ��ޤ�');
						return;
					} else {
						$('#uploadImg_table').find("#wait_img").show();
						mypage.prop.attach_file_number = $('#designImg_table tbody').find('tr').length;
						mypage.prop.show_design_time = 0;
						$('#uploadImg_table form').submit();
						window.setTimeout(mypage.showDesignImg, 1000);
					}
				}
			});
		});

		//upload cancel
		$('#desImgcancel').live('click', function () {
			$('#uploadImg_table').find("#attach_des").val("");
		});

	},

	/**********************************************
			���᡼���������
			2017.03.06
	***********************************************/

	showDesignedImg: function (orders_id_i) {
		var orders_id = orders_id_i;
		if (orders_id == null || orders_id == undefined) {
			orders_id = $('#uploadDesedImg_table').find("#order_id").val();
		}

		$("#downloadDesedImg").die("click");
		$("#deleteDesedImg").die("click");
		$('#designedImg_table thead').html("");
		$('#designedImg_table tfoot').html("");
		$('#designedImg_table tbody').html("");
		$.ajax({
			url: './php_libs/design.php',
			type: 'POST',
			dataType: 'json',
			async: false,
			data: {
				'act': 'showDesignImg',
				'order_id': orders_id,
				'folder': 'imgfile'
			},
			success: function (data) {
				if (data == "") {
					var thead = "<p>������ʸ�ˤϥ��᡼�������ե����뤬����ޤ���</p>";
					$('#designedImg_table thead').html(thead);
				} else {
					var thead = "<tr><td>����</td><td>�ե�����̾</td><td class='last pending'>���</td></tr>";
					$('#designedImg_table thead').html(thead);
					$('#designedImg_table tfoot').html('<tr>><td colspan="2"></td><td class="last"><button id="btn_imageup" class="btn_sub">���᡼���������å�</button></td></tr>');
					var tbody = "";
					var href = "";
					var ord = 0;
					for (var i = 0; i < data.length; i++) {
						href = "./imgfile/" + orders_id + "/" + data[i];
						ord = i + 1;
						tbody += "<tr><td>" + ord + "</td>";
						tbody += "<td>" + data[i] + "</td>";
						tbody += "<td class='last pending'><input type='button'  value='�����������' id ='downloadDesedImg' name='" + href + "'>   <input type= 'button'  value='���' id ='deleteDesedImg' name='" + data[i] + "'></td></tr>";
					}
					$('#designedImg_table tbody').html(tbody);
				}
				if (orders_id_i == null || orders_id_i == undefined) {
					mypage.prop.show_design_time++;
					if (mypage.prop.attach_file_number != (data.length - 2) || mypage.prop.show_design_time > 10) {
						$('#uploadDesedImg_table').find("#wait_img").hide();
						$('#designedImg_table tbody').html(tbody);
						$('#uploadDesedImg_table').find("#attach_img").val("");
						if (mypage.prop.show_design_time > 300) {
							alert('���᡼�������ե����륢�åץ����ɥ����ॢ����');
							mypage.prop.show_design_time = 0;
						}
					} else {
						window.setTimeout(mypage.showDesignedImg, 1000);
					}
				}
			}
		});

		//�ե����������������
		$('#downloadDesedImg').live('click', function () {
			var href = $(this).attr('name');
			var a = window.open(href);

		});

		//�ե��������
		$('#deleteDesedImg').live('click', function () {
			var file_name = $(this).attr('name');
			if (!confirm(file_name + ' �������ޤ�����������Ǥ��礦����')) {
				return;
			}
			$.ajax({
				url: './php_libs/design.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: {
					'act': 'deleteDesFile',
					'order_id': orders_id,
					'file_name': file_name,
					'folder': 'imgfile'
				},
				success: function (r) {
					if (r == 1) {
						mypage.showDesignedImg(orders_id);
						mypage.prop.show_design_time = 0;
					} else {
						alert('���᡼�������ե�����������');
					}
				}
			});
		});

	},


	uploadDesignedImg: function (orders_id_i) {
		var orders_id = "";
		orders_id = orders_id_i - 0;
		if (orders_id == 0) $('#uploadDesedImg_table').hide();
		var tbody = "";
		tbody += "<input type=hidden value=" + orders_id + " name=order_id />";
		$('#uploadDesedImg_table').find("#order_id").val(orders_id);
		$("#desedImgup").die("click");
		$("#desedImgcancel").die("click");
		//upload
		$('#desedImgup').live('click', function () {
			var file_name = $('#uploadDesedImg_table').find("#attach_img").val();
			if (!file_name) {
				$.msgbox('�ե���������򤷤Ƥ�������');
				return;
			}
			orders_id = $('#uploadDesedImg_table').find("#order_id").val();
			$.ajax({
				url: './php_libs/design.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: {
					'act': 'checkFileName',
					'order_id': orders_id,
					'file_name': file_name,
					'folder': 'imgfile'
				},
				success: function (r) {
					if (r) {
						$.msgbox('Ʊ̾�ե������¸�ߤ��Ƥ��ޤ�');
						return;
					} else {
						$('#uploadDesedImg_table').find("#wait_img").show();
						mypage.prop.attach_file_number = $('#designedImg_table tbody').find('tr').length;
						mypage.prop.show_design_time = 0;
						$('#uploadDesedImg_table form').submit();
						window.setTimeout(mypage.showDesignedImg, 1000);
					}
				}
			});
		});

		//upload cancel
		$('#desedImgcancel').live('click', function () {
			$('#uploadDesedImg_table').find("#attach_img").val("");
		});

	},


	changeSchedule2: function (args) {
		/*
		 *	��ʸ���������ѹ��ǥ������ơ��֥����ʸ�ꥹ�Ȥ򹹿�
		 *	@args	ȯ����
		 */
		mypage.prop.modified = true;
		mypage.prop.firmorderdate = args;

		$.ajax({
			url: './php_libs/set_tablelist.php',
			type: 'POST',
			datatype: 'text',
			async: false,
			data: {
				'act': 'item',
				'current_id': 1,
				'curdate': mypage.prop.firmorderdate
			},
			success: function (r) {
				$('#category_selector').val(1);
				$('#itemIs select').html(r);
				mypage.changeColorcode($('#item_selector').val(), '');
			}
		});
		var orders_id = $('#order_id').text() - 0;
		var noprint = 0;
		if (mypage.prop.ordertype == "general") {
			noprint = $('#noprint').is(':checked') ? 1 : 0;
		}
		mypage.showOrderItem({
			'orders_id': orders_id,
			'noprint': noprint
		});
	},
	changeSchedule3: function (args, calc) {
		/*
		 *	ȯ�������ѹ��Ǿ�����Ψ�κ�����
		 *	@args	ȯ����
		 *	@calc	�Ʒ׻���1:���롢0:���ʤ�
		 */
		mypage.prop.modified = true;
		mypage.prop.acceptingdate = args;

		// ������Ψ������
		mypage.setTAX(args);

		if (calc) mypage.calcPrintFee();
	},
	changeColorcode: function (id, code, init) {
		/*
		 *	���ʾ�����Υ��쥯�����ޤ��ϥ��顼������ѹ���ȼ���������ơ��֥�ι���
		 *	@id 	�����ƥ�ID
		 *	@code	���顼������
		 *	@init	���̤ν��ɽ�����ɤ���
		 */
		var chk = init === 'undefined' ? false : init;
		if (id == 0) {
			id = $('#category_selector').val();
			$.ajax({
				url: './php_libs/dbinfo.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: {
					'act': 'size',
					'item_id': id,
					'ordertype': mypage.prop.ordertype,
					'curdate': mypage.prop.firmorderdate
				},
				success: function (r) {
					$('#size_table').html(r);
				}
			});
			mypage.setItemInfo(',0,,0,0,,0,0');
		} else {
			$.ajax({
				url: './php_libs/dbinfo.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: {
					'act': 'itemimage',
					'item_id': id,
					'color_code': code,
					'curdate': mypage.prop.firmorderdate
				},
				success: function (r) {
					var info = mypage.setItemInfo(r);
					var isPrint = $('#noprint').is(':checked') ? 0 : 1;
					if ($('#noprint').is(':checked')) isPrint = 0;
					$.ajax({
						url: './php_libs/dbinfo.php',
						type: 'POST',
						dataType: 'text',
						async: false,
						data: {
							'act': 'size',
							'item_id': id,
							'itemcolor_code': info[1],
							'isprint': isPrint,
							'ordertype': mypage.prop.ordertype,
							'curdate': mypage.prop.firmorderdate
						},
						success: function (r) {
							$('#size_table').html(r);
						}
					});
					$('#itemcolor_wrapper').fadeOut();
					if (!chk) mypage.screenOverlay(false);
				}
			});
		}
	},
	changeItemcolor: function (master_id, size_id, parm, code) {
		/*
		 *	��ʸ�ꥹ�ȤΥ��顼�ѹ�
		 *	@master_id	�ޥ�����ID
		 *	@size_id	������ID
		 *	@parm		new master_id(�����ƥ५�顼�ѥ�åȤǻ���)
		 *				this(��ʸ�ꥹ����ǡ��谷���ʰʳ��Υ��顼�ѹ���textbox�򻲾�)
		 *	@code		���顼�����ɡʼ谷���ʤΤ߻��ѡ�
		 */
		var new_color = code === 'undefined' ? '' : code;
		var obj = '';
		var tmp = [];
		if (typeof parm.value != 'undefined') { // �ƥ����ȥܥå����Ǽ����Ϥξ��
			tmp = master_id.split('_');
			new_color = parm.value.trim();
			if (new_color == "") {
				parm.value = tmp[3];
				return;
			}
			obj = parm;
			var tr = $(parm).closest('tr');
			var category_id = tr.children('td:eq(2)').attr('class').split('_')[1];
			var category_name = tr.children('td:eq(2)').text();
			var ppID = tr.children('td:first').find('.positionid').text();
			mypage.prop.itemdata = [category_id, category_name, ppID];
			parm = 'mst_' + tmp[1] + '_' + tmp[2] + '_' + new_color;
		}
		if (master_id == parm) {
			$('#itemcolor_wrapper').fadeOut();
			mypage.screenOverlay(false);
			return;
		}
		if (!mypage.checkStorage(master_id, size_id, parm, new_color, 'master')) {
			if (obj != '') obj.value = tmp[3];
			alert('Ʊ�����顼�Υ����ƥब���뤿�ᡢ�ѹ��Ǥ��ޤ���');
			return;
		}

		var isPrint = $('#noprint:checked').length == 1 ? 0 : 1;
		var store = mypage.getStorage();
		var list = {
			'act': 'orderlist',
			'ordertype': mypage.prop.ordertype,
			'isprint': isPrint,
			'curdate': mypage.prop.firmorderdate,
			'data' : JSON.stringify(store)
		};

		$.ajax({
			url: './php_libs/dbinfo.php',
			type: 'POST',
			dataType: 'json',
			async: false,
			data: list,
			success: function (r) {
				if (r instanceof Array) {
					if (r.length == 0) return; // ��ʸ�ꥹ�Ȥ���
					mypage.setEstimation(r, true);
					$('#itemcolor_wrapper').fadeOut();
					mypage.screenOverlay(false);
				} else {
					alert('Error: p1009\n' + r);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error: p1013\n' + textStatus + '\n' + errorThrown);
			}
		});
	},
	changeItemsize: function (master_id, size_id, new_size_id, new_size_name) {
		/*
		 *	��ʸ�ꥹ�ȤΥ������ѹ�
		 *	@master_id		�ޥ�����ID
		 *	@size_id		������ID
		 *	@new_size_id	�ѹ����륵����ID
		 *	@new_size_name	������̾�ʼ谷���ʤΤ߻��ѡ�
		 */
		var obj = '';
		if (typeof new_size_name.value != 'undefined') { // �ƥ����ȥܥå����Ǽ����Ϥξ��
			obj = new_size_name;
			new_size_id = obj.value.trim();
			if (new_size_id == "") {
				obj.value = size_id;
				return;
			}
			new_size_name = new_size_id;
			var tr = $(obj).closest('tr');
			var category_id = tr.children('td:eq(2)').attr('class').split('_')[1];
			var category_name = tr.children('td:eq(2)').text();
			var ppID = tr.children('td:first').find('.positionid').text();
			mypage.prop.itemdata = [category_id, category_name, ppID];
		}
		if (size_id == new_size_id) {
			$('#itemsize_wrapper').fadeOut();
			mypage.screenOverlay(false);
			return;
		}

		if (!mypage.checkStorage(master_id, size_id, new_size_id, new_size_name, 'size')) {
			if (obj != '') obj.value = size_id;
			alert('Ʊ���������Υ����ƥब���뤿�ᡢ�ѹ��Ǥ��ޤ���');
			return;
		}


		var isPrint = $('#noprint').is(':checked') ? 0 : 1;
		var store = mypage.getStorage();
		var list = {
			'act': 'orderlist',
			'ordertype': mypage.prop.ordertype,
			'isprint': isPrint,
			'curdate': mypage.prop.firmorderdate,
			'data' : JSON.stringify(store)
		};

		$.ajax({
			url: './php_libs/dbinfo.php',
			type: 'POST',
			dataType: 'json',
			async: false,
			data: list,
			success: function (r) {
				if (r instanceof Array) {
					if (r.length == 0) return; // ��ʸ�ꥹ�Ȥ���
					mypage.setEstimation(r, true);
					$('#itemsize_wrapper').fadeOut();
					mypage.screenOverlay(false);
				} else {
					alert('Error: p1065\n' + r);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error: p1069\n' + textStatus + '\n' + errorThrown);
			}
		});
	},
	removeitem: function (my, size_id, master_id) {
		/*
		 *	��ʸ�ꥹ�Ȥ��龦�ʤκ��
		 *	@my		object
		 *	@size_id
		 *	@master_id
		 */
		mypage.prop.modified = true;
		var item_id = $(my).parent().siblings(':first').children('.itemid').text();
		var ppID = $(my).parent().siblings(':first').children('.positionid').text();
		var category_id = $(my).parent().siblings(':eq(2)').attr('class').split('_')[1];
		// var category_name = $(my).parent().siblings(':eq(2)').text();
		var tmp = item_id.replace(/ /g, '\\ ');
		tmp = tmp.replace(/��/g, '\\��');

		// sessionStorage�κ��
		var args = {
			'master_id': master_id,
			'size_id': size_id
		};
		if (mypage.removeStorage(args) == 0) {
			mypage.setEstimation(['', 0, 0, 1], false);
		} else {
			var isPrint = $('#noprint').is(':checked') ? 0 : 1;
			var store = mypage.getStorage();
			var list = {
				'act': 'orderlist',
				'ordertype': mypage.prop.ordertype,
				'isprint': isPrint,
				'curdate': mypage.prop.firmorderdate,
				'data' : JSON.stringify(store)
			};

			$.ajax({
				url: './php_libs/dbinfo.php',
				type: 'POST',
				dataType: 'json',
				async: false,
				data: list,
				success: function (r) {
					if (r instanceof Array) {
						if (r.length == 0) return; // ��ʸ�ꥹ�Ȥ���
						mypage.setEstimation(r, false);
					} else {
						alert('Error: p1065\n' + r);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert('Error: p1069\n' + textStatus + '\n' + errorThrown);
				}
			});
		}

		// ��ʸ�ꥹ�Ȥν���
		var isExistItem = false;
		var isExistPP = false;
		$('#orderlist tbody tr').each(function () {
			var curCategory = $(this).children('td:eq(2)').attr('class').split('_')[1];
			if ($(this).children('td:eq(0)').children('.itemid').text() == item_id) isExistItem = true;
			if (curCategory == category_id && $(this).children('td:eq(0)').children('.positionid').text() == ppID) isExistPP = true;
			if (mypage.prop.ordertype == "general" && !$(this).find('.choice').is(':checked')) return true; // continue
		});

		// �����ι���
		if (!isExistItem) {
			var toggler = $('#pp_toggler_' + category_id);
			if (toggler.children('.title').children('span').length == 1) {
				toggler.next().remove();
				toggler.remove();
			} else {
				$('#pp_toggler_' + category_id + ' p span[title="item_' + item_id + '"]').remove();
				if (!isExistPP) toggler.next().find('.printposition_' + ppID).remove();
			}
		}
		mypage.calcPrintFee();
	},
	updateitem: function (my, size_id, master_id) {
		/*
		 *	��ʸ�ꥹ�Ȥ������ñ�����ǡ����������ѹ�
		 *	Class��ʣ�����ꤷ�Ƥ�����Ϻǽ��Class̾��Ƚ��
		 */
		var tr = $(my).closest('tr');
		var cls = $(my).attr('class').split(' ')[0];
		var category_id = tr.children('td:eq(2)').attr('class').split('_')[1];
		var category_name = tr.children('td:eq(2)').text();
		var ppID = tr.children('td:eq(0)').find('.positionid').text();
		var args = {
			'master_id': master_id,
			'size_id': size_id
		};
		var val = null;
		switch (cls) {
			case 'listamount': // ������ѹ�
				val = mypage.check_Real(my);
				if (val == '0') {
					mypage.removeitem(my, size_id, master_id); // �����0�λ��Ϻ��
					return;
				}
				args['target_key'] = 'amount';
				args['value'] = val;
				break;
			case 'choice': // �����ƥ����������å��ܥå���
				if ($(my).is(':checked')) {
					$(my).closest('tr').fadeTo('fast', '1');
					val = 1;
				} else {
					$(my).closest('tr').fadeTo('fast', '0.3');
					val = 0;
				}
				args['target_key'] = 'choice';
				args['value'] = val;
				break;
			case 'plateis': // �б�����ǥ�������ѹ�
				// sessionStorage ���б�
				break;
			case 'itemcost': // ñ�����ѹ�
				val = my.value;
				args['target_key'] = 'cost';
				args['value'] = val;
				break;
		}

		mypage.prop.modified = true;
		if (val != null) mypage.updateStorage(args);

		if (cls == 'listamount' || cls == 'choice') {
			var isPrint = $('#noprint').is(':checked') ? 0 : 1;
			var store = mypage.getStorage();
			var list = {
				'act': 'orderlist',
				'ordertype': mypage.prop.ordertype,
				'isprint': isPrint,
				'curdate': mypage.prop.firmorderdate,
				'data' : JSON.stringify(store)
			};

			$.ajax({
				url: './php_libs/dbinfo.php',
				type: 'POST',
				dataType: 'json',
				async: false,
				data: list,
				success: function (r) {
					if (r instanceof Array) {
						if (r.length == 0) return; // ��ʸ�ꥹ�Ȥ���
						mypage.setEstimation(r, true);
					} else {
						alert('Error: p1065\n' + r);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert('Error: p1069\n' + textStatus + '\n' + errorThrown);
				}
			});
		} else {
			var price = 0;
			var tot_amount = 0;
			var existNotBring = 0;
			$('#orderlist tbody tr').each(function () {
				var itemid = $(this).children('td:first').children('.itemid').text();
				var count = $(this).find('.listamount').val().replace(/,/g, '') - 0;
				var sub_total = 0;
				var curCategory = $(this).children('td:eq(2)').attr('class').split('_')[1];
				if (curCategory != '100') existNotBring = 1;
				if (mypage.prop.ordertype == 'general') {
					if (!$(this).find('.choice').is(':checked')) return true; // continue
					if (itemid.indexOf('_') > -1) {
						sub_total = ($(this).find('.itemcost').val().replace(/,/g, '') - 0) * count;
					} else {
						sub_total = ($(this).find('.itemcost').text().replace(/,/g, '') - 0) * count;
					}
				} else {
					sub_total = ($(this).find('.itemcost').val().replace(/,/g, '') - 0) * count;
				}
				$(this).find('.subtotal').text(mypage.addFigure(sub_total));
				price += sub_total;
				tot_amount += count;
			});
			var data = [null, tot_amount, price, existNotBring];
			mypage.setEstimation(data, false);
			mypage.calcPrintFee();
		}
	},
	changeitem: function (my, size_id, master_id) {
		/*
		 *	��ʸ�ꥹ�ȤΥ����ƥ�̾���ѹ�
		 */
		var myindex = $('#orderlist tbody tr').index($(my).closest('tr'));
		var td = $(my).parent();
		var new_item_name = $('option:selected', my).text();
		var new_item_id = $(my).val();
		var pre_item_id = td.siblings(':first').children('.itemid').text();
		var pre_ppID = td.siblings(':first').children('.positionid').text();
		var color_name = td.siblings('.itemcolor_name').text();
		var color_code = td.siblings('.itemsize_name').children('img').attr('alt').split('_')[0];
		var category_id = td.prev().attr('class').split('_')[1];
		var category_name = td.prev().text();

		$.ajax({
			url: './php_libs/dbinfo.php',
			type: 'POST',
			dataType: 'json',
			async: false,
			data: {
				'act': 'changeitem',
				'item_id': new_item_id,
				'size_id': size_id,
				'color_name': color_name,
				'curdate': mypage.prop.firmorderdate
			},
			success: function (r) {
				if (r instanceof Array) {
					if (r[0] == '') {
						$(my).val(pre_item_id);
						alert('�ѹ��Ǥ��ޤ��󡣥��顼�ȥ��������ǧ���Ʋ�������');
						return;
					}
					if (!mypage.checkStorage(master_id, size_id, r[0]['master_id'], [r[0]['color_code'], r[0]['maker'], new_item_name], 'master')) {
						$(my).val(pre_item_id);
						alert('Ʊ�����顼�Υ����ƥब���뤿�ᡢ�ѹ��Ǥ��ޤ���');
						return;
					}
					var new_ppID = r[0]['position_id'];
					mypage.prop.modified = true;

					var flg_id = false;
					var flg_ppid = false;
					$('#orderlist tbody tr').each(function (index) {
						var id = $(this).children('td:eq(0)').children('.itemid').text();
						var ppID = $(this).children('td:eq(0)').children('.positionid').text();
						var cate = $(this).children('td:eq(2)').attr('class').split('_')[1];
						if (id == pre_item_id && myindex != index) flg_id = true;
						if (cate == category_id && ppID == pre_ppID && myindex != index) flg_ppid = true;
					});

					var isPrint = $('#noprint:checked').length == 1 ? 0 : 1;
					var store = mypage.getStorage();
					var list = {
						'act': 'orderlist',
						'ordertype': mypage.prop.ordertype,
						'isprint': isPrint,
						'curdate': mypage.prop.firmorderdate,
						'data' : JSON.stringify(store)
					};

					$.ajax({
						url: './php_libs/dbinfo.php',
						type: 'POST',
						dataType: 'json',
						async: false,
						data: list,
						success: function (r) {
							if (r instanceof Array) {
								mypage.setEstimation(r, false);
								var new_ppID = $('#orderlist tbody tr:eq(' + myindex + ') td:first').children('.positionid').text();

								// �ץ��Ȱ��֤��ɲý���
								if ($('#pp_wrapper span[title="item_' + new_item_id + '"]').length == 0) {
									if ($("#pp_toggler_" + category_id).next().find('.printposition_' + new_ppID).length == 0) {
										$.ajax({
											url: './php_libs/dbinfo.php',
											type: 'POST',
											dataType: 'text',
											async: false,
											data: {
												'act': 'printposition',
												'item_id': new_item_id,
												'curdate': mypage.prop.firmorderdate,
												'ordertype': mypage.prop.ordertype
											},
											success: function (data) {
												$('#pp_toggler_' + category_id).next().append(data);
												$('#pp_wrapper :input').change(function () {
													mypage.prop.modified = true;
												});
											}
										});
									}
									$('#pp_toggler_' + category_id + ' p').append('<span title="item_' + new_item_id + '">' + new_item_name + '</span>');
								}

								// �ץ��Ȱ��֤κ������
								if (!flg_id) {
									var toggle = $('#pp_wrapper span[title="item_' + pre_item_id + '"]').parent();
									//var toggle = $('#item_'+pre_item_id).parent();
									if (toggle.children('span').length == 1) {
										toggle.parent().next().remove();
										toggle.parent().remove();
									} else {
										$('#pp_wrapper span[title="item_' + pre_item_id + '"]').remove();
										if (!flg_ppid && pre_ppID != new_ppID) toggle.parent().next().find('.printposition_' + pre_ppID).remove();
									}
								}

								if (mypage.prop.ordertype == "general") {
									mypage.calcPrintFee();
								}
							}
						}
					});
				} else {
					alert('Error: p1318\n' + r);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error: p1322\n' + textStatus + '\n' + errorThrown);
			}
		});
	},
	changeValue: function (my) {
		/*
		 *	���ƥ���ȥ����ƥ�Υ��쥯���ѹ����٥��
		 */
		var myid = my.parentNode.id;
		switch (myid) {
			case 'categoryIs':
				var current_id = my.options[my.selectedIndex].value;
				if (current_id == 0 || current_id >= 99) {
					$.ajax({
						url: './php_libs/dbinfo.php',
						type: 'POST',
						dataType: 'text',
						async: false,
						data: {
							'act': 'size',
							'item_id': current_id,
							'ordertype': mypage.prop.ordertype,
							'curdate': mypage.prop.firmorderdate
						},
						success: function (r) {
							$('#size_table').html(r);
						}
					});
					if (current_id == 0 || current_id == 100) {
						$('#itemIs').html('<input type="text" value="" size="36" />');
						$('#stock_number, #maker').removeAttr('readonly').removeClass('readonly');
					} else {
						$('#itemIs').html('<input type="text" value="ž�̥�����" size="36" readonly="readonly" />');
						$('#stock_number, #maker').hide();
					}
					$('#itemcolor_name').removeAttr('readonly').removeClass('readonly');
					mypage.setItemInfo(',0,,0,0,,0,0');
				} else {
					$('#stock_number, #maker').show();
					$('#itemcolor_name, #stock_number, #maker').attr('readonly', 'readonly').addClass('readonly');
					$.ajax({
						url: './php_libs/set_tablelist.php',
						type: 'POST',
						dataType: 'text',
						async: false,
						data: {
							'act': 'item',
							'current_id': current_id,
							'curdate': mypage.prop.firmorderdate
						},
						success: function (r) {
							$('#itemIs').html('<select id="item_selector" onchange="mypage.changeValue(this)">' + r + '</select>');
							var item_id = $('#item_selector').val();
							mypage.changeColorcode(item_id, '');
						}
					});
				}
				break;

			case 'itemIs':
				var item_id = my.options[my.selectedIndex].value;
				mypage.changeColorcode(item_id, '');
				break;
		}
	},
	showInkcolor: function (my) {
		mypage.screenOverlay(true);
		mypage.prop.curr_inkcolor = my;
		var offsetY = $(document).scrollTop() + 200;
		var palettename = arguments.length == 1 ? 'inkcolor' : arguments[1];
		$('#inkcolor_list').load('./txt/' + palettename + '_palette.txt',
			function () {
				$("#inkcolor_table").tablesorter({
					sortList: [[0, 0]],
					headers: {
						0: {
							sorter: "digit"
						}
					}
				});
				$('#inkcolor_wrapper').css({
					'top': offsetY + 'px'
				}).fadeIn();
			}
		);
	},
	changeInkcolor: function (my) {
		var code = $(my).children('td:eq(0)').text().toLowerCase();
		var inkname = $(my).children('td:eq(1)').text();
		var self = mypage.prop.curr_inkcolor;
		if (code == 'c00') {
			self.attr({
				'src': './img/undefined.gif',
				'alt': code
			});
			self.next().removeAttr('readonly').val('');
		} else {
			self.attr({
				'src': './img/inkcolor/' + code + '.png',
				'alt': code
			});
			self.next().attr('readonly', true).val(inkname);
		}

		if (self.siblings('.plus').length > 0) {
			self.siblings('.plus').css('opacity', '1');
			if (self.siblings('.exch_vol').val() != '0') {
				mypage.calcExchinkFee();
			}
		} else {
			var row = self.parent('p').index() - 1;
			self.closest('.pp_ink').next('.exch_ink').children('.gall').children('p:eq(' + row + ')').css('visibility', 'visible');
		}

		$('#inkcolor_wrapper').fadeOut();
		mypage.screenOverlay(false);
		mypage.calcPrintFee();
		mypage.prop.modified = true;
	},
	changeCuttingcolor: function (my) {
		var code = $(my).children('td:eq(0)').text().toLowerCase();
		var inkname = $(my).children('td:eq(1)').text();
		var self = mypage.prop.curr_inkcolor;
		if (code == '000') {
			self.attr({
				'src': './img/undefined.gif',
				'alt': code
			});
			self.next().removeAttr('readonly').val('');
		} else {
			self.attr({
				'src': './img/cuttingcolor/' + code + '.png',
				'alt': code
			});
			self.next().attr('readonly', true).val(inkname);
		}

		if (self.siblings('.plus').length > 0) {
			self.siblings('.plus').css('opacity', '1');
			if (self.siblings('.exch_vol').val() != '0') {
				mypage.calcExchinkFee();
			}
		} else {
			var row = self.parent('p').index() - 1;
			self.closest('.pp_ink').next('.exch_ink').children('.gall').children('p:eq(' + row + ')').css('visibility', 'visible');
		}

		$('#inkcolor_wrapper').fadeOut();
		mypage.screenOverlay(false);
		mypage.calcPrintFee();
		mypage.prop.modified = true;
	},
	changeThreadcolor: function (my) {
		var code = $(my).children('td:eq(0)').text().toLowerCase();
		var inkname = $(my).children('td:eq(1)').text();
		var self = mypage.prop.curr_inkcolor;
		if (code == 'c00') {
			self.attr({
				'src': './img/undefined.gif',
				'alt': code
			});
			self.next().removeAttr('readonly').val('');
		} else {
			self.attr({
				'src': './img/inkcolor/' + code + '.png',
				'alt': code
			});
			self.next().attr('readonly', true).val(inkname);
		}

		if (self.siblings('.plus').length > 0) {
			self.siblings('.plus').css('opacity', '1');
			if (self.siblings('.exch_vol').val() != '0') {
				mypage.calcExchinkFee();
			}
		} else {
			var row = self.parent('p').index() - 1;
			self.closest('.pp_ink').next('.exch_ink').children('.gall').children('p:eq(' + row + ')').css('visibility', 'visible');
		}

		$('#inkcolor_wrapper').fadeOut();
		mypage.screenOverlay(false);
		mypage.calcPrintFee();
		mypage.prop.modified = true;
	},
	changeInkcount: function (my) {
		if (my.value == '0') {
			$(my).parents('.pp_info').siblings('.position_reset').click();
		} else if ($(my).attr("max") == "1" && my.value > 1) {
			alert("���Υץ��Ȱ��֤�1������Ǥ���");
		}
		mypage.calcPrintFee();
		mypage.prop.modified = true;
	},
	calcExchinkFee: function () {
		/*
		 *	���󥯿��ؤ���ڤӻɽ����ؤ���η׻��ʰ��̤Τߡ�
		 *	������������ϡ����Ѥ�׻��򤷤ʤ�
		 *	return  ���ؤ���
		 */
		if (mypage.prop.ordertype == "industry") return 0;

		var exch_count = 0;
		var thread_count = 0
		var exchFee = 1000;
		var threadFee = 500;
		$('#pp_wrapper .pp_toggle_body').find('.pp_box').each(function () {
			exch_count += $(this).children('.exch_ink').children('.gall').children('p').children('span').find('input[type="text"]').filter(function () {
				return ($(this).val().trim() != '' && $(this).siblings('.exch_vol').val() != '0') ? 1 : 0;
			}).length;
		});

		if (exch_count > 0) {
			$('#exchink_count').val(exch_count);
		} else {
			exch_count = $('#exchink_count').val() - 0;
			thread_count = $('#exchthread_count').val() - 0;
		}
		$('#est_exchink').text(mypage.addFigure(exchFee * exch_count + threadFee * thread_count));
		if (arguments.length == 0) {
			if (mypage.prop.reuse > 0) {
				mypage.calcPrintFee();
			} else {
				mypage.calcEstimation();
			}
		}
		return exch_count;
	},
	calcPrintFee: function () {
		/*
		 *	�ץ�����η׻��ʰ��̤Τߡ�
		 */
		if (mypage.prop.ordertype == 'industry') { // �ȼԤϥץ�����׻��ʤ�
			mypage.calcEstimation();
			return;
		}
		mypage.prop.isRepeat = false;
		mypage.prop.isRepeatFirst = false;
		mypage.prop.isRepeatCheck = false;

		// �ץ�����ˡ���ȤΥץ����������
		$('#pp_wrapper .pp_toggler').each(function () {
			$(this).find('.sub_price').val('0');
		});
		$('#est_silk_printfee').html('0');
		$('#est_color_printfee').html('0');
		$('#est_digit_printfee').html('0');
		$('#est_inkjet_printfee').html('0');
		$('#est_cutting_printfee').html('0');
		$('#est_embroidery_printfee').html('0');
		$('#est_price').text($('#total_cost').val()); // ������

		if ($('#noprint').is(':checked')) { // �ץ��Ȥʤ�
			$('#est_printfee').val(0);
			$('#itemprint tbody').html('');
			mypage.calcEstimation();
			return;
		}

		var orders_id = $('#order_id').text() - 0;
		var amount = 0;
		var toggler = '';

		if (mypage.prop.applyto == 1) {
			// Self-Design
			const _PALE_COLOR = new Array(0, 2700, 3700);
			const _DARK_COLOR = new Array(0, 3700, 4700);
			var inkjet_palecolor_code = {
				"001": true
			}; // ø��
			var tot_price = 0;
			var item_price = $('#total_cost').val().replace(/,/g, '') - 0;
			var items = {};

			$('#orderlist tbody tr').each(function () {
				if (!$(this).find('.choice').is(':checked')) return true; // continue
				var categoryid = $(this).children('td:eq(2)').attr('class').split('_')[1];
				if (categoryid == 0) return true; // continue
				var item_id = $(this).children('td:eq(0)').children('.itemid').text();
				var ppID = $(this).children('td:eq(0)').children('.positionid').text();
				var vol = $(this).find('.listamount').val().replace(/,/g, '') - 0;
				var color_code = $(this).children('td:last').children('span:first').text().split('_')[1];

				// �����ƥ�Υ��顼���Ȥ�ʬ�ष�ƽ���
				if (typeof items[item_id] == 'undefined') {
					items[item_id] = {
						color_code: {}
					};
					items[item_id][color_code] = {
						'category_id': categoryid,
						'vol': vol,
						'ppID': ppID,
						'printfee': 0
					};
				} else if (typeof items[item_id][color_code] == 'undefined') {
					items[item_id][color_code] = {
						'category_id': categoryid,
						'vol': vol,
						'ppID': ppID,
						'printfee': 0
					};
				} else {
					items[item_id][color_code]['vol'] += vol;
				}
				amount += vol;
			});

			if (amount > 0) {
				for (var item_id in items) {
					for (var color_code in items[item_id]) {
						var item = items[item_id][color_code];
						toggler = $('#pp_toggler_' + item['category_id']);
						var target = toggler.next().children('.printposition_' + item['ppID']);
						var countPosition = 0;
						var print_type = "";
						target.children('.pp_box').each(function () {
							var pos = $(this).children('.pp_image').children('img:not(:nth-child(1))').filter(function () {
								var src = $(this).attr('src');
								return src.match(/_on.png$/);
							}).length;
							if (pos == 0) return true; // continue
							var ppInfo = $(this).children('.pp_info');
							print_type = ppInfo.find('.print_type').val();
							if (print_type == 'silk' && ppInfo.find('.ink_count').val() == 0) return true; // continue
							countPosition += pos;
						});
						if (countPosition == 0) continue;
						if (countPosition > 2) countPosition = 2;

						if (item_id == 4 && print_type == "inkjet") {
							// 085-cvt�ǳ�ĥ��󥯥����åȤξ��
							if (inkjet_palecolor_code[color_code]) {
								tot_price += item['vol'] * _PALE_COLOR[countPosition];
							} else {
								tot_price += item['vol'] * _DARK_COLOR[countPosition];
							}
						} else {
							tot_price += item['vol'] * _PALE_COLOR[countPosition];
						}
					}
				}
			}
			if (tot_price > 0) {
				$('#est_printfee').val(mypage.addFigure(tot_price - item_price));
			} else {
				$('#est_printfee').val(0);
			}
			mypage.calcEstimation();
		} else {
			// �̾�

			// 2017-05-25 ���顢�ץ�����׻��λ����ѹ���ν�����Ŭ��
			var changeVerTime = Date.parse(mypage.prop.spec_v2);
			var curDateTime = isNaN(Date.parse(mypage.prop.acceptingdate)) ? Date.now() : Date.parse(mypage.prop.acceptingdate.replace(/-/g, "/"));
			if (changeVerTime <= curDateTime) {
				mypage.calcPrintFeeVer2();
				return;
			}


			var est_printfee = 0;
			var est_silk_printfee = 0;
			var est_color_printfee = 0;
			var est_digit_printfee = 0;
			var est_inkjet_printfee = 0;
			var est_cutting_printfee = 0;

			// ����򽸷�
			var itemprintfee = {};
			var ca = {};
			$('#orderlist tbody tr').each(function () {
				if (!$(this).find('.choice').is(':checked')) return true; // continue
				var item_id = 0;
				var itemname = '';
				var cost = $(this).find('.subtotal').text().replace(/,/g, '') - 0;
				var vol = $(this).find('.listamount').val().replace(/,/g, '') - 0;
				var categoryid = $(this).children('td:eq(2)').attr('class').split('_')[1];
				if (categoryid == 0 || categoryid == 100) { // ����¾�Ȼ���
					item_id = $(this).children('td:eq(0)').children('.itemid').text().split('_')[0];
					itemname = $(this).find('.item_selector').text();
				} else {
					var ppID = $(this).children('td:eq(0)').children('.positionid').text();
					var ratioID = $(this).children('td:eq(0)').children('.ratioid').text();
					var plates = $(this).find('.plateis').val();
					var cost = $(this).find('.subtotal').text().replace(/,/g, '') - 0;
					item_id = $(this).children('td:eq(0)').children('.itemid').text();
					itemname = $(this).find('.item_selector').children('select').children('option:selected').text();

					if (typeof ca[ratioID] == 'undefined') {
						ca[ratioID] = {};
						ca[ratioID][plates] = {};
						ca[ratioID][plates][categoryid] = {};
						ca[ratioID][plates][categoryid][ppID] = {
							'item_id': [],
							'vol': vol
						};
						ca[ratioID][plates][categoryid][ppID]['item_id'][item_id] = vol;
					} else if (typeof ca[ratioID][plates] == 'undefined') {
						ca[ratioID][plates] = {};
						ca[ratioID][plates][categoryid] = {};
						ca[ratioID][plates][categoryid][ppID] = {
							'item_id': [],
							'vol': vol
						};
						ca[ratioID][plates][categoryid][ppID]['item_id'][item_id] = vol;
					} else if (typeof ca[ratioID][plates][categoryid] == 'undefined') {
						ca[ratioID][plates][categoryid] = {};
						ca[ratioID][plates][categoryid][ppID] = {
							'item_id': [],
							'vol': vol
						};
						ca[ratioID][plates][categoryid][ppID]['item_id'][item_id] = vol;
					} else if (typeof ca[ratioID][plates][categoryid][ppID] == 'undefined') {
						ca[ratioID][plates][categoryid][ppID] = {
							'item_id': [],
							'vol': vol
						};
						ca[ratioID][plates][categoryid][ppID]['item_id'][item_id] = vol;
					} else if (typeof ca[ratioID][plates][categoryid][ppID]['item_id'][item_id] == 'undefined') {
						ca[ratioID][plates][categoryid][ppID]['vol'] += vol;
						ca[ratioID][plates][categoryid][ppID]['item_id'][item_id] = vol;
					} else {
						ca[ratioID][plates][categoryid][ppID]['vol'] += vol;
						ca[ratioID][plates][categoryid][ppID]['item_id'][item_id] += vol;
					}
					amount += vol;
				}
				// �����ƥ���Υץ����彸����
				if (typeof itemprintfee[item_id] == 'undefined') {
					itemprintfee[item_id] = {
						'vol': vol,
						'fee': 0,
						'name': itemname,
						'cost': cost
					};
				} else {
					itemprintfee[item_id]['vol'] += vol;
					itemprintfee[item_id]['cost'] += cost;
				}
			});

			if (amount == 0) {
				if (!$('#free_printfee').is(':checked')) $('#est_printfee').val(0);
				// �����ƥ���Υץ�����򽸷�
				var tr = '';
				for (var item_id in itemprintfee) {
					tr += '<tr class="itemid_' + item_id + '">';
					tr += '<td>' + itemprintfee[item_id]['name'] + '</td>';
					tr += '<td class="toright volume">' + itemprintfee[item_id]['vol'] + '</td>';
					tr += '<td class="toright cost">' + mypage.addFigure(itemprintfee[item_id]['cost']) + '</td>';
					tr += '<td class="toright fee">' + mypage.addFigure(itemprintfee[item_id]['fee']) + '</td>';
					tr += '<td class="toright perone">' + mypage.addFigure(Math.ceil(itemprintfee[item_id]['fee'] / itemprintfee[item_id]['vol'])) + '</td>';
					tr += '<td class="toright subtot">' + mypage.addFigure(Math.ceil((itemprintfee[item_id]['cost'] + itemprintfee[item_id]['fee']) / itemprintfee[item_id]['vol'])) + '</td>';
					tr += '</tr>';
				}
				$('#itemprint tbody').html(tr);
				mypage.calcEstimation();
				return;
			}

			/*
			 *	bit�黻�ǥ�ԡ��ȥ����פ�Ƚ��
			 *	1:����ȥǥ��������������塢��������1�礢����ñ������ˤ���
			 *	2:����ȥǥ�����������
			 *	99:����ȥǥ������������ʴ���Ʊ���Ǥǥץ��Ȥ���Ƥ������
			 *	repeat �ǡ��ǥ�����10�ʿ�
			 *	0    1    1    3
			 *	1    0    0    0
			 *	2    0    0    0
			 */
			var repeatType = [3, 0, 0]; // ź������repeat����ID������� 
			var repeatID = [1, 99, 0]; // �ӥåȱ黻�η�̤�repeat����ID�������
			var repeat = 0;

			var repeat_all_check = true; // ��ԡ��ȥ����å������ƥ����å���true
			var repeat_digit_check = true; // �ǥ�����ž�̤Υ�ԡ��ȥ����å������ƥ����å���true
			var repeat_trans_check = true; // ���顼ž�̤Υ�ԡ��ȥ����å������ƥ����å���true
			var repeat_check = false; // ���륯�����åƥ��󥰡����󥯥����åȤΥ�ԡ����ǥ����å��ܥå����ξ��֡�1�ĤǤ�����å��������true

			// ʣ���γ�����Ʊ���ץ��Ȱ��֡ʥǥ�����ˤ���Ѥ��Ƥ��뤫�ɤ�����Ƚ����
			var plate_check = {
				'silk': [],
				'inkjet': [],
				'darkinkjet': [],
				'cutting': [],
				'digit': [],
				'trans': [],
				'darktrans': []
			};
			plate_check['silk'] = [{}, {}, {}, {}, {}];
			plate_check['inkjet'] = [{}, {}, {}, {}, {}];
			plate_check['darkinkjet'] = [{}, {}, {}, {}, {}];
			plate_check['cutting'] = [{}, {}, {}, {}, {}];
			plate_check['digit'] = [{}, {}, {}, {}, {}];
			plate_check['trans'] = [{}, {}, {}, {}, {}];
			plate_check['darktrans'] = [{}, {}, {}, {}, {}];

			var itemid = [];
			var ink_count = [];
			var print_size = [];
			var print_name = [];
			var print_area = [];
			var print_amount = [];
			var print_ratio = [];
			var extra_ratio = [];
			var repeat_type = [];
			var plate_type = [];
			var print_pos = [];
			var setting_group = []; // Ʊ�����դ��ǥץ��Ȥ��륢���ƥ෴

			// �ץ��ȳ���Ψ���Ȥ˽���
			for (var ratioID in ca) {

				// �ǥ�������ǡˤ��Ȥ˷׻�
				for (var plate in ca[ratioID]) {

					// ���ƥ��꡼����
					for (var categoryid in ca[ratioID][plate]) {

						// ����ID����
						for (var ppID in ca[ratioID][plate][categoryid]) {
							var cur_item = ca[ratioID][plate][categoryid][ppID];
							var volume = cur_item['vol'] - 0;
							toggler = $('#pp_toggler_' + categoryid);
							toggler.next().children().each(function () {
								// ����¾�Ȼ����Ͻ���
								if ($(this).attr('class').split('_')[1] != ppID) return true; // continue

								// �ץ��Ȱ��֤���
								$(this).children('.pp_box').each(function () {
									var ppInfo = $(this).children('.pp_info');
									if (plate != ppInfo.find('.designplate').val()) return true; // continue

									var ink = '0';
									var shot = '0';
									var print_type = ppInfo.find('.print_type').val();
									var area = $(this).children('.pp_image').children('img:not(:nth-child(1))');
									var count = 0;
									var extra = 1;
									var posname_class = ''; // �ץ��Ȱ��֤Υ��饹̾
									var pos_name = ''; // �ץ��Ȱ��֤�̾��

									for (var i = 0; i < area.length; i++) {
										if (($(area[i]).attr('src')).match(/_on.png$/)) {
											count = 1;
											posname_class = $(area[i]).attr('class');
											pos_name = $(area[i]).attr('alt');
											if (categoryid == 2 && (posname_class == "mae_hood" || posname_class == "hood_left" || posname_class == "hood_right")) {
												extra = 1.5;
											}
											if (categoryid == 2 && (posname_class == "parker_mae_pocket" || posname_class == "parker_mae_mini_zip" ||
													posname_class == "jacket_mae_mini" || posname_class == "osiri" || posname_class == "pants_osiri")) {
												extra = 2;
											}
											break;
										}
									}
									if (count == 0) return true; // continue

									switch (print_type) {
										case 'silk':
											ink = ppInfo.find('.ink_count').val();
											shot = ppInfo.find('.jumbo_plate:checked').val(); // �������ǻ���
											break;
										case 'inkjet':
											if (ppInfo.find('.inkoption').val() == '1') {
												print_type = 'dark' + print_type;
											}
											shot = ppInfo.find('.areasize_id').val();
											break;
										case 'cutting':
											shot = ppInfo.find('.areasize_id').val();
											break;
										case 'embroidery':
											return true; // continue
											break;
										default:
											if (print_type == "trans" && ppInfo.find('.inkoption').val() == '1') {
												print_type = 'dark' + print_type;
											}
											shot = ppInfo.find('.areasize_id').val();
											break;
									}

									if (count == 1 && !(ink == '0' && print_type == "silk")) { // �ץ��Ȼ��꤬������
										print_area.push(count);
										extra_ratio.push(extra);
										ink_count.push(ink);
										print_size.push(shot);
										print_name.push(print_type);
										print_amount.push(volume);
										print_ratio.push(ratioID);
										plate_type.push(plate);
										print_pos.push(pos_name);

										// ��ԡ��ȥ����å�
										if ($(this).find('.repeat_check').is(':checked')) {
											mypage.prop.isRepeatCheck = true;
											if ((print_type == 'silk' || print_type == 'inkjet' || print_type == 'darkinkjet' || print_type == 'cutting')) repeat_check = true;
											repeat = 1;
										} else {
											repeat_all_check = false;
											repeat = 0;

											// ž�̤Υ�ԡ����ǳ�Ŭ�Ѥγ�ǧ
											if (print_type == 'digit') {
												repeat_digit_check = false;
											} else if (print_type == 'trans' || print_type == 'darktrans') {
												repeat_trans_check = false;
											}
										}

										var items = [];
										for (var id in cur_item['item_id']) {
											items.push(id + '|' + cur_item['item_id'][id]); // �����ƥ�ID | ���
										}
										itemid.push(items.join(','));

										var repeat_id = 0;
										pos_name += ratioID;
										if (print_type == 'silk' || print_type == 'inkjet' || print_type == 'darkinkjet' || print_type == 'cutting') {
											if (categoryid == 7) {
												repeat_id = repeatID[repeatType[repeat] & 2]; // ����åפϾ�������׾夹���0 or 1��
											} else if (categoryid == 1 || ppID.match(/^(1|2|3|4|5|36|54|55|56|57|12|13|14|15|63|64|65|66|41|42)$/)) {
												// T����ĤȰ���������Ʊ���ץ��Ȱ��ֻ��꤬���Ǥˤ���������դ�������
												if (Object.keys(plate_check[print_type][plate]).length === 0 || typeof plate_check[print_type][plate][pos_name] == 'undefined') {
													repeat_id = repeatID[repeatType[repeat] & 2]; // ��0 or 1��
												} else if (plate_check[print_type][plate][pos_name] == 2) {
													repeat_id = 99; // ����ȥǥ�����������դ���򺹰���
												} else {
													repeat_id = repeatID[repeatType[repeat] & 0]; // ����ȥǥ�������򺹰���(1)
												}
												plate_check[print_type][plate][pos_name] = 2; // ���դ���η׾��1��
												setting_group.push(pos_name);
											} else if (categoryid == 2 || ppID.match(/^(7|10|47|48)$/)) {
												// �ѡ������ΰ��������ʥա��ɤؤΥץ��Ȳ��ݡˤ�Ʊ���ץ��Ȱ��ֻ��꤬���Ǥˤ���������դ�������
												if (Object.keys(plate_check[print_type][plate]).length === 0 || typeof plate_check[print_type][plate][pos_name] == 'undefined') {
													repeat_id = repeatID[repeatType[repeat] & 2]; // ��0 or 1��
												} else if (plate_check[print_type][plate][pos_name] == 2) {
													repeat_id = 99; // ����ȥǥ�����������դ���򺹰���
												} else {
													repeat_id = repeatID[repeatType[repeat] & 0]; // ����ȥǥ�������򺹰���(1)
												}
												plate_check[print_type][plate][pos_name] = 2; // ���դ���η׾��1��
												setting_group.push(pos_name);
											} else if (typeof plate_check[print_type][plate][pos_name] == 'undefined') {
												repeat_id = repeatID[repeatType[repeat] & 2]; // ��0 or 1��
												plate_check[print_type][plate][pos_name] = 1; // ���դ���ϲսꤴ�Ȥ˷׾�
												setting_group.push('');
											} else {
												repeat_id = repeatID[repeatType[repeat] & 0]; // ����ȥǥ�������򺹰���(1)
												setting_group.push('');
											}
											repeat_type.push(repeat_id);
										} else {
											// ž��
											if (categoryid == 1 || ppID.match(/^(1|2|3|4|5|36|54|55|56|57|12|13|14|15|63|64|65|66|41|42)$/)) {
												// T����ĤȰ���������Ʊ���ץ��Ȱ��ֻ��꤬���Ǥˤ�����ϥץ쥹����������
												if (Object.keys(plate_check[print_type][plate]).length === 0 || typeof plate_check[print_type][plate][pos_name] == 'undefined') {
													repeat_id = repeat;

												} else {
													// �ץ쥹������򺹰���
													if (repeat == 0) {
														repeat_id = 990; // ����
													} else {
														repeat_id = 991; // �����
													}
												}
												plate_check[print_type][plate][pos_name] = 2; // ���դ���η׾��1��
											} else if (categoryid == 2 || ppID.match(/^(7|10|47|48)$/)) {
												// �ѡ������ΰ��������ʥա��ɤؤΥץ��Ȳ��ݡˤ�Ʊ���ץ��Ȱ��ֻ��꤬���Ǥˤ�����ϥץ쥹����������
												if (Object.keys(plate_check[print_type][plate]).length === 0 || typeof plate_check[print_type][plate][pos_name] == 'undefined') {
													repeat_id = repeat;
												} else {
													// �ץ쥹������򺹰���
													if (repeat == 0) {
														repeat_id = 990; // ����
													} else {
														repeat_id = 991; // �����
													}
												}
												plate_check[print_type][plate][pos_name] = 2; // ���դ���η׾��1��
											} else if (typeof plate_check[print_type][plate][pos_name] == 'undefined') {
												repeat_id = repeat;
												plate_check[print_type][plate][pos_name] = 1; // ���դ���ϲսꤴ�Ȥ˷׾�
											} else {
												repeat_id = repeat;
											}
											repeat_type.push(repeat_id);
											setting_group.push('');
										}
									}
								});
							});
						}
					}
				}
			}

			if (plate_type.length > 0) {

				// ž�̤ǥ�ԡ��ȥ����å�������Ƥ��볨�����������ž�̤Υ�ԡ����ǳ��Ŭ�Ѥ��ʤ�
				for (var i = 0; i < print_name.length; i++) {
					if ((print_name[i] == 'digit' && repeat_digit_check == false) || ((print_name[i] == 'trans' || print_name[i] == 'darktrans') && repeat_trans_check == false)) {
						if (repeat_type[i] == 991 || repeat_type[i] == 990) {
							repeat_type[i] = 990;
						} else {
							repeat_type[i] = 0;
						}
					} else {
						if ((print_name[i] == 'silk' || print_name[i] == 'inkjet' || print_name[i] == 'darkinkjet' || print_name[i] == 'cutting')) {
							if (repeat_check) mypage.prop.isRepeat = true;
						} else {
							mypage.prop.isRepeat = true; // ž�̤����ƥ����å�
						}
					}
				}

				if ($('#free_printfee').is(':checked')) { // �ץ����夬������
					$('#itemprint tbody').html('');
					mypage.calcEstimation();
					return;
				}

				var postData = {
					'act': 'printfee',
					'pos': print_pos,
					'name': print_name,
					'area': print_area,
					'ink': ink_count,
					'size': print_size,
					'plates': plate_type,
					'amount': print_amount,
					'ratio': print_ratio,
					'extra': extra_ratio,
					'item_id': itemid,
					'repeat': repeat_type,
					'setting': setting_group,
					'curdate': mypage.prop.acceptingdate
				};
				$.ajax({
					url: './php_libs/estimation.php',
					type: 'POST',
					dataType: 'json',
					data: postData,
					async: false,
					success: function (r) {
						if (r instanceof Array) {
							est_printfee += r[0]['tot'];
							est_silk_printfee += r[0]['silk'];
							est_color_printfee += (r[0]['trans'] - 0) + (r[0]['darktrans'] - 0);
							est_digit_printfee += r[0]['digit'];
							est_inkjet_printfee += (r[0]['inkjet'] - 0) + (r[0]['darkinkjet'] - 0);
							est_cutting_printfee += r[0]['cutting'];
							$('.pp_toggler', '#pp_wrapper').each(function () {
								var subprice = 0;
								$(this).find('.title').children('span').each(function () {
									var itemid = $(this).attr('title').split('_')[1];
									var itemname = $(this).text();
									if (typeof r[0]['item'][itemid] != 'undefined') {
										var fee = r[0]['item'][itemid]['fee'] - 0;
										subprice += fee;
										itemprintfee[itemid]['fee'] += fee;
									}
								});
								if (subprice > 0) {
									var tmp = subprice + ($(this).find('.sub_price').val().replace(/,/g, '') - 0);
									$(this).find('.sub_price').val(mypage.addFigure(tmp));
								}
							});
						} else {
							alert('Error: p1857\n' + r);
						}
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						alert('Error: p1861\n' + textStatus + '\n' + errorThrown);
					}
				});
			}

			// �����Ŭ�Ѿ����ǧ
			if (repeat_all_check && mypage.prop.repeat > 0 && mypage.prop.reuse == 1 && !$('#free_printfee').is(':checked')) {
				mypage.prop.isRepeatFirst = true;
				var target_item = {};
				// �Ǹ���̵�������ƥ��̵ͭ���ǧ
				$.ajax({
					url: './php_libs/ordersinfo.php',
					async: false,
					dataType: 'json',
					data: {
						'act': 'search',
						'mode': 'orderitemlist',
						'field1[]': ['orders_id'],
						'data1[]': [mypage.prop.repeat]
					},
					success: function (r) {
						if (r instanceof Array) {
							var base_item = {};
							for (var i = 0; i < r.length; i++) {
								if (typeof base_item[r[i]['item_id']] == 'undefined') base_item[r[i]['item_id']] = [];
								base_item[r[i]['item_id']].push(r[i]['color_code']);
								if (r[i]['item_id'] == 0 || r[i]['item_id'] >= 99999) { // �Ǹ��ˡ֤���¾�סֻ����פ�����
									mypage.prop.isRepeatFirst = false;
									break;
								}
							}

							if (mypage.prop.isRepeatFirst == true) {
								$('#orderlist tbody tr').each(function () {
									if (!$(this).find('.choice').is(':checked')) return true; // continue
									var categoryid = $(this).children('td:eq(2)').attr('class').split('_')[1];
									var item_id = $(this).children('td:eq(0)').children('.itemid').text();
									var color_code = $(this).children('td:last').children('span:first').text().split('_')[1];
									if (categoryid == 0 || typeof base_item[item_id] == 'undefined') {
										mypage.prop.isRepeatFirst = false;
										return false; // break
									}
									if (base_item[item_id].indexOf(color_code) == -1) {
										mypage.prop.isRepeatFirst = false; // �Ǹ��ˤʤ������ƥ५�顼������
										return false; // break
									}
									target_item[item_id] = true;
								});
							}
						} else {
							alert('Error: p1902\n' + r);
						}
					}
				});

				// �Ǹ���̵���ץ��Ȥ�̵ͭ���ǧ
				if (mypage.prop.isRepeatFirst == true) {
					$.ajax({
						url: './php_libs/ordersinfo.php',
						async: false,
						dataType: 'json',
						data: {
							'act': 'search',
							'mode': 'orderprint',
							'field1[]': ['orders_id'],
							'data1[]': [mypage.prop.repeat]
						},
						success: function (r) {
							if (r instanceof Array) {
								var base_len = r.length; // �Ǹ��Υץ��Ȳս��
								var repeat_len = 0; // ��ԡ�����ʸ�Υץ��Ȳս��
								if (base_len == 0) {
									mypage.prop.isRepeatFirst = false; // �ץ��Ⱦ��󤬤ʤ�
									return;
								}

								if (r[0]['noprint'] == 1 || r[0]['free_printfee'] == 1) {
									mypage.prop.isRepeatFirst = false; // �Ǹ����ץ��Ȥʤ����ץ���������Ϥξ��
									return;
								}

								// ����ϡ����󥯿��ؤ��ο����Ǹ����¿������Ŭ�Ѥ��ʤ�
								if (r[0]['exchink_count'] < $('#exchink_count').val()) {
									mypage.prop.isRepeatFirst = false;
								}

								var base_item = [];
								for (var i = 0; i < r.length; i++) {
									base_item[i] = {
										'design_plate': r[i]['design_plate'],
										'print_type': r[i]['print_type'],
										'ink_count': r[i]['ink_count'],
										'jumbo_plate': r[i]['jumbo_plate'],
										'areasize_id': r[i]['areasize_id'],
										'selective_key': r[i]['selective_key'],
										'print_option': r[i]['print_option'],
										'ppID': r[i]['printposition_id']
									};
								}

								// ���󥯾���
								var base_ink = [];
								$.ajax({
									url: './php_libs/ordersinfo.php',
									async: false,
									dataType: 'json',
									data: {
										'act': 'search',
										'mode': 'orderink',
										'field1[]': ['orders_id'],
										'data1[]': [mypage.prop.repeat]
									},
									success: function (r) {
										for (var i = 0; i < r.length; i++) {
											if (typeof base_ink[r[i]['areaid']] == 'undefined') base_ink[r[i]['areaid']] = [];
											base_ink[r[i]['areaid']].push(r[i]);

										}
									}
								});

								$('.pp_toggler', '#pp_wrapper').each(function () {
									var enable_len = $(this).children('.title').children('span').filter(function () {
										var itemid = $(this).attr('title').split('_')[1];
										return typeof target_item[itemid] != 'undefined';
									}).length;
									if (enable_len == 0) return true; // continue;

									$(this).next().children().each(function () {
										var ppID = $(this).attr('class').split('_')[1];
										$(this).children('.pp_box').each(function () {
											var pos = '';
											var area = $(this).children('.pp_image').children('img:not(:nth-child(1))');
											for (var i = 0; i < area.length; i++) {
												if (($(area[i]).attr('src')).match(/_on.png$/)) {
													pos = $(area[i]).attr('class');
													break;
												}
											}
											if (pos == '') return true; // continue

											repeat_len++;

											var area_name = $(this).children('.position_name_wrapper').children('.current').find('span').text();
											var ppInfo = $(this).children('.pp_info');
											var ppInk = $(this).children('.pp_ink');
											var design = ppInfo.find('.designplate').val();
											var print_type = ppInfo.find('.print_type').val();
											var inkcount = 0;
											var jumbo = 0;
											var size = 0;
											var option = 0;
											// var isExist = false;	// ��ԡ��ȳ��Ƚ��
											var isFirst = false; // �����Ƚ��
											var ink = []; // �����Ƚ���ѡ����������Υ��󥯻���
											var isInkLen = false; // �����Ƚ���ѡ����󥯻���ο���Ƚ��
											var isExistInk = false; // �����Ƚ���ѡ����󥯿�̾��Ƚ��
											switch (print_type) {
												case 'silk':
													inkcount = ppInfo.find('.ink_count').val();
													jumbo = ppInfo.find('.jumbo_plate:checked').val();
													for (var i = 0; i < base_item.length; i++) {
														if (base_item[i]['design_plate'] == design && base_item[i]['print_type'] == print_type) {
															if (base_item[i]['ink_count'] == inkcount && base_item[i]['jumbo_plate'] == jumbo) {
																// isExist = true;

																// �����Ƚ��
																if (mypage.prop.isRepeatFirst == false) continue;
																if (base_item[i]['selective_key'] == pos && base_item[i]['ppID'] == ppID) {
																	isFirst = true;
																	// ���󥯻���
																	ink = [];
																	ppInk.children('p').each(function () {
																		var ink_name = $(this).children('input[type="text"]:eq(1)').val();
																		if (ink_name != "") {
																			ink.push(ink_name);
																		}
																	});

																	// �Ǹ��Υ��󥯤����
																	isInkLen = false;
																	for (var areaid in base_ink) {
																		if (base_ink[areaid].length != ink.length) continue;
																		isInkLen = true;
																		if (base_ink[areaid][0]['selective_key'] != pos || base_ink[areaid][0]['area_name'] != area_name) continue;

																		for (var j = 0; j < ink.length; j++) {
																			isExistInk = false;
																			for (var t = 0; t < base_ink[areaid].length; t++) {
																				if (ink[j] == base_ink[areaid][t]['ink_name']) isExistInk = true;
																			}
																			if (isExistInk == false) mypage.prop.isRepeatFirst = false; // ����̾���㤦
																		}
																	}
																	if (isInkLen == false) mypage.prop.isRepeatFirst = false; // ���󥯻���ο����㤦
																}
															}
														}
													}
													if (isFirst == false) mypage.prop.isRepeatFirst = false; // Ʊ���ץ��Ȳս꤬�ʤ�
													break;
												case 'inkjet':
												case 'trans':
													option = ppInfo.find('.inkoption').val();

												default:
													size = ppInfo.find('.areasize_id').val();
													for (var i = 0; i < base_item.length; i++) {
														if (base_item[i]['design_plate'] == design && base_item[i]['print_type'] == print_type) {
															if (base_item[i]['areasize_id'] == size) {

																// �����Ƚ��
																if (mypage.prop.isRepeatFirst == false) continue;
																if (base_item[i]['selective_key'] == pos && base_item[i]['ppID'] == ppID && base_item[i]['print_option'] == option) {
																	isFirst = true;
																	// ���åƥ��󥰤Υ��󥰤Υ���
																	if (print_type == 'cutting') {
																		ink = [];
																		ppInk.children('p').each(function () {
																			var ink_name = $(this).children('input[type="text"]:eq(1)').val();
																			if (ink_name != "") {
																				ink.push(ink_name);
																			}
																		});

																		// �Ǹ��Υ��󥯤����
																		isInkLen = false;
																		for (var areaid in base_ink) {
																			if (base_ink[areaid].length != ink.length) continue;
																			isInkLen = true;
																			if (base_ink[areaid][0]['selective_key'] != pos || base_ink[areaid][0]['area_name'] != area_name) continue;

																			for (var j = 0; j < ink.length; j++) {
																				isExistInk = false;
																				for (var t = 0; t < base_ink[areaid].length; t++) {
																					if (ink[j] == base_ink[areaid][t]['ink_name']) isExistInk = true;
																				}
																				if (isExistInk == false) mypage.prop.isRepeatFirst = false; // ����̾���㤦
																			}
																		}
																		if (isInkLen == false) mypage.prop.isRepeatFirst = false; // ���󥯻���ο����㤦
																	}
																}
															}
														}
													}
													if (isFirst == false) mypage.prop.isRepeatFirst = false; // Ʊ���ץ��Ȳս��Ʊ�����ץ������꤬�ʤ�
													break;
											}
											if (mypage.prop.isRepeatFirst == false) return false; // break;
										});
										if (mypage.prop.isRepeatFirst == false) return false; // break;
									});
									if (mypage.prop.isRepeatFirst == false) return false; // break;
								});
								if (base_len < repeat_len) mypage.prop.isRepeatFirst = false; // �ץ��Ȳս�����Ǹ��ʲ�
							} else {
								alert('Error: p2135\n' + r);
							}
						}
					});
				}
			}

			// �����ƥ���Υץ�����򽸷�
			var tr = '';
			for (var item_id in itemprintfee) {
				tr += '<tr class="itemid_' + item_id + '">';
				tr += '<td>' + itemprintfee[item_id]['name'] + '</td>';
				tr += '<td class="toright volume">' + itemprintfee[item_id]['vol'] + '</td>';
				tr += '<td class="toright cost">' + mypage.addFigure(itemprintfee[item_id]['cost']) + '</td>';
				tr += '<td class="toright fee">' + mypage.addFigure(itemprintfee[item_id]['fee']) + '</td>';
				tr += '<td class="toright perone">' + mypage.addFigure(Math.ceil(itemprintfee[item_id]['fee'] / itemprintfee[item_id]['vol'])) + '</td>';
				tr += '<td class="toright subtot">' + mypage.addFigure(Math.ceil((itemprintfee[item_id]['cost'] + itemprintfee[item_id]['fee']) / itemprintfee[item_id]['vol'])) + '</td>';
				tr += '</tr>';
			}
			$('#itemprint tbody').html(tr);

			// ���ѥܥå����ν�
			$('#est_printfee').val(mypage.addFigure(est_printfee));
			$('#est_silk_printfee').html(mypage.addFigure(est_silk_printfee));
			$('#est_color_printfee').html(mypage.addFigure(est_color_printfee));
			$('#est_digit_printfee').html(mypage.addFigure(est_digit_printfee));
			$('#est_inkjet_printfee').html(mypage.addFigure(est_inkjet_printfee));
			$('#est_cutting_printfee').html(mypage.addFigure(est_cutting_printfee));
			$('#est_price').html($('#total_cost').val());
			mypage.calcEstimation();
		}

	},
	calcPrintFeeVer2: function () {
		/*
		 * �ץ�����׻��λ����ѹ���ν���
		 * ��С����������ϲ��̤��б�
		 */
		var orders_id = $('#order_id').text() - 0;
		var amount = 0;
		var est_printfee = 0;
		var est_silk_printfee = 0;
		var est_color_printfee = 0;
		var est_digit_printfee = 0;
		var est_inkjet_printfee = 0;
		var est_cutting_printfee = 0;
		var est_embroidery_printfee = 0;
		var repeat_all_check = true; // ��ԡ��ȥ����å������ƥ����å���true
		var repeat_digit_check = true; // �ǥ�����ž�̤Υ�ԡ��ȥ����å������ƥ����å���true
		var repeat_trans_check = true; // ���顼ž�̤Υ�ԡ��ȥ����å������ƥ����å���true
		var repeat_check = false; // ���륯�����åƥ��󥰡����󥯥����åȡ��ɽ��Υ�ԡ����ǥ����å��ܥå����ξ��֡�1�ĤǤ�����å��������true
		var param = {}; // �ץ�����׻��ѥѥ�᡼��
		/*
		 * ����򽸷�
		 * �����󥸡�group1����������פȥ����ƥ���������פ򽸷�
		 */
		var itemprintfee = {};
		var ca = {};
		var item_id = 0;
		var itemname = '';
		$('#orderlist tbody tr').each(function () {
			if (!$(this).find('.choice').is(':checked')) return true; // continue
			var cost = $(this).find('.subtotal').text().replace(/,/g, '') - 0;
			var vol = $(this).find('.listamount').val().replace(/,/g, '') - 0;
			var categoryid = $(this).children('td:eq(2)').attr('class').split('_')[1];
			if (categoryid == 0 || categoryid == 100) { // ����¾�Ȼ���
				item_id = $(this).children('td:eq(0)').children('.itemid').text().split('_')[0];
				itemname = $(this).find('.item_selector').text();
			} else {
				var ppId = $(this).children('td:eq(0)').children('.positionid').text();
				var group1Id = $(this).children('td:eq(0)').children('.group1').text(); // ������ʬ��
				var group2Id = $(this).children('td:eq(0)').children('.group2').text(); // ���륯Ʊ��ʬ��
				item_id = $(this).children('td:eq(0)').children('.itemid').text();
				itemname = $(this).find('.item_selector').children('select').children('option:selected').text();

				if (typeof ca[group1Id] == 'undefined') {
					ca[group1Id] = {
						'ids': [], // ���������󥸤Υ����ƥ�ID������
						'itemId': {}, // �����ƥ��������ȥץ��ȥݥ������ID�ʵ�С�������
						'tot': 0 // ���������󥸤������
					};
				}
				if (typeof ca[group1Id]['itemId'][item_id] == 'undefined') {
					ca[group1Id]['ids'].push(item_id);
					ca[group1Id]['itemId'][item_id] = {
						'vol': vol,
						'ppId': ppId,
						'group2': group2Id
					};
				} else {
					ca[group1Id]['itemId'][item_id]['vol'] += vol;
				}
				ca[group1Id]['tot'] += vol;

				// ��ʸ������
				amount += vol;
			}
			// �����ƥ���Υץ����彸����
			if (typeof itemprintfee[item_id] == 'undefined') {
				itemprintfee[item_id] = {
					'vol': vol,
					'fee': 0,
					'name': itemname,
					'cost': cost
				};
			} else {
				itemprintfee[item_id]['vol'] += vol;
				itemprintfee[item_id]['cost'] += cost;
			}
		});

		if (amount == 0) {
			if (!$('#free_printfee').is(':checked')) $('#est_printfee').val(0);
			// �����ƥ���Υץ�����򽸷�
			var tr = '';
			for (var item_id in itemprintfee) {
				tr += '<tr class="itemid_' + item_id + '">';
				tr += '<td>' + itemprintfee[item_id]['name'] + '</td>';
				tr += '<td class="toright volume">' + itemprintfee[item_id]['vol'] + '</td>';
				tr += '<td class="toright cost">' + mypage.addFigure(itemprintfee[item_id]['cost']) + '</td>';
				tr += '<td class="toright fee">' + mypage.addFigure(itemprintfee[item_id]['fee']) + '</td>';
				tr += '<td class="toright perone">' + mypage.addFigure(Math.ceil(itemprintfee[item_id]['fee'] / itemprintfee[item_id]['vol'])) + '</td>';
				tr += '<td class="toright subtot">' + mypage.addFigure(Math.ceil((itemprintfee[item_id]['cost'] + itemprintfee[item_id]['fee']) / itemprintfee[item_id]['vol'])) + '</td>';
				tr += '</tr>';
			}
			$('#itemprint tbody').html(tr);
			mypage.calcEstimation();
			return;
		}

		/*
		 * �ץ��Ȳս���˽���
		 * ��С������Υ��ƥ���ڤӳ������б���Ʊ������ID��ʣ���Υ����ƥ�ǻ��Ѥ��Ƥ��뤿���
		 */
		$('#pp_wrapper .pp_toggler').each(function () {
			var items = {};
			$(this).find('.title').children('span').each(function () {
				var item_id = $(this).attr('title').split('_')[1];
				for (var grp in ca) {
					if (ca[grp]['ids'].indexOf(item_id) >= 0) {
						var ppId = ca[grp]['itemId'][item_id]['ppId'];
						if (typeof items[ppId] == 'undefined') {
							items[ppId] = {};
							items[ppId][grp] = {
								'ids': [],
								'vol': 0
							};
						} else if (typeof items[ppId][grp] == 'undefined') {
							items[ppId][grp] = {
								'ids': [],
								'vol': 0
							};
						}
						items[ppId][grp]['ids'].push(item_id);
						items[ppId][grp]['vol'] += ca[grp]['itemId'][item_id]['vol'];
						break;
					}
				}
			});


			// ��ץ��ȳ���Ψ�̤˥ץ�����ˡ��Υץ��Ȱ��֤򽸷�
			$(this).next('.pp_toggle_body').children('div').each(function () {
				var ppId = $(this).attr('class').split('_')[1];
				$(this).find('.pp_box').each(function () {
					var ppInfo = $(this).children('.pp_info');
					var print_type = ppInfo.find('.print_type').val();
					var area = $(this).children('.pp_image').children('img:not(:nth-child(1))');
					var len = area.length;
					var pos_name = ''; // �ץ��Ȱ��֤�̾��
					var repeat = 0;

					for (var i = 0; i < len; i++) {
						if (($(area[i]).attr('src')).match(/_on.png$/)) {
							pos_name = $(area[i]).attr('alt');
							break;
						}
					}
					if (pos_name == '') {
						return true; // continue
					}

					// �ץ�����ˡ�̤��ѿ�����
					var ink = 0;
					var shot = 0;
					var opt = 0;
					switch (print_type) {
						case 'silk':
							ink = ppInfo.find('.ink_count').val() - 0;
							shot = ppInfo.find('.jumbo_plate:checked').val() - 0; // 0:�̾1:�����ܡ�2:SP������
							break;
						case 'inkjet':
							opt = ppInfo.find('.inkoption').val() - 0; // 0:ø����1:ǻ��
							shot = ppInfo.find('.areasize_id').val() - 0; // 0:�硡1:�桡2:��
							break;
						case 'cutting':
							shot = ppInfo.find('.areasize_id').val() - 0; // 0:�硡1:�桡2:��
							break;
						case 'embroidery':
							opt = ppInfo.find('.inkoption').val() - 0; // 0:���ꥸ�ʥ롡1:�͡���
							shot = ppInfo.find('.areasize_id').val() - 0; // 0:�硡1:�桡2:����3:�˾�
							break;
						case 'digit':
							shot = ppInfo.find('.areasize_id').val() - 0; // 0:�硡1:�桡2:��
							break;
						default:
							return true; // continue
					}
					if (print_type == 'silk' && ink == 0) {
						return true; // continue
					}

					// �ǥ�����δʰ�Ƚ���ѥ���
					var sectKey = "" + ink + shot + opt;

					// ��ԡ��ȥ����å�
					if ($(this).find('.repeat_check').is(':checked')) {
						mypage.prop.isRepeatCheck = true;
						repeat = 1;
					} else {
						repeat = 0;
					}

					// �ץ�����ˡ��Υץ��Ȳս��̤ǥѥ�᡼���򽸷�
					if (typeof param[print_type] == 'undefined') {
						param[print_type] = {};
						param[print_type][pos_name] = {};
						param[print_type][pos_name][sectKey] = {};
					} else if (typeof param[print_type][pos_name] == 'undefined') {
						param[print_type][pos_name] = {};
						param[print_type][pos_name][sectKey] = {};
					} else if (typeof param[print_type][pos_name][sectKey] == 'undefined') {
						param[print_type][pos_name][sectKey] = {};
					}

					for (var grp in items[ppId]) {
						if (typeof param[print_type][pos_name][sectKey][grp] == 'undefined') {
							param[print_type][pos_name][sectKey][grp] = {
								'ids': {},
								'vol': 0,
								'ink': 0,
								'size': 0,
								'opt': 0,
								'repeat': {}
							};
						}
						len = items[ppId][grp]['ids'].length;
						for (var t = 0; t < len; t++) {
							item_id = items[ppId][grp]['ids'][t];
							param[print_type][pos_name][sectKey][grp]['ids'][item_id] = ca[grp]['itemId'][item_id]['vol'];

							// ��ԡ��ȵڤ�����׾�Υ����å�
							if (print_type == 'silk') {
								// ���륯�ϡ�Ʊ��ʬ����˥�ԡ��Ȥ�Ƚ��
								var g2 = ca[grp]['itemId'][item_id]['group2'];
								param[print_type][pos_name][sectKey][grp]['repeat'][g2] = repeat;
							} else {
								param[print_type][pos_name][sectKey][grp]['repeat'] = repeat;
							}
						}

						param[print_type][pos_name][sectKey][grp]['vol'] += items[ppId][grp]['vol'];
						param[print_type][pos_name][sectKey][grp]['ink'] = ink;
						param[print_type][pos_name][sectKey][grp]['size'] = shot;
						param[print_type][pos_name][sectKey][grp]['opt'] = opt;
					}
				});
			});
		});


		if (Object.keys(param).length !== 0) {

			// ���륯��Ʊ��ʬ�������å����ƥ�ԡ��ȥե饰�������
			if ($.isset(function () {
					return param.silk
				})) {
				for (var pos_name in param['silk']) {
					for (var sect in param['silk'][pos_name]) {
						var g2 = {};
						for (var grp in param['silk'][pos_name][sect]) {
							for (var g2Id in param['silk'][pos_name][sect][grp]['repeat']) {
								if (typeof g2[g2Id] == 'undefined') {
									g2[g2Id] = true;
								} else {
									param['silk'][pos_name][sect][grp]['repeat'][g2Id] = param['silk'][pos_name][sect][grp]['repeat'][g2Id] == 1 ? 1 : 2;
								}
							}
						}
					}
				}
			}

			if ($('#free_printfee').is(':checked')) { // �ץ����夬������
				$('#itemprint tbody').html('');
				mypage.calcEstimation();
				return;
			}

			var postData = JSON.stringify(param);
			$.ajax({
				url: './php_libs/estimation.php',
				type: 'POST',
				dataType: 'json',
				data: {
					'act': 'printfee2',
					'curdate': mypage.prop.acceptingdate,
					'args': postData
				},
				async: false,
				success: function (r) {
					if (r instanceof Array) {
						est_printfee += r[0]['tot'];
						est_silk_printfee += r[0]['silk'];
						est_color_printfee += (r[0]['trans'] - 0) + (r[0]['darktrans'] - 0);
						est_digit_printfee += r[0]['digit'];
						est_inkjet_printfee += (r[0]['inkjet'] - 0) + (r[0]['darkinkjet'] - 0);
						est_cutting_printfee += r[0]['cutting'];
						est_embroidery_printfee += r[0]['embroidery'];
						$('#pp_wrapper .pp_toggler').each(function () {
							var subprice = 0;
							$(this).find('.title').children('span').each(function () {
								var itemid = $(this).attr('title').split('_')[1];
								var itemname = $(this).text();
								if (typeof r[0]['item'][itemid] != 'undefined') {
									var fee = r[0]['item'][itemid]['fee'] - 0;
									subprice += fee;
									itemprintfee[itemid]['fee'] += fee;
								}
							});
							if (subprice > 0) {
								var tmp = subprice + ($(this).find('.sub_price').val().replace(/,/g, '') - 0);
								$(this).find('.sub_price').val(mypage.addFigure(tmp));
							}
						});
					} else {
						alert('Error: p2906\n' + r);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert('Error: p2910\n' + textStatus + '\n' + errorThrown);
				}
			});
		}

		// �����ƥ���Υץ�����򽸷�
		var tr = '';
		for (var item_id in itemprintfee) {
			tr += '<tr class="itemid_' + item_id + '">';
			tr += '<td>' + itemprintfee[item_id]['name'] + '</td>';
			tr += '<td class="toright volume">' + itemprintfee[item_id]['vol'] + '</td>';
			tr += '<td class="toright cost">' + mypage.addFigure(itemprintfee[item_id]['cost']) + '</td>';
			tr += '<td class="toright fee">' + mypage.addFigure(itemprintfee[item_id]['fee']) + '</td>';
			tr += '<td class="toright perone">' + mypage.addFigure(Math.ceil(itemprintfee[item_id]['fee'] / itemprintfee[item_id]['vol'])) + '</td>';
			tr += '<td class="toright subtot">' + mypage.addFigure(Math.ceil((itemprintfee[item_id]['cost'] + itemprintfee[item_id]['fee']) / itemprintfee[item_id]['vol'])) + '</td>';
			tr += '</tr>';
		}
		$('#itemprint tbody').html(tr);

		// ���ѥܥå����ν�
		$('#est_printfee').val(mypage.addFigure(est_printfee));
		$('#est_silk_printfee').html(mypage.addFigure(est_silk_printfee));
		$('#est_color_printfee').html(mypage.addFigure(est_color_printfee));
		$('#est_digit_printfee').html(mypage.addFigure(est_digit_printfee));
		$('#est_inkjet_printfee').html(mypage.addFigure(est_inkjet_printfee));
		$('#est_cutting_printfee').html(mypage.addFigure(est_cutting_printfee));
		$('#est_embroidery_printfee').html(mypage.addFigure(est_embroidery_printfee));
		$('#est_price').html($('#total_cost').val());
		mypage.calcEstimation();
	},
	calcEstimation: function () {
		/*
		 *	p1  ������ܥץ�����ܥ��󥯿�����
		 *	p2  ������								�оݡ�p1
		 *	p3  �Ͱ����
		 *	p4  �õ�����ʣ����ž夲�������ž夲��		�оݡ�p1+p2+p7+p9+p10
		 *	p5  ����									�оݡ�p1+p2+p3+p7+p9+p10+p11
		 *	p6  ����������Ķ®�ء��������ء�
		 *	p7  �ǥ�������
		 * 	p8  ����������
		 *	p9  �޵ͤ���
		 *	p10 ����
		 *	p11 �ɲ�����
		 *	p12 ����ӥ˼����
		 *	p13 ��ʧ�������
		 *
		 *	����ԡ��ȤΥץ����廻�Ф˻���
		 *	prm1			������ܥ��󥯿��ؤ���
		 *	prm2			������
		 *	prm4			�õ�����
		 *	checkdesign		�ǥ����󸶹Ƥμ����0:�ץ��Ȥʤ�, 1:�����ʳ�������, 2:���ƥ���� �� 2018-01-31�ѻ�
		 *	illustrator_fee	���Τޤޥץ��ȡʵ쥤��� 2018-01-31�ѻߡ˳�ζ�ۡʶ������̵��-1000��
		 *	discount_ratio	�Ұ����
		 *	discount_ratio1	���Ψ�ʶ������̵�����֥����䡡�׻������
		 *	discount_ratio2	���Ψ�ʶ�����¤����
		 *	extradiscount	�׻����Ψ
		 *	discount_ratio	Ŭ�Ѥ������Ψ���
		 *	express_ratio	�õ޳���Ψ
		 */

		// ������ʸ�ϸ��Ѽ�ư�׻���Ԥ�ʤ�
		//if(mypage.prop.firmorder) return;

		var tot = 0;
		var per = 0;
		var prm1 = 0;
		var prm2 = 0;
		var prm4 = 0;
		var discount_ratio = 0;
		var discount_ratio1 = 0;
		var discount_ratio2 = 0;
		var extradiscount = '';
		var express_ratio = 0;
		var express = 0;
		var sales_tax = 0;
		var sum = 0;

		// �ȼ����ϡ������Ϥθ��ѷ׻�
		if (mypage.prop.ordertype == "industry") {
			tot = $('#total_cost').val().replace(/,/g, '') - 0;
			$('#orderlist tfoot .price').each(function () {
				tot += $(this).val().replace(/,/g, '') - 0;
			});

			sales_tax = Math.floor(tot * mypage.prop.tax);
			sum = Math.floor(tot * (1 + mypage.prop.tax));
			$('#subtotal_estimate').val(mypage.addFigure(tot));
			$('#sales_tax').val(mypage.addFigure(sales_tax));
			$('#total_estimate_cost').val(mypage.addFigure(sum));

			return;
		}
		var p1 = $('#est_price').text().replace(/,/g, '') - 0;
		p1 += $('#est_exchink').text().replace(/,/g, '') - 0;
		prm1 = p1;
		p1 += $('#est_printfee').val().replace(/,/g, '') - 0;
		var discountfee = 0;
		var base = Date.parse($('#schedule_date2').val().replace(/-/g, '/')) / 1000;
		var send = Date.parse($('#schedule_date3').val().replace(/-/g, '/')) / 1000;
		var deli = Date.parse($('#schedule_date4').val().replace(/-/g, '/')) / 1000;
		var amount = $('#est_amount').text().replace(/,/g, '') - 0;
		var p2 = 0;
		var p3 = 0;
		var p4 = 0;
		var p5 = 0;
		var p6 = 0;
		var p7 = 0;
		var p8 = 0;
		var p9 = 0;
		var p10 = 0;
		var p11 = $('#additionalfee').val();
		var p12 = 0;
		var p13 = 0;
		var subtotal = 0;
		var pack = '';
		var packfee = 0;
		var extra = 0;
		var destcount = $('#destcount').val() - 0; // Ǽ����ο�

		$('#est_additionalfee').text(p11);
		p11 = p11.replace(/,/g, '') - 0;

		if (isNaN(base) || isNaN(send) || isNaN(deli)) {
			// �������塼�뤬̤��ξ��
			$('#est_express').prev().html('�õ�����');
			$('#express_message').removeClass('bgExpress').html('');

			/* 
			 *	�޵ͤ�
			 *	2014-02-22 2�̤�ʾ�λ�����б�
			 */
			$('input[name="package"]:checked', '#package_wrap').each(function () {
				pack = $(this).val();
				var state = $(this).val();
				var volume = $('#pack_' + state + '_volume').val() - 0;
				if (pack == "yes") {
					p9 = volume * 50;
					packfee += p9;
				} else if (pack == 'nopack') {
					p10 = volume * 10;
					packfee += p10;
				}
			});
			$('#est_package').text(mypage.addFigure(packfee));

			if ($('#free_discount').attr('checked')) {
				p2 = $('#discountfee').val().replace(/,/g, '');
				discountfee = mypage.addFigure(p2);
				if (p2.match(/^-/)) {
					$('#discountfee').val(discountfee.substr(1));
				} else if (p2 != '0') {
					p2 = '-' + p2;
					discountfee = '-' + discountfee;
				}
				$('#est_discount').text(discountfee);
				p2 -= 0;
			} else {
				// �Ұ����
				if ($('#staffdiscount').is(':checked')) {
					discount_ratio += $('#staffdiscount').val() - 0;
					discountfee += Math.ceil((p1 * discount_ratio) / 100);
				}
				
				if ($('input[value="illust"]:checked', '#optprice_table').length > 0 && discount_ratio == 0) {
					discountfee += 1000;
				}

				if (mypage.prop.isRepeat == false && discount_ratio == 0) { // ��ԡ�������ʸ�ǤϤʤ���ļҰ���ǤϤʤ����˳����Ŭ�Ѥ���
					// �֥�����
					if ($('input[value="blog"]:checked', '#optprice_table').length > 0) {
						discountfee += Math.ceil((p1 * 3) / 100);
						discount_ratio1 += 3;
					}

					var discount = $('input[name="discount1"]:checked', '#optprice_table').val();
					switch (discount) {
						case 'student':
							discountfee += Math.ceil((p1 * 3) / 100);
							discount_ratio2 += 3;
							break;
						case 'team2':
							discountfee += Math.ceil((p1 * 5) / 100);
							discount_ratio2 += 5;
							break;
						case 'team3':
							discountfee += Math.ceil((p1 * 7) / 100);
							discount_ratio2 += 7;
							break;
					}

					discount = $('input[name="discount2"]:checked', '#optprice_table').val();
					switch (discount) {
						case 'repeat':
						case 'introduce':
							discountfee += Math.ceil((p1 * 3) / 100);
							discount_ratio2 += 3;
							break;
						case 'vip':
							discountfee += Math.ceil((p1 * 5) / 100);
							discount_ratio2 += 5;
							break;
					}

					// �ѹ����μ����ǡ������б�
					if ($('input[value="quick"]:checked', '#optprice_table').length > 0) {
						discountfee += Math.ceil((p1 * 5) / 100);
						discount_ratio2 += 5;
					}

					// �׻������������¤ʤ��õ��Բ�
					if ($('input[name="extradiscount"]:checked', '#optprice_table').length > 0) {
						extradiscount = $('input[name="extradiscount"]:checked', '#optprice_table').val() - 0;
						if (extradiscount == 20) {
							// 20�����¾�Ȥ�ʻ���Բ�
							discountfee = Math.ceil((p1 * extradiscount) / 100);
							discount_ratio1 = discountfee;
							discount_ratio2 = 0;
						} else {
							discountfee += Math.ceil((p1 * extradiscount) / 100);
							discount_ratio1 += discountfee;
						}
					}
				}

				// ���
				p2 = -discountfee;
				if (discountfee != 0) {
					discountfee = mypage.addFigure(discountfee);
					$('#est_discount').text('-' + discountfee);
				} else {
					$('#est_discount').text(discountfee);
				}
				$('#discountfee').val(discountfee);
			}

			// �Ͱ�
			p3 = $('#reductionprice').val().replace(/,/g, '');
			var reduce = mypage.addFigure(p3);
			if (p3.match(/^-/)) {
				$('#reductionprice').val(reduce.substr(1));
			} else if (p3 != '0') {
				p3 = '-' + p3;
				reduce = '-' + reduce;
			}
			$('#est_reduction').text(reduce);
			p3 -= 0;

			// �ǥ�������
			$('#est_designfee').text($('#designcharge').val());
			p7 = $('#est_designfee').text().replace(/,/g, '') - 0;

			// ����������
			var codfee = '0';
			if ($('input[name="payment"]:checked', '#optprice_table').val() == 'cod') {
				if (mypage.prop.tax == 0) {
					codfee = '864';
				} else {
					codfee = '800';
				}
			}
			$('#codfee').val(codfee);
			$('#est_codfee').text(codfee);
			p8 = $('#est_codfee').text().replace(/,/g, '') - 0;

			// ����ӥ˼����
			var conbifee = '0';
			if ($('input[name="payment"]:checked', '#optprice_table').val() == 'conbi') {
				if (mypage.prop.tax == 0) {
					conbifee = '864';
				} else {
					conbifee = '800';
				}
			}
			$('#conbifee').val(conbifee);
			$('#est_conbifee').text(conbifee);
			p12 = $('#est_conbifee').text().replace(/,/g, '') - 0;

			// ��ʧ�������
			p13 = 0;
			// 2019-03-12 18:00:00 �����ʧ����������ѻ�
			var abolitionDate = Date.parse("2019-03-12T18:00:00+09:00");
			if (Date.now() < abolitionDate) {
				if ($('input[name="payment"]:checked', '#optprice_table').val() == 'later_payment') {
					if (mypage.prop.tax == 0) {
						p13 = 324;
					} else {
						p13 = 300;
					}
				}
			}
			
			$('#est_paymentfee').text(p13);
			
			$('#est_express').text("0");

			$('#carriage_name').text($(':radio[name="carriage"]:checked', '#schedule_selector').parent().text());
			extra = $('input[name="carriage"]:checked', '#schedule_selector').val();
			if ($('#freeshipping:checked').length == 1) {
				p5 = 0;
			} else if (extra != 'accept') {
				if (p1 + p2 + p3 + p7 + p9 + p10 + p11 < 30000 && p1 + p2 + p3 + p7 + p9 + p10 + p11 > 0) {
					p5 = 700 * destcount;
				} else if (p1 + p2 + p3 + p7 + p9 + p10 + p11 >= 30000) {
					p5 = 700 * (destcount - 1);
				}
			}
			$('#est_carriage').text(mypage.addFigure(p5));

			tot = p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9 + p10 + p11 + p12 + p13;

		} else {
			$.ajax({
				url: './php_libs/deliveryDate.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: {
					'act': 'works',
					'base': base,
					'send': send,
					'deli': deli
				},
				success: function (r) {
					var workday = r.split(',');
					var check_amount = $('#pack_yes_volume').val() - 0;
					/* 
					 *	�޵ͤ�
					 *	2014-02-22 2�̤�ʾ�λ�����������
					 */
					var pack = '';
					var isPacking = false;
					$('input[name="package"]:checked', '#package_wrap').each(function () {
						pack = $(this).val();
						var state = $(this).val();
						var volume = $('#pack_' + state + '_volume').val() - 0;
						if (pack == "yes") {
							p9 = volume * 50;
							packfee += p9;
							isPacking = true;
						} else if (pack == 'nopack') {
							p10 = volume * 10;
							packfee += p10;
						}
					});
					$('#est_package').text(mypage.addFigure(packfee));

					// �õ�����
					var term = workday[1] - 0;
					if ($('#noprint:checked').length == 1) {
						term = 3; // 2012-05-04 �ץ���̵�����õ������׾夷�ʤ�
					} else if (isPacking && check_amount >= 10) {
						term -= 1; // �޵ͤ���ǳ�������10��ʾ�Ǻ������1���ɲ�
					}
					switch (term) {
						case 0:
							$('#est_express').prev().html('�õ�����<span class="fontred">(2��)</span>');
							$('#express_message').addClass('bgExpress').html('<img alt="10" src="./img/i_alert.png" width="24" />&nbsp;<span class="fontred">�õ�2��</span>')
								.effect('pulsate', {
									'times': 2
								}, 250);
							express = 10;
							break;
						case 1:
							$('#est_express').prev().html('�õ�����<span class="fontred">(1.5��)</span>');
							$('#express_message').addClass('bgExpress').html('<img alt="5" src="./img/i_alert.png" width="24" />&nbsp;<span class="fontred">�õ�1.5��</span>')
								.effect('pulsate', {
									'times': 2
								}, 250);
							express = 5;
							break;
						case 2:
							$('#est_express').prev().html('�õ�����<span class="fontred">(1.3��)</span>');
							$('#express_message').addClass('bgExpress').html('<img alt="3" src="./img/i_alert.png" width="24" />&nbsp;<span class="fontred">�õ�1.3��</span>')
								.effect('pulsate', {
									'times': 2
								}, 250);
							express = 3;
							break;
						default:
							$('#est_express').prev().html('�õ�����');
							$('#express_message').removeClass('bgExpress').html('');
					}

					if ($('#free_discount').attr('checked')) {
						p2 = $('#discountfee').val().replace(/,/g, '');
						discountfee = mypage.addFigure(p2);
						if (p2.match(/^-/)) {
							$('#discountfee').val(discountfee.substr(1));
						} else if (p2 != '0') {
							p2 = '-' + p2;
							discountfee = '-' + discountfee;
						}
						$('#est_discount').text(discountfee);
						p2 -= 0;
					} else {
						// �Ұ����
						if ($('#staffdiscount').is(':checked')) {
							discount_ratio += $('#staffdiscount').val() - 0;
							discountfee += Math.ceil((p1 * discount_ratio) / 100);
						}
						
						if ($('input[value="illust"]:checked', '#optprice_table').length > 0) {
							discountfee += 1000;
						}

						if (mypage.prop.isRepeat == false && discount_ratio == 0) { // ��ԡ�������ʸ�ǤϤʤ���ļҰ���ǤϤʤ������������Ŭ�Ѥ���
							// �֥�����
							if ($('input[value="blog"]:checked', '#optprice_table').length > 0) {
								discountfee += Math.ceil((p1 * 3) / 100);
								discount_ratio1 += 3;
							}

							// 2018-03-05 �õޤξ��Ǥ�س��Ŭ�Ѥ����ͤ˻����ѹ�
							var discount = $('input[name="discount1"]:checked', '#optprice_table').val();
							switch (discount) {
								case 'student':
									discountfee += Math.ceil((p1 * 3) / 100);
									discount_ratio2 += 3;
									break;
								case 'team2':
									discountfee += Math.ceil((p1 * 5) / 100);
									discount_ratio2 += 5;
									break;
								case 'team3':
									discountfee += Math.ceil((p1 * 7) / 100);
									discount_ratio2 += 7;
									break;
							}

							if (express == 0) {
								discount = $('input[name="discount2"]:checked', '#optprice_table').val();
								switch (discount) {
									case 'repeat':
									case 'introduce':
										discountfee += Math.ceil((p1 * 3) / 100);
										discount_ratio2 += 3;
										break;
									case 'vip':
										discountfee += Math.ceil((p1 * 5) / 100);
										discount_ratio2 += 5;
										break;
								}

								// �ѹ����μ����ǡ������б�
								if ($('input[value="quick"]:checked', '#optprice_table').length > 0) {
									discountfee += Math.ceil((p1 * 5) / 100);
									discount_ratio2 += 5;
								}
							}

							// �׻������������¤ʤ��õ��Բ�
							if ($('input[name="extradiscount"]:checked', '#optprice_table').length > 0) {
								extradiscount = $('input[name="extradiscount"]:checked', '#optprice_table').val() - 0;
								if (extradiscount == 20) {
									// 20�����¾�Ȥ�ʻ���Բ�
									discountfee = Math.ceil((p1 * extradiscount) / 100);
									discount_ratio1 = discountfee;
									discount_ratio2 = 0;
								} else {
									discountfee += Math.ceil((p1 * extradiscount) / 100);
									discount_ratio1 += discountfee;
								}
							}
						}

						p2 = -discountfee;
						if (discountfee != 0) {
							discountfee = mypage.addFigure(discountfee);
							$('#est_discount').text('-' + discountfee);
						} else {
							$('#est_discount').text(discountfee);
						}
						$('#discountfee').val(discountfee);
					}

					p3 = $('#reductionprice').val().replace(/,/g, '');
					var reduce = mypage.addFigure(p3);
					if (p3.match(/^-/)) {
						$('#reductionprice').val(reduce.substr(1));
					} else if (p3 != '0') {
						p3 = '-' + p3;
						reduce = '-' + reduce;
					}
					$('#est_reduction').text(reduce);
					p3 -= 0;

					$('#est_designfee').text($('#designcharge').val());
					p7 = $('#est_designfee').text().replace(/,/g, '') - 0;

					var codfee = '0';
					if ($('input[name="payment"]:checked', '#optprice_table').val() == 'cod') {
						if (mypage.prop.tax == 0) {
							codfee = '864';
						} else {
							codfee = '800';
						}
					}
					$('#codfee').val(codfee);
					$('#est_codfee').text(codfee);
					p8 = $('#est_codfee').text().replace(/,/g, '') - 0;

					var conbifee = '0';
					if ($('input[name="payment"]:checked', '#optprice_table').val() == 'conbi') {
						if (mypage.prop.tax == 0) {
							conbifee = '864';
						} else {
							conbifee = '800';
						}
					}
					$('#conbifee').val(conbifee);
					$('#est_conbifee').text(conbifee);
					p12 = $('#est_conbifee').text().replace(/,/g, '') - 0;

					// ��ʧ�������
					p13 = 0;
					// 2019-03-12 18:00:00 �����ʧ����������ѻ�
					var abolitionDate = Date.parse("2019-03-12T18:00:00+09:00");
					if (Date.now() < abolitionDate) {
						if ($('input[name="payment"]:checked', '#optprice_table').val() == 'later_payment') {
							if (mypage.prop.tax == 0) {
								p13 = 324;
							} else {
								p13 = 300;
							}
						}
					}
					
					$('#est_paymentfee').text(p13);
					
					// ���ɽ���λ��ϥ�å�������Ф��ʤ�
					if (term < 0 && !isNaN(base) && !isNaN(send) && !isNaN(deli)) {
						alert('����������­��ޤ���');
						$('#schedule_date3').val("");
						$('#schedule_date4').val("");
					}

					var subtotal = p1 + p2 + p7 + p9 + p10;
					express_ratio = express;
					express = mypage.addFigure(Math.ceil((subtotal * express) / 10));
					$('#est_express').text(express);
					p4 = $('#est_express').text().replace(/,/g, '') - 0;

					$('#carriage_name').text($(':radio[name="carriage"]:checked', '#schedule_selector').parent().text());
					var extra = $('input[name="carriage"]:checked', '#schedule_selector').val();
					if ($('#freeshipping:checked').length == 1) {
						p5 = 0;
					} else if (extra != 'accept') {
						if (p1 + p2 + p3 + p7 + p9 + p10 + p11 < 30000 && p1 + p2 + p3 + p7 + p9 + p10 + p11 > 0) {
							p5 = 700 * destcount;
						} else if (p1 + p2 + p3 + p7 + p9 + p10 + p11 >= 30000) {
							p5 = 700 * (destcount - 1);
						}
					}
					$('#est_carriage').text(mypage.addFigure(p5));
					
					tot = p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9 + p10 + p11 + p12 + p13;
				}
			});
		}

		// ������ɽ������
		if (mypage.prop.isRepeatCheck) {
			if (mypage.prop.isRepeat) {
				var repeat_type = (mypage.prop.isRepeatFirst && mypage.prop.reuse == 1) ? 1 : 2;
				$('#discount_reuse').text('��ԡ����ǡ�type' + repeat_type + '��').show();
			} else {
				$('#discount_reuse').text('').hide();
			}
			$('#reuse_plate').text('��ԡ�����');
		} else {
			$('#discount_reuse').text('').hide();
			$('#reuse_plate').text($('#reuse_plate').text().replace('��ԡ���', '��'));
		}

		// ����ξ��
		if (mypage.prop.reuse == 1 && !$('#free_printfee').is(':checked') && mypage.prop.isRepeatFirst && discount_ratio == 0) {
			var baseinfo = '';
			var baseprintfee = {};
			var postData = {
				'act': 'baseprintfee',
				'orders_id': mypage.prop.repeat
			};
			$.ajax({
				url: './php_libs/estimation.php',
				type: 'POST',
				dataType: 'json',
				data: postData,
				async: false,
				success: function (r) {
					if (r instanceof Array) {
						baseinfo = r[0];
						
						// �����ƥऴ�Ȥ�1������ץ�����򻻽�
						for (var item_id in baseinfo['item']) {
							baseprintfee[item_id] = Math.ceil(baseinfo['item'][item_id]['fee'] / baseinfo['item'][item_id]['amount']);
						}
					} else {
						alert('Error: p2620\n' + r);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert('Error: p2624\n' + textStatus + '\n' + errorThrown);
				}
			});

			// �����ƥऴ�Ȥ�1�礢����ץ��������Ӥ��⤤�����ƥब����к��ۤ򻻽�
			var balance = 0;
			$('#itemprint tbody tr').each(function () {
				var item_id = $(this).attr('class').split('_')[1];
				var repeatitem_cost = $(this).children('.cost').text().replace(/,/g, '') - 0;
				var repeatitem_volume = $(this).children('.volume').text().replace(/,/g, '');
				var repeatitem_perone = $(this).children('.perone').text().replace(/,/g, '') - 0;
				if (baseprintfee[item_id] < repeatitem_perone) {
					// ����Ŭ�Ѹ�Υץ�����
					var repeatitem_fee = baseprintfee[item_id] * repeatitem_volume;
					$(this).children('.fee').text(mypage.addFigure(repeatitem_fee));
					$(this).children('.perone').text(mypage.addFigure(baseprintfee[item_id]));
					$(this).children('.subtot').text(mypage.addFigure(Math.ceil((repeatitem_cost + repeatitem_fee) / repeatitem_volume)));
					// ���۹��
					balance += (repeatitem_perone - baseprintfee[item_id]) * repeatitem_volume;
				}
			});

			if (balance > 0) {
				// �ץ�����ˡ���ȤΥץ����������
				$('#pp_wrapper .pp_toggler').each(function () {
					$(this).find('.sub_price').val('0');
				});
				$('#est_silk_printfee').html('0');
				$('#est_color_printfee').html('0');
				$('#est_digit_printfee').html('0');
				$('#est_inkjet_printfee').html('0');
				$('#est_cutting_printfee').html('0');
				$('#est_embroidery_printfee').html('0');

				var printfee = $('#est_printfee').val().replace(/,/g, '') - 0;
				printfee -= balance;
				$('#est_printfee').val(mypage.addFigure(printfee));

				// ������ܥץ�����ܿ�����
				p1 = $('#est_price').text().replace(/,/g, '') - 0;
				p1 += $('#est_exchink').text().replace(/,/g, '') - 0;
				p1 += $('#est_printfee').val().replace(/,/g, '') - 0;

				// �õ�����
				if (express_ratio > 0) {
					subtotal = p1 + p2 + p7 + p9 + p10;
					p4 = Math.ceil((subtotal * express_ratio) / 10);
					$('#est_express').text(mypage.addFigure(p4));
				}

				// ����
				extra = $('input[name="carriage"]:checked', '#schedule_selector').val();
				subtotal = p1 + p2 + p3 + p7 + p9 + p10 + p11;
				if ($('#freeshipping').is(':checked')) {
					p5 = 0;
				} else if (extra != 'accept') {
					if (subtotal < 30000 && subtotal > 0) {
						p5 = 700 * destcount;
					} else if (subtotal >= 30000) {
						p5 = 700 * (destcount - 1);
					}
				}
				$('#est_carriage').text(mypage.addFigure(p5));
				tot = p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9 + p10 + p11 + p12 + p13;
			}
		}

		// ������
		if (mypage.prop.tax != 0) {
			sales_tax = Math.floor(tot * mypage.prop.tax);
		}

		sum = Math.floor(tot * (1 + mypage.prop.tax));

		// �����ɷ�Ѥξ�硢�ǹ���פ�5���׾��2018-01-30 �ѻߡ�
		var creditfee = 0;
		if ($('input[name="payment"]:checked', '#optprice_table').val() == 'credit') {
			
			// ��ʸ�������λ��꤬�����硢2018-01-29���饫���ɷ�Ѽ�����ѻ�
			if (mypage.prop.firmorderdate) {
				var schedule2 = new Date(mypage.prop.firmorderdate+"T00:00:00+09:00");
				var abolition = new Date("2018-01-29T00:00:00+09:00");
				if (schedule2 < abolition) {
					creditfee = Math.ceil(sum * mypage.prop.credit_rate);
				}
			}
			
			sum += creditfee;
		}
		$('#est_creditfee').text(mypage.addFigure(creditfee));
		per = amount == 0 ? 0 : Math.ceil(sum / amount);

		$('#est_basefee').text(mypage.addFigure(tot));
		$('#est_salestax').text(mypage.addFigure(sales_tax));
		$('#est_total_price').text(mypage.addFigure(sum));
		$('#est_perone').text(mypage.addFigure(per));
	},
	changePlate: function (my) {
		/*
		 *	�ץ��Ȱ��֤Υ������Ǥλ��ѥ����å�����
		 */
		var row = $(my).closest('tr').prev();
		if ($(my).val() == 1) {
			row.find('.areasize_from').val('43');
			row.find('.areasize_to').val('32');
		} else if ($(my).val() == 2) {
			row.find('.areasize_from').val('52');
			row.find('.areasize_to').val('30');
		} else {
			row.find('.areasize_from').val('35');
			row.find('.areasize_to').val('27');
		}
		mypage.calcPrintFee();
	},
	changeDesignType: function (my) {
		/*
		 *	�ץ��Ȱ��֤θ��ƥ��쥯���ѹ�
		 */
		//if(mypage.prop.repeat!=0) return;
		var ppInfo = $(my).closest('.pp_info');
		var ppImage = ppInfo.prev();
		var selectlength = ppImage.find('img:not(:nth-child(1))').filter(function () {
			return $(this).attr('src').match(/_on.png$/);
		}).length;
		if (selectlength > 0) {
			var printtype = ppInfo.find('.print_type').val();
			if (!(printtype == 'silk' && ppInfo.find('.ink_count').val() == '0')) {
				mypage.calcEstimation();
			}
		}
	},
	changePrinttype: function (my) {
		/*
		 *	�ץ��Ȱ��֤Υץ�����ˡ�ѹ�
		 */
		my = $(my);
		var print_type = my.val();
		var html = "";
		var html2 = "";
		var html3 = "";
		var tblRow = my.parent().parent().next();
		var txtInk = my.closest('.pp_info').siblings('.pp_ink').children('p');
		if (print_type == 'silk') {
			my.parent().parent().prev().css('visibility', 'visible');
		} else {
			txtInk.children('.pos_name').each(function () {
				$(this).next('img').attr({
					'src': './img/circle.png'
				}).next('input').val('');
			});
			my.parent().parent().prev().css('visibility', 'hidden').find('.ink_count').val('0');
		}
		if (print_type != 'embroidery') {
			if (txtInk.length > 4) {
				txtInk.each(function (index) {
					if (index < 4) return true; // continue
					$(this).remove();
				});
			}
		} else {
			var firstElement = txtInk.eq(0);
			var len = 12 - txtInk.length;
			for (var i = 0; i < len; i++) {
				my.closest('.pp_info').siblings('.pp_ink').append(firstElement.clone());
			}
		}
		switch (print_type) {
			case 'silk':
				html = '�ǡʽ�<input type="text" value="35" size="3" class="areasize_from forNum" onchange="mypage.limit_size(this,\'' + print_type + '\');" />��';
				html += '��<input type="text" value="27" size="3" class="areasize_to forNum" onchange="mypage.limit_size(this,\'' + print_type + '\');" />��';
				html2 = '������ <input type="text" value="" class="design_size" />';
				html3 = '<form>';
				html3 += '<label><input type="radio" name="jumbo" value="0" class="jumbo_plate" onchange="mypage.changePlate(this)" checked="checked" />�̾�</label>';
				html3 += '<label><input type="radio" name="jumbo" value="1" class="jumbo_plate" onchange="mypage.changePlate(this)" />������</label>';
				html3 += '<label><input type="radio" name="jumbo" value="2" class="jumbo_plate" onchange="mypage.changePlate(this)" />�����ѡ�������</label>';
				html3 += '</form>';
				break;
			case 'inkjet':
				html = '�� <select class="areasize_id" onchange="mypage.limit_size(this)">' +
					'<option value="0" selected="selected">���27��38��</option>' +
					'<option value="1">���27��18��</option>' +
					'<option value="2">����10��10��</option>' +
					'</select>';
				html2 = '������ <input type="text" value="" class="design_size" />';
				html3 = '���ץ����&nbsp;<select class="inkoption" onchange="mypage.limit_size(this)">' +
					'<option value="0" selected="selected">ø��</option>' +
					'<option value="1">ǻ��</option>' +
					'</select>';
				break;
			case 'trans':
				html = '�� <select class="areasize_id" onchange="mypage.limit_size(this)">' +
					'<option value="0" selected="selected">���27��38��</option>' +
					'<option value="1">���27��18��</option>' +
					'<option value="2">����10��10��</option>' +
					'</select>';
				html2 = '������ <input type="text" value="" class="design_size" />';
				html3 = '���ץ����&nbsp;<select class="inkoption" onchange="mypage.limit_size(this)">' +
					'<option value="0" selected="selected">ø��</option>' +
					'<option value="1">ǻ��</option>' +
					'</select>';
				break;
			case 'digit':
				html = '�� <select class="areasize_id" onchange="mypage.limit_size(this)">' +
					'<option value="0" selected="selected">���27��38��</option>' +
					'<option value="1">���27��18��</option>' +
					'<option value="2">����10��10��</option>' +
					'</select>';
				html2 = '������ <input type="text" value="" class="design_size" />';
				html3 = '';
				break;
			case 'cutting':
				html = '�� <select class="areasize_id" onchange="mypage.limit_size(this)">' +
					'<option value="0" selected="selected">���27��38��</option>' +
					'<option value="1">���27��18��</option>' +
					'<option value="2">����10��10��</option>' +
					'</select>';
				html2 = '������ <input type="text" value="" class="design_size" />';
				html3 = '';
				break;
			case 'embroidery':
				html = '�� <select class="areasize_id" onchange="mypage.limit_size(this)">' +
					'<option value="0" selected="selected">���25��25��</option>' +
					'<option value="1">���18��18��</option>' +
					'<option value="2">����10��10��</option>' +
					'<option value="3">�˾���5��5��</option>' +
					'</select>';
				html2 = '������ <input type="text" value="" class="design_size" />';
				html3 = '���ץ����&nbsp;<select class="inkoption" onchange="mypage.limit_size(this)">' +
					'<option value="0" selected="selected">���ꥸ�ʥ�</option>' +
					'<option value="1">�͡���</option>' +
					'</select>';
				break;
		}

		tblRow.children('td:eq(0)').html(html);
		tblRow.children('td:eq(1)').html(html2);
		tblRow.next().children('td:eq(0)').html(html3);
		mypage.calcPrintFee();
		mypage.prop.modified = true;
	},
	limit_size: function (my) {
		/*
		 * ���륯���ǥ��������������¤Ȥ���¾�Υץ�����ˡ�Υ������ѹ�
		 */
		if (arguments.length == 2) {
			if (arguments[1] == 'silk') {
				var opp = $(my).siblings('input').val() - 0;
				var num = mypage.check_NaN(my);
				if (opp <= 27) {
					if (num > 35) num = 35;
				} else {
					if (num > 27) num = 27;
				}
				my.value = num;
			}
		} else {
			mypage.calcPrintFee();
		}
		mypage.prop.modified = true;
	},
	setPrintPosition: function (my) {
		var src = $(my).attr('src');
		var path = src.replace(/img\/printposition/, 'txt');
		path = path.slice(0, path.lastIndexOf('/') + 1);
		var filename = $(my).attr('alt');
		mypage.prop.curr_ppImage.siblings('.position_name_wrapper').find('span').text(filename);
		path += filename + '.txt';
		mypage.prop.curr_ppImage.load(path, function () {
			$('#printposition_wrapper').fadeOut();
			mypage.screenOverlay(false);
			mypage.prop.curr_ppImage = "";
		});

		var ppInk = mypage.prop.curr_ppImage.siblings('.pp_ink');
		ppInk.children('p').children('.pos_name').each(function () {
			$(this).attr('alt', '').next('img').attr({
				'src': './img/circle.png'
			}).siblings('input').attr('readonly', true).val('');
		});
		mypage.prop.modified = true;
	},
	getAddr: function (id, mode, num) {
		if ($('#' + id).attr('readonly')) return;
		var val = $('#' + id).val();
		if (mode == "zipcode") {
			if (!this.check_zipcode(val)) return;
		}
		var self = $('#' + id).attr('name');
		if (num == 1) {
			AjaxZip3.zip2addr(self, '', 'addr0', 'addr1');
		} else if (num == 2) {
			AjaxZip3.zip2addr(self, '', 'deliaddr0', 'deliaddr1');
		} else {
			AjaxZip3.zip2addr(self, '', 'shipaddr0', 'shipaddr1');
		}
	},
	setAddr: function (num, zipcode, addr0, addr1, addr2) {
		if (num == 1) {
			$('#addr0').val(addr0);
			$('#addr1').val(addr1);
			$('#addr2').val(addr2);
		} else if (num == 2) {
			$('#deliaddr0').val(addr0);
			$('#deliaddr1').val(addr1);
			$('#deliaddr2').val(addr2);
		} else {
			$('#shipaddr0').val(addr0);
			$('#shipaddr1').val(addr1);
			$('#shipaddr2').val(addr2);
		}
		$('#zipcode' + num).val(zipcode).focusout();
		$('#address_wrapper' + num).fadeOut('normal', function () {
			$('#address_list' + num).html('');
		});
	},
	save: function (mode) {
		/*
		 *	��¸
		 * 	@mode		order		��������
		 * 				direction	����ؼ���
		 * 	@��2����	�������ϲ��̤�ID�ν񤭴�����̵ͭ��true:�񴹤���(default)��false:�񴹤��ʤ�
		 */
		var i = 0;
		var t = 0;
		var isRewrite = arguments.length > 1 ? arguments[1] : true;
		var isReturn = true; // AJAX ���֤���Ƚ�ꡢerror�ΤȤ���false
		var field1 = [];
		var data1 = [];
		var orders_id = $('#order_id').text() - 0;

		switch (mode) {
			case 'firstcontact':
				field1 = ['orders_id', 'staff_id', 'medianame', 'attr'];
				data1 = [];
				data1[0] = 0;
				data1[1] = $('#reception').val();
				data1[2] = $(':radio[name="mediacheck02"]:checked').val() || "";
				data1[3] = $(':radio[name="purpose"]:checked').val();
				$.ajax({
					url: './php_libs/ordersinfo.php',
					type: 'POST',
					async: false,
					data: {
						'act': 'insert',
						'mode': 'firstcontact',
						'field1[]': field1,
						'data1[]': data1
					},
					success: function (r) {
						if (r.trim() == '') {
							alert('Error: p1692\n' + r);
							isReturn = false;
							return;
						}
					}
				});
				break;
			case 'order':
				// �����Ԥ����ȯ����ν������ԲĤˤ���
				if ((mypage.prop.shipped == 2 || mypage.prop.isCheckbill) && _my_level != "administrator") {
					alert("ȯ���ѤߤΥǡ����򹹿����뤳�ȤϤǤ��ޤ���");
					return;
				}

				// ������ʸ�ξ���ɬ�ܹ��ܤ�̤���Ϥξ��֤���¸����ߤ���
				if (mypage.prop.firmorder) {
					if (!mypage.confirm()) {
						return false;
					}
				}
				if ($('#reception').val() == '0') {
					alert('����ô���Ԥ���ꤷ�Ʋ�������');
					return false;
				}

				// �޵ͤ���ʸ����γ�ǧ
				if ($('input[name="package"]:checked', '#package_wrap').length == 0) {
					alert("�޵ͤ�̵ͭ�򤴳�ǧ����������");
					return false;
				} else if ($('input[name="package"]:checked', '#package_wrap').length > 1) {
					var order_amount = $('#total_amount').val() - 0;
					var volume = 0;
					$('input[name="package"]:checked', '#package_wrap').each(function () {
						var state = $(this).val();
						volume += $('#pack_' + state + '_volume').val() - 0;
					});
					if (order_amount < volume) {
						alert("�޵ͤ�����򤴳�ǧ����������");
						return false;
					}
				}

				// ��ԡ�������ʸ�ξ�硢�����ɹ�������¸���ǽ���Ŭ�Ѿ��˰㤤���ʤ�����ǧ
				if (mypage.prop.ordertype == "general" && mypage.prop.repeat > 0) {
					$.ajax({
						url: './php_libs/ordersinfo.php',
						type: 'POST',
						dataType: 'json',
						async: false,
						data: {
							'act': 'search',
							'mode': 'reuse',
							'field1[]': ['id'],
							'data1[]': [mypage.prop.repeat]
						},
						success: function (r) {
							if (r instanceof Array) {
								var len = r.length;
								// ������ʸ�ξ���������ʸ��ޤ�
								if (mypage.prop.firmorder) {
									len--;
								}

								var temp = 0;
								if (len == 0) {
									temp = 1;
								} else {
									temp = 2;
								}
								if (temp != mypage.prop.reuse) {
									mypage.prop.reuse = temp;
									isReturn = false;
									alert('��ԡ����ǳ����Ŭ�Ѿ�郎�Ѥ�äƤ��ޤ����Ʒ׻���ԤäƤ���������');
								}
							} else {
								isReturn = false;
								alert('Error: p3819\n' + r);
							}
						},
						error: function (XMLHttpRequest, textStatus, errorThrown) {
							isReturn = false;
							alert('Error: p3824\n' + textStatus);
						}
					});
					if (!isReturn) {
						return false;
					}
				}

				// ����BOX�θ���
				if (mypage.prop.ordertype == "general") {
					var valid1 = $('#est_printfee').val().replace(/,/g, '') - 0;
					$('#est_table1 tbody th:not(.sub)').each(function () {
						valid1 += $(this).next().text().replace(/,/g, '') - 0;
					});
					var valid2 = $('#est_basefee').text().replace(/,/g, '') - 0;
					if (valid1 != valid2) {
						alert("���ѹ�פ���äƤ��ޤ��󡣺Ʒ׻����Ƥ���������");
						return false;
					}
					valid2 += $('#est_salestax').text().replace(/,/g, '') - 0;
					valid2 += $('#est_creditfee').text().replace(/,/g, '') - 0;
					var valid3 = $('#est_total_price').text().replace(/,/g, '') - 0;
					if (valid2 != valid3) {
						alert("���ѹ�פ���äƤ��ޤ��󡣺Ʒ׻����Ƥ���������");
						return false;
					}
				}

				// �����⡼��
				var action = 'insert';
				if (($('#order_id').text() - 0) != 0) {
					action = 'update';
				}

				// customer section
				//------------------------
				var elem, val, flg = false;
				var f = document.forms.customer_form;
				field1 = [];
				data1 = [];
				var chkField = [];
				var chkData = [];

				if (($('#customer_id').text() - 0) == 0) {
					if (f.customername.value == "" || (f.tel.value == "" && f.mobile.value == "" && f.email.value == "" && f.mobmail.value == "")) {
						alert("�ܵ�̾��Ϣ�����Tel��E-Mail�Τ����줫�ˤ�ɬ�ܹ��ܤǤ���");
						return false;
					}

					val = "";
					elem = f.elements;
					for (i = 0; i < elem.length; i++) {
						if ((elem[i].type == "text" && !$(elem[i]).attr('readonly')) || elem[i].type == "hidden" || elem[i].type == "select-one") {
							// ��Ͽ�ѥǡ���
							val = elem[i].value;
							if (elem[i].name.match(/^(tel$)|(fax$)|(mobile$)|(zipcode$)/)) val = val.replace(/-/g, "");
							if (val != "") flg = true;
							field1.push(elem[i].name);
							data1.push(val);

							// ��ʣ�����å��Ѥι��ܤ����
							if (elem[i].name.match(/^(company$)|(customername$)|(tel$)|(mobile$)|(email$)/)) {
								chkField.push(elem[i].name);
								chkData.push(val);
							}
						}
					}

					var note = f.customernote.value.trim();
					if (f.customernote.value != "") {
						field1.push('customernote');
						data1.push(note);
						f.customernote.value = note;
					}

					if (flg) {
						// ��ʣ�Υ����å�
						chkField.push('customer');
						chkData.push(true);
						$.ajax({
							url: './php_libs/ordersinfo.php',
							type: 'POST',
							dataType: 'json',
							async: false,
							data: {
								'act': 'search',
								'mode': 'dedupe',
								'field1[]': chkField,
								'data1[]': chkData
							},
							success: function (r) {
								if (r instanceof Array) {
									if (r.length > 0) {
										isReturn = confirm("�ܵҾ��󤬽�ʣ�����ǽ��������ޤ����������Ǥ�����\n\n1.�ϣˡ������Τޤ���¸���롣\n2.Cancel������¸�θܵҥꥹ�Ȥ������֡�");
										if (isReturn) return;

										// ��¸�θܵҤ��ǧ
										mypage.prop.customer_list = r;
										var list = '<table><thead><tr><th>����ֹ�</th><th>�ܵ�̾</th><th>ô��</th><th>TEL</th><th>E-Mail</th><th>����</th></tr></thead><tbody>';
										for (i = 0; i < r.length; i++) {
											list += '<tr onclick="mypage.setCustomer(' + i + ')">';
											list += '<td>' + r[i]['cstprefix'].toUpperCase() + r[i]['number'] + '</td>';
											list += '<td>' + r[i]['customername'] + '</td>';
											list += '<td>' + r[i]['company'] + '</td>';
											list += '<td>' + r[i]['tel'] + '</td>';
											list += '<td>' + r[i]['email'] + '</td>';
											list += '<td>' + r[i]['addr0'] + r[i]['addr1'] + '</td>';
											list += '</tr>';
										}
										list += '</tbody>';

										if ((navigator.userAgent).match(/Chrome/i)) {
											$('.result_list', '#result_customer_wrapper').css('padding-right', '18px').html(list);
										} else {
											$('.result_list', '#result_customer_wrapper').html(list);
										}
										$('#result_customer_wrapper').show('normal');
									}
								} else {
									alert('Error: p2391\n' + r);
								}
							}
						});

						// ��¸���������
						if (!isReturn) {
							return false;
						}

						$('#search_customer').hide();
						$('#modify_customer').show().next().hide();
						mypage.inputControl(f, false);
					} else {
						field1 = [];
						data1 = [];
					}
				} else {
					if (!$('#customername').hasClass('nostyle')) $('#modify_customer').click();
				}

				// delivery section
				//------------------------
				f = document.forms.delivery_form;
				var field2 = [];
				var data2 = [];
				flg = false;
				val = "";
				elem = f.elements;
				for (i = 0; i < elem.length; i++) {
					if (elem[i].type == "text") {
						val = elem[i].value;
						if (elem[i].name == 'delitel' || elem[i].name == "delizipcode") val = val.replace(/-/g, "");
						if (val != "" || action == 'update') flg = true;
						field2.push(elem[i].name);
						data2.push(val);
					}
				}
				if (!flg) {
					field2 = [];
					data2 = [];
				}

				// ship-from section
				//------------------------
				f = document.forms.shipfrom_form;
				var field12 = [];
				var data12 = [];
				flg = false;
				val = "";
				elem = f.elements;
				for (i = 0; i < elem.length; i++) {
					if (elem[i].type == "text" && !$(elem[i]).attr('readonly')) {
						val = elem[i].value;
						if (elem[i].name == 'shiptel' || elem[i].name == "shipzipcode") val = val.replace(/-/g, "");
						if (val != "") flg = true;
						field12.push(elem[i].name);
						data12.push(val);
					}
				}
				if (!flg) {
					field12 = [];
					data12 = [];
				}

				// accepting orders section
				//------------------------
				var field3 = ['id'];
				var data3 = ['0'];

				if (($('#order_id').text() - 0) != 0) {
					field3[0] = 'id';
					data3[0] = $('#order_id').text() - 0;
				}

				for (i = 1; i < mypage.order_info.id.length; i++) {
					field3[i] = mypage.order_info.id[i];
					if (mypage.order_info.id[i] !== 'receipt_price') {
						data3[i] = $('#' + mypage.order_info.id[i]).val();
					} else {
						data3[i] = $('#' + mypage.order_info.id[i]).val().replace(/,/g, '');
					}
				}

				for (i = mypage.order_info.id.length, t = 0; t < mypage.order_info.name.length; i++, t++) {
					field3[i] = mypage.order_info.name[t];
					elem = $(':input[name="' + mypage.order_info.name[t] + '"]');
					if (elem.length===0) continue;
					switch (elem[0].type) {
						case 'text':
						case 'number':
							data3[i] = $(':input[name="' + mypage.order_info.name[t] + '"]').val().replace(/,/g, '');
							break;
						case 'checkbox':
							var checkbox = $(':input[name="' + mypage.order_info.name[t] + '"]:checked');
							if (checkbox.length > 0) {
								if (mypage.order_info.name[t] == 'staffdiscount') {
									data3[i] = checkbox.val();
								} else {
									data3[i] = checkbox.length;
								}
							} else {
								data3[i] = 0;
							}
							break;
						default:
							var radio = $(':input[name="' + mypage.order_info.name[t] + '"]:checked');
							if (radio.length > 0) {
								if (mypage.order_info.name[t] == 'payment' && (radio.val() == 'other' && $('#payment_other').val() != '')) {
									data3[i] = $('#payment_other').val();
								} else {
									data3[i] = radio.val();
								}
							} else {
								data3[i] = "";
							}
							break;
					}
				}

				field3.push('maintitle');
				data3.push($('#maintitle').val());
				field3.push('customer_id');
				data3.push(document.forms.customer_form.customer_id.value);
				field3.push('estimated');
				if (mypage.prop.ordertype == "general") {
					data3.push($('#est_total_price').text().replace(/,/g, ''));
				} else {
					data3.push($('#total_estimate_cost').val().replace(/,/g, ''));
				}
				field3.push('order_amount');
				data3.push($('#total_amount').val().replace(/,/g, ''));

				var purpose_text = '';
				if ($(':radio[name="purpose"]:checked', '#questionnaire_table').val() == '����¾���٥��') {
					purpose_text = $('#questionnaire_table .other_1').val();
				} else if ($(':radio[name="purpose"]:checked', '#questionnaire_table').val() == '����¾��˥ե�����') {
					purpose_text = $('#questionnaire_table .other_2').val();
				} else if ($(':radio[name="purpose"]:checked', '#questionnaire_table').val() == '����¾����') {
					purpose_text = $('#questionnaire_table .other_3').val();
				}
				field3.push('purpose_text');
				data3.push(purpose_text);
				field3.push('repeater');
				data3.push(mypage.prop.repeat);
				field3.push('applyto');
				data3.push(mypage.prop.applyto);

				field3.push('reuse');
				if (mypage.prop.firmorder) {
					data3.push(mypage.prop.reuse);
				} else if (mypage.prop.isRepeatFirst) {
					data3.push(1);
				} else if (mypage.prop.isRepeat) {
					data3.push(2);
				} else {
					data3.push(0);
				}

				// �޵�
				$('input[name="package"]', '#package_wrap').each(function () {
					var state = $(this).val();
					var isChecked = false;
					field3.push('package_' + state);
					if ($(this).is(':checked')) {
						data3.push(1);
						isChecked = true;
					} else {
						data3.push(0);
					}
					// ���
					if (state != 'no') {
						field3.push('pack_' + state + '_volume');
						if (isChecked) {
							data3.push($('#pack_' + state + '_volume').val());
						} else {
							data3.push(0);
						}
					}
				});

				// �����ñ�ȡ�
				var discount_name = "";
				$('input[name="discount"]', '#discount_table').each(function () {
					if ($(this).attr('checked')) discount_name += $(this).val() + "1,";
					else discount_name += $(this).val() + "0,";

				});
				field3.push('discount');
				data3.push(discount_name.slice(0, -1));

				// ��ǥ��������å�
				var mediadata = "";
				var media_other = "";
				$(':radio[name!="firstcontact"]', '#mediacheck_wrapper').each(function () {
					if ($(this).attr('checked')) {
						if ($(this).attr('name') == 'mediacheck03' && $(this).val() == 'other') {
							media_other = $('#mediacheck03_other').val();
						} else {
							mediadata += $(this).attr('name') + "|" + $(this).val() + ",";
						}
					}
				});
				field3.push('media');
				data3.push(mediadata.slice(0, -1));

				// ����¾�������å�����Ƥ�����Υƥ�����
				if (media_other != "") {
					field3.push('media_other');
					data3.push(media_other);
				}

				// �ܵҤ������ʬ������
				field3.push('bill');
				data3.push(document.forms.customer_form.bill.value);

				var data4 = [];
				var field4 = [];
				if (mypage.prop.ordertype == "general") {
					// estimate details for general mode
					//------------------------
					var ary = ['productfee', 'printfee', 'silkprintfee', 'colorprintfee', 'digitprintfee', 'inkjetprintfee', 'cuttingprintfee', 'embroideryprintfee',
						'exchinkfee', 'additionalfee', 'packfee', 'expressfee', 'discountfee', 'reductionfee', 'carriagefee', 'extracarryfee', 'designfee',
						'codfee', 'paymentfee', 'conbifee', 'basefee', 'salestax', 'creditfee'];
					field3 = field3.concat(ary);
					var len3 = data3.length;
					data3[len3++] = $('#est_price').text().replace(/,/g, '');
					data3[len3++] = $('#est_printfee').val().replace(/,/g, '');
					data3[len3++] = $('#est_silk_printfee').text().replace(/,/g, '');
					data3[len3++] = $('#est_color_printfee').text().replace(/,/g, '');
					data3[len3++] = $('#est_digit_printfee').text().replace(/,/g, '');
					data3[len3++] = $('#est_inkjet_printfee').text().replace(/,/g, '');
					data3[len3++] = $('#est_cutting_printfee').text().replace(/,/g, '');
					data3[len3++] = $('#est_embroidery_printfee').text().replace(/,/g, '');
					data3[len3++] = $('#est_exchink').text().replace(/,/g, '');
					data3[len3++] = $('#est_additionalfee').text().replace(/,/g, '');
					data3[len3++] = $('#est_package').text().replace(/,/g, '');
					data3[len3++] = $('#est_express').text().replace(/,/g, '');
					data3[len3++] = $('#est_discount').text().replace(/,/g, '');
					data3[len3++] = $('#est_reduction').text().replace(/,/g, '');
					data3[len3++] = $('#est_carriage').text().replace(/,/g, '');
					data3[len3++] = 0; // extracarryfee
					data3[len3++] = $('#est_designfee').text().replace(/,/g, '');
					data3[len3++] = $('#est_codfee').text().replace(/,/g, '');
					data3[len3++] = $('#est_paymentfee').text().replace(/,/g, '');
					data3[len3++] = $('#est_conbifee').text().replace(/,/g, '');
					data3[len3++] = $('#est_basefee').text().replace(/,/g, '');
					data3[len3++] = $('#est_salestax').text().replace(/,/g, '');
					data3[len3++] = $('#est_creditfee').text().replace(/,/g, '');

					// item data
					var itemprice_hash = {};
					$('#itemprint tbody tr').each(function () {
						var itemid = $(this).attr('class').split('_')[1];
						itemprice_hash[itemid] = {
							'fee': $(this).find('.fee').text().replace(/,/g, ''),
							'one': $(this).find('.perone').text().replace(/,/g, '')
						};
					});
					field4 = ['master_id', 'choice', 'plateis', 'size_id', 'amount', 'item_cost', 'item_printfee', 'item_printone', 'item_id', 'item_name', 'stock_number', 'maker', 'size_name', 'item_color', 'price'];
					$('#orderlist tbody tr').each(function () {
						var $td0 = $(this).children('td:eq(0)');
						var master_id = $td0.children('.masterid').text().trim();
						var item_id = $td0.children('.itemid').text().trim();
						var amount = $(this).find('.listamount').val().replace(/,/g, '');
						var item_fee = (typeof itemprice_hash[item_id] == 'undefined') ? 0 : itemprice_hash[item_id]['fee'];
						var item_one = (typeof itemprice_hash[item_id] == 'undefined') ? 0 : itemprice_hash[item_id]['one'];
						var dat = master_id + '|' + $(this).find('.choice:checked').length;
						dat += '|' + $(this).find('.plateis').val();
						if (item_id.indexOf('_') == -1) {
							dat += '|' + $('.itemsize_name img', this).attr('id').split('_')[1];
							dat += '|' + amount;
							dat += '|' + $(this).find('.itemcost').text().replace(/,/g, '');
							dat += '|' + item_fee;
							dat += '|' + item_one;
							dat += '|||||||';

						} else {
							item_id = item_id.split('_')[0] == 0 ? 0 : 100000;
							dat += '|0';
							dat += '|' + amount;
							dat += '|' + $(this).find('.itemcost').val().replace(/,/g, '');
							dat += '|0|0';
							dat += '|' + item_id;
							dat += '|' + $(this).children('.item_selector').text().trim();
							dat += '|' + $(this).children('td:last').children('span:eq(0)').text().trim();
							dat += '|' + $(this).children('td:last').children('span:eq(1)').text().trim();
							dat += '|' + $(this).find('.extsize').val().trim();
							dat += '|' + $(this).find('.extcolor').val().trim();
							dat += '|' + $(this).find('.itemcost').val().replace(/,/g, '');
						}
						data4.push(dat);
					});
				} else if (mypage.prop.ordertype == "industry") {
					// item data
					field4 = ['item_id', 'item_name', 'position_id', 'stock_number', 'maker', 'size_name', 'item_color', 'amount', 'price', 'plateis', 'master_id', 'size_id'];
					$('#orderlist tbody tr').each(function () {
						var extra = '';
						var master_id = 0;
						var size_id = 0;
						var item_id = $(this).children('td:eq(0)').children('.itemid').text().trim().split('_')[0];
						var position_id = $(this).children('td:eq(0)').children('.positionid').text().trim();
						if (position_id.indexOf('_') > -1) {
							if (item_id == 100) item_id = item_id.split('_')[0] + '000';
							extra = item_id + '|' + $(this).children('td.item_selector').text().trim() + '|';
						} else if (item_id == '99999') {
							extra = item_id + '|' + $(this).children('td.item_selector').text().trim() + '|';
						} else {
							extra = item_id + '|';
							if ($(this).children('td.item_selector').children('select').length > 0) {
								extra += $(this).children('td.item_selector').find('option:selected').text().trim() + '|';
							} else {
								extra += $(this).children('td.item_selector').text().trim() + '|';
							}
						}
						extra += position_id + '|';
						var size_field = $(this).children('td.itemsize_name');
						extra += $(this).children('td:last').children('span:eq(0)').text().trim() + '|';
						extra += $(this).children('td:last').children('span:eq(1)').text().trim() + '|';
						if (position_id.indexOf('_') > -1) {
							extra += size_field.children().val().trim() + '|';
							extra += $(this).children('td.itemcolor_name').children().val().trim() + '|';
						} else {
							extra += size_field.text().trim() + '|';
							extra += $(this).children('td.itemcolor_name').text().trim() + '|';
							if (position_id != 99) {
								var target = size_field.children('img');
								master_id = target.attr('alt').split('_')[0];
								size_id = target.attr('id').split('_')[1];
							}
						}
						extra += $(this).find('.listamount').val().replace(/,/g, '') + '|';
						extra += $(this).find('.itemcost').val().replace(/,/g, '') + '|';
						extra += $(this).find('.plateis').val() + '|';
						extra += master_id + '|';
						extra += size_id;
						data4.push(extra);
					});

					// additional estimate
					var data5 = [];
					var field5 = ['addprice', 'addestid', 'addsummary', 'addamount', 'addcost'];
					$('#orderlist tfoot tr.estimate').each(function () {
						var args = $(this).find('.price').val().replace(/,/g, '');
						if (args == "0") return true; // continue
						args += '|';
						args += $(this).children('td:first').text().trim() + '|';
						args += $(this).find('.summary').val() + '|';
						args += $(this).find('.amount').val().replace(/,/g, '') + '|';
						args += $(this).find('.cost').val().replace(/,/g, '');
						data5.push(args);
					});

				}

				/* print information
				 *------------------------
				 *	field6  orderprint
				 *	field7  orderarea
				 *	field8  orderselectivearea
				 *	field9  orderink
				 *	field10 exchink
				 *	
				 *	orderarea.print_id = orderprint����Υ���ǥå���
				 *	orderselectivearea.area_id = orderarea����Υ���ǥå���
				 *	orderink.area_id = orderarea����Υ���ǥå���
				 *	exchink.ink_id = orderink����Υ���ǥå���
				 */
				var field6 = ['category_id', 'printposition_id', 'subprice'];
				var field7 = ['areaid', 'print_id', 'area_name', 'area_path', 'origin', 'ink_count', 'print_type',
							  'areasize_from', 'areasize_to', 'areasize_id', 'print_option', 'jumbo_plate', 'design_plate',
							  'design_type', 'design_size', 'repeat_check', 'silkmethod'];
				var field8 = ['areaid', 'area_id', 'selective_key', 'selective_name'];
				var field9 = ['inkid', 'area_id', 'ink_name', 'ink_code', 'ink_position'];
				var field10 = ['exchid', 'ink_id', 'exchink_name', 'exchink_code', 'exchink_volume'];
				var orderprint = [];
				var orderarea = [];
				var orderselectivearea = [];
				var orderink = [];
				var exchink = [];
				var print_id = 0;
				var area_id = 0;
				var select_id = 0;
				var ink_id = 0;
				// var exch_id = 0;

				// ���ƥ��꡼ID���ȤΥץ��ȥݥ������ID�Υϥå���
				var selected_items = [];
				$('#orderlist tbody tr').each(function () {
					// ���̤ξ�硢�����å�����Ƥ��륢���ƥ�Υץ��Ȱ��֤�������Ͽ����
					if (mypage.prop.ordertype == "general" && !$(this).find('.choice').is(':checked')) return true; // continue
					var ppID = $(this).children('td:eq(0)').children('.positionid').text();
					var categoryid = $(this).children('td:eq(2)').attr('class').split('_')[1];
					if (typeof selected_items[categoryid] == 'undefined') {
						selected_items[categoryid] = [];
					}
					selected_items[categoryid][ppID] = true;
				});

				var repeatdesign = 0; // 1�ĤǤ��ԥ����å�������� 1���ʤ���� 0
				var allrepeat = 1; // 1:���ƥ�ԡ��ȡ�0:���Ǥ�1�İʾ夢��
				$('#pp_wrapper').children('div:even').each(function () { // pp_toggler
					var category_id = $(this).attr('id').slice($(this).attr('id').lastIndexOf('_') + 1);
					if (mypage.prop.ordertype == "general" && typeof selected_items[category_id] == 'undefined') return true; // continue
					var subprice = 0;
					if (mypage.prop.ordertype == "general") {
						subprice = $(this).find('.sub_price').val().replace(/,/g, '');
					}

					$(this).next().children().each(function () { // printposition
						var printposition_id = $(this).attr('class').slice($(this).attr('class').indexOf('_') + 1);
						if (mypage.prop.ordertype == "general" && typeof selected_items[category_id][printposition_id] == 'undefined') return true; // continue

						// orderprint table
						orderprint[print_id] = category_id + '|' + printposition_id + '|' + subprice;

						$(this).children('.pp_box').each(function () {
							var self = $(this);
							var repeat_check = self.find('.repeat_check:checked').length;
							var areaid = self.attr('id').split('_')[1] || 0;
							var area_name = self.children('.position_name_wrapper').children('.current').children('span').text();
							var area_path = '';
							if (area_name == 'free') {
								area_path = "free";
							} else {
								area_path = self.children('.pp_image').children('img:nth-child(1)').attr('src');
//								area_path = area_path.slice(20, area_path.lastIndexOf('/'));
								area_path = area_path.slice(area_path.indexOf('printposition/')+14,area_path.lastIndexOf('/'));
							}
							var origin = 1;
							if (self.children('.pp_price').find('.del_print_position').length == 1) {
								origin = 0;
							}
							var elem = self.children('.pp_info');
							var ink_count = elem.find('.ink_count').val();
							var print_type = elem.find('.print_type').val();
							var design_plate = elem.find('.designplate').val();
							var design_size = elem.find('.design_size').val();

							var design_type = elem.find('.design_type').val();
							var design_type_note = elem.find('.design_type_note').val();
							if (design_type_note != '') design_type = design_type_note;

							var areasize_from = 0;
							var areasize_to = 0;
							var areasize_id = 0;
							var jumbo_plate = 0;
							var silkmethod = 1;
							var print_option = 0;
							switch (print_type) {
								case 'silk':
									// orderink table
									self.children('.pp_ink').children('p').each(function () {
										if ($(this).children('input:eq(1)').val() != "") {
											var ink_code = $(this).children('img.palette').attr('alt');
											var inkid = $(this).attr('id').split('_')[1] || 0;
											var ink_name = $(this).children('input:eq(1)').val();
											var ink_position = $(this).children('.pos_name').attr('alt');
											orderink[ink_id] = inkid + '|' + area_id + '|' + ink_name + '|' + ink_code + '|' + ink_position;
											ink_id++;
										}
									});
									areasize_from = elem.find('.areasize_from').val() - 0;
									areasize_to = elem.find('.areasize_to').val() - 0;
									jumbo_plate = elem.find('.jumbo_plate:checked').val();
									var silkmethod_checker = elem.find('.silkmethod:checked');
									if (silkmethod_checker.length > 0) {
										silkmethod = silkmethod_checker.val();
									}
									break;
								case 'inkjet':
								case 'trans':
									areasize_id = elem.find('.areasize_id').val();
									print_option = elem.find('.inkoption').val();
									break;
								case 'digit':
									areasize_id = elem.find('.areasize_id').val();
									break;
								case 'cutting':
									self.children('.pp_ink').children('p').each(function () {
										if ($(this).children('input:eq(1)').val() != "") {
											var ink_code = $(this).children('img.palette').attr('alt');
											var inkid = $(this).attr('id').split('_')[1] || 0;
											var ink_name = $(this).children('input:eq(1)').val();
											var ink_position = $(this).children('.pos_name').attr('alt');
											orderink[ink_id] = inkid + '|' + area_id + '|' + ink_name + '|' + ink_code + '|' + ink_position;
											ink_id++;
										}
									});
									areasize_id = elem.find('.areasize_id').val();
									break;
								case 'embroidery':
									self.children('.pp_ink').children('p').each(function () {
										if ($(this).children('input:eq(1)').val() != "") {
											var ink_code = $(this).children('img.palette').attr('alt');
											var inkid = $(this).attr('id').split('_')[1] || 0;
											var ink_name = $(this).children('input:eq(1)').val();
											var ink_position = $(this).children('.pos_name').attr('alt');
											orderink[ink_id] = inkid + '|' + area_id + '|' + ink_name + '|' + ink_code + '|' + ink_position;
											ink_id++;
										}
									});
									areasize_id = elem.find('.areasize_id').val();
									print_option = elem.find('.inkoption').val();
									break;
							}

							// orderarea table
							orderarea[area_id] = areaid + '|' + print_id + '|' + area_name + '|' + area_path + '|' + origin + '|' + ink_count + '|' + print_type +
								'|' + areasize_from + '|' + areasize_to + '|' + areasize_id + '|' + print_option + '|' + jumbo_plate + '|' + design_plate +
								'|' + design_type + '|' + design_size + '|' + repeat_check + '|' + silkmethod;

							// orderselectivearea table
							if (area_name != 'free') {
								self.children('.pp_image').children('img:not(:nth-child(1))').each(function () {
									if (($(this).attr('src')).match(/_on.png$/)) {
										var selective_key = $(this).attr('class');
										var selective_name = $(this).attr('alt');
										orderselectivearea[select_id++] = areaid + '|' + area_id + '|' + selective_key + '|' + selective_name;
										return false; // break
									}
								});
							}

							// ��ԥ����å���̵ͭ
							if (repeat_check != 0) {
								repeatdesign = 1; // ��ԥ����å�����
							} else {
								allrepeat = 0; // ����
							}

							area_id++;

						});

						print_id++;

					});
				});

				field3.push('repeatdesign');
				data3.push(repeatdesign);
				field3.push('allrepeat');
				data3.push(allrepeat);
				
				// send orders data
				//------------------------
				$.ajax({
					url: './php_libs/ordersinfo.php',
					type: 'POST',
					async: false,
					data: {
						'act': action,
						'mode': 'order',
						'field1[]': field1,
						'data1[]': data1,
						'field2[]': field2,
						'data2[]': data2,
						'field3[]': field3,
						'data3[]': data3,
						'field4[]': field4,
						'data4[]': data4,
						'field5[]': field5,
						'data5[]': data5,
						'field6[]': field6,
						'data6[]': orderprint,
						'field7[]': field7,
						'data7[]': orderarea,
						'field8[]': field8,
						'data8[]': orderselectivearea,
						'field9[]': field9,
						'data9[]': orderink,
						'field10[]': field10,
						'data10[]': exchink,
						'field12[]': field12,
						'data12[]': data12
					},
					success: function (r) {
						if (r.trim() == '') {
							alert('Error: p2875\n' + r);
							isReturn = false;
							return;
						}
						var i = 0;
						var ids = r.split('|');
						var id = [];
						for (i = 0; i < ids.length; i++) {
							id[i] = ids[i].split(',');
						}
						if (!id[0][0].match(/^\d+?$/)) {
							alert('Error: p2886' + r);
							isReturn = false;
							return;
						}

						if (isRewrite) {
							// orders_id, customer_id
							//-----------------------------------
							var formated_id = ("000000000" + id[0][0]).slice(-9);
							$('#order_id').text(formated_id);

							var customer_id = id[0][1];
							if (customer_id != '0') {
								document.forms.customer_form.customer_id.value = customer_id;
							}

							var delivery_id = id[0][2];
							document.forms.delivery_form.delivery_id.value = delivery_id;

							var number = id[0][3];
							if (number != '') {
								var prefix = document.forms.customer_form.cstprefix.value;
								if (prefix == 'g') {
									document.forms.customer_form.number.value = 'G' + ("0000" + number).slice(-4);
								} else {
									document.forms.customer_form.number.value = 'K' + ("000000" + number).slice(-6);
								}
							}

							// orderarea_id
							//-----------------------------------
							if (id[1].length > 0 && id[1][0] != "") {
								var ppbox = $('#pp_wrapper .pp_toggle_body .pp_box');
								for (i = 0; i < ppbox.length; i++) {
									$(ppbox[i]).attr('id', '#areaid_' + id[1][i]);
								}
							}

							// orderink_id
							//-----------------------------------
							if (id[2].length > 0 && id[2][0] != "") {
								i = 0;
								$('#pp_wrapper .pp_toggle_body .pp_box').children('.pp_ink').children('p').each(function () {
									if ($(this).children('input:eq(1)').val() != "") {
										$(this).attr('id', '#inkid_' + id[2][i++]);
									}
								});
							}

							// additionalestimate_id
							//-----------------------------------
							if (id[4].length > 0 && id[4][0] != "") {
								var row = $('#orderlist tfoot tr.estimate');
								for (i = 0; i < id[4].length; i++) {
									$(row[i]).children('td:first').text(id[4][i]);
								}
							}

							// bundle status
							//-----------------------------------
							if (id.length > 5) {
								if (id[5].length > 0 && id[5][0] != "") {
									if (id[5][0] == 1) {
										$('#bundle_status').show();
									} else {
										$('#bundle_status').hide();
									}
								}
							}

							mypage.displayFor('modify');
							if (delivery_id != 0) {
								mypage.inputControl(document.forms.delivery_form, false);
							} else {
								mypage.inputControl(document.forms.delivery_form, true);
							}
						}
						
						// ��ʸ�����ꤷ�Ƥ�����ϡ�����ؼ���򹹿�
						if ($('#order_completed:visible').length > 0) {
							$.ajax({
								url: './php_libs/ordersinfo.php',
								type: 'POST',
								dataType: 'text',
								data: {
									'act': 'insert',
									'mode': 'direction',
									'field1[]': ['orders_id', 'ordertype'],
									'data1[]': [orders_id, mypage.prop.ordertype]
								},
								async: false,
								success: function (r) {}
							});
						}
					}
				});

				// ��¸��������ߤ���
				if (!isReturn) {
					mypage.screenOverlay(false);
					return isReturn;
				}

				// ���顼�Ȥκ�����
				if ($('#order_comment').val().trim() != "") {
					$("#alert_comment:hidden").effect('pulsate', {
						'times': 4
					}, 250);
				} else {
					$("#alert_comment").fadeOut();
				}
				$("#alert_require").fadeOut();

				// ���϶�ʬ���ѹ����ԲĤˤ���
				if (mypage.prop.ordertype == "industry") {
					$('#ordertype_industry').next().show();
					$('#ordertype_general').next().hide();
				} else {
					$('#ordertype_industry').next().hide();
					$('#ordertype_general').next().show();
				}
				$(':radio[name="ordertype"]', '#enableline').hide();

				// ������ʸ�ν�����¸�ξ���ȯ�����֤�����å�
				if (mypage.prop.firmorder) {
					var isNotBring = false;
					$('#orderlist tbody tr').each(function () {
						category_id = (($(this).children('td:eq(2)').attr('class')).split('_'))[1];
						if (category_id != 100) isNotBring = true;
					});
					if (isNotBring && $('#state_0 input').attr('checked') == false) {
						// �����ʳ��ξ��ʤ�������ȯ����̤�����å�
						$('#order_stock').show();
					} else {
						$('#order_stock').hide();
					}
				}
				mypage.prop.modified = false;
				break;

			case 'direction':
				// �����ץ��ȥ����פˤĤ��ƤΤ���Ͽ

				// �����Ԥ����ȯ����ν������ԲĤˤ���
				if ((mypage.prop.shipped == 2 || mypage.prop.isCheckbill) && _my_level != "administrator") {
					alert("ȯ���ѤߤΥǡ����򹹿����뤳�ȤϤǤ��ޤ���");
					return;
				}

				// ��ԡ�������ʸ�ξ�硢�����ɹ�������¸���ǽ���Ŭ�Ѿ��˰㤤���ʤ�����ǧ
				if (mypage.prop.ordertype == "general" && mypage.prop.repeat > 0) {
					$.ajax({
						url: './php_libs/ordersinfo.php',
						type: 'POST',
						dataType: 'json',
						async: false,
						data: {
							'act': 'search',
							'mode': 'reuse',
							'field1[]': ['id'],
							'data1[]': [mypage.prop.repeat]
						},
						success: function (r) {
							if (r instanceof Array) {
								var len = r.length;
								// ������ʸ�ξ���������ʸ��ޤ�
								if (mypage.prop.firmorder) {
									len--;
								}

								var temp = 0;
								if (len == 0) {
									temp = 1;
								} else {
									temp = 2;
								}

								if (temp != mypage.prop.reuse) {
									mypage.prop.reuse = temp;
									isReturn = false;
									alert('��ԡ����ǳ����Ŭ�Ѿ�郎�Ѥ�äƤ��ޤ����Ʒ׻���ԤäƤ���������');
								}
							} else {
								isReturn = false;
								alert('Error: p3819\n' + r);
							}
						},
						error: function (XMLHttpRequest, textStatus, errorThrown) {
							isReturn = false;
							alert('Error: p3824\n' + textStatus);
						}
					});
				}

				// ��¸���������
				if (!isReturn) return false;

				// ���ܾ���
				var product_id = "";
				var field = ['orders_id', 'printtype', 'workshop_note', 'envelope', 'ship_note',
						'platescount', 'platescheck', 'pastesheet', 'edge', 'edgecolor'];
				var data = [];
				data[0] = orders_id;
				data[1] = $('#curr_printtype').text();
				// data[2] = $('#arrange').val();
				data[2] = $('#workshop_note').val();
				data[3] = $('#envelope').val();
				//data[4] = $('#boxnumber').val();
				data[4] = $('#ship_note').val();
				if (data[1] != 'digit') {
					data[5] = 0;
					data[6] = 1;
					data[7] = 1;
					data[8] = 1;
					data[9] = '';
				} else {
					data[5] = $('#platescount').val();
					data[6] = $('#platescheck').val();
					data[7] = $('#pastesheet').val();
					data[8] = $('#edge').val();
					data[9] = $('#edgecolor').val();
				}

				// �ǥ������������¸
				var tabscount = $('#tabs').tabs('length');
				field4 = ['selectiveid', 'designpath'];
				data4 = [];
				for (i = 2; i <= tabscount; i++) {
					$('.printimage img:not(:nth-child(1)):visible', '#tabs-' + i).each(function () {
						var src = $(this).attr('src');
						if (!src.match(/img\/printposition\//)) {
							data4.push($(this).attr('id').slice(11) + '|' + src);
						}
					});
				}

				// ����ؼ���Υץ��Ⱦ������¸
				if (data[1] != 'silk') {
					field5 = ['pinfoid', 'remark'];
				} else {
					field5 = ['pinfoid', 'remark', 'reprint', 'platesinfo', 'meshinfo', 'attrink', 'platesnumber'];
				}
				data5 = [];

				// ���������Ȥΰ���Ĵ��
				field6 = ['pinfoid', 'sizename', 'vert', 'hori'];
				var data6 = [];

				for (i = 2; i <= tabscount; i++) {
					var pinfoid = $('#tabs-' + i).children('.tabs_wrapper').attr('id').slice(1);
					var remark = $('#tabs-' + i).find('.remark').val();
					if (data[1] == 'silk') {
						var reprint = $('#tabs-' + i).find('.reprint').val();
						var platesinfo = $('#tabs-' + i).find('.platesinfo').val();
						var meshinfo = $('#tabs-' + i).find('.meshinfo').val();
						var attrink = $('#tabs-' + i).find('.attrink').val();
						var platesnumber = $('#tabs-' + i).find('.platesnumber').val();
						data5.push(pinfoid + '|' + remark + '|' + reprint + '|' + platesinfo + '|' + meshinfo + '|' + attrink + '|' + platesnumber);
					} else {
						data5.push(pinfoid + '|' + remark + '|0|����||');
					}
					$('.dire_printinfo_table tbody tr th.sizename', '#tabs-' + i).each(function () {
						var vert = $(this).next('td').children('.vert').val();
						var hori = $(this).next('td').children('.hori').val();
						var sizename = $(this).text();
						data6.push(pinfoid + '|' + sizename + '|' + vert + '|' + hori);
					});
				}

				// ���ʤ�����
				field7 = ['id', 'orders_id', 'master_id', 'size_id', 'item_note'];
				var data7 = [];
				$('#dire_items_table tbody tr:even').each(function () {

					$(this).children('td:last').children(('p')).each(function () {
						var note = $(this).children();
						var id = note.attr('class').split('-')[1];
						if (id.indexOf('_') == -1) {
							data7.push(id + '|0|0|0|' + note.val());
						} else {
							var tmp = id.split('_');
							data7.push('0|' + tmp[0] + '|' + tmp[1] + '|' + tmp[2] + '|' + note.val());
						}
					});

				});

				// ���դ��ʥǥ�����ž�̤Τߡ�
				field8 = ['shotname', 'shot', 'sheets'];
				var data8 = [];
				$('#dire_option_table tbody tr').each(function () {
					var shotname = $(this).find('.shotname').val();
					var shot = $(this).find('.shot').val();
					var sheets = $(this).find('.sheets').val();
					if (shot > 0 && sheets > 0) {
						data8.push(shotname + '|' + shot + '|' + sheets);
					}
				});

				$.ajax({
					url: './php_libs/ordersinfo.php',
					type: 'POST',
					async: false,
					data: {
						'act': 'update',
						'mode': 'direction',
						'field1[]': field,
						'data1[]': data,
						'field4[]': field4,
						'data4[]': data4,
						'field5[]': field5,
						'data5[]': data5,
						'field6[]': field6,
						'data6[]': data6,
						'field7[]': field7,
						'data7[]': data7,
						'field8[]': field8,
						'data8[]': data8
					},
					success: function (r) {
						if (r.match(/^\d+?$/)) {
							product_id = r;
						} else {
							alert('Error: p944' + r);
							isReturn = false;
						}
					}
				});

				if (!isReturn) {
					return isReturn; // ��¸��������ߤ���
				} else {
					mypage.prop.modified = false;
					return product_id; // ����ؼ���ID���֤�
				}

				break;
		}

		return true;
	},
	setBundle: function () {
		var field5 = ['id', 'bundle', 'orders_id'];
		var data5 = [];
		var orders_id = $('#order_id').text() - 0;
		var isMine = false;
		var bundle_count = 0;
		var tmp = [];
		var a = 0;
		$('#bundle_list tbody tr').each(function () {
			var $chk = $(this).find('.check_bundle');
			var id = $chk.val();
			var bundle = $chk.is(':checked') ? 1 : 0;
			tmp[a] = [];
			tmp[a][0] = id;
			tmp[a][1] = bundle;
			tmp[a][2] = orders_id;
			a++;
			if (bundle == 1) bundle_count++;
			if (id == orders_id && bundle == 1) isMine = true;
		});

		// Ʊ����������å���1�Ĥξ���̵���ˤ���
		if (bundle_count == 1) {
			isMine = false;
			for (var i = 0; i < tmp.length; i++) {
				tmp[i][1] = 0;
			}
		}
		for (var i = 0; i < tmp.length; i++) {
			data5[i] = tmp[i].join('|');
		}
		$.ajax({
			url: './php_libs/ordersinfo.php',
			type: 'POST',
			async: false,
			data: {
				'act': 'update',
				'mode': 'bundle',
				'field5[]': field5,
				'data5[]': data5
			},
			success: function (r) {
				if (r.match(/^\d+?$/)) {
					if (r > 1 && isMine) {
						$('#bundle_status').show();
					} else {
						$('#bundle_status').hide();
					}
				} else {
					alert('Error: p4370' + r);
				}
			}
		});
	},
	setCustomer: function (index) {
		if (mypage.prop.customer_list.length == 0) return;
		var data = mypage.prop.customer_list[index];
		var f = document.forms.customer_form;
		var elem = f.elements;
		var number = '';
		
		$.api(['users', data['id'], 'sales'], 'GET', null).then(function(u){
			var rank = 0,	// �������γ��Ψ
				rankName = '',
				sales = 0;
			if (u.length>0) sales = u[0]['total_price'];
			if (sales>300000) {
				rank = 7;
				rankName = '�������';
			} else if(sales>150000) {
				rank = 5;
				rankName = '����С�';
			} else if(sales>80000) {
				rank = 3;
				rankName = '�֥���';
			} else {
				rank = 0;
				rankName = '-';
			}

			$('#rank').text(rankName);
		});
		
		for (i = 0; i < elem.length; i++) {
			if ((elem[i].type == 'text' && elem[i].name != 'number') || elem[i].type == 'select-one' || elem[i].type == 'textarea') {
				$(':input[name="' + elem[i].name + '"]', '#customer_form').val(data[elem[i].name]).focusout();
			}
		}
		if (data['cstprefix'] == 'g') {
			number = 'G' + ("0000" + data['number']).slice(-4);
		} else {
			number = 'K' + ("000000" + data['number']).slice(-6);
		}
		f.number.value = number;
		f.cstprefix.value = data['cstprefix'];
		f.customer_id.value = data['id'];

		$('#result_customer_wrapper').fadeOut();
		if ($('#update_customer:visible').length > 0) {
			$('#customer_form').css({
				'z-index': 0,
				'position': 'static',
				'left': 0
			});
			mypage.screenOverlay(false);
		}
		mypage.displayFor('modify');
		mypage.prop.modified = true;
	},
	setDelivery: function (index, form) {
		if (mypage.prop[form + "_list"].length == 0) return;
		var data = mypage.prop[form + "_list"][index];
		var f = document.forms[form + "_form"];
		var elem = f.elements;
		for (i = 0; i < elem.length; i++) {
			if (elem[i].name == 'delivery_id') {
				$(':input[name="delivery_id"]', '#delivery_form').val(data['id']).focusout();
			} else if (elem[i].type == 'text' || elem[i].type == 'select-one' || elem[i].type == 'textarea') {
				$(':input[name="' + elem[i].name + '"]', '#' + form + '_form').val(data[elem[i].name]).focusout();
			}
		}
		$('#result_' + form + '_wrapper').fadeOut();
		if (form == 'delivery') {
			if (data['id'] != 0) {
				mypage.inputControl(document.forms.delivery_form, false);
			} else {
				mypage.inputControl(document.forms.delivery_form, true);
			}
		}
		mypage.prop.modified = true;
	},
	displayFor: function (mode) {
		var f = document.forms.customer_form;
		switch (mode) {
			case 'addnew':
				$('#modify_customer').hide().next().hide();
				$('#update_customer').hide();
				$('#cancel_customer').hide();
				$('#customer_form input[name="number"]').removeAttr('readonly').removeClass('nostyle');
				$('#customer_form span, #search_customer').show();
				$('#customer_info p').text('');
				$('.contact_area p span', '#header').text('');
				$('#designImg_table').hide();
				$('#uploadimg_table').hide();

				mypage.inputControl(f, true);
				mypage.inputControl(document.forms.delivery_form, true);
				break;
			case 'modify':
				var number = f.number.value.slice(1);
				var prefix = f.number.value.slice(0, 1);
				var formated = 0;
				if (prefix.toUpperCase() == 'G') {
					formated = 'G' + ("0000" + number).slice(-4);
				} else {
					formated = 'K' + ("000000" + number).slice(-6);
				}
				$('#customer_id').text(formated);
				$('#search_customer').hide();
				$('#modify_customer').val('�����;����������').show().next().hide();
				$('#update_customer').hide();
				$('#cancel_customer').show();
				$('#customer_info p:eq(1)').text(f.customername.value);
				$('#customer_info p:eq(0)').text(f.customerruby.value);
				$('.contact_area p:eq(0) span', '#header').text(f.tel.value);
				$('.contact_area p:eq(1) span', '#header').text(f.fax.value);
				$('.contact_area p:eq(2) span', '#header').text(f.email.value);
				$('#designImg_table').show();
				$('#uploadimg_table').show();
				mypage.inputControl(f, false);
				break;
		}
	},
	inputControl: function (f, enable) {
		var elem = f.elements;
		var i = 0;
		if (enable) {
			for (i = 0; i < elem.length; i++) {
				if ((elem[i].type == "text" && elem[i].name != 'number' && elem[i].name != 'delivery_id') && $(elem[i]).is('.nostyle'))
					$(elem[i]).removeAttr('readonly').removeClass('nostyle');
				if (elem[i].type == "select-one" && $(elem[i]).is('.nostyle'))
					$(elem[i]).removeAttr('disabled').removeClass('nostyle');
				if (elem[i].name == 'customernote' && $(elem[i]).is('.nostyle'))
					$(elem[i]).removeAttr('readonly').removeClass('nostyle');
			}
		} else {
			for (i = 0; i < elem.length; i++) {
				if (elem[i].type == "text" || elem[i].name == 'customernote')
					$(elem[i]).attr('readonly', 'readonly').addClass('nostyle');
				if (elem[i].type == "select-one" && !$(elem[i]).attr('readonly'))
					$(elem[i]).attr('disabled', 'disabled').addClass('nostyle');
			}
		}
	},
	confirm: function () {
		var isPending = false;
		var schedule2 = $('#schedule_date2').val();
		var schedule3 = $('#schedule_date3').val();
		var schedule4 = $('#schedule_date4').val();
		if ($('#reception').val() == "" || schedule2 == "" || schedule4 == "") {
			$('#alert_require').effect('pulsate', {
				'times': 4
			}, 250);
			alert("����ô���Ԥ��������塼�뤬̤����Ǥ���");
			return false;
		}

		if (schedule3 > schedule4 || schedule2 > schedule3) {
			alert("�������塼��򤴳�ǧ����������");
			return false;
		}

		if ($('input[name="package"]:checked', '#package_wrap').length == 0) {
			alert("�޵ͤ�̵ͭ�򤴳�ǧ����������");
			return false;
		} else if ($('input[name="package"]:checked', '#package_wrap').length > 1) {
			var order_amount = $('#total_amount').val() - 0;
			var volume = 0;
			$('input[name="package"]:checked', '#package_wrap').each(function () {
				var state = $(this).val();
				volume += $('#pack_' + state + '_volume').val() - 0;
			});
			if (order_amount < volume) {
				alert("�޵ͤ�����򤴳�ǧ����������");
				return false;
			}
		}

		if ($('#destination').val() == 0) {
			alert("Ǽ������ƻ�ܸ�����ꤷ�Ƥ���������");
			return false;
		}

		if ($('#factory').val() == 0) {
			alert("�������ꤷ�Ƥ���������");
			return false;
		}

		var f = document.forms['customer_form'];
		if (f.customername.value == "" || (f.tel.value == "" && f.mobile.value == "" && f.email.value == "" && f.mobmail.value == "")) {
			$('#alert_require').effect('pulsate', {
				'times': 4
			}, 250);
			alert("�ܵ�̾��Ϣ�����Tel��E-Mail�Τ����줫�ˤ�ɬ�ܹ��ܤǤ���");
			return false;
		}

		if (!$('#state_0 input').is(':checked')) {
			var msg = '';
			$('#orderlist tbody tr').each(function () {
				if (!$(this).find('.choice').is(':checked')) return true; // continue
				var stock = $(this).find('.stock_status').text();
				if (stock == "��") {
					msg = "��ʸ�ꥹ�Ȥ˺߸˿���0�ξ��ʤ�����ޤ���";
					isPending = true;
					return false;
				} else if (stock.match(/^\d+?$/)) {
					var amount = $(this).find('.listamount').val() - 0;
					if (amount > stock) {
						msg = "��ʸ�ꥹ�Ȥ˺߸˿����¿���������ꤷ�Ƥ��뾦�ʤ�����ޤ���";
						isPending = true;
						return false;
					}
				}
			});
			if (isPending) {
				isPending = false;
				alert(msg);
				$('#alert_require').effect('pulsate', {
					'times': 4
				}, 250);
				/* 2015-06-12
				 * ���顼�ȤΤߤ���ʸ����ĤȤ���
				 * return false;
				 */
			}
		}

		if (mypage.prop.ordertype == 'industry') {
			return true;
		}

		//---------- �ȼ����Ϥ�ɬ�����Ϥγ�ǧ�Ϥ����ޤ� ----------


		if ($('#total_amount').val() == "0") {
			$('#alert_require').effect('pulsate', {
				'times': 4
			}, 250);
			alert("���ʤ����ꤵ��Ƥ��ޤ���");
			return false;
		}
		if ($('#est_printfee').val() == '0' && $('#noprint:checked').length == 0) {
			$('#alert_require').effect('pulsate', {
				'times': 4
			}, 250);
			alert("�ץ������Ƥ����ꤵ��Ƥ��ޤ���\n���ʤΤ���ʸ�ξ��ϡ��ץ��Ȥʤ�������å����Ʋ�������");
			return false;
		}

		// ��ԡ�������ʸ�ξ�硢�����ɹ�������¸���ǽ���Ŭ�Ѿ��˰㤤���ʤ�����ǧ
		if (mypage.prop.ordertype == "general" && mypage.prop.repeat > 0) {
			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'json',
				async: false,
				data: {
					'act': 'search',
					'mode': 'reuse',
					'field1[]': ['id'],
					'data1[]': [mypage.prop.repeat]
				},
				success: function (r) {
					if (r instanceof Array) {
						var len = r.length;
						// ������ʸ�ξ���������ʸ��ޤ�
						if (mypage.prop.firmorder) {
							len--;
						}

						var temp = 0;
						if (len == 0) {
							temp = 1;
						} else {
							temp = 2;
						}

						if (temp != mypage.prop.reuse) {
							mypage.prop.reuse = temp;
							isReturn = false;
							alert('��ԡ����ǳ����Ŭ�Ѿ�郎�Ѥ�äƤ��ޤ����Ʒ׻���ԤäƤ���������');
						}
					} else {
						isReturn = false;
						alert('Error: p3819\n' + r);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					isReturn = false;
					$.msgbox('Error: p3824\n' + textStatus);
				}
			});
		}

		var checkdesign = 0;
		$('.pp_toggle_body', '#pp_wrapper').each(function () {
			$(this).children().children('.pp_box').each(function () {
				var selectlength = $(this).children('.pp_image').find('img:not(:nth-child(1))').filter(function () {
					return $(this).attr('src').match(/_on.png$/);
				}).length;
				if (selectlength > 0) {
					var ppInk = $(this).children('.pp_ink');
					var ppInfo = $(this).children('.pp_info');
					var printtype = ppInfo.find('.print_type').val();
					var designtype = ppInfo.find('.design_type').val();
					var ink_names = 0;
					if (printtype == 'silk') {
						var ink_count = ppInfo.find('.ink_count').val() - 0;
						$(this).children('.pp_ink').children('p').each(function () {
							if ($(this).find('input[type=text]:eq(1)').val() != "") {
								ink_names++;
							}
						});
						if (ink_names == 0 || ink_count == 0 || (ink_names != ink_count)) {
							checkdesign = 1;
						}
					} else if (printtype == 'cutting') {
						$(this).children('.pp_ink').children('p').each(function () {
							if ($(this).find('input[type=text]:eq(1)').val() != "") {
								ink_names++;
							}
						});
						if (ink_names == 0) {
							checkdesign = 2;
						}
					} else if (printtype == 'embroidery') {
						$(this).children('.pp_ink').children('p').each(function () {
							if ($(this).find('input[type=text]:eq(1)').val() != "") {
								ink_names++;
							}
						});
						if (ink_names == 0) {
							checkdesign = 3;
						}
					}
					if (designtype == '') {
						checkdesign = 4;
					}
				}
				if (checkdesign > 0) return false;
			});
			if (checkdesign > 0) return false;
		});

		var msg = "";
		if (checkdesign == 1) {
			msg = "���륯�Υ��󥯿��ȿ�̾���ǧ���Ƥ���������";
		} else if (checkdesign == 2) {
			msg = "���åƥ��󥰥����Ȥο�������ǧ���Ƥ���������";
		} else if (checkdesign == 3) {
			msg = "�ɽ��λ忧������ǧ���Ƥ���������";
		} else if (checkdesign == 4) {
			msg = "�ǥ�������ˡ��̤��Ǥ���";
		} else if ($(':radio[name="manuscript"]:checked', '#designtype_table').val() == "0" && $('#noprint:checked').length == 0) {
			msg = "������ˡ��̤��Ǥ���";
		} else if ($(':radio[name="payment"]:checked', '#optprice_table').val() == "0") {
			msg = "��ʧ��ˡ��̤��Ǥ���";
		} else if ($(':radio[name="deliver"]:checked', '#optprice_table').val() == "0" && $(':radio[name="carriage"]:checked', '#schedule_selector').val() != 'accept') {
			msg = "ȯ����ˡ��̤��Ǥ���";
		} else if ($('#handover').val() == "0" && $(':radio[name="carriage"]:checked', '#schedule_selector').val() == 'accept') {
			msg = "���Ϥ����֤�̤��Ǥ���";
		} else if ($(':radio[name="purpose"]:checked', '#questionnaire_table').val() == "" || $(':radio[name="job"]:checked', '#questionnaire_table').length == 0) {
			msg = "���󥱡��Ȥ�̤��Ǥ���";
		}
		if (msg != "") {
			$('#alert_require').effect('pulsate', {
				'times': 4
			}, 250);
			alert(msg);
			return false;
		}

		$('#orderlist tbody tr').each(function () {
			if (!$(this).find('.choice').is(':checked')) return true; // continue
			var sizename = $(this).children('td.itemsize_name').text();
			var colorname = $(this).children('td.itemcolor_name').text();
			var str = "";
			if (sizename == "̤��") str = "������";
			if (colorname == "̤��") str += str != "" ? "�ȥ��顼" : "���顼";
			if (str != "") {
				$('#alert_require').effect('pulsate', {
					'times': 4
				}, 250);
				str += "��̤��ξ��ʤ�����ޤ���";
				alert(str);
				isPending = true;
				return false;
			}
		});
		if (isPending) return false;

		return true;
	},
	temp: {
		product: [], // ����ؼ���ξ��ʤȥץ��ȥǡ���
		items: [], // ���ʥơ��֥�ǡ���
		tabs: [] // ���֥ǡ���
	},
	setDirectionData: function () {
		/*
		 *	arguments[0]	����ID
		 *			 [1]	�ץ�����ˡ�Υ��쥯�������Ȥؤλ���
		 */

		var orders_id = arguments[0]; // ����No
		var print_type = ""; // �ץ��ȼ����print key��
		var directions = []; // �����ץ��ȥ����פλؼ������
		var Err = false; // AJAX�Υ��顼Ƚ��
		var area_name = ''; // �ץ����̤Υ�����front,back,side��
		var selective_name = ''; // �ץ��Ȼ�����֤�̾��
		var category_id = 0; // ���ƥ��꡼ID
		var posid = ''; // ����ID�ʤ���¾���ʤϾ���̾��
		var category_name = ''; // ���ƥ��꡼̾
		var tab_title = ""; // ���֤Υ����ȥ�
		var inkid = 0; // orderink table ��ID
		var key = ''; // �ϥå���Υ���
		var i, s = 0; // ���󥯥����
		var isBring = false; // �������ʤ�̵ͭ
		var factory_hash = {
			1: '������',
			2: '������',
			9: '����'
		};

		$('#alert_require').hide();

		if (arguments.length > 1) { // ���쥯�����ǥץ��ȥ����פ��ѹ�
			if (mypage.prop.modified) {
				var isReturn = confirm('�ѹ����Ƥ���¸���ޤ�����');
				if (isReturn) {
					if (!mypage.save('direction')) {
						alert("p3456\n����ؼ������¸�ǥ��顼��ȯ�����Ƥ��ޤ���");
						return false;
					}
				}
				mypage.prop.modified = false;
			}

			print_type = $(arguments[1]).val(); // ���쥯�����ǻ��ꤵ�줿�ץ�����ˡ�Υ���
			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'text',
				data: {
					'act': 'search',
					'mode': 'printinfo',
					'field1[]': ['orders_id', 'print_key'],
					'data1[]': [orders_id, print_type]
				},
				async: false,
				success: function (r) {
					Err = true;
					if (r.trim() == "") {
						return;
					}
					r = $.getDelimiter(r);
					if (r.indexOf($.delimiter['dat']) == -1) {
						alert('Error: p3474\n' + r);
						return;
					}
					Err = false;
					var lines = r.split($.delimiter['rec']);
					if (lines.length > 0) {
						for (var i = 0; i < lines.length; i++) {
							var data = lines[i].split($.delimiter['fld']);
							var res = [];
							for (var t = 0; t < data.length; t++) {
								var a = data[t].split($.delimiter['dat']);
								res[a[0]] = a[1];
							}
							directions.push(res); // �����ץ�����ˡ�λؼ���ǡ��������
						}
					}
				}
			});
			if (Err) {
				alert("p3493\n����ؼ���ǡ���������Ǥ��ޤ���Ǥ�����");
				return false;
			}

			/*
			 *	�ץ��Ȱ�����˥���ɽ���ѤΥǡ�����ƽ���
			 */
			mypage.temp.tabs = [];
			for (i = 0; i < mypage.temp.product.length; i++) {
				if (mypage.temp.product[i]['print_type'] != print_type) continue;

				area_name = mypage.temp.product[i]['area_name'];
				selective_name = mypage.temp.product[i]['selective_name'];
				category_id = mypage.temp.product[i]['category_id'];
				posid = mypage.temp.product[i]['printposition_id'];
				category_name = mypage.temp.product[i]['category_name'];

				if (posid.indexOf('_') > -1) {
					category_name += ' ' + posid.split('_')[1]; // ����¾�Ȼ����ξ��Ͼ���̾���ղ�
				} else if (category_name == "") {
					category_name = mypage.temp.product[i]['item_name']; // ž�̥�����
				} else {
					category_name += ' ' + posid; // �̾�ϥץ��ȥݥ������ID���ղ�
				}

				// �������ʤ�̵ͭ������å�
				if (category_id == 100) isBring = true;

				if (area_name == "front") {
					tab_title = category_name + ' ���̡�' + selective_name + '��';
				} else if (area_name == "back") {
					tab_title = category_name + ' �����' + selective_name + '��';
				} else if (area_name == "free") {
					tab_title = '�ե꡼';
				} else if (area_name == "fixed") {
					tab_title = 'ž�̥�����';
				} else {
					tab_title = category_name + ' ¦�̡�' + selective_name + '��';
				}

				if (typeof mypage.temp.tabs[tab_title] == 'undefined') {
					mypage.temp.tabs[tab_title] = mypage.temp.product[i];
					mypage.temp.tabs[tab_title]['inknames'] = []; // ����̾
					// mypage.temp.tabs[tab_title]['exchink'] = [];	// ���󥯿��ؤ�
					mypage.temp.tabs[tab_title]['direction'] = []; // ��Ͽ�Ѥ߼���ɼ�ǡ���
					for (s = 0; s < directions.length; s++) {
						if (directions[s]['print_category_id'] == category_id &&
							directions[s]['area_key'] == area_name &&
							directions[s]['print_posid'] == posid &&
							directions[s]['print_posname'] == selective_name) {
							mypage.temp.tabs[tab_title]['direction'].push(directions[s]);
						}
					}
				}

				if (print_type == 'inkjet') {
					mypage.temp.tabs[tab_title]['inknames'][0] = mypage.temp.product[i]['print_option'] == 0 ? 'ø��' : 'ǻ��';
				} else {
					inkid = mypage.temp.product[i]['inkid'];
					mypage.temp.tabs[tab_title]['inknames'][inkid] = mypage.temp.product[i]['ink_code'] + " " + mypage.temp.product[i]['ink_name'];
				}
			}

		} else {
			/* 
			 *	�ᥤ�󥿥֤�����ؼ����ɽ��
			 *	�ؼ���ǡ������ǧ��̤��Ͽ�ξ��Ͽ�����Ͽ���֤��ͤǥץ�����ˡ�Υϥå�������ꥻ�쥯����������
			 */
			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'text',
				data: {
					'act': 'insert',
					'mode': 'direction',
					'field1[]': ['orders_id', 'ordertype', 'printinghash'],
					'data1[]': [orders_id, mypage.prop.ordertype, 1]
				},
				async: false,
				success: function (r) {
					var data = r.split('|');
					var l = data.length;
					if (l == 0 || data[0] == "") {
						Err = true;
						return;
					}

					var selector = '';
					var a = data[0].split(',');
					if (a[1] == '���ʤΤ�') {
						print_type = a[0];
						selector = '<select><option value="' + a[0] + '" selected="selected">���ʤΤ�</option></select>';
					} else {
						selector = '<select onchange="mypage.setDirectionData(' + orders_id + ', this)">';
						for (var i = 0; i < l; i++) {
							a = data[i].split(',');
							selector += '<option value="' + a[0] + '"';
							if (i == 0) {
								selector += ' selected="selected"';
								print_type = a[0];
							}
							selector += '>' + a[1] + '</option>';
						}
					}
					$('#direction_selector').html(selector);
				}
			});
			if (Err) {
				alert("p3399\n����ؼ���ǡ�������Ͽ�Ǥ��ޤ���Ǥ�����");
				return false;
			}

			/*
			 *	�ǽ��ɽ������ץ�����ˡ�λؼ���ǡ��������
			 */
			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'text',
				data: {
					'act': 'search',
					'mode': 'printinfo',
					'field1[]': ['orders_id', 'print_key'],
					'data1[]': [orders_id, print_type]
				},
				async: false,
				success: function (r) {
					Err = true;
					if (r.trim() == "") {
						return;
					}
					r = $.getDelimiter(r);
					if (r.indexOf($.delimiter['dat']) == -1) {
						alert('Error: p3411\n' + r);
						return;
					}
					Err = false;
					var lines = r.split($.delimiter['rec']);
					if (lines.length > 0) {
						for (var i = 0; i < lines.length; i++) {
							var data = lines[i].split($.delimiter['fld']);
							var res = [];
							for (var t = 0; t < data.length; t++) {
								var a = data[t].split($.delimiter['dat']);
								res[a[0]] = a[1];
							}
							directions.push(res);
						}
					}
				}
			});
			if (Err) {
				alert("p3430\n����ؼ���ǡ���������Ǥ��ޤ���Ǥ�����");
				return false;
			}

			// ��ʸ���ʾ�������
			mypage.temp.product = [];
			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'text',
				data: {
					'act': 'search',
					'mode': 'product',
					'field1[]': ['orders_id', 'order_type'],
					'data1[]': [orders_id, mypage.prop.ordertype]
				},
				async: false,
				success: function (r) {
					Err = true;
					if (r.trim() == "") {
						return;
					}

					r = $.getDelimiter(r);
					if (r.indexOf($.delimiter['dat']) == -1) {
						alert('Error: p3416\n' + r);
						return;
					}
					Err = false;
					var lines = r.split($.delimiter['rec']);
					if (lines.length > 0) {
						for (var i = 0; i < lines.length; i++) {
							var data = lines[i].split($.delimiter['fld']);
							var res = [];
							for (var t = 0; t < data.length; t++) {
								var a = data[t].split($.delimiter['dat']);
								res[a[0]] = a[1];
							}

							// ���̤ȶȼԤι���̾�ΰ㤤������
							var ary = [];
							if (res['ordertype'] == 'general' && res['master_id'] != 0) {
								// ���̤μ谷����
								res['stock_number'] = res['item_code'] + '_' + res['color_code'];
								res['src'] = './img/items/' + res['category_key'] + '/' + res['item_code'] + '/' + res['stock_number'] + '.jpg';
								res['orderitem_id'] = res['orders_id'] + '_' + res['master_id'] + '_' + res['size_id'];
							} else {
								// �ȼԤޤ��ϰ��̤Τ���¾�Ȼ���
								ary = res['stock_number'].split('_');
								res['item_code'] = ary[0];
								res['maker_name'] = res['maker'];
								res['color_name'] = res['item_color'];
								if (ary[0] == "" || ary[1] == '000') res['src'] = './img/blank.gif';
								else res['src'] = './img/items/' + res['category_key'] + '/' + res['item_code'] + '/' + res['stock_number'] + '.jpg';
							}

							// ����¾�Ȼ����Υ��ƥ���̾������
							if (res['category_id'] == 0) {
								res['category_name'] = '����¾';
							} else if (res['category_id'] == 100) {
								res['category_name'] = '����';
							}

							// �ץ��Ȱ��ֲ������ɹ���
							if (res['area_name'] == "free") {
								res['baseimage'] = '<img src="./img/blank.gif" alt="" />';
							} else {
								$.ajax({
									url: res['area_path'],
									type: 'POST',
									dataType: 'text',
									async: false,
									success: function (r) {
										if (r.trim() == "") {
											alert('Error: p2893\n' + r);
											Err = true;
											return;
										}
										res['baseimage'] = r;
									}
								});
							}

							mypage.temp.product.push(res);
						}
					} else {
						Err = true;
					}
				}
			});
			if (Err) {
				alert("p4008\n���ʥǡ���������Ǥ��ޤ���Ǥ�����");
				return false;
			}

			/*
			 *	���ܥ��֤�ɽ�����뾦�ʥơ��֥�
			 *	�ץ�����ˡ���Ȥ�Ʊ���Υ����ƥ����ʬ�������줾��Υ������ξ�����ݻ�
			 *
			 *	�����ץ��Ȱ��֤Υ���ɽ���ѥǡ����򽸷�
			 */
			mypage.temp.items = [];
			mypage.temp.tabs = [];

			for (i = 0; i < mypage.temp.product.length; i++) {
				// ���ܥ��֤�ɽ�����뾦�ʥơ��֥�ǡ���
				key = mypage.temp.product[i]['print_type'];
				if (typeof mypage.temp.items[key] == 'undefined') mypage.temp.items[key] = [];
				var key2 = mypage.temp.product[i]['item_name'] + mypage.temp.product[i]['category_id'] + mypage.temp.product[i]['color_name'];
				if (typeof mypage.temp.items[key][key2] == 'undefined') {
					mypage.temp.items[key][key2] = mypage.temp.product[i];
					mypage.temp.items[key][key2]['volume'] = [];
				}
				mypage.temp.items[key][key2]['volume'][mypage.temp.product[i]['size_name']] = [mypage.temp.product[i]['amount'], mypage.temp.product[i]['orderitem_id'], mypage.temp.product[i]['item_note']];

				// �����ץ��Ȱ��֤Υ���ɽ���ѥǡ���
				if (mypage.temp.product[i]['print_type'] != print_type) continue;

				area_name = mypage.temp.product[i]['area_name'];
				selective_name = mypage.temp.product[i]['selective_name'];
				category_id = mypage.temp.product[i]['category_id'];
				posid = mypage.temp.product[i]['printposition_id'];
				category_name = mypage.temp.product[i]['category_name'];

				if (posid.indexOf('_') > -1) {
					category_name += ' ' + posid.split('_')[1]; // ����¾�Ȼ����ξ��Ͼ���̾���ղ�
				} else if (category_name == "") {
					category_name = mypage.temp.product[i]['item_name']; // ž�̥�����
				} else {
					category_name += ' ' + posid; // �̾�ϥץ��ȥݥ������ID���ղ�
				}

				// �������ʤ�̵ͭ������å�
				if (category_id == 100) isBring = true;

				if (area_name == "front") {
					tab_title = category_name + ' ���̡�' + selective_name + '��';
				} else if (area_name == "back") {
					tab_title = category_name + ' �����' + selective_name + '��';
				} else if (area_name == "free") {
					tab_title = '�ե꡼';
				} else if (area_name == "fixed") {
					tab_title = 'ž�̥�����';
				} else {
					tab_title = category_name + ' ¦�̡�' + selective_name + '��';
				}

				if (typeof mypage.temp.tabs[tab_title] == 'undefined') {
					mypage.temp.tabs[tab_title] = mypage.temp.product[i];
					mypage.temp.tabs[tab_title]['inknames'] = []; // ����̾
					mypage.temp.tabs[tab_title]['direction'] = []; // ��Ͽ�Ѥ߼���ɼ�ǡ���
					for (s = 0; s < directions.length; s++) {
						if (directions[s]['print_category_id'] == category_id &&
							directions[s]['area_key'] == area_name &&
							directions[s]['print_posid'] == posid &&
							directions[s]['print_posname'] == selective_name) {
							mypage.temp.tabs[tab_title]['direction'].push(directions[s]);
						}
					}
				}

				if (print_type == 'inkjet') {
					mypage.temp.tabs[tab_title]['inknames'][0] = mypage.temp.product[i]['print_option'] == 0 ? 'ø��' : 'ǻ��';
				} else {
					inkid = mypage.temp.product[i]['inkid'];
					mypage.temp.tabs[tab_title]['inknames'][inkid] = mypage.temp.product[i]['ink_code'] + " " + mypage.temp.product[i]['ink_name'];
				}
			}

			// �޵ͤȤ��Ϥ���
			var pack = [];
			if (directions[0]['package_yes'] == 1) pack.push('����');
			if (directions[0]['package_no'] == 1) pack.push('�ʤ�');
			if (directions[0]['package_nopack'] == 1) pack.push('�ޤΤ�');
			pack = pack.join(',');
			if (pack == '') {
				// �쥿���פ��б�
				if (directions[0]['package'] == "yes") {
					pack = "����";
				} else if (directions[0]['package'] == "nopack") {
					pack = "�ޤΤ�";
				} else {
					pack = "�ʤ�";
				}
			}

			var zipcode = mypage.temp.product[0]['delizipcode'].replace(/[^\d]/g, '');
			if (zipcode.length >= 3) zipcode = zipcode.substr(0, 3) + '-' + zipcode.substr(3);
			var delitel = mypage.temp.product[0]['delitel'];
			$('.package', '#dire_delivery_table').text(pack);
			$('.delitel', '#dire_delivery_table').text(mypage.phone_mask(delitel).c);
			$('.zipcode', '#dire_delivery_table').text(zipcode);
			$('.addr1', '#dire_delivery_table').text(mypage.temp.product[0]['deliaddr1']);
			$('.addr2', '#dire_delivery_table').text(mypage.temp.product[0]['deliaddr2']);

			// ����ɼ�����ɽ��
			var number = mypage.temp.product[0]['number'];
			if (number != '') {
				if (mypage.temp.product[0]['cstprefix'] == 'g') {
					number = 'G' + ("0000" + number).slice(-4);
				} else {
					number = 'K' + ("000000" + number).slice(-6);
				}
			}
			var basic_info = [];
			basic_info[0] = mypage.temp.product[0]['created'];
			basic_info[1] = ("000000000" + orders_id).slice(-9);
			basic_info[2] = number;
			basic_info[3] = mypage.temp.product[0]['staffname'];
			$('#dire_title div:eq(0) p:eq(1) span').each(function (index) {
				$(this).text(basic_info[index]);
			});
			$('#dire_title .print_title span').text(mypage.temp.product[0]['maintitle']);
		}

		// �ǥ�����ž�̤����դ����������
		var cutpattern = '<tr>';
		cutpattern += '<td><input type="text" value="" class="shotname" /></td>';
		cutpattern += '<td><input type="text" value="0" class="shot" class="forNum" /> �� �� ';
		cutpattern += '<input type="text" value="0" class="sheets" class="forNum" /> ������</td>';
		cutpattern += '<td>��</td></tr>';
		$('#dire_option_table tbody').html(cutpattern);

		// �ǥ�����ž�̤����դ���������
		if (print_type == 'digit') {
			$('#dire_option_table, .jobtime_wrapper').show();
			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'json',
				async: false,
				data: {
					'act': 'search',
					'mode': 'cutpattern',
					'field1[]': ['product_id'],
					'data1[]': [directions[0]['product_id']]
				},
				success: function (r) {
					if (r instanceof Array) {
						if (r.length > 0) {
							var cutpattern = '<tr>';
							cutpattern += '<td><input type="text" value="' + r[0]['shotname'] + '" class="shotname" /></td>';
							cutpattern += '<td><input type="text" value="' + r[0]['shot'] + '" class="shot" class="forNum" /> �� �� ';
							cutpattern += '<input type="text" value="' + r[0]['sheets'] + '" class="sheets" class="forNum" /> ������</td>';
							cutpattern += '<td>��</td></tr>';
							for (var i = 1; i < r.length; i++) {
								cutpattern += '<td><input type="text" value="' + r[i]['shotname'] + '" class="shotname" /></td>';
								cutpattern += '<td><input type="text" value="' + r[i]['shot'] + '" class="shot" class="forNum" /> �� �� ';
								cutpattern += '<input type="text" value="' + r[i]['sheets'] + '" class="sheets" class="forNum" /> ������</td>';
								cutpattern += '<td><input type="button" value="���" class="del_cutpattern" /></td></tr>';
							}
						}
						$('#dire_option_table tbody').html(cutpattern);
					} else {
						Err = true;
						return;
					}
				}
			});
		} else {
			$('#dire_option_table, .jobtime_wrapper').hide();
		}
		if (Err) {
			alert("p4174\n���դ��ǡ���������Ǥ��ޤ���Ǥ�����");
			return false;
		}


		$('#dire_title .printtype_name').text($('#direction_selector select option:selected').text());
		$('#curr_printtype').text($('#direction_selector select').val());
		$('#factory_name').text('���졧 ' + factory_hash[directions[0]['factory']]);

		// ��ʸ���ʤΰ����ơ��֥������
		var html = ''; // ���ʥơ��֥��Ѥ�HTML
		var totVolume = 0; // �����ץ��ȥ����פι����ʸ���
		var sizename = ''; // ������̾
		key = '';
		for (key in mypage.temp.items[print_type]) {
			var item = mypage.temp.items[print_type][key];
			html += '<tr>';
			if (item['stock_number'] == '') {
				html += '<td colspan="2">' + item['item_name'] + '</td>';
			} else {
				if (item['item_code'] == '') {
					html += '<td>' + item['stock_number'] + '</td>';
				} else {
					html += '<td>' + item['item_code'] + '</td>';
				}
				html += '<td>' + item['maker_name'] + '</td>';
			}
			html += '<td><p style="width:120px;">' + item['color_name'] + '</p></td>';
			html += '<td style="text-align:center;">';
			var amount = '';
			var subtotal = 0;
			for (sizename in item['volume']) {
				html += '<p>' + sizename + '</p>';
				amount += '<p>' + item['volume'][sizename][0] + '</p>';
				subtotal += (item['volume'][sizename][0] - 0);
			}
			html += '</td>';
			html += '<td style="text-align:right;">' + amount + '</td>';
			html += '<td>';
			for (sizename in item['volume']) {
				html += '<p><input type="text" value="' + item['volume'][sizename][2] + '" class="orderitem-' + item['volume'][sizename][1] + '" /></p>';
			}
			html += '</td>';
			html += '</tr>';
			html += '<tr class="sectionSeparator"><td colspan="6"></td></tr>';

			totVolume += subtotal;
		}
		$('#dire_items_table tbody').html(html);
		$('#dire_items_table tfoot tr td:last span').html(totVolume);

		// ���ܥ��־����ɽ��
		if (isBring) {
			$('#arrange').text('��������');
		} else {
			$('#arrange').text('��ʸ');
		}

		switch (directions[0]['carriage']) {
			case 'normal':
				$('#shipment').text('�����');
				break;
			case 'accept':
				$('#shipment').text('�����Ϥ�');
				break;
			case 'telephonic':
				$('#shipment').text('�Ǥ�tel');
				break;
			default:
				$('#shipment').text('����¾');
				break;
		}
		var delitime = ['', '(am)', '(12:00-14:00)', '(14:00-16:00)', '(16:00-18:00)', '(18:00-20:00)', '(19:00-21:00)'];
		$('#numberofbox').text(directions[0]['boxnumber']);
		$('#envelope').val(directions[0]['envelope']);
		$('#ship_note').val(directions[0]['ship_note']);
		$('#shipping_date').text(directions[0]['schedule3']);
		$('#delivery_date').text(directions[0]['schedule4']);
		$('#delivery_time').text(delitime[directions[0]['deliverytime']]);
		$('#workshop_note').val(directions[0]['workshop_note']);
		$('#platescount').val(directions[0]['platescount']);
		$('#arrive').text(directions[0]['arrival']);
		$('#platescheck').val(directions[0]['platescheck']);
		$('#sheetcount').val(directions[0]['sheetcount']);
		$('#pastesheet').val(directions[0]['pastesheet']);
		$('#edge').val(directions[0]['edge']);
		$('#edgecolor').val(directions[0]['edgecolor']);
		if (directions[0]['edge'] == 6) {
			$('.edgecolor_wrap').show();
		} else {
			$('.edgecolor_wrap').hide();
		}

		// ���ܾ���ʳ��Υ��֤���
		var cnt = $mytab.tabs('length');
		for (var t = 1; t < cnt; t++) {
			$mytab.tabs('remove', 1);
		}

		// ���֤�����
		// �ץ���̵���������å�����Ƥ���Ȥ��ϴ��ܥ��֤Τ�
		if ($('#dire_title .printtype_name').text() != '���ʤΤ�') {
			var tabIndex = 0;
			tab_title = '';
			for (tab_title in mypage.temp.tabs) {
				var tab = mypage.temp.tabs[tab_title];

				// �ץ��ȥ�����
				var size_select = '';
				if (print_type == 'silk') {
					size_select = tab['areasize_from'] + ' �� ' + tab['areasize_to'] + ' cm';
				} else {
					var areasize_id = tab['areasize_id'];
					switch (print_type) {
						case 'inkjet':
							if (areasize_id == '0') size_select = '���27��38��cm';
							else if (areasize_id == '1') size_select = '���27��18��cm';
							else size_select = '����10��10��cm';
							break;
						case 'trans':
						case 'digit':
							if (areasize_id == '0') size_select = '���27��38��cm';
							else if (areasize_id == '1') size_select = '���27��18��cm';
							else size_select = '����10��10��cm';
							break;
						case 'digit':
						case 'cutting':
							if (areasize_id == '0') size_select = '���27��38��cm';
							else if (areasize_id == '1') size_select = '���27��18��cm';
							else size_select = '����10��10��cm';
							break;
						case 'embroidery':
							if (areasize_id == '0') size_select = '���25��25��cm';
							else if (areasize_id == '1') size_select = '���18��18��cm';
							else if (areasize_id == '2') size_select = '����10��10��cm';
							else size_select = '�˾���5��5��cm';
							break;
					}
				}

				// ������
				var created = directions[0]['created'].replace(/(\/)|(-)/g, '');

				// ����ƥ��
				var tab_content = '<div id="p' + tab['direction'][0]['pinfoid'] + '" class="tabs_wrapper"><div class="freespace"> ����ɼ����</div>';
				tab_content += '<div class="dire_design_wrapper"><div class="printimage">' + tab['baseimage'] + '</div>';
				tab_content += '<div class="freeimage"><div class="close" onclick="$(this).parent().hide(500);">�Ĥ���</div><p>�����ƥ�Υ��᡼���򥢥åץ����ɤ��Ƥ���������</p>';
				tab_content += '<form name="uploaderform" action="' + _MAIN + '" target="upload_iframe" method="post" enctype="multipart/form-data">';
				tab_content += '<input type="hidden" name="dummy" value="����������" />';
				tab_content += '<input type="hidden" name="fileframe" value="true" />';
				tab_content += '<input type="hidden" name="positionname" value="" />';
				tab_content += '<input type="hidden" name="orders_id" value="' + orders_id + '" />';
				tab_content += '<input type="hidden" name="created" value="' + created + '" />';
				tab_content += '<input type="hidden" name="req" value="428" />';
				tab_content += '<label for="uploadfile">�ե����롧</label>';
				tab_content += '<input type="file" name="uploadfile" id="uploadfile" onchange="this.form.submit()" /></form></div></div>';
				tab_content += '<div class="dire_printinfo_wrapper"><table class="dire_printinfo_table">';
				tab_content += '	<caption>�ץ��ȥǡ���</caption><tbody>';
				tab_content += '		<tr><th>����</th><td>' + tab['design_type'] + '</td>';
				tab_content += '		<th>�礭��</th><td>' + size_select + '</td></tr>';
				tab_content += '		<tr><th>����</th><td colspan="3">';
				if (tab['inknames'].length > 0) {
					for (inkid in tab['inknames']) {
						tab_content += '<p>' + tab['inknames'][inkid] + '</p>';
					}
				}
				tab_content += '</td></tr>';
				tab_content += '		<tr><th>����</th><td colspan="3"><textarea cols="50" rows="2" class="remark">' + tab['direction'][0]['remark'] + '</textarea></td></tr>';

				if (print_type == 'silk') {
					var reprint_selector = '<select class="reprint">';
					reprint_selector += '<option value="0">�����</option>';
					reprint_selector += '<option value="1">����</option>';
					reprint_selector += '<option value="2">����</option>';
					reprint_selector += '</select>';
					var re = new RegExp('value="' + tab['direction'][0]['reprint'] + '"', 'i');
					reprint_selector = reprint_selector.replace(re, 'value="' + tab['direction'][0]['reprint'] + '" selected="selected"');
					tab_content += '<tr><th>����</th><td colspan="3">';
					tab_content += reprint_selector;
					tab_content += '</td></tr>';

					var plates_selector = '<select class="platesinfo">';
					plates_selector += '<option value="�����쥯��">�����쥯��</option>';
					plates_selector += '<option value="΢����">΢����</option>';
					plates_selector += '<option value="����">����</option>';
					// plates_selector += '<option value="ž��">ž��</option>';
					plates_selector += '<option value="������">������</option>';
					plates_selector += '<option value="˹��">˹��</option>';
					plates_selector += '<option value="Ĺ������쥯��">Ĺ������쥯��</option>';
					plates_selector += '<option value="Ĺ��΢����">Ĺ��΢����</option>';
					plates_selector += '<option value="Ĺ�楾��">Ĺ�楾��</option>';
					plates_selector += '</select>';
					re = new RegExp('value="' + tab['direction'][0]['platesinfo'] + '"', 'i');
					plates_selector = plates_selector.replace(re, 'value="' + tab['direction'][0]['platesinfo'] + '" selected="selected"');
					tab_content += '<tr><th>�Ǽ�</th>';
					tab_content += '<td>' + plates_selector + '</td>';
					tab_content += '<th>�ǿ�</th>';
					tab_content += '<td><input type="text" value="' + tab['direction'][0]['platesnumber'] + '" class="platesnumber" />';
					tab_content += '</td></tr>';

					tab_content += '<tr><th>��å���</th><td colspan="3"><input type="text" value="' + tab['direction'][0]['meshinfo'] + '" class="meshinfo" /></td></tr>';

					var attrink_selector = '<select class="attrink">';
					if (tab['silkmethod'] != 2) {
						attrink_selector += '<option value="����">����</option>';
						attrink_selector += '<option value="����">����</option>';
						attrink_selector += '</select>';
						re = new RegExp('value="' + tab['direction'][0]['attrink'] + '"', 'i');
						attrink_selector = attrink_selector.replace(re, 'value="' + tab['direction'][0]['attrink'] + '" selected="selected"');
					} else {
						attrink_selector += '<option value="����" selected="selected">����</option>';
						attrink_selector += '</select>';
					}
					tab_content += '<tr><th>���󥯼�</th><td colspan="3">';
					tab_content += attrink_selector;
					tab_content += '</td></tr>';
				}

				tab_content += '<tr><th>������</th><td colspan="3">' + tab['design_size'] + '</td></tr>';

				/* ���������ȤΥץ��Ȥ�����֤�Ĵ���ʽĤȲ���*/
				for (var a = 0; a < tab['direction'].length; a++) {
					sizename = tab['direction'][a]['sizename'];
					var vert = tab['direction'][a]['vert'];
					var hori = tab['direction'][a]['hori'];
					tab_content += '<tr><th class="sizename">' + sizename + '</th><td colspan="3">��<input type="text" value="' + vert + '" class="forReal vert" />�߲�<input type="text" value="' + hori + '" class="forReal hori" /> cm</td></tr>';
				}

				tab_content += '</tbody></table>';
				tab_content += '</div></div>';

				// ���֤�����
				var tab_counter = tabIndex + 2;
				$mytab.tabs('add', '#tabs-' + tab_counter, tab_title);
				var cur_tab = $('#tabs-' + tab_counter);
				cur_tab.html(tab_content);
				$mytab.tabs('select', tabIndex + 1);

				if (tab_title != "�ե꡼") {
					// ���ꤵ��Ƥ���ץ��Ȱ��ְʳ���ɽ����ä�
					// �ǥ�����ɽ���ȥ��åץ������ѤΥץ��Ȱ��ֲ�������Ͽ�Ѥߥǥ����������

					$('.printimage img:not(:nth-child(1))', '#tabs-' + tab_counter).each(function () {
						if ($(this).attr('class') == tab['selective_key']) {
							$(this).attr('id', 'selectiveid' + tab['selectiveid']);
							if (tab['designpath'] != "") {
								$(this).attr({
									'src': tab['designpath'],
									'width': $(this).width()
								});
							} else if ($(this).attr('src').indexOf('_on.') == -1) {
								var src = $(this).attr('src').replace('.png', '_on.png');
								$(this).attr({
									'src': src
								});
							}
						} else {
							$(this).hide();
						}
					});
				}

				tabIndex++;
			}
		}


		// �ǥ�����Υ��åץ����ɤΰ١�����å����٥�Ȥ�����
		$('.printimage img:not(:nth-child(1))', '#tabs').click(function () {
			$(this).parent().siblings('.freeimage').children('form').children('input[name="positionname"]').val($(this).attr('class'));
			$(this).parent().siblings('.freeimage:hidden').show(500);
		});

		$('#tabs :input').change(function () {
			mypage.prop.modified = true;
		});
		$mytab.tabs('select', 0);

		return true;
	},
	setAcceptnavi: function (idx) {
		/*
		 *	���տ�Ľ�С�������
		 *	@idx		��Ľ���ܤΥ���ǥå�����0.��礻��1.���ѥ᡼�롡2.����衡3.����贰λ��4.��ʸ���ꡡ5.ȯ���ѡ�6.���
		 */
		// ��Ľ�ʥӥС�����ʸ����ˤ���
		$('#accept_navi li').removeClass('actlist').children('p').removeClass('act bef');
		$('#accept_navi li:eq(' + idx + ')').addClass('actlist').children('p').addClass('act');
		if (idx > 0) {
			idx = idx == 4 ? 2 : --idx;
			$('#accept_navi li:eq(' + idx + ')').children('p').addClass('bef');
		}
	},
	checkstatus: function (my, orders_id) {
		/*
		 *	��ʸ��å����å�
		 *		�����ԤΤ�
		 */
		var field = [];
		var data = [];
		switch ($(my).attr('name')) {
			case 'cancel':
				field = ['orders_id', 'progress_id'];
				var progid = 1;
				if ($(my).attr('checked')) {
					progid = 6;
				}
				data = [orders_id, progid];
				$.ajax({
					url: './php_libs/ordersinfo.php',
					type: 'POST',
					data: {
						'act': 'update',
						'mode': 'acceptstatus',
						'field1[]': field,
						'data1[]': data
					},
					async: false,
					success: function (r) {
						if (!r.match(/^\d+?$/)) {
							alert('Error: p4971\n' + r);
							return;
						}
						$(my).closest('tr').find('input[title="repeat"]').remove();
						if (progid == 6) {
							$(my).parent().prev().text('�������');
						} else {
							$(my).parent().prev().text('�䤤��碌��');
						}
					}
				});
				break;
		}
	},
	sendmailcheck: function (my, orders_id) {
		/*
		 *	��ư�����᡼�����������
		 *		�ץ��ȳ���
		 *		�����ǧ
		 *		ȯ��
		 */
		if (!orders_id) return;

		var myname = $(my).attr('name');
		var check = $(my).attr('checked') ? 1 : 0;
		$.ajax({
			url: './php_libs/ordersinfo.php',
			type: 'POST',
			async: false,
			data: {
				'act': 'update',
				'mode': 'sendmailcheck',
				'field1[]': ['fldname', 'check', 'orders_id'],
				'data1[]': [myname, check, orders_id]
			},
			success: function (r) {
				if (r.trim() == '') {
					alert('Error: p5566\n' + r);
					return;
				}
				if (check == 1) {
					$(my).next('span').text(' ���');
				} else {
					$(my).next('span').text(' ����');
				}
			}
		});

	},
	sendmail: function (act, data) {
		/**
		 *	�᡼������
		 *	@act		�᡼��μ���
		 *	@data[0]	TLA���С���Ͽ��̵ͭ��0(default)����Ͽ���롡1����Ͽ�ʤ�
		 *	@data[1]	�����ֹ�
		 *	@data[2]	�������
		 *	@data[3]	�������Τ��ɲå�å�����
		 */
		var parm = "";
		var dat = "";

		// ����BOX�θ���
		if (mypage.prop.ordertype == 'general') {
			var valid1 = $('#est_printfee').val().replace(/,/g, '') - 0;
			$('#est_table1 tbody th:not(.sub)').each(function () {
				valid1 += $(this).next().text().replace(/,/g, '') - 0;
			});
			var valid2 = $('#est_basefee').text().replace(/,/g, '') - 0;
			if (valid1 != valid2) {
				alert("Error:5366\n���ѹ�פ���äƤ��ޤ��󡣺Ʒ׻����Ƥ���������");
				return;
			}
			valid2 += $('#est_salestax').text().replace(/,/g, '') - 0;
			valid2 += $('#est_creditfee').text().replace(/,/g, '') - 0;
			var valid3 = $('#est_total_price').text().replace(/,/g, '') - 0;
			if (valid2 != valid3) {
				alert("Error:5373\n���ѹ�פ���äƤ��ޤ��󡣺Ʒ׻����Ƥ���������");
				return;
			}
		}

		if (act == 'shipped') {
			$.post('./documents/shipmentmail.php', {
				'orders_id': data
			}, function (r) {
				alert(r);
				$('#mailer_wrapper').fadeOut();
				mypage.screenOverlay(false);
			});
		} else {
			if (arguments.length > 2) {
				// �᡼������
				parm = mypage.prop.firmorder ? '1' : '2'; // ������ʸ��1������ʳ���2
				data = [];
				for (var t = 2; t < arguments.length; t++) {
					data.push(arguments[t]);
				}
				data.push($('#add_message').val());
			} else {
				// �᡼���ǧ�ѥݥåץ��å�
				dat = '\'' + act + '\',\'\'';
				for (var i = 0; i < data.length; i++) {
					dat += ',\'' + data[i] + '\'';
				}
			}

			$.ajax({
				url: './documents/sendmail.php',
				type: 'POST',
				dataType: 'json',
				async: false,
				data: {
					'doctype': act,
					'json': 1,
					'data[]': data,
					'parm': parm
				},
				success: function (r) {
					if (r instanceof Array) {
						if (!parm) {
							mypage.screenOverlay(true);
							if (r.length == 0) {
								mypage.screenOverlay(false);
							} else {
								if (r[0].match(/^ERROR/)) {
									alert(r[0]);
									mypage.screenOverlay(false);
								} else {
									// �᡼����ʸ��ݥåץ��å�
									var btn = '<p style="padding: 10px 0px; margin-bottom: 10px; text-align: center; background: #333;">';
									btn += '<input type="button" value="������" onclick="mypage.sendmail(' + dat + ')" /></p>';
									$('#popup_inner').html(btn + r[0] + btn);
									var offsetY = $(document).scrollTop() + 100;
									$('#mailer_wrapper').css({
										'top': offsetY + 'px'
									}).fadeIn();
								}
							}
						} else {
							if (typeof r[0]['id'] != 'undefined') {
								// TLA���С�����Ͽ�ǥ᡼�륢�ɥ쥹����ʣ���Ƥ�����
								var txt = '<h2>�� ��ʸ����᡼�����������ߤ��ޤ����� ��</h2>';
								txt += '<p>Ʊ���᡼�륢�ɥ쥹����Ͽ������ޤ����ܵҾ���򤴳�ǧ����������</p>';
								txt += '<br>-- ��Ͽ�Ѥ߸ܵҾ��� --';
								txt += '<p>�ܵ�ID����' + r[0]['cstprefix'] + r[0]['number'] + '</p>';
								txt += '<p>�ܵ�̾����' + r[0]['customername'] + '</p>';
								txt += '<p>E-mail����' + r[0]['email'] + '</p>';
								$('#popup_inner').html(txt);
								var offsetY = $(document).scrollTop() + 100;
								$('#mailer_wrapper').css({
									'top': offsetY + 'px'
								}).fadeIn();
							} else {
								alert(r[0]);
								$('#mailer_wrapper').fadeOut();
								mypage.screenOverlay(false);
							}
						}
					} else {
						alert('Error: p5535\n' + r);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert('Error: p5539\n' + textStatus + '\n' + errorThrown);
				}
			});
		}
	},
	cssvalue: function (aElement, aCssProperty) {
		if (aElement.currentStyle) {
			return aElement.currentStyle[aCssProperty]; //IE
		} else {
			var style = document.defaultView.getComputedStyle(aElement, null); //firefox, Opera�ʤ�
			return style.getPropertyValue(aCssProperty);
		}
	},
	checkFirmorder: function () {
		// ������ʸ�ξ����ɤ߼�����Ѥˤ���
		if (mypage.prop.firmorder) {
			$('input:not(#arrival_date, #boxnumber, #show_bundle), select:not(#factory)', '#schedule_selector').attr('disabled', true); // �������塼��
			$('tbody input', '#schedule').attr('disabled', true); // Ǽ���׻�
			$('#category_selector, #item_selector').attr('disabled', true); // ���ʾ���
			$('input', '#size_table').attr('disabled', true); // �������ơ��֥�
			$('input, select', '#orderlist').attr('disabled', true); // ��ʸ�ꥹ��
			$('input', '#estimation_toolbar').attr('disabled', true); // �ɲùԥܥ���
			$('#noprint, #exchink_count, #exchthread_count').attr('disabled', true); // �ץ��Ȥʤ������쥮��顼
			$('input:not(.design_size, .areasize_from, .areasize_to, .design_type_note), select', '#pp_wrapper').attr('disabled', true); // �ץ��Ȱ���
			$('#designcharge').attr('disabled', true); // �ǥ�������
			$('tr:not(:last) input', '#optprice_table').attr('disabled', true); // ���ץ�����ȯ����ˡ��
			$('#extradiscountname, #reductionname, #additionalname, #paymentdate').attr('disabled', false); // ���ץ����ǹ�����
			$('#est_printfee, #free_printfee').attr('disabled', true); // ������
			$('#free_discount, #free_printfee').button('disable'); // jQuery UI Button Widget
		} else {
			$('input, select').attr('disabled', false);
			$('#free_discount, #free_printfee').button('enable');
		}
	},
	showOrderItem: function (info) {
		/* ��ʸ�ꥹ�Ȥȥץ��Ȱ��֤Υ�������
		 *	@info {orders_id, noprint}
		 *	@�������	���ɽ���κݤˡֽ����פ��֥�ԡ����ǡפ����
		 *
		 *		orders_id	����No.
		 *		noprint		���̡��ץ��Ȥʤ������å�����
		 *					�ȼԡ�default 0
		 */
		var init = false;
		var mode = 'modify'; // ���̤ǻ���
		if (arguments.length > 1) {
			mode = arguments[1];
			init = true;
		}
		var sess = sessionStorage;
		if (mypage.prop.ordertype == 'general') {
			var isPrint = info['noprint'] == 1 ? 0 : 1;
			var store = mypage.getStorage();
			var list = {
				'act': 'orderlist',
				'ordertype': 'general',
				'isprint': isPrint,
				'curdate': mypage.prop.firmorderdate,
				'state': mypage.prop.firmorder,
				'data' : JSON.stringify(store)
			};

			$.ajax({
				url: './php_libs/dbinfo.php',
				type: 'POST',
				dataType: 'json',
				async: false,
				data: list,
				success: function (data) {
					if (data instanceof Array) {
						if (data.length != 0) mypage.setEstimation(data, false, false); // �ץ������Ȣ���η׻��ʤ�
						var item_name = '';
						var isNotBring = false; // �����ǤϤʤ����ʤ�̵ͭ
						if (!init) {
							isNotBring = mypage.checkPrintPos();
						} else {
							$('#pp_wrapper').html("");
							$('#orderlist tbody tr').each(function () {
								var item_id = $(this).children('td:eq(0)').children('.itemid').text();
								var ppID = $(this).children('td:eq(0)').children('.positionid').text();
								if ($('#pp_wrapper span[title="item_' + item_id + '"]').length == 0) {
									var category_id = (($(this).children('td:eq(2)').attr('class')).split('_'))[1];
									if (category_id != 100) isNotBring = true;
									if (item_id.indexOf('_') > -1) {
										item_name = $(this).children('td.item_selector').text();
									} else {
										item_name = $(this).children('td.item_selector').find('option:selected').text();
									}
									if ($('#pp_toggler_' + category_id).length == 0) {
										var category_name = $(this).children('td:eq(2)').text();
										$.ajax({
											url: './php_libs/dbinfo.php',
											type: 'POST',
											dataType: 'text',
											async: false,
											data: {
												'act': 'ppbox',
												'ppID': ppID,
												'category_id': category_id,
												'orders_id': info['orders_id'],
												'mode': mode,
												'ordertype': mypage.prop.ordertype
											},
											success: function (r) {
												if (r.trim() != "") {
													var data = r.split('|');
													var togglebody = '<div class="pp_toggle_body">' + data[0] + '</div>';
													var html = '<div class="pp_toggler" id="pp_toggler_' + category_id + '">';
													html += '<div class="rightside">����&nbsp;<input type="text" value="0" size="8" readonly="readonly" class="sub_price" />';
													html += '<input type="hidden" value="0" size="8" class="silk_price" />';
													html += '<input type="hidden" value="0" size="8" class="color_price" />';
													html += '<input type="hidden" value="0" size="8" class="digit_price" />';
													html += '<input type="hidden" value="0" size="8" class="inkjet_price" />';
													html += '<input type="hidden" value="0" size="8" class="cutting_price" />';
													html += '<input type="hidden" value="0" size="8" class="embroidery_price" /></div>';
													html += '<p class="title">' + category_name + '<span title="item_' + item_id + '">' + item_name + '</span></p>';
													html += '</div>';
													$('#pp_wrapper').append(html).append(togglebody);
												} else {
													mypage.addPrintPos(category_id, category_name, item_id, item_name, ppID);
												}
											}
										});
									} else {
										var isExistPos = false;
										$('#pp_toggler_' + category_id).next().children('div').each(function () {
											if ($(this).attr('class') == 'printposition_' + ppID) {
												isExistPos = true;
												return false; // break
											}
										});
										if (!isExistPos) {
											$.ajax({
												url: './php_libs/dbinfo.php',
												type: 'POST',
												dataType: 'text',
												async: false,
												data: {
													'act': 'ppbox',
													'ppID': ppID,
													'category_id': category_id,
													'orders_id': info['orders_id'],
													'mode': mode,
													'ordertype': mypage.prop.ordertype
												},
												success: function (r) {
													if (r.trim() != "") {
														var data = r.split('|');
														$('#pp_toggler_' + category_id).next().append(data[0]);
													} else {
														mypage.addPrintPos(category_id, category_name, item_id, item_name, ppID);
													}
												}
											});
										}
										$('#pp_toggler_' + category_id + ' p').append('<span title="item_' + item_id + '">' + item_name + '</span>');
									}
								}
							});
						}

						if (!isNotBring) {
							// ���ƻ����ξ��ϡ�̤ȯ���פ�ɽ�����ʤ�
							$('#order_stock').hide();
						}

						mypage.calcExchinkFee(false);
						$('#pp_wrapper :input').change(function () {
							mypage.prop.modified = true;
						});
						$('#pp_wrapper').find('.repeat_check').change(function () {
							mypage.calcPrintFee();
						});
						mypage.calcPrintFee();
						if (init) $(document).scrollTop(0);
						mypage.screenOverlay(false);
					} else {
						mypage.screenOverlay(false);
						return;
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert('Error: p5845\n' + textStatus + '\n' + errorThrown);
				}
			});

			// ����BOX�θ���
			var valid1 = $('#est_printfee').val().replace(/,/g, '') - 0;
			$('#est_table1 tbody th:not(.sub)').each(function () {
				valid1 += $(this).next().text().replace(/,/g, '') - 0;
			});
			var valid2 = $('#est_basefee').text().replace(/,/g, '') - 0;
			if (valid1 != valid2) {
				alert("Error:6437\n���ѹ�פ���äƤ��ޤ��󡣺Ʒ׻����Ƥ���������");
			}
			valid2 += $('#est_salestax').text().replace(/,/g, '') - 0;
			valid2 += $('#est_creditfee').text().replace(/,/g, '') - 0;
			var valid3 = $('#est_total_price').text().replace(/,/g, '') - 0;
			if (valid2 != valid3) {
				alert("Error:6443\n���ѹ�פ���äƤ��ޤ��󡣺Ʒ׻����Ƥ���������");
			}
		} else {

			//	for industry
			// ���ʥơ��֥�ȥץ��Ȱ��ֲ���������
			var list = {
				'act': 'orderlistext',
				'curdate': mypage.prop.firmorderdate,
				'state': mypage.prop.firmorder
			};
			for (var key in sess) {
				list[key] = JSON.parse(sess.getItem(key));
			}
			$.ajax({
				url: './php_libs/dbinfo.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: list,
				success: function (r) {
					var tot_amount = 0;
					var tot_price = 0;
					var isNotBring = false; // �����ǤϤʤ����ʤ�̵ͭ
					if (r.trim() != "") {
						var item_name = "";
						$('#orderlist tbody').html(r);
						$('#orderlist').trigger('update');
						if (!init) {
							isNotBring = mypage.checkPrintPos();
						} else {
							$('#pp_wrapper').html("");
							$('#orderlist tbody tr').each(function () {
								var amount = $(this).find('.listamount').val().replace(/,/g, '') - 0;
								tot_price += ($(this).find('.itemcost').val().replace(/,/g, '') - 0) * amount;
								tot_amount += amount;
								var item_id = $(this).children('td:eq(0)').children('.itemid').text();
								if ($('#pp_wrapper span[title="item_' + item_id + '"]').length == 0) {
									var ppID = $(this).children('td:eq(0)').children('.positionid').text();
									var category_id = (($(this).children('td:eq(2)').attr('class')).split('_'))[1];
									if (category_id != 100) isNotBring = true;
									if (item_id.indexOf('_') > -1 || item_id == '99999') {
										item_name = $(this).children('td.item_selector').text();
									} else {
										item_name = $(this).children('td.item_selector').find('option:selected').text();
									}
									if ($('#pp_toggler_' + category_id).length == 0) {
										var category_name = $(this).children('td:eq(2)').text();
										$.ajax({
											url: './php_libs/dbinfo.php',
											type: 'POST',
											dataType: 'text',
											async: false,
											data: {
												'act': 'ppbox',
												'ppID': ppID,
												'orders_id': info['orders_id'],
												'ordertype': mypage.prop.ordertype
											},
											success: function (r) {
												if (r.trim() != "") {
													var data = r.split('|');
													var togglebody = '<div class="pp_toggle_body">' + data[0] + '</div>';
													var html = '<div class="pp_toggler" id="pp_toggler_' + category_id + '">';
													html += '<p class="title">' + category_name + '<span title="item_' + item_id + '">' + item_name + '</span></p>';
													html += '</div>';
													$('#pp_wrapper').prepend(togglebody).prepend(html);
												} else {
													mypage.addPrintPos(category_id, category_name, item_id, item_name, ppID);
												}
											}
										});
									} else {
										var isExistPos = false;
										$('#pp_toggler_' + category_id).next().children('div').each(function () {
											if ($(this).attr('class') == 'printposition_' + ppID) {
												isExistPos = true;
												return false; // break
											}
										});
										if (!isExistPos) {
											$.ajax({
												url: './php_libs/dbinfo.php',
												type: 'POST',
												dataType: 'text',
												async: false,
												data: {
													'act': 'ppbox',
													'ppID': ppID,
													'orders_id': info['orders_id'],
													'ordertype': mypage.prop.ordertype
												},
												success: function (r) {
													if (r.trim() != "") {
														var data = r.split('|');
														$('#pp_toggler_' + category_id).next().append(data[0]);
													} else {
														mypage.addPrintPos(category_id, category_name, item_id, item_name, ppID);
													}
												}
											});
										}
										$('#pp_toggler_' + category_id + ' p').append('<span title="item_' + item_id + '">' + item_name + '</span>');
									}
								}
							});
						}
					} else {
						$('#orderlist tbody').html("");
						$('#pp_wrapper').html("");
					}

					if (!isNotBring) {
						// ���ƻ����ξ��ϡ�̤ȯ���פ�ɽ�����ʤ�
						$('#order_stock').hide();
					}

					var data = [null, tot_amount, tot_price];
					mypage.setEstimation(data, false, false);

					// ��ʸ���٥ơ��֥������
					$('#orderlist tfoot tr.estimate').remove();
					$.ajax({
						url: './php_libs/ordersinfo.php',
						type: 'POST',
						dataType: 'text',
						async: false,
						data: {
							'act': 'search',
							'mode': 'estimatedetails',
							'field1[]': ["orders_id"],
							'data1[]': [info['orders_id']]
						},
						success: function (r) {
							if (r.trim() == "") {
								mypage.screenOverlay(false);
								return;
							}

							r = $.getDelimiter(r);
							if (r.indexOf($.delimiter['dat']) == -1) {
								alert('Error: p6064\n' + r);
								return;
							}
							var lines = r.split($.delimiter['rec']);
							if (lines.length > 0) {
								var tr = "";
								for (var i = 0; i < lines.length; i++) {
									var data = lines[i].split($.delimiter['fld']);
									var res = [];
									for (var t = 0; t < data.length; t++) {
										var a = data[t].split($.delimiter['dat']);
										res[a[0]] = a[1];
									}

									tr += '<tr class="estimate" style="display:table-row">';
									tr += '<td class="tip">' + res['addestid'] + '</td>';
									tr += '<td colspan="5"><input type="text" value="' + res['addsummary'] + '" class="summary" /></td>';
									tr += '<td><input type="text" value="' + res['addamount'] + '" class="amount forNum" /></td>';
									tr += '<td><input type="text" value="' + res['addcost'] + '" class="cost" /></td>';
									tr += '<td><input type="text" value="' + mypage.addFigure(res['addprice']) + '" class="price" readonly="readonly" /></td>';
									tr += '<td colspan="2"></td>';
									tr += '<td class="none"><input type="button" value="���" class="delete_row" /></td>';
									tr += '<th class="tip"></th></tr>';

									tot_amount += res['addamount'] - 0;
									tot_price += res['addprice'] - 0;
								}

								$('#orderlist tfoot tr.heading').after(tr);

							}
						}
					});

					// live�᥽�åɤ�change���б����Ƥ��ʤ����������
					$('#orderlist tfoot tr.estimate .cost').change(function () {
						$.calc_estimatetable(this);
					});
					$('#orderlist tfoot tr.estimate .forNum').change(function () {
						$.calc_estimatetable(this);
					});

					// �����ȥ���ץ꡼��
					$("#orderlist tfoot tr.estimate .summary").autocomplete({
						source: $.availableTags.summary,
						autoFocus: true,
						delay: 0,
						close: function (event, ui) {
							var code = $(this).val().slice(0, 3);
							var cost = $.availableTags.cost[code];
							var amount = $(this).closest('tr').find('.amount').val().replace(/,/g, '');
							var v = 0;
							if (typeof cost == 'undefined') return;

							if (amount == 0) {
								if (cost instanceof Array) {
									v = cost[0];
								} else {
									v = cost;
								}
							} else {
								if (!r.match(/^01\d$/)) { // ���륯�̾���
									if (amount <= 5) {
										v = cost[0];
									} else if (amount <= 9) {
										v = cost[1];
									} else if (amount <= 19) {
										v = cost[2];
									} else if (amount <= 29) {
										v = cost[3];
									} else if (amount <= 49) {
										v = cost[4];
									} else if (amount <= 99) {
										v = cost[5];
									} else {
										v = cost[6];
									}
								} else if (!r.match(/^02\d$/)) { // ���륯��������
									if (amount <= 5) {
										v = cost[0];
									} else if (amount <= 9) {
										v = cost[1];
									} else if (amount <= 19) {
										v = cost[2];
									} else if (amount <= 29) {
										v = cost[3];
									} else if (amount <= 49) {
										v = cost[4];
									} else if (amount <= 99) {
										v = cost[5];
									} else {
										v = cost[6];
									}
									v *= 1.3;
								} else if (!r.match(/^03\d$/)) { // �ǥ�����ž�̥�������
									if (amount <= 3) {
										v = cost[0];
									} else if (amount <= 19) {
										v = cost[1];
									} else if (amount <= 49) {
										v = cost[2];
									} else if (amount <= 99) {
										v = cost[3];
									} else if (amount <= 499) {
										v = cost[4];
									} else {
										v = cost[5];
									}
								} else if (!r.match(/^04\d$/)) { // �ǥ�����ž�̥ץ쥹��
									if (amount <= 10) {
										v = cost[0];
									} else {
										v = cost[1];
									}
								} else {
									v = cost;
								}
							}
							$(this).closest('tr').find('.cost').val(v);
							$.calc_estimatetable(this);
						}
					});

					// Change���٥�Ȥ�����
					$('#orderlist tfoot tr.estimate :text').change(function () {
						mypage.prop.modified = true;
					});
					$('#pp_wrapper :input').change(function () {
						mypage.prop.modified = true;
					});

					var sales_tax = Math.floor(tot_price * mypage.prop.tax);
					var sum = Math.floor(tot_price * (1 + mypage.prop.tax));
					$('#subtotal_estimate').val(mypage.addFigure(tot_price));
					$('#sales_tax').val(mypage.addFigure(sales_tax));
					$('#total_estimate_cost').val(mypage.addFigure(sum));

					mypage.calcExchinkFee(false);
					mypage.calcEstimation();
					if (init) $(document).scrollTop(0);
					mypage.screenOverlay(false);
				}
			});
		}
	},
	checkPrintPos: function () {
		/*
		 *	��ʸ�ꥹ�Ȥ��ѹ���ȼ���ץ��Ȱ��֤Υ����򹹿���depend showOrderItem��
		 *
		 *	return		true:�����ʳ��ξ��ʤ��ꡢ��false:���ƻ����ξ��
		 */
		var tmp = {}; // �ץ��Ȱ��־���Υϥå���
		var sub = {}; // �����ƥब�����������б�
		var add = {}; // �ɲä��륢���ƥ��ID
		var isNotBring = false; // ���ƻ������ɤ�����Ƚ��
		$('#pp_wrapper .pp_toggler').each(function () {
			var cat = $(this).attr('id').split('_')[2];
			var ids = [];
			var pos = [];
			var id_count = 0;
			if (cat != 100) isNotBring = true;
			$('p span', this).each(function () {
				ids.push($(this).attr('title').split('_')[1]);
				id_count++;
			});
			$(this).next().children('div').each(function () {
				pos.push($(this).attr('class').split('_')[1]);
			});
			tmp[cat] = {
				'id': ids,
				'pp': pos,
				'id_count': id_count
			};
		});
		sub = $.extend(true, [], tmp);

		$('#orderlist tbody tr').each(function () {
			var catID = $(this).children('td:eq(2)').attr('class').split('_')[1];
			var catname = $(this).children('td:eq(2)').text();
			var itemid = $(this).children('td:eq(0)').children('.itemid').text();
			var itemname = '';
			if (itemid.indexOf('_') > -1) {
				itemname = $(this).children('td.item_selector').text();
				itemid = itemid.split('_')[0];
			} else {
				itemname = $(this).children('td.item_selector').find('option:selected').text();
			}
			var ppID = $(this).children('td:eq(0)').children('.positionid').text();

			if (typeof tmp[catID] == 'undefined') {
				if (typeof sub[catID] == 'undefined') {
					add[itemid] = [catID, catname, itemid, itemname, ppID]; // ���������ƥ���ξ��ʤ��ɲ�
				} else {
					var isExistItem = false;
					for (var i = 0; i < sub[catID]['id'].length; i++) {
						if (sub[catID]['id'][i] == itemid) {
							isExistItem = true;
							break;
						}
					}
					if (!isExistItem) add[itemid] = [catID, catname, itemid, itemname, ppID]; // ��¸���ƥ�����ǿ��������ʤ��ɲ�
				}
				return true; // continue
			}

			for (var i = 0; i < tmp[catID]['id'].length; i++) {
				if (tmp[catID]['id'][i] == itemid) {
					tmp[catID]['id'].splice(i, 1);
					break;
				}
			}
			if (tmp[catID]['id'].length == 0) {
				var hash = {};
				for (var cat in tmp) {
					if (cat != catID) hash[cat] = tmp[cat];
				}
				tmp = hash;
				return true; // continue
			}
			for (var i = 0; i < tmp[catID]['pp'].length; i++) {
				if (tmp[catID]['pp'][i] == ppid) {
					tmp[catID]['pp'].splice(i, 1);
					break;
				}
			}
		});

		if (Object.keys(add).length > 0) {
			for (var i in add) {
				mypage.addPrintPos(add[i][0], add[i][1], add[i][2], add[i][3], add[i][4]);
			}
		}

		if (Object.keys(tmp).length == 0) return isNotBring;

		for (var cat in tmp) {
			if (tmp[cat]['id'].length == tmp[cat]['id_count']) {
				var toggler = $('#pp_toggler_' + cat);
				toggler.next().remove();
				toggler.remove();
			} else {
				for (var i = 0; i < tmp[cat]['id'].length; i++) {
					$('#pp_toggler_' + cat + ' p span[title="item_' + tmp[cat]['id'][i] + '"]').remove();
				}
				for (var i = 0; i < tmp[cat]['pp'].length; i++) {
					$('#pp_toggler_' + cat).next().find('.printposition_' + tmp[cat]['pp'][i]).remove();
				}
			}
		}

		return isNotBring;
	},
	initEstimateList: function () {
		// �ȼԤθ��ѹԥơ��֥�ν����
		var tr = '<tr class="estimate">';
		tr += '<td class="tip">0</td>';
		tr += '<td colspan="5"><input type="text" value="" class="summary" /></td>';
		tr += '<td><input type="text" value="0" class="amount forNum" /></td>';
		tr += '<td><input type="text" value="0" class="cost" /></td>';
		tr += '<td><input type="text" value="0" class="price" readonly="readonly" /></td>';
		tr += '<td colspan="2"></td>';
		tr += '<td class="none"><input type="button" value="���" class="delete_row" /></td>';
		tr += '<td class="tip"></td></tr>';
		$('#orderlist tfoot tr.estimate').remove();
		$('#orderlist tfoot tr.heading').after(tr);
	},
	main: function (func) {
		var btn = function (my) {
			var myTitle = typeof (my) == 'string' ? my : my.attr('title');
			var result_len = $('#result_count').text() - 0; // ������̤η��
			switch (myTitle) {
				case 'order': // ������ʸ
					mypage.prop.modified = false;
					if ($('#applyto').val() == 1) {
						location.href = './main.php?req=orderform&pos=1&order=self-design';
					} else {
						location.href = './main.php?req=orderform&pos=1&order=0';
					}
					break;

				case 'repeat':
				case 'modify':
					orderpage(my.attr('name').split('_')[1], myTitle);
					break;
				case 'search':
					break;
				default:
					$('#result_searchtop').html('');
					break;
			}

			if (myTitle != "search") return;

			//==== ���������򳫻� ====

			// ������̤ȥ쥳���ɿ���ɽ�����ꥢ
			$('#result_count').text('0');
			$('#result_searchtop').html('');

			// �������ܤμ���
			var i = 0;
			var j = 0;
			var field = [];
			var data = [];
			var elem = document.forms.searchtop_form.elements;
			for (j = 0; j < elem.length; j++) {
				if ((elem[j].type == "text" || elem[j].type == "select-one") && elem[j].value.trim() != '') {
					field[i] = elem[j].name;
					data[i++] = elem[j].value;
				}
			}
			if (i == 0) {
				alert('�������ܤ���ꤷ�Ƥ�������');
				return;
			}

			field.push('progress_id');
			data.push($('#progress_id').val());
			field.push('sort');
			data.push($('#sort').val());

			// ������̤����
			$('#result_searchtop').html('<p class="alert">������ ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');

			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'json',
				async: true,
				data: {
					'act': 'search',
					'mode': 'accepting',
					'field1[]': field,
					'data1[]': data
				},
				success: function (r) {
					if (r instanceof Array) {
						if (r.length == 0) {
							mypage.screenOverlay(false);
							$('#result_searchtop').html('<p class="alert">����������ʸ�ǡ��������Ĥ���ޤ���Ǥ���</p>');
						} else {
							result_len = r.length;
							$('#result_count').text(result_len);

							// ������̥ơ��֥������
							var notices = [];
							var progress = '';
							var factory = {
								0: '-',
								1: '[1]',
								2: '[2]',
								9: '[1,2]'
							};
							var cancelmail_checked = ['', 'checked="checked"'];
							var cancelmail_state = ['����', '���'];
							var list = '<table class="result_list"><thead><tr><th>����No.</th><th rowspan="2">����</th><th>�ܵ�ID</th><th>�ꡡ̾</th><th rowspan="2">�����</th><th rowspan="2">�á���</th><th rowspan="2">�硡��</th><th rowspan="2">�ʡ�Ľ</th>';
							if (_my_level == "administrator") {
								list += '<th rowspan="2">���</th>';
							}
							list += '<th colspan="4">��ư�����᡼��</th>';
							list += '<th rowspan="2">����</th><th rowspan="2">ô��</th><th rowspan=" 2">&nbsp;</th></tr>';
							list += '<tr><th>ȯ����</th><th>�ܵ�̾</th><th>������</th><th>̤����</th><th>�����</th><th>ȯ��</th><th>�����ǧ</th></tr></thead><tbody>';
							for (i = 0; i < result_len; i++) {
								list += '<tr>';
								list += '<td>' + r[i]['ordersid'] + '</td>';
								list += '<td rowspan="2" class="centering">' + factory[r[i]['factory']] + '</td>';
								if (r[i]['cstprefix'] == 'g') {
									list += '<td>G' + ("0000" + r[i]['number']).slice(-4) + '</td>';
								} else {
									list += '<td>K' + ("000000" + r[i]['number']).slice(-6) + '</td>';
								}
								list += '<td><p class="fix" style="width:250px;">' + r[i]['maintitle'] + '</p></td>';
								// �õ�����
								notices = [];
								if (r[i]['all_repeat'] == 1 || (r[i]['repeater'] > 0 && r[i]['ordertype'] == 'industry')) notices.push('���');
								if (r[i]['completionimage'] == 1) {
									notices.push('�����');
								} else if (r[i]['imega'] ==1) {
									notices.push('�ץ����');
								}
								if (r[i]['express'] != 0) notices.push('�õ�' + r[i]['express']);
								if (r[i]['mixture'] != '') notices.push(r[i]['mixture']);
								if (r[i]['bundle'] == 1) notices.push('Ʊ��');
								//������ǧ
								if (r[i]['imagecheck'] == 1) {
									list += '<td rowspan="2">' + '������' + '</td>';
								} else {
									list += '<td rowspan="2">' + '  ��  ' + '</td>';
								}
								list += '<td rowspan="2">' + notices.toString() + '</td>';
								list += '<td rowspan="2" class="toright">' + r[i]['order_amount'] + '</td>';
								if (r[i]['shipped'] == 2) {
									progress = 'ȯ���Ѥ�';
								} else {
									progress = r[i]['progressname'];
								}
								list += '<td rowspan="2">' + progress + '</td>';
								if (_my_level == "administrator") {
									list += '<td class="centering" rowspan="2"><input type="checkbox" name="cancel" onchange="mypage.checkstatus(this,' + r[i]['ordersid'] + ')" ';
									if (r[i]['progress_id'] == 6) list += 'checked="checked" ';
									list += '/></td>';
								}
								list += '<td rowspan="2" class="centering">';
								if (r[i]['progress_id'] != 4 && r[i]['progress_id'] != 6) {
									list += '<label><input type="checkbox" value="1" name="cancelpendingmail" onchange="mypage.sendmailcheck(this,' + r[i]['ordersid'] + ');" ';
									list += cancelmail_checked[r[i]['cancelpendingmail']] + '><span>' + cancelmail_state[r[i]['cancelpendingmail']] + '</span></label>';
								} else {
									list += '-';
								}
								list += '</td>';

								list += '<td rowspan="2" class="centering">';
								if (r[i]['progress_id'] == 4) {
									list += '<label><input type="checkbox" value="1" name="canceljobmail" onchange="mypage.sendmailcheck(this,' + r[i]['ordersid'] + ');" ';
									list += cancelmail_checked[r[i]['canceljobmail']] + '><span>' + cancelmail_state[r[i]['canceljobmail']] + '</span></label>';
								} else {
									list += '-';
								}
								list += '</td>';

								list += '<td rowspan="2" class="centering">';
								if (r[i]['progress_id'] == 4) {
									list += '<label><input type="checkbox" value="1" name="cancelshipmail" onchange="mypage.sendmailcheck(this,' + r[i]['ordersid'] + ');" ';
									list += cancelmail_checked[r[i]['cancelshipmail']] + '><span>' + cancelmail_state[r[i]['cancelshipmail']] + '</span></label>';
								} else {
									list += '-';
								}
								list += '</td>';

								list += '<td rowspan="2" class="centering">';
								if (r[i]['progress_id'] == 4) {
									list += '<label><input type="checkbox" value="1" name="cancelarrivalmail" onchange="mypage.sendmailcheck(this,' + r[i]['ordersid'] + ');" ';
									list += cancelmail_checked[r[i]['cancelarrivalmail']] + '><span>' + cancelmail_state[r[i]['cancelarrivalmail']] + '</span></label>';
								} else {
									list += '-';
								}
								list += '</td>';
								list += '<td rowspan="2" class="centering">';
								if (r[i]['rakuhan'] != 0) {
									list += '��';
								} else {
									list += '-';
								}
								list += '</td>';
								list += '<td class="centering" rowspan="2">' + r[i]['staffname'] + '</td>';
								list += '<td class="centering" rowspan="2"><input type="button" value="����" title="modify" class="btn" name="id_' + r[i]['ordersid'] + '" />';
								if (r[i]['progress_id'] == 4 && r[i]['applyto'] == 0) {
									list += '<input type="button" value="��ԡ�����" title="repeat" class="btn" name="id_' + r[i]['ordersid'] + '" />';
								}
								list += '</td>';
								list += '</tr>';

								list += '<tr>';
								list += '<td class="centering">' + r[i]['schedule3'] + '</td>';
								list += '<td><p class="fix" style="width:200px;"><a href="./main.php?req=customerlist&amp;pos=428&amp;cst=' + r[i]['customer_id'] + '">' + r[i]['customername'] + '</a></p></td>';
								list += '<td>' + r[i]['category_name'] + '</td>';
								list += '</tr>';
							}
							list += '</tbody>';
							$('#result_searchtop').html(list);
							$('#result_searchtop tbody tr').each(function (i) {
								if (i % 4 == 0 || i % 4 == 1) $(this).children('td').css({
									'background': '#f6f6f6'
								});
								if (i % 4 == 0 || i % 4 == 2) $(this).children('td').css({
									'border-top': '1px solid #d8d8d8'
								});
							});

							// �ơ��֥�إå��������(jquery.tablefix)
							$('#result_searchtop .result_list').tablefix({
								height: 580,
								fixRows: 2
							});

							document.forms.searchtop_form.id.focus();
							mypage.screenOverlay(false);
						}
					} else {
						mypage.screenOverlay(false);
						alert('Error: p4646\n' + r);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					$('#result_searchtop').html('');
					$.msgbox('Error: p4651\n' + textStatus);
				}

			});

		};


		/*
		 *	��������ɽ��
		 *	@args[0]	����ID
		 *	@args[1]	ɽ���⡼�ɡ�modify,repeat
		 */
		var orderpage = function () {
			mypage.screenOverlay(true);
			var i = 0;
			var info = [];
			$.ajax({
				url: './php_libs/ordersinfo.php',
				async: false,
				dataType: 'json',
				data: {
					'act': 'search',
					'mode': 'top',
					'field1[]': ['id'],
					'data1[]': [arguments[0]]
				},
				success: function (r) {
					if (r instanceof Array) {
						info = r[0];
					} else {
						alert('Error: p5467\n' + r);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					$.msgbox('Error: p5471\n' + textStatus);
				}
			});

			if (info.length == 0) {
				mypage.screenOverlay(false);
				return;
			}

			// Ʊ�������å��Υǡ������������̤ȯ����Ʊ����ʸ��̵ͭ��ɽ��
			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'json',
				async: false,
				data: {
					'act': 'search',
					'mode': 'bundlecount',
					'field1[]': ['orders_id', 'shipped'],
					'data1[]': [info['orders_id'], 1]
				},
				success: function (r) {
					if (r instanceof Array) {
						if (r.length > 1) {
							$('#bundle_status').show();
						} else {
							$('#bundle_status').hide();
						}
					} else {
						alert('Error: p6515\n' + r);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert("Error: p6517\ntextStatus : " + textStatus);
				}

			});

			var mode = arguments[1];

			// �ץ��ѥƥ�������
			mypage.prop.created = info['created'];
			mypage.prop.firmorderdate = info['schedule2'];
			mypage.prop.acceptingdate = info['schedule3'];
			mypage.prop.ordertype = info['ordertype'];
			mypage.prop.applyto = info['applyto'];
			mypage.prop.schedule_date = "";
			mypage.prop.curr_inkcolor = {};
			mypage.prop.curr_ppImage = {};
			mypage.prop.reuse = info['reuse'];
			mypage.prop.repeat = info['repeater'];
			mypage.prop.shipped = mode == 'repeat' ? 1 : info['shipped']; // ��ԡ����Ǥ���ʸ�򵯤�������̤ȯ���ˤ���
			mypage.prop.isCheckbill = false;

			// jQueryUI Button �ν����
			$('#free_discount, #free_printfee').next('label').removeClass('ui-state-active');

			// ������ʸ�ν���
			if (info['progress_id'] == 4 && mode != 'repeat') {
				mypage.prop.firmorder = true;
				$('#firm_order, #btn_firmorder').hide();
				$('#btn_completionimage').hide();

				// �����Ը��¤ǡֳ������ץܥ����ɽ��
				if (_my_level == "administrator") {
					$('#btn_cancelorder').show();
				} else {
					$('#btn_cancelorder').hide();
				}

				// ��ʸ�����ꤷ�Ƥ��Ƴ��ȯ����������1��������Υǡ����ι������ԲĤˤ���ե饰�����ꤹ��
				// 2019-08-07 �ѻ�
				// var dt = new Date();
				// var d = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/1";
				// var cuttime = Date.parse(d);
				// var shippingtime = Date.parse(info['schedule3'].replace(/-/g, "/") + " 00:00:00");
				// if (shippingtime < cuttime && mypage.prop.shipped == 2) {
				// 	mypage.prop.isCheckbill = true;
				// }

			} else {
				mypage.prop.firmorder = false;
				$('#firm_order, #btn_firmorder').show();
				$('#btn_cancelorder').hide();
				if (info['progress_id'] == 5 && mode != 'repeat') {
					$('#btn_completionimage').show().addClass('btn_red').text('��������');
				} else if (info['progress_id'] == 7 && mode != 'repeat') {
					$('#btn_completionimage').hide().removeClass('btn_red').text('��������');
				} else {
					$('#btn_completionimage').show().removeClass('btn_red').text('��������');
				}
			}

			// ��ԡ����ǥܥ�������ϳ��Ϥξ�硢ô���ԡ�����ͽ���������Ǥ�����
			if (mode == 'repeat') {
				info['reception'] = 0;
				info['arrival'] = '';
				info['rakuhan'] = 0;
			}

			// ����Υ����å�
			if (mode == 'repeat' || (info['repeater'] != 0 && mypage.prop.ordertype == "general")) {
				if (mode == 'repeat' && info['repeater'] == 0) {
					mypage.prop.repeat = info['orders_id'];
				} else {
					mypage.prop.repeat = info['repeater'];
				}
				$.ajax({
					url: './php_libs/ordersinfo.php',
					type: 'POST',
					dataType: 'json',
					async: false,
					data: {
						'act': 'search',
						'mode': 'reuse',
						'field1[]': ['id'],
						'data1[]': [mypage.prop.repeat]
					},
					success: function (r) {
						if (r instanceof Array) {
							var len = r.length;
							// ������ʸ�ξ���������ʸ��ޤ�
							if (mypage.prop.firmorder) {
								len--;
							}
							if (len == 0) {
								mypage.prop.reuse = 1;
							} else {
								mypage.prop.reuse = 2;
							}
						} else {
							alert('Error: p5503\n' + r);
						}
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						$.msgbox('Error: p5544\n' + textStatus);
					}
				});
			}

			$('#maintitle').val(info['maintitle']);

			// Self-Design�ξ��
			var SD = '';
			if (info['applyto'] == 1) {
				SD = '(SD)';
			}

			// ���Ǥȥ�ԡ����Ǥ�ɽ������
			if ((mypage.prop.ordertype == "industry" && mypage.prop.repeat != 0) || info['repeatdesign'] == 1) {
				$('#reuse_plate').text('��ԡ�����' + SD);
				if (mypage.prop.reuse != 0) {
					$('#discount_reuse').text('��ԡ����ǡ�type' + mypage.prop.reuse + '��').show();
				} else {
					$('#discount_reuse').text('').hide();
				}
			} else {
				$('#reuse_plate').text('����' + SD);
				$('#discount_reuse').text('').hide();
			}

			// ���顼�Ȥν����
			$('#alertarea span').hide();
			$('#express_message').removeClass('bgExpress').html("");

			// ���ʥơ��֥�Υ��ꥢ
			$('#orderlist tbody').html("");
			$('#total_amount').val(0);
			$('#total_cost').val(0);

			// �ȼԤθ��ѹԤν����
			mypage.initEstimateList();

			// Ȣ���ν����
			$('#boxnumber').val(0);

			// ���ؤ����Υ��ꥢ
			$('#exchink_count').val('0');
			$('#exchthread_count').val('0');

			// �ץ��Ȱ��֤Υ��ꥢ
			$('#pp_wrapper').children().remove();

			// ���ѥե����ƥ��󥰥ܥå����Υ��ꥢ�ȥץ�����μ����ϥ����å�
			$('#est_table1 tbody tr:not(:eq(1)) td').text(0);
			$('#est_total_price, #est_amount, #est_perone').text(0);
			$('#est_express').prev().children('span').remove();
			if (info['free_printfee'] == 1) {
				$('#free_printfee').attr('checked', true);
				$('#est_printfee').removeAttr('readonly').removeClass('readonly').val(mypage.addFigure(info['printfee']));
			} else {
				$('#free_printfee').removeAttr('checked');
				$('#est_printfee').attr('readonly', 'readonly').addClass('readonly').val(mypage.addFigure(info['printfee']));
			}

			// ���ѥܥå���
			var ary1 = ['productfee', 'silkprintfee', 'colorprintfee', 'digitprintfee', 'inkjetprintfee', 'cuttingprintfee', 'embroideryprintfee',
						'exchinkfee', 'additionalfee', 'packfee', 'expressfee', 'discountfee', 'reductionfee', 'carriagefee', 'designfee', 
						'codfee', 'paymentfee', 'conbifee', 'creditfee', 'basefee', 'salestax'];
			var ary2 = ['est_price', 'est_silk_printfee', 'est_color_printfee', 'est_digit_printfee', 'est_inkjet_printfee', 'est_cutting_printfee', 'est_embroidery_printfee',
						'est_exchink', 'est_additionalfee', 'est_package', 'est_express', 'est_discount', 'est_reduction', 'est_carriage', 'est_designfee', 
						'est_codfee', 'est_paymentfee', 'est_conbifee',
						'est_creditfee', 'est_basefee', 'est_salestax'];
			for (var a = 0; a < ary2.length; a++) {
				$('#' + ary2[a]).text(mypage.addFigure(info[ary1[a]]));
			}

			// ����ɽ���ξ��
			if (info['estimated'] > 0 && info['salestax'] == 0) {
				$('#est_basefee').text(mypage.addFigure(info['estimated']));
			}
			$('#est_total_price').text(mypage.addFigure(info['estimated']));
			var perone = Math.ceil(info['estimated'] / info['order_amount']);
			$('#est_perone').text(mypage.addFigure(perone));

			// ������Ψ������ȥ��쥯�����������ʥ��ƥ��ꡢ�����ƥ��
			mypage.init();

			// ���ϥ⡼�ɡʰ��̡��ȼԡˤ�����
			var freeform = $('.phase_box', '#order_wrapper').filter(function () {
				if ($(this).is('.freeform')) {
					return false;
				} else {
					return true;
				}
			});
			if (info['ordertype'] == "industry") {
				$('#ordertype_industry').next().show();
				$('#ordertype_general').next().hide();

				$('#floatingbox').hide();
				$('#exchink_count').val('0').attr('disabled', 'disabled').addClass('disabled');
				$('#exchthread_count').val('0').attr('disabled', 'disabled').addClass('disabled');
				$('#orderlist tfoot tr').show();
				$('#estimation_toolbar, #express_checker').show();
				freeform.hide();
				$('#optprice_table').find('tr:not(.freeform)').hide();
				$('.phase_box:eq(0)', '#order_wrapper').after($('#modify_customer_wrapper'));
				$('#modify_customer_wrapper').after($('#delivery_address_wrapper'));
				$('#pricinglist').show();
			} else {
				$('#ordertype_industry').next().hide();
				$('#ordertype_general').next().show();

				$('#floatingbox').show();
				$('#exchink_count').val('0').removeAttr('disabled').removeClass('disabled');
				$('#exchthread_count').val('0').removeAttr('disabled').removeClass('disabled');
				$('#orderlist tfoot tr.estimate:gt(0)').remove();
				$('#orderlist tfoot tr:gt(0)').hide();
				$('#estimation_toolbar, #express_checker').hide();
				$('#express_checker').removeAttr('checked');
				freeform.show();
				$('#optprice_table').find('tr').show();
				$('#options_wrapper').after($('#modify_customer_wrapper'));
				$('#modify_customer_wrapper').after($('#delivery_address_wrapper'));
				$('#pricinglist').hide();
			}
			$(':radio[name="ordertype"]', '#enableline').hide();

			// ��Ľ�ʥӥС�������
			var navi_id = 0;
			if (mode != 'repeat') {
				if (info['shipped'] == 2) {
					navi_id = 5; // ȯ���Ѥ�
				} else {
					switch (info['progress_id']) {
						case '1': // ��礻
						case '2': // �����Ԥ���̤���ѡ�
						case '3': // ���ѥ᡼��ѡ�̤���ѡ�
							navi_id--;
							break;
						case '4': // ��ʸ����
							navi_id = info['progress_id'];
							break;
						case '5': // ���������
							navi_id = 2;
							break;
						case '6': // ���
							navi_id = info['progress_id'];
							$('#order_cancel').show();
							break;
						case '7': // ����贰λ
							navi_id = 3;
							$('#done_image').show();
							break;
					}
				}
			}
			mypage.setAcceptnavi(navi_id);

			// ���ѽ������Ѥ߼㤷������ʸ�����ꤷ�Ƥ�����ϡ��ʹ�����ѹ����Բ�
			var progress = info['progress_id'] - 0;
			$('ins', '#phase_wrapper').hide();
			if (progress >= 3 && mode != 'repeat') {
				$('input[name="phase"], label', '#phase_wrapper').hide();
				if (progress == 3) {
					$('#order_estimate').show();
				} else if (progress == 4) {
					$('#order_completed').show();
					if (!info['state_0'] || info['state_0'] == '0') {
						$('#order_stock').show();
					}
				} else if (progress == 6) {
					$('#order_cancel').show();
				}
			} else {
				$('input[name="phase"], label', '#phase_wrapper').show();
			}

			// ��ǥ��������å��γ�ǧ
			$(':radio[name!="firstcontact"]', '#mediacheck_wrapper').removeAttr('checked');
			$('#mediacheck03_other').val('����¾');
			var media_rec = [];
			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: {
					'act': 'search',
					'mode': 'media',
					'field1[]': ["orders_id"],
					'data1[]': [info['orders_id']]
				},
				success: function (r) {
					if (r == "") return;
					r = $.getDelimiter(r);
					media_rec = r.split($.delimiter['rec']);
					for (var v = 0; v < media_rec.length; v++) {
						var media_fld = media_rec[v].split($.delimiter['fld']);
						var media_type = media_fld[0].split($.delimiter.dat);
						var media_value = media_fld[1].split($.delimiter.dat);

						if (media_type[1] == 'mediacheck03') {
							if (media_value[1] == 'estimate' || media_value[1] == 'order' || media_value[1] == 'delivery') {
								$(':radio[name="mediacheck03"]', '#mediacheck_wrapper').val([media_value[1]]);
							} else {
								$(':radio[name="mediacheck03"]', '#mediacheck_wrapper').val(['other']);
								$('#mediacheck03_other').val(media_value[1]);
							}
						} else {
							$(':radio[name="' + media_type[1] + '"]', '#mediacheck_wrapper').val([media_value[1]]);
						}
					}
				}
			});

			// �����ǡ�����������
			var elem = [];
			var order_id = "000000000";
			if (arguments[1] == "modify" || arguments[1] == "search") order_id = ('000000000' + info['orders_id']).slice(-9);
			$('#order_id').text(order_id);
			for (i = 1; i < mypage.order_info.id.length; i++) {
				if ((mypage.order_info.id[i]).match(/paymentdate|manuscriptdate/)) {
					if ((info[mypage.order_info.id[i]]).match(/^0000-/)) {
						$('#' + mypage.order_info.id[i]).val('');
					} else {
						$('#' + mypage.order_info.id[i]).val((info[mypage.order_info.id[i]]));
					}
				} else if (mypage.order_info.id[i] == 'handover') {
					var element_data = info[mypage.order_info.id[i]].slice(0, -3);
					$('#' + mypage.order_info.id[i]).val(element_data);
				} else if (mypage.order_info.id[i] == 'receipt_price') {
					$('#' + mypage.order_info.id[i]).val(mypage.addFigure(info[mypage.order_info.id[i]]));
				} else {
					$('#' + mypage.order_info.id[i]).val(info[mypage.order_info.id[i]]);
				}
			}
			$('#designcharge').val(mypage.addFigure(info['designcharge']));
			if ($('#order_comment').val().trim() != "") $("#alert_comment:hidden").effect('pulsate', {
				'times': 4
			}, 250);

			for (i = 0; i < mypage.order_info.name.length; i++) {
				if (typeof info[mypage.order_info.name[i]] === 'undefined') {
					continue; // �ǡ����١����ˤ���̾���Υե�����ɤ�¸�ߤ��ʤ�
				}
				elem = $(':input[name="' + mypage.order_info.name[i] + '"]');
				if (elem.length===0) continue;
				switch (elem[0].type) {
					case 'checkbox':
						if (info[mypage.order_info.name[i]] == '0') elem.attr('checked', false);
						else elem.attr('checked', 'checked');
						break;
					case 'text':
					case 'number':
						if ((mypage.order_info.name[i]).match(/schedule\d+?$/) || mypage.order_info.name[i] == 'arrival') {
							if ((info[mypage.order_info.name[i]]).match(/^0000-/)) elem.val('');
							else elem.val((info[mypage.order_info.name[i]]));
						} else {
							elem.val(info[mypage.order_info.name[i]]);
							if (elem.is('.forPrice')) {
								elem.val(mypage.addFigure(info[mypage.order_info.name[i]]));
							}
						}
						break;
					case 'radio':
						if (mypage.order_info.name[i] == 'payment') {
							if (!(info[mypage.order_info.name[i]]).match(/(wiretransfer|cod|later_payment|cash|credit|conbi|other|0)/)) {
								$('#optprice_table input[name="payment"]').val(['other']);
								$('#payment_other').val(info[mypage.order_info.name[i]]);
							} else {
								elem.val([info[mypage.order_info.name[i]]]);
								$('#payment_other').val('');
							}
						} else if (mypage.order_info.name[i] == 'handover') {
							if ((info[mypage.order_info.name[i]]).match(/^00/)) elem.val('0');
							else elem.val((info[mypage.order_info.name[i]]));
						} else {
							elem.val([info[mypage.order_info.name[i]]]);
						}
						break;
				}
			}
			// �޵�
			$('input[type="number"]', '#package_wrap').attr('max', info['order_amount']).val('0').parent('p').hide();
			$('input[name="package"]', '#package_wrap').each(function () {
				var state = $(this).val();
				if (info['package_' + state] == 1) {
					$(this).attr('checked', 'checked');
					if (state != 'no') {
						$('#pack_' + state + '_volume').val(info['pack_' + state + '_volume']).parent('p').show();
					}
				} else {
					$(this).removeAttr('checked');
				}
			});

			// ���Ϥ�����
			if (info['carriage'] == 'accept') {
				$('#handover').show();
			}

			$('#log_staff').val($('#reception').val());

			if (info['purpose'] == '����¾���٥��') {
				$('.other_1', '#questionnaire_table').val(info['purpose_text']);
			} else if (info['purpose'] == '����¾��˥ե�����') {
				$('.other_2', '#questionnaire_table').val(info['purpose_text']);
			} else if (info['purpose'] == '����¾����') {
				$('.other_3', '#questionnaire_table').val(info['purpose_text']);
			}

			// ��ԡ�������ʸ�ν��ɽ��
			if (mode == "repeat") {
				$('input[type="text"]', '#schedule').val(''); // �������塼��
				$('input[name="deliver"]', '#deliver_wrapper').val(['0']); // ȯ����ˡ
				$('#contact_number').val(''); // �����ȼԤΤ���礻�ֹ�
				$('#state_0 input').attr('checked', false); // ȯ�������å��򳰤�
				$('#free_discount').removeAttr('checked'); // ��������ϥ����å��򳰤�
				$('#discountfee').attr('readonly', 'readonly').addClass('readonly'); // ���������ɤ߼������

				$('.old_discount2', '#discount_table').hide(); // 2013-10-09�����ε쥿���פγ�������å��ʥ�ԡ��ȡ��Ҳ��ˤ���ɽ��
			} else {
				// �̾���ʸ

				// ȯ�������å�������
				if (!info['state_0'] || info['state_0'] == '0') {
					$('#state_0 input').attr('checked', false);
				} else {
					$('#state_0 input').attr('checked', true);
				}

				// ����μ����ϥ����å�
				if (info['free_discount'] == 1) {
					$('#free_discount').attr('checked', true);
					$('#discountfee').removeAttr('readonly').removeClass('readonly').val(info['discountfee']);
				} else {
					$('#free_discount').removeAttr('checked');
					$('#discountfee').attr('readonly', 'readonly').addClass('readonly');
				}

				// 2013-10-09�����ε쥿���פγ�������å��ʥ�ԡ��ȡ��Ҳ��ˤ�ɽ������
				if (info['discount2'] == "friend") {
					$('.old_discount2', '#discount_table').show();
				} else {
					$('.old_discount2', '#discount_table').hide();
				}
			}

			// ����ơ��֥��ñ�ȹ��ܤγ�ǧ
			$(':checkbox:not(#staffdiscount)', '#discount_table').attr('checked', false);
			var discount_val = [];
			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'text',
				async: false,
				data: {
					'act': 'search',
					'mode': 'discount',
					'field1[]': ["orders_id"],
					'data1[]': [info['orders_id']]
				},
				success: function (r) {
					if (r == "") return;
					r = $.getDelimiter(r);
					discount_val = r.split($.delimiter['rec']);
					for (var v = 0; v < discount_val.length; v++) {
						// ��ԡ�������ʸ�ν��ɽ���ξ��˥֥�����Ȥ��Τޤޥץ��ȡʵ쥤���˳�򳰤�
						if (mode == "repeat" && (discount_val[v] == 'blog' || discount_val[v] == 'illust')) continue;

						$(':checkbox[value="' + discount_val[v] + '"]', '#discount_table').attr('checked', 'checked');
					}
				}
			});

			// ��������å��Υ������������
			$('#discount_table input').each(function () {
				if ($(this).is(':checked')) {
					$(this).parent().addClass('fontred');
				} else {
					$(this).parent().removeClass('fontred');
				}
			});

			// �ܵҥ�󥯼���
			$('#rank').text('');
			$.api(['users', info['customer_id'], 'sales'], 'GET', null).then(function(u){
				var rank = 0,	// �������γ��Ψ
					rankName = '',
					sales = 0;
				if (u.length>0) sales = u[0]['total_price'];
				if (sales>300000) {
					rank = 7;
					rankName = '�������';
				} else if(sales>150000) {
					rank = 5;
					rankName = '����С�';
				} else if(sales>80000) {
					rank = 3;
					rankName = '�֥���';
				} else {
					rank = 0;
					rankName = '-';
				}
				
				$('#rank').text(rankName);
			});
			
			// �ܵҥǡ���������
			
			elem = document.forms.customer_form.elements;
			for (i = 0; i < elem.length; i++) {
				if ((elem[i].type == 'text' && elem[i].name != 'number') || elem[i].type == 'hidden' || elem[i].type == 'select-one' || elem[i].type == 'textarea') {
					$(elem[i]).val(info[elem[i].name]).focusout();
				}
			}
			var number = 0;
			if (info['cstprefix'] == 'g') {
				number = 'G' + ("0000" + info['number']).slice(-4);
			} else {
				number = 'K' + ("000000" + info['number']).slice(-6);
			}
			document.forms.customer_form.number.value = number;
			$('#paymenttype').val(info['paymenttype']);

			// �����ʬ����������ξ��˲���������롢�����������������ɽ��
			if (info['bill'] == 1) {
				$('tbody tr:first th:gt(0), tbody tr:first td:gt(0)', '#cyclebill_wrapper').hide();
			} else {
				$('tbody tr:first th:gt(0), tbody tr:first td:gt(0)', '#cyclebill_wrapper').show();
			}
			$('#cyclebill_wrapper').hide();
			mypage.displayFor('modify');

			// ���Ϥ���ǡ���������
			elem = document.forms.delivery_form.elements;
			for (i = 0; i < elem.length; i++) {
				if (elem[i].type == 'text') {
					$(elem[i]).val(info[elem[i].name]).focusout();
				}
			}
			if (info.delivery_id != 0) {
				mypage.inputControl(document.forms.delivery_form, false);
			} else {
				mypage.inputControl(document.forms.delivery_form, true);
			}

			// ȯ�����ǡ���������
			elem = document.forms.shipfrom_form.elements;
			for (i = 0; i < elem.length; i++) {
				if (elem[i].type == 'text') {
					$(elem[i]).val(info[elem[i].name]).focusout();
				}
			}

			// ����Ѥߤι������̤������å��Υ�����������
			if ($(':radio[name="completionimage"]:checked', '#designtype_table').val() != "0") {
				$(':radio[name="completionimage"]', '#designtype_table').parent(':contains("̤��")').parent().removeClass('pending');
			} else {
				$(':radio[name="completionimage"]', '#designtype_table').parent(':contains("̤��")').parent().addClass('pending');
			}
			if ($(':radio[name="manuscript"]:checked', '#designtype_table').val() != "0") {
				$(':radio[name="manuscript"]', '#designtype_table').parent(':contains("̤��")').parent().removeClass('pending');
			} else {
				$(':radio[name="manuscript"]', '#designtype_table').parent(':contains("̤��")').parent().addClass('pending');
			}
			if ($(':radio[name="payment"]:checked', '#optprice_table').val() != "0") {
				$(':radio[name="payment"]', '#optprice_table').parent(':contains("̤��")').removeClass('pending');
			} else {
				$(':radio[name="payment"]', '#optprice_table').parent(':contains("̤��")').addClass('pending');
			}
			if ($(':radio[name="deliver"]:checked', '#optprice_table').val() != "0") {
				$(':radio[name="deliver"]', '#optprice_table').parent(':contains("̤��")').removeClass('pending');
				if ($(':radio[name="deliver"]:checked', '#optprice_table').val() == "2") { // ��ޥȱ�͢
					$('#deliverytime_wrapper').show();
				}
			} else {
				$(':radio[name="deliver"]', '#optprice_table').parent(':contains("̤��")').addClass('pending');
				$('#deliverytime_wrapper').hide();
			}

			// ����ؼ��񥿥֤μ�����������
			$('#created').text(info['created']);

			// �����ƥऴ�Ȥ�����1�ơ��֥������
			$('#itemprint tbody').html('');

			// �����ƥ�ǡ������������sessionStorage�˳�Ǽ
			var store = {};
			var sess = sessionStorage;
			sess.clear();
			$.ajax({
				url: './php_libs/ordersinfo.php',
				type: 'POST',
				dataType: 'json',
				async: false,
				data: {
					'act': 'search',
					'mode': 'orderitem',
					'field1[]': ["orders_id"],
					'data1[]': [info['orders_id']]
				},
				success: function (r) {
					if (r instanceof Array) {
						var args = [];
						var master = 0;
						var hash = {};
						for (var i = 0; i < r.length; i++) {
							if (r[i]['master_id'] == 0) {
								var category = 0;
								if (r[i]['item_id'] != 0) category = r[i]['item_id'].slice(0, -3);
								master = 'mst_' + category + '_' + r[i]['item_name'] + '_' + r[i]['color_name'];
							} else {
								master = r[i]['master_id'];
							}
							args[i] = {
								'maker': r[i]['maker_name'],
								'master_id': master,
								'item_name': r[i]['item_name'],
								'color_code': r[i]['color_code'],
								'size_id': r[i]['size_id'],
								'size_name': r[i]['size_name'],
								'amount': r[i]['amount'],
								'cost': r[i]['cost'],
								'choice': 1,
								'stock_number': r[i]['stock_number'],
								'group1': r[i]['group1'],
								'group2': r[i]['group2']
							};
							var item_cost = 0;
							if (typeof hash[r[i]['item_id']] == 'undefined') {
								item_cost = r[i]['item_cost'] * r[i]['amount'];
								hash[r[i]['item_id']] = {
									'name': r[i]['item_name'],
									'vol': parseInt(r[i]['amount'], 10),
									'cost': item_cost,
									'fee': parseInt(r[i]['item_printfee'], 10),
									'one': r[i]['item_printone']
								};
							} else {
								item_cost = r[i]['item_cost'] * r[i]['amount'];
								hash[r[i]['item_id']]['cost'] += item_cost - 0;
								hash[r[i]['item_id']]['vol'] += r[i]['amount'] - 0;
							}
						}
						// ������ʸ�ξ��ϥ����ƥ�ܺ٥ơ��֥������
						var tr = '';
						if (mypage.prop.firmorder && info['noprint'] == 0 && info['free_printfee'] == 0 && hash[r[0]['item_id']]['fee'] > 0) {
							for (var itemid in hash) {
								tr += '<tr class="itemid_' + itemid + '">';
								tr += '<td>' + hash[itemid]['name'] + '</td>';
								tr += '<td class="toright volume">' + hash[itemid]['vol'] + '</td>';
								tr += '<td class="toright cost">' + mypage.addFigure(hash[itemid]['cost']) + '</td>';
								tr += '<td class="toright fee">' + mypage.addFigure(hash[itemid]['fee']) + '</td>';
								tr += '<td class="toright perone">' + mypage.addFigure(hash[itemid]['one']) + '</td>';
								tr += '<td class="toright subtot">' + mypage.addFigure(Math.ceil((hash[itemid]['cost'] + hash[itemid]['fee']) / hash[itemid]['vol'])) + '</td>';
								tr += '</tr>';
								$('#itemprint tbody').html(tr);
							}
						}
						store = mypage.setStorage(args);
					} else {
						alert('Error: p6368\n' + r);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert('Error: p6372\n' + textStatus + '\n' + errorThrown);
					return;
				}
			});

			mypage.showOrderItem(info, mode);
			var order_id_i = info['orders_id'];
			//alert(order_id_i);
			mypage.showDesignImg(order_id_i);
			mypage.showDesignedImg(order_id_i);
			mypage.prop.show_design_time = 0;
			mypage.uploadDesignImg(order_id_i);
			mypage.uploadDesignedImg(order_id_i);

			// ������ʸ�ξ����ɤ߼�����Ѥˤ���
			mypage.checkFirmorder();

			$('body, #header').removeClass('main_bg');
			$('#header .main_header').hide();
			$('#header').css({
				'height': '156px'
			});
			$('#header .inner').show();
			$('#main_wrapper').hide();
			$('#order_wrapper').show(
				'normal',
				function () {
					// �߸˿������С��γ�ǧ
					$('#orderlist tbody tr').each(function () {
						if (!$(this).find('.choice').is(':checked')) return true; // continue
						var amount = $(this).find('.listamount').val().replace(/,/g, '') - 0;
						var stock = $(this).find('.stock_status').text();
						if (stock.match(/^\d+?$/)) {
							if (amount > stock) {
								$.msgbox('�߸˿������С��Υ����ƥब����ޤ���');
								return false;
							}
						} else if (stock == '��') {
							$.msgbox('�߸˿���0�ξ��ʤ�����ޤ���');
							return false;
						} else {
							return true; // continue
						}
					});
				}
			);

			if (mode == 'repeat') {
				mypage.prop.modified = true;
			} else {
				mypage.prop.modified = false;
			}
		};

		switch (func) {
			case 'btn':
				if (typeof arguments[1] == 'string') {
					// ������Ͽ
					switch (arguments[1]) {
						case 'self-design':
							mypage.prop.applyto = 1;
							$('#maintitle').val('SELF-DESIGN');
							$('#reuse_plate').text('����(SD)');
						case '0':
							$('body, #header').removeClass('main_bg');
							$('#header').css('height', '156px');
							$('#header .main_header').hide();
							$('#header .inner').show();
							$('#main_wrapper').hide();
							mypage.displayFor('addnew');
							mypage.init();
							if ($('#tab_order').hasClass('headertabs')) {
								$('#tab_order').click();
							} else {
								$('#order_wrapper').show(250, function () {
									$(document).scrollTop(0);
								});
							}
							mypage.prop.modified = false;
							break;
						default:
							// ¾�β��̤������ID��ľ�ܼ������ƽФ����
							orderpage(arguments[1], 'search');
					}
					_ID = "";
				} else if (arguments[1].attr('title') == 'reset') {
					// ���̤Υꥻ�å�
					mypage.main('clear');
				} else {
					// ��ʸ���ղ��̤Υܥ���ȸ����ե�����إܥ���
					btn(arguments[1]);
				}
				break;

			case 'clear':
				$('#result_searchtop').html('');
				$('#result_count').text('0');
				$('#progress_id').val("0");
				$('#acceptstatus_navi li').each(function (index) {
					if ($(this).children().hasClass('active_crumbs') && index > 0) {
						$(this).children().removeClass('active_crumbs');
					}
				});
				$('#acceptstatus_navi li p:first').addClass('active_crumbs');
				document.forms.searchtop_form.reset();
				var dt = new Date();
				dt.setDate(dt.getDate());
				var d = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2);
				document.forms.searchtop_form.term_from.value = d;
				dt.setDate(dt.getDate() - 10);
				document.forms.searchtop_form.lm_from.value = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2);
				document.forms.searchtop_form.id.focus();
				$('#term_from, #term_to').change();
				break;
		}
	}
};
