/*
*	タカハマライフアート
*	utility
*	charset euc-jp
*/

$(function(){
	
	/********************************
	*	vertical scroll adjast
	*/
	$(window).scroll(function () {
		if(mypage.prop.ordertype=="industry") return;
		var box = $('#floatingbox');
		var order_contents = $('.maincontents', '#order_wrapper');
		var boxYloc = parseInt(box.css("padding-top").substring(0,box.css("padding-top").indexOf("px"))) * 2;
		var bottomPos = order_contents.height() - (box.height() + boxYloc); //get the maximum scrollTop value
		var offset = $(document).scrollTop();
		offset = offset>bottomPos? bottomPos: offset;
		box.animate({top:offset+"px"},{duration:500,queue:false});
	});


	/********************************
	*	horizontal resize adjust
	*/
	var offset = 1200 - $(window).width()+10;
	offset = offset>300? 300: offset<10? 10: offset;
	$('#alertarea').animate({right:offset+"px"},{duration:100,queue:false});

	$(window).resize(function () {
		offset = 1200 - $(window).width()+10;
		offset = offset>250? 250: offset<10? 10: offset;
		$('#alertarea').animate({right:offset+"px"},{duration:100,queue:false});
	});


	/********************************
	*	trim
	*/
	String.prototype.trim = function(){return this.replace(/^[\s　]+|[\s　]+$/g, '');};
	
	
	/********************************
	*	clock
	*/
	setInterval( function() {
		var seconds = new Date().getSeconds();
		var sdegree = seconds * 6;
		var srotate = "rotate(" + sdegree + "deg)";
		$("#sec").css({"-moz-transform" : srotate, "-webkit-transform" : srotate});
	}, 1000 );

	setInterval( function() {
		var hours = new Date().getHours();
		var mins = new Date().getMinutes();
		var hdegree = hours * 30 + (mins / 2);
		var hrotate = "rotate(" + hdegree + "deg)";

		$("#hour").css({"-moz-transform" : hrotate, "-webkit-transform" : hrotate});
	}, 1000 );

	setInterval( function() {
		var mins = new Date().getMinutes();
		var mdegree = mins * 6;
		var mrotate = "rotate(" + mdegree + "deg)";

		$("#min").css({"-moz-transform" : mrotate, "-webkit-transform" : mrotate});
	}, 1000 );
	

	/********************************
	*	table sorter for order items
	*/
	// $("#orderlist").tablesorter( { headers:{ 0:{sorter:false}, 1:{sorter:false}, 9:{sorter:false}, 10:{sorter:false} } } );
	
	
	/********************************
	*	text fields in form
	*/
	$('form :text:not([class^="for"])').live('keypress', function(e){
		var my = (e.target || window.event.srcElement);
		var code=(e.charCode) ? e.charCode : ((e.which) ? e.which : e.keyCode);
		if(code == 13 || code == 3){
			var self = $(this);
			self.val(self.val().trim());
			$(this).moveCursor(my);
		}
	}).live('focusout', function(e){
		$(this).val($(this).val().trim());
	});


	/********************************
	*	number fields(HTML5)
	*/
     $('input[type="number"]').live('focusout', function(){
		var max = $(this).attr('max');
		if(max!="" && ($(this).val()-0)>max) $(this).val(max);
	});


	/********************************
	*	restriction of input
	*/
	jQuery.fn.extend({
		restrictKey: function(e, mode){
			var my = (e.target || window.event.srcElement);
			var code=(e.charCode) ? e.charCode : ((e.which) ? e.which : e.keyCode);
			switch(mode){
			case 'num':
				if (   !e.ctrlKey 				// Ctrl+?
			        && !e.altKey 				// Alt+?
			        && code != 0 				// ?
			        && code != 8 				// BACKSPACE
			        && code != 9 				// TAB
			        && code != 13 				// Enter
			        && code != 37 && code != 39 // ←→
			        && (code < 48 || code > 57)) // 0-9
			    	e.preventDefault();

			    if(code == 13 || code == 3) $(this).moveCursor(my);
		    	break;
			case 'price':
				if (   !e.ctrlKey 				// Ctrl+?
			        && !e.altKey 				// Alt+?
			        && code != 0 				// ?
			        && code != 8 				// BACKSPACE
			        && code != 9 				// TAB
			        && code != 13 				// Enter
			        && code != 37 && code != 39 // ←→
			        && code != 45				// -
			        && code != 46				// . Delete
			        && (code < 48 || code > 57)) // 0-9
			    	e.preventDefault();

			    if(code == 13 || code == 3) $(this).moveCursor(my);
		    	break;
		    case 'date':
				if (   !e.ctrlKey 				// Ctrl+?
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
			case 'cost':	// 業者テーブルの商品単価
				if (   !e.ctrlKey 				// Ctrl+?
			        && !e.altKey 				// Alt+?
			        && code != 0 				// ?
			        && code != 8 				// BACKSPACE
			        && code != 9 				// TAB
			        && code != 13 				// Enter
			        && code != 37 && code != 39 // ←→
			        && code != 45				// -
			        && code != 46				// . Delete
			        && (code < 48 || code > 57)) // 0-9
			    	e.preventDefault();

			    if(code == 13 || code == 3) $(this).moveCursorExt(my).change();
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
		},
		moveCursorExt: function(my){
		/*
		*	業者の見積テーブル　最終行の単価フィールドでエンターで行を追加
		*/
			var isMove = false;	// カーソル移動が出来たかどうかのチェック
			var elem = my.form.elements;
		    for(var i=0; i<elem.length; i++){
		    	if( elem[i]==my ){
	    			while(i<elem.length-1){
	    				i++;
	    				if($(elem[i]).closest('tr').is('.estimate')){
	    				// tr.estimate 内のテキストフィールドのみ対象
		    				if( elem[i].type=="text" && !$(elem[i]).attr('readonly') && elem[i].style.display!='none' ){
			    				elem[i].focus();
			    				isMove = true;
			    				break;
			    			}
			    		}
		    		}
		    		if( !isMove ) $('#estimation_toolbar .add_row').click();
		    		break;
		    	}
		    }
		    return this;
		}
	});


	// 0と自然数　0から9 のみ入力、桁区切りなし、不正値は"0"
	$('.forNum').live('keypress', function(e){
		$(this).restrictKey(e, 'num');
	}).live('focusout', function(e){
		mypage.check_NaN(this);
	});

	// 0と自然数　0から9 のみ入力、桁区切りなし、不正値は""
	$('.forBlank').live('keypress', function(e){
		$(this).restrictKey(e, 'num');
	}).live('focusout', function(e){
		mypage.check_NaN(this,"");
	});

	// 0から9 . - のみ入力、桁区切りなし、不正値は"0"
	$('.forReal').live('keypress', function(e){
		$(this).restrictKey(e, 'price');
    }).live('focusout', function(e){
    	mypage.check_Real(this);
	});
	
	// 金額　0から9 . - のみ入力、桁区切りあり、フォーカスでカンマなしに変換、不正値は"0"
	$('.forPrice').live('keypress', function(e){
		$(this).restrictKey(e, 'price');
	}).live('focusin', function(){
    	var c = this.value;
      	this.value = c.replace(/,/g, '');
      	var self = this;
      	$(self).select();
    }).live('focusout', function(e){
    	var c = this.value;
		this.value = mypage.addFigure(c);
	});
	
	
	/*
	*	金額　0から9 . - のみ入力、桁区切りあり、フォーカスでカンマなしに変換、不正値は"0"
	*	業者の見積テーブルの金額欄
	*/
	$('#orderlist tfoot tr.estimate .cost').live('keypress', function(e){
		$(this).restrictKey(e, 'cost');
	}).live('focusin', function(){
   		var c = this.value;
      	this.value = c.replace(/,/g, '');
      	var self = this;
      	$(self).select();
    }).live('focusout', function(e){
    	var c = this.value;
		this.value = mypage.addFigure(c);
	});

	// 日付　0から9 / - のみ入力し、不正値は""
	$('.forDate').live('keypress',function(e){
		$(this).restrictKey(e,'date');
    }).live('focusout', function(e){
    	mypage.dateCheck(e, this);
    });

	// zipcode mask
	$('.forZip').keypress( function(e) {
		$(this).restrictKey(e,'num');
    }).live('focusin', function(){
    	mypage.restrict_num(8, this);
    }).live('focusout', function(e){
    	this.maxLength = 8;
    	this.value = mypage.zip_mask(this.value);
    });

	// tel and fax mask
	$('.forPhone').keypress( function(e) {
		$(this).restrictKey(e,'num');
    }).live('focusin', function(){
    	mypage.restrict_num(13, this);
    }).live('focusout', function(e){
    	var res = mypage.phone_mask(this.value);
    	this.maxLength = res.l;
    	this.value = res.c;
    });

	/* フォームの文字数制限
	*	文字数は半角でmaxlengthの数
	*/
	$('.restrict').live('input', function(){
		var val = $(this).val();
		var maxlen = $(this).attr('maxlength');
		var res = $.restrictInput(val, maxlen);
		if(val!=res[0]) $(this).val(res[0]);
		if(res[1]>maxlen){
			$(this).addClass('fontred');
		}else{
			$(this).removeClass('fontred');
		}
	}).focusout( function(){
		var val = $(this).val();
		var maxlen = $(this).attr('maxlength');
		var res = $.restrictInput(val, maxlen);
		if(val!=res[0]) $(this).val(res[0]).addClass('fontred');
	});
	
	$('.restrict1').focus( function(){
		$.charCode.limit = true;
	}).keyup( function(e){
		var code=(e.charCode) ? e.charCode : ((e.which) ? e.which : e.keyCode);
		var val = $(this).val();
		var maxlen = $(this).attr('maxlength');
		var res = $.restrictInput(val, maxlen);
		if(res[1]>maxlen){
			$(this).val(res[0]).css('color','#f00');
			$.charCode.limit = false;
		}else if(code!=16 && code!=17 && code!=18){
			$(this).css('color','#333');
			$.charCode.limit = true;
		}
	}).focusout( function(){
		var val = $(this).val();
		var maxlen = $(this).attr('maxlength');
		var res = $.restrictInput(val, maxlen);
		if(val!=res[0]) $(this).val(res[0]);
		if($.charCode.limit) $(this).css('color','#333');
	});

	$('.restrict2').keydown( function(e){
		$.charCode.press = false;
		$.charCode.val = $(this).val();
	}).keypress( function(e){
		// 半角
		$.charCode.press = true;
		var code=(e.charCode) ? e.charCode : ((e.which) ? e.which : e.keyCode);
		var val = $(this).val();
		var maxlen = $(this).attr('maxlength');
		var res = $.strLength(val);
		if(res>=maxlen && code!=13){
			e.preventDefault();
			$(this).css('color','#f00');
		}
	}).keyup( function(e){
		if($.charCode.press) return;
		var val = $(this).val();
		var maxlen = $(this).attr('maxlength');
		var res = $.strLength(val);
		if(res>maxlen){
			$(this).css('color','#f00');
		}else if($.charCode.val!=val){
			$(this).css('color','#333');
		}
	}).focusout( function(){
		var val = $(this).val();
		var maxlen = $(this).attr('maxlength');
		var res = $.restrictInput(val, maxlen);
		if(val!=res[0]) $(this).val(res[0]).css('color','#f00');
	});


	/********************************
	*	extended the jQuery object
	*/
	jQuery.extend({
		dhx: {
		/*
		*	dhtmlxCombo
		*/
			'Combo':{}
		},
		charCode:{
			'press':false,
			'limit':false
		},
		strLength: function (args){
		/*
		*	半角英数とそれ以外の判断
		*	@args	対象文字列
		*
		*	return	全角:2、半角:1 とした文字量
		*/
			var len = 0;
			for(s=0; s<args.length; s++){
				if(args[s].match(/[ｱ-ﾝｧｨｩｪｫｬｭｮﾟﾞ]/)){
					len++;
				}else{
					var strSrc = escape(args[s]);
					for(var i=0; i<strSrc.length; i++, len++){
						if(strSrc.charAt(i) == "%"){
							if(strSrc.charAt(++i) == "u"){
								i += 3;
								len++;
							}
							i++;
						}
					}
				}
			}
			return len;
		},
		restrictInput: function(args, maxlen){
		/*
		*	全半角の区別なく指定文字数以内で丸める
		*	@args	対象文字列
		*	@maxlen	半角での最大文字数
		*
		*	return	[文字列, 文字数]
		*/
			var i = 0;
			var str = '';
			var len = 0;
			var res = 0;
			var isOver = 0;
			
			if(maxlen==0) return '';
			
			for(i=0; i<args.length; i++){
				str = args.slice(i,i+1);
				res = $.strLength(str);
				if(res+len>maxlen && isOver==0){
					isOver = i;
				}
				len += res;
			}
			if(isOver==0) isOver = i;
			str = args.slice(0,isOver);
			return [str, len];
		},
		set_calcbasis: function(args){
			mypage.prop.calcbasis = args;
			if(args==1){		// 注文確定日が基準
				$('.schedule_crumbs_toright').show();
				$('.schedule_crumbs_toleft').hide();
			}else if(args==2){	// お届け日が基準
				$('.schedule_crumbs_toleft').show();
				$('.schedule_crumbs_toright').hide();
			}else{				// スケジュール未設定
				$('.schedule_crumbs_toright').hide();
				$('.schedule_crumbs_toleft').hide();
			}
		},
		calc_ms: function(){
			$('#express_message').html("");
			if(mypage.prop.schedule_date==""){
				var dt = new Date();
			    mypage.prop.schedule_date = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
			}
			var base = Date.parse(mypage.prop.schedule_date.replace(/-/g,'/'))/1000;
			var pack = "no";
			var amount = $('#pack_yes_volume').val();
			if(amount>=10) pack = "yes";
			/*
			var amount = $('#est_amount').text().replace(/,/g, '') - 0;
			var check_amount = amount>0? amount: $('#check_amount').val().replace(/,/g, '') - 0;
			if($('input[value="yes"]', '#package_wrap').is(':checked') && check_amount >= 10){
				pack = "yes";
			}
			*/
			$.post('./php_libs/deliveryDate.php', {'act':'ms','base':base,'package':pack},
				function(r){
					var pre_date2 = $('#schedule_date2').val();
					$('#schedule_date1').val(mypage.prop.schedule_date);
					$('#schedule_date2').val(mypage.prop.schedule_date);
					$('#schedule_date3').val(r);
					var dest = $('#destination').val();
					var deli = $('#schedule_selector input[name="carriage"]:checked').val();
					var sendDay = r;
					var addDay = 0;
					if(deli!='accept' && deli!='other'){
						if( (dest==1 || dest>=40) && (deli=='normal' || deli=='time') ){
							addDay = 2;
						}else{
							addDay = 1;
						}
						sendDay = mypage.countDate(r, addDay);
					}
					$('#schedule_date4').val(sendDay);
					$.set_calcbasis(1);
					mypage.changeSchedule3(r, true);
				}
			);
			mypage.prop.modified = true;
		},
		calc_img: function(){
			$('#express_message').html("");
			var dt = new Date();
			var today = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
			if(mypage.prop.schedule_date=="") mypage.prop.schedule_date = today;
			var base = Date.parse(mypage.prop.schedule_date.replace(/-/g,'/'))/1000;
			var pack = "no";
			var amount = $('#pack_yes_volume').val();
			if(amount>=10) pack = "yes";
			/*
			var amount = $('#est_amount').text().replace(/,/g, '') - 0;
			var check_amount = amount>0? amount: $('#check_amount').val().replace(/,/g, '') - 0;
			if($('input[value="yes"]', '#package_wrap').is(':checked') && check_amount >= 10){
				pack = "yes";
			}
			*/
			$.post('./php_libs/deliveryDate.php', {'act':'ms','base':base,'package':pack},
				function(r){
					var date1 = Date.parse($('#schedule_date1').val().replace(/-/g,'/'))/1000;
					if(isNaN(date1) || date1>base){
						$('#schedule_date1').val(mypage.prop.schedule_date);
					}
					$('#schedule_date2').val(mypage.prop.schedule_date);
					$('#schedule_date3').val(r);
					
					var dest = $('#destination').val();
					var deli = $('#schedule_selector input[name="carriage"]:checked').val();
					var sendDay = r;
					var addDay = 0;
					if(deli!='accept' && deli!='other'){
						if( (dest==1 || dest>=40) && (deli=='normal' || deli=='time') ){
							addDay = 2;
						}else{
							addDay = 1;
						}
						sendDay = mypage.countDate(r, addDay);
					}
					$('#schedule_date4').val(sendDay);
					$.set_calcbasis(1);
					mypage.changeSchedule3(r, true);
				}
			);
			mypage.prop.modified = true;
		},
		calc_delivery: function(mode){
			$('#express_message').html("");
			var dt = new Date();
			if(mypage.prop.schedule_date==""){
			    mypage.prop.schedule_date = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
			}
			var dest = $('#destination').val();
			var deli = $('#schedule_selector input[name="carriage"]:checked').val();
			var base = Date.parse(mypage.prop.schedule_date.replace(/-/g,'/'))/1000;
			var pack = "no";
			var amount = $('#pack_yes_volume').val();
			if(amount>=10) pack = "yes";
			/*
			var amount = $('#est_amount').text().replace(/,/g, '') - 0;
			var check_amount = amount>0? amount: $('#check_amount').val().replace(/,/g, '') - 0;
			if($('input[value="yes"]', '#package_wrap').is(':checked') && check_amount >= 10){
				pack = "yes";
			}
			*/
			var addDay = 0;
			if(deli!='accept' && deli!='other'){
				if( (dest==1 || dest>=40) && (deli=='normal' || deli=='time') ){
					addDay = 2;
				}else{
					addDay = 1;
				}
			}
			$.ajax({url:'./php_libs/deliveryDate.php', type:'POST', datatype:'text', async:'false',
				data:{'act':'send','base':base,'cnt':addDay,'package':pack}, success: function(r){
					var data = r.split(',');
					$('#schedule_date3').val(data[0]);
					$('#schedule_date4').val(mypage.prop.schedule_date);
					var isCalc = true;
					if(mode=='dest'){
						// Do nothing
					}else if(mode=='sole'){
						if($('#schedule_date2').val()!=""){
							if(mypage.prop.calcbasis==0) $.set_calcbasis(1);
						}
					}else{
						var pre_date2 = $('#schedule_date2').val();
						$('#schedule_date1').val(data[1]);
						$('#schedule_date2').val(data[1]);
						$.set_calcbasis(2);
						if(pre_date2!=data[1]) isCalc = false;
					}
					mypage.changeSchedule3(data[0], isCalc);
					if(!isCalc) mypage.changeSchedule2(data[1]);
				}
			});
			mypage.prop.modified = true;
		},
		deserial: function(args){
               var lines = args.split($.delimiter.rec);
               var info = [];      // レコードごとの配列
               var data = [];      // 項目ごとにデータを分ける
               var key = [];       // フィールド名とデータに分ける
               for(var i=0; i<lines.length; i++){
                   data = lines[i].split($.delimiter.fld);
                   var tmp = [];
                   for(var j=1; j<data.length; j++){
                       key = data[j].split($.delimiter.dat);
                       tmp[key[0]] = key[1];
                   }
                   info[i] = tmp;
               }
               return info;
           },
		update_log: function(){
			var orders_id = $('#order_id').text()-0;
			$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:true, 
				data:{'act':'search', 'mode':'customerlog', 'field1[]':['orders_id'], 'data1[]':[orders_id]}, 
				success: function(r){
					if(r instanceof Array){
						// ログの一覧テーブルを生成
						var tbl = '';
						var len = r.length;
						if(len>0){
							tbl = '<table><tbody>';
							var curdate = 0;
							for(var i=0; i<len; i++){
								var dt = r[i]['cstlog_date'].split(' ');
								var tm = dt[1].split(':');
								if(curdate != dt[0]){
									tbl += '<tr class="dayseparate cstlog_'+r[i]['cstlogid']+'">';
								}else{
									tbl += '<tr class="cstlog_'+r[i]['cstlogid']+'">';
								}
								tbl += '<td class="log_date"';
								if(curdate != dt[0]){
									curdate = dt[0];
									tbl += '>'+dt[0]+'</td>';
								}else{
									tbl += ' style="visibility:hidden;">'+dt[0]+'</td>';
								}
								tbl += '<td class="log_time">'+tm[0]+':'+tm[1]+'</td>';
								tbl += '<td><p class="fixheight">'+r[i]['cstlog_text']+'</p></td>';
								tbl += '<td class="log_staff">'+r[i]['staffname']+'</td>';
								tbl += '</tr>';
							}
							tbl += '</tbody></table>';
						}
						$('#list_wrapper .pane').html(tbl);
						if($('#showtoggle').val()=="一覧表示へ"){
							$('#showtoggle').val("入力画面へ");
							$('#cleareditor').hide();
							$('#listtoggle').val("全リストを開く").show();
							$('table tr', '#list_wrapper').each( function(){
								$(this).children('td:eq(2) p').addClass('fixheight');
							});
							document.forms.logeditor_form.cstlogid.value = "";
							$('#log_editor').fadeOut('fast', function(){$('#list_wrapper').fadeIn();});
						}
					}else{
						alert("Error: p648:\n"+r);
					}
				},error: function(XMLHttpRequest, textStatus, errorThrown) {
					$.screenOverlay(false);
					alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
				}
			});
		},
		getLastMonth: function(){
		/*
		*	先月の日付を配列で返す
		*	@return		[先月1日][先月末]
		*/
			var dt = new Date();
			dt.setDate(0);
			var res = [];
			res[0] = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-01";
			res[1] = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
			return res;
		},
		getDelimiter: function(r){
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
		*	データの区切り文字
		*/
			'rec':"",
			'fld':"",
			'dat':""
		},
		calc_estimatetable: function(my){
		/*
		*	業者入力の見積テーブル
		*	金額と数量の変更による再計算
		*/	
			var tr = $(my).closest('tr');
			var pre = tr.find('.price').val();
			var amount = tr.find('.amount');
			if(amount.length==0) amount = 1;
			else amount = mypage.check_NaN(amount[0]);
			var $summary = tr.find('.summary');
			var cost = $.calc_cost_summary($summary, amount);
			if(cost!="") tr.find('.cost').val(cost);
			cost = tr.find('.cost').val().replace(/,/g, '');
			var price = mypage.addFigure(amount*cost);
			if(price!=pre){
				tr.find('.price').val(price);
				mypage.calcEstimation();
			}
		},
		calc_cost_summary: function(my, amount){
		/*
		*	業者入力の手入力欄（商品名）の単価計算
		*	@my		$('.summary') jQuery object
		*	@amount	枚数
		*
		*	return	単価
		*/
			var code = my.val().slice(0,3);
			var isJumbo = false;
			if(code.match(/^02\d$/)){	// シルクジャンボ版
				code = code.replace(/^02(\d)$/, '01$1');
				isJumbo = true;
			}
			var cost = $.availableTags.cost[code];
			var myDate = Date.parse('2014/02/18')/1000;		// シルクのインク代更新日
			var yours = Date.parse($('#schedule_date2').val().replace(/-/g,'/'))/1000;
			var v = "";
			if(typeof cost=='undefined') return v;
			
			if(amount==0){
				if(cost instanceof Array){
					v = cost[0];
				}else{
					v = cost;
				}
			}else{
				if(code.match(/^01\d$/)){			// シルクプリント代
					if(yours<myDate){
						if(amount<=5){
							v = cost[0];
						}else if(amount<=9){
							v = cost[1];
						}else if(amount<=19){
							v = cost[2];
						}else if(amount<=29){
							v = cost[3];
						}else if(amount<=49){
							v = cost[4];
						}else if(amount<=99){
							v = cost[5];
						}else{
							v = cost[6];
						}
					}else{
						if(amount<=5){
							v = cost[0];
						}else if(amount<=9){
							v = cost[1];
						}else if(amount<=19){
							v = cost[2];
						}else if(amount<=29){
							v = cost[3];
						}else if(amount<=49){
							v = cost[4];
						}else if(amount<=59){
							v = cost[5];
						}else if(amount<=69){
							v = cost[6];
						}else if(amount<=79){
							v = cost[7];
						}else if(amount<=89){
							v = cost[8];
						}else if(amount<=99){
							v = cost[9];
						}else{
							v = cost[10];
						}
					}
					
					// ジャンボ版
					if(isJumbo){
						v = Math.ceil(v*1.3);
					}
					
				}else if(code.match(/^03\d$/)){	// デジタル転写シート代
					if(amount<=3){
						v = cost[0];
					}else if(amount<=19){
						v = cost[1];
					}else if(amount<=49){
						v = cost[2];
					}else if(amount<=99){
						v = cost[3];
					}else if(amount<=499){
						v = cost[4];
					}else{
						v = cost[5];
					}
				}else if(code.match(/^04\d$/)){	// デジタル転写プレス代
					if(amount<=10){
						v = cost[0];
					}else{
						v = cost[1];
					}
				}else{
					v = cost;
				}
			}
			return v;
		},
		availableTags: {
				cost:{
					'001':7000,
					'002':12000,
					'003':8000,
					'004':1000,
					'011':[500,350,300,250,200,150,140,130,120,110,100],
					'012':[750,530,450,380,300,230,210,195,180,165,150],
					'013':[1000,710,600,510,400,310,280,260,240,220,200],
					'014':[1250,890,750,640,500,390,350,325,300,275,250],
					'015':[1500,1070,900,770,600,470,420,390,360,330,300],
					'031':[1500,750,660,630,580,510],
					'032':[1500,750,660,630,580,510],
					'033':[2000,970,860,820,760,660],
					'041':[150,100],
					'042':[200,130],
					'043':[230,150],
					'044':[300,200],
					'045':[200,130],
					'046':[230,150],
					'047':[300,180],
					'048':[230,150],
					'100':700,
					'101':50
					
				},
				summary:[
					"001 版代（35cm×27cm）",
					"002 版代（43cm×32cm）",
					"003 版代（デジタル転写）",
					"004 縁色代",
					"011 プリント代（1色）35cm×27cm",
					"012 プリント代（2色）35cm×27cm",
					"013 プリント代（3色）35cm×27cm",
					"014 プリント代（4色）35cm×27cm",
					"015 プリント代（5色）35cm×27cm",
					"021 プリント代（1色）43cm×32cm",
					"022 プリント代（2色）43cm×32cm",
					"023 プリント代（3色）43cm×32cm",
					"024 プリント代（4色）43cm×32cm",
					"025 プリント代（5色）43cm×32cm",
					"031 デジタル転写シート代（スーパー）",
					"032 デジタル転写シート代（白縁）",
					"033 デジタル転写シート代（濃色透明）",
					"041 プレス代（Tシャツ）",
					"042 プレス代（ポロシャツ）",
					"043 プレス代（ブルゾン1枚もの）",
					"044 プレス代（ブルゾン厚もの）",
					"045 プレス代（エプロン）",
					"046 プレス代（キャップ）",
					"047 プレス代（サンバイザー）",
					"048 プレス代（スウェット）",
					"051 インクジェットプリント",
					"062 カッティングプリント",
					"071 カラーコピー転写",
					"100 運賃",
					"101 たたみ袋入",
					"103 特急料金1.3",
					"104 特急料金1.5",
					"105 デザイン代"
				],
				summary_20131020:[
					"001 版代（シルク）35cm×27cm以内",
					"002 版代（特大）",
					"003 プリント代（シルク）",
					"004 サンプル代（シルク）",
					"006 箱（袋）出",
					"007 箱（袋）入",
					"009 色替代",
					"010 たたみ袋入",
					"011 受治具（品物固定台）",
					"012 特急料金",
					"013 デザイン料",
					"014 ネームタグ付",
					"017 インク作成料",
					"023 カッティングシート代",
					"024 ＴＳシート代",
					"025 水転写",
					"100 運賃",
					"101 版代（転写紙用）",
					"102 転写プリント代（シート・プレス代）",
					"104 転写サンプル代",
					"105 プレス加工代",
					"108 アルミ転写",
					"111 転写シート（濃色透明）",
					"112 転写シート（白ふち）",
					"113 転写シート（白用透明）",
					"114 転写シート（多色刷り）",
					"115 転写シート（スーパー転写）",
					"200 小口手数料",
					"206 タンクポップ",
					"301 オリジナルTシャツプリント代（ＮＥＴ）",
					"400 インクジェットプリント代",
					"500 キャンペーン割引",
					"603 ゼッケン",
					"604 刺繍",
					"605 のぼり",
					"607 昇華転写",
					"700 キャップ",
					"801 プリント代",
					"802 割増",
					"803 割引",
					"804 値引",
					"805 送料"
				]
		},
		msgbox: function(msg){
			$('#message_wrapper').html(msg);
			jQuery.fn.modalBox({
				directCall : {
					element : '#message_wrapper'
				}
			});
		},
		resConf: {
			'data': ''
		},
		confbox: function(msg, fn){
		/*
		*	確認ボックス
		*	@msg	表示するメッセージ文
		*	@fn		callback ボタンが押された後の処理　OK:true, Cancel:false
		*	@mode	0: Yes,No,Cancel(default)　1:OK,Cancel
		*/
			$.resConf.data = '';
			msg += '<p class="btn_line">';
			msg += '<input type="button" value="　はい　" class="closeModalBox" onclick="$.resConf.data=\'yes\';" />　';
			if(arguments.length==2) msg += '<input type="button" value="　いいえ　" class="closeModalBox" onclick="$.resConf.data=\'no\';" />　';
			msg += '<input type="button" value="キャンセル" class="closeModalBox" onclick="$.resConf.data=\'cancel\';" /></p>';
			$('#message_wrapper').html(msg);
			jQuery.fn.modalBox({
				directCall : {
					element : '#message_wrapper'
				},
				positionTop : 100,
				callFunctionAfterShow : function(){
				},
				callFunctionAfterHide : function(){
					fn();
				},
				disablingClickToClose : true,
				disablingTheOverlayClickToClose : true
			});
		}
	});



/***************************************************************************************************************************
*
*	common module
*
****************************************************************************************************************************/

	/********************************
	*	calendar
	*/
	$('#optprice_table .datepicker, #manuscriptdate, #arrival_date').datepicker({
		beforeShowDay: function(date){
			var weeks = date.getDay();
			var texts = "";
			if(weeks == 0) texts = "休日";
			var YY = date.getFullYear();
			var MM = date.getMonth() + 1;
			var DD = date.getDate();
			var currDate = YY + "/" + MM + "/" + DD;
			var datesec = Date.parse(currDate)/1000;
			if(!mypage.prop.holidayInfo[YY+"_"+MM]){
				mypage.prop.holidayInfo[YY+"_"+MM] = new Array();
				$.ajax({url: './php_libs/checkHoliday.php',
					type: 'GET',
					dataType: 'text',
					data: {'datesec':datesec},
	 				async: false,
	 				success: function(r){
						if(r!=""){
							var info = r.split(',');
							for(var i=0; i<info.length; i++){
								mypage.prop.holidayInfo[YY+"_"+MM][info[i]] = info[i];
							}
						}
					}
				});
			}
			if(mypage.prop.holidayInfo[YY+"_"+MM][DD] && weeks!=6) weeks = 0;
			if(weeks == 0) return [true, 'days_red', texts];
			else if(weeks == 6) return [true, 'days_blue'];
			return [true];
		}
	});
	
	/* 発送日の変更で担当者セレクターのリストを書換 */
	$('#searchtop_form .datepicker').datepicker({
		onClose: function(dateText, inst){
			if($(this).attr('name')=="term_from" && dateText!=""){
				$.ajax({url:'./php_libs/set_tablelist.php', type:'POST', dataType:'text',data:{'act':'staff', 'rowid':1, 'curdate':dateText}, async:false,
					success:function(r){
						$('#staff_id').html(r);
					},
					error:function(XMLHttpRequest, textStatus, errorThrown){
						$.msgbox(textStatus);
					}
				});
			}
		},
		beforeShowDay: function(date){
			var weeks = date.getDay();
			var texts = "";
			if(weeks == 0) texts = "休日";
			var YY = date.getFullYear();
			var MM = date.getMonth() + 1;
			var DD = date.getDate();
			var currDate = YY + "/" + MM + "/" + DD;
			var datesec = Date.parse(currDate)/1000;
			if(!mypage.prop.holidayInfo[YY+"_"+MM]){
				mypage.prop.holidayInfo[YY+"_"+MM] = new Array();
				$.ajax({url: './php_libs/checkHoliday.php',
					type: 'GET',
					dataType: 'text',
					data: {'datesec':datesec},
	 				async: false,
	 				success: function(r){
						if(r!=""){
							var info = r.split(',');
							for(var i=0; i<info.length; i++){
								mypage.prop.holidayInfo[YY+"_"+MM][info[i]] = info[i];
							}
						}
					}
				});
			}
			if(mypage.prop.holidayInfo[YY+"_"+MM][DD] && weeks!=6) weeks = 0;
			if(weeks == 0) return [true, 'days_red', texts];
			else if(weeks == 6) return [true, 'days_blue'];
			return [true];
		}
	});
	
	
	/********************************
	*	hide overlay
	*/
	$('#overlay').click( function(){
		if($('.popup_wrapper:visible').length){
			var wrapper = $('.popup_wrapper:visible');
			$(wrapper).fadeOut();
			var id = $(wrapper).attr('id');
			if(id=='inkcolor_wrapper'){
				mypage.prop.curr_inkcolor="";
			}else if(id=='printposition_wrapper'){
				mypage.prop.curr_ppImage="";
			}else if(id=='bundle_wrapper'){
				mypage.setBundle();
			}
			mypage.screenOverlay(false);
			if($('#update_customer:visible').length>0) $('#modify_customer').click();
		}else if($('#log_wrapper:visible').length){
			$('.close_popup_log').click();
		}
	});


	/********************************
	*	popup window
	*/
	$('.close_popup').click( function(){
		var wrapper = $('.popup_wrapper:visible');
		$(wrapper).fadeOut();
		var id = $(wrapper).attr('id');
		if(id=='inkcolor_wrapper'){
			mypage.prop.curr_inkcolor="";
		}else if(id=='printposition_wrapper'){
			mypage.prop.curr_ppImage="";
		}else if(id=='bundle_wrapper'){
			mypage.setBundle();
		}
		mypage.screenOverlay(false);
	});
	$('.close_popup_log').click( function(){
		var wrapper = $(this).closest('#log_wrapper:visible');
		wrapper.fadeOut();
		mypage.screenOverlay(false);
	});


	/********************************
	*	save
	*/
	$('.saveall').click( function(){
		var isReturn = true;
		
		// 管理者を除き発送後の修整を不可にする
		if(mypage.prop.shipped==2 && _my_level!="administrator"){
			alert("発送済みのデータを更新することはできません。");
			return;
		}
		
		if(confirm('変更内容を保存しますか？')){
			if(!$('#tab_order').hasClass('headertabs')){
				isReturn = mypage.save('order');
			}else if(!$('#tab_direction').hasClass('headertabs')){
				isReturn = mypage.save('direction');
			}
		}
		if(!isReturn){
			$.msgbox("保存処理でエラーが発生しています。\nご確認ください。");
		}
	});

   
	/********************************
	*	go to menu
	*/
	$('#btn_gotomenu').click( function(){
		var func = function(){
			$('#tab_order').click();	// 受注画面タブが開いている状態にする
			mypage.prop.modified = false;
			$('#header .inner').hide();
			$('#order_wrapper').hide();
			$('body, #header').addClass('main_bg');
			$('#header .main_header').show();
			$('#header').css('height','120px');
			$('#main_wrapper').show();
			if($('#result_count').text()!='0'){
				mypage.screenOverlay(true,true);
				mypage.main('btn', $('input[title="search"]'));
			}
			$(document).scrollTop(0);
		};
		
		// 未保存データの確認
		if(mypage.prop.modified) {
			$.confbox('変更内容を保存しますか', function(){
				if($.resConf.data=='yes'){
					var res = false;
					if(!$('#tab_order').hasClass('headertabs')){
//alert('mypage.save order');
						res = mypage.save('order', false);
					}else if(!$('#tab_direction').hasClass('headertabs')){
//alert('mypage.save direction');
						res = mypage.save('direction');
					}
					if(!res){
						$.msgbox('保存処理でエラーが発生しています。\nご確認ください。');
						return;
					}
				}else if($.resConf.data=='no'){
					if(($('#order_id').text()-0)==0 && $(':radio[name="firstcontact"]:checked').val()=="yes"){
						if($('#reception').val()==0){
							alert('受注担当者を指定して下さい。');
							return;
						}
						// 新規問い合わせ件数をカウント
						mypage.save('firstcontact');
					}
					
					/*	2014-09-09 変更を破棄するため
					if(($('#order_id').text()-0)!=0){
						// 登録済みの受注でお客様情報の必須項目が未入力の場合にメニューへの遷移を中止する
						var f = document.forms.customer_form;
						if( f.customername.value=="" || (f.tel.value=="" && f.mobile.value=="" && f.email.value=="") ){
							alert("顧客名と連絡先（TEL・E-Mailのいずれか）は必須項目です・");
							return;
						}
					}
					*/
				}else{
					return;
				}
				
				func();
			});
		}else{
			func();
		}
	});
	
	
	
	
	/********************************
	*	イメ画確定
	*/
	$('#btn_completionimage').click( function(){
		var $my = $(this);
		var func = function(){
			var orders_id = $('#order_id').text()-0;
			var progress_id = ($my.hasClass('btn_red'))? 1: 5;
			$.ajax({url: './php_libs/ordersinfo.php', type: 'POST', data: {'act':'update','mode':'acceptstatus',
				'field1[]':['orders_id','progress_id','confirmhash'],
				'data1[]':[orders_id, progress_id, ""]}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)){
						alert('Error: p1341\n'+r);
					}else{
						if(progress_id==5){
							mypage.setAcceptnavi(2);
							$('#completionimage').attr('checked', 'checked');
							$('#btn_completionimage').addClass('btn_red').text('イメ画中止');
						}else{
							mypage.setAcceptnavi(0);
							$('#completionimage').removeAttr('checked');
							$('#btn_completionimage').removeClass('btn_red').text('イメ画確定');

						}
						
					}
				}
			});
		};
		
		if(($('#order_id').text()-0)==0){	// 未保存の場合
			$.confbox('入力内容を保存します。よろしいですか？', function(){
				if($.resConf.data=='yes'){
					if(!mypage.save('order')){
						alert('保存処理でエラーが発生しています。\nご確認ください。');
						return;
					}
					func();
				}else{
					alert('処理を中止します。');
				}
			},true);
		}else{
			func();
		}
	});
	
	/********************************
	*	イメ画アップロード・送信
	*/
	$('#btn_imageup').click( function(){
		var orders_id = $('#order_id').text()-0;
		$.ajax({url: './php_libs/ordersinfo.php', type: 'POST', data: {'act':'update','mode':'imagecheck','order_id': orders_id},
			success: function(r){
				if(!r){
					alert('Error: イメージ画像アップロード失敗');
				}
			}
		});
		data = [];
		data.push(orders_id);
		act = "sendmail_image";
		$.ajax({url:'./documents/sendmail_image.php', type:'POST', dataType:'json', async:false, data:{'doctype':act, 'json':1, 'data[]':data}, 
			success:function(r){
				if(r instanceof Array){
					alert('イメージ画像をアップロードしました。');
				}else{
					alert('Error: p5535\n'+r);
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				alert('Error: p5539\n'+textStatus+'\n'+errorThrown);
			}
		});
	});
	
	/********************************
	*	firm order
	*/
	$('#firm_order, #btn_firmorder').click( function(){
		if(mypage.prop.firmorder){
			return;
		}
		if(!mypage.save('order')){
				alert('保存処理でエラーが発生しています。\nご確認ください。');
				return;
			}
		if( !mypage.confirm() ){
			return;
		}
		
		var orders_id = $('#order_id').text()-0;
		var orderdate = $('#schedule_date2').val();
		
		if(confirm("注文を確定させます宜しいですか。\n確定日："+orderdate)){

			// 注文確定、製作指示書の登録まで
			$.ajax({url: './php_libs/ordersinfo.php', type: 'POST', data: {'act':'update','mode':'acceptstatus',
				'field1[]':['orders_id','progress_id','confirmhash','ordertype', 'orderdate'],
				'data1[]':[orders_id, '4', "", mypage.prop.ordertype, orderdate]}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)){
						alert('Error: p813\n'+r);
					}else{
						// 進行を注文確定に固定
						$('input[name="phase"], label', '#phase_wrapper').hide();
						$('ins', '#phase_wrapper').hide();
						$('#order_completed').show();
						if($('#state_0 input').attr('checked')==false){
							var isNotBring = false;
							$('#orderlist tbody tr').each( function(){
								var category_id = (($(this).children('td:eq(2)').attr('class')).split('_'))[1];
								if(category_id!=100) isNotBring = true;
							});
							if(isNotBring) $('#order_stock').show();
						}
						
						// 進捗ナビバーを注文確定にする
						mypage.setAcceptnavi(4);
						/*
						$('#accept_navi li').removeClass('actlist').children('p').removeClass('act bef');
						$('#accept_navi li:eq(3)').addClass('actlist').children('p').addClass('act');
						$('#accept_navi li:eq(2)').children('p').addClass('bef');
						*/
						
						// アラートをクリア
						$("#alert_comment, #alert_require").fadeOut();

						// 入力モードを変更不可にする
						if($(':radio[name="ordertype"]:checked', '#enableline').val()=="general"){
							$('#ordertype_industry').next().hide();
							$('#ordertype_general').next().show();
						}else{
							$('#ordertype_industry').next().show();
							$('#ordertype_general').next().hide();
						}
						$(':radio[name="ordertype"]', '#enableline').hide();
						
						// 注文確定フラグを更新
						mypage.prop.firmorder = true;
						mypage.checkFirmorder();
						
						$('#firm_order, #btn_firmorder').hide();
						$('#btn_completionimage').hide();
						
						// 管理者権限で解除ボタンを表示
						if(_my_level=="administrator"){
							$('#btn_cancelorder').show();
						}
					}
				}
			});
		}
	});
	
	
	/********************************
	*	注文確定を解除
	*/
	$('#btn_cancelorder').click( function(){
		if(!mypage.prop.firmorder) return;
		
		var orders_id = $('#order_id').text()-0;
		
		if(confirm("注文確定を解除します宜しいですか。")){
			// 注文確定を解除し問い合わせ中にする
			$.ajax({url: './php_libs/ordersinfo.php', type: 'POST', data: {'act':'update','mode':'acceptstatus',
				'field1[]':['orders_id','progress_id','confirmhash'],
				'data1[]':[orders_id, '1', ""]}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)){
						alert('Error: p1082\n'+r);
					}else{
						// 注文確定とイメ画確定ボタンを表示
						$('#firm_order, #btn_firmorder').show();
						$('#btn_completionimage').show().removeClass('btn_red').text('イメ画確定');
						
						// 解除ボタンを非表示
						$('#btn_cancelorder').hide();
						
						// 進行を問い合わせ中にする
						$('input[name="phase"], label', '#phase_wrapper').show();
						$('ins', '#phase_wrapper').hide();
						
						// 進捗ナビバーを問い合わせ中にする
						mypage.setAcceptnavi(0);
						/*
						$('#accept_navi li').removeClass('actlist').children('p').removeClass('act bef');
						$('#accept_navi li:eq(0)').addClass('actlist').children('p').addClass('act');
						*/
						
						// アラートをクリア
						$("#alert_comment, #alert_require").fadeOut();
						
						// 入力モードを変更可にする
						$('#ordertype_industry').next().show();
						$('#ordertype_general').next().show();
						$(':radio[name="ordertype"]', '#enableline').show();
						
						// 入力フィールドを更新可にする
						$('input, select').attr('disabled', false);
						
						// 注文確定フラグを更新
						mypage.prop.firmorder = false;
						mypage.checkFirmorder();
						
						// 同梱ありを非表示
						$('#bundle_status').hide();
						
						// 注文リストを更新
						var noprint = 0;
						if(mypage.prop.ordertype=="general"){
							noprint = $('#noprint').is(':checked')? 1: 0;
						}
						mypage.showOrderItem({'orders_id':orders_id, 'noprint':noprint}, 'modify');
						
						// 再計算
						mypage.calcPrintFee();
						mypage.prop.modified = true;
					}
				}
			});
		}
	});
	
	/********************************
	*	a modification check
	*/
	$('#header :text, #header select, #header :checkbox[name!="state_0"], #order_wrapper :input, #order_wrapper input[type="number"]').change(function(){
		mypage.prop.modified = true;
	});



