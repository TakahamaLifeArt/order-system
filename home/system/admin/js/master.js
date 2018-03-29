/*
*	タカハマライフアート
*	Form input control and library
*	charset euc-jp
*
*	depends:	jQuery.js
*				modalbox/css/jquery.modalbox.css
*				modalbox/jquery.modalbox.js
*/

$(function(){
	/********************************
	*	restriction of input
	*/
	jQuery.fn.extend({
		restrictKey: function(e, mode){
			var my = (e.target || window.event.srcElement);
			var code=(e.charCode) ? e.charCode : ((e.which) ? e.which : e.keyCode);
			switch(mode){
			case 'num':
				if ( !e.ctrlKey 				// Ctrl+?
					&& !e.altKey 				// Alt+?
					&& code != 0 				// ?
					&& code != 8 				// BACKSPACE
					&& code != 9 				// TAB
					&& code != 13 				// Enter
					&& code != 37 && code != 39 // ←→
					&& (code < 48 || code > 57)) // 0..9
					e.preventDefault();

				if(code == 13 || code == 3) $(this).moveCursor(my).change();
				break;
			case 'price':
				if ( !e.ctrlKey 				// Ctrl+?
					&& !e.altKey 				// Alt+?
					&& code != 0 				// ?
					&& code != 8 				// BACKSPACE
					&& code != 9 				// TAB
					&& code != 13 				// Enter
					&& code != 37 && code != 39 // ←→
					&& code != 45				// -
					&& code != 46				// .
					&& (code < 48 || code > 57)) // 0-9
					e.preventDefault();

				if(code == 13 || code == 3) $(this).moveCursor(my).change();
				break;
			case 'date':
				if ( !e.ctrlKey 				// Ctrl+?
					&& !e.altKey 				// Alt+?
					&& code != 0 				// ?
					&& code != 8 				// BACKSPACE
					&& code != 9 				// TAB
					&& code != 13 				// Enter
					&& code != 37 && code != 39 // ←→
					&& code != 45				// -
					&& (code < 47 || code > 57)) // 0-9 /
					e.preventDefault();

				if(code == 13 || code == 3) $(this).moveCursor(my);
				break;
			}

			return this;
		},
		moveCursor: function(my){
			if(!my.form){
				my.blur();
				return this;	// form要素でなければ何もしない
			}
			var first = -1;		// form内の最初のtext（readonlyは除く）のインデックス
			var isMove = false;	// カーソル移動が出来たかどうかのチェック
			var elem = my.form.elements;
			for(var i=0; i<elem.length; i++){
				if( first==-1 && elem[i].type=="text" && !$(elem[i]).attr('readonly') && elem[i].style.display!='none' ) first = i;
				if( elem[i]==my ){
					while(i<elem.length-1){
						i++;
						if( elem[i].type=="text" && !$(elem[i]).attr('readonly') && elem[i].style.display!='none' ){
							elem[i].focus();
							isMove = true;
							break;
						}
					}
					if( !isMove && first!=-1 ) elem[first].focus();
					break;
				}
			}
			return this;
		}
	});

	/********************************
	*	common class
	*/
	// 0と自然数　0から9 のみ入力、桁区切りなし、不正値は"0"
	$('.forNum').live('keypress', function(e){
		$(this).restrictKey(e, 'num');
	}).blur( function(e){
		$.check_NaN(this);
	});

	// 0と自然数　0から9 のみ入力、桁区切りなし、不正値は""
	$('.forBlank').live('keypress', function(e){
		$(this).restrictKey(e, 'num');
	}).blur( function(e){
		$.check_NaN(this,"");
	});

	// 金額　0から9 . - のみ入力、桁区切りあり、フォーカスでカンマなしに変換、不正値は"0"
	$('.forPrice').live('keypress', function(e){
		$(this).restrictKey(e, 'price');
	}).focus( function(){
		var c = this.value;
		this.value = c.replace(/,/g, '');
		var self = this;
		$(self).select();
	}).blur( function(e){
		var c = this.value;
		this.value = $.addFigure(c);
	});

	// 日付　0から9 / - のみ入力し、不正値は""
	$('.forDate').live('keypress',function(e){
		$(this).restrictKey(e,'date');
	}).blur( function(e){
		$.check_date(e, this);
	});

	// zipcode mask
	$('.forZip').keypress( function(e) {
		$(this).restrictKey(e,'num');
	}).focus( function(){
		$.restrict_num(7, this);
	}).blur( function(){
		this.maxLength = 8;
		this.value = $.zip_mask(this.value);
	});

	// tel and fax mask
	$('.forPhone').keypress( function(e) {
		$(this).restrictKey(e,'num');
	}).focus( function(){
		$.restrict_num(11, this);
	}).blur( function(){
		var res = $.phone_mask(this.value);
		this.maxLength = res.l;
		this.value = res.c;
	});
	
	
	
/***********************************************************************************************************************
 *
 *		Event module
 *
 ***********************************************************************************************************************/

	/********************************
	*	pulldown list for main menu
	*		height is 30 * row + 5(margin)
	*/
	$(".mainmenu li ul", "#header").hover(
		function(){ $(this).stop().animate({height:'180px'},{queue:false,duration:300}); },
		function(){ $(this).stop().animate({height:'0px'},{queue:false,duration:300}); }
	);
	
	
	/********************************
	*	hide overlay
	*/
	$('#overlay').click( function(){
		if($('.popup_wrapper:visible').length){
			$('.popup_wrapper:visible').fadeOut();
		}
		$.screenOverlay(false);
	});
	
	/********************************
	 *	カテゴリーの変更でアイテム一覧の表示切替
	 */
	$('#snavi li').click( function(){
		var category_id = $(this).children('span').text();
		$.viewlist(category_id);
	});
	
	/********************************
	 *	商品以外の一覧表示
	 */
	$('#slist li').click( function(){
		var id = $(this).children('span').text();
		$.viewlist(id, 'list');
	});
	
	/********************************
	 *	タグの一覧表示
	 */
	$('#tags li').click( function(){
		var id = $(this).children('span').text();
		id = parseInt(id) + 2;
		$.viewlistTag(id, 'list_id');
	});
	
	/********************************
	 *	画面モードの切替
	 */
	$('#switchover :radio[name="mode"]').change( function(){
		this.form.submit();
	});
	
	/********************************
	 *	一覧表示へ
	 */
	$('#showlist').click( function(){
		if($(this).text()=='一覧表示へ'){
			var category_id = $('#basictable caption').text().split('.')[0];
			$.viewlist(category_id);
		}else{
			var item_id = $('#basictable tbody tr:first').attr('id').split('_')[1];
			$.showItemDetail(item_id);
			$('#updatetable_wrap').html('');
		}
		$('.button_wraptop, .button_wrapbottom').hide();
	});
	
	/********************************
	 *	編集画面へ
	 */
	$('#editmode').click( function(){
		$.updatemode();
	});

	/********************************
	 *	キャンセル
	 */
	$('.cancel_button').live('click', function(){
		$.updatemode();
	});

	/********************************
	 *	価格テーブルに行を追加
	 */
	$('#addrow_price').live('click', function(){
		var list = '<input type="image" src="../img/remove.gif" width="20" style="vertical-align:middle;" class="delrow_price" />';
		list += '<select class="change_size" onchange="$.setNewsizeID(this);">';
		for(var i=0; i<$.size.list.length; i++){
			var size_name = $.size.list[i];
			list += '<option value="'+$.size.hash[size_name]+'">'+size_name+'</option>';
		}
		list += '</select>';
		
		var endrow = $('#pricetable tbody tr:last');
		var self = endrow.clone().attr('class','price_0');
		self.children('th:first').html(list).children('.change_size').val(endrow.children('th:first').attr('class').split('_')[1]);
		self.children(':last').html('<input type="text" value="" class="datepicker forDate" />');
		self.insertAfter(endrow);
		self.find('.datepicker').datepicker().blur( function(e){
			$.check_date(e, this);
		});
		self.find('.forBlank').blur( function(){
			$.check_NaN(this,"");
		});
		self.find('.forNum').blur( function(){
			$.check_NaN(this);
		});
	});
	
	$('.delrow_price').live('click', function(){
		$(this).closest('tr').remove();
	});
	
	/********************************
	 *	カラーテーブルに行を追加
	 */
	$('.addrow_color').live('click', function(){
		var endrow = $(this).closest('tfoot').siblings('tbody').children('tr:last');
		var self = endrow.clone().attr('class','master_0');
		self.children('td:first').html('<input type="image" src="../img/remove.gif" width="20" style="vertical-align:middle;" class="delrow_color" />');
		self.children(':last').html('<input type="text" value="" class="datepicker forDate" />');
		self.insertAfter(endrow);
		self.find('.datepicker').datepicker().blur( function(e){
			$.check_date(e, this);
		});
		self.find(".color_name").autocomplete({
			source: 
				function(req, res){
				var list = [];
				var n = 0;
				for(var i=0; i<$.itemcolor.names.length; i++){
					if($.itemcolor.names[i].indexOf(req.term)==0){
						list[n++] = $.itemcolor.names[i];
					}
				}
				res(list);
			},
			delay: 0,
			minLength: 1,
			autoFocus: true
		}).focus( function(){
			$(this).autocomplete('search',$(this).val());
		});
	});
	
	$('.delrow_color').live('click', function(){
		$(this).closest('tr').remove();
	});
	
	/********************************
	 *	寸法テーブルに行を追加
	 */
	$('.addrow_measure').live('click', function(){
		var body = $(this).closest('tfoot').siblings('tbody');
		var self = body.children('tr:first').clone().attr('class','measure_0');
		self.children('th:first').children("select").val("").after('<input type="image" src="../img/remove.gif" width="20" style="vertical-align:middle;" class="delrow_measure" />');
		self.find("input").val("");
		self.appendTo(body);
	});
	
	$('.delrow_measure').live('click', function(){
		$(this).closest('tr').remove();
	});
	
	/********************************
	 *	新規登録のモード切替
	 */
	$('.step1').live('click', function(){
		$('.step2').removeClass('cur');
		$('.step1').addClass('cur');
		$('.step2_wrap').hide('fast', function(){$('.step1_wrap').show();});
		$('.button_wraptop, .button_wrapbottom').hide();
	});
	$('.step2').live('click', function(){
		var category_id = $('.category_id').val();
		if(category_id==''){
			$.msgbox('商品カテゴリーを指定してください。');
			return;
		}
		
		var basic = $('#basictable tbody tr:first');
		var item_code = basic.find('.item_code').val();
		var item_name = basic.find('.item_name').val();
		if(!item_code.match(/^[0-9A-Za-z-]+$/)){
			$.msgbox('アイテムコードに使用できる文字は、半角英数とハイフン(-)だけです。');
			return;
		}else if(item_code==""){
			$.msgbox('アイテムコードを入力してください。');
			return;
		}else{
			var codeCheck = $.codeCheck(item_code);
			if(codeCheck == 1){
				$.msgbox('商品コード'+item_code+'が存在しています。');
				return;
			}
		}
		if(item_name==""){
			$.msgbox('アイテム名を入力してください。');
			return;
		}
		var size = [];
		$('#pricetable tbody tr').each( function(){
			var chk = true;
			var input_len = $(this).children('td').length;
			for(var i=0; i<input_len; i++){
				if($(this).children('td:eq('+i+')').children('input').val()-0 == 0){
					chk = false;
					break;
				}
			}
			if(chk){
				var th = $(this).children('th');
				size[th.attr('class').split('_')[1]] = th.text();
			}
		});
		if(size.length==0){
			$.msgbox('サイズと価格または梱包枚数の指定がありません。');
			return;
		}
		
		var head = '<tr><th>Size</th>';
		var body = '<tr><th>ﾊﾟﾀｰﾝ</th>';
		for(var sizeid in size){
			head += '<th>'+size[sizeid]+'</th>';
			body += '<td><input type="checkbox" value="'+sizeid+'" name="'+size[sizeid]+'" checked="checked" /></td>';
		}
		head += '</tr>';
		body += '</tr>';
		$('.seriestable thead').html(head);
		$('.seriestable tbody').html(body);
		$('.step1').removeClass('cur');
		$('.step2').addClass('cur');
		$('.step1_wrap').hide('fast', function(){$('.step2_wrap').show();});
		$('.button_wraptop, .button_wrapbottom').show();
	});
	
	/********************************
	*	カラーの新規追加行を取り消す
	*/
	$('#add_color').click( function(){
		var tr = '<tr>';
		tr += '<td><input type="text" value="" class="color_code" /></td>';
		tr += '<td><input type="text" value="" class="color_name" /></td>';
		tr += '<td class="ac"><select class="series"><option value="1" selected="selected">制限なし</option><option value="2">制限あり</option></select></td>';
		tr += '<td><input type="button" value="取消" class="cancel_color" onclick="$.removeColor(this);" /></td>';
		tr += '</tr>';
		$('.colortable tbody').append(tr);
		$( ".step2_wrap .colortable tbody tr:last .color_name" ).autocomplete({
			source: 
				function(req, res){
				var list = [];
				var n = 0;
				for(var i=0; i<$.itemcolor.names.length; i++){
					if($.itemcolor.names[i].indexOf(req.term)==0){
						list[n++] = $.itemcolor.names[i];
					}
				}
				res(list);
			},
			delay: 0,
			minLength: 1,
			autoFocus: true
		}).focus( function(){
			$(this).autocomplete('search',$(this).val());
		});
		
	});
	
	/********************************
	*	アイテムカラー名の新規登録
	*/
	$('.addnew_itemcolor', '#itemcolortable').live('click', function(){
		var curdate = $('#apply').val();
		var color_name = $('.itemcolor_name', '#itemcolortable').val().trim();
		if(color_name=='') return;
		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'insert', 'mode':'itemcolor', 'curdate':curdate, 'field1[]':['color_name'], 'data1[]':[color_name]}, 
			success: function(r){
				if(r){
					if(r == 2){
						$.msgbox('該当カラーは存在しています。');
					} else {
						$.viewlist(1, 'list');
					}
				}else{
					alert('Error: p344\n'+r);
				}
			}
		});
 	});

	/********************************
	*	メーカーの新規登録
	*/
	$('.addnew_maker', '#makertable').live('click', function(){
		var curdate = $('#apply').val();

		var maker_name = $('.maker_name', '#makertable').val().trim();
		if(maker_name==''){
 			$.msgbox('メーカー名を指定してください。');
			return;
		}
		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'insert', 'mode':'maker', 'curdate':curdate, 'field1[]':['maker_name'], 'data1[]':[maker_name]}, 
			success: function(r){
				if(r){
					if(r == 2){
						$.msgbox('該当メーカーは存在しています。');
					} else {
						$.viewlist(4, 'list');
					}
				}else{
					alert('Error: p465\n'+r);
				}
			}
		});
 	});	
	/********************************
	*	メーカー情報の更新
	*/
	$('.update_maker', '#mastertable').live('click', function(){
		var curdate = $('#apply').val();
		if(curdate==''){
			$.msgbox('登録する日付を指定してください。');
			return;
		}
		var fld = ['maker_id','maker_name'];
		var dat = [];
		var tmp = '';
		$('#mastertable tbody tr').each( function(){
			tmp = $(this).attr('id').split('_')[1];
			tmp += '|' + $('.maker_name', this).val();
			dat.push(tmp);
		});

		if(!confirm('メーカーを更新します、よろしいですか？')){
			return;
		}

		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'update', 'mode':'maker', 'curdate':curdate, 'field2[]':fld, 'data2[]':dat}, 
			success: function(r){
				if(r){
					$.viewlist(4, 'list');
				}else{
					alert('UPDATE MAKER ERROR');
				}
			}
		});
	});

	/********************************
	*	メーカーの削除
	*/
	$('.delete_maker', '#mastertable').live('click', function(){
		var curdate = $('#apply').val();
		var fld = ['maker_id'];
		var dat =$(this).attr('no');
		var info = $(this).attr('name');
		if(!confirm( 'メーカー '+ info + ' を削除します、よろしいですか？')){
			return;
		}

		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'delete', 'mode':'maker', 'curdate':curdate, 'field1[]':fld, 'data1[]':dat}, 
			success: function(r){
				if(r){
					$.viewlist(4, 'list');
				}else{
					alert('Error: MAKER DELETE ERROR');
				}
			}
		});
 	});	
	
	/*********************************
	*	タグ名の新規登録
 	*/
	$('.addnew_tag', '#tagtable').live('click', function(){
		var curdate = $('#apply').val();
		var tag_name = $('.tag_name', '#tagtable').val().trim();
		var tag_order = parseInt($('.tag_order', '#tagtable').val().trim());
		var vlist = $(this).attr('name');
//		var tag_type = (vlist-1);
		var tag_type = (vlist);
		var orderMin = parseInt($('.orderMin').val());
		var orderMax = parseInt($('.orderMax').val());
		if(tag_name==''){
			$.msgbox('タグ名を指定してください。');
				return;
		}else if(tag_order==''){
			$.msgbox('表示順を指定してください。');
				return;		
		}else if(isNaN(tag_order)){
			$.msgbox('数字を入力してください。');
				return;		
				}
		if( tag_order>orderMax || tag_order<orderMin){
			$.msgbox('表示順を'+orderMin+'から'+orderMax+'までの間に設定してください');
				return;
		}
		
		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'insert', 'mode':'tag', 'curdate':curdate, 'field1[]':['tag_name','tag_type','tag_order'], 'data1[]':[tag_name,tag_type,tag_order]}, 
			success: function(r){
				if(r){
					if(r == 2){
						$.msgbox('該当タグ名は存在しています。');
					} else {
						$.viewlistTag(vlist, 'list');
					}
				}else{
					alert('タグ新規ERROR');
				}
			}
		});
 	});

	/*********************************
	*	タグ名の更新
	*/
	$('.update_tag', '#tagmastertable').live('click', function(){
		var curdate = $('#apply').val();
		var fld = ['tagid','tag_name','tag_type','tag_order'];
		var dat = [];
		var tmp = '';
		var vlist = $('#tagmastertable tbody tr').attr('class');
		var orderMin = parseInt($('.orderMin').val());
		var orderMax = parseInt($('.orderMax').val());

		$('#tagmastertable tbody tr').each( function(){
				var tag_name = $('.tag_name', this).val();
				var tag_order = $('.tag_order', this).val();
				if(tag_name==''){
					$.msgbox('タグ名を指定してください。');
					return;
				}else if(tag_order==''){
					$.msgbox('表示順を指定してください。');
					return;		
				}else if(isNaN(tag_order)){
					$.msgbox('表示順に数字を入力してください。');
					return;		
				}
				if( tag_order>orderMax || tag_order<orderMin ){
					$.msgbox('表示順を'+orderMin+'から'+orderMax+'までの間に設定してください');
					return;
				}
			tmp = $(this).attr('id').split('_')[1];//id
//			tmp += '|' + $('.tag_name', this).val();//name
			tmp += '|' + tag_name;//name
			tmp += '|' + ($(this).attr('class'));//type
//			tmp += '|' + $('.tag_order', this).val();//order
			tmp += '|' + tag_order;//order
			dat.push(tmp);
		});

		if(!confirm('タグを更新します、よろしいですか？')){
			return;
		}

		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'update', 'mode':'tag', 'curdate':curdate, 'field2[]':fld, 'data2[]':dat}, 
			success: function(r){
				if(r){
					$.viewlistTag(vlist, 'list');
				}else{
					alert('タグ更新ERROR');
				}
			}
		});
 	});

	/*********************************
	*	タグ名の削除
	*/
	$('.delete_tag', '#tagmastertable').live('click', function(){
		var curdate = $('#apply').val();
		var vlist = $('#tagmastertable tbody tr').attr('class');
		var tagid = $(this).attr('no');
		var info = $(this).attr('name');

		if(!confirm('タグ ' + info + ' を削除します、よろしいですか？')){
			return;
		}

		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'delete', 'mode':'tag', 'curdate':curdate, 'field1[]':['tagid'], 'data1[]':[tagid]}, 
			success: function(r){
				if(r){
					$.viewlistTag(vlist, 'list');
				}else{
					alert('DELETE tag ERROR');
				}
			}
		});
 	});

	/********************************
	*	サイズシリーズの新規追加
	*/
	$('#add_series').live('click', function(){
		var curdate = $('#apply').val();
		if(curdate==''){
			$.msgbox('登録する日付を指定してください。');
			return;
		}
		var item_id = $('#basictable tbody tr:first').attr('id').split('_')[1];
		var dat = [];
		$('#sizetable tbody tr:eq(1) td:gt(0) input:checked').each( function(){
			dat.push($(this).val());
		});
		
		if(dat.length==0){
			$.msgbox('サイズを指定してください。');
			return;
		}
		
		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'insert', 'mode':'sizeseries', 'curdate':curdate, 'item_id':item_id, 'size_id':dat}, 
			success: function(r){
				if(r){
					$.showItemDetail(item_id);
					$('#updatetable_wrap').html('');
					$('.button_wraptop, .button_wrapbottom').hide();
				}else{
					alert('Error: p477\n'+r);
				}
			}
		});
 	});
	
	/********************************
	*	スタッフの新規登録
	*/
	$('.addnew_staff', '#stafftable').live('click', function(){
		var curdate = $('#apply').val();
		if(curdate==''){
			$.msgbox('登録する日付を指定してください。');
			return;
		}
		var staffname = $('.staff_name', '#stafftable').val().trim();
		if(staffname==''){
			$.msgbox('スタッフの名前を入力してください。');
			return;
		}
		
		var fld = ['staffname'];
		var dat = [staffname];
		$('#stafftable tbody tr:first td:gt(0) :checkbox:checked').each( function(){
			fld.push($(this).attr('class'));
			dat.push(1);
		});
		if(fld.length==1){
			$.msgbox('担当する作業を指定指定してください。');
			return;
		}
		
		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'insert', 'mode':'staff', 'curdate':curdate, 'field1[]':fld, 'data1[]':dat}, 
			success: function(r){
				if(r){
					$.viewlist(5, 'list');
				}else{
					alert('Error: p516\n'+r);
				}
			}
		});
 	});
	
	/********************************
	*	スタッフ情報の更新
	*/
	$('.update_staff', '#mastertable').live('click', function(){
		var curdate = $('#apply').val();
		if(curdate==''){
			$.msgbox('登録する日付を指定してください。');
			return;
		}
		var fld = ['id','staffname','rowid1','rowid2','rowid3','rowid4','rowid5','rowid6','staffdate'];
		var dat = [];
		var tmp = '';
		$('#mastertable tbody tr').each( function(){
			tmp = $(this).attr('id').split('_')[1];
			tmp += '|' + $('td:first', this).text();
			for(var i=1; i<8; i++){
				tmp += '|' + $('td:eq('+i+') input', this).val();
			}
			dat.push(tmp);
		});
		
		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'update', 'mode':'staff', 'curdate':curdate, 'field2[]':fld, 'data2[]':dat}, 
			success: function(r){
				if(r){
					$.viewlist(5, 'list');
				}else{
					alert('Error: p550\n'+r);
				}
			}
		});
	});
	
	/********************************
	*	商品の新規登録
	*/
	$('.addnew_button').click( function(){
		var curdate = $('#apply').val();
		if(curdate==''){
			$.msgbox('登録する日付を指定してください。');
			return;
		}
		
		// 基本情報
		var category_id = $('.category_id').val();
		if(category_id==''){
			$.msgbox('商品カテゴリーを指定してください。');
			return;
		}
		var tbl = $('#basictable tbody tr:first');
		var item_code = tbl.find('.item_code').val();
		var item_name = tbl.find('.item_name').val();
		var ratio_id = tbl.find('.ratio_id').val();
		var pp_id = tbl.find('.pp_id').attr('alt');
		var maker_id = tbl.find('.maker_id').val();
		var item_row = tbl.find('.item_row').val();
		var opp = tbl.find('.opp').val();
		var oz = tbl.find('.oz').val();
		var lineup = tbl.find('.lineup:checked').length;
		var show_site_list = $('.show_site:checked').map(function() {
		return $(this).val();
		});
	var show_site="";
		for(var i=0; i<show_site_list.length; i++){
				if(i != 0) {
					show_site += ",";
				}
				show_site += show_site_list[i];
		}

		if(!item_code.match(/^[0-9A-Za-z-]+$/)){
			$.msgbox('アイテムコードに使用できる文字は、半角英数とハイフン(-)だけです。');
			return;
		}else{
			var codeCheck = $.codeCheck(item_code);
			if(codeCheck == 1){
				$.msgbox('商品コード'+item_code+'が存在しています。');
				return;
			}
		}

		if(item_name==""){
			$.msgbox('アイテム名を入力してください。');
			return;
		}
		var fld1 = ['category_id','item_code','item_name','printratio_id','printposition_id','maker_id','item_row','opp','oz','lineup','show_site'];
		var data1 = [category_id,item_code,item_name,ratio_id,pp_id,maker_id,item_row,opp,oz,lineup,show_site];
		
		// サイズと価格
		var fld2 = ['size_id','price_1','price_0','price_maker_1','price_maker_0','numbernopack','numberpack'];
		var data2 = [];
		var sizeid = [];
		var n = 0;
		$('#pricetable tbody tr').each( function(){
			var chk = true;
			var tmp = '';
			var input_len = $(this).children('td').length;
			for(var i=0; i<input_len; i++){
				var fee = $(this).children('td:eq('+i+')').children('input').val();
				if(fee-0 == 0){
					chk = false;
					break;
				}
				tmp += '|'+fee; 
			}
			if(chk){
				var size_id = $(this).children('th').attr('class').split('_')[1];
				sizeid[n] = size_id + tmp;
				data2[n++] = size_id + tmp;
			}
		});
		if(data2.length==0){
			$.msgbox('サイズと価格の指定がありません。');
			return;
		}
		
		// サイズシリーズ
		var fld3 = ['size_id'];
		var data3 = [];
		var s = 0;
		$('.seriestable tbody tr:first td').each( function(index){
			if($(this).children(':checkbox').is(':checked')){
				data3[s++] = sizeid[index];
			}
		});
		
		var series = 2;
		if(s==n){	// サイズ制限なし
			data3 = [];
			series = 1;
		}
		
		// カラー
		var fld4 = ['color_code','color_id','size_series'];
		var data4 = [];
		var msg = ['カラーコードに使用できる文字は、半角英数とハイフン(-)だけです。', 'カラー名を確認して下さい。'];
		var chk = -1;
		var p = 0;
		$('.colortable tbody tr').each( function(){
			var tmp = '';
			
			var td = $(this).children('td');
			var color_code = td.find('.color_code').val();
			var color_name = td.find('.color_name').val();
			if(!color_code.match(/^[0-9A-Za-z-]+$/)){
				chk = 0;
			}else{
				tmp += color_code+'|';
			}
			
			if(color_name=="" || typeof $.itemcolor.hash[color_name]==='undefined'){
				tmp = '';
				td.find('.color_name').val('');
				if(chk==-1){
					chk = 1;
				}else if(chk==0){
					chk = -1;
				}
			}else if(tmp!=''){
				tmp += $.itemcolor.hash[color_name] + '|';
			}
			
			if(tmp!=''){
				if(series==1){
					tmp += 1;
				}else{
					tmp += td.find('.series').val();
				}
				data4[p++] = tmp;
			}else if(chk!=-1){
				return false;
			}
			
		});
		if(p==0){
			$.msgbox('商品カラーを指定してください。');
			return;
		}else if(chk!=-1){
			$.msgbox(msg[chk]);
			return;
		}
		
		if(!confirm("【 商品の登録 】\n"+curdate + " から適用されます。")){
			return;
		}
		
		$('.step2').removeClass('cur');
		$('.step1').addClass('cur');
		$('.step2_wrap').hide('fast', function(){$('.step1_wrap').show();});
		$('.button_wraptop, .button_wrapbottom').hide();
		$('.category_id').val('');
		var basic = $('#basictable tbody tr:first');
		basic.find('.item_code').val('');
		basic.find('.item_name').val('');
		basic.find('.ratio_id').val('1');
		basic.find('.pp_id').attr({'alt':'1', 'src':$._DB.imgPath+'/printposition/t-shirts/normal-tshirts/layout_front.png'});
		basic.find('.maker_id').val('1');
		basic.find('.item_row').val('10');
		basic.find('.opp').val('0');
		basic.find('.oz').val('0');
		basic.find('.lineup').removeAttr('checked');
		$('#pricetable tbody tr td :input').val('0');
		$('.seriestable thead').html('<tr><th></th></tr>');
		$('.seriestable tbody').html('<tr><td></td></tr>');
		var tr = '<tr>';
		tr += '<td><input type="text" value="" class="color_code" /></td>';
		tr += '<td><input type="text" value="" class="color_name" /></td>';
		tr += '<td class="ac"><select class="series"><option value="1" selected="selected">制限なし</option><option value="2">制限あり</option></select></td>';
		tr += '<td></td>';
		tr += '</tr>';
		$('.colortable tbody').html(tr);
		$( ".step2_wrap .colortable tbody tr:last .color_name" ).autocomplete({
			source: 
				function(req, res){
				var list = [];
				var n = 0;
				for(var i=0; i<$.itemcolor.names.length; i++){
					if($.itemcolor.names[i].indexOf(req.term)==0){
						list[n++] = $.itemcolor.names[i];
					}
				}
				res(list);
			},
			delay: 0,
			minLength: 1,
			autoFocus: true
		}).focus( function(){
			$(this).autocomplete('search',$(this).val());
		});
		
		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'insert', 'mode':'item', 'curdate':curdate, 'field1[]':fld1, 'data1[]':data1, 'field2[]':fld2, 'data2[]':data2, 'field3[]':fld3, 'data3[]':data3, 'field4[]':fld4, 'data4[]':data4}, 
			success: function(r){
				if(r){
					$('.step2').removeClass('cur');
					$('.step1').addClass('cur');
					$('.step2_wrap').hide('fast', function(){$('.step1_wrap').show();});
					$('.button_wraptop, .button_wrapbottom').hide();
					
					$('.category_id').val('');
					var basic = $('#basictable tbody tr:first');
					basic.find('.item_code').val('');
					basic.find('.item_name').val('');
					basic.find('.ratio_id').val('1');
					basic.find('.pp_id').attr({'alt':'1', 'src':$._DB.imgPath+'printposition/t-shirts/normal-tshirts/layout_front.png'});
					basic.find('.maker_id').val('1');
					basic.find('.item_row').val('10');
					basic.find('.opp').val('0');
					basic.find('.oz').val('0');
					basic.find('.lineup').removeAttr('checked');
					
					$('#pricetable tbody tr td :input').val('0');
					
					$('.seriestable thead').html('<tr><th></th></tr>');
					$('.seriestable tbody').html('<tr><td></td></tr>');
					
					var tr = '<tr>';
					tr += '<td><input type="text" value="" class="color_code" /></td>';
					tr += '<td><input type="text" value="" class="color_name" /></td>';
					tr += '<td class="ac"><select class="series"><option value="1" selected="selected">制限なし</option><option value="2">制限あり</option></select></td>';
					tr += '<td></td>';
					tr += '</tr>';
					$('.colortable tbody').html(tr);
					$( ".step2_wrap .colortable tbody tr:last .color_name" ).autocomplete({
						source: 
							function(req, res){
							var list = [];
							var n = 0;
							for(var i=0; i<$.itemcolor.names.length; i++){
								if($.itemcolor.names[i].indexOf(req.term)==0){
									list[n++] = $.itemcolor.names[i];
								}
							}
							res(list);
						},
						delay: 0,
						minLength: 1,
						autoFocus: true
					}).focus( function(){
						$(this).autocomplete('search',$(this).val());
					});
				}else{
					alert('Error: p789\n'+r);
				}
			}
		});
		
	});

	/********************************
	*	データ更新
	*/
	$('.update_button').live('click', function(){
		var curdate = $('#apply').val();
		if(!confirm(curdate+" 付けでデータを更新します。よろしですか？")){
			return;
		}
		// 基本情報
		var tbl = $('#basictable tbody tr:first');
		var item_id = tbl.attr('id').split('_')[1];
		var item_code = tbl.find('.item_code').val();
		var item_name = tbl.find('.item_name').val();
		var ratio_id = tbl.find('.ratio_id').val();
		var pp_id = tbl.find('.pp_id').attr('alt');
		var maker_id = tbl.find('.maker_id').val();
		var item_row = tbl.find('.item_row').val();
		var lineup = tbl.find('.lineup:checked').length;
		var opp = tbl.find('.opp').val();
		var oz = tbl.find('.oz').val();
		var show_site="";
		var show_site_list = $('.show_site:checked').map(function() {
			return $(this).val();
		});
		
		$.screenOverlay(true);
		
		for(var i=0; i<show_site_list.length; i++){
			if(i != 0) {
				show_site += ",";
			}
			show_site += show_site_list[i];
		}

		var itemdate = $('#basictable tbody').find('.datepicker').val();
		if(!item_code.match(/^[0-9A-Za-z-]+$/)){
			$.msgbox('アイテムコードに使用できる文字は、半角英数とハイフン(-)だけです。');
			return;
		}
		if(item_name==""){
			$.msgbox('アイテム名を入力してください。');
			return;
		}
		if(itemdate==''){
			itemdate = '3000-01-01';
		}
		var fld1 = ['id','item_code','item_name','printratio_id','printposition_id','maker_id','item_row','lineup','opp','oz','show_site','itemdate'];
		var data1 = [item_id,item_code,item_name,ratio_id,pp_id,maker_id,item_row,lineup,opp,oz,show_site,itemdate];
		
		// 価格
		var tmpsize = {};
		var n = 0;
		var fld2 = [];
		var data2 = [];
		var isSeries = $('#pricetable thead tr th.series').length;
		if(isSeries){
			var pattern = $('#pricetable thead tr th.series').attr('abbr');
			fld2 = ['price_id', 'size_id', 'price_0', 'price_1', 'price_maker_0', 'price_maker_1', 'itempricedate', 'numbernopack', 'numberpack', 'size_lineup', 'printarea_1', 'printarea_2', 'printarea_3', 'printarea_4', 'printarea_5', 'printarea_6', 'printarea_7', 'series'];
		}else{
			fld2 = ['price_id', 'size_id', 'price_0', 'price_1', 'price_maker_0', 'price_maker_1', 'itempricedate', 'numbernopack', 'numberpack', 'size_lineup', 'printarea_1', 'printarea_2', 'printarea_3', 'printarea_4', 'printarea_5', 'printarea_6', 'printarea_7'];
		}
		$('#pricetable tbody tr').each( function(){
			var price_id = $(this).attr('class').split('_')[1];
			var size_id = $(this).children('th:first').attr('class').split('_')[1];
			var price_0 = $(this).find('.price_0').val();
			var price_1 = $(this).find('.price_1').val();
			var price_maker_0 = $(this).find('.price_maker_0').val();
			var price_maker_1 = $(this).find('.price_maker_1').val();
			var numbernopack = $(this).find('.numbernopack').val();
			var numberpack = $(this).find('.numberpack').val();
			var size_lineup = $(this).find('.size_lineup:checked').length;
			var printarea_1 = $(this).find('.printarea_1').val().trim();
			var printarea_2 = $(this).find('.printarea_2').val().trim();
			var printarea_3 = $(this).find('.printarea_3').val().trim();
			var printarea_4 = $(this).find('.printarea_4').val().trim();
			var printarea_5 = $(this).find('.printarea_5').val().trim();
			var printarea_6 = $(this).find('.printarea_6').val().trim();
			var printarea_7 = $(this).find('.printarea_7').val().trim();
			var itempricedate = $(this).find('.datepicker').val();
			if(itempricedate==''){
				itempricedate = '3000-01-01';
			}
			
			if(typeof tmpsize[size_id] != 'undefined'){
				$.msgbox('サイズが重複しています。');
				n = 0;
				return false;
			}
			tmpsize[size_id] = true;
			
			if(!price_0.match(/^[0-9]+$/) || !price_1.match(/^[0-9]+$/) || !price_maker_0.match(/^[0-9]+$/) || !price_maker_1.match(/^[0-9]+$/)){
				$.msgbox('価格に使用できる文字は、半角数値だけです。');
				n = 0;
				return false;
			}
			if(!numbernopack.match(/^[0-9]+$/) || !numberpack.match(/^[0-9]+$/)){
				$.msgbox('梱包枚数に使用できる文字は、半角数値だけです。');
				n = 0;
				return false;
			}
			if(isSeries){
				var series = '';
				var pattern = $(this).find('td.series');
				for(var i=0; i<pattern.length; i++){
					var chk = pattern.children(':checkbox');
					series += chk.attr('name').split('_')[1]+':'+chk.val()+':'+pattern.children(':checkbox:checked').length+',';
				}
				series = series.slice(0,-1);
				data2[n++] = price_id+'|'+size_id+'|'+price_0+'|'+price_1+'|'+price_maker_0+'|'+price_maker_1+'|'+itempricedate+'|'+numbernopack+'|'+numberpack+'|'+size_lineup+'|'+printarea_1+'|'+printarea_2+'|'+printarea_3+'|'+printarea_4+'|'+printarea_5+'|'+printarea_6+'|'+printarea_7+'|'+series;
			}else{
				data2[n++] = price_id+'|'+size_id+'|'+price_0+'|'+price_1+'|'+price_maker_0+'|'+price_maker_1+'|'+itempricedate+'|'+numbernopack+'|'+numberpack+'|'+size_lineup+'|'+printarea_1+'|'+printarea_2+'|'+printarea_3+'|'+printarea_4+'|'+printarea_5+'|'+printarea_6+'|'+printarea_7;
			}
		});
		if(n==0) return;
		
		// カラー
		var tmpcolor = {};
		var fld3 = ['master_id','color_code','color_id','size_series','catalogdate','color_lineup'];
		var data3 = [];
		n = 0;
		$('.colortable tbody tr', '#updatetable_wrap').each( function(){
			var master_id = $(this).attr('class').split('_')[1];
			var color_code = $(this).find('.color_code').val();
			var color_name = $(this).find('.color_name').val();
			var color_id = $(this).find('.color_name').parent().attr('abbr');
			var size_series = $(this).find('.series').val();
			var color_lineup = $(this).find('.color_lineup:checked').length;
			var catalogdate = $(this).find('.datepicker').val();
			if(catalogdate==''){
				catalogdate = '3000-01-01';
			}
			if(!color_code.match(/^[0-9A-Za-z-]+$/)){
				$.msgbox('カラーコードに使用できる文字は、半角英数とハイフン(-)だけです。');
				n = 0;
				return false;
			}
			if(color_name=="" || typeof $.itemcolor.hash[color_name]==='undefined'){
				$(this).find('.color_name').val('');
				$.msgbox('カラー名を確認して下さい。');
				n = 0;
				return false;
			}else{
				color_id = $.itemcolor.hash[color_name];
			}
			
			if(typeof tmpcolor[color_id] != 'undefined'){
				$.msgbox('カラーが重複しています。');
				n = 0;
				return false;
			}
			tmpcolor[color_id] = true;
			
			data3[n++] = master_id+'|'+color_code+'|'+color_id+'|'+size_series+'|'+catalogdate+'|'+color_lineup;
		});
		if(n==0) return;
		
		// 寸法
		var fld4 = ['itemmeasureid','item_code','size_id','measure_id','dimension'];
		var data4 = [];
		$('#measuretable tbody tr').each( function(){
			var id = $(this).attr('class').split('_')[1];
			var measure_id = $(this).children('th').children("select").val();
			if(measure_id=="") return true;
			$(this).children("td").each( function(){
				var txt = $(this).children("input");
				var size_id = txt.attr("class").split("_")[1];
				var dimension = txt.val();
				var val = id+"|"+item_code+"|"+size_id+"|"+measure_id+"|"+dimension;
				data4.push(val);
			});
		});
		
		// 商品詳細ページ情報
		var fld5 = ['itemdetailid','item_code','i_color_code','i_caption','i_description','i_material','i_silk','i_digit','i_inkjet','i_cutting','i_embroidery','i_note_label','i_note'];
		var data5 = [];
		var detail = $("#detailtable tbody");
		data5[0] = detail.attr('class').split('_')[1];
		data5[1] = item_code;
		for(var i=2; i<6; i++){
			data5[i] = detail.find("."+fld5[i]).val();
		}
		for(var i=6; i<11; i++){
			data5[i] = detail.find("."+fld5[i]+":checked").length;
		}
		for(var i=11; i<fld5.length; i++){
			data5[i] = detail.find("."+fld5[i]).val();
		}

		//タグ
		var fld6 = ['tag_itemid','tag_id'];
		var data6 = [];
		var itemtag = $("#itemtagtable tbody");
		var tagchecked = $('.itemtag:checked').map(function() {
		return $(this).val();
		});
		var item_id = $('.item_id').val();
		for(var i = 0 ;i < tagchecked.length;i++){
		tmp = item_id;
		tmp += '|' + tagchecked[i];
		data6.push(tmp);
		}
		//--------------------------------------------------------

		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'update', 'mode':'item', 'curdate':curdate, 
						'field1[]':fld1, 'data1[]':data1, 'field2[]':fld2, 'data2[]':data2, 'field3[]':fld3, 'data3[]':data3, 
						'field4[]':fld4, 'data4[]':data4, 'field5[]':fld5, 'data5[]':data5, 'field6[]':fld6, 'data6[]':data6}, 
			success: function(r){
				if(r){
					$('#updatetable_wrap, #detailtable_wrap, #measuretable_wrap').html('');
					$('.button_wraptop, .button_wrapbottom').hide();
					$.showItemDetail(item_id);
				}else{
					alert('Error: p980\n'+r);
				}
			},
			error: function(){
				alert('Error: p1234\n'+r);
			},
			complete: function() {
				$.screenOverlay(false);
			}
		});
	});

	/********************************
	*	データ削除
	*/
	$('.delete_button').live('click', function(){
		var curdate = $('#apply').val();
		//var category_id = $('.category_id').val();
		var category_id = $('#basictable caption').text().split('.')[0];

		var tbl = $('#basictable tbody tr:first');
		var item_id = tbl.attr('id').split('_')[1];
		var item_code = tbl.find('.item_code').val();
		var item_name = tbl.find('.item_name').val();
		if(!confirm("商品 [" + item_code + " "+item_name+"] をデータベースから削除します。よろしですか？")){
			return;
		}
		var fld = ['item_id'];
		var dat = item_id;
		$.ajax({url: '../php_libs/admin/master.php', type:'POST', dataType:'text', async:false,
			data:{'act':'db', 'func':'delete', 'mode':'item', 'curdate':curdate, 'field1[]':fld, 'data1[]':dat}, 
			success: function(r){
				if(r){
					$.viewlist(category_id);
				}else{
					alert('Error: ITEM DELETE ERROR');
				}
			}
		});
 	});



	/********************************
	*	initialize
	*/
	$('.datepicker').datepicker();
	$('#switchover form').buttonset();
	
	$('#basictable tbody').find('img.pp_id').click( function(){
		var curdate = $('#apply').val();
		$.post('../php_libs/dbinfo.php', {'act':'printpositionlist', 'curdate':curdate, 'master':true}, function(r){
			if(jQuery.trim(r)!=""){
				r = r.replace(/mypage/g, '$');
				r = r.replace(/src=\"/g, 'src=\".');
				$.msgbox('<div class="pp_wrap">'+r+'</div>');
			}
		});
	}).css('cursor','pointer');
	
	
	$.post('../php_libs/admin/master.php', {'act':'itemcolor', 'curdate':$('#apply').val()}, function(r){
		var tmp = r.split('|');
		for(var i=0; i<tmp.length; i++){
			if(tmp[i]=="") continue;
			var a = tmp[i].split(':');
			$.itemcolor.names[i] = a[1];	// 商品カラー名の配列
			$.itemcolor.hash[a[1]] = a[0];	// 商品カラー名をキーにしたIDのハッシュ
		}
		
		$( ".step2_wrap .colortable .color_name" ).autocomplete({
			source: 
				function(req, res){
				var list = [];
				var n = 0;
				for(var i=0; i<$.itemcolor.names.length; i++){
					if($.itemcolor.names[i].indexOf(req.term)==0){
						list[n++] = $.itemcolor.names[i];
					}
				}
				res(list);
			},
			delay: 0,
			minLength: 1,
			autoFocus: true
		}).focus( function(){
			$(this).autocomplete('search',$(this).val());
		});
		
		// サイズリスト
		$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: true,
			data:{'act':'size', 'curdate':$('#apply').val()}, 
			success: function(r){
				if(r){
					var len = r.length;
					for(var i=0; i<len; i++){
						$.size.list[i] = r[i]["size_name"];				// サイズ名の配列
						$.size.hash[r[i]["size_name"]] = r[i]["id"];	// サイズ名をキーにしたIDのハッシュ
						$.size.names[r[i]["id"]] = r[i]["size_name"];	// IDをキーにしたサイズ名のハッシュ
					}
				}
			}
		});
		
	});
});



