/*
*	タカハマライフアート
*	入荷確認
*	charset euc-jp
*/

$(function(){
	jQuery.extend({
		prop: {	
			'holidayInfo':{},
			'orders':[]
		},
		checkstatus: function(my, orders_id){
			if(orders_id==""){
				alert('注文の受付が完了していません。');
				return;
			}
			var args = $(my).val();
			var field = ['orders_id','state_7'];
			var data = [orders_id,args];
			$.ajax({ url:'./php_libs/ordersinfo.php', type:'POST', dataType:'text',
				data:{'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async:false,
				success: function(r){
					if(!r.match(/^\d+?$/)){
						alert('Error: p24\n'+r);
						return;
					}else{
						if(r==3 || r==9){
							alert("引取確認メールの送信でエラーが発生しています。\nメール履歴をご確認ください。");
						}
					}
				}
			});
		},
		printform: function(mode){
		/* 	入荷票の印刷 
		*	発注済みの注文
		*/
			var field = [];
			var data = [];
			var hash = {};
			/*
			data[0] = $('#id').val();
			data[1] = $('#term_from').val();
			data[2] = $('#term_to').val();
			data[3] = encodeURI($('#maker').val());
			data[4] = $('#state_7').val();
			data[5] = $('#fin_7').val();
			data[6] = $('#arrival').val();
			*/
			var i = 0;
			var elem = document.forms.searchtop_form.elements;
			for (var j=0; j<elem.length; j++) {
				if((elem[j].type == "text" || elem[j].type=="select-one") && elem[j].value.trim()!=''){
					field[i] = elem[j].name;
					data[i] = elem[j].value;
					i++;
					
					hash[elem[j].name] = elem[j].value;
				}
			}
			$.ajax({ url: './php_libs/ordersinfo.php', type: 'GET', dataType:'json', async: false,
				data: {'act':'search','mode':'arrivalsheet','field1[]':field,'data1[]':data},
				success: function(r){
					if(r instanceof Array){
						if(r.length!=0){
							var url = './documents/checkarrival.php?sheet_type='+mode;
							if(typeof hash['id']!='undefined') url += '&id='+hash['id'];
							if(typeof hash['term_from']!='undefined')url += '&term_from='+hash['term_from'];
							if(typeof hash['term_to']!='undefined')url += '&term_to='+hash['term_to'];
							if(typeof hash['maker']!='undefined')url += '&maker='+hash['maker'];
							if(typeof hash['state_7']!='undefined')url += '&state_7='+hash['state_7'];
							if(typeof hash['fin_7']!='undefined')url += '&fin_7='+hash['fin_7'];
							if(typeof hash['arrival']!='undefined')url += '&arrival='+hash['arrival'];
							if(typeof hash['factory']!='undefined')url += '&factory='+hash['factory'];
							window.open(url, 'printform');
							$('#printform').load(function(){window.frames['printform'].print();});
						}else{
							alert('該当するデータはありません。');
						}
					}else{
						alert('Error: p50\n'+r);
					} 
				}
			});
		},
		print_statement: function(){
		/*	入荷明細書の印刷 
		*	未発注の注文を含む
		*/
			if($.prop.orders.length==0){
				alert('該当するデータがありません。');
				return;
			}
			
			var orderIds = $.prop.orders.join(',');
			var url = './documents/arrivalstatement.php?orderid='+orderIds;
			// for(var i=1; i<$.prop.orders.length; i++){
			// 	url += '&orderid[]='+$.prop.orders[i];
			// }
			
			window.open(url, 'printform');
			$('#printform').load(function(){window.frames['printform'].print();});
		},
		setQuery: function(my){
		/* 受注入力画面のへのアンカーにスクロール状態を追加 */
			var self = $(my);
			var href = self.attr('href')+'&scroll='+$('#result_searchtop').scrollTop();
			self.attr('href', href);
		},
		search: function(){
			$('#result_count').text(0);
			$('#result_searchtop').html('');
			$.prop.orders = [];	// 受注No.データを初期化
			var params = '&filename=stocklist';	// 受注画面への遷移の際に渡すクエリストリング
			var info = [];		// 検索結果のレコードを代入する
			var list = '';		// 検索結果の一覧
			var arrange = '';	// 商品手配（1:注文　2:持込）
			var state_0 = '';	// 発注状況（0:未発注　1:済み）
			var pattern = '';	// 置換パターン
			var re = '';		// 正規表現オブジェクト
			var opt = '';		// スタッフのセレクター
			var factory = {0:'-',1:'[1]', 2:'[2]', 9:'[1,2]'};
			var staff = $('#state_7').html();
			staff = staff.replace('selected="selected"', '');
			
			var i = 0;
			var field = [];
			var data = [];
			var elem = document.forms.searchtop_form.elements;
			for (var j=0; j<elem.length; j++) {
				if((elem[j].type == "text" || elem[j].type=="select-one") && elem[j].value.trim()!=''){
					field[i] = elem[j].name;
					data[i] = elem[j].value;
					// クエリストリング
					params += '&'+field[i]+'='+data[i];
					i++;
				}
			}
			$('#result_searchtop').html('<p class="alert">検索中 ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
			
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
				data:{'act':'search','mode':'stocklist', 'field1[]':field, 'data1[]':data}, success: function(r){
					if(r instanceof Array){
						if(r.length==0){
							$('#result_searchtop').html('<p class="alert">該当する注文データが見つかりませんでした</p>');
						}else{
							info = r;
							
							$('#main_wrapper fieldset').hide();
							$('#result_wrapper').show();
							
							list = '<div class="tablecontents">';
							list += '<table class="result_list"><thead>';
							list += '<tr><th>受注日</th><th>顧客名</th><th>入荷予定</th><th rowspan="2">特　記</th><th rowspan="2">プリント</th><th rowspan="2" colspan="3">作業予定日</th></tr>';
							list += '<tr><th>納　期</th><th>題　名</th><th>商品手配</th></tr></thead>';
							
							var t = 0;
							var curr_orderid = 0;
							var totamount = 0;		// 合計枚数
							var amount = 0;			// 伝票ごとの枚数計
							var orders_len = 0;		// 伝票の枚数
							var curdate = info[0]['schedule3'];
							var list2 = '';			// 商品リスト
							var isBring = false;	// 持込の有無をチェック
							
							list += '<tbody>';
							for(var c=0; c<info.length; c++){
								if(curr_orderid!=info[c]['id']){
									if(curr_orderid!=0){			// 伝票ごとの合計枚数を表示
										
										totamount += amount;
										orders_len++;
										
										t = c-1;
										arrange = isBring? '持込あり': '注文';
										if(info[t]['state_0']>0){
											state_0 = '発注済';
										}else if(info[t]['ordering']==0){
											state_0 = '<span class="fontred">未発注</span>';
										}else if(info[t]['toms_order']>0 && info[t]['toms_response']==0){
											state_0 = '<span class="fontred">トムス回答待ち</span>';
										}else if(info[t]['toms_order']>0 && info[t]['toms_response']==2){
											state_0 = '<span class="fontred">トムス不足分あり！発注中止</span>';
										}else{
											state_0 = '発注済';
										}
										
										// 納期の区切り線
										list += '<tr class="toprow';
										if(curdate!=info[t]['schedule3']){
											list += ' dateline';
										}
										list += '"><td>受注No.<a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+info[t]['id']+params+'">'+info[t]['id'];
										list += ' <img alt="受注画面へ" src="./img/link.png" width="10" /></a></td>';
										list += '<td>工場: '+factory[info[t]['factory']]+'</td>';
										list += '<td colspan="6" class="bb0">'+state_0+'</td></tr>';
										list += '<tr>';
										list += '<td>注文：'+info[t]['schedule2']+'<p>納期：'+info[t]['schedule3']+'</p></td>';
										list += '<td>'+info[t]['customername']+'<p>'+info[t]['maintitle']+'</p></td>';
										list += '<td class="ac">入荷：'+info[t]['arrival']+'<p>'+arrange+'</p></td>';
										// 特記事項
										var notices = [];
										if(info[t]['allrepeat']==1 || (info[t]['repeater']>0 && info[t]['ordertype']=='industry')) notices.push('リピ');
										if(info[t]['completionimage']==1) notices.push('イメ画');
										if(info[t]['express']!=0) notices.push('特急'+info[t]['express']);
										list += '<td>'+notices.toString()+'</td>';
										list += '<td class="ac">'+info[t]['print_name']+'</td>';
										list += '<td class="ac">シルク<br /><p>'+info[t]['dateofsilk']+'</p></td>';
										list += '<td class="ac">転写(プレス)<br /><p>'+info[t]['dateofpress']+'</p></td>';
										list += '<td class="ac">インクジェット<br /><p>'+info[t]['dateofinkjet']+'</p></td>';
										list += '</tr>';
										
										list += list2;
										
										list += '<tr class="rowseparate">';
										pattern = 'value="'+info[t]['state_7']+'"';
										re = new RegExp(pattern, "i");
										opt = staff;
										opt = opt.replace(re, pattern+' selected="selected"');
										list += '<td></td>';
										list += '<td>入荷チェック：<select name="proc" onchange="$.checkstatus(this,'+curr_orderid+')">'+opt+'</select></td>';
										list += '<td class="ar" colspan="2">合計枚数</td>';
										list += '<td class="ar">'+amount+' 枚</td>';
										list += '<td colspan="3"></td></tr>';
									}
									
									isBring = false;
									list2 = '';
									amount = 0;
									curr_orderid = info[c]['id'];
									$.prop.orders.push(curr_orderid);
									
									
									/*
									arrange = info[c]['arrange']==1? '注文': '持込';
									state_0 = info[c]['state_0']==0? '<span class="fontred">未発注</span>': '発注済';
									*/
									
									
									/* 納期の区切り線
									list += '<tr class="toprow';
									if(curdate!=info[c]['schedule3']){
										list += ' dateline';
									}
									list += '"><td>受注No.<a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+info[c]['id']+params+'">'+info[c]['id']+' <img alt="受注画面へ" src="./img/link.png" width="10" /></a></td>';
									list += '<td colspan="6" class="bb0">'+state_0+'</td></tr>';
									list += '<tr>';
									list += '<td>注文：'+info[c]['schedule2']+'<p>納期：'+info[c]['schedule3']+'</p></td>';
									list += '<td>'+info[c]['customername']+'<p>'+info[c]['maintitle']+'</p></td>';
									list += '<td class="ac">入荷：'+info[c]['arrival']+'<p>'+arrange+'</p></td>';
									list += '<td>'+info[c]['print_name']+'</td>';
									list += '<td class="ac">シルク<br /><p>'+info[c]['dateofsilk']+'</p></td>';
									list += '<td class="ac">転写(プレス)<br /><p>'+info[c]['dateofpress']+'</p></td>';
									list += '<td class="ac">インクジェット<br /><p>'+info[c]['dateofinkjet']+'</p></td>';
									list += '</tr>';
									*/
								}
								list2 += '<tr><td></td>';
								list2 += '<td>'+info[c]['item']+'</td>';
								list2 += '<td>'+info[c]['color']+'</td>';
								list2 += '<td class="ac">'+info[c]['size']+'</td>';
								list2 += '<td class="ar">'+info[c]['amount']+' 枚</td>';
								list2 += '<td colspan="3"></td>';
								list2 += '</tr>';
								list2 += '</div>';
								
								if(info[c]['ext_itemid']==100000) isBring=true;
								
								amount += info[c]['amount']-0;
								curdate = info[c]['schedule3'];
							}
							
							totamount += amount;
							orders_len++;
							
							t = c-1;
							arrange = isBring? '持込あり': '注文';
							if(info[t]['state_0']>0){
								state_0 = '発注済';
							}else if(info[t]['ordering']==0){
								state_0 = '<span class="fontred">未発注</span>';
							}else if(info[t]['toms_order']>0 && info[t]['toms_response']==0){
								state_0 = '<span class="fontred">トムス回答待ち</span>';
							}else if(info[t]['toms_order']>0 && info[t]['toms_response']==2){
								state_0 = '<span class="fontred">トムス不足分あり！発注中止</span>';
							}else{
								state_0 = '発注済';
							}
							
							// 納期の区切り線
							list += '<tr class="toprow';
							if(curdate!=info[t]['schedule3']){
								list += ' dateline';
							}
							list += '"><td>受注No.<a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+info[t]['id']+params+'">'+info[t]['id'];
							list += ' <img alt="受注画面へ" src="./img/link.png" width="10" /></a></td>';
							list += '<td>工場: '+factory[info[t]['factory']]+'</td>';
							list += '<td colspan="6" class="bb0">'+state_0+'</td></tr>';
							list += '<tr>';
							list += '<td>注文：'+info[t]['schedule2']+'<p>納期：'+info[t]['schedule3']+'</p></td>';
							list += '<td>'+info[t]['customername']+'<p>'+info[t]['maintitle']+'</p></td>';
							list += '<td class="ac">入荷：'+info[t]['arrival']+'<p>'+arrange+'</p></td>';
							// 特記事項
							var notices = [];
							if(info[t]['allrepeat']==1 || (info[t]['repeater']>0 && info[t]['ordertype']=='industry')) notices.push('リピ');
							if(info[t]['completionimage']==1) notices.push('イメ画');
							if(info[t]['express']!=0) notices.push('特急');
							list += '<td>'+notices.toString()+'</td>';
							list += '<td class="ac">'+info[t]['print_name']+'</td>';
							list += '<td class="ac">シルク<br /><p>'+info[t]['dateofsilk']+'</p></td>';
							list += '<td class="ac">転写(プレス)<br /><p>'+info[t]['dateofpress']+'</p></td>';
							list += '<td class="ac">インクジェット<br /><p>'+info[t]['dateofinkjet']+'</p></td>';
							list += '</tr>';
							
							list += list2;
							
							list += '<tr class="rowseparate">';
							pattern = 'value="'+info[t]['state_7']+'"';
							re = new RegExp(pattern, "i");
							opt = staff;
							opt = opt.replace(re, pattern+' selected="selected"');
							list += '<td></td>';
							list += '<td>入荷チェック：<select name="proc" onchange="$.checkstatus(this,'+curr_orderid+')">'+opt+'</select></td>';
							list += '<td class="ar" colspan="2">合計枚数</td>';
							list += '<td class="ar">'+amount+' 枚</td>';
							list += '<td colspan="3"></td></tr>';
							list += '</tbody></table>';
							
							totamount = $.addFigure(totamount);
							
							$('#total_amount').html(totamount);
							$('#result_count').text(orders_len);
							$('#result_searchtop').html(list);
							
							if(_scroll!=''){
								$('#result_searchtop').scrollTop(_scroll);
								_scroll = '';
							}
						}
					}else{
						alert('Error: p206\n'+r);
					}
				}
			});
		}
	});
	
	
	$('#search').click( function(){
		$.search();
	});
	
	
	$('#reset').click( function(){
		$('#result_searchtop').html('');
		var f = document.forms.searchtop_form;
		var dt = new Date();
		dt.setDate(dt.getDate()-3);
		var d = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
		f.term_from.value = d;
		f.term_to.value = '';
		f.id.value = '';
		f.maker.value = '';
		f.fin_7.value = '1';
		f.state_7.value = '0';
		f.arrival.value = '';
		f.id.focus();
		$('#term_from, #term_to').change();
	});
	
	
	$('.btn_pagenavi', '#result_wrapper').click( function(){
		var title = $(this).attr('title');
		switch(title){
			case 'searchform':	// 検索フォームへ戻る
				$('#result_searchtop').html('');
				$('#result_wrapper').hide();
				$('fieldset', '#main_wrapper').show();
				document.forms.searchtop_form.id.focus();
				break;
			case 'label':		// 入荷票(label)印刷
			case 'list':		// 入荷明細書の印刷
				$.printform(title);
				break;
			case 'statement':	// 入荷明細書の印刷
				$.print_statement();
				break;
		}
	});
	
	
	$('#cleardate').click( function(){
		document.forms.searchtop_form.term_from.value="";
		document.forms.searchtop_form.term_to.value="";
		$('#term_from, #term_to').change();
	});
	
	
	$('#searchtop_form .datepicker').datepicker({
		beforeShowDay: function(date){
			var weeks = date.getDay();
			var texts = "";
			if(weeks == 0) texts = "休日";
			var YY = date.getFullYear();
			var MM = date.getMonth() + 1;
			var DD = date.getDate();
			var currDate = YY + "/" + MM + "/" + DD;
			var datesec = Date.parse(currDate)/1000;
			if(!$.prop.holidayInfo[YY+"_"+MM]){
				$.prop.holidayInfo[YY+"_"+MM] = new Array();
				$.ajax({ url: './php_libs/checkHoliday.php',
						type: 'GET',
						dataType: 'text',
						data: {'datesec':datesec},
						async: false,
						success: function(r){
							if(r!=""){
								var info = r.split(',');
								for(var i=0; i<info.length; i++){
									$.prop.holidayInfo[YY+"_"+MM][info[i]] = info[i];
								}
							}
						}
					});
			}
			if($.prop.holidayInfo[YY+"_"+MM][DD]) weeks = 0;
			if(weeks == 0) return [true, 'days_red', texts];
			else if(weeks == 6) return [true, 'days_blue'];
			return [true];
		}
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
						var isSelected = false;
						var option = '';
						if(staff_id=='0'){
							option = '<option value="0" selected="selected">----</option>';
							isSelected = true;
						}
						for(var i=0; i<r.length; i++){
							option += '<option value="'+r[i]['id']+'"';
							if(staff_id==r[i]){
								option += ' selected="selected';
								isSelected = true;
							}
							option += '>'+r[i]['staffname']+'</option>';
						}
						if(!isSelected) option = '<option value="0" selected="selected">----</option>' + option;
						$my.html(option);
					}else{
						// do nothing.
					}
				}else{
					alert("Error: p388:\n"+r);
				}
			},error: function(XMLHttpRequest, textStatus, errorThrown) {
				$.screenOverlay(false);
				alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
			}
		});
	});
	
	
	/* init */
	$(window).one('load', function(){
		if(document.forms.searchtop_form.term_from.value==""){
			var dt = new Date();
			dt.setDate(dt.getDate()-3);
			var d = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
			document.forms.searchtop_form.term_from.value = d;
		}
		document.forms.searchtop_form.id.focus();
		
		$.search();
	});

});