/***************************************************************************************************************************
*
*	main menu module
*
****************************************************************************************************************************/

	/********************************
	*	pulldown list for main menu
	*		height is 30 * row + 5(margin)
	*/
	$(".mainmenu li ul", "#header").mouseover(
		function(){
			var h = $('li', this).length * 30 + 5;
			$(this).stop().animate({height:h+'px'},{queue:false,duration:'fast'});
		}
	);
	$(".mainmenu li ul", "#header").mouseout(
		function(){
			$(this).stop().animate({height:'0px'},{queue:false,duration:'fast'});
		}
	);


	$('#result_searchtop .btn, .btn_area input[type="button"]', '#main_wrapper').live('click', function(){
		mypage.main('btn', $(this));
	});
	
	
	$('#acceptstatus_navi li').click( function(){
		var idx = $(this).index();
//alert(idx);
		switch(idx){
			case 0:	break;		// 全て
			case 1:	idx = 90;	// web注文
				break;
			case 2:	idx = 1;	// 問合せ
				break;
			case 3:	idx = 3;  // 見積
				break;
			case 4:	idx = 5;	// イメ画
				break;
			case 5:	idx = 4;	// 注文確定
				break;
			case 6: idx = 6;	// 取消
				break;
		}
		$('#progress_id').val(idx);
		$(this).siblings().filter(function(){
			if($(this).children().hasClass('active_crumbs')){
				$(this).children().removeClass('active_crumbs');
			}
		});
		$(this).children().addClass('active_crumbs');
		mypage.main('btn', $('input[title="search"]'));
	});
	
	
	/* セレクターの変更で即検索を実行 */
	$('#searchtop_form select').change( function(){
		mypage.main('btn', $('input[title="search"]'));
	});
	
	
	/* customer number 一般k000000、業者g0000 */
	$('#searchtop_form input[name=number], #customer_form input[name=number]').change( function(){	
		var str = $(this).val();
		if(str=='') return;
		str = str.replace(/[０-９]/g, function(m){
			var a = "０１２３４５６７８９";
			var r = a.indexOf(m);
			return r==-1? m: r;
		});
		str = str.replace(/[KＫｋ]/g, 'k');
		str = str.replace(/[GＧｇ]/g, 'g');
		/* /^[gk]{1}([1-9]{1}\d*)?$/ 0サプレスの場合 */
		if(!str.match(/^[gk]{1}\d*$/)){
			$(this).val('');
		}else{
			$(this).val(str);
		}
	});
	
	
	/* 通常とSelf-Designの切替 */
	$('#applyto').change( function(){
		var chk = $('#result_wrapper .chk_pagenavi[title=applyto]');
		if($(this).val()==1){
			$(chk[0]).removeClass('chk_active');
			$(chk[1]).addClass('chk_active');
		}else{
			$(chk[1]).removeClass('chk_active');
			$(chk[0]).addClass('chk_active');
		}
	});
	$('#result_wrapper .chk_pagenavi[title=applyto]').click( function(){
		if(!$(this).is('.chk_active')){
			$(this).siblings('.chk_pagenavi[title=applyto]').removeClass('chk_active');
			$(this).addClass('chk_active');
			if($(this).text()=='通常'){
				$('#applyto').val(0);
			}else{
				$('#applyto').val(1);
			}
		}
	});
	
	
	/* 日付クリア */
	$('#clear_term').click( function(){
		document.forms.searchtop_form.term_from.value = '';
		document.forms.searchtop_form.term_to.value = '';
		$('#term_from, #term_to').change();
	});
	$('#clear_lastmodified').click( function(){
		document.forms.searchtop_form.lm_from.value = '';
		document.forms.searchtop_form.lm_to.value = '';
	});
	
	
	/*
	*	発送日付の変更で担当者セレクターを書き換える
	*/
	$('#term_from, #term_to').change( function(){
		var $my = $('.staff', '#searchtop_form');
		var staff_id = $my.val();
		var rowid = $my.attr('rel');
		var term_from = '';
		var term_to = '';
		if($('#term_from').val()!=''){
			term_from = $('#term_from').val();
		}else{
			term_from = '1997-01-01';	// dummy
		}
		if($('#term_to').val()!=''){
			term_to = $('#term_to').val();
		}else{
			term_to = '2999-01-01';	// dummy
		}
		var field1 = ['rowid', 'term_from', 'term_to'];
		var data1 = [rowid, term_from, term_to];
		$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:false,
			data:{'act':'search','mode':'stafflist', 'field1[]':field1, 'data1[]':data1}, success: function(r){
				if(r instanceof Array){
					if(r.length!=0){
						var option = '<option value="0"';
						if(staff_id=='0'){
							option += ' selected="selected"';
						}
						option += '>----</option>';
						for(var i=0; i<r.length; i++){
							option += '<option value="'+r[i]['id']+'"';
							if(staff_id==r[i]['id']){
								option += ' selected="selected"';
							}
							option += '>'+r[i]['staffname']+'</option>';
						}
						$my.html(option);
					}else{
						// do nothing.
					}
				}else{
					alert("Error: p1448:\n"+r);
				}
			},error: function(XMLHttpRequest, textStatus, errorThrown) {
				$.screenOverlay(false);
				alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
			}
		});
	});
	
	