jQuery.extend({

	codeCheck: function(item_code){
		var curdate = $('#apply').val();
		var checkRes="";
		$.ajax({
			url: '../php_libs/admin/master.php', type:'POST', dataType:'json', async:false,
			data:{'act':'codeCheck','item_code':item_code, 'curdate':curdate}, 
			success: function(r){
				checkRes=r[0];
			}
		});
		return checkRes;
	},

	viewlist: function(category_id){
		var curdate = $('#apply').val();
		if(curdate==''){
			$.msgbox('適用日を入力してください。');
			return;
		}
		$('#apply').removeAttr('disabled');
		$('#submenu span').hide();
		$('#pricetable_wrap, #colortable_wrap, #detailtable_wrap, #measuretable_wrap, #itemtagtable, #updatetable_wrap').html('');
		$('.button_wraptop, .button_wrapbottom, #printarea_wrap').hide();
		
		if(arguments.length==1){
			$('#mastertable_wrap').html('');
			$('#basictable').show();
			$('#basictable tbody').html('<tr><td colspan="10"></td></tr>');
			$.post('../php_libs/admin/master.php?req='+ (new Date().getTime()), {'act':'items','category_id':category_id,'curdate':curdate}, function(r){
				var data = r.split('|');
				$('#basictable tbody').html(data[0]);
				$('#basictable caption').html(category_id+'.'+data[3]+'　<span>'+data[2]+'</span><span>（'+data[1]+' アイテム）</span>');
			});
		}else{
			$('#basictable').hide();
			$.ajax({
				url:'../php_libs/admin/master.php?req='+ (new Date().getTime()), async:true, data:'post', dataType:'json', data:{'act':'list','list_id':category_id,'curdate':curdate}, 
				success: function(rec){
					if(!rec){
						$.msgbox("error:1078<br>データ見つかりませんでした");
						$('#mastertable_wrap').html('');
						return;
					}
					var cols = rec[0].length;
					if(cols==0){
						$.msgbox('該当するデータがありません');
						$('#mastertable_wrap').html('')
						$('#itemtagtable').html('');						
						return;
					}
/*------------------------------------------------------------------------
		商品カラー名,'プリント割増率,'プリント位置の絵型, メーカー名,スタッフ
							　　　　　　　　　　　　　　　　　　　　　　　　メニュー

--------------------------------------------------------------------------
*/
					var i = 0;
					var caption = ['', '商品カラー名', 'プリント割増率', 'プリント位置の絵型', 'メーカー名', 'スタッフ'];
					var tbody = '<tbody>';
					if(category_id==3){
					// 絵型
						for(i=0; i<rec.length; i++){
							tbody += '<tr>';
							tbody += '<td>'+rec[i][0]+'</td>';
							tbody += '<td>'+rec[i][1]+'</td>';
							tbody += '<td class="ac"><img alt="" src="'+rec[i][2]+'" /></td>';
							tbody += '</tr>';
						}
					}else if(category_id==4){
					//メーカー名
						for(i=0; i<rec.length; i++){
							tbody += '<tr id="id_'+rec[i][0]+'" class="maker_id">';
							tbody += '<td>'+rec[i][0]+'</td>';
							tbody += '<td><input type="text" value="'+rec[i][1]+'" class="maker_name" /></td>';
							//tbody += '<td><input type="button" value="削除" class="delete_maker" name="'+rec[i][0]+'"/></td>';
							tbody += '<td><input type="button" value="削除" class="delete_maker" no="'+rec[i][0]+'" name="'+rec[i][1]+'"/></td>';

							tbody += '</tr>';
						}
					}else if(category_id==5){
					// Staff
						for(i=0; i<rec.length; i++){
							tbody += '<tr id="id_'+rec[i][0]+'">';
							tbody += '<td>'+rec[i][1]+'</td>';
							for(var t=3; t<rec[i].length-1; t++){
								tbody += '<td class="ac"><input type="number" value="'+rec[i][t]+'" min="0" max="100" step="1" /></td>';
							}
							tbody += '<td class="ac"><input type="text" value="'+rec[i][t]+'" class="datepicker forDate" /></td>';
							tbody += '</tr>';
						}
					}else{
						for(i=0; i<rec.length; i++){
							tbody += '<tr>';
							for(var t=0; t<rec[i].length; t++){
								tbody += '<td>'+rec[i][t]+'</td>';
							}
							tbody += '</tr>';
						}
					}
					tbody += '</tbody>';
					
					var thead = '';
					if(category_id == 4){
						thead = '<thead>';
						thead += '<tr><td colspan="8" class="ar"><input type="button" value="更新する" class="update_maker" /></td></tr>';
						thead += '<tr><th>ID</th><th>メーカ名</th></tr>';
						thead += '</thead>';
						thead += '<tfoot><tr><td colspan="8" class="ar"><input type="button" value="更新する" class="update_maker" /></td></tr></tfoot>';

					}else if(category_id == 5){
						thead = '<thead>';
						thead += '<tr><td colspan="8" class="ar"><input type="button" value="更新する" class="update_staff" /></td></tr>';
						thead += '<tr><th>名前</th><th>受注</th><th>版下</th><th>製版</th><th>転写紙</th><th>入荷</th><th>プリント</th><th>登録取消日</th></tr>';
						thead += '</thead>';
						thead += '<tfoot><tr><td colspan="8" class="ar"><input type="button" value="更新する" class="update_staff" /></td></tr></tfoot>';

					}else {
						thead = '<thead><tr><th>ID</th>';
						for(var c=1; c<cols; c++){
							thead += '<th>項目'+c+'</th>';
						}
						thead += '</tr></thead>';
					}
					
					var tbl = '<table id="mastertable">';
					tbl += '<caption>'+caption[category_id]+'</caption>';
					tbl += thead;
					tbl += tbody;
					tbl += '</table>';
					
					var tbl2 = '';
					if(category_id==1){
					// アイテムカラー
						tbl2 = '<table id="itemcolortable">';
						tbl2 += '<caption>カラー名の登録</caption>';
						tbl2 += '<tfoot><tr><td colspan="2" class="ar"><input type="button" value="新規追加" class="addnew_itemcolor" /></td></tr></tfoot>';
						tbl2 += '<tbody><tr><td>カラー名</td><td><input type="text" value="" class="itemcolor_name" /></td></tr></tbody>';
						tbl2 += '</table>';
					
					}else if(category_id==4){
					// メーカー
						tbl2 = '<table id="makertable">';
						tbl2 += '<caption>メーカー登録</caption>';
						tbl2 += '<tfoot><tr><td colspan="2" class="ar"><input type="button" value="新規追加" class="addnew_maker" /></td></tr></tfoot>';
						tbl2 += '<tbody><tr><td>メーカー名</td><td><input type="text" value="" class="maker_name" /></td></tr></tbody>';
						tbl2 += '</table>';

					}else if(category_id==5){
					// Staff
						tbl2 = '<table id="stafftable">';
						tbl2 += '<caption>スタッフの登録</caption>';
						tbl2 += '<thead><tr><th>名前</th><th>受注</th><th>版下</th><th>製版</th><th>転写紙</th><th>入荷</th><th>プリント</th></tr></thead>';
						tbl2 += '<tfoot><tr><td colspan="7" class="ar"><input type="button" value="新規追加" class="addnew_staff" /></td></tr></tfoot>';
						tbl2 += '<tbody><tr><td class="ac"><input type="text" value="" class="staff_name" /></td>';
						for(i=1; i<=6; i++){
							tbl2 += '<td class="ac"><input type="checkbox" value="1" class="rowid'+i+'" /></td>';
						}
						tbl2 += '</tr></tbody></table>';
					}
					tbl += tbl2;
					$('#mastertable_wrap').html(tbl);
					$('#itemtagtable_wrap').html('');
					
					if(category_id==5){
					// Staff
						$('#mastertable .datepicker').datepicker();
						$('.forDate').blur( function(e){
							$.check_date(e, this);
						});
					}
				}
			});
		}
	},



/*-------------------------------------------------------------------------------------
								タグメニュー
---------------------------------------------------------------------------------------
*/
	viewlistTag: function(category_id){
	var curdate = $('#apply').val();

	$('#apply').removeAttr('disabled');
	$('#submenu span').hide();
	$('#pricetable_wrap, #colortable_wrap, #detailtable_wrap, #itemtagtable_warp, #measuretable_wrap, #itemtagtable, #updatetable_wrap').html('');
	$('.button_wraptop, .button_wrapbottom').hide();
	
	if(arguments.length!==1){
		$('#basictable').hide();
		$.ajax({
			url:'../php_libs/admin/master.php?req='+ (new Date().getTime()), async:false, data:'post', dataType:'json', data:{'act':'listTag','list_id':category_id,'curdate':curdate}, 
			success: function(rec){
				var cols = rec[0].length;

				if(cols==0){
					$.msgbox('該当するデータがありません');
					$('#mastertable_wrap').html('');
					return;
				}
				
				var i = 0;
//					var caption = ['', '未使用タグ','カテゴリ','シーン', 'シルエット', '素材', '生地', 'サイズ', 'ブランド'];
				var caption = ['', 'カテゴリ','シーン', 'シルエット', '素材', '生地', 'サイズ', 'ブランド'];
				var tbody = '<tbody>';

				if(category_id!=0){
//-----------------------------------------------------------------------------------------------
//									タグテーブル
//-----------------------------------------------------------------------------------------------
					for(i=0; i<rec.length; i++){
						tbody += '<tr id="id_'+rec[i][0]+'" class="'+category_id+'">';
						tbody += '<td>'+rec[i][0]+'</td>';
						tbody += '<td class="ac"><input type="text" value="'+rec[i][3]+'" class="tag_order" /></td>';
						tbody += '<td class="ac"><input type="text" value="'+rec[i][1]+'" class="tag_name"/></td>';
						tbody += '<td><input type="button" value="削除" class="delete_tag" no="'+rec[i][0]+'" name="'+rec[i][1]+'"/></td>';
						tbody += '</tr>';
					}
				}
				tbody += '</tbody>';
				var thead = '';

				if(category_id!=0){

//						if(category_id==1){ //種類指定なし
//						orderMin=0;
//						orderMax=39;
//					}else 
					if(category_id==1){//カテゴリ
						orderMin=40;
						orderMax=79;
					}else if(category_id==2){//シーン
						orderMin=80;
						orderMax=109;
					}else if(category_id==3){//シルエット
						orderMin=110;
						orderMax=169;
					}else if(category_id==4){//素材
						orderMin=170;
						orderMax=199;
					}else if(category_id==5){//生地
						orderMin=200;
						orderMax=229;
					}else if(category_id==6){//サイズ
						orderMin=230;
						orderMax=250;
					}else if(category_id==7){//ブランド
						orderMin=251;
						orderMax=300;
					}
					thead = '<thead>';
				thead += '<tr><td colspan="8" class="ar"><input type="button" value="更新する" class="update_tag" name="'+category_id+'" /></td></tr>';
					thead += '<tr>';
					thead += '<th>ID</th>';
					thead += '<th>表示順（'+orderMin+'-'+orderMax+'）</th>';
					thead += '<th>タグ名</th>';
					thead += '</tr></thead>';
					thead += '<tfoot><tr><td colspan="8" class="ar"><input type="button" value="更新する" class="update_tag" name="'+category_id+'"/>';
					thead += '<input type="hidden" class="orderMin" value="'+orderMin+'"><input type="hidden" class="orderMax" value="'+orderMax+'"><br></td></tr></tfoot>';
				}
				
				var tbl = '<table id="tagmastertable">';
				tbl += '<caption>'+caption[category_id]+'</caption>';
				tbl += thead;
				tbl += tbody;
				tbl += '</table>';

				var tbl2 = '';
				tbl2 = '<table id="tagtable">';
				tbl2 += '<caption>タグ名の登録</caption>';
				tbl2 += '<tfoot><tr><td colspan="2" class="ar"><input type="button" value="新規追加" class="addnew_tag" name="'+category_id+'" /></td></tr></tfoot>';
				tbl2 += '<tbody><tr><td>タグ種類：'+caption[category_id]+'</td></tr></tbody>';
				tbl2 += '<tbody><tr><td>表示順：<input type="text" value="" class="tag_order" /><br>';
				tbl2 += '&nbsp;&nbsp;&nbsp;*表示順を'+orderMin+'から'+orderMax+'までの間に設定してください';
				tbl2 += '<input type="hidden" class="orderMin" value="'+orderMin+'"><input type="hidden" class="orderMax" value="'+orderMax+'"><br>';
				tbl2 += 'タグ名：<input type="text" value="" class="tag_name" /></td></tr></tbody>';
				tbl2 += '</table>';
				tbl += tbl2;
				
				$('#mastertable_wrap').html(tbl);
			}
		});
	}
},
//--------------------------------------------------------------------------------------------------------

	/**
	 * アイテム詳細画面を表示
	 */
	showItemDetail: function(item_id){
		var curdate = $('#apply').val();
		if(curdate==''){
			$.msgbox('適用日を入力してください。');
			return;
		}
		$('#apply').removeAttr('disabled');
		$('#showlist').text('一覧表示へ').show();
		$('#editmode, #printarea_wrap').show();
		var category_id = $('#basictable caption').text().split('.')[0];
		$.post('../php_libs/admin/master.php', {'act':'items','category_id':category_id,'item_id':item_id,'curdate':curdate}, function(r){
			var data = r.split('|');
			if(data[1]==0){
				$.viewlist(category_id);
				return;
			}
			$('#basictable tbody').html(data[0]);
			$('#basictable caption').html(category_id+'.'+data[3]+'　<span>'+data[2]+'</span>　基本情報');
			
			// プリント可能範囲の画像
			$('#printarea_wrap').html(data[4]);
			
			$.post('../php_libs/admin/master.php', {'act':'cost','item_id':item_id,'curdate':curdate}, function(r){
				var tbl = '<table id="pricetable"><caption>サイズと価格</caption>'+r+'</table>';
				$('#pricetable_wrap').html(tbl);


				$.post('../php_libs/admin/master.php', {'act':'color','item_id':item_id,'curdate':curdate}, function(r){
					var line = [];
					var line_limit = [];
					var images = '';
					var images_limit = '';
					var arg = '';		// [0:master_id, 1:item_code, 2:color_id, 3:color_name, 4:droppingdate]
					var i=0, j=0, t=0, n=-1, p=-1;
					var data = r.split('|');
					if(data[0]==""){
						$.msgbox('アイテムカラーを取得できませんでした');
						return;
					}
					var colors = data[0].split(',');
					var color_count = colors.length-1;
					var category_key = $('#basictable caption span:first').text();
					var item_code = colors[1].split(':')[1].split('_')[0];
					var path = $._DB.imgPath+'items/list/'+category_key+'/'+item_code+'/';
					var lineup = '';
					var no_display= 0;
					for(i=1; i<color_count+1; i++){
						if((i)%8==1) line[++n] = '';
						arg = colors[i].split(':');
						lineup = arg[5]==1? '表示': '-';
						if(lineup==0) no_display++;
						line[n] += '<td><img alt="'+arg[3]+'" src="'+path+arg[1]+'.jpg" width="85" /><p class="color_name">'+arg[3]+'</p><p class="display_status">'+lineup+'</p></td>';
					}

					var tbl2 = '';
					var limitcolor_count = 0;
					var limit_no_display = 0;
					if(data.length>1){
						colors = data[1].split(',');
						limitcolor_count += colors.length-1;
						for(j=1; j<colors.length; i++,j++){
							arg = colors[j].split(':');
							if(arg.length<4) continue;
							if((i)%8==1) line[++n] = '';
							if((j)%8==1) line_limit[++p] = '';
							lineup = arg[5]==1? '表示': '-';
							if(lineup==0) limit_no_display++;
							line[n] += '<td><img alt="'+arg[3]+'" src="'+path+arg[1]+'.jpg" width="85" /><p class="color_name">'+arg[3]+'</p><p class="display_status">'+lineup+'</p></td>';
							line_limit[p] += '<td><img alt="'+arg[3]+'" src="'+path+arg[1]+'.jpg" width="85" /><p class="color_name">'+arg[3]+'</p><p class="display_status">'+lineup+'</p></td>';
						}
						if(typeof data[2] != "undefined"){
							color_count += limitcolor_count;
							for(t=0; t<line_limit.length; t++){
								images_limit += '<tr>'+line_limit[t]+'</tr>';
							}
							tbl2 += '<table class="colortable"><caption>カラー　'+data[2]+'は　'+(colors.length-1)+'色';
							if(limit_no_display>0) tbl2 += '（Web非表示 '+limit_no_display+'色）';
							tbl2 += '</caption><tbody>'+images_limit+'</tbody></table>';
						}
					}
					
					for(t=0; t<line.length; t++){
						images += '<tr>'+line[t]+'</tr>';
					}
					var nodisplay = limit_no_display+no_display;
					var tbl = '<table class="colortable"><caption>カラー全 '+color_count+'色';
					if(nodisplay>0) tbl += '（Web非表示 '+nodisplay+'色）';
					tbl += '</caption><tbody>'+images+'</tbody></table>' + tbl2;
					
					$('#colortable_wrap').html(tbl);
				});
			});
		});
		
		// アイテム詳細ページ情報
		$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: false,
			data:{'act':'detail','item_id':item_id,'curdate':curdate,'br':1}, 
			success: function(r){
				if(!r){
					$.msgbox('アイテム詳細データを取得できませんでした');
					return;
				}else{
					var tbl = '<table id="detailtable"><caption>アイテム詳細</caption>';
					tbl += '<tbody>';
					tbl += '<tr><th>見出し</th><td>'+r["i_caption"]+'</td></tr>';
					tbl += '<tr><th>Web表示カラーコード</th><td>'+r["i_color_code"]+'</td></tr>';
					tbl += '<tr><th>アイテム説明文</th><td>'+r["i_description"]+'</td></tr>';
					tbl += '<tr><th>素材</th><td>'+r["i_material"]+'</td></tr>';
					var printing = [];
					if(r["i_silk"]==1) printing.push("シルク");
					if(r["i_digit"]==1) printing.push("デジタル転写");
					if(r["i_inkjet"]==1) printing.push("インクジェット");
					if(r["i_cutting"]==1) printing.push("カッティング");
					if(r["i_embroidery"]==1) printing.push("刺繍");
					tbl += '<tr><th>プリント方法</th><td>'+printing.join(", ")+'</td></tr>';
					tbl += '<tr><th>脚注タイトル</th><td>'+r["i_note_label"]+'</td></tr>';
					tbl += '<tr><th>脚注</th><td>'+r["i_note"]+'</td></tr>';
					tbl += '</tbody></table>';
					$('#detailtable_wrap').html(tbl);
				}
			}
		});
		// タグページ情報
		$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: false,
			data:{'act':'showtag','item_id':item_id,'curdate':curdate,'br':1}, 
			success: function(list){
				var tbl = '<table id="itemtagtable"><caption>タグ</caption>';
				var tbody = '<tbody>';
				if(category_id!=0){
					for(i=0; i<list.length; i++){
						if(list[i][0]==1 || list[i][0]==2) continue;
						tbody += '<tr>';
						tbody += '<td>'+list[i][1]+'</td>';
						tbody += '<td>'+list[i][2]+'</td>';
						tbody += '<td>'+list[i][3]+'</td>';
						tbody += '</tr>';
					}
				}
				tbody += '</tbody>';
				var thead = '';
				if(category_id!=0){
					thead = '<thead><tr><th>タグ種類</th>';
					thead += '<th>タグ名</th>';
					thead += '<th>表示順</th>';
					thead += '</tr></thead>';
				}
				tbl += thead;
				tbl += tbody;
				tbl += '</table>';
				$('#itemtagtable_wrap').html(tbl);
			}
		});

		
		// 寸法
		var sizeList = [];
		$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: false,
			data:{'act':'size', 'item_id':item_id, 'curdate':curdate}, 
			success: function(r){
				if(!r){
					$.msgbox('サイズデータを取得できませんでした');
					return;
				}else{
					var s = r[0];
					var len = s.length;
					for(var i=0; i<len; i++){
						sizeList[i] = {"id":s[i], "name":$.size.names[s[i]]};
					}
				}
			}
		});

		$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: false,
			data:{'act':'measure','item_id':item_id,'curdate':curdate}, 
			success: function(r){
				if(!r){
					$.msgbox('寸法データを取得できませんでした');
					return;
				}else{
					var measure_id = 0;
					var tbl = '<table id="measuretable"><caption>寸法</caption>';
					var td = "";
					var head = '<thead><tr>';
					head += '<th>サイズ</th>';
					var len = sizeList.length;
					for(var i=0; i<len; i++){
						head += '<th>'+sizeList[i]["name"]+'</th>';
						td += '<td class="sizeid_'+sizeList[i]["id"]+'"></td>';
					}
					head += '</tr></thead>';
					var body = '<tbody>';
					var $tmp = "";
					len = r.length;
					for(var i=0; i<len; i++){
						if(measure_id!=r[i]["measure_id"]){
							if(measure_id!=0) body += '<tr class="measure_'+measure_id+'">'+$tmp.html()+'</tr>';
							$tmp = $('<tr><th>'+r[i]["measure_name"]+'</th>'+td+'</tr>');
							measure_id = r[i]["measure_id"];
						}
						$tmp.find('.sizeid_'+r[i]["size_id"]).text(r[i]["dimension"]);
					}
					if(len>0){
						body += '<tr class="measure_'+measure_id+'">'+$tmp.html()+'</tr>';
					}
					tbl += head+body+'</tbody></table>';
					$('#measuretable_wrap').html(tbl);
				}
			}
		});
	},


	/**
	 * アイテム編集画面を表示
	 */
	updatemode: function(){
		var curdate = $('#apply').val();
		if(curdate==''){
			$.msgbox('適用日を入力してください。');
			return;
		}
		$('#apply').attr('disabled','disabled');
		
		$('#showlist').text('詳細へ');
		$('#editmode').hide();
		$('#pricetable_wrap, #colortable_wrap, #detailtable_wrap, #itemtagtable_warp, #measuretable_wrap').html('');
		
		// 基本情報
		var item_id = $('#basictable tbody tr:first').attr('id').split('_')[1];
		$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'text', async: false,
			data:{'act':'updatebasic', 'item_id':item_id, 'curdate':curdate}, 
			success: function(r){
				if(!r){
					$.msgbox('アイテム基本情報を取得できませんでした');
					return;
				}else{
					var data = r.split('|');
					var tbody = $('#basictable tbody');
					tbody.html(data[0]);

					// プリント可能範囲の画像
					$('#printarea_wrap').html(data[4]);

					tbody.find('img.pp_id').click( function(){
						$.post('../php_libs/dbinfo.php', {'act':'printpositionlist', 'curdate':curdate, 'master':true}, function(r){
							if(jQuery.trim(r)!=""){
								r = r.replace(/mypage/g, '$');
								r = r.replace(/src=\"/g, 'src=\".');
								$.msgbox('<div class="pp_wrap">'+r+'</div>');

								/*
								$('#printposition_list').html(r);
								var offsetY = $(document).scrollTop();
								$('#printposition_wrapper').css({'top':offsetY+'px', 'left':'300px'}).fadeIn();
								*/
							}
						});
					}).css('cursor','pointer');
					$('#basictable').find('.datepicker').datepicker();
				}
			}
		});
		
		
		// 価格
		$.post('../php_libs/admin/master.php', {'act':'cost','item_id':item_id,'curdate':curdate,'update':true}, function(r){
			var tmp = r.split('|');
			var tbl = '<table id="pricetable"><caption>サイズと価格</caption>'+tmp[0]+'</table>';
			tbl += '<p class="toright"><input type="button" value="＋追加" id="addrow_price" /></p>';
			tbl += '<table id="sizetable"><caption>サイズ　パターン</caption><tbody>'+tmp[1]+'</tbody></table>';
			$('#updatetable_wrap').html(tbl);
			
			
			// カラー
			$.post('../php_libs/admin/master.php', {'act':'series','item_id':item_id,'curdate':curdate}, function(r){
				var tbl = '';
				var arg = '';	// [0:master_id, 1:item_code, 2:color_id, 3:color_name, 4:droppingdate]
				var i=0, n=0;
				var min = 0;
				var max = 0;
				var step = 1;
				var data = r.split('|');
				var colors = data[1].split(',');
				var len = data.length-1;
				var series_count = data[0].split(',').length;
				var category_key = $('#basictable caption span:first').text();
				var item_code = colors[1].split(':')[1].split('_')[0];
				var path = $._DB.imgPath+'items/'+category_key+'/'+item_code+'/';
				
				for(i=len; i>=1; i--){
					colors = data[i].split(',');
					var series = colors[0];
					tbl += '<table class="colortable">';
					tbl += '<caption>パターン '+series+' のサイズに対応するカラー</caption>';
					tbl += '<thead><tr><th>thumb</th><th>カラーコード</th><th>カラー名</th><th>対応サイズ</th><th>Web表示</th><th>取扱中止日</th></tr></thead>';
					tbl += '<tfoot><tr><td colspan="6" class="toright"><input type="button" value="＋追加" class="addrow_color" /></td></tr></tfoot>';
					tbl += '<tbody>';
					
					for(n=1; n<colors.length; n++){
						arg = colors[n].split(':');
						tbl += '<tr class="master_'+arg[0]+'">';
						tbl += '<td><img alt="'+arg[3]+'" src="'+path+arg[1]+'_s.jpg" width="25" /></td>';
						tbl += '<td><input type="text" value="'+arg[1].split('_')[1]+'" class="color_code" /></td>';
						tbl += '<td abbr="'+arg[2]+'"><input type="text" value="'+arg[3]+'" class="color_name" /></td>';
						if(series_count==1){
							tbl += '<td class="ac"><input type="text" value="'+series+'" readonly="readonly" class="series" /></td>';
						}else{
							min = data[0].split(',')[0];
							max = data[0].split(',')[1];
							step = max-min;
							tbl += '<td class="ac"><input type="number" min="'+min+'" max="'+max+'" step="'+step+'" value="'+series+'" class="series" /></td>';
						}
						tbl += '<td class="ac"><input type="checkbox" class="color_lineup" value="1" ';
						if(arg[5]==1){
							tbl += 'checked="checked"';
						}
						tbl += '></td>';
						tbl += '<td><input type="text" value="'+arg[4]+'" class="datepicker forDate" /></td>';
						tbl += '</tr>';
					}
					tbl += '</tbody></table>';
				}
				tbl += '<div class="button_wrapbottom">';
				tbl += '<div class="cancel_button_wrap"><input type="button" value="キャンセル" class="cancel_button" /></div>';
				tbl += '<div class="update_button_wrap"><input type="button" value="データベースを更新する" class="update_button" /></div>';
				tbl += '<div class="cancel_button_wrap"><input type="button" value="該当商品を削除する" class="delete_button" /></div>';
				tbl += '</div>';
				
				$('#updatetable_wrap').append(tbl);
				$('.button_wraptop, .button_wrapbottom').show();
				$('#updatetable_wrap .datepicker').datepicker();
				$('.forDate').blur( function(e){
					$.check_date(e, this);
				});
				$('.forBlank').blur( function(){
					$.check_NaN(this,"");
				});
				$('.forNum').blur( function(){
					$.check_NaN(this);
				});
				$( "#updatetable_wrap .color_name" ).autocomplete({
					source: 
						function(req, res){
						var list = [];
						var n = 0;
						for(var i=0; i<$.itemcolor.names.length; i++){
							if($.itemcolor.names[i].indexOf(req.term)==0){
								list[n++] = $.itemcolor.names[i];
							}
						}
						res(list);
					},
					delay: 0,
					minLength: 1,
					autoFocus: true
				}).focus( function(){
					$(this).autocomplete('search',$(this).val());
				});
			});
		});
		
		// アイテム詳細ページ情報
		$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: true,
			data:{'act':'detail','item_id':item_id,'curdate':curdate,'br':0}, 
			success: function(r){
				if(r=="" || r==null) r = [0];
				var tbl = '<table id="detailtable"><caption>アイテム詳細</caption>';
				tbl += '<tbody class="itemdetailid_'+r[0]+'">';
				tbl += '<tr><th>見出し</th><td><input type="text" value="'+r["i_caption"]+'" class="i_caption"></td></tr>';
				tbl += '<tr><th>Web表示カラーコード</th><td><input type="text" value="'+r["i_color_code"]+'" class="i_color_code"></td></tr>';
				tbl += '<tr><th>アイテム説明文</th><td><textarea cols="100" rows="6" class="i_description">'+r["i_description"]+'</textarea></td></tr>';
				tbl += '<tr><th>素材</th><td><textarea cols="100" rows="6" class="i_material">'+r["i_material"]+'</textarea></td></tr>';
				tbl += '<tr><th>プリント方法</th><td>';
				var isSilk = r["i_silk"]==1? 'checked="checked"': "";
				tbl += '<p><label><input type="checkbox" value="1" class="i_silk" '+isSilk+'> シルク</label></p>';
				var isDigit = r["i_digit"]==1? 'checked="checked"': "";
				tbl += '<p><label><input type="checkbox" value="1" class="i_digit" '+isDigit+'> デジタル転写</label></p>';
				var isInkjet = r["i_inkjet"]==1? 'checked="checked"': "";
				tbl += '<p><label><input type="checkbox" value="1" class="i_inkjet" '+isInkjet+'> インクジェット</label></p>';
				var isCutting = r["i_cutting"]==1? 'checked="checked"': "";
				tbl += '<p><label><input type="checkbox" value="1" class="i_cutting" '+isCutting+'> カッティング</label></p>';
				var isEmb = r["i_embroidery"]==1? 'checked="checked"': "";
				tbl += '<p><label><input type="checkbox" value="1" class="i_embroidery" '+isEmb+'> 刺繍</label></p>';
				tbl += '</td></tr>';
				tbl += '<tr><th>脚注タイトル</th><td><input type="text" value="'+r["i_note_label"]+'" class="i_note_label"></td></tr>';
				tbl += '<tr><th>脚注</th><td><textarea cols="100" rows="6" class="i_note">'+r["i_note"]+'</textarea></td></tr>';
				tbl += '</tbody></table>';
				$('#detailtable_wrap').html(tbl);
			}
		});
