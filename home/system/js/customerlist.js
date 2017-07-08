/*
*	タカハマライフアート
*	顧客一覧
*	charset euc-jp
*/

	$(function(){

/***************************************************************************************************************************
*
*	main page module
*
****************************************************************************************************************************/

		$('input[type="button"], .btn_pagenavi, .act', '#main_wrapper').live('click', function(){
			mypage.main('btn', $(this));
		});
		
		
		/********************************
		*	hide overlay
		*/
		$('#overlay').click( function(){
			if($('.popup_wrapper:visible').length){
				$('.popup_wrapper:visible').fadeOut();
			}
			if($('#delivery_wrapper:visible').length){
				$('#delivery_wrapper:visible').fadeOut();
			}
			mypage.screenOverlay(false);
		});
		
		
		/********************************
		*	popup window
		*/
		$('.close_popup').live('click', function(){
			$('.popup_wrapper').fadeOut();
			if($('#result_delivery_wrapper:visible')){
				return;
			}
			mypage.screenOverlay(false);
		});
		$('.close_popup_deli').live('click', function(){
			$('#delivery_wrapper').fadeOut();
			mypage.screenOverlay(false);
		});
		
		
		/********************************
		*	cycle billing info
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
		*	customer number 一般k000000、業者g0000 
		*/
		$('#searchtop_form input[name=number]').change( function(){	
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
		
		
		/* init */
		$(window).one('load', function(){
			document.forms.searchtop_form.number.focus();
			if(_ID!="") document.forms.searchtop_form.id.value = _ID;
			
			//mypage.main('btn', $('input[title="search"]'));
		});
	});
	
	var mypage = {
		prop: { 'holidayInfo':{},
				'searchdata':[],		// 検索結果の全データ
				'delidata':[],			// 当該顧客のお届け先データ
				'params':''				// 受注画面への遷移の際に渡すクエリストリング
		},
		screenOverlay: function(mode){
			var body_w = $(document).width();
			var body_h = $(document).height();
			if(mode){
				$('#overlay').css({'width': body_w+'px',
									'height': body_h+'px',
									'opacity': 0.5}).show();
			}else{
				$('#overlay').css({'width': '0px',	'height': '0px'}).hide("1000");
			}
		},
		delete_customer: function(){
			var i = 0;
			var number = $('#customer_num').text().trim();
			var customer_id = document.forms.input_form.customer_id.value;
			if(number=="" || customer_id=="") return;
			
			var customername = $('#customername').val();
			var field1 = ['customer_id'];
			var data1 = [customer_id];
			
			if(!confirm(number+" "+customername+" 様の顧客データと\n関連する受注並びにお届け先データも削除されます\nよろしいですか？")) return;
			
			$.ajax({
				url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'delete','mode':'customer', 'field1[]':field1, 'data1[]':data1},async: false,
 				success: function(r){
					if( !r.match(/^\d+?$/) ) alert('Error: p109\n'+r);
					document.forms.input_form.reset();
					document.forms.input_form.customer_id.value = '';
					$('#customer_num').text('');	// reset ID
					$('.popup_wrapper').fadeOut();
					$('#detail_lists').remove();
					$('#detail_wrapper').hide();
					$('#result_searchtop').html('');
					$('#result_wrapper, #result_searchtop').show();
					mypage.main('btn', $('input[title="search"]'));
				}
 			});
		},
	    update_customer: function(my){
	    	var number = $('#customer_num').text().trim();
			var f = document.forms.input_form;
			if( f.customername.value=="" || (f.tel.value=="" && f.mobile.value=="" && f.email.value=="") ){
				alert('顧客情報の必須項目を確認してください。\n顧客名とご連絡先（TEL、E-mail の何れか）');
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
				if(elem[j].type == "text" || elem[j].type == "select-one" || elem[j].type=="textarea"){
					// 重複チェック用の項目を取得
					if(elem[j].name.match(/^(company$)|(customername$)||(tel$)|(mobile$)|(email$)/)){
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
			field.push('customer_id');
			data.push(f.customer_id.value);

			field.push('from_ordersystem');
			data.push('1');

			// 重複のチェック
			chkField.push('customer');
			chkData.push(true);
			var isSave = true;
			$.ajax({
				url:'./php_libs/ordersinfo.php', type:'POST', dataType:'text', async:false,
				data:{'act':'search', 'mode':'dedupe', 'field1[]':chkField, 'data1[]':chkData},
				success:function(r){
					if(r=="") return; // 重複なし
					r = $.getDelimiter(r);
					var lines = r.split($.delimiter['rec']);
					var list = '<table><thead><tr><th>顧客ID</th><th>顧客名</th><th>担当者</th><th>TEL</th><th>E-Mail</th><th colspan="2">住所</th></tr></thead><tbody>';
					for(var i=0; i<lines.length; i++){
						var data = lines[i].split($.delimiter['fld']);
						var res = [];
						for(var j=0; j<data.length; j++){
							var a = data[j].split($.delimiter['dat']);
							res[a[0]] = a[1];
						}
						list += '<tr>';
						list += '<td>'+res['number']+'</td>';
						list += '<td>'+res['customername']+'</td>';
						list += '<td>'+res['company']+'</td>';
						list += '<td>'+res['tel']+'</td>';
						list += '<td>'+res['email']+'</td>';
						list += '<td>'+res['addr0']+res['addr1']+'</td>';
						list += '<td style="display:none;">'+res+'</td>';
						list += '</tr>';
					}
					list += '</tbody>';

					if(lines.length>1){
						isSave = confirm('顧客情報が重複する可能性があります、よろしいですか？\n\n1.そのまま保存する場合には「ＯＫ」をクリックして下さい。\n\n2.既存の顧客情報を確認する場合は「Cancel」をクリックして下さい。\n一覧を表示します。');
					}

					if(!isSave){
						$('.result_list', '#result_customer_wrapper').html(list);
						mypage.screenOverlay(true);
						$('#result_customer_wrapper').show('normal');
					}
				}
			});

			if(!isSave) return;

			if( !confirm('顧客情報を更新します。\nよろしいですか？') ) return;
			var action = $(my).attr('title');
			$.post('./php_libs/ordersinfo.php', {'act':action,'mode':'customer', 'field1[]':field, 'data1[]':data}, function(r){
//				if(!r.match(/^\d+?$/)){
//					alert('Error: p211\n'+r);
//					return;
//				}
				document.forms.input_form.reset();
				document.forms.input_form.customer_id.value = '';
				if(action=="update"){
					$('#cyclebill_wrapper').slideUp();
					$('#switch_cyclebill').val("開く");
					$('#customer_num').text('');	// reset ID
					$('#detail_lists').remove();
					$('#detail_wrapper').hide();
					$('input[title="search"]').click();
				}else{
					document.forms.input_form.company.focus();
				}
			});

		},
		getAddr:function(id,mode){
			if($('#'+id).attr('readonly')) return;
			var val = $('#'+id).val();
			if(mode=="zipcode"){
				if(!this.check_zipcode(val)) return;
			}
			$.post('./php_libs/getAddr.php', {'mode':mode,'parm':val}, function(r){
				var addr = "";
				var list = '<ul>';
				var lines = r.split(';');
				if(lines.length>0){
					var form = arguments.length==2? 'customer': 'delivery';
					for(var i=0; i<lines.length; i++){
						addr = lines[i].split(',');
						list += '<li onclick="mypage.setAddr(\''+form+'\',\''+addr[0]+'\',\''+addr[1]+'\',\''+addr[2]+'\',\''+addr[3]+'\')">'+addr[0]+' '+addr[1]+addr[2]+addr[3]+'</li>';
					}
					list += '</ul>';
					if(arguments.length==2){
						$('#address_list1').html(list);
						$('#address_wrapper1').fadeIn('normal');
					}else{
						$('.result_list', '#result_delivery_wrapper').html(list);
						$('#result_delivery_wrapper').fadeIn('normal');
					}
				}
			});
		},
		setAddr: function(form,zipcode,addr0,addr1,addr2){
			if(form=="customer"){
				$('#zipcode1').val(zipcode).blur();
				$('#addr0').val(addr0);
				$('#addr1').val(addr1);
				$('#addr2').val(addr2);
				$('#address_wrapper1').fadeOut('normal', function(){$('#address_list1').html('');});
				mypage.screenOverlay(false);
			}else{
				$('#zipcode2').val(zipcode).blur();
				$('#deliaddr0').val(addr0);
				$('#deliaddr1').val(addr1);
				$('#deliaddr2').val(addr2);
				$('#result_delivery_wrapper').fadeOut('normal', function(){$('.result_list', '#result_delivery_wrapper').html('');});
			}
		},
		check_zipcode:function(zipcode){
		  if( ! zipcode ) return false;
		  if( 0 == zipcode.length ) return false;
		  if( ! zipcode.match( /^[0-9]{3}[-]?[0-9]{0,4}$/ ) ) return false;

		  return true;
		},
		showDeliveryform: function(index){
			var data = mypage.prop.delidata[index];
			var elem = document.forms.delivery_form.elements;
			for (var j=0; j < elem.length; j++) {
				if(elem[j].type!="text") continue;
				elem[j].value = data[elem[j].name];
			}
			mypage.screenOverlay(true);
			$('#delivery_wrapper').show('normal');
		},
		modifyID: function(my, id){
			var newID = $(my).prev().val();
			if(!newID){
				alert("IDを指定してください。");
				return;
			}
			var res = false;
			$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:false,
				data:{'act':'search','mode':'delivery', 'field1[]':["delivery_id"], 'data1[]':[newID]}, success:function(r){
					if(r instanceof Array){
						var msg = "お届け先情報を以下のデータに変更します。\n\n";
						msg += "ID: "+r[0]["delivery_id"]+"\n";
						msg += "お届け先： "+r[0]["organization"]+"\n";
						msg += "住所： "+r[0]["deliaddr0"]+r[0]["deliaddr1"]+r[0]["deliaddr2"];
						if( confirm(msg+"\nよろしいですか？") ){
							res = true;
						};
					}
				}
			});
			if(!res) return;
			
			var field = ['modify', 'id'];
			var data = [newID, id];
			$.post('./php_libs/ordersinfo.php', {'act':'update','mode':'delivery', 'field1[]':field, 'data1[]':data}, function(r){
				if(!r.match(/^\d+?$/)){
					alert('Error: p320\n'+r);
					return;
				}
				document.forms.delivery_form.reset();
				$('#delivery_wrapper').fadeOut();
				mypage.screenOverlay(false);
				$('input[title="search"]').click();
			});
		},
		update_delivery: function(){
			var f = document.forms.delivery_form;
			var id = f.delivery_id.value;
			if( f.organization.value=="" || f.deliaddr0.value=="" || f.deliaddr1.value=="" ){
				alert('お届け先情報の必須項目を確認してください。\nお届先と住所');
				return;
			}
			
			var elem = f.elements;
			var field = new Array();
			var data = new Array();
			var val = "";
			for (var j=0; j < elem.length; j++) {
				if(elem[j].type == "text" || elem[j].type == "select-one" || elem[j].type=="textarea"){
					val = elem[j].value;
					if(elem[j].name.match(/^(tel$)|(fax$)|(mobile$)|(zipcode$)/)) val = val.replace(/-/g,"");
					field.push(elem[j].name);
					data.push(val);
				}
			}
			if( !confirm('お届け先情報を更新します。\nよろしいですか？') ) return;
			$.post('./php_libs/ordersinfo.php', {'act':'update','mode':'delivery', 'field1[]':field, 'data1[]':data}, function(r){
				if(!r.match(/^\d+?$/)){
					alert('Error: p330\n'+r);
					return;
				}
				document.forms.delivery_form.reset();
				$('#delivery_wrapper').fadeOut();
				mypage.screenOverlay(false);
				$('input[title="search"]').click();
			});
		},
		setQuery: function(my){
		/* 受注入力画面のへのアンカーにスクロール状態を追加 */
			var self = $(my);
			var href = self.attr('href')+'&scroll='+$('#result_searchtop').scrollTop();
			self.attr('href', href);
		},
		main: function(func){
			var LEN = 20;
			var start_row = _start_row!=0? _start_row: $('.pos_pagenavi').text().split('-')[0]-0;
			var btn = function(my){
				var myTitle = my.attr('title');
				var result_len = $('#result_count').text()-0;
				switch(myTitle){
					case 'next':
						if(result_len==0 || $('.pos_pagenavi').text().split('-')[1]-0==result_len) return;
						start_row = start_row-1+LEN;
						$('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility','visible');
						if(start_row+LEN>=result_len){
							$('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility','hidden');
						}
						break;
					case 'previous':
						if(result_len==0 || start_row==1) return;
						start_row -= (LEN+1);
						if(start_row<0) start_row = 0;
						$('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility','visible');
						if(start_row==0){
							$('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility','hidden');
						}
						break;
					case 'last':
						if(result_len==0 || $('.pos_pagenavi').text().split('-')[1]-0==result_len) return;
						start_row = start_row-1+LEN;
						while(start_row<result_len){
							start_row += LEN;
						}
						start_row -= LEN;
						$('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility','visible');
						$('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility','hidden');
						break;
					case 'first':
						if(result_len==0 || start_row==1) return;
						start_row = 0;
						$('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility','visible');
						$('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility','hidden');
						break;
					case 'search':
						start_row = _detail!=""? _start_row: 0;
						$('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility','hidden');
						$('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility','hidden');
						break;
					case 'check_email':
						/* check email*/
						var email = document.forms['input_form'].email.value;
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
						return;
						break;
					default:
						return;
						break;
				}
				if(myTitle!='search'){
					showList();
				}else{
					search();
				}
			}
			
			var search = function(){
				// 一覧の開始行を保持
				_start_row = start_row;
				if($('#detail_wrapper').is(':visible')){
					display.result();
				}
				var field = [];
				var data = [];
				var elem = document.forms.searchtop_form.elements;
				
				// 受注画面への遷移の際に渡すクエリストリングを初期化
				mypage.prop.params = '&filename=customerlist';
				for (var j=0; j < elem.length; j++) {
					if(elem[j].type=="text" || elem[j].type=="select-one" || elem[j].name=='id' || elem[j].type=="textarea"){
						field.push(elem[j].name);
						var tmp = (elem[j].value).trim();
						if(elem[j].name.match(/^tel$|^fax$|^mobile$|^zipcode$/)){
							data.push(tmp.replace(/-/g,""));
						}else{
							data.push(tmp);
						}
						
						// クエリストリング
						if(tmp!='' && elem[j].name!='id') {
							mypage.prop.params += '&'+elem[j].name+'='+tmp;
						}
					}
				}
				document.forms.searchtop_form.id.value = '0';	// 非表示のIDを初期化しておく
				$('#result_searchtop').html('<p class="alert">検索中 ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
				$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:true,
					data:{'act':'search','mode':'customer', 'field1[]':field, 'data1[]':data}, success:function(r){
						if(r instanceof Array){
							if(r.length==0){
								$('#result_searchtop').html('<p class="alert">該当するデータが見つかりませんでした</p>');
								mypage.prop.searchdata = [];
							}else{
								mypage.prop.searchdata = r;
								if(r.length>LEN){
									$('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility','visible');
								}
								showList();
							}
						}else{
							$('#result_searchtop').html('');
							alert('Error: p393\n'+r);
						}
					},error: function(XMLHttpRequest, textStatus, errorThrown) {
						$('#result_searchtop').html('');
						alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
					}
				});
			}
			
			var showList = function(){
				var info = mypage.prop.searchdata;
				if(info.length>0){
					var result_len = info.length;
					$('#result_count').text(result_len);
					if(start_row+LEN<=result_len) result_len = start_row+LEN;
					$('.pos_pagenavi').text(start_row+1+'-'+result_len);
					var number = '';
					var list = "<tbody>";
					var head = '<table><thead><tr><th rowspan="2">顧客ID</th><th rowspan="2">登録サイト</th><th>ふりがな</th><th>住　所</th><th>電話番号</th></tr>';
					head += '<tr><th>顧客名</th><th>担当者</th><th>E-mail</th></tr></thead>';
					for(var i=start_row; i<result_len; i++){
						if(info[i]['cstprefix']=='g'){
							number = 'G'+("0000"+info[i]['number']).slice(-4);
						}else{
							number = 'K'+("000000"+info[i]['number']).slice(-6);
						}
						list += '<tr>';
						list += '<td rowspan="2" class="rowline">'+number+'<p class="act" title="detail">[ 入力フォーム ]<span style="display:none">'+info[i]['id']+'</span></p></td>';
						var reg_site ="takahama428";
						if(info[i]['reg_site'] == "5") {
							reg_site ="sweatjack";
						} else if(info[i]['reg_site'] == "6") {
							reg_site ="staff-tshirt";
						}
						list += '<td rowspan="2" class="rowline">'+ reg_site +'</td>';
						list += '<td>'+info[i]['customerruby']+'</td>';
						list += '<td><p>〒 '+$.zip_mask(info[i]['zipcode'])+'　'+info[i]['addr0']+info[i]['addr1']+'</p><p>'+info[i]['addr2']+'</p></td>';
						list += '<td>'+$.phone_mask(info[i]['tel']).c+'</td>';
						list += '</tr><tr class="rowseparate">';
						list += '<td>'+info[i]['customername']+'</td>';
						list += '<td>'+info[i]['company']+'</td>';
						list += '<td>'+info[i]['email']+'</td>';
						list += '</tr>';
					}
					list += '</tbody></table>';
					var html = head + list;
					//$('#main_wrapper fieldset').hide();
					$('#result_searchtop').html(html);
					$('#result_wrapper, #result_searchtop').show();
				}else{
					$('#result_count').text('0');
					$('.pos_pagenavi').text('');
					$('#result_searchtop').html('');
				}
			}
			
			var display = {
				detail: function(){
					_detail = '';
					var customer_id = arguments[0];
					mypage.prop.delidata = [];
					$.ajax({url:'./php_libs/ordersinfo.php', type: 'POST', dataType: 'json', async: true,
						data: {'act':'search', 'mode':'customer', 'field1[]':['updateform','id'], 'data1[]':[true,customer_id]},success: function(r){
	 						if(r instanceof Array){
								if(r.length==0){
									alert('顧客データが見つかりません。');
								}else{
									var info = r;
									var tmp = [];
									var deli = '';
									var orders = '';
									mypage.prop.delidata = r;
									for(i=0; i<info.length; i++){
										//var key = info[i]['organization']+info[i]['deliaddr1']+info[i]['deliaddr2'];
										//if(typeof tmp[key] == 'undefined' && (info[i]['delivery_id']!=0 && info[i]['delivery_id']!=null)){
											//tmp[key] = info[i];
											deli += '<tr>';
											deli += '<td>';
											deli += '<input type="text" value="" class="newID forBlank">';
											deli += '<input type="button" value="ID付替え" onclick="mypage.modifyID(this,'+info[i]['delivery_id']+');">';
											deli += '</td>';
											deli += '<td>'+info[i]['delivery_id']+'</td>';
											deli += '<td>'+info[i]['organization']+'</td>';
											deli += '<td>'+info[i]['agent']+' '+info[i]['team']+' '+info[i]['teacher']+'</td>';
											deli += '<td>〒 '+$.zip_mask(info[i]['delizipcode'])+' '+info[i]['deliaddr0']+info[i]['deliaddr1']+' '+info[i]['deliaddr2']+'</td>';
											deli += '<td>'+$.phone_mask(info[i]['delitel']).c+'</td>';
											deli += '<td><input type="button" value="編集" onclick="mypage.showDeliveryform('+i+');"></td>';
											deli += '</tr>';
										//}
										
										/* 2014-10-04 受付状況を廃止
										if(info[i]['customer_id']==0 || info[i]['customer_id']==null) continue;
										orders += '<tr>';
										orders += '<td class="centering">'+info[i]['created']+'</td>';
										orders += '<td class="centering"><a href="./main.php?req=orderform&pos=428&order='+info[i]['orders_id']+mypage.prop.params+'&customer_id='+info[i]['customer_id']+'&start_row='+_start_row+'">'+info[i]['orders_id']+' <img alt="受注画面へ" src="./img/link.png" width="10" /></a></td>';
										orders += '<td>'+info[i]['maintitle']+'</td>';
										orders += '<td class="toright">&yen; '+$.addFigure(info[i]['estimated'])+'</td>';
										if(info[i]['deposit']=='2'){
											orders += '<td class="centering">入金済み</td>';
										}else{
											orders += '<td class="centering fontred">未入金</td>';
										}
										if(info[i]['progress_id']=='6'){
											orders += '<td>受注取消</td>';
										}else if(info[i]['shipped']==2){
											orders += '<td>発送済み</td>';
										}else if(info[i]['progress_id']=='4'){
											orders += '<td>注文確定</td>';
										}else{
											orders += '<td class="fontred">未決</td>';
										}
										orders += '</tr>';
										*/
									}
									
									var number = 0;
									if(info[0]['cstprefix']=='g'){
										number = 'G'+("0000"+info[0]['number']).slice(-4);
									}else{
										number = 'K'+("000000"+info[0]['number']).slice(-6);
									}
									$('#customer_num').text(number);
									var reg_site =info[0]['reg_site'];
									$('#reg_site').val(reg_site);
									var f = document.forms.input_form;
									f.customer_id.value = customer_id;
									f.cstprefix.value = info[0]['cstprefix'];
									f.company.value = info[0]['company'];
									f.companyruby.value = info[0]['companyruby'];
									f.customername.value = info[0]['customername'];
									f.customerruby.value = info[0]['customerruby'];
									f.tel.value = $.phone_mask(info[0]['tel']).c;
									f.fax.value = $.phone_mask(info[0]['fax']).c;
									f.mobile.value = $.phone_mask(info[0]['mobile']).c;
									f.email.value = info[0]['email'];
									f.mobmail.value = info[0]['mobmail'];
									f.zipcode.value = $.zip_mask(info[0]['zipcode']);
									f.addr0.value = info[0]['addr0'];
									f.addr1.value = info[0]['addr1'];
									f.addr2.value = info[0]['addr2'];
									f.addr3.value = info[0]['addr3'];
									f.addr4.value = info[0]['addr4'];
									$(f.job).val(info[0]['job']);
									f.customernote.value = info[0]['customernote'];
									f.bill.value = info[0]['bill'];
									//f.sales.value = info[0]['sales'];
									//f.receipt.value = info[0]['receipt'];
									f.cyclebilling.value = info[0]['cyclebilling'];
									f.cutofday.value = info[0]['cutofday'];
									f.paymentday.value = info[0]['paymentday'];
									f.remittancecharge.value = info[0]['remittancecharge'];
									//f.consumptiontax.value = info[0]['consumptiontax'];
									
									// 請求区分が都度請求の場合に回収サイクル、締め日、回収日を非表示
									if(info[0]['bill']==1){
										$('tbody tr:first th:gt(0), tbody tr:first td:gt(0)','#cyclebill_wrapper').hide();
									}else{
										$('tbody tr:first th:gt(0), tbody tr:first td:gt(0)','#cyclebill_wrapper').show();
									}
									$('#cyclebill_wrapper').hide();
									
									var list = '<div id="detail_lists">';
									list += '<div class="title">● お届け先</div>';
									list += '<div class="clear">';
									
									if(deli!=''){
										list += '<table><thead><tr><th></th><th>ID</th><th>お届け先名</th><th>担　当</th><th>住　所</th><th>連絡先</th><th></th></tr></thead><tbody>';
										list += deli;
										list += '</tbody></table>';
									}else{
										list += '<p>お届け先の登録はありません</p>';
									}
									list += '</div>';
									/* 2014-10-04 受付状況を廃止
									list += '<div class="title">● 受付状況</div>';
									list += '<div class="clear">';
									if(orders!=''){
										list += '<table class="orderresults"><thead>';
										list += '<tr><th>受注日</th><th>受注No.</th><th>タイトル</th><th>受注額</th><th>入金</th><th>進捗</th></tr></thead>';
										list += '<tbody>';
										list += orders;
										orders += '</tbody></table>';
									}else{
										list += '<p>受注はありません</p>';
									}
									list += '</div>';
									*/
									list += '</div>';
									
									$('#result_wrapper, #result_searchtop').hide();
									$('#detail_wrapper').append(list).show();
									$('#btn_reset_input').hide();
									if(_my_level=="administrator"){
										$('#btn_delete').show();
									}else{
										$('#btn_delete').hide();
									}
									
									// zipcode mask
									$('.forZip').keypress( function(e) {
										$(this).restrictKey(e,'num');
									}).focus( function(){
										$.restrict_num(8, this);
									}).blur( function(){
										this.maxLength = 8;
										this.value = $.zip_mask(this.value);
									});
									
									// tel and fax mask
									$('.forPhone').keypress( function(e) {
										$(this).restrictKey(e,'num');
									}).focus( function(){
										$.restrict_num(13, this);
									}).blur( function(){
										var res = $.phone_mask(this.value);
										this.maxLength = res.l;
										this.value = res.c
									});
								}
							}else{
								alert('Error: p586\n'+r);
							}
						},error: function(XMLHttpRequest, textStatus, errorThrown) {
							$('#result_searchtop').html('');
							alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
						}
	 				});
				},
				result: function(){
					document.forms.input_form.reset();
					document.forms.input_form.customer_id = '';
					$('#customer_num').text('');	// reset ID
					$('.popup_wrapper').fadeOut();
					$('#detail_lists').remove();
					$('#detail_wrapper').hide();
					$('#search_wrapper, #result_wrapper, #result_searchtop').show();
					document.forms.searchtop_form.number.focus();
				}
			}
			
			switch(func){
			case 'btn':
				var title = arguments[1].attr('title');
				var f = document.forms.searchtop_form;
				if(title=='reset'){
					if($('#detail_wrapper').is(':visible')){
						$('#customer_num').text('');	// reset ID
						$('.popup_wrapper').fadeOut();
						$('#detail_lists').remove();
						$('#detail_wrapper').hide();
						$('#result_wrapper, #result_searchtop').show();
					}
					$('#result_searchtop').html('');
					$('#result_count').text('0');
					$('.pos_pagenavi').text('');
					$('#plates_status').val('0');
					$('.pagenavi .btn_pagenavi').css('visibility','hidden');
					document.forms.input_form.customer_id = '';
					// f.reset();
					var elem = f.elements;
					for (j=0; j < elem.length; j++) {
						if(elem[j].type=="text") elem[j].value = "";
					}
					f.id.value = '0';
					f.number.focus();
				}else if(title=='addnew'){
					document.forms.input_form.reset();
					document.forms.input_form.customer_id = '';
					f.id.value = '0';
					$('#cstprefix').show();
					$('#customer_num').text('');	// reset ID
					$('#btn_update').val('新規登録').attr('title','insert');
					$('#btn_reset_input').show();
					$('#btn_delete').hide();
					$('#result_wrapper, #result_searchtop').fadeOut('fast', function(){
						$('#detail_lists').remove();
						$('#detail_wrapper').fadeIn('fast');
						document.forms.input_form.company.focus();
					});
				}else if(title=='detail'){
					$('#cstprefix').hide();
					$('#btn_update').val('修　正').attr('title','update');
					$('#btn_reset_input').hide();
					$('#btn_delete').show();
					$('#detail_lists').remove();
					var data = arguments[1].children('span').text();
					display.detail(data);
				}else if(title=='resultlist'){
					display.result();
				} else if(title=='sync') {
					// WillMailの顧客リスト更新
					if(!confirm("WillMailの顧客リストを更新します。\nよろしいですか？")) return;
					$('#result_searchtop').html('<p class="alert">更新中 ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
					$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'json', async:true,
						data:{'act':'sync','mode':'post'}, success:function(r){
							$('#result_searchtop').html('<p class="alert">更新完了しました。'+r[0]+'</p>');
						},error: function(XMLHttpRequest, textStatus, errorThrown) {
							$('#result_searchtop').html('');
							alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus + "\nresponce : " + XMLHttpRequest.responseText);
						}
					});
				}else{
					btn(arguments[1]);
					if(_detail!='') display.detail(_detail);
				}
				break;
			}
		}
	}