/***************************************************************************************************************************
*
*	業者入力モード
*
****************************************************************************************************************************/

	/* 数量と単価の変更 */
	$('#orderlist tfoot .amount, #orderlist tfoot .cost').change( function(){
		$.calc_estimatetable(this);
	});


	/* 見積テーブルの行追加 */
	$('#estimation_toolbar .add_row').live('click', function(){
		var tr = '<tr class="estimate" style="display:table-row">';
		tr += '<td class="tip">0</td>';
		tr += '<td colspan="5"><input type="text" value="" class="summary" /></td>';
		tr += '<td><input type="text" value="0" class="amount forNum" /></td>';
		tr += '<td><input type="text" value="0" class="cost" /></td>';
		tr += '<td><input type="text" value="0" class="price" readonly="readonly" /></td>';
		tr += '<td colspan="2"></td>';
		tr += '<td class="none"><input type="button" value="削除" class="delete_row" /></td>';
		tr += '<td class="tip"></td></tr>';
		$('#orderlist tfoot tr.total_estimate:first').before(tr);

		// liveメソッドがchangeに対応していないため再設定
		$('#orderlist tfoot tr.estimate:last .cost').change( function(){
			$.calc_estimatetable(this);
		});

		$('#orderlist tfoot tr.estimate:last .forNum').change( function(){
			$.calc_estimatetable(this);
		});

		// 削除ボタンのスタイル
		// $( "#orderlist tfoot tr.estimate .delete_row" ).button();

		// オートコンプリート
		$( "#orderlist tfoot tr.estimate .summary" ).autocomplete({
			source: $.availableTags.summary,
			autoFocus: true,
			delay: 0,
			close: function( event, ui ) {
				var code = $(this).val().slice(0,3);
				var cost = $.availableTags.cost[code];
				var amount = $(this).closest('tr').find('.amount').val().replace(/,/g, '');
				var v = 0;
				if(typeof cost=='undefined') return;
				
				if(amount==0){
					if(cost instanceof Array){
						v = cost[0];
					}else{
						v = cost;
					}
				}else{
					if(code.match(/^01\d$/)){			// シルク通常版
						if(amount<=5){
							v = cost[0];
						}else if(amount<=9){
							v = cost[1];
						}else if(amount<=19){
							v = cost[2];
						}else if(amount<=29){
							v = cost[3];
						}else if(amount<=49){
							v = cost[4];
						}else if(amount<=99){
							v = cost[5];
						}else{
							v = cost[6];
						}
					}else if(code.match(/^02\d$/)){	// シルクジャンボ版
						if(amount<=5){
							v = cost[0];
						}else if(amount<=9){
							v = cost[1];
						}else if(amount<=19){
							v = cost[2];
						}else if(amount<=29){
							v = cost[3];
						}else if(amount<=49){
							v = cost[4];
						}else if(amount<=99){
							v = cost[5];
						}else{
							v = cost[6];
						}
						
						v = Math.ceil(v*1.3);
					}else if(code.match(/^03\d$/)){	// デジタル転写シート代
						if(amount<=3){
							v = cost[0];
						}else if(amount<=19){
							v = cost[1];
						}else if(amount<=49){
							v = cost[2];
						}else if(amount<=99){
							v = cost[3];
						}else if(amount<=499){
							v = cost[4];
						}else{
							v = cost[5];
						}
					}else if(code.match(/^04\d$/)){	// デジタル転写プレス代
						if(amount<=10){
							v = cost[0];
						}else{
							v = cost[1];
						}
					}else{
						v = cost;
					}
				}
				$(this).closest('tr').find('.cost').val(v);
				$.calc_estimatetable(this);
			}
		}).focus();

		// Changeイベントの設定
		$('#orderlist tfoot tr.estimate :text').change(function(){
			mypage.prop.modified = true;
		});

	});


	/* 見積テーブルの行削除 */
	$('#orderlist tfoot .delete_row').live('click', function(){
		var tot = $('#subtotal_estimate').val().replace(/,/g, '');
		var tr = $(this).closest('tr');
		var del = tr.find('.price').val().replace(/,/g, '');
		tot -= del;
		var figure = mypage.addFigure(tot);
		tr.remove();
		var sales_tax = Math.ceil(tot * mypage.prop.tax);
		var sum = Math.ceil(tot * (1+mypage.prop.tax));
		sales_tax = mypage.addFigure(sales_tax);
		sum = mypage.addFigure(sum);
		$('#est_total_price').text(figure);
		$('#subtotal_estimate').val(figure);
		$('#sales_tax').val(sales_tax);
		$('#total_estimate_cost').val(sum);
		var amount = $('#est_amount').text().replace(/,/g, '') - 0;
		var per = amount==0? 0: Math.ceil(tot/amount);
		$('#est_perone').text(mypage.addFigure(per));
		mypage.prop.modified = true;
	});