/*-----------------------------------------------*/
//タグ
	$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: true,
		data:{'act':'itemtag','item_id':item_id,'curdate':curdate,'br':0}, 
			success: function(list){
				var list1 = list;	
				$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: true,
					data:{'act':'tags','item_id':item_id,'curdate':curdate,'br':0}, 
						success: function(list){
						var typename = ['未使用タグ','カテゴリ','シーン','シルエット','素材','生地','サイズ','ブランド'];
						var tbl = '<table id="itemtagtable"><caption>タグ</caption>';
						var tbody = '<tbody>';
						for(var j=3; j<typename.length; j++){
							tbody += '<tr>';
							tbody += '<td>'+typename[j]+'</td>';
							tbody += '<td>';
							var index4j = 0;
							for(var i=0; i<list.length; i++){
					 	 		if(list[i][0]==j){
					 			index4j++;
									tbody += '<input type="checkbox"';
								 for(var t=0; t<list1.length; t++){
									if(list1[t][0]==list[i][1] ){
												tbody += 'checked = "checked"';
									}
								 }
							tbody +='value="'+list[i][1]+'" class="itemtag"/>'+list[i][2]+'&nbsp';
									if(index4j % 5==0){
										tbody +='<br>';
									}
							}
						}
							tbody += '<input type="hidden" class="item_id" value="'+item_id+'"></td>';
							tbody += '</tr>';
						}
						tbody += '</tbody>';
						var thead = '';	
						thead += '<thead><tr><th style="width: 85px;">タグ種類</th>';
						thead += '<th>タグ名</th>';
						thead += '</tr></thead>';
						tbl += thead;
						tbl += tbody;
						tbl += '</table>';
						$('#itemtagtable_wrap').html(tbl);
				}
		});
		 }
	});

		// 寸法
		var sizeList = [];
		$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: false,
			data:{'act':'size', 'item_id':item_id, 'curdate':curdate}, 
			success: function(r){
				if(!r){
					$.msgbox('サイズデータを取得できませんでした');
					return;
				}else{
					var s = r[0];
					var len = s.length;
					for(var i=0; i<len; i++){
						sizeList[i] = {"id":s[i], "name":$.size.names[s[i]]};
					}
				}
			}
		});
		
		var measure_selector = "";
		$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: false, data:{'act':'measurelist','curdate':curdate}, 
			success: function(r){
				if(!r){
					$.msgbox('寸法マスターデータを取得できませんでした');
					return;
				}else{
					var len = r.length;
					measure_selector += '<select><option value=""></option>';
					for(var i =0; i<len; i++){
						measure_selector += '<option value="'+r[i]["measureid"]+'">'+r[i]["measure_name"]+'</option>';
					}
					measure_selector += '</select>';
				}
			}
		});
		
		$.ajax({url: '../php_libs/admin/master.php', type: 'POST', dataType: 'json', async: false,
			data:{'act':'measure','item_id':item_id,'curdate':curdate}, 
			success: function(r){
				if(!r){
					$.msgbox('寸法データを取得できませんでした');
					return;
				}else{
					var measure_id = 0;
					var tbl = '<table id="measuretable"><caption>寸法</caption>';
					var td = "";
					var head = '<thead><tr>';
					head += '<th>サイズ</th>';
					var len = sizeList.length;
					for(var i=0; i<len; i++){
						head += '<th>'+sizeList[i]["name"]+'</th>';
						td += '<td><input type="text" class="sizeid_'+sizeList[i]["id"]+'" value=""></td>';
					}
					var cols = len+1;
					var foot = '<tfoot><tr><td colspan='+cols+' class="toright"><input type="button" value="＋追加" class="addrow_measure"></td></tr></tfoot>';
					head += '</tr></thead>';
					var body = '<tbody>';
					var tmp = "";
					var re = "";
					len = r.length;
					for(var i=0; i<len; i++){
						if(measure_id!=r[i]["measure_id"]){
							if(measure_id!=0) body += tmp;
							measure_id = r[i]["measure_id"];
							re = new RegExp('value="'+r[i]["measure_id"]+'"', 'i');
							var selector = measure_selector.replace(re, 'value="'+r[i]["measure_id"]+'" selected="selected"');
							tmp = '<tr class="measure_'+measure_id+'"><th>'+selector+'</th>'+td+'</tr>';
						}
						re = new RegExp('class="sizeid_'+r[i]["size_id"]+'" value=""', 'i');
						tmp = tmp.replace(re, 'class="sizeid_'+r[i]["size_id"]+'" value="'+r[i]["dimension"]+'"');
					}
					if(len>0){
						body += tmp;
					}else {
						body += '<tr class="measure_'+measure_id+'"><th>'+measure_selector+'</th>'+td+'</tr>';
					}
					tbl += head+foot+body+'</tbody></table>';
					$('#measuretable_wrap').html(tbl);
				}
			}
		});
	},
	setNewsizeID: function(my){
	// 編集画面で新規サイズの指定
		$(my).parent().attr('class', 'size_'+$(my).val());
	},
	removeColor: function(my){
		$(my).closest('tr').remove();
	},
	addFigure: function(args){
	/*
	*	金額の桁区切り
	*	@arg	対象の値
	*/
		var str = new String(args);
		str = str.replace(/[０-９]/g, function(m){
					var a = "０１２３４５６７８９";
					var r = a.indexOf(m);
					return r==-1? m: r;
				});
		str -= 0;
		var num = new String(str);
		if( num.match(/^[-]?\d+(\.\d+)?/) ){
			//while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
			var num0 = num.replace(/^(-?\d+)(\d{3})/, "$1,$2");
			while(num != num0){
				num = num0;
				num0 = num0.replace(/^(-?\d+)(\d{3})/, "$1,$2");
			}
		}else{
			num = "0";
		}
		return num;
	},
	check_NaN: function(my){
	/*
	*	自然数でなければ0にする
	*第二引数があれば、自然数以外のときの返り値として使用
	*	@my		Object
	*
	*/
		var err = arguments.length>1? arguments[1]: 0;
		var str = my.value.trim().replace(/[０-９]/g, function(m){
					var a = "０１２３４５６７８９";
					var r = a.indexOf(m);
					return r==-1? m: r;
				});
		my.value = (str.match(/^\d+$/))? str-0: err;
		return my.value;
	},
	check_date: function(e, my){
	/*
	*	日付の妥当性を確認
	*	@e		エベント
	*	@my		オブジェクト
	*/
		var val = my.value;
	var date = new Date();
		var res = new Array();
		var yy, mm, dd;
		if(val.match(/^(\d{4})-([01]?\d{1})-([0123]?\d{1})$/)){
			res = val.split('-');
			yy = res[0]-0;
			mm = res[1]-0;
			dd = res[2]-0;
		}else if(val.match(/^([01]?\d{1})-([0123]?\d{1})$/)){
			res = val.split('-');
			yy = date.getFullYear();
			mm = res[0]-0;
			dd = res[1]-0;
		}
		date = new Date(yy, mm-1, dd);
		if(yy==date.getFullYear() && mm-1==date.getMonth() && dd==date.getDate()){
			mm = (""+mm).length==1? "0"+mm: mm;
			dd = (""+dd).length==1? "0"+dd: dd;
			my.value = yy+'-'+mm+'-'+dd;
		}else{
			my.value = "";
		}
		var evt = e? e: event;
		evt.preventDefault();
	},
	restrict_num: function(n, my) {
	/*
	*	テキストフィールドの入力文字数を制限する、当該オブジェクトを選択状態にする
	*	@n		入力可能な文字数
	*	@my		オブジェクト
	*/
		var c = my.value;
		c = c.replace(/[^\d]/g, '');
		my.maxLength = n;
		my.value = c;
		var self = my;
		$(self).select();
	},
	scrollto: function(target){
	/*
	*	指定位置にスクロール
	*	@target		jQuery オブジェクト
	*	第二引数	コールバック関数
	*/
		var fnc = null;
		if(arguments.length>1 && typeof arguments[1]=="function") fnc = arguments[1];	// 第二引数があれば、コールバック関数として使用
		var targetOffset = target.offset().top;
		$($.browser.opera ? document.compatMode == 'BackCompat' ? 'body' : 'html' :'html,body')
		.animate({scrollTop: targetOffset}, 500, 'easeQuart', fnc);
	},
	getDelimiter: function(r){
	/*
	*	データベースからの抽出結果の文字列をデータに区切るコードを取得
	*	@r		抽出結果の文字列
	*/
		var b = r.lastIndexOf('|')+1;
		var cnt = r.slice(b);
		var boundary = -3*cnt-cnt.length;
		var delimiter = r.slice(boundary, -1*cnt.length);				// 区切り文字列を取得
		$.delimiter.fld = delimiter.slice(0,cnt);		// フィールドの区切り
		$.delimiter.dat = delimiter.slice(cnt,cnt*2);	// キーと値の区切り
		$.delimiter.rec = delimiter.slice(-1*cnt);		// レコードの区切り
		return r.slice(0, boundary);
	},
	delimiter: {
	/*
	*	getDelimiter で抽出した区切り文字列を保持する
	*	rec:	レコードの区切り
	*	fld:	フィールドの区切り
	*	dat:	データの区切り
	*/
		'rec':"",
		'fld':"",
		'dat':""
	},
	setPrintPosition:function(my, id){
		var src = $(my).children('img:first').attr('src');
		var td = $('#basictable tbody tr:first td:eq(4)');
		td.children('span').text(id);
		td.children('img').attr({'src':src, 'alt':id});
		jQuery.fn.modalBox('close');
	},
	screenOverlay: function(mode){
		var body_w = $(document).width();
		var body_h = Math.max($(document).height(), 3400);	// プリント位置リストの高さ 3300
		
		if(mode){
			$('#overlay').css({'width': body_w+'px',
								'height': body_h+'px',
								'opacity': 0.5}).show();
		}else{
			$('#overlay').css({'width': '0px',	'height': '0px'}).hide("1000");
		}
	},
	msgbox: function(msg){
	/*
	*	メッセージボックス
	*	@msg	表示するメッセージ文
	*/
		if($('#message_wrapper').length==0){
		// タグ要素がない場合に書き込む
			$('html').append('<div id="message_wrapper" style="display:none;"></div>');
		}
		$('#message_wrapper').html(msg);
		jQuery.fn.modalBox({
			directCall : {
				element : '#message_wrapper'
			}
		});
	},
	itemcolor: {
		names:[],
		hash:{}
	},
	size: {
		names:{},
		hash:{},
		list:[]
	},
	_DB: {
		'imgPath': 'https://takahamalifeart.com/weblib/img/'
	}
});