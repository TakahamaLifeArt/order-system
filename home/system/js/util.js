/*
*	�����ϥޥ饤�ե�����
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
	String.prototype.trim = function(){return this.replace(/^[\s��]+|[\s��]+$/g, '');};
	
	
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
			        && code != 37 && code != 39 // ����
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
			        && code != 37 && code != 39 // ����
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
			        && code != 37 && code != 39 // ����
			        && code != 45				// -
			        && (code < 47 || code > 57)) // 0-9 /
			    	e.preventDefault();

			    if(code == 13 || code == 3) $(this).moveCursor(my);
		    	break;
			case 'cost':	// �ȼԥơ��֥�ξ���ñ��
				if (   !e.ctrlKey 				// Ctrl+?
			        && !e.altKey 				// Alt+?
			        && code != 0 				// ?
			        && code != 8 				// BACKSPACE
			        && code != 9 				// TAB
			        && code != 13 				// Enter
			        && code != 37 && code != 39 // ����
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
				return this;	// form���ǤǤʤ���в��⤷�ʤ�
			}
			var first = -1;		// form��κǽ��text��readonly�Ͻ����ˤΥ���ǥå���
			var isMove = false;	// ���������ư�����褿���ɤ����Υ����å�
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
		*	�ȼԤθ��ѥơ��֥롡�ǽ��Ԥ�ñ���ե�����ɤǥ��󥿡��ǹԤ��ɲ�
		*/
			var isMove = false;	// ���������ư�����褿���ɤ����Υ����å�
			var elem = my.form.elements;
		    for(var i=0; i<elem.length; i++){
		    	if( elem[i]==my ){
	    			while(i<elem.length-1){
	    				i++;
	    				if($(elem[i]).closest('tr').is('.estimate')){
	    				// tr.estimate ��Υƥ����ȥե�����ɤΤ��о�
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


	// 0�ȼ�������0����9 �Τ����ϡ�����ڤ�ʤ��������ͤ�"0"
	$('.forNum').live('keypress', function(e){
		$(this).restrictKey(e, 'num');
	}).live('focusout', function(e){
		mypage.check_NaN(this);
	});

	// 0�ȼ�������0����9 �Τ����ϡ�����ڤ�ʤ��������ͤ�""
	$('.forBlank').live('keypress', function(e){
		$(this).restrictKey(e, 'num');
	}).live('focusout', function(e){
		mypage.check_NaN(this,"");
	});

	// 0����9 . - �Τ����ϡ�����ڤ�ʤ��������ͤ�"0"
	$('.forReal').live('keypress', function(e){
		$(this).restrictKey(e, 'price');
    }).live('focusout', function(e){
    	mypage.check_Real(this);
	});
	
	// ��ۡ�0����9 . - �Τ����ϡ�����ڤꤢ�ꡢ�ե��������ǥ���ޤʤ����Ѵ��������ͤ�"0"
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
	*	��ۡ�0����9 . - �Τ����ϡ�����ڤꤢ�ꡢ�ե��������ǥ���ޤʤ����Ѵ��������ͤ�"0"
	*	�ȼԤθ��ѥơ��֥�ζ����
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

	// ���ա�0����9 / - �Τ����Ϥ��������ͤ�""
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

	/* �ե������ʸ��������
	*	ʸ������Ⱦ�Ѥ�maxlength�ο�
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
		// Ⱦ��
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
		*	Ⱦ�ѱѿ��Ȥ���ʳ���Ƚ��
		*	@args	�о�ʸ����
		*
		*	return	����:2��Ⱦ��:1 �Ȥ���ʸ����
		*/
			var len = 0;
			for(s=0; s<args.length; s++){
				if(args[s].match(/[��-�ݎ����������������ߎ�]/)){
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
		*	��Ⱦ�Ѥζ��̤ʤ�����ʸ��������Ǵݤ��
		*	@args	�о�ʸ����
		*	@maxlen	Ⱦ�ѤǤκ���ʸ����
		*
		*	return	[ʸ����, ʸ����]
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
			if(args==1){		// ��ʸ�����������
				$('.schedule_crumbs_toright').show();
				$('.schedule_crumbs_toleft').hide();
			}else if(args==2){	// ���Ϥ��������
				$('.schedule_crumbs_toleft').show();
				$('.schedule_crumbs_toright').hide();
			}else{				// �������塼��̤����
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
               var info = [];      // �쥳���ɤ��Ȥ�����
               var data = [];      // ���ܤ��Ȥ˥ǡ�����ʬ����
               var key = [];       // �ե������̾�ȥǡ�����ʬ����
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
						// ���ΰ����ơ��֥������
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
						if($('#showtoggle').val()=="����ɽ����"){
							$('#showtoggle').val("���ϲ��̤�");
							$('#cleareditor').hide();
							$('#listtoggle').val("���ꥹ�Ȥ򳫤�").show();
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
		*	�������դ�������֤�
		*	@return		[���1��][�����]
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
			var delimiter = r.slice(boundary, -1*cnt.length);				// ���ڤ�ʸ��������
 			$.delimiter.fld = delimiter.slice(0,cnt);		// �ե�����ɤζ��ڤ�
 			$.delimiter.dat = delimiter.slice(cnt,cnt*2);	// �������ͤζ��ڤ�
			$.delimiter.rec = delimiter.slice(-1*cnt);		// �쥳���ɤζ��ڤ�
 			return r.slice(0, boundary);
		},
		delimiter: {
		/*
		*	�ǡ����ζ��ڤ�ʸ��
		*/
			'rec':"",
			'fld':"",
			'dat':""
		},
		calc_estimatetable: function(my){
		/*
		*	�ȼ����Ϥθ��ѥơ��֥�
		*	��ۤȿ��̤��ѹ��ˤ��Ʒ׻�
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
		*	�ȼ����Ϥμ�������ʾ���̾�ˤ�ñ���׻�
		*	@my		$('.summary') jQuery object
		*	@amount	���
		*
		*	return	ñ��
		*/
			var code = my.val().slice(0,3);
			var isJumbo = false;
			if(code.match(/^02\d$/)){	// ���륯��������
				code = code.replace(/^02(\d)$/, '01$1');
				isJumbo = true;
			}
			var cost = $.availableTags.cost[code];
			var myDate = Date.parse('2014/02/18')/1000;		// ���륯�Υ����幹����
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
				if(code.match(/^01\d$/)){			// ���륯�ץ�����
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
					
					// ��������
					if(isJumbo){
						v = Math.ceil(v*1.3);
					}
					
				}else if(code.match(/^03\d$/)){	// �ǥ�����ž�̥�������
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
				}else if(code.match(/^04\d$/)){	// �ǥ�����ž�̥ץ쥹��
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
					"001 �����35cm��27cm��",
					"002 �����43cm��32cm��",
					"003 ����ʥǥ�����ž�̡�",
					"004 �￧��",
					"011 �ץ������1����35cm��27cm",
					"012 �ץ������2����35cm��27cm",
					"013 �ץ������3����35cm��27cm",
					"014 �ץ������4����35cm��27cm",
					"015 �ץ������5����35cm��27cm",
					"021 �ץ������1����43cm��32cm",
					"022 �ץ������2����43cm��32cm",
					"023 �ץ������3����43cm��32cm",
					"024 �ץ������4����43cm��32cm",
					"025 �ץ������5����43cm��32cm",
					"031 �ǥ�����ž�̥�������ʥ����ѡ���",
					"032 �ǥ�����ž�̥������������",
					"033 �ǥ�����ž�̥��������ǻ��Ʃ����",
					"041 �ץ쥹���T����ġ�",
					"042 �ץ쥹��ʥݥ���ġ�",
					"043 �ץ쥹��ʥ֥륾��1���Ρ�",
					"044 �ץ쥹��ʥ֥륾�����Ρ�",
					"045 �ץ쥹��ʥ��ץ���",
					"046 �ץ쥹��ʥ���åס�",
					"047 �ץ쥹��ʥ���Х�������",
					"048 �ץ쥹��ʥ������åȡ�",
					"051 ���󥯥����åȥץ���",
					"062 ���åƥ��󥰥ץ���",
					"071 ���顼���ԡ�ž��",
					"100 ����",
					"101 ����������",
					"103 �õ�����1.3",
					"104 �õ�����1.5",
					"105 �ǥ�������"
				],
				summary_20131020:[
					"001 ����ʥ��륯��35cm��27cm����",
					"002 ����������",
					"003 �ץ�����ʥ��륯��",
					"004 ����ץ���ʥ��륯��",
					"006 Ȣ���ޡ˽�",
					"007 Ȣ���ޡ���",
					"009 ������",
					"010 ����������",
					"011 ���������ʪ�������",
					"012 �õ�����",
					"013 �ǥ�������",
					"014 �͡��ॿ����",
					"017 ���󥯺�����",
					"023 ���åƥ��󥰥�������",
					"024 �ԣӥ�������",
					"025 ��ž��",
					"100 ����",
					"101 �����ž�̻��ѡ�",
					"102 ž�̥ץ�����ʥ����ȡ��ץ쥹���",
					"104 ž�̥���ץ���",
					"105 �ץ쥹�ù���",
					"108 �����ž��",
					"111 ž�̥����ȡ�ǻ��Ʃ����",
					"112 ž�̥����ȡ���դ���",
					"113 ž�̥����ȡ�����Ʃ����",
					"114 ž�̥����ȡ�¿�������",
					"115 ž�̥����ȡʥ����ѡ�ž�̡�",
					"200 ���������",
					"206 ���󥯥ݥå�",
					"301 ���ꥸ�ʥ�T����ĥץ�����ʣΣţԡ�",
					"400 ���󥯥����åȥץ�����",
					"500 �����ڡ�����",
					"603 ���å���",
					"604 �ɽ�",
					"605 �Τܤ�",
					"607 ����ž��",
					"700 ����å�",
					"801 �ץ�����",
					"802 ����",
					"803 ���",
					"804 �Ͱ�",
					"805 ����"
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
		*	��ǧ�ܥå���
		*	@msg	ɽ�������å�����ʸ
		*	@fn		callback �ܥ��󤬲����줿��ν�����OK:true, Cancel:false
		*	@mode	0: Yes,No,Cancel(default)��1:OK,Cancel
		*/
			$.resConf.data = '';
			msg += '<p class="btn_line">';
			msg += '<input type="button" value="���Ϥ���" class="closeModalBox" onclick="$.resConf.data=\'yes\';" />��';
			if(arguments.length==2) msg += '<input type="button" value="����������" class="closeModalBox" onclick="$.resConf.data=\'no\';" />��';
			msg += '<input type="button" value="����󥻥�" class="closeModalBox" onclick="$.resConf.data=\'cancel\';" /></p>';
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
			if(weeks == 0) texts = "����";
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
	
	/* ȯ�������ѹ���ô���ԥ��쥯�����Υꥹ�Ȥ�� */
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
			if(weeks == 0) texts = "����";
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
		
		// �����Ԥ����ȯ����ν������ԲĤˤ���
		if(mypage.prop.shipped==2 && _my_level!="administrator"){
			alert("ȯ���ѤߤΥǡ����򹹿����뤳�ȤϤǤ��ޤ���");
			return;
		}
		
		if(confirm('�ѹ����Ƥ���¸���ޤ�����')){
			if(!$('#tab_order').hasClass('headertabs')){
				isReturn = mypage.save('order');
			}else if(!$('#tab_direction').hasClass('headertabs')){
				isReturn = mypage.save('direction');
			}
		}
		if(!isReturn){
			$.msgbox("��¸�����ǥ��顼��ȯ�����Ƥ��ޤ���\n����ǧ����������");
		}
	});

   
	/********************************
	*	go to menu
	*/
	$('#btn_gotomenu').click( function(){
		var func = function(){
			$('#tab_order').click();	// ������̥��֤������Ƥ�����֤ˤ���
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
		
		// ̤��¸�ǡ����γ�ǧ
		if(mypage.prop.modified) {
			$.confbox('�ѹ����Ƥ���¸���ޤ���', function(){
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
						$.msgbox('��¸�����ǥ��顼��ȯ�����Ƥ��ޤ���\n����ǧ����������');
						return;
					}
				}else if($.resConf.data=='no'){
					if(($('#order_id').text()-0)==0 && $(':radio[name="firstcontact"]:checked').val()=="yes"){
						if($('#reception').val()==0){
							alert('����ô���Ԥ���ꤷ�Ʋ�������');
							return;
						}
						// �����䤤��碌����򥫥����
						mypage.save('firstcontact');
					}
					
					/*	2014-09-09 �ѹ����˴����뤿��
					if(($('#order_id').text()-0)!=0){
						// ��Ͽ�Ѥߤμ���Ǥ����;����ɬ�ܹ��ܤ�̤���Ϥξ��˥�˥塼�ؤ����ܤ���ߤ���
						var f = document.forms.customer_form;
						if( f.customername.value=="" || (f.tel.value=="" && f.mobile.value=="" && f.email.value=="") ){
							alert("�ܵ�̾��Ϣ�����TEL��E-Mail�Τ����줫�ˤ�ɬ�ܹ��ܤǤ���");
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
	*	��������
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
							$('#btn_completionimage').addClass('btn_red').text('��������');
						}else{
							mypage.setAcceptnavi(0);
							$('#completionimage').removeAttr('checked');
							$('#btn_completionimage').removeClass('btn_red').text('��������');

						}
						
					}
				}
			});
		};
		
		if(($('#order_id').text()-0)==0){	// ̤��¸�ξ��
			$.confbox('�������Ƥ���¸���ޤ���������Ǥ�����', function(){
				if($.resConf.data=='yes'){
					if(!mypage.save('order')){
						alert('��¸�����ǥ��顼��ȯ�����Ƥ��ޤ���\n����ǧ����������');
						return;
					}
					func();
				}else{
					alert('��������ߤ��ޤ���');
				}
			},true);
		}else{
			func();
		}
	});
	
	/********************************
	*	����襢�åץ��ɡ�����
	*/
	$('#btn_imageup').click( function(){
		var orders_id = $('#order_id').text()-0;
		$.ajax({url: './php_libs/ordersinfo.php', type: 'POST', data: {'act':'update','mode':'imagecheck','order_id': orders_id},
			success: function(r){
				if(!r){
					alert('Error: ���᡼���������åץ��ɼ���');
				}
			}
		});
		data = [];
		data.push(orders_id);
		act = "sendmail_image";
		$.ajax({url:'./documents/sendmail_image.php', type:'POST', dataType:'json', async:false, data:{'doctype':act, 'json':1, 'data[]':data}, 
			success:function(r){
				if(r instanceof Array){
					alert('���᡼�������򥢥åץ��ɤ��ޤ�����');
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
				alert('��¸�����ǥ��顼��ȯ�����Ƥ��ޤ���\n����ǧ����������');
				return;
			}
		if( !mypage.confirm() ){
			return;
		}
		
		var orders_id = $('#order_id').text()-0;
		var orderdate = $('#schedule_date2').val();
		
		if(confirm("��ʸ����ꤵ���ޤ��������Ǥ�����\n��������"+orderdate)){

			// ��ʸ���ꡢ����ؼ������Ͽ�ޤ�
			$.ajax({url: './php_libs/ordersinfo.php', type: 'POST', data: {'act':'update','mode':'acceptstatus',
				'field1[]':['orders_id','progress_id','confirmhash','ordertype', 'orderdate'],
				'data1[]':[orders_id, '4', "", mypage.prop.ordertype, orderdate]}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)){
						alert('Error: p813\n'+r);
					}else{
						// �ʹԤ���ʸ����˸���
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
						
						// ��Ľ�ʥӥС�����ʸ����ˤ���
						mypage.setAcceptnavi(4);
						/*
						$('#accept_navi li').removeClass('actlist').children('p').removeClass('act bef');
						$('#accept_navi li:eq(3)').addClass('actlist').children('p').addClass('act');
						$('#accept_navi li:eq(2)').children('p').addClass('bef');
						*/
						
						// ���顼�Ȥ򥯥ꥢ
						$("#alert_comment, #alert_require").fadeOut();

						// ���ϥ⡼�ɤ��ѹ��ԲĤˤ���
						if($(':radio[name="ordertype"]:checked', '#enableline').val()=="general"){
							$('#ordertype_industry').next().hide();
							$('#ordertype_general').next().show();
						}else{
							$('#ordertype_industry').next().show();
							$('#ordertype_general').next().hide();
						}
						$(':radio[name="ordertype"]', '#enableline').hide();
						
						// ��ʸ����ե饰�򹹿�
						mypage.prop.firmorder = true;
						mypage.checkFirmorder();
						
						$('#firm_order, #btn_firmorder').hide();
						$('#btn_completionimage').hide();
						
						// �����Ը��¤ǲ���ܥ����ɽ��
						if(_my_level=="administrator"){
							$('#btn_cancelorder').show();
						}
					}
				}
			});
		}
	});
	
	
	/********************************
	*	��ʸ�������
	*/
	$('#btn_cancelorder').click( function(){
		if(!mypage.prop.firmorder) return;
		
		var orders_id = $('#order_id').text()-0;
		
		if(confirm("��ʸ����������ޤ��������Ǥ�����")){
			// ��ʸ����������䤤��碌��ˤ���
			$.ajax({url: './php_libs/ordersinfo.php', type: 'POST', data: {'act':'update','mode':'acceptstatus',
				'field1[]':['orders_id','progress_id','confirmhash'],
				'data1[]':[orders_id, '1', ""]}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)){
						alert('Error: p1082\n'+r);
					}else{
						// ��ʸ����ȥ�������ܥ����ɽ��
						$('#firm_order, #btn_firmorder').show();
						$('#btn_completionimage').show().removeClass('btn_red').text('��������');
						
						// ����ܥ������ɽ��
						$('#btn_cancelorder').hide();
						
						// �ʹԤ��䤤��碌��ˤ���
						$('input[name="phase"], label', '#phase_wrapper').show();
						$('ins', '#phase_wrapper').hide();
						
						// ��Ľ�ʥӥС����䤤��碌��ˤ���
						mypage.setAcceptnavi(0);
						/*
						$('#accept_navi li').removeClass('actlist').children('p').removeClass('act bef');
						$('#accept_navi li:eq(0)').addClass('actlist').children('p').addClass('act');
						*/
						
						// ���顼�Ȥ򥯥ꥢ
						$("#alert_comment, #alert_require").fadeOut();
						
						// ���ϥ⡼�ɤ��ѹ��Ĥˤ���
						$('#ordertype_industry').next().show();
						$('#ordertype_general').next().show();
						$(':radio[name="ordertype"]', '#enableline').show();
						
						// ���ϥե�����ɤ򹹿��Ĥˤ���
						$('input, select').attr('disabled', false);
						
						// ��ʸ����ե饰�򹹿�
						mypage.prop.firmorder = false;
						mypage.checkFirmorder();
						
						// Ʊ���������ɽ��
						$('#bundle_status').hide();
						
						// ��ʸ�ꥹ�Ȥ򹹿�
						var noprint = 0;
						if(mypage.prop.ordertype=="general"){
							noprint = $('#noprint').is(':checked')? 1: 0;
						}
						mypage.showOrderItem({'orders_id':orders_id, 'noprint':noprint}, 'modify');
						
						// �Ʒ׻�
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
			case 0:	break;		// ����
			case 1:	idx = 90;	// web��ʸ
				break;
			case 2:	idx = 1;	// ��礻
				break;
			case 3:	idx = 3;  // ����
				break;
			case 4:	idx = 5;	// �����
				break;
			case 5:	idx = 4;	// ��ʸ����
				break;
			case 6: idx = 6;	// ���
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
	
	
	/* ���쥯�������ѹ���¨������¹� */
	$('#searchtop_form select').change( function(){
		mypage.main('btn', $('input[title="search"]'));
	});
	
	
	/* customer number ����k000000���ȼ�g0000 */
	$('#searchtop_form input[name=number], #customer_form input[name=number]').change( function(){	
		var str = $(this).val();
		if(str=='') return;
		str = str.replace(/[��-��]/g, function(m){
			var a = "��������������������";
			var r = a.indexOf(m);
			return r==-1? m: r;
		});
		str = str.replace(/[K�ˣ�]/g, 'k');
		str = str.replace(/[G�ǣ�]/g, 'g');
		/* /^[gk]{1}([1-9]{1}\d*)?$/ 0���ץ쥹�ξ�� */
		if(!str.match(/^[gk]{1}\d*$/)){
			$(this).val('');
		}else{
			$(this).val(str);
		}
	});
	
	
	/* �̾��Self-Design������ */
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
			if($(this).text()=='�̾�'){
				$('#applyto').val(0);
			}else{
				$('#applyto').val(1);
			}
		}
	});
	
	
	/* ���ե��ꥢ */
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
	*	ȯ�����դ��ѹ���ô���ԥ��쥯������񤭴�����
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
*	�ȼ����ϥ⡼��
*
****************************************************************************************************************************/

	/* ���̤�ñ�����ѹ� */
	$('#orderlist tfoot .amount, #orderlist tfoot .cost').change( function(){
		$.calc_estimatetable(this);
	});


	/* ���ѥơ��֥�ι��ɲ� */
	$('#estimation_toolbar .add_row').live('click', function(){
		var tr = '<tr class="estimate" style="display:table-row">';
		tr += '<td class="tip">0</td>';
		tr += '<td colspan="5"><input type="text" value="" class="summary" /></td>';
		tr += '<td><input type="text" value="0" class="amount forNum" /></td>';
		tr += '<td><input type="text" value="0" class="cost" /></td>';
		tr += '<td><input type="text" value="0" class="price" readonly="readonly" /></td>';
		tr += '<td colspan="2"></td>';
		tr += '<td class="none"><input type="button" value="���" class="delete_row" /></td>';
		tr += '<td class="tip"></td></tr>';
		$('#orderlist tfoot tr.total_estimate:first').before(tr);

		// live�᥽�åɤ�change���б����Ƥ��ʤ����������
		$('#orderlist tfoot tr.estimate:last .cost').change( function(){
			$.calc_estimatetable(this);
		});

		$('#orderlist tfoot tr.estimate:last .forNum').change( function(){
			$.calc_estimatetable(this);
		});

		// ����ܥ���Υ�������
		// $( "#orderlist tfoot tr.estimate .delete_row" ).button();

		// �����ȥ���ץ꡼��
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
					if(code.match(/^01\d$/)){			// ���륯�̾���
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
					}else if(code.match(/^02\d$/)){	// ���륯��������
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
					}else if(code.match(/^03\d$/)){	// �ǥ�����ž�̥�������
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
					}else if(code.match(/^04\d$/)){	// �ǥ�����ž�̥ץ쥹��
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

		// Change���٥�Ȥ�����
		$('#orderlist tfoot tr.estimate :text').change(function(){
			mypage.prop.modified = true;
		});

	});


	/* ���ѥơ��֥�ιԺ�� */
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
	*	���Ѥ�ܥå����ǥץ����������Ϥ��ڤ��ؤ���
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
	*	ȯ������å���state_0��
	*/
	$('#state_0 input').change( function(){
		var orders_id = $('#order_id').text()-0;
		var staff_id = $('#reception').val();
		var field = ['orders_id','state_0'];
		
		if(!mypage.prop.firmorder){
			alert('��ʸ�����ꤷ�Ƥ��ޤ���');
			$(this).attr('checked', false);
			return;
		}
		
		if(staff_id==0){
			alert('ô���Ԥ���ꤷ�Ƥ���������');
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
			if(!confirm('��¸����Ƥ��ʤ�������˴�����ޤ���\n�������Ǥ�����')){
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
				$('#category_selector option:last').before('<option value="99">ž�̥�����</option>');
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
			$.confbox('�ѹ����Ƥ���¸���ޤ�����', function(){
				if($.resConf.data=='yes'){
					if(!mypage.save('direction')){	// ����ؼ�����̤���¸
						alert("p1873\n��¸�����ǥ��顼��ȯ�����Ƥ��ޤ���");
						return false;
					}
				}else{
					return;	// �������
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
			$.confbox('�ѹ����Ƥ���¸���ޤ�����', function(){
				if($.resConf.data=='yes'){
					if(!mypage.save('order')){	// �������ϲ��̤���¸
						alert("p1458\n��¸�����ǥ��顼��ȯ�����Ƥ��ޤ���");
						return;
					}
				}else{
					return;	// �������
				}
				mypage.prop.modified = false;
				func();
			}, true);
		}else{
			func();
		}
		
		mypage.screenOverlay(false);	// ¾�β��̤���ľ�ܸƽФ��ξ��
	});


	/********************************
	*	customer log
	*/

	/* ���ե��μ�����ɽ�� */
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

	/* ɽ�������� */
	$('#showtoggle').click( function(){
		if($(this).val()=="����ɽ����"){
			$(this).val("���ϲ��̤�");
			$('#cleareditor').hide();
			$('#listtoggle').val("���ꥹ�Ȥ򳫤�").show();
			$('table tr', '#list_wrapper').each( function(){
				$(this).children('td:eq(2) p').addClass('fixheight');
			});
			document.forms.logeditor_form.cstlogid.value = "";
			$('#log_editor').fadeOut('fast', function(){$('#list_wrapper').fadeIn();});
		}else{
			$(this).val("����ɽ����");
			$('#listtoggle').hide();
			$('#modify_log, #delete_log').hide();
			$('#cleareditor').show();
			$('#log_text').val("");
			$('#list_wrapper').fadeOut('fast', function(){$('#log_editor').fadeIn();});
		}
	});


	/* �ꥹ��ɽ���Υ��饤�� */
	$('#listtoggle').click( function(){
		if($(this).val()=="���ꥹ�Ȥ򳫤�"){
			$(this).val("�ꥹ�Ȥ򤿤���");
			$('table tr', '#list_wrapper').each( function(){
				$(this).children('td:eq(2)').children('p').removeClass('fixheight');
			});
		}else{
			$(this).val("���ꥹ�Ȥ򳫤�");
			$('table tr', '#list_wrapper').each( function(){
				$(this).children('td:eq(2)').children('p').addClass('fixheight');
			});
		}
	});


	/* ����������ꤷ��ɽ�� */
	$('table tr', '#list_wrapper').live('click', function(){
		$('#showtoggle').val("����ɽ����");
		$('#listtoggle').hide();
		var message = $(this).children('td:eq(2)').text();
		var id = $(this).attr('class').split('_')[1];
		$('#modify_log, #delete_log').show();
		$('#cleareditor').show();
		document.forms.logeditor_form.cstlogid.value = id;
		$('#log_text').val(message);
		$('#list_wrapper').fadeOut('fast', function(){$('#log_editor').fadeIn();});

	});


	/* ���ǥ����Υ��ꥢ */
	$('#cleareditor').click( function(){
		$('#modify_log, #delete_log').hide();
		document.forms.logeditor_form.cstlogid.value = "";
		$('#log_text, #against').val("");
	});


	/* �����ν���������ƤΥ���ɽ�� */
	$('#init_pane').click( function(){
		$.update_log();
		$('#against').val("");
		$('#list_wrapper .pan p:eq(1)').hide().children('#searchword').text("");
		$('#list_wrapper .pan p:eq(0)').show();
	});


	/* ���θ��� */
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
                   
				// ���ΰ����ơ��֥������
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

				if(against==""){	// ����ʸ����̤���Ͼ���������ɽ���ξ��֤ˤ���
					$('#list_wrapper .pan p:eq(1)').hide().children('#searchword').text("");
					$('#list_wrapper .pan p:eq(0)').show();
				}


				$('#list_wrapper .pane').html(tbl);

				// ���ϲ��̤�ɽ������Ƥ�����֤Ǹ�����Ԥʤä����ϰ������̤ˤ���
				if( $('#log_editor:visible').length ){
					$('#showtoggle').val("���ϲ��̤�");
					$('#cleareditor').hide();
					$('#listtoggle').val("���ꥹ�Ȥ򳫤�").show();
					$('table tr', '#list_wrapper').each( function(){
						$(this).children('td:eq(2) p').addClass('fixheight');
					});
					$('#log_editor').fadeOut('fast', function(){$('#list_wrapper').fadeIn();});
				}
			}
		});

	});


	/* ���ο�����¸ */
	$('#save_log').click( function(){
		var orders_id = $('#order_id').text()-0;
		if( $('#log_staff').val()=="" ){
			alert("ô���Ԥ���ꤷ�Ʋ�������");
			return;
		}
		if( orders_id==0 ){
			alert("�������¸����Ƥ��ޤ���");
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
					alert("���ι���������ޤ���Ǥ�����\n�⤦���٤��ľ���Ƥ���������\n"+r);
					return;
				}
				$.update_log();
			}
		});
	});


	/* ���ν������� */
	/**
	*	var dt = new Date();
	*	var cstlog_date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours()+':'+('00'+dt.getMinutes()).slice(-2)+':'+('00'+dt.getSeconds()).slice(-2);
	**/
	$('#modify_log').click( function(){
		var orders_id = $('#order_id').text()-0;
		if( $('#log_staff').val()=="" ){
			alert("ô���Ԥ���ꤷ�Ʋ�������");
			return;
		}
		if( orders_id==0 ){
			alert("�������¸����Ƥ��ޤ���");
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
					alert("���ι���������ޤ���Ǥ�����\n�⤦���٤��ľ���Ƥ���������\n"+r);
					return;
				}
				$.update_log();
			}
		});
	});


	/* ���κ�� */
	$('#delete_log').click( function(){
		if( !confirm('���κ�����ޤ����������Ǥ�����') ) return;
		var fld = ['cstlogid'];
		var dat = [document.forms.logeditor_form.cstlogid.value];

		$.ajax({
			url:'./php_libs/ordersinfo.php', type:'POST', datatype:'text', async:'false',
			data:{'act':'delete', 'mode':'customerlog', 'field1[]':fld, 'data1[]':dat}, success: function(r){
				if(!r.match(/^\d+?$/)){
					alert("���κ��������ޤ���Ǥ�����\n�⤦���٤��ľ���Ƥ���������\n"+r);
					return;
				}
				$.update_log();
			}
		});
	});


	/********************************
	*	media check
	*	�����Τä��������䤤��碌��ˡ�ʤɤΥ����å������Ʋ��
	*/
	$('#mediacheck03_other').focus( function(){
		$(':radio[name="mediacheck03"]', '#mediacheck_wrapper').val(['other']);
	});


	$('#mediacheck_reset').click( function(){
		$(':radio[name!="firstcontact"]', '#mediacheck_wrapper').removeAttr('checked');
		$('#mediacheck03_other').val('����¾');
	});


	/********************************
	*	schedule
	*	���ơ���������衺�������Ϥ���
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
			if(weeks == 0) texts = "����";
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
							alert('���ơ�������ꤷ�Ʋ�����');
						}else{
							$.calc_ms();
						}
						break;
			case '2':if($('#schedule_date2').val()==""){
							alert('��ʸ����������ꤷ�Ʋ�����');
						}else{
							$.calc_img();
						}
						break;
			case '4':if($('#schedule_date4').val()==""){
							alert('���Ϥ�������ꤷ�Ʋ�����');
						}else{
							$.calc_delivery("");
						}
						break;
		}
	});
	
	
	/********************************
	*	�޵�
	*/
	// �ʤ�
	$(':checkbox[value="no"]', '#package_wrap').change( function(){
		var state = $(this).val();
		if($(this).is(':checked')){
			$(':checkbox[value!="no"]', '#package_wrap').removeAttr('checked');
			$('input[type="number"]', '#package_wrap').val('0').parent('p').fadeOut('slow');
			$('#package_wrap').closest('td').removeClass('pending');
			mypage.getNumberOfBox();	// Ȣ����׻�
			mypage.calcPrintFee();
		}else{
			if($(':checkbox[name="package"]:checked', '#package_wrap').length==0) $('#package_wrap').closest('td').addClass('pending');
		}
	});
	
	// ���ꡢ�ޤΤ�
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
		if(state=='yes') mypage.getNumberOfBox();	// Ȣ����׻�
		mypage.calcPrintFee();
	});
	
	// �޵ͤ�����ޤʤ����б����
	$('input[type="number"]', '#package_wrap').change( function(){
		mypage.calcPrintFee();
	});
	
	
	/********************************
	*	������ˡ
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
	*	Ǽ������ƻ�ܸ�
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
	*	Ǽ����ο�
	*/
	$('#destcount').change( function(){
		mypage.calcEstimation();
	
	});
	
	/********************************
	*	�������塼����ι�����������å�
	*/
	$('#check_amount').change( function(){
		var check_amount = $(this).val()-0;
		if(check_amount > 100) alert('Ǽ�����ǧ���Ƥ���������');
		mypage.calcPrintFee();
	});
	
	
	/********************************
	*	Ʊ�������å�����ʸ�����ݥåץ��å�
	*/
	$('#show_bundle').click( function(){
		if(!mypage.prop.firmorder){
			$.msgbox('��ʸ�����ꤷ�Ƥ��ޤ���');
			return;
		}
		var orders_id = $('#order_id').text()-0;
		mypage.screenOverlay(true);
		$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false, data:{'act':'search', 'mode':'bundlelist', 'field1[]':['orders_id'], 'data1[]':[orders_id]}, 
			success:function(r){
				if(r instanceof Array){
					if(r.length==0){
						$('#bundle_status').hide();
						alert('Ʊ����ǽ�ʳ�����ʸ�Ϥ���ޤ���');
						mypage.screenOverlay(false);
					}else{
						var tbl = '<table class="mytable">';
						tbl += '<thead><tr><th></th><th>����No.</th><th>��̾</th><th>���</th></thead>';
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
	
	/* ��ޥ��ؤ���������ɽ��ݥåץ��å� */
	$('#ans_delivery').click( function(){
		var args = '';
		args += '<table class="mytable"><caption>��ޥ��ء�������ϰ�</caption>';
		args += '<thead><tr><th colspan="3">3���ʾ夫�����ϰ�</th></thead>';
		args += '<tbody>';
		args += '<tr><td>�̳�ƻ</td><td>������</td><td>3��</td></tr>';
		args += '<tr><td>����԰�Ʀ����</td><td>�ĥ���¼</td><td>3��<br><p class="note"><span>��</span>���ֻ����Բ�</p></td></tr>';
		args += '<tr><td>����Ծ��޸�����</td><td>���޸�¼</td><td>3��"��1��</td></tr>';
		args += '<tr><td>Ĺ�긩</td><td>���ϻ�</td><td>3��</td></tr>';
		args += '<tr><td rowspan="3">�����縩</td><td>������</td><td>3��</td></tr>';
		args += '<tr><td>���練</td><td>3������5��<br><p class="note"><span>��</span>Į�ˤ�äƺ٤����ۤʤ�Τ��׳�ǧ</p></td></tr>';
		args += '<tr><td>�����練</td><td>5��</td></tr>';
		args += '<tr><td rowspan="3">���츩</td><td>�翬��������¼</td><td>3��"��1��<br><p class="note"><span>��</span>���ֻ����Բ�</p></td></tr>';
		args += '<tr><td>�翬��������¼</td><td>3��"��1��<br><p class="note"><span>��</span>���ֻ����Բ�</p></td></tr>';
		args += '<tr><td>Ȭ�Ż���</td><td>3��</td></tr>';
		args += '</tbody></table>';
		
		args += '<table class="mytable">';
		args += '<thead><tr><th colspan="2">1�������夹�뤬���ֻ����ԲĤ��ϰ�</th></thead>';
		args += '<tbody>';
		args += '<tr><td rowspan="2">ʼ�˸�</td><td>ɱϩ�Բ���Į</td></tr>';
		args += '<tr><td>��露�Ծ���</td></tr>';
		args += '<tr><td rowspan="2">��ɲ��</td><td>�����Ե���ҷ�����¼</td></tr>';
		args += '<tr><td>�����Ե첹��������Į</td></tr>';	
		args += '</tbody></table>';
		
		args += '<table class="mytable">';
		args += '<thead><tr><th colspan="2">2�������夹�뤬���ֻ����ԲĤ��ϰ�</th></thead>';
		args += '<tbody>';
		args += '<tr><td rowspan="6">����԰�Ʀ����</td><td>������¼</td></tr>';
		args += '<tr><td>����¼</td></tr>';
		args += '<tr><td>����¼</td></tr>';
		args += '<tr><td>������</td></tr>';
		args += '<tr><td>��¢��¼</td></tr>';
		args += '<tr><td>����¼</td></tr>';
		args += '<tr><td rowspan="2">ʡ����</td><td>ʡ�������踼����</td></tr>';
		args += '<tr><td>����������</td></tr>';
		args += '<tr><td rowspan="5">Ĺ�긩</td><td>�����Ժ��Įʿ��</td></tr>';
		args += '<tr><td>�����Թ���</td></tr>';
		args += '<tr><td>Ĺ��԰˲���Į</td></tr>';
		args += '<tr><td>Ĺ��Թ���Į</td></tr>';
		args += '<tr><td>ʿ�ͻ�����Į</td></tr>';
		args += '<tr><td rowspan="5">�����縩</td><td>���ӷ��岰��Į����������</td></tr>';
		args += '<tr><td>���������ΤĮ</td></tr>';
		args += '<tr><td>��������Ծ��Į</td></tr>';
		args += '<tr><td>��������Բ���Į</td></tr>';
		args += '<tr><td>��������Լ���Į</td></tr>';
		args += '</tbody></table>';
		
		args += '<table class="mytable"><caption>�嵭�ʳ����ϰ�ˤĤ���</caption>';
		args += '<thead><tr><th colspan="2">2��������ʻ��ֻ���ˤ��������ϰ褢���</th></thead>';
		args += '<tbody>';
		args += '<tr><td>�̳�ƻ</td><td></td></tr>';
		args += '<tr><td>�彣</td><td></td></tr>';
		args += '<tr><td>�纬��</td><td>������</td></tr>';
		args += '<tr><td>���Υ��</td><td></td></tr>';
		args += '</tbody></table>';
		
		args += '<table class="mytable">';
		args += '<thead><tr><th>1���������������������Բ�</th></thead>';
		args += '<tbody>';
		args += '<tr><td>���</td></tr>';
		args += '<tr><td>�͹�</td></tr>';
		args += '</tbody></table>';
		
		$.msgbox(args);
	});
	
	
	/********************************
	*	�����ƥ५�顼���ѹ�
	*/
	$('#item_color').click( function(){
		if(mypage.prop.firmorder) return;	// ������ʸ���ѹ��Բ�
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
	*	��ʸ�ꥹ����Υ����ƥ�Υ��顼�ѹ�
	*/
	$('#orderlist .change_itemcolor').live('click', function(){
		if(mypage.prop.firmorder) return;	// ������ʸ���ѹ��Բ�
		mypage.screenOverlay(true);
		var item_id = $(this).parent().siblings(':first').children('.itemid').text();
		var size_id = $(this).attr('id').split('_')[1];			// �ѹ����θ���ɽ������Ƥ��륵����ID
		var master_id = $(this).attr('alt');					// �ѹ����θ��ߤΥޥ�����ID
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
	*	��ʸ�ꥹ����Υ����ƥ�Υ������ѹ�
	*/
	$('#orderlist .change_size').live('click', function(){
		if(mypage.prop.firmorder) return;	// ������ʸ���ѹ��Բ�
		mypage.screenOverlay(true);
		var item_id = $(this).parent().siblings(':first').children('.itemid').text();
		var size_id = $(this).attr('id').split('_')[1];			// �ѹ����θ���ɽ������Ƥ��륵����ID
		var master_id = $(this).attr('alt').split('_')[0];		// �ѹ����θ��ߤΥޥ�����ID
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
	*	��ʸ�ꥹ�ȤΥ�����
	*	̤����
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
	*	�ץ��Ȥ�̵ͭ
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
			
			// 2011-12-30 �ѻ�
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
				exchink.prev('.pp_ink').find('.toggle_exchink').val('���ؤ���');
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
					if(!$('.toggle_exchink').val().match(/������/)){
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
			
			// 2011-12-30 �ѻ�
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
		// if(mypage.prop.firmorder) return;	// 2015-04-01 ������ʸ���ѹ��Ĥˤ���
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
		// if(mypage.prop.firmorder) return;	// 2015-04-01 ������ʸ���ѹ��Ĥˤ���
		$(this).prev().attr('readonly', true).val('');
		$(this).prevAll('img').attr({'src':'./img/circle.png', 'alt':''});
		$(this).parent('p').removeAttr('id');
		var index = $(this).parent('p').index()-1;
		mypage.calcPrintFee();
		mypage.prop.modified = true;
	});
	
	$('.toggle_exchink').live('click', function(){
		
		return;
		
		// 2011-12-30 �ѻ�
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
		if(val.match(/������/)){
			exchink.animate({width:w},{duration:150,queue:false});
			ppInfo.animate({width:'210px'},{duration:150,queue:false});
			$(this).val('���ؤ���');
		}else{
			ppInfo.animate({width:'0px', 'overflow-x':'scroll'},{duration:150,queue:false});
			exchink.animate({width:'310px'},{duration:150,queue:false});
			$(this).val('���ؤ��򤿤���');
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
		if(exch_count==0 && !$('.toggle_exchink').val().match(/������/)){
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
			my.prev().children('.pp_price').prepend('<p><input type="button" value="���" class="del_print_position" /></p>');
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
		if(mypage.prop.firmorder) return;	// ������ʸ���ѹ��Բ�
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
		if(mypage.prop.firmorder) return;	// ������ʸ���ѹ��Բ�
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
		if(mypage.prop.firmorder) return;	// ������ʸ���ѹ��Բ�
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
		if(mypage.prop.firmorder) return;	// ������ʸ���ѹ��Բ�
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

	/* 2011-11-29 �ѻ�
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
				  					$(this).text('���륯');
				  					txtPrice.text(mypage.addFigure(data[1]));
				  					break;
				  				case 'inkjet':
				  					$(this).text('���󥯥����å�');
				  					txtPrice.text(mypage.addFigure(data[1]));
				  					break;
				  				case 'trans':
				  					$(this).text('���顼ž��');
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
	*	���ơʥ���衦������ˡ��
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
			alert('�������륭����ɤ���ꤷ�Ƥ���������');
			return;
		}
		
		$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false, data:{'act':'search', 'mode':'customer', 'field1[]':field, 'data1[]':data}, 
			success:function(r){
				if(r instanceof Array){
					if(r.length==0){
						alert('��������������Ͽ����Ƥ��ޤ���');
					}else{
						mypage.prop.customer_list = r;
						if(r.length==1){
							mypage.setCustomer(0);
						}else{
							var list = '<table><thead><tr><th>����ֹ�</th><th>�ܵ�̾</th><th>ô��</th><th>TEL</th><th>E-Mail</th><th colspan="2">����</th></tr></thead><tbody>';
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
			$('#modify_customer').val('�����᤹').next().show();
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
							alert('��������������Ͽ����Ƥ��ޤ���');
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
			alert("�ܵ�̾��Ϣ�����Tel��E-Mail�Τ����줫�ˤ�ɬ�ܹ��ܤǤ���");
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
				// ��ʣ�����å��Ѥι��ܤ����
				if(elem[j].name.match(/^(company$)|(customername$)|(tel$)|(mobile$)|(email$)/)){
					chk = elem[j].value;
					if(elem[j].name.match(/^(tel$)|(mobile$)/)) chk = chk.replace(/-/g,"");
					chkField.push(elem[j].name);
					chkData.push(chk);
				}
				// ��Ͽ�ѥǡ���
				val = elem[j].value;
				if(elem[j].name.match(/^(tel$)|(fax$)|(mobile$)|(zipcode$)/)) val = val.replace(/-/g,"");
				field.push(elem[j].name);
				data.push(val);
			}
		}
		
		// ��Ͽ�ѥǡ���
		var note = f.customernote.value.trim();
		if(note!=""){
			field.push('customernote');
			data.push(note);
			f.customernote.value = note;
		}
		
		// ����No.�����
		var orders_id = $('#order_id').text()-0;
		field.push('orders_id');
		data.push(orders_id);
		
		// ��ʣ�Υ����å�
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
						isSave = confirm("�ܵҾ��󤬽�ʣ�����ǽ��������ޤ����������Ǥ�����\n\n1.�ϣˡ������Τޤ���¸���롣\n2.Cancel������¸�θܵҥꥹ�Ȥ������֡�");
						if(isSave) return;
						
						// ��¸�θܵҤ��ǧ
						mypage.prop.customer_list = r;
						var list = '<table><thead><tr><th>����ֹ�</th><th>�ܵ�̾</th><th>ô��</th><th>TEL</th><th>E-Mail</th><th colspan="2">����</th></tr></thead><tbody>';
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

		if( !confirm('�����;���򹹿����ޤ���\n������Ǥ�����') ) return;

		$.ajax({url:'./php_libs/ordersinfo.php', async:false, type:'post', dataType:'text', data:{'act':'update','mode':'customer', 'field1[]':field, 'data1[]':data}, 
			success:function(r){
				if(!r.match(/^\d+?$/)){
					alert('Error: 3048\n'+r);
				}
				if(r=='0'){
					alert('��������Ƥ��ޤ���');
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
		
		/* 2013-11-02 ��¸�Ѥ߼���θܵҥǡ����κ���������ѻ�
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
	*	�������������������γ���
	*/
	$('#switch_cyclebill').click(function(){
		$('#cyclebill_wrapper').slideToggle('normal', function(){
			$('#switch_cyclebill').val($('#switch_cyclebill').val()=="����"? "�Ĥ���": "����");
		});
	});
	
	
	/********************************
	*	�����ʬ����������ξ��ϲ���������롢�����������������ɽ��
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
						isReturn = confirm("Ǽ���轻�꤬��ʣ�����ǽ��������ޤ����������Ǥ�����\n\n1.�ϣˡ������Τޤ���Ͽ���롣\n2.Cancel������¸�θܵҥꥹ�Ȥ������֡�");
						if(isReturn) return;
						
						// ��¸�θܵҤ��ǧ
						isExist = true;
						var list = '<table><thead><tr><th>ID</th><th>���Ϥ���</th><th>����</th></tr></thead><tbody>';
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
			alert('���Ϥ������Ͽ�Ϥ���ޤ���');
			return;
		}
		$.ajax({
			url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false, 
			data:{'act':'search', 'mode':'delivery', 'field1[]':['customer_id'], 'data1[]':[customer_id]},
			success:function(r){
				if(r instanceof Array){
					mypage.prop.delivery_list = r;
					if(r.length>0){
						var list = '<table><thead><tr><th>ID</th><th>���Ϥ���</th><th>͹���ֹ�</th><th>����</th><th>TEL</th></tr></thead><tbody>';
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
						alert('���Ϥ������Ͽ�Ϥ���ޤ���');
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
	*	ȯ����
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
			alert('ȯ��������Ͽ�Ϥ���ޤ���');
			return;
		}
		$.ajax({
			url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false, 
			data:{'act':'search', 'mode':'shipfrom', 'field1[]':['customer_id'], 'data1[]':[customer_id]},
			success:function(r){
				if(r instanceof Array){
					mypage.prop.shipfrom_list = r;
					if(r.length>0){
						var list = '<table><thead><tr><th>ȯ����</th><th>͹���ֹ�</th><th>����</th><th>TEL</th></tr></thead><tbody>';
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
						alert('ȯ��������Ͽ�Ϥ���ޤ���');
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
	*	check options�����̤Τ�
	*/
   
   /* ���������̵�� */
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
	
	/* ����Υꥻ�å� */
	$('#reset_discount').click( function(){
		$(':input', '#discount_table').removeAttr('checked');
		$('#extradiscountname').val('');
		mypage.calcPrintFee();
		$('#discount_table').find('label').removeClass('fontred');
	});
	
	/* �Ұ���� */
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
	
	/* ����μ����� */
	$('#free_discount').change( function(){
		if($(this).attr('checked')){
			$('#discountfee').removeAttr('readonly').removeClass('readonly');
		}else{
			$('#discountfee').attr('readonly','readonly').addClass('readonly');
			mypage.calcPrintFee();
		}
	});
	
	
	/* �Ͱ�����������ϡ��ɲ����� */
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
		if($(this).val()=="2"){		// ��ޥȱ�͢
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
	*	questionnaire�����̤Τ�
	*/
	$('.purpose_text', '#questionnaire_table').focus(function(){
		if($(this).is('.other_1')){
			$(':radio[name="purpose"]','#questionnaire_table').val(["����¾���٥��"]);
		}else if($(this).is('.other_2')){
			$(':radio[name="purpose"]','#questionnaire_table').val(["����¾��˥ե�����"]);
		}else if($(this).is('.other_3')){
			$(':radio[name="purpose"]','#questionnaire_table').val(["����¾����"]);
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

	/* 2011-10-19 ��ǧ���֤��ѻ�
	$('input[name="confirm"]', '#confirm_list').change(function(){
		if($(this).val()=="yes"){
			var orders_id = $('#order_id').text()-0;
			var dt = new Date();
		    var orderdate = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
		    if( !mypage.confirm() ){
		    	alert('ɬ�ܹ��ܤ���Ͽ���ǧ���Ʋ�������');
		    	$('input[name="confirm"]', '#confirm_list').val(['no']);
		    	return;
		    }
		    orderdate = prompt("��ʸ����ꤵ���ޤ��������Ǥ�����\n�������г���������ꤷ�Ʋ�������",orderdate);
			if(!orderdate){
				$('input[name="confirm"]', '#confirm_list').val(['no']);
				return;
			}else{
				var val = orderdate.trim().replace(/[��-��]/g, function(m){
		    				var a = "��������������������";
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
				alert('���դ��ǧ���Ʋ�������');
				$('input[name="confirm"]', '#confirm_list').val(['no']);
				return;
			}

			// ����������������ؼ������Ͽ�ޤ�
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
	*	���դ�
	*/
	$('#add_cutpattern').click( function(){
		var tr = '<tr>';
		tr += '<td><input type="text" value="" class="shotname" /></td>';
		tr += '<td><input type="text" value="0" class="shot" class="forNum" /> �� �� <input type="text" value="0" class="sheets" class="forNum" /> ������</td>';
		tr += '<td><input type="button" value="���" class="del_cutpattern" /></td>';
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
			var mixture = '';			// ����ץ��ȤΥ��˥����
			var cnt = 0;				// �ץ��ȼ���ο�
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
			$.confbox('�ѹ����Ƥ���¸���ޤ�����', function(){
				if($.resConf.data=='yes'){
					var isReturn = true;
					if(!$('#tab_order').hasClass('headertabs')){
						isReturn = mypage.save('order');
					}else if(!$('#tab_direction').hasClass('headertabs')){
						isReturn = mypage.save('direction');
					}
					if(!isReturn){
						alert('��������ߤ��ޤ���');
					}else{
						show();
					}
				}else{
					return;
				}
			}, true);
		}else if($('#order_id').text()-0==0){
			alert('����ǡ�����̤��Ͽ�Ǥ���');
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
			alert('����ǡ�����̤��Ͽ�Ǥ���');
			return;
		}else{
			if(!$('#tab_order').hasClass('headertabs')){
				isReturn = mypage.save('order');
			}else if(!$('#tab_direction').hasClass('headertabs')){
				isReturn = mypage.save('direction');
			}
			if(!isReturn){
				alert('��������ߤ��ޤ���');
				return;
			}
		}
		
		// ��ʸ��̤����ξ��ܥ����̵���ˤ���
		var isFirmorder = ' disabled="disabled" ';
		if(mypage.prop.firmorder){
			isFirmorder = ' ';
		}
		
		var toolbox = '<div id="tool_inner">';
		toolbox +='			<h2>TOOL BOX</h2>';
		toolbox +='			<div class="clearfix">';
		toolbox +='				<div class="leftside">';
		toolbox +='					<h3>����<span>Print</span></h3>';
		toolbox +='					<div>';
		toolbox +='						<input type="button" value="���ѽ�" alt="print_estimation" />';
		toolbox +='						<input type="button" value="�����" alt="print_bill"'+isFirmorder+' />';
		toolbox +='						<input type="button" value="Ǽ�ʽ�" alt="print_delivery"'+isFirmorder+' />';
		//toolbox +='						<input type="button" value="����ɼ" alt="print_stock"'+isFirmorder+' />';
		toolbox +='					</div>';
		toolbox +='					<div>';
		toolbox +='						<p><label><input type="checkbox" value="1" class="bundle">Ʊ����ʸ��绻�����ᡦǼ�ʽ��</label></p>';
		toolbox +='					</div>';
		toolbox +='					<div style="display:none;">';
		toolbox +='						<input type="button" value="�ȥॹȯ���" disabled="disabled" alt="toms_edi" />';
		toolbox +='					</div>';
		
		toolbox +='					<div class="alt_address_wrap">';
		toolbox += '					<p><label><input type="checkbox" class="alt_address">�㤦��̾�ǰ�������</label></p>';
		toolbox +='						<table style="display:none;"><tbody>';
		toolbox +='						<tr><th>��̾</th><td><input type="text" value="" class="tool_alt_name"></td></tr>';
		toolbox +='						<tr><th>��</th><td><input type="text" value="" class="tool_alt_zipcode"></td></tr>';
		toolbox +='						<tr><th>����</th><td><textarea class="tool_alt_address"></textarea></td></tr>';
		toolbox +='						</tbody></table>';
		toolbox +='					</div>';
		
		toolbox +='					<div class="sender_address_wrap">';
		toolbox += '					<p><label><input type="checkbox" class="sender_address">�̤κ��пͤǰ�������</label></p>';
		toolbox +='						<table style="display:none;"><tbody>';
		toolbox +='						<tr><th>���̾</th><td><input type="text" value="" class="tool_sender_name"></td></tr>';
		toolbox +='						<tr><th>��</th><td><input type="text" value="" class="tool_sender_zipcode"></td></tr>';
		toolbox +='						<tr><th>����</th><td><textarea class="tool_sender_address"></textarea></td></tr>';
		toolbox +='						<tr><th>TEL</th><td><input type="text" value="" class="tool_sender_tel"></td></tr>';
		toolbox +='						<tr><th>FAX</th><td><input type="text" value="" class="tool_sender_fax"></td></tr>';
		toolbox +='						<tr><th>E-mail</th><td><input type="text" value="" class="tool_sender_email"></td></tr>';
		toolbox +='						<tr><th>ô����</th><td><input type="text" value="" class="tool_sender_staff"></td></tr>';
		toolbox +='						</tbody></table>';
		toolbox +='					</div>';
		
		toolbox +='				</div>';
		toolbox +='				<div class="rightside">';
		toolbox +='					<h3>�᡼��<span>E-mail</span></h3>';
		toolbox +='					<div>';
		toolbox +='						<input type="button" value="������" alt="mail_estimation" />';
		toolbox +='					</div>';
		toolbox +='					<div>';
		toolbox +='						<p>��ʸ����</p>';
		toolbox +='						<p><input type="button" value="��ʸ������" alt="mail_orderbank"'+isFirmorder+' /></p>';
		toolbox +='						<p><input type="button" value="��ʸ�����" alt="mail_ordercod"'+isFirmorder+' /></p>';
		toolbox +='						<p><input type="button" value="��ʸ������" alt="mail_ordercash"'+isFirmorder+' /></p>';
		toolbox +='						<p><input type="button" value="��ʸ��������" alt="mail_ordercredit"'+isFirmorder+' /></p>';
		toolbox +='						<p><input type="button" value="��ʸ������ӥ�" alt="mail_orderconbi"'+isFirmorder+' /></p>';
//		toolbox += '					<p><label><input type="checkbox" value="1" id="notRegistForTLA">TLA���С�����Ͽ���ʤ�</label></p>';
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
	
	
	// �̤ΰ�������ϥե������ɽ������
	$('.leftside .alt_address','#modalBox').live('click', function(){
		if($(this).attr('checked')){
			$(this).closest('p').next().show();
		}else{
			$(this).closest('p').next().hide();
			$('#tool_inner .leftside .alt_address_wrap input').val('');
		}
	});
	
	
	// �̤κ��пͤ����ϥե������ɽ������
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
		var doctype = '';	// Ǽ�ʽ�(delivery)�������(bill)�Τɤ��餫
		var parm = [];		// �᡼�������⥸�塼����Ϥ��ǡ�������
		var myname = $(this).attr('alt');
		var orders_id = $('#order_id').text()-0;
		var discountfee = $('#est_discount').text().replace(/,/g, '') - 0;
		var discount_name = [];		// ���̤λ��Τ߳������
		var alt_addr = '';
		var sender_addr = '';
		var bundle = false;
		
		if(discountfee!=0 && mypage.prop.ordertype=="general"){
			// ����
			var discount = $('input[name="discount1"]:checked', '#optprice_table').val();
			switch(discount){
				case 'student':discount_name.push('�س�');break;
				case 'team2':discount_name.push('2���饹��');break;
				case 'team3':discount_name.push('3���饹��');break;
			}
			// ����
			discount = $('input[name="discount2"]:checked', '#optprice_table').val();
			switch(discount){
				case 'repeat':discount_name.push('��ԡ�������');break;
				case 'introduce':discount_name.push('�Ҳ��');break;
				case 'vip':discount_name.push('VIP��');break;
			}
			// ʣ����
			$('input[name="discount"]:checked', '#discount_table').each( function(){
				if($(this).val()=='blog'){
					discount_name.push('�֥���');
				}else if($(this).val()=='quick'){
					discount_name.push('���');
				}else if($(this).val()=='illust'){
					discount_name.push('������');
				}
			});
			// ����¾���
			if($('input[name="extradiscount"]:checked', '#discount_table').length){
				discount_name.push($('#extradiscountname').val());
			}
		}
		discount_name = discount_name.join(', ');
		
		// Ʊ����ʸ��绻������
		if($('.bundle','#modalBox').attr('checked')){
			bundle = true;
		}
		
		// �̤ΰ�̾����Ѥ�����
		if($('.alt_address','#modalBox').attr('checked')){
			alt_addr = '&altname='+encodeURIComponent($('.tool_alt_name','#modalBox').val());
			alt_addr += '&altzipcode='+encodeURIComponent($('.tool_alt_zipcode','#modalBox').val());
			alt_addr += '&altaddress='+encodeURIComponent($('.tool_alt_address','#modalBox').val());
		}
		
		// �̤κ��пͤ���Ѥ�����
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
		case 'print_estimation':	// ���ѽ�
			$('.closeModalBox', '#modalBox').click();
			if($("#est_total_price").text()==0){
				alert("�����Ѥ�����ޤ���");
				break;
			}
			
			//$('#printform').remove();
			//$('#printform_wrapper').html('<iframe id="printform" name="printform"></iframe>');
			url = './documents/estimatesheet.php?orderid='+orders_id+'&param='+encodeURIComponent(discount_name)+alt_addr+sender_addr;
			window.open(url,'printform');
			$('#printform').load(function(){window.frames['printform'].print();});
			
			//window.open(url);
			break;
			
		case 'print_bill':			// �����
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
			
		case 'print_delivery':		// Ǽ�ʽ�
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
			
		case 'print_stock':		// ����ɼ
			doctype = myname.split('_')[1];
			$('.closeModalBox', '#modalBox').click();
			
               //$('#printform').remove();
               //$('#printform_wrapper').html('<iframe id="printform" name="printform"></iframe>');
               
               url = './documents/checkarrival.php?sheet_type=label&id='+orders_id;
               window.open(url,'printform');
               $('#printform').load(function(){window.frames['printform'].print();});
               
               //window.open(url);
               
			break;

		case 'print_direction':		// ����ؼ���
			
			break;

		case 'mail_estimation':		// ������
		case 'mail_orderbank':		// ��ʸ���ꡡ����
		case 'mail_ordercod':		// ��ʸ���ꡡ���
		case 'mail_ordercash':		// ��ʸ���ꡡ�������
		case 'mail_ordercredit':	// ��ʸ���ꡡ�����ɷ��
		case 'mail_orderconbi':	// ��ʸ���ꡡ����ӥ˷��
			$('.closeModalBox', '#modalBox').click();
			if(document.forms.customer_form.email.value==""){
				alert("�᡼�륢�ɥ쥹����Ͽ������ޤ���");
				break;
			}
			if(mypage.prop.ordertype=='industry'){
				if($('#total_estimate_cost').text()=="0"){
					alert("���������Ƥ�����ޤ���");
					break;
				}
			}else{
				if($('#est_total_price').text()=="0"){
					alert("���������Ƥ�����ޤ���");
					break;
				}
			}
			
			//$(document).scrollTop(0);
			var act = myname.split('_')[1];
			var isRegistForTLA = 0;
			if($('#notRegistForTLA').is(':checked')){
				isRegistForTLA = 1;	// TLA���С���Ͽ�ʤ�
			}
			parm = new Array(isRegistForTLA, orders_id, discount_name);
			mypage.sendmail(act, parm);
			break;
			
		case 'mail_test':		// �᡼��ƥ���
			$(document).scrollTop(0);
			if(document.forms.customer_form.email.value==""){
				alert("�᡼�륢�ɥ쥹����Ͽ������ޤ���");
				break;
			}
			if(mypage.prop.ordertype=='industry'){
				if($('#total_estimate_cost').val()=="0"){
					alert("���������Ƥ�����ޤ���");
					break;
				}
			}else{
				if($('#est_total_price').val()=="0"){
					alert("���������Ƥ�����ޤ���");
					break;
				}
			}


			var act = myname.split('_')[1];
			parm = new Array(orders_id, discount_name);

			$('.closeModalBox', '#modalBox').click();

			mypage.sendmail(act, parm);
			break;

		case 'mail_shipped':		// ȯ�����ޤ���
			/*
			var enquiry_num = prompt('����礻�ֹ�',"");
			if(enquiry_num===null){	// cancel
				alert('ȯ�����Υ᡼�����������ߤ��ޤ���');
				$('.closeModalBox', '#modalBox').click();
				return;
			}

			enquiry_num = enquiry_num.trim();
			parm = new Array(orders_id, discount_name, enquiry_num);
			
			$('.closeModalBox', '#modalBox').click();
			mypage.sendmail('shipped', orders_id);
			*/
			break;

		case 'toms_edi':			// �ȥॹȯ���
		/*
		*	2011/04/28 ���ߡ���ǽ��α
		
			$.ajax({url: './php_libs/dbinfo.php', type: 'POST', async: false,
				data: {'act':'itemsByToms','orders_id':orders_id}, success: function(r){
					r = r.trim();
					if(!r.match(/^\d/)){
						alert('Error: p2742\n'+r);
						return;
					}
					var data = r.split('|');
					if(data[0]==0){
						alert('�����ֹ� '+orders_id+' �˥ȥॹ�ξ��ʤϤ���ޤ���');
					}else{
						var msg = "�ȥॹ��ȯ�����������ɤ��ޤ���\n������Ǥ�����";
						if(data[1]==""){
							msg = "ȯ��ô���Ԥ����ꤵ��Ƥ��ޤ���\n\n" + msg;
						}else{
							msg = "��ȯ��ô����"+data[1]+"��\n\n" + msg;
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
	*	2011-10-19 ��ǧ���֤��ѻ�
	*
	$('#confirm_footer form img').click(function(){
		var act = $(this).attr('alt');
		if(act=="orderconfirm"){
			var tmp = "";
			var html = '<h1>�����ϥޥ饤�ե����ȡ�������������ƥ�</h1>';
			html += '<p>����ô����'+$('#reception option:selected').text()+'</p>';
			var created = $('#created').text().replace(/(\/)|(-)/g,'');
			var orders_id = $('#order_id').text();
			var mydir = created + orders_id;
			var pinfoid = 0;

			$('#confirm_wrapper .maincontents .phase_box:lt(10)').each(function(index){
				if(index==0){		// ��å����������
					html += '<div class="phase_box"><div class="inner">'+$('.confirmtitle').next().html()+'</div></div>';
				}else if(index==3){		// �ץ��Ȱ���
					html += '<div class="phase_box">';
					html += '	<div class="inner">';
					html += '		<table class="confirm_table" style="border-collapse: collapse;">';
					html += '			<thead>';
					html += '				<tr>';
					html += '					<th colspan="4">�ץ��Ȱ���</th>';
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

							var compo_path;		// �������줿�ץ��Ȱ��ֲ����ؤΥѥ�
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

				}else if(index==4){		// ���󥯿��ؤ�
					html += '<div class="phase_box">'+$(this).html().replace(/<span(.*?)\/span>/i,'')+'</div>';

				}else if(index==9){		// ������
					html += '<div class="phase_box"><div class="inner">';
					html += '<table class="confirm_table"><thead><tr><th class="last">������</th></tr></thead>';
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
	*	�ȼԤθ������٤�Ŧ�פǥ����ȥ���ץ꡼��
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
				if(code.match(/^01\d$/)){			// ���륯�̾���
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
				}else if(code.match(/^02\d$/)){	// ���륯��������
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
				}else if(code.match(/^03\d$/)){	// �ǥ�����ž�̥�������
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
				}else if(code.match(/^04\d$/)){	// �ǥ�����ž�̥ץ쥹��
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
	*	�ܥ��󥹥�����
	*/
	// $( "#estimation_toolbar .add_row, #orderlist tfoot tr.estimate .delete_row" ).button();
	//$('#tool_inner input[type="button"]').button();
	$('#free_discount, #free_printfee').button();

	// unload
	window.addEventListener('beforeunload', function(event) {
    	if(mypage.prop.modified && !$('body').is('.main_bg')) {
			return event.returnValue = '��¸����Ƥ��ʤ��ǡ���������ޤ����Խ����Ƥ��˴�����ޤ���������Ǥ�����';
			/*
    		if(confirm('�ѹ����Ƥ���¸���ޤ�����')){
    			var res = true;
				if(!$('#tab_order').hasClass('headertabs')){
					res = mypage.save('order', false);
				}else if(!$('#tab_direction').hasClass('headertabs')){
					res = mypage.save('direction');
				}
				if(!res){
					event = event || window.event;
					return event.returnValue = '��¸�����ǥ��顼��ȯ�����ޤ�����';
				}
			}else{
				if(($('#order_id').text()-0)==0 && $(':radio[name="firstcontact"]:checked').val()=="yes"){
					if($('#reception').val()==""){
						alert('����ô���Ԥ���ꤷ�Ʋ�������');
						event = event || window.event;
						return event.returnValue = '����ô���Ԥ���ꤷ�Ʋ�������';
					}
					// �����䤤��碌����򥫥����
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
			alert('�᡼�륢�ɥ쥹�ǤϤ���ޤ���');
			return;
		}

		/*	RFC2822 addr_spec ���ѥ�����							*/
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
					alert('OK!\n��ǧ�᡼����������Ƥ���������');
				}else{
					alert('�᡼�륢�ɥ쥹���ǧ���Ƥ���������');
				}
			}else{
				alert('@�ޡ���������ǧ���Ƥ���������');
			}
		});
	});

	
	/********************************
	*	dhtmlx ComboBox
	*
	dhtmlx.skin = "dhx_skyblue";
	$.dhx.Combo = new dhtmlXCombo("mesh", "alfa", 90);
	$.dhx.Combo.addOption([["120", 120], ["80", 80], ["80-120", "80-120"], ["����¾", "����¾"]]);
	*/
});