/***************************************************************************************************************************
*
*	accepting order page module
*
****************************************************************************************************************************/


	/********************************
	*	見積りボックスでプリント代を手入力に切り替える
	*/
	$('#free_printfee').change( function(){
		if($(this).attr('checked')){
			$('#est_printfee').removeAttr('readonly').removeClass('readonly');
			$('#itemprint tbody').html('');
		}else{
			$('#est_printfee').attr('readonly','readonly').addClass('readonly');
			mypage.calcPrintFee();
		}
	});
	$('#est_printfee').blur( function(){
		if(!$(this).is('.readonly')){
			mypage.calcEstimation();
		}
	});
	
	
	/********************************
	*	発注チェック（state_0）
	*/
	$('#state_0 input').change( function(){
		var orders_id = $('#order_id').text()-0;
		var staff_id = $('#reception').val();
		var field = ['orders_id','state_0'];
		
		if(!mypage.prop.firmorder){
			alert('注文が確定していません。');
			$(this).attr('checked', false);
			return;
		}
		
		if(staff_id==0){
			alert('担当者を指定してください。');
			$(this).attr('checked', false);
			return;
		}
		
		var isNotBring = false;
		$('#orderlist tbody tr').each( function(){
			var category_id = (($(this).children('td:eq(2)').attr('class')).split('_'))[1];
			if(category_id!=100) isNotBring = true;
		});
		
		if(!$(this).attr('checked') && isNotBring){
			staff_id = 0;
			$('#order_stock').show();
		}else{
			$('#order_stock').hide();
		}
		
		var data = [orders_id,staff_id];
		$.ajax({url: './php_libs/ordersinfo.php', type: 'POST',
			data: {'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async: false,
			success: function(r){
				if(!r.match(/^\d+?$/)){
					alert('Error: p1087\n'+r);
					return;
				}
			}
		});
		
		field = ['orders_id','ordering'];
		data = [orders_id,staff_id];
		$.ajax({url: './php_libs/ordersinfo.php', type: 'POST',
			data: {'act':'update','mode':'progressstatus','field1[]':field,'data1[]':data}, async: false,
			success: function(r){
				if(!r.match(/^\d+?$/)){
					alert('Error: p1470\n'+r);
					return;
				}
			}
		});
	});
	
	
	/********************************
	*	change order type
	*/
	$(':radio[name="ordertype"]', '#header').change(
		function(){
			if(!confirm('保存されていない情報は破棄されます。\n宜しいですか？')){
				if($(this).val()=="industry") $('#ordertype_general').val(['general']);
				else $('#ordertype_industry').val(['industry']);
				return;
			}

			mypage.prop.ordertype = $(this).val();
			sessionStorage.clear();
			$('#category_selector').val(1).change();
			
			if($('#total_amount').val()!='0'){
				$('#total_amount').val('0');
				$('#total_cost').val('0');
				$('#orderlist tbody').html('');
				$('#pp_wrapper').html('');
				$.ajax({url:'./php_libs/dbinfo.php', type:'POST', dataType:'text', async:false, data:{'act':'removeitem','all':true},
					success: function(r){
					}
				});
				mypage.prop.modified = true;
			}
			$('#est_table1 tbody tr:not(:nth-child(2)) td, #est_total_price, #est_amount, #est_perone').text('0');
			$('#est_printfee, #designcharge, #reductionprice').val('0');
			$('#orderlist tfoot :text:not(".group, .summary")').val('0');
			$('#orderlist tfoot :text.group, #orderlist tfoot :text.summary').val('');
			
			$(':radio[name="carriage"]', '#schedule_selector').val(['normal']);
			$('input[name="package"]', '#package_wrap').removeAttr('checked');
			$('input[value="no"]', '#package_wrap').attr('checked','checked');
			$('input[type="number"]', '#package_wrap').val('0').parent('p').hide();
			
			$(':radio[name="deliver"]', '#deliver_wrapper').val(['0']);
			$('#deliver_wrapper').children('label:last').addClass('pending');
			$('#deliverytime').val(0);
			$('#deliverytime_wrapper').hide();
			$('#deliver_wrapper').show();
			$('#carriage_name').text($(':radio[name="carriage"]:checked', '#schedule_selector').parent().text());
			var freeform = $('.phase_box', '#order_wrapper').filter(
							function(){
								if($(this).is('.freeform')){
									return false;
								}else{
									return true;
								}
							});
			if($(this).val()=="industry"){
				$('#destination').val('13');
				$('#check_amount, #exchink_count').val('0');
				$('#floatingbox, #exchink_label').hide();
				$('tr:lt(2)', '#schedule_selector').hide();
				$('#category_selector option:last').before('<option value="99">転写シート</option>');
				$('#orderlist tfoot tr, #estimation_toolbar').show();
				freeform.hide();
				$('#optprice_table').find('tr:not(.freeform)').hide();
				$('.phase_box:eq(0)', '#order_wrapper').after( $('#modify_customer_wrapper') );
				$('#modify_customer_wrapper').after( $('#delivery_address_wrapper') );
				$('#pricinglist').show();
				document.forms.customer_form.cstprefix.value = 'g';
			}else{
				$('#floatingbox, #exchink_label').show();
				$('tr:lt(2)', '#schedule_selector').show();
				if($('#category_selector').val()==99){
					$('#category_selector').val('1');
					mypage.changeValue($('#category_selector')[0]);
				}
				$('#category_selector option[value="99"]').remove();
				$('#orderlist tfoot tr.estimate:gt(0)').remove();
				$('#orderlist tfoot tr:gt(0), #estimation_toolbar').hide();
				$('#express_checker').removeAttr('checked');
				freeform.show();
				$('#optprice_table').find('tr').show();
				$('#options_wrapper').after( $('#modify_customer_wrapper') );
				$('#modify_customer_wrapper').after( $('#delivery_address_wrapper') );
				$('#pricinglist').hide();
				document.forms.customer_form.cstprefix.value = 'k';
			}

			$(document).scrollTop(0);
		}
	);


	/********************************
	*	header tabs
	*/
	$('#tab_order').click( function(){
		if(!$(this).hasClass('headertabs')) return;
		var func = function(){
			if( !$('#tab_direction').hasClass('headertabs') ){
				$('#tab_direction').addClass('headertabs');
				$('#direction_wrapper').hide();
			}
			$('#tab_order').removeClass('headertabs');
			$('.firm_order', '#header').show();
			if($('#order_comment').val().trim()!="") $("#alert_comment:hidden").effect('pulsate',{'times':4},250);
			$('#disableline').hide();
			$('#header .inner').css({'background-image':'url(./img/header_juchu.png)','color':'#333'}).find('input[type="text"]').removeAttr('readonly');
			$('#enableline').show();
			$('.btnarea p', '#header').show();
			$('#order_wrapper').show(250, function(){$(document).scrollTop(0);});
		};
		
		if(mypage.prop.modified){
			$.confbox('変更内容を保存しますか？', function(){
				if($.resConf.data=='yes'){
					if(!mypage.save('direction')){	// 制作指示書画面を保存
						alert("p1873\n保存処理でエラーが発生しています。");
						return false;
					}
				}else{
					return;	// 遷移中止
				}
				mypage.prop.modified = false;
				func();
			}, true);
		}else{
			func();
		}
	});
	
	
	$('#tab_direction').click( function(){
		if(!$(this).hasClass('headertabs')) return;
		var func = function(){
			var orders_id = $('#order_id').text()-0;
			if( !mypage.setDirectionData(orders_id) ) return;
			if( !$('#tab_order').hasClass('headertabs') ){
				$('#tab_direction').removeClass('headertabs');
				$('#tab_order').addClass('headertabs');
				$('#order_wrapper').hide();
				$('#enableline').hide();
				var list = $('#disableline');
				list.children('li:nth-child(2)').children().text($('#reception option:selected').text());
				list.children('li:nth-child(4)').children().text($('#order_id').text());
				list.children('li:nth-child(6)').children().text($(':radio:checked', '#enableline').next().text());
				list.show();
				$('.btnarea p', '#header').hide();
				$('.firm_order', '#header').hide();
			}
			$('#disableline li').css('color', '#fff321');
			$('#disableline li p').css('color', '#fffccd');
			$('#header .inner').css({'background-image':'url(./img/header_shijisyo.png)','color':'#fffccd'}).find('input[type="text"]').attr('readonly','readonly');
			$('#direction_wrapper').show(250, function(){
				$('#tabs').find('img[id^="selectiveid"]').each(function(){
					var posname = $(this).attr('alt');
					var w = $(this).parent().parent().next('.dire_printinfo_wrapper').find('img[alt="'+posname+'"]').attr('width');
					$(this).attr('width', w);
				});
			});
		};
		
		if(mypage.prop.modified){
			$.confbox('変更内容を保存しますか？', function(){
				if($.resConf.data=='yes'){
					if(!mypage.save('order')){	// 受注入力画面を保存
						alert("p1458\n保存処理でエラーが発生しています。");
						return;
					}
				}else{
					return;	// 遷移中止
				}
				mypage.prop.modified = false;
				func();
			}, true);
		}else{
			func();
		}
		
		mypage.screenOverlay(false);	// 他の画面から直接呼出しの場合
	});


	/********************************
	*	customer log
	*/

	/* 受付ログの取得と表示 */
	$('#btn_customerlog').click( function(){
		mypage.screenOverlay(true);
		$.update_log();
		var y = $(document).scrollTop()+170;
		var w = $(document).width();
		w = w<=600? 0: (w-600)/2;
		$('#log_wrapper').css({'left':w+'px', 'top':y+'px'}).fadeIn('fast', function(){
			$('#log_editor').fadeOut('fast', function(){$('#list_wrapper').fadeIn();});
		});
	});

	/* 表示の切替 */
	$('#showtoggle').click( function(){
		if($(this).val()=="一覧表示へ"){
			$(this).val("入力画面へ");
			$('#cleareditor').hide();
			$('#listtoggle').val("全リストを開く").show();
			$('table tr', '#list_wrapper').each( function(){
				$(this).children('td:eq(2) p').addClass('fixheight');
			});
			document.forms.logeditor_form.cstlogid.value = "";
			$('#log_editor').fadeOut('fast', function(){$('#list_wrapper').fadeIn();});
		}else{
			$(this).val("一覧表示へ");
			$('#listtoggle').hide();
			$('#modify_log, #delete_log').hide();
			$('#cleareditor').show();
			$('#log_text').val("");
			$('#list_wrapper').fadeOut('fast', function(){$('#log_editor').fadeIn();});
		}
	});


	/* リスト表示のスライド */
	$('#listtoggle').click( function(){
		if($(this).val()=="全リストを開く"){
			$(this).val("リストをたたむ");
			$('table tr', '#list_wrapper').each( function(){
				$(this).children('td:eq(2)').children('p').removeClass('fixheight');
			});
		}else{
			$(this).val("全リストを開く");
			$('table tr', '#list_wrapper').each( function(){
				$(this).children('td:eq(2)').children('p').addClass('fixheight');
			});
		}
	});


	/* 一覧から指定して表示 */
	$('table tr', '#list_wrapper').live('click', function(){
		$('#showtoggle').val("一覧表示へ");
		$('#listtoggle').hide();
		var message = $(this).children('td:eq(2)').text();
		var id = $(this).attr('class').split('_')[1];
		$('#modify_log, #delete_log').show();
		$('#cleareditor').show();
		document.forms.logeditor_form.cstlogid.value = id;
		$('#log_text').val(message);
		$('#list_wrapper').fadeOut('fast', function(){$('#log_editor').fadeIn();});

	});


	/* エディタのクリア */
	$('#cleareditor').click( function(){
		$('#modify_log, #delete_log').hide();
		document.forms.logeditor_form.cstlogid.value = "";
		$('#log_text, #against').val("");
	});


	/* 一覧の初期化、全てのログを表示 */
	$('#init_pane').click( function(){
		$.update_log();
		$('#against').val("");
		$('#list_wrapper .pan p:eq(1)').hide().children('#searchword').text("");
		$('#list_wrapper .pan p:eq(0)').show();
	});


	/* ログの検索 */
	$('#search_log').click( function(){
		var orders_id = $('#order_id').text()-0;
		var against = $('#against').val().trim();
		var fld = ['orders_id','against'];
		var dat = [orders_id, against];
		$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', datatype:'text', async:'false',
			data:{'act':'search', 'mode':'searchlog', 'field1[]':fld, 'data1[]':dat}, success: function(r){
				r = $.getDelimiter(r);
				if(r.indexOf($.delimiter['dat'])==-1){
					alert('Error: p1266\n'+r);
					return;
				}
                   var i = 0;
				var info = $.deserial(r);
                   
				// ログの一覧テーブルを生成
				var tbl = '';
				if(info.length>0){
					tbl = '<table><tbody>';
					for(i=0; i<info.length; i++){
						tbl += '<tr class="cstlog_'+info[i]['cstlogid']+'">';
						var dt = info[i]['cstlog_date'].split(' ');
						tbl += '<td class="log_date">'+dt[0]+'</td><td class="log_time">'+dt[1]+'</td>';
						tbl += '<td><p class="fixheight">'+info[i]['cstlog_text']+'</p></td>';
						tbl += '<td class="log_staff">'+info[i]['staffname']+'</td>';
						tbl += '</tr>';
					}
					tbl += '</tbody></table>';

					$('#list_wrapper .pan p:eq(0)').hide();
					$('#list_wrapper .pan p:eq(1)').show().children('#searchword').text(against);

				}else{
					$('#list_wrapper .pan p:eq(1)').children('#searchword').text(against);
				}

				if(against==""){	// 検索文字が未入力場合は全ログを表示の状態にする
					$('#list_wrapper .pan p:eq(1)').hide().children('#searchword').text("");
					$('#list_wrapper .pan p:eq(0)').show();
				}


				$('#list_wrapper .pane').html(tbl);

				// 入力画面が表示されている状態で検索を行なった場合は一覧画面にする
				if( $('#log_editor:visible').length ){
					$('#showtoggle').val("入力画面へ");
					$('#cleareditor').hide();
					$('#listtoggle').val("全リストを開く").show();
					$('table tr', '#list_wrapper').each( function(){
						$(this).children('td:eq(2) p').addClass('fixheight');
					});
					$('#log_editor').fadeOut('fast', function(){$('#list_wrapper').fadeIn();});
				}
			}
		});

	});


	/* ログの新規保存 */
	$('#save_log').click( function(){
		var orders_id = $('#order_id').text()-0;
		if( $('#log_staff').val()=="" ){
			alert("担当者を指定して下さい。");
			return;
		}
		if( orders_id==0 ){
			alert("受注書が保存されていません。");
			return;
		}
		var fld = ['orders_id','cstlog_date','cstlog_text','cstlog_staff'];
		var dat = [];
		var dt = new Date();
		var cstlog_date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours()+':'+('00'+dt.getMinutes()).slice(-2)+':'+('00'+dt.getSeconds()).slice(-2);
		dat.push(orders_id);
		dat.push(cstlog_date);
		dat.push( $('#log_text').val() );
		dat.push( $('#log_staff').val() );

		$.ajax({
			url:'./php_libs/ordersinfo.php', type:'POST', datatype:'text', async:'false',
			data:{'act':'insert', 'mode':'customerlog', 'field1[]':fld, 'data1[]':dat}, success: function(r){
				if(!r.match(/^\d+?$/)){
					alert("ログの更新が出来ませんでした。\nもう一度やり直してください。\n"+r);
					return;
				}
				$.update_log();
			}
		});
	});


	/* ログの修正更新 */
	/**
	*	var dt = new Date();
	*	var cstlog_date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours()+':'+('00'+dt.getMinutes()).slice(-2)+':'+('00'+dt.getSeconds()).slice(-2);
	**/
	$('#modify_log').click( function(){
		var orders_id = $('#order_id').text()-0;
		if( $('#log_staff').val()=="" ){
			alert("担当者を指定して下さい。");
			return;
		}
		if( orders_id==0 ){
			alert("受注書が保存されていません。");
			return;
		}
		var fld = ['cstlogid','orders_id','cstlog_text','cstlog_staff'];
		var dat = [];
		dat.push( document.forms.logeditor_form.cstlogid.value );
		dat.push(orders_id);
		dat.push( $('#log_text').val() );
		dat.push( $('#log_staff').val() );

		$.ajax({
			url:'./php_libs/ordersinfo.php', type:'POST', datatype:'text', async:'false',
			data:{'act':'update', 'mode':'customerlog', 'field1[]':fld, 'data1[]':dat}, success: function(r){
				if(!r.match(/^\d+?$/)){
					alert("ログの更新が出来ませんでした。\nもう一度やり直してください。\n"+r);
					return;
				}
				$.update_log();
			}
		});
	});


	/* ログの削除 */
	$('#delete_log').click( function(){
		if( !confirm('ログの削除します。宜しいですか？') ) return;
		var fld = ['cstlogid'];
		var dat = [document.forms.logeditor_form.cstlogid.value];

		$.ajax({
			url:'./php_libs/ordersinfo.php', type:'POST', datatype:'text', async:'false',
			data:{'act':'delete', 'mode':'customerlog', 'field1[]':fld, 'data1[]':dat}, success: function(r){
				if(!r.match(/^\d+?$/)){
					alert("ログの削除が出来ませんでした。\nもう一度やり直してください。\n"+r);
					return;
				}
				$.update_log();
			}
		});
	});


	/********************************
	*	media check
	*	何で知ったか、お問い合わせ方法などのチェックを全て解除
	*/
	$('#mediacheck03_other').focus( function(){
		$(':radio[name="mediacheck03"]', '#mediacheck_wrapper').val(['other']);
	});


	$('#mediacheck_reset').click( function(){
		$(':radio[name!="firstcontact"]', '#mediacheck_wrapper').removeAttr('checked');
		$('#mediacheck03_other').val('その他');
	});


	/********************************
	*	schedule
	*	入稿〆日、イメ画〆日、お届け日
	*/

	$('#schedule_date1, #schedule_date2, #schedule_date4').datepicker({
		onSelect: function(dateText, inst) {
			mypage.prop.schedule_date = dateText;
		},
		onClose: function(dateText, inst){
			var myDate = '';
			var yours = '';
			var myName = $(this).attr('id');
			var num = myName.charAt(myName.length-1);
			switch(num){
				case '1':
					if(mypage.prop.schedule_date=="") return;
					myDate = Date.parse(mypage.prop.schedule_date.replace(/-/g,'/'))/1000;
					yours = Date.parse($('#schedule_date2').val().replace(/-/g,'/'))/1000;
					if(yours<myDate){
						$('#schedule_date2').val(mypage.prop.schedule_date);
						mypage.changeSchedule2(mypage.prop.schedule_date);
					}
					if($('#schedule_date3').val()!=""){
						if(mypage.prop.calcbasis==0) $.set_calcbasis(2);
						mypage.calcPrintFee();
					}
					break;
				case '2':
					if(mypage.prop.schedule_date!=""){
						myDate = Date.parse(mypage.prop.schedule_date.replace(/-/g,'/'))/1000;
						yours = Date.parse($('#schedule_date1').val().replace(/-/g,'/'))/1000;
						if(isNaN(yours) || yours>myDate){
							$('#schedule_date1').val(mypage.prop.schedule_date);
						}
						if($('#schedule_date3').val()!=""){
							if(mypage.prop.calcbasis==0) $.set_calcbasis(2);
						}
					}
					mypage.changeSchedule2(mypage.prop.schedule_date);
					break;
				case '4':
					$.calc_delivery('sole');
					break;
			}
			mypage.prop.modified = true;
		},
		beforeShowDay: function(date){
			mypage.prop.schedule_date = "";
			var weeks = date.getDay();
			var texts = "";
			if(weeks == 0) texts = "休日";
			var YY = date.getFullYear();
			var MM = date.getMonth() + 1;
			var DD = date.getDate();
			var currDate = YY + "/" + MM + "/" + DD;
			var datesec = Date.parse(currDate)/1000;
			if(!mypage.prop.holidayInfo[YY+"_"+MM]){
				mypage.prop.holidayInfo[YY+"_"+MM] = new Array();
				$.ajax({url: './php_libs/checkHoliday.php',
					  	type: 'GET',
					  	dataType: 'text',
					  	data: {'datesec':datesec},
	 				  	async: false,
	 				  	success: function(r){
							if(r!=""){
								var info = r.split(',');
								for(var i=0; i<info.length; i++){
									mypage.prop.holidayInfo[YY+"_"+MM][info[i]] = info[i];
								}
							}
					  	}
					});
			}
			if(mypage.prop.holidayInfo[YY+"_"+MM][DD] && weeks!=6) weeks = 0;
			if(weeks == 0) return [true, 'days_red', texts];
			else if(weeks == 6) return [true, 'days_blue'];
			return [true];
		},
		dateFormat: 'yy-mm-dd'
	});

	
	/********************************
	*	reset arrival
	*/
	$('#reset_arrival').click( function(){
		$('#arrival_date').val("");
		mypage.prop.modified = true;
	});
	
	
	/********************************
	*	reset schedule
	*/
	$('#reset_schedule').click( function(){
		$('#schedule tbody input[type="text"]').each(function(){$(this).val("");});
		$('.schedule_crumbs_toright, .schedule_crumbs_toleft').hide();
		mypage.prop.calcbasis = 0;
		mypage.prop.modified = true;
		mypage.changeSchedule3("", 0);
		mypage.changeSchedule2("");
	});
	
	
	/********************************
	*	calc schedule
	*/
	$('tr.btn input[type="button"]', '#schedule').click( function(){
		var myName = $(this).attr('id');
		var num = myName.charAt(myName.length-1);
		mypage.prop.schedule_date = $('#schedule_date'+num).val();
		switch(num){
			case '1':if($('#schedule_date1').val()==""){
							alert('入稿〆日を指定して下さい');
						}else{
							$.calc_ms();
						}
						break;
			case '2':if($('#schedule_date2').val()==""){
							alert('注文確定日を指定して下さい');
						}else{
							$.calc_img();
						}
						break;
			case '4':if($('#schedule_date4').val()==""){
							alert('お届け日を指定して下さい');
						}else{
							$.calc_delivery("");
						}
						break;
		}
	});
	
	
	/********************************
	*	袋詰
	*/
	// なし
	$(':checkbox[value="no"]', '#package_wrap').change( function(){
		var state = $(this).val();
		if($(this).is(':checked')){
			$(':checkbox[value!="no"]', '#package_wrap').removeAttr('checked');
			$('input[type="number"]', '#package_wrap').val('0').parent('p').fadeOut('slow');
			$('#package_wrap').closest('td').removeClass('pending');
			mypage.getNumberOfBox();	// 箱数を計算
			mypage.calcPrintFee();
		}else{
			if($(':checkbox[name="package"]:checked', '#package_wrap').length==0) $('#package_wrap').closest('td').addClass('pending');
		}
	});
	
	// あり、袋のみ
	$(':checkbox[value!="no"]', '#package_wrap').change( function(){
		var state = $(this).val();
		var volume = 0;
		var len = $(':checkbox[value!="no"]:checked', '#package_wrap').length;
		if(len==1) volume = $('#total_amount').val();
		if($(this).is(':checked')){
			if($(':checkbox[value="no"]', '#package_wrap').is(':checked')) $(':checkbox[value="no"]', '#package_wrap').removeAttr('checked');
			$('#pack_'+state+'_volume').val(volume).parent('p').show();
			$('#package_wrap').closest('td').removeClass('pending');
		}else{
			$('#pack_'+state+'_volume').val('0').parent('p').fadeOut('slow');
			if(len==0){
				$(':checkbox[value="no"]', '#package_wrap').attr('checked', 'checked');
			}else if(len==1){
				$('input[type="number"]:visible', '#package_wrap').val(volume);
			}
		}
		if(state=='yes') mypage.getNumberOfBox();	// 箱数を計算
		mypage.calcPrintFee();
	});
	
	// 袋詰ありと袋なしの対応枚数
	$('input[type="number"]', '#package_wrap').change( function(){
		mypage.calcPrintFee();
	});
	
	
	/********************************
	*	配送方法
	*/
	$(':radio[name="carriage"]', '#schedule_selector').change( function(){
		$('#carriage_name').text($(':radio[name="carriage"]:checked', '#schedule_selector').parent().text());
		var deli = $(this).val();
		if(deli=="accept"){
			$('#handover').show();
			$(':radio[name="deliver"]', '#deliver_wrapper').val(["0"]);
			$('#deliver_wrapper').children('label:last').addClass('pending');
			$('#deliverytime').val(0);
			$('#deliver_wrapper, #deliverytime_wrapper').hide();
			
			if($('#schedule_date4').val()!=""){
				if(mypage.prop.calcbasis==1){
					$('#schedule_date4').val($('#schedule_date3').val());
				}else{
					$('#schedule_date3').val($('#schedule_date4').val());
					mypage.changeSchedule3($('#schedule_date4').val(), true);
				}
			}
		}else{
			$('#handover').val('0').hide();
			$('#deliver_wrapper').show();
			if(mypage.prop.ordertype!='industry'){
				$('#deliverytime').val(0);
			}else{
				$('#deliverytime').val(1);
			}
			if($('#schedule_date4').val()!=""){
				if(mypage.prop.calcbasis==1){
					var dest = $('#destination').val();
					var addDay = 0;
					if( (dest==1 || dest>=40) && (deli=='normal' || deli=='time') ){
						addDay = 2;
					}else{
						addDay = 1;
					}
					var deliDay = mypage.countDate($('#schedule_date3').val(), addDay);
					$('#schedule_date4').val(deliDay);
				}else{
					mypage.prop.schedule_date = $('#schedule_date4').val();
					$.calc_delivery('dest');
					return;
				}
			}
		}
		mypage.calcPrintFee();
	});


	/********************************
	*	納品先都道府県
	*/
	$('#destination').change( function(){
		var sendDay = $('#schedule_date3').val();
		if(sendDay=="") return;
		if(mypage.prop.calcbasis==1){
			var dest = $(this).val();
			var deli = $('#schedule_selector input[name="carriage"]:checked').val();
			var addDay = 0;
			if(deli!='accept'){
				if( (dest==1 || dest>=40) && (deli=='normal' || deli=='time') ){
					addDay = 2;
				}else{
					addDay = 1;
				}
			}
			var deliDay = mypage.countDate(sendDay, addDay);
			$('#schedule_date4').val(deliDay);
		}else{
			mypage.prop.schedule_date = $('#schedule_date4').val();
			$.calc_delivery('dest');
		}
	});
	
	
	/********************************
	*	納品先の数
	*/
	$('#destcount').change( function(){
		mypage.calcEstimation();
	
	});
	
	/********************************
	*	スケジュール内の合計枚数をチェック
	*/
	$('#check_amount').change( function(){
		var check_amount = $(this).val()-0;
		if(check_amount > 100) alert('納期を確認してください！');
		mypage.calcPrintFee();
	});
	
	
	/********************************
	*	同梱チェックの注文一覧ポップアップ
	*/
	$('#show_bundle').click( function(){
		if(!mypage.prop.firmorder){
			$.msgbox('注文が確定していません。');
			return;
		}
		var orders_id = $('#order_id').text()-0;
		mypage.screenOverlay(true);
		$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false, data:{'act':'search', 'mode':'bundlelist', 'field1[]':['orders_id'], 'data1[]':[orders_id]}, 
			success:function(r){
				if(r instanceof Array){
					if(r.length==0){
						$('#bundle_status').hide();
						alert('同梱可能な確定注文はありません。');
						mypage.screenOverlay(false);
					}else{
						var tbl = '<table class="mytable">';
						tbl += '<thead><tr><th></th><th>受注No.</th><th>題名</th><th>枚数</th></thead>';
						tbl += '<tbody>';
						for(var i=0; i<r.length; i++){
							tbl += '<tr>';
							tbl += '<td><input type="checkbox" value="'+r[i]['orders_id']+'" class="check_bundle"';
							if(r[i]['bundle']==1){
								tbl += ' checked="checked"';
							}
							tbl += '></td>';
							tbl += '<td>'+r[i]['orders_id']+'</td>';
							tbl += '<td>'+r[i]['maintitle']+'</td>';
							tbl += '<td>'+r[i]['order_amount']+'</td>';
							tbl += '</tr>';
						}
						tbl += '</tbody></table>';
						$('#bundle_list').html(tbl);
						var offsetY = $(document).scrollTop()+200;
						$('#bundle_wrapper').css({'top':offsetY+'px'}).fadeIn();
					}
				}else{
					mypage.screenOverlay(false);
					alert('Error: p2495\n'+r);
				}
			},error: function(XMLHttpRequest, textStatus, errorThrown) {
				$.screenOverlay(false);
				alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
			}
			
		});
	});
	
	/* ヤマト便の配送日数表をポップアップ */
	$('#ans_delivery').click( function(){
		var args = '';
		args += '<table class="mytable"><caption>ヤマト便　要注意地域</caption>';
		args += '<thead><tr><th colspan="3">3日以上かかる地域</th></thead>';
		args += '<tbody>';
		args += '<tr><td>北海道</td><td>利尻郡</td><td>3日</td></tr>';
		args += '<tr><td>東京都伊豆諸島</td><td>青ヶ島村</td><td>3日<br><p class="note"><span>※</span>時間指定不可</p></td></tr>';
		args += '<tr><td>東京都小笠原諸島</td><td>小笠原村</td><td>3日"訓1日</td></tr>';
		args += '<tr><td>長崎県</td><td>対馬市</td><td>3日</td></tr>';
		args += '<tr><td rowspan="3">鹿児島県</td><td>奄美市</td><td>3日</td></tr>';
		args += '<tr><td>大島郡</td><td>3日から5日<br><p class="note"><span>※</span>町によって細かく異なるので要確認</p></td></tr>';
		args += '<tr><td>鹿児島郡</td><td>5日</td></tr>';
		args += '<tr><td rowspan="3">沖縄県</td><td>島尻郡北大東村</td><td>3日"訓1日<br><p class="note"><span>※</span>時間指定不可</p></td></tr>';
		args += '<tr><td>島尻郡南大東村</td><td>3日"訓1日<br><p class="note"><span>※</span>時間指定不可</p></td></tr>';
		args += '<tr><td>八重山郡</td><td>3日</td></tr>';
		args += '</tbody></table>';
		
		args += '<table class="mytable">';
		args += '<thead><tr><th colspan="2">1日で到着するが時間指定不可な地域</th></thead>';
		args += '<tbody>';
		args += '<tr><td rowspan="2">兵庫県</td><td>姫路市家島町</td></tr>';
		args += '<tr><td>南あわじ市沼島</td></tr>';
		args += '<tr><td rowspan="2">愛媛県</td><td>今治市旧越智郡関前村</td></tr>';
		args += '<tr><td>松山市旧温泉郡中島町</td></tr>';	
		args += '</tbody></table>';
		
		args += '<table class="mytable">';
		args += '<thead><tr><th colspan="2">2日で到着するが時間指定不可な地域</th></thead>';
		args += '<tbody>';
		args += '<tr><td rowspan="6">東京都伊豆諸島</td><td>神津島村</td></tr>';
		args += '<tr><td>利島村</td></tr>';
		args += '<tr><td>新島村</td></tr>';
		args += '<tr><td>式根島</td></tr>';
		args += '<tr><td>御蔵島村</td></tr>';
		args += '<tr><td>三宅村</td></tr>';
		args += '<tr><td rowspan="2">福岡県</td><td>福岡市西区玄界島</td></tr>';
		args += '<tr><td>宗像市大島</td></tr>';
		args += '<tr><td rowspan="5">長崎県</td><td>西海市崎戸町平島</td></tr>';
		args += '<tr><td>西海市江島</td></tr>';
		args += '<tr><td>長崎市伊王島町</td></tr>';
		args += '<tr><td>長崎市高島町</td></tr>';
		args += '<tr><td>平戸市大島町</td></tr>';
		args += '<tr><td rowspan="5">鹿児島県</td><td>熊毛郡上屋久町口永良部郡</td></tr>';
		args += '<tr><td>薩摩川内市里町</td></tr>';
		args += '<tr><td>薩摩川内市上甑町</td></tr>';
		args += '<tr><td>薩摩川内市下甑町</td></tr>';
		args += '<tr><td>薩摩川内市鹿島町</td></tr>';
		args += '</tbody></table>';
		
		args += '<table class="mytable"><caption>上記以外の地域について</caption>';
		args += '<thead><tr><th colspan="2">2日で到着（時間指定には要制約地域あり）</th></thead>';
		args += '<tbody>';
		args += '<tr><td>北海道</td><td></td></tr>';
		args += '<tr><td>九州</td><td></td></tr>';
		args += '<tr><td>島根県</td><td>隠岐郡</td></tr>';
		args += '<tr><td>東京離島</td><td></td></tr>';
		args += '</tbody></table>';
		
		args += '<table class="mytable">';
		args += '<thead><tr><th>1日で到着だが午前中指定不可</th></thead>';
		args += '<tbody>';
		args += '<tr><td>中国</td></tr>';
		args += '<tr><td>四国</td></tr>';
		args += '</tbody></table>';
		
		$.msgbox(args);
	});
	
	
	/********************************
	*	アイテムカラーの変更
	*/
	$('#item_color').click( function(){
		if(mypage.prop.firmorder) return;	// 確定注文は変更不可
		if($('#category_selector').val()=='0' || $('#category_selector').val()=='99') return;
		mypage.screenOverlay(true);
		var item_id = $('#item_selector').val();
		$.post('./php_libs/dbinfo.php', {'act':'itemcolor', 'item_id':item_id, 'curdate':mypage.prop.firmorderdate}, function(r){
			if(jQuery.trim(r)!=""){
				$('#itemcolor_list').html(r);
				$("#itemcolor_table").tablesorter( {sortList: [[0,0]]} );
				var offsetY = $(document).scrollTop()+200;
				$('#itemcolor_wrapper').css({'top':offsetY+'px'}).fadeIn();
			}else{
				mypage.screenOverlay(false);
			}
		});
	});

	/********************************
	*	注文リスト内のアイテムのカラー変更
	*/
	$('#orderlist .change_itemcolor').live('click', function(){
		if(mypage.prop.firmorder) return;	// 確定注文は変更不可
		mypage.screenOverlay(true);
		var item_id = $(this).parent().siblings(':first').children('.itemid').text();
		var size_id = $(this).attr('id').split('_')[1];			// 変更前の現在表示されているサイズID
		var master_id = $(this).attr('alt');					// 変更前の現在のマスターID
		$.post('./php_libs/dbinfo.php', {'act':'itemcolor', 'master_id':master_id, 'item_id':item_id, 'size_id':size_id, 'curdate':mypage.prop.firmorderdate}, function(r){
			if(jQuery.trim(r)!=""){
				$('#itemcolor_list').html(r);
				$("#itemcolor_table").tablesorter( {sortList: [[0,0]]} );
				var offsetY = $(document).scrollTop()+200;
				$('#itemcolor_wrapper').css({'top':offsetY+'px'}).fadeIn();
			}else{
				mypage.screenOverlay(false);
			}
		});
	});

	/********************************
	*	注文リスト内のアイテムのサイズ変更
	*/
	$('#orderlist .change_size').live('click', function(){
		if(mypage.prop.firmorder) return;	// 確定注文は変更不可
		mypage.screenOverlay(true);
		var item_id = $(this).parent().siblings(':first').children('.itemid').text();
		var size_id = $(this).attr('id').split('_')[1];			// 変更前の現在表示されているサイズID
		var master_id = $(this).attr('alt').split('_')[0];		// 変更前の現在のマスターID
		var color_code = $(this).attr('alt').split('_')[1];
		$.post('./php_libs/dbinfo.php', {'act':'itemsize', 'master_id':master_id, 'item_id':item_id, 'color_code':color_code, 'size_id':size_id, 'curdate':mypage.prop.firmorderdate}, function(r){
			if(jQuery.trim(r)!=""){
				$('#itemsize_list').html(r);
				$("#itemsize_table").tablesorter({headers:{0:{sorter:false}}});
				var offsetY = $(document).scrollTop()+200;
				$('#itemsize_wrapper').css({'top':offsetY+'px'}).fadeIn();
			}else{
				mypage.screenOverlay(false);
			}
		});
	});
	
	/********************************
	*	注文リストのソート
	*	未使用
	$('#sort_orderlist').click( function(){
		var mode = 'size';	//$(this).prev('select').val();
		var isPrint = $('#noprint:checked').length==1? 0: 1;
		$.post('./php_libs/dbinfo.php', {'act':'orderlist', 'sort':mode, 'ordertype':mypage.prop.ordertype, 'isprint':isPrint, 'curdate':mypage.prop.firmorderdate}, function(r){
			if(r=="") return;
			var data = r.split('|');
			$('#orderlist tbody').html(data[0]);
		});
	});
	*/
	
	/********************************
	*	プリントの有無
	*/	
	$('#noprint').change(function(){
		mypage.prop.modified = true;
		if(mypage.prop.ordertype=='industry') return;
		var id = $('#item_selector').val();
		var code = $('#itemcolor_code').val();
		mypage.changeColorcode(id, code);
		var isPrint = $('#noprint:checked').length==1? 0: 1;
		var list = {'act':'orderlist', 'ordertype':mypage.prop.ordertype, 'isprint':isPrint, 'curdate':mypage.prop.firmorderdate};
		var store = mypage.getStorage();
		for(var key in store){
			list[key] = store[key];
		}
		$.ajax({url:'./php_libs/dbinfo.php', type:'POST', dataType:'json', async:false, data:list, 
			success:function(r){
				if(r instanceof Array){
					mypage.setEstimation(r, true);
				}else{
					alert('Error: p2702\n'+r);
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				alert('Error: p2706\n'+textStatus+'\n'+errorThrown);
			}
		});
	});
	
	
	jQuery.extend({
		resetExchink: function(exchink, row){
			
			return;
			
			// 2011-12-30 廃止
			var gall = exchink.children('.gall');
			var w = gall.children('p:first').children('span:first').outerWidth();
			if(row=='all'){
				gall.children('p').each( function(){
					$(this).children('span:gt(0)').remove();
					$.clearExchinkLine($(this).children('span:first'));
					$(this).css('visibility','hidden');
				});
				w += 20; // 20 is margin;
				gall.css({'width': w+'px'});
				exchink.animate({width:'0px', 'overflow-x':'scroll'},{duration:150,queue:false});
				exchink.siblings('.pp_info').animate({width:'210px'},{duration:150,queue:false});
				exchink.prev('.pp_ink').find('.toggle_exchink').val('色替え⇒');
				$('#exchink_count').val(0);
				$('#est_exchink').text(0);
			}else{
				var exch_row = gall.children('p:eq('+row+')');
				exch_row.children('span:gt(0)').remove();
				$.clearExchinkLine(exch_row.children('span:first'));
				exch_row.css('visibility','hidden');
				
				var exch_count = gall.children('p').children('span').find('input[type="text"]').filter( function(){
					return ($(this).val().trim()!='' && $(this).siblings('.exch_vol').val()!='0')? 1: 0;
				}).length;
				if(exch_count==0){
					if(!$('.toggle_exchink').val().match(/たたむ/)){
						exchink.animate({width:'0px', 'overflow-x':'scroll'},{duration:150,queue:false});
						exchink.siblings('.pp_info').animate({width:'210px'},{duration:150,queue:false});
					}
					w += 20; // 20 is margin;
				}else{
					var max_count = 0;
					gall.children('p').each( function(){
						var count = $(this).children('span').length;
						max_count = Math.max(max_count, count);
					});
					w = (w * max_count) + 20; // 20 is margin;
				}
				gall.css({'width': w+'px'});
				mypage.calcExchinkFee();
			}
		},
		clearExchinkLine: function(my){
			
			return;
			
			// 2011-12-30 廃止
			my.children('.exch_vol').val('0');
			my.children('input[type="text"]').attr('readonly', true).val('');
			my.children('img.palette').attr({'src':'./img/circle.png', 'alt':''});
			my.children('img.plus').css({'opacity':'0.5'});
			my.removeAttr('id');
		}
	});
	
	$('#exchink_count').change( function(){
		if(mypage.prop.ordertype=="industry") return;
		var exch_count = $(this).val()-0;
		var exchFee = 1500;
		$('#est_exchink').text(mypage.addFigure( exchFee*exch_count ));
		if(mypage.prop.reuse>0 && mypage.prop.reuse!=255){
			mypage.calcPrintFee();
		}else{
			mypage.calcEstimation();
		}
		mypage.prop.modified = true;
	});

	$('.pp_ink img.palette, .exch_ink img.palette', '#pp_wrapper').live('click', function(){
		// if(mypage.prop.firmorder) return;	// 2015-04-01 確定注文は変更可にする
		if($(this).parent().children('.pos_name').val()!=""){
			var print_type = $(this).closest('.pp_box').find('.print_type').val();
			if(print_type=='silk'){
				mypage.showInkcolor($(this));
			}else if(print_type=='cutting'){
				mypage.showInkcolor($(this), 'cuttingcolor');
			}
		}
	});

	$('.pp_ink .cross', '#pp_wrapper').live('click', function(){
		// if(mypage.prop.firmorder) return;	// 2015-04-01 確定注文は変更可にする
		$(this).prev().attr('readonly', true).val('');
		$(this).prevAll('img').attr({'src':'./img/circle.png', 'alt':''});
		$(this).parent('p').removeAttr('id');
		var index = $(this).parent('p').index()-1;
		mypage.calcPrintFee();
		mypage.prop.modified = true;
	});
	
	$('.toggle_exchink').live('click', function(){
		
		return;
		
		// 2011-12-30 廃止
		var w = '0px';
		var ppInfo = $(this).closest('.pp_ink').prev('.pp_info');
		var exchink = $(this).closest('.pp_ink').next('.exch_ink');
		var exch_count = exchink.children('.gall').children('p').children('span').find('input[type="text"]').filter( function(){
			return ($(this).val().trim()!='' && $(this).siblings('.exch_vol').val()!='0')? 1: 0;
		}).length;
		if(exch_count>0){
			w = '100px';
		}
		var val = $(this).val();
		if(val.match(/たたむ/)){
			exchink.animate({width:w},{duration:150,queue:false});
			ppInfo.animate({width:'210px'},{duration:150,queue:false});
			$(this).val('色替え⇒');
		}else{
			ppInfo.animate({width:'0px', 'overflow-x':'scroll'},{duration:150,queue:false});
			exchink.animate({width:'310px'},{duration:150,queue:false});
			$(this).val('色替えをたたむ');
		}
	});

	$('.exch_ink .cross', '#pp_wrapper').live('click', function(){
		var self = $(this).parent('span');
		var gall = self.closest('.gall');
		var w = self.outerWidth();
		var count = self.siblings().length+1;
		if(count==1){
			$.clearExchinkLine(self);
		}else{
			self.remove();
			var max_count = 0;
			gall.children('p').each( function(){
				var count = $(this).children('span').length;
				max_count = Math.max(max_count, count);
			});
			w = (w * max_count) + 20; // 20 is margin;
			gall.css({'width': w+'px'});
		}
		var exch_count = gall.children('p').children('span').find('input[type="text"]').filter( function(){
			return ($(this).val().trim()!='' && $(this).siblings('.exch_vol').val()!='0')? 1: 0;
		}).length;
		if(exch_count==0 && !$('.toggle_exchink').val().match(/たたむ/)){
			var exchink = gall.parent('.exch_ink');
			exchink.animate({width:'0px', 'overflow-x':'scroll'},{duration:150,queue:false});
			exchink.siblings('.pp_info').animate({width:'210px'},{duration:150,queue:false});
		}
		mypage.calcExchinkFee();
		mypage.prop.modified = true;
	});
	
	$('.exch_ink .plus', '#pp_wrapper').live('click', function(){
		if($(this).css('opacity')!='1') return;
		
		var self = $(this).parent('span');
		var w = self.outerWidth();
		var my_count = self.siblings().length+1;
		var max_count = 0;
		self.closest('.gall').children('p').each( function(){
			var count = $(this).children('span').length;
			max_count = Math.max(max_count, count);
		});
		if(max_count==my_count){
			w = w*(max_count+1) + 20; // 20 is margin;
			$(this).closest('.gall').css({'width': w+'px'});
		}
		$(this).parent().after('<span><input type="number" min="0" value="0" alt="" class="exch_vol" onchange="mypage.calcExchinkFee();" />&nbsp;<img alt="" src="./img/circle.png" width="22" height="22" class="palette" />&nbsp;<input type="text" value="" size="15" readonly="readonly" /><img alt="clear" src="./img/cross.png" width="16" height="16" class="cross" /><img alt="addnew" src="./img/plus.png" width="16" height="16" class="plus" /></span>');
	});


	/* add print positin */
	$('.add_print_position', '#pp_wrapper').live("click", function(){
		// var my = $(this).parent().parent().parent();
		var my = $(this).closest('.pp_box');
		my.before('<div class="pp_box" style="display:none;">'+my.html()+'</div>');
		if($(this).parent().siblings().length==0){
			my.prev().children('.pp_price').prepend('<p><input type="button" value="削除" class="del_print_position" /></p>');
		}
		var newObj = my.prev();
		newObj.children('.pp_image').children('img:gt(0)').each( function(){
			var src = $(this).attr('src');
			if(src.match(/_on.png$/)){
				src = src.replace(/_on.png$/, '.png');
				$(this).attr({'src':src});
			}
		});
		var print_type = my.children('.pp_info').find('.print_type').val();
		var ppInfo = newObj.children('.pp_info');
		ppInfo.find('.print_type').val(print_type);
		ppInfo.find('.ink_count').val(0).attr('max',10);
		ppInfo.find('.note').hide();
		newObj.children('.pp_ink').children('p').each( function(){
			$(this).children('img:eq(0)').attr({'src':'./img/circle.png'});
		});
		newObj.find('.repeat_check').attr('checked',false).change( function(){mypage.calcPrintFee();});
		newObj.fadeIn('slow');
		$('#pp_wrapper :input').change( function(){mypage.prop.modified = true;});
	});

	/* remove print positin */
	$('.del_print_position', '#pp_wrapper').live("click", function(){
		var box = $(this).parents('.pp_box');
		box.fadeOut('normal', function(){
			$(this).remove();
			mypage.calcPrintFee();
			mypage.prop.modified = true;
		});
	});

	/* select print position */
	$('.pp_image img:not(:nth-child(1))', '#pp_wrapper').live('click', function(){
		if(mypage.prop.firmorder) return;	// 確定注文は変更不可
		var position_name = $(this).attr('alt');
		var position_key = $(this).attr('class');
		var ppInk = $(this).parent().siblings('.pp_ink');
		var ppInfo = $(this).parent().siblings('.pp_info');
		var ppName = $(this).parent().siblings('.position_name_wrapper').find('span').text();
		var curr_src = $(this).attr('src');
           var src = '';

		if(curr_src.match(/_on.png$/)){
			src = curr_src.replace(/_on.png$/, '.png');
			$(this).attr('src',src);
			ppInfo.find('.ink_count').val('0').attr('max',10);
			ppInfo.find('.note').hide();
			if(ppName!='fixed'){
				ppInk.children('p').children('.pos_name').each( function(){
					$(this).attr('alt','').next('img').attr({'src':'./img/circle.png'}).siblings('input').attr('readonly', true).val('');
				});
			}
		}else{
			$(this).parent().children('img:not(:nth-child(1))').each(function(){
				var src = $(this).attr('src');
				if(src.match(/_on.png$/)){
					src = src.replace(/_on.png$/, '.png');
					$(this).attr({'src':src});
				}
			});
			src = curr_src.replace(/.png$/, '_on.png');
			$(this).attr('src',src);
			if(ppName!='fixed'){
				ppInk.children('p').children('.pos_name').each( function(){
					$(this).val(position_name);
					$(this).attr('alt',position_key);
				});
				
				if(position_key.match(/hood|parker_mae_pocket/)){
					var ink = ppInfo.find('.ink_count');
					if(ink.val()-0>1){
						ink.val(1);
					}
					ink.attr('max',1);
				}else{
					ppInfo.find('.ink_count').attr('max',10);
				}
			}
		}

		if(mypage.prop.ordertype=='general'){
			mypage.calcPrintFee();
		}
		mypage.prop.modified = true;
	});

	/* reset print position
	$('.position_reset', '#pp_wrapper').live('click', function(){
		if(mypage.prop.firmorder) return;	// 確定注文は変更不可
		$(this).next().children('img:gt(0)').each(function(){
			var src = $(this).attr('src');
			if(src.match(/_on.png$/)){
				src = src.replace(/_on.png$/, '.png');
				$(this).attr({'src':src});
			}
		});
		var ppInfo = $(this).siblings('.pp_info');
		ppInfo.find('.ink_count').val('0').attr('max',10);
		ppInfo.find('.note').hide();
		var ppInk = $(this).siblings('.pp_ink');
		ppInk.children('p').children('.pos_name').each( function(){
			$(this).attr('alt','').next('img').attr({'src':'./img/circle.png'}).siblings('input').attr('readonly', true).val('');
		});
		if(mypage.prop.ordertype=='general'){
			mypage.calcPrintFee();
		}
		mypage.prop.modified = true;
	});
	*/


	/* show list */
	$('.show_list', '#pp_wrapper').live('click', function(){
		if(mypage.prop.firmorder) return;	// 確定注文は変更不可
		mypage.screenOverlay(true);
		mypage.prop.curr_ppImage = $(this).siblings('.pp_image');
		$.post('./php_libs/dbinfo.php', {'act':'printpositionlist', 'curdate':mypage.prop.firmorderdate}, function(r){
			if(jQuery.trim(r)!=""){
				$('#printposition_list').html(r);
				var offsetY = $(document).scrollTop();
				$('#printposition_wrapper').css({'top':offsetY+'px'}).fadeIn();
			}else{
				mypage.prop.curr_ppImage = "";
			}
		});
	});

	
	/* change print position */
	$('.position_name_wrapper .position_name:not(.current)', '#pp_wrapper').live('click', function(){
		if(mypage.prop.firmorder) return;	// 確定注文は変更不可
		$(this).siblings('.current').removeClass('current');
		$(this).addClass('current');
		var ppImage = $(this).parent().siblings('.pp_image');
		var base = $(this).children('span').text();
		var src = ppImage.children('img:first').attr('src');
		var path = src.replace(/img\/printposition/, 'txt');
		path = path.slice(0, path.lastIndexOf('/')+1);
		path += base+'.txt';
		var ppInfo = $(this).parent().siblings('.pp_info');
		ppInfo.find('.ink_count').val('0');
		var ppInk = $(this).parent().siblings('.pp_ink');
		ppInk.children('p').children('.pos_name').each( function(){
			$(this).attr('alt','').next('img').attr({'src':'./img/circle.png'}).siblings('input').attr('readonly', true).val('');
		});
		$(this).parent().siblings('.pp_image').load(path, function(){
			if(mypage.prop.ordertype=='general'){
				mypage.calcPrintFee();
			}
		});
		mypage.prop.modified = true;
	});
	
	
    /* toggle pp_box */
	/*
    $('.pp_toggle_button', '#pp_wrapper').live('click', function(){
   		var src = $(this).attr('src');
   		if(src.indexOf('uparrow')>-1){
   			src = src.replace(/uparrow/, 'downarrow');
   		}else{
   			src = src.replace(/downarrow/, 'uparrow');
   		}
   		$(this).parent().next().slideToggle('slow');
   		$(this).attr({'src':src});
   	});
	*/


    /********************************
	*	printfee calculator
	*/
	$('#show_calculator').click( function(){
		mypage.screenOverlay(true);
		var offsetY = $(document).scrollTop()+200;
		var w = $('#print_calculator').width()/2;
		$('#calc_amount').val('0');
		$('#print_calculator').css({'top':offsetY+'px', 'marginLeft':'-'+w+'px'}).fadeIn();
		$('#calc_amount').focus();
	});

	/* 2011-11-29 廃止
	$('.icon_calculator', '#pp_wrapper').live('click', function(){
		mypage.screenOverlay(true);
		var offsetY = $(document).scrollTop()+200;
		var w = $('#print_calculator').width()/2;
		if($('#print_calculator:hidden').length>0) $('#calc_amount').val($('#total_amount').val());
		$('#print_calculator').css({'top':offsetY+'px', 'marginLeft':'-'+w+'px'}).fadeIn();
		$('#calc_amount').focus();
	});
	*/
   
	$('#calc_printfee').click( function(){
		$('table:eq(0) tbody tr', '#print_calculator').each( function(index){
 				$(this).find('.calc_price').children('span').text('0');
 				$(this).find('.calc_tot_price').children('span').text('0');
 				$(this).find('.calc_print_type').text('');
 			});
		var orders_id = $('#order_id').text()-0;
		var amount = $('#calc_amount').val();
		if(amount=='0') return;
		var ratio = $('#calc_ratio').val();
		var ink_count = "";
		var print_size = "";
		$('.calc_print_position', '#print_calculator').each( function(){
			var pos = $(this).val();
			if(pos!=""){
				ink_count += '&ink[]='+$(this).parent().next().find('.calc_ink_count').val();
				print_size += '&size[]='+$(this).parent().next().next().find('.calc_print_size').val();
			}
		});

		if(ink_count!=""){
			var postStr = 'act=compareprice&orders_id='+orders_id+ink_count+print_size+'&amount='+amount+'&ratio='+ratio;
			postStr += '&repeat='+$('#chkRepeat:checked').length;
			$.ajax({
				url: './php_libs/estimation.php',type: 'POST',dataType: 'text',
				data: postStr,async: true,
 				success: function(r){
				  		var row = 0;
				  		var price = r.split(';');
				  		var position = $('.calc_print_position', '#print_calculator');
				  		$('.calc_print_type', '#print_calculator').each( function(index){
				  				if($(position[index]).val()!=""){
				  					var data = price[row].split('_');

				  				$(this).text(data[0]);
				  				var txtPrice = $(this).parent().next().children().children('span');
				  				switch(data[0]){
				  				case 'silk':
				  					$(this).text('シルク');
				  					txtPrice.text(mypage.addFigure(data[1]));
				  					break;
				  				case 'inkjet':
				  					$(this).text('インクジェット');
				  					txtPrice.text(mypage.addFigure(data[1]));
				  					break;
				  				case 'trans':
				  					$(this).text('カラー転写');
				  					txtPrice.text('');
				  					break;
				  				}
				  				row++;
				  			}
				  		});

				  		$('.calc_tot_price', '#print_calculator').each( function(){
				  			var data = price[row].split('_');
				  			$(this).children('span').text(mypage.addFigure(data[1]));
				  			row++;
				  		});
			  	}
			});
		}
	});

	$('#calc_reset').click( function(){
		$('.calc_print_position', '#print_calculator').val('');
		$('.calc_ink_count', '#print_calculator').val('0');
		$('.calc_print_size', '#print_calculator').val('0');
		$('#chkRepeat').attr('checked', false);
		$('table:eq(0) tbody tr', '#print_calculator').each( function(index){
 				$(this).find('.calc_price').children('span').text('0');
 				$(this).find('.calc_tot_price').children('span').text('0');
 				$(this).find('.calc_print_type').text('');
 			});
	});


	/********************************
	*	原稿（イメ画・入稿方法）
	*/
    $(':radio[name="completionimage"], :radio[name="manuscript"]', '#designtype_table').change( function(){
    	if($(this).val()=="0"){
    		$(this).parent().parent().addClass("pending");
    	}else{
    		$(this).parent().parent().next().removeClass("pending");
    	}
    });


    /* design fee field */
	$('#designcharge').blur( function(){
		mypage.calcPrintFee();
	});


	/********************************
	*	customer information
	*/
	$('#search_customer').click( function(){
		var field = [];
		var data = [];
		var isTarget = false;
		var elem = document.forms.customer_form.elements;
		for (var j=0; j < elem.length; j++) {
			if(elem[j].type=="text"){
				field.push(elem[j].name);
				var tmp = elem[j].value.trim();
				if(tmp!="") isTarget = true;
				if(elem[j].name.match(/^(tel$)|(fax$)|(mobile$)|(zipcode$)/)){
					data.push(tmp.replace(/-/g,""));
				}else{
					data.push(tmp);
				}
			}
		}
		
		if(field.length==0 || !isTarget){
			alert('検索するキーワードを指定してください。');
			return;
		}
		
		$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false, data:{'act':'search', 'mode':'customer', 'field1[]':field, 'data1[]':data}, 
			success:function(r){
				if(r instanceof Array){
					if(r.length==0){
						alert('該当する会員は登録されていません。');
					}else{
						mypage.prop.customer_list = r;
						if(r.length==1){
							mypage.setCustomer(0);
						}else{
							var list = '<table><thead><tr><th>会員番号</th><th>顧客名</th><th>担当</th><th>TEL</th><th>E-Mail</th><th colspan="2">住所</th></tr></thead><tbody>';
							for(i=0; i<r.length; i++){
								list += '<tr onclick="mypage.setCustomer('+i+')">';
								list += '<td>'+r[i]['cstprefix'].toUpperCase()+r[i]['number']+'</td>';
								list += '<td>'+r[i]['customername']+'</td>';
								list += '<td>'+r[i]['company']+'</td>';
								list += '<td>'+r[i]['tel']+'</td>';
								list += '<td>'+r[i]['email']+'</td>';
								list += '<td>'+r[i]['addr1']+'</td>';
								list += '<td style="display:none;">'+i+'</td>';
								list += '</tr>';
							}
							list += '</tbody>';
							
							if((navigator.userAgent).match(/Chrome/i)){
								$('.result_list', '#result_customer_wrapper').css('padding-right','18px').html(list);
							}else{
								$('.result_list', '#result_customer_wrapper').html(list);
							}
							$('#result_customer_wrapper').show('normal');
						}
					}
				}else{
					alert('Error: p2924\n'+r);
				}
			},error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
			}
		});
	});

	$('#modify_customer').click( function(){
		var f = document.forms['customer_form'];
		if($('#update_customer:visible').length==0){
			var wrapper = $('#modify_customer_wrapper');
			wrapper.css('height', wrapper.height());
			var w = $('#customer_form').width();
			var l = 600-w/2;
			if(l<10) l = 10;
			mypage.screenOverlay(true);
			$('#customer_form').css({'z-index':110, 'position':'absolute', 'width':w}).animate({left:l+'px'},{duration:100,queue:false});
			$('#modify_customer').val('元に戻す').next().show();
			$('#customer_form span').show();
			$('#update_customer').show();
			$('#cancel_customer').hide();
			mypage.inputControl(f, true);
		}else{
			var field = ['id'];
			var data = [f.customer_id.value];
			$('#cancel_customer').show();
			$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false, data:{'act':'search', 'mode':'customer', 'field1[]':field, 'data1[]':data}, 
				success:function(r){
					if(r instanceof Array){
						if(r.length==0){
							alert('該当する会員は登録されていません。');
						}else{
							mypage.prop.customer_list = r;
							mypage.setCustomer(0);
						}
					}else{
						alert('Error: p3130\n'+r);
					}
				}
			});
		}
	});

	$('#update_customer').click( function(){
		var f = document.forms['customer_form'];
		if( f.customername.value=="" || (f.tel.value=="" && f.mobile.value=="" && f.email.value=="") ){
			alert("顧客名と連絡先（Tel・E-Mailのいずれか）は必須項目です・");
			return;
		}
		
		var elem = f.elements;
		var field = new Array();
		var data = new Array();
		var val = "";
		var chkField = new Array();
		var chkData = new Array();
		var chk = "";
		for (var j=0; j < elem.length; j++) {
			if((elem[j].type=="text" && elem[j].name!="number") || elem[j].type=="hidden" || elem[j].type=="select-one"){
				// 重複チェック用の項目を取得
				if(elem[j].name.match(/^(company$)|(customername$)|(tel$)|(mobile$)|(email$)/)){
					chk = elem[j].value;
					if(elem[j].name.match(/^(tel$)|(mobile$)/)) chk = chk.replace(/-/g,"");
					chkField.push(elem[j].name);
					chkData.push(chk);
				}
				// 登録用データ
				val = elem[j].value;
				if(elem[j].name.match(/^(tel$)|(fax$)|(mobile$)|(zipcode$)/)) val = val.replace(/-/g,"");
				field.push(elem[j].name);
				data.push(val);
			}
		}
		
		// 登録用データ
		var note = f.customernote.value.trim();
		if(note!=""){
			field.push('customernote');
			data.push(note);
			f.customernote.value = note;
		}
		
		// 受注No.を指定
		var orders_id = $('#order_id').text()-0;
		field.push('orders_id');
		data.push(orders_id);
		
		// 重複のチェック
		var customer_id = f.customer_id.value;
		if(customer_id!=""){
			chkField.push('customer_id');
			chkField.push(customer_id);
		}
		chkField.push('customer');
		chkData.push(true);
		var isSave = true;
		$.ajax({
			url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false, data:{'act':'search', 'mode':'dedupe', 'field1[]':chkField, 'data1[]':chkData},
			success:function(r){
				if(r instanceof Array){
					if(r.length>0){
						isSave = confirm("顧客情報が重複する可能性があります、宜しいですか？\n\n1.ＯＫ：　そのまま保存する。\n2.Cancel：　既存の顧客リストから選ぶ。");
						if(isSave) return;
						
						// 既存の顧客を確認
						mypage.prop.customer_list = r;
						var list = '<table><thead><tr><th>会員番号</th><th>顧客名</th><th>担当</th><th>TEL</th><th>E-Mail</th><th colspan="2">住所</th></tr></thead><tbody>';
						for(i=0; i<r.length; i++){
							list += '<tr onclick="mypage.setCustomer('+i+')">';
							list += '<td>'+r[i]['cstprefix'].toUpperCase()+r[i]['number']+'</td>';
							list += '<td>'+r[i]['customername']+'</td>';
							list += '<td>'+r[i]['company']+'</td>';
							list += '<td>'+r[i]['tel']+'</td>';
							list += '<td>'+r[i]['email']+'</td>';
							list += '<td>'+r[i]['addr0']+r[i]['addr1']+'</td>';
							list += '<td style="display:none;">'+i+'</td>';
							list += '</tr>';
						}
						list += '</tbody>';
						
						if((navigator.userAgent).match(/Chrome/i)){
							$('.result_list', '#result_customer_wrapper').css('padding-right','18px').html(list);
						}else{
							$('.result_list', '#result_customer_wrapper').html(list);
						}
						$('#result_customer_wrapper').show('normal');
					}
				}else{
					alert('Error: p2391\n'+r);
				}
			},error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
			}
		});

		if(!isSave) return;

		if( !confirm('お客様情報を更新します。\nよろしいですか？') ) return;

		$.ajax({url:'./php_libs/ordersinfo.php', async:false, type:'post', dataType:'text', data:{'act':'update','mode':'customer', 'field1[]':field, 'data1[]':data}, 
			success:function(r){
				if(!r.match(/^\d+?$/)){
					alert('Error: 3048\n'+r);
				}
				if(r=='0'){
					alert('更新されていません。');
					$.ajax({url:'./php_libs/ordersinfo.php', async:false, type:'post', dataType:'json', 
						data:{'act':'search', 'mode':'customer', 'field1[]':['id'], 'data1[]':[f.customer_id.value]}, success:function(r){
							mypage.prop.customer_list = r;
							mypage.setCustomer(0);
						}
					});
				}
				if($('#update_customer:visible').length>0){
					$('#customer_form').css({'z-index':0, 'position':'static', 'left':0});
					mypage.screenOverlay(false);
				}
				mypage.displayFor('modify');
			},error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
			}
		});
	});


	$('#cancel_customer').click(function(){
		mypage.prop.modified = true;
		document.forms.customer_form.reset();
		document.forms.customer_form.customer_id.value = '0';
		if(mypage.prop.ordertype!='industry'){
			document.forms.customer_form.cstprefix.value = 'k';
		}else{
			document.forms.customer_form.cstprefix.value = 'g';
		}
		$('#customer_id').text("000000000");
		mypage.displayFor('addnew');
		
		/* 2013-11-02 保存済み受注の顧客データの削除処理を廃止
		var id = $('#order_id').text()-0;
		$.post('./php_libs/ordersinfo.php', {'act':'update','mode':'customer', 'field1[]':['cancel','id'], 'data1[]':[true,id]}, function(r){
			if($('#update_customer:visible').length>0){
				$('#customer_form').css({'z-index':0, 'position':'static', 'left':0});
				mypage.screenOverlay(false);
			}
			document.forms.customer_form.reset();
			$('#customer_id').text('0');
			mypage.displayFor('addnew');
		});
		*/
	});


	/********************************
	*	月締め請求情報入力欄の開閉
	*/
	$('#switch_cyclebill').click(function(){
		$('#cyclebill_wrapper').slideToggle('normal', function(){
			$('#switch_cyclebill').val($('#switch_cyclebill').val()=="開く"? "閉じる": "開く");
		});
	});
	
	
	/********************************
	*	請求区分が都度請求の場合は回収サイクル、締め日、回収日を非表示
	*/
	$('#bill_selector').change(function(){
		if($(this).val()==1){
			$('tbody tr:first th:gt(0), tbody tr:first td:gt(0)','#cyclebill_wrapper').hide();
		}else{
			$('tbody tr:first th:gt(0), tbody tr:first td:gt(0)','#cyclebill_wrapper').show();
		}
	});


	/********************************
	*	delivery address
	*/
	/* set delivery address*/
	$('#deliveryaddr').click( function(){
		var isExist = false;
		var deli = document.forms.delivery_form;
		var cust = document.forms.customer_form;
		var chkField = ["organization","deliaddr0","deliaddr1","deliaddr2","deliaddr3","deliaddr4"];
		var chkData = [];
		/*
		if(cust.company.value!=''){
			chkData.push(cust.company.value);
		}else{
			chkData.push(cust.customername.value);
		}
		*/
		chkData.push(cust.customername.value);
		chkData.push(cust.addr0.value);
		chkData.push(cust.addr1.value);
		chkData.push(cust.addr2.value);
		chkData.push(cust.addr3.value);
		chkData.push(cust.addr4.value);
		chkField.push('delivery');
		chkData.push(true);
		$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false,
			data:{'act':'search', 'mode':'dedupe', 'field1[]':chkField, 'data1[]':chkData},
			success:function(r){
				if(r instanceof Array){
					mypage.prop.delivery_list = r;
					if(r.length>1){
						isReturn = confirm("納品先住所が重複する可能性があります、宜しいですか？\n\n1.ＯＫ：　そのまま登録する。\n2.Cancel：　既存の顧客リストから選ぶ。");
						if(isReturn) return;
						
						// 既存の顧客を確認
						isExist = true;
						var list = '<table><thead><tr><th>ID</th><th>お届け先</th><th>住所</th></tr></thead><tbody>';
						for(i=0; i<r.length; i++){
							list += '<tr onclick="mypage.setDelivery('+i+',\'delivery\')">';
							list += '<td>'+r[i]['id']+'</td>';
							list += '<td>'+r[i]['organization']+'</td>';
							list += '<td>'+r[i]['deliaddr0']+r[i]['deliaddr1']+r[i]['deliaddr2']+'</td>';
							list += '</tr>';
						}
						list += '</tbody>';
						
						$('.result_list', '#result_delivery_wrapper').html(list);
						$('#result_delivery_wrapper').show('normal');
					}else if(r.length==1){
						isExist = true;
						mypage.setDelivery(0, 'delivery');
					}
				}else{
					alert('Error: p3497\n'+r);
				}
			}
		});
		
		if(!isExist){
			$('#zipcode2').val(cust.zipcode.value).focusout();
			$('#deliaddr0').val(cust.addr0.value).focusout();
			$('#deliaddr1').val(cust.addr1.value).focusout();
			$('#deliaddr2').val(cust.addr2.value).focusout();
			$('#deliaddr3').val(cust.addr3.value).focusout();
			$('#deliaddr4').val(cust.addr4.value).focusout();
			deli.delitel.value = cust.tel.value;
			deli.organization.value = cust.customername.value;
			deli.delivery_id.value = "";
			mypage.inputControl(deli, true);
			/*
			if(cust.company.value!=''){
				deli.organization.value = cust.company.value;
			}else{
				deli.organization.value = cust.customername.value;
			}
			*/
		}
		mypage.prop.modified = true;
	});
	
	$('#show_delivery').click( function(){
		var customer_id = document.forms.customer_form.customer_id.value;
		if(customer_id==0 || customer_id==""){
			alert('お届け先の登録はありません。');
			return;
		}
		$.ajax({
			url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false, 
			data:{'act':'search', 'mode':'delivery', 'field1[]':['customer_id'], 'data1[]':[customer_id]},
			success:function(r){
				if(r instanceof Array){
					mypage.prop.delivery_list = r;
					if(r.length>0){
						var list = '<table><thead><tr><th>ID</th><th>お届け先</th><th>郵便番号</th><th>住所</th><th>TEL</th></tr></thead><tbody>';
						for(var i=0; i<r.length; i++){
							list += '<tr onclick="mypage.setDelivery('+i+', \'delivery\')">';
							list += '<td>'+r[i]['id']+'</td>';
							list += '<td>'+r[i]['organization']+'</td>';
							list += '<td>'+r[i]['delizipcode']+'</td>';
							list += '<td>'+r[i]['deliaddr0']+' '+r[i]['deliaddr1']+'</td>';
							list += '<td>'+r[i]['delitel']+'</td>';
							list += '</tr>';
						}
						list += '</tbody>';
						$('.result_list', '#result_delivery_wrapper').html(list);
						$('#result_delivery_wrapper').show('normal');
					}else{
						alert('お届け先の登録はありません。');
						return;
					}
				}else{
					alert('Error: p3496\n'+r);
				}
			},error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
			}
		});
	});
	
	$('#clear_delivery').click( function(){
		mypage.inputControl(document.forms.delivery_form, true);
	});
	
	$('#modify_delivery').click( function(){
		var f = document.forms['delivery_form'];
		mypage.inputControl(f, true);
	});
	
	
	/********************************
	*	発送先
	*/
	$('#shipfromaddr').click( function(){
		var ship = document.forms.shipfrom_form;
		var cust = document.forms.customer_form;
		$('#zipcode3').val(cust.zipcode.value).focusout();
		$('#shipaddr0').val(cust.addr0.value).focusout();
		$('#shipaddr1').val(cust.addr1.value).focusout();
		$('#shipaddr2').val(cust.addr2.value).focusout();
		$('#shipaddr3').val(cust.addr3.value).focusout();
		$('#shipaddr4').val(cust.addr4.value).focusout();
		ship.shiptel.value = cust.tel.value;
		ship.shipfax.value = cust.fax.value;
		ship.shipemail.value = cust.email.value;
		if(cust.company.value!=''){
			ship.shipfromname.value = cust.company.value;
			ship.shipfromruby.value = cust.companyruby.value;
		}else{
			ship.shipfromname.value = cust.customername.value;
			ship.shipfromruby.value = cust.customerruby.value;
		}
		mypage.prop.modified = true;
	});
	
	$('#show_shipfrom').click( function(){
		var customer_id = document.forms.customer_form.customer_id.value;
		if(customer_id==0 || customer_id==""){
			alert('発送元の登録はありません。');
			return;
		}
		$.ajax({
			url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false, 
			data:{'act':'search', 'mode':'shipfrom', 'field1[]':['customer_id'], 'data1[]':[customer_id]},
			success:function(r){
				if(r instanceof Array){
					mypage.prop.shipfrom_list = r;
					if(r.length>0){
						var list = '<table><thead><tr><th>発送元</th><th>郵便番号</th><th>住所</th><th>TEL</th></tr></thead><tbody>';
						for(var i=0; i<r.length; i++){
							list += '<tr onclick="mypage.setDelivery('+i+', \'shipfrom\')">';
							list += '<td>'+r[i]['shipfromname']+'</td>';
							list += '<td>'+r[i]['shipzipcode']+'</td>';
							list += '<td>'+r[i]['shipaddr0']+' '+r[i]['shipaddr1']+'</td>';
							list += '<td>'+r[i]['shiptel']+'</td>';
							list += '</tr>';
						}
						list += '</tbody>';
						$('.result_list', '#result_shipfrom_wrapper').html(list);
						$('#result_shipfrom_wrapper').show('normal');
					}else{
						alert('発送元の登録はありません。');
						return;
					}
				}else{
					alert('Error: p3560\n'+r);
				}
			},error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
			}
		});
	});


	/********************************
	*	check options　一般のみ
	*/
   
   /* 割引、送料無料 */
	$('#freeshipping').change( function(){
		mypage.calcPrintFee();
	});
	$('#discount_table :checkbox').change( function(){
		mypage.calcPrintFee();
		if($(this).is(':checked')){
			$(this).parent().addClass('fontred');
		}else{
			$(this).parent().removeClass('fontred');
		}
	});
	$('#discount_table :radio').change( function(){
		mypage.calcPrintFee();
		var group = $(this).attr('name');
		$('#discount_table :radio[name="'+group+'"]').each( function(){
			$(this).parent().removeClass('fontred');
		});
		$(this).parent().addClass('fontred');
	});
	
	/* 割引のリセット */
	$('#reset_discount').click( function(){
		$(':input', '#discount_table').removeAttr('checked');
		$('#extradiscountname').val('');
		mypage.calcPrintFee();
		$('#discount_table').find('label').removeClass('fontred');
	});
	
	/* 社員割引 */
	$('#staffdiscount').click( function(){
		
		if($(this).is(':checked')){
			$(':input:not(#staffdiscount)', '#discount_table').removeAttr('checked').attr('disabled','disabled');
			$('#extradiscountname').val('');
			$('#discount_table').find('label').removeClass('fontred');
			$(this).parent().addClass('fontred');
		}else{
			$(this).parent().removeClass('fontred');
			$(':input:not(#staffdiscount)', '#discount_table').removeAttr('disabled');
		}
		mypage.calcPrintFee();
	});
	
	/* 割引の手入力 */
	$('#free_discount').change( function(){
		if($(this).attr('checked')){
			$('#discountfee').removeAttr('readonly').removeClass('readonly');
		}else{
			$('#discountfee').attr('readonly','readonly').addClass('readonly');
			mypage.calcPrintFee();
		}
	});
	
	
	/* 値引、割引手入力、追加料金 */
	$('#reductionprice, #discountfee, #additionalfee').blur( function(){
		mypage.calcPrintFee();
	});

	/* payment */
	$('#optprice_table input[name="payment"]').change( function(){
		if($(this).val()=="0"){
			$(this).parent().addClass('pending');
		}else{
			$(this).closest("td").find('.pending').removeClass('pending');
		}
		mypage.calcPrintFee();
	});
	$('#payment_other').focusin( function(){
		$('#optprice_table input[name="payment"]').val(['other']);
	});
	

	/* deliver */
	$('#optprice_table input[name="deliver"]').change( function(){
		if($(this).val()=="0"){
			$(this).parent().addClass('pending');
		}else{
			$(this).parent().siblings('label:last').removeClass('pending');
		}
		if($(this).val()=="2"){		// ヤマト運輸
			$('#deliverytime_wrapper').show();
			if(mypage.prop.ordertype!='industry'){
				$('#deliverytime').val(0);
			}else{
				$('#deliverytime').val(1);
			}
		}else{
			$('#deliverytime').val(0);
			$('#deliverytime_wrapper').hide();
		}
		mypage.calcPrintFee();
	});


	/********************************
	*	questionnaire　一般のみ
	*/
	$('.purpose_text', '#questionnaire_table').focus(function(){
		if($(this).is('.other_1')){
			$(':radio[name="purpose"]','#questionnaire_table').val(["その他イベント"]);
		}else if($(this).is('.other_2')){
			$(':radio[name="purpose"]','#questionnaire_table').val(["その他ユニフォーム"]);
		}else if($(this).is('.other_3')){
			$(':radio[name="purpose"]','#questionnaire_table').val(["その他団体"]);
		}
	});


	/********************************
	*	comment
	*/
	$('#order_comment').change( function(){
		if($(this).val().trim()==""){
			$('#alert_comment').fadeOut();
		}else{
			$("#alert_comment:hidden").effect('pulsate',{'times':4},250);
		}
	});



/***************************************************************************************************************************
*
*	confirmation page module
*
****************************************************************************************************************************/

	/********************************
	*	order confirmation and update list
	*/

	/* 2011-10-19 確認タブの廃止
	$('input[name="confirm"]', '#confirm_list').change(function(){
		if($(this).val()=="yes"){
			var orders_id = $('#order_id').text()-0;
			var dt = new Date();
		    var orderdate = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
		    if( !mypage.confirm() ){
		    	alert('必須項目の登録を確認して下さい。');
		    	$('input[name="confirm"]', '#confirm_list').val(['no']);
		    	return;
		    }
		    orderdate = prompt("注文を確定させます宜しいですか。\nよろしければ確定日を指定して下さい。",orderdate);
			if(!orderdate){
				$('input[name="confirm"]', '#confirm_list').val(['no']);
				return;
			}else{
				var val = orderdate.trim().replace(/[０-９]/g, function(m){
		    				var a = "０１２３４５６７８９";
			    			var r = a.indexOf(m);
			    			return r==-1? m: r;
			    		});
				val = val.replace(/\//g,'-');
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
					orderdate = yy+'-'+mm+'-'+dd;
				}else{
					orderdate = "";
				}
			}
			if(orderdate==""){
				alert('日付を確認して下さい。');
				$('input[name="confirm"]', '#confirm_list').val(['no']);
				return;
			}

			// 受注確定処理、製作指示書の登録まで
			$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'update','mode':'acceptstatus',
				'field1[]':['orders_id','confirmhash','acceptingorder','repeat','ordertype'],
				'data1[]':[orders_id, "", orderdate, mypage.prop.repeat, mypage.prop.ordertype]}, async: false,
 				success: function(r){
 					if(!r.match(/^\d+?$/)){
 						alert('Error: p2358\n'+r);
 						$('input[name="confirm"]', '#confirm_list').val(['no']);
 					}else{
 						$('input[name="phase"], label', '#phase_wrapper').hide();
						$('#order_completed').show();
 					}
 				}
 			});
		}
	});
	*/

	/********************************
	*	back to order
	*/
	// $('#back_order_button').click( function(){ $('#tab_order').click(); } );



/***************************************************************************************************************************
*
*	direction page module
*
****************************************************************************************************************************/

	/********************************
	*	tabs
	*/
	$mytab = $('#tabs').tabs({
		tabTemplate: '<li><a href="#{href}">#{label}</a></li>'
	});


	/********************************
	*	edge
	*/
	$('#edge').change( function(){
		if($(this).val()==6){
			$('.edgecolor_wrap').show();
		}else{
			$('.edgecolor_wrap').hide();
		}
	});
   

	/********************************
	*	面付け
	*/
	$('#add_cutpattern').click( function(){
		var tr = '<tr>';
		tr += '<td><input type="text" value="" class="shotname" /></td>';
		tr += '<td><input type="text" value="0" class="shot" class="forNum" /> 面 × <input type="text" value="0" class="sheets" class="forNum" /> シート</td>';
		tr += '<td><input type="button" value="削除" class="del_cutpattern" /></td>';
		tr += '</tr>';
		$('#dire_option_table tbody').append(tr);
	});
	$('.del_cutpattern', '#dire_option_table tbody').live('click', function(){
		$(this).closest('tr').remove();
	});
   
   
	/********************************
	*	footer button
	*/
	$('#direciton_footer .button_centerarea img[alt="orderform"]').click(function(){
		var show = function(){
			var mixture = '';			// 混合プリントのイニシャル
			var cnt = 0;				// プリント種類の数
			var tmp = [];
			var phash = {
						 'silk':{'index':0,'abbr':'S'},
						 'inkjet':{'index':1,'abbr':'I'},
						 'digit':{'index':2,'abbr':'D'},
						 'trans':{'index':3,'abbr':'T'},
						 'cutting':{'index':4,'abbr':'C'}
					};
			$('#direction_selector select option').each( function(){
				var printkey = $(this).val();
				tmp[cnt++] = phash[printkey];
			});
			if(cnt>1){
				tmp.sort(function(a,b){
					return a['index']-b['index'];
				});
				for(var i=0; i<tmp.length; i++){
					mixture += tmp[i]['abbr'];
				}
			}
			
			var order_id = $('#order_id').text()-0;
			
			//$('#printform').remove();
	           //$('#printform_wrapper').html('<iframe id="printform" name="printform"></iframe>');
			
			var url = './documents/acceptingorderform.php?orderid='+order_id+'&printkey='+$('#direction_selector select').val()+'&mixture='+mixture;
			
			window.open(url, 'printform');
			$('#printform').load(function(){window.frames['printform'].print();});
			
		   
			//$('#printform').load(function(){window.frames['printform'].print();return false;});
			//window.open(url);
		};
		
		if(mypage.prop.modified){
			$.confbox('変更内容を保存しますか？', function(){
				if($.resConf.data=='yes'){
					var isReturn = true;
					if(!$('#tab_order').hasClass('headertabs')){
						isReturn = mypage.save('order');
					}else if(!$('#tab_direction').hasClass('headertabs')){
						isReturn = mypage.save('direction');
					}
					if(!isReturn){
						alert('処理を中止します。');
					}else{
						show();
					}
				}else{
					return;
				}
			}, true);
		}else if($('#order_id').text()-0==0){
			alert('受注データが未登録です。');
		}else{
			show();
		}
	});


/***************************************************************************************************************************
*
*	tool box
*
****************************************************************************************************************************/

	/********************************
	*	popup the tool box
	*/
	$('#btn_tool').click(function(){
		var isReturn = true;
		if($('#order_id').text()-0==0){
			alert('受注データが未登録です。');
			return;
		}else{
			if(!$('#tab_order').hasClass('headertabs')){
				isReturn = mypage.save('order');
			}else if(!$('#tab_direction').hasClass('headertabs')){
				isReturn = mypage.save('direction');
			}
			if(!isReturn){
				alert('処理を中止します。');
				return;
			}
		}
		
		// 注文が未確定の場合ボタンを無効にする
		var isFirmorder = ' disabled="disabled" ';
		if(mypage.prop.firmorder){
			isFirmorder = ' ';
		}
		
		var toolbox = '<div id="tool_inner">';
		toolbox +='			<h2>TOOL BOX</h2>';
		toolbox +='			<div class="clearfix">';
		toolbox +='				<div class="leftside">';
		toolbox +='					<h3>印刷<span>Print</span></h3>';
		toolbox +='					<div>';
		toolbox +='						<input type="button" value="見積書" alt="print_estimation" />';
		toolbox +='						<input type="button" value="請求書" alt="print_bill"'+isFirmorder+' />';
		toolbox +='						<input type="button" value="納品書" alt="print_delivery"'+isFirmorder+' />';
		//toolbox +='						<input type="button" value="入荷票" alt="print_stock"'+isFirmorder+' />';
		toolbox +='					</div>';
		toolbox +='					<div>';
		toolbox +='						<p><label><input type="checkbox" value="1" class="bundle">同梱注文を合算（請求・納品書）</label></p>';
		toolbox +='					</div>';
		toolbox +='					<div style="display:none;">';
		toolbox +='						<input type="button" value="トムス発注書" disabled="disabled" alt="toms_edi" />';
		toolbox +='					</div>';
		
		toolbox +='					<div class="alt_address_wrap">';
		toolbox += '					<p><label><input type="checkbox" class="alt_address">違う宛名で印刷する</label></p>';
		toolbox +='						<table style="display:none;"><tbody>';
		toolbox +='						<tr><th>宛名</th><td><input type="text" value="" class="tool_alt_name"></td></tr>';
		toolbox +='						<tr><th>〒</th><td><input type="text" value="" class="tool_alt_zipcode"></td></tr>';
		toolbox +='						<tr><th>住所</th><td><textarea class="tool_alt_address"></textarea></td></tr>';
		toolbox +='						</tbody></table>';
		toolbox +='					</div>';
		
		toolbox +='					<div class="sender_address_wrap">';
		toolbox += '					<p><label><input type="checkbox" class="sender_address">別の差出人で印刷する</label></p>';
		toolbox +='						<table style="display:none;"><tbody>';
		toolbox +='						<tr><th>会社名</th><td><input type="text" value="" class="tool_sender_name"></td></tr>';
		toolbox +='						<tr><th>〒</th><td><input type="text" value="" class="tool_sender_zipcode"></td></tr>';
		toolbox +='						<tr><th>住所</th><td><textarea class="tool_sender_address"></textarea></td></tr>';
		toolbox +='						<tr><th>TEL</th><td><input type="text" value="" class="tool_sender_tel"></td></tr>';
		toolbox +='						<tr><th>FAX</th><td><input type="text" value="" class="tool_sender_fax"></td></tr>';
		toolbox +='						<tr><th>E-mail</th><td><input type="text" value="" class="tool_sender_email"></td></tr>';
		toolbox +='						<tr><th>担当者</th><td><input type="text" value="" class="tool_sender_staff"></td></tr>';
		toolbox +='						</tbody></table>';
		toolbox +='					</div>';
		
		toolbox +='				</div>';
		toolbox +='				<div class="rightside">';
		toolbox +='					<h3>メール<span>E-mail</span></h3>';
		toolbox +='					<div>';
		toolbox +='						<input type="button" value="お見積" alt="mail_estimation" />';
		toolbox +='					</div>';
		toolbox +='					<div>';
		toolbox +='						<p>注文確定</p>';
		toolbox +='						<p><input type="button" value="注文・振込" alt="mail_orderbank"'+isFirmorder+' /></p>';
		toolbox +='						<p><input type="button" value="注文・代引" alt="mail_ordercod"'+isFirmorder+' /></p>';
		toolbox +='						<p><input type="button" value="注文・現金" alt="mail_ordercash"'+isFirmorder+' /></p>';
		toolbox +='						<p><input type="button" value="注文・カード" alt="mail_ordercredit"'+isFirmorder+' /></p>';
		toolbox +='						<p><input type="button" value="注文・コンビニ" alt="mail_orderconbi"'+isFirmorder+' /></p>';
//		toolbox += '					<p><label><input type="checkbox" value="1" id="notRegistForTLA">TLAメンバーに登録しない</label></p>';
		toolbox +='					</div>';
		toolbox +='				</div>';
		toolbox +='			</div>';
		toolbox +='			<input class="closeModalBox" type="hidden" name="customCloseButton" value="" />';
		toolbox +='		</div>';
	
		jQuery.fn.modalBox({
			directCall : {
				data : toolbox
			},
			setWidthOfModalLayer : 507,
			positionTop : 100,
			killModalboxWithCloseButtonOnly : false
		});
	});
	
	
	// 別の宛先の入力フォームの表示切替
	$('.leftside .alt_address','#modalBox').live('click', function(){
		if($(this).attr('checked')){
			$(this).closest('p').next().show();
		}else{
			$(this).closest('p').next().hide();
			$('#tool_inner .leftside .alt_address_wrap input').val('');
		}
	});
	
	
	// 別の差出人の入力フォームの表示切替
	$('.leftside .sender_address','#modalBox').live('click', function(){
		if($(this).attr('checked')){
			$(this).closest('p').next().show();
		}else{
			$(this).closest('p').next().hide();
			$('#tool_inner .leftside .sender_address_wrap input').val('');
		}
	});
	
	
	
	$('input[type="button"]','#modalBox').live('click', function(){
		var url = '';
		var doctype = '';	// 納品書(delivery)と請求書(bill)のどちらか
		var parm = [];		// メール送信モジュールに渡すデータ配列
		var myname = $(this).attr('alt');
		var orders_id = $('#order_id').text()-0;
		var discountfee = $('#est_discount').text().replace(/,/g, '') - 0;
		var discount_name = [];		// 一般の時のみ割引項目
		var alt_addr = '';
		var sender_addr = '';
		var bundle = false;
		
		if(discountfee!=0 && mypage.prop.ordertype=="general"){
			// 学生
			var discount = $('input[name="discount1"]:checked', '#optprice_table').val();
			switch(discount){
				case 'student':discount_name.push('学割');break;
				case 'team2':discount_name.push('2クラス割');break;
				case 'team3':discount_name.push('3クラス割');break;
			}
			// 一般
			discount = $('input[name="discount2"]:checked', '#optprice_table').val();
			switch(discount){
				case 'repeat':discount_name.push('リピーター割');break;
				case 'introduce':discount_name.push('紹介割');break;
				case 'vip':discount_name.push('VIP割');break;
			}
			// 複数可
			$('input[name="discount"]:checked', '#discount_table').each( function(){
				if($(this).val()=='blog'){
					discount_name.push('ブログ割');
				}else if($(this).val()=='quick'){
					discount_name.push('早割');
				}else if($(this).val()=='illust'){
					discount_name.push('イラレ割');
				}
			});
			// その他割引
			if($('input[name="extradiscount"]:checked', '#discount_table').length){
				discount_name.push($('#extradiscountname').val());
			}
		}
		discount_name = discount_name.join(', ');
		
		// 同梱注文を合算する場合
		if($('.bundle','#modalBox').attr('checked')){
			bundle = true;
		}
		
		// 別の宛名を使用する場合
		if($('.alt_address','#modalBox').attr('checked')){
			alt_addr = '&altname='+encodeURIComponent($('.tool_alt_name','#modalBox').val());
			alt_addr += '&altzipcode='+encodeURIComponent($('.tool_alt_zipcode','#modalBox').val());
			alt_addr += '&altaddress='+encodeURIComponent($('.tool_alt_address','#modalBox').val());
		}
		
		// 別の差出人を使用する場合
		if($('.sender_address','#modalBox').attr('checked')){
			sender_addr = '&sendername='+encodeURIComponent($('.tool_sender_name','#modalBox').val());
			sender_addr += '&senderzipcode='+encodeURIComponent($('.tool_sender_zipcode','#modalBox').val());
			sender_addr += '&senderaddress='+encodeURIComponent($('.tool_sender_address','#modalBox').val());
			sender_addr += '&sendertel='+encodeURIComponent($('.tool_sender_tel','#modalBox').val());
			sender_addr += '&senderfax='+encodeURIComponent($('.tool_sender_fax','#modalBox').val());
			sender_addr += '&senderemail='+encodeURIComponent($('.tool_sender_email','#modalBox').val());
			sender_addr += '&senderstaff='+encodeURIComponent($('.tool_sender_staff','#modalBox').val());
		}
		
		switch(myname){
		case 'print_estimation':	// 見積書
			$('.closeModalBox', '#modalBox').click();
			if($("#est_total_price").text()==0){
				alert("お見積がありません。");
				break;
			}
			
			//$('#printform').remove();
			//$('#printform_wrapper').html('<iframe id="printform" name="printform"></iframe>');
			url = './documents/estimatesheet.php?orderid='+orders_id+'&param='+encodeURIComponent(discount_name)+alt_addr+sender_addr;
			window.open(url,'printform');
			$('#printform').load(function(){window.frames['printform'].print();});
			
			//window.open(url);
			break;
			
		case 'print_bill':			// 請求書
		$.ajax({url: './php_libs/ordersinfo.php', type: 'POST', async: false,
			data: {'act':'update','mode':'progressstatus','field1[]':['orders_id','bill_state'],'data1[]':[orders_id,2]},
				success: function(r){
					if(!r.match(/^\d+?$/)) alert('Error: p4164\n'+r);
					
					$('.closeModalBox', '#modalBox').click();
					
              		//$('#printform').remove();
	                //$('#printform_wrapper').html('<iframe id="printform" name="printform"></iframe>');
	                
	                if(bundle){
	                	url = './documents/bill_bundle.php?orderid='+orders_id+'&param='+encodeURIComponent(discount_name)+alt_addr+sender_addr;
	                }else{
	                	url = './documents/bill.php?orderid='+orders_id+'&param='+encodeURIComponent(discount_name)+alt_addr+sender_addr;
	                }
	                window.open(url,'printform');
	                $('#printform').load(function(){window.frames['printform'].print();});
	                
	                //window.open(url);
				}
			});
			break;
			
		case 'print_delivery':		// 納品書
			$('.closeModalBox', '#modalBox').click();
			
				//$('#printform').remove();
				//$('#printform_wrapper').html('<iframe id="printform" name="printform"></iframe>');
				
				if(bundle){
					url = './documents/invoice_bundle.php?orderid='+orders_id+'&param='+encodeURIComponent(discount_name)+alt_addr+sender_addr;
				}else{
					url = './documents/invoice.php?orderid='+orders_id+'&param='+encodeURIComponent(discount_name)+alt_addr+sender_addr;
				}
				window.open(url,'printform');
				$('#printform').load(function(){window.frames['printform'].print();});
				
				//window.open(url);
				
			break;
			
		case 'print_stock':		// 入荷票
			doctype = myname.split('_')[1];
			$('.closeModalBox', '#modalBox').click();
			
               //$('#printform').remove();
               //$('#printform_wrapper').html('<iframe id="printform" name="printform"></iframe>');
               
               url = './documents/checkarrival.php?sheet_type=label&id='+orders_id;
               window.open(url,'printform');
               $('#printform').load(function(){window.frames['printform'].print();});
               
               //window.open(url);
               
			break;

		case 'print_direction':		// 製作指示書
			
			break;

		case 'mail_estimation':		// お見積
		case 'mail_orderbank':		// 注文確定　振込
		case 'mail_ordercod':		// 注文確定　代引
		case 'mail_ordercash':		// 注文確定　現金引取
		case 'mail_ordercredit':	// 注文確定　カード決済
		case 'mail_orderconbi':	// 注文確定　コンビニ決済
			$('.closeModalBox', '#modalBox').click();
			if(document.forms.customer_form.email.value==""){
				alert("メールアドレスの登録がありません。");
				break;
			}
			if(mypage.prop.ordertype=='industry'){
				if($('#total_estimate_cost').text()=="0"){
					alert("お見積内容がありません。");
					break;
				}
			}else{
				if($('#est_total_price').text()=="0"){
					alert("お見積内容がありません。");
					break;
				}
			}
			
			//$(document).scrollTop(0);
			var act = myname.split('_')[1];
			var isRegistForTLA = 0;
			if($('#notRegistForTLA').is(':checked')){
				isRegistForTLA = 1;	// TLAメンバー登録なし
			}
			parm = new Array(isRegistForTLA, orders_id, discount_name);
			mypage.sendmail(act, parm);
			break;
			
		case 'mail_test':		// メールテスト
			$(document).scrollTop(0);
			if(document.forms.customer_form.email.value==""){
				alert("メールアドレスの登録がありません。");
				break;
			}
			if(mypage.prop.ordertype=='industry'){
				if($('#total_estimate_cost').val()=="0"){
					alert("お見積内容がありません。");
					break;
				}
			}else{
				if($('#est_total_price').val()=="0"){
					alert("お見積内容がありません。");
					break;
				}
			}


			var act = myname.split('_')[1];
			parm = new Array(orders_id, discount_name);

			$('.closeModalBox', '#modalBox').click();

			mypage.sendmail(act, parm);
			break;

		case 'mail_shipped':		// 発送しました
			/*
			var enquiry_num = prompt('お問合せ番号',"");
			if(enquiry_num===null){	// cancel
				alert('発送通知メールの送信を中止します。');
				$('.closeModalBox', '#modalBox').click();
				return;
			}

			enquiry_num = enquiry_num.trim();
			parm = new Array(orders_id, discount_name, enquiry_num);
			
			$('.closeModalBox', '#modalBox').click();
			mypage.sendmail('shipped', orders_id);
			*/
			break;

		case 'toms_edi':			// トムス発注書
		/*
		*	2011/04/28 現在　機能保留
		
			$.ajax({url: './php_libs/dbinfo.php', type: 'POST', async: false,
				data: {'act':'itemsByToms','orders_id':orders_id}, success: function(r){
					r = r.trim();
					if(!r.match(/^\d/)){
						alert('Error: p2742\n'+r);
						return;
					}
					var data = r.split('|');
					if(data[0]==0){
						alert('受注番号 '+orders_id+' にトムスの商品はありません。');
					}else{
						var msg = "トムスの発注書をダウンロードします。\nよろしいですか？";
						if(data[1]==""){
							msg = "発注担当者が指定されていません。\n\n" + msg;
						}else{
							msg = "【発注担当："+data[1]+"】\n\n" + msg;
						}
						if(confirm(msg)){
							location.href = './php_libs/toms_ediform.php?orders_id='+orders_id;
						}
				    }
				}
			});

			$('.closeModalBox', '#modalBox').click();
			*/
		   
			break;

		}

	});
	
   
	/********************************
	*	print confirm page
	* 
	*	2011-10-19 確認タブの廃止
	*
	$('#confirm_footer form img').click(function(){
		var act = $(this).attr('alt');
		if(act=="orderconfirm"){
			var tmp = "";
			var html = '<h1>タカハマライフアート　受注管理システム</h1>';
			html += '<p>受注担当：'+$('#reception option:selected').text()+'</p>';
			var created = $('#created').text().replace(/(\/)|(-)/g,'');
			var orders_id = $('#order_id').text();
			var mydir = created + orders_id;
			var pinfoid = 0;

			$('#confirm_wrapper .maincontents .phase_box:lt(10)').each(function(index){
				if(index==0){		// メッセージを除く
					html += '<div class="phase_box"><div class="inner">'+$('.confirmtitle').next().html()+'</div></div>';
				}else if(index==3){		// プリント位置
					html += '<div class="phase_box">';
					html += '	<div class="inner">';
					html += '		<table class="confirm_table" style="border-collapse: collapse;">';
					html += '			<thead>';
					html += '				<tr>';
					html += '					<th colspan="4">プリント位置</th>';
					html += '				</tr>';
					html += '			</thead>';
					html += '			<tbody id="confirm_printposition">';

					$('#confirm_printposition > tr').each(function(){
						if($(this).hasClass('body')){
							pinfoid++;
							var imagefile = [];
							var top = [];
							var left = [];
							var width = [];
							$(this).children('td:first').find('img').each(function(){
								if($(this).css('display')!="none"){
									imagefile.push($(this).attr('src').slice(2));
									tmp = $(this).css('top');
									if(tmp!="auto"){
										top.push(tmp.substr(0, tmp.length-2));
									}else{
										top.push('0');
									}

									tmp = $(this).css('left');
									if(tmp!="auto"){
										left.push((tmp.substr(0, tmp.length-2)-0)-5);
									}else{
										left.push('0');
									}

									width.push($(this).attr('width'));
								}
							});

							var compo_path;		// 合成されたプリント位置画像へのパス
							$.ajax({ url: './php_libs/compo.php', type: 'POST', dataType: 'text',
								data: {'mydir':mydir,'pinfoid':pinfoid+'conf','imagefile[]':imagefile,'top[]':top,'left[]':left,'width[]':width}, async: false
								,success: function(r){ compo_path = r; }
							});

							html += '<tr class="body"><td style="text-align:center;border:1px solid #333"><img src="..'+compo_path+'" width="70" /></td>';
							html += '<td style="border:1px solid #333">'+$(this).children('td:eq(1)').html()+'</td>';
							html += '<td style="border:1px solid #333">'+$(this).children('td:eq(2)').html()+'</td>';

						}else if(!$(this).hasClass('separate')){
							html += '<tr class="'+$(this).attr('class')+'">'+$(this).html()+'</tr>';
						}
					});
					html += '</tbody></table></div></div>';

				}else if(index==4){		// インク色替え
					html += '<div class="phase_box">'+$(this).html().replace(/<span(.*?)\/span>/i,'')+'</div>';

				}else if(index==9){		// コメント
					html += '<div class="phase_box"><div class="inner">';
					html += '<table class="confirm_table"><thead><tr><th class="last">コメント</th></tr></thead>';
					html += '<tbody><tr><td class="last">'+$('#conf_comment').val().replace(/\r\n|\n/g,'<br />')+'</td></tr></tbody></table></div></div>';

				}else{
					html += '<div class="phase_box">'+$(this).html()+'</div>';
				}
			});

			var f = $(this).parent().get(0);
			f.doctype.value = act;
			f.orderid.value = orders_id-0;
			f.param.value = html;
			f.page_format.value = 'A4';
			f.page_fontsize.value = 8;
			f.mode.value = "";
			f.submit();

		}
	});
	
	*/
	
	

/***************************************************************************************************************************
*
*	initialization
*
****************************************************************************************************************************/

	/********************************
	*	業者の見積明細の摘要でオートコンプリート
	*/
	$( "#orderlist tfoot tr.estimate .summary" ).autocomplete({
		source: $.availableTags.summary,
		autoFocus: true,
		delay: 0,
		close: function( event, ui ) {
			var code = $(this).val().slice(0,3);
			var cost = $.availableTags.cost[code];
			var amount = $(this).closest('tr').find('.amount').val().replace(/,/g, '');
			var v = 0;
			if(typeof cost=='undefined') return;
			
			if(amount==0){
				if(cost instanceof Array){
					v = cost[0];
				}else{
					v = cost;
				}
			}else{
				if(code.match(/^01\d$/)){			// シルク通常版
					if(amount<=5){
						v = cost[0];
					}else if(amount<=9){
						v = cost[1];
					}else if(amount<=19){
						v = cost[2];
					}else if(amount<=29){
						v = cost[3];
					}else if(amount<=49){
						v = cost[4];
					}else if(amount<=99){
						v = cost[5];
					}else{
						v = cost[6];
					}
				}else if(code.match(/^02\d$/)){	// シルクジャンボ版
					if(amount<=5){
						v = cost[0];
					}else if(amount<=9){
						v = cost[1];
					}else if(amount<=19){
						v = cost[2];
					}else if(amount<=29){
						v = cost[3];
					}else if(amount<=49){
						v = cost[4];
					}else if(amount<=99){
						v = cost[5];
					}else{
						v = cost[6];
					}
					v = Math.ceil(v*1.3);
				}else if(code.match(/^03\d$/)){	// デジタル転写シート代
					if(amount<=3){
						v = cost[0];
					}else if(amount<=19){
						v = cost[1];
					}else if(amount<=49){
						v = cost[2];
					}else if(amount<=99){
						v = cost[3];
					}else if(amount<=499){
						v = cost[4];
					}else{
						v = cost[5];
					}
				}else if(code.match(/^04\d$/)){	// デジタル転写プレス代
					if(amount<=10){
						v = cost[0];
					}else{
						v = cost[1];
					}
				}else{
					v = cost;
				}
			}
			$(this).closest('tr').find('.cost').val(v);
			$.calc_estimatetable(this);
		}
	});

	/********************************
	*	ボタンスタイル
	*/
	// $( "#estimation_toolbar .add_row, #orderlist tfoot tr.estimate .delete_row" ).button();
	//$('#tool_inner input[type="button"]').button();
	$('#free_discount, #free_printfee').button();

	// unload
	window.addEventListener('beforeunload', function(event) {
    	if(mypage.prop.modified && !$('body').is('.main_bg')) {
			return event.returnValue = '保存されていないデータがあります。編集内容が破棄されますがよろしいですか？';
			/*
    		if(confirm('変更内容を保存しますか？')){
    			var res = true;
				if(!$('#tab_order').hasClass('headertabs')){
					res = mypage.save('order', false);
				}else if(!$('#tab_direction').hasClass('headertabs')){
					res = mypage.save('direction');
				}
				if(!res){
					event = event || window.event;
					return event.returnValue = '保存処理でエラーが発生しました。';
				}
			}else{
				if(($('#order_id').text()-0)==0 && $(':radio[name="firstcontact"]:checked').val()=="yes"){
					if($('#reception').val()==""){
						alert('受注担当者を指定して下さい。');
						event = event || window.event;
						return event.returnValue = '受注担当者を指定して下さい。';
					}
					// 新規問い合わせ件数をカウント
					mypage.save('firstcontact');
				}
			}
			*/
      	}
    }, false);

    // load
	$(window).one('load', function(){
		sessionStorage.clear();
		var dt = new Date();
		dt.setDate(dt.getDate());
		document.forms.searchtop_form.term_from.value = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
		dt.setDate(dt.getDate()-10);
		document.forms.searchtop_form.lm_from.value = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
		
		if(_ID!=""){
			mypage.main('btn',_ID);
		}else{
			document.forms.searchtop_form.id.focus();
			//mypage.main('btn', $('input[title="search"]'));
		}
	});


	// check email
	$('#check_email').click( function(){
		var email = document.forms['customer_form'].email.value;
		if(email.trim()=="" || !email.match(/@/)){
			alert('メールアドレスではありません。');
			return;
		}

		/*	RFC2822 addr_spec 準拠パターン							*/
		/*	atom       = {[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+};		*/
		/*    dot_atom   = {$atom(?:\.$atom)*};						*/
		/*    quoted     = {"(?:\\[^\r\n]|[^\\"])*"};				*/
		/*    local      = {(?:$dot_atom|$quoted)};					*/
		/*    domain_lit = {\[(?:\\\S|[\x21-\x5a\x5e-\x7e])*\]};	*/
		/*    domain     = {(?:$dot_atom|$domain_lit)};				*/
		/*    addr_spec  = {$local\@$domain};						*/
		$.post('./php_libs/checkDNS.php', {'email': email}, function(r){
			if(r){
				if( email.match(/^(?:(?:(?:(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+)(?:\.(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+))*)|(?:"(?:\\[^\r\n]|[^\\"])*")))\@(?:(?:(?:(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+)(?:\.(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+))*)|(?:\[(?:\\\S|[\x21-\x5a\x5e-\x7e])*\])))$/)){
					alert('OK!\n確認メールを送信してください。');
				}else{
					alert('メールアドレスを確認してください。');
				}
			}else{
				alert('@マークより後を確認してください。');
			}
		});
	});

	
	/********************************
	*	dhtmlx ComboBox
	*
	dhtmlx.skin = "dhx_skyblue";
	$.dhx.Combo = new dhtmlXCombo("mesh", "alfa", 90);
	$.dhx.Combo.addOption([["120", 120], ["80", 80], ["80-120", "80-120"], ["その他", "その他"]]);
	*/
});
