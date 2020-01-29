/*
*	タカハマライフアート
*	インクジェット
*	charset euc-jp
*/

$(function(){
	jQuery.extend({
		prop: {	
			'holidayInfo':{},
			'params':''
		},
		checkstatus: function(my, orders_id){
			if(orders_id==""){
				alert('注文の受付が完了していません。');
				return;
			}
			var myname = $(my).attr('name');
			var args = $(my).val();
			var field = ['orders_id',myname];
			if(myname=='fin_6' && !$(my).is(':checked')){
				args = 0;
			}
			var data = [orders_id,args];
			// 担当者の指定状態で終了チェックの有効・無効を切替る
			if(myname=='state_6'){
				var fin = $(my).parent('td').next('td').find(':checkbox');
				if(args!="0"){
					fin.removeAttr('disabled');
				}else{
					fin.removeAttr('checked');
					fin.attr('disabled','disabled');
					field.push('fin_6');
					data.push(0);
				}
			}else if(myname=='fin_6'){
				var proc = $(my).closest('td').prev('td').find('select').val();
				field.push('state_6');
				data.push(proc);
			}
			$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)){
						alert('Error: p45\n'+r);
						return;
					}else{
						if(r==3 || r==9){
							alert("引取確認メールの送信でエラーが発生しています。\nメール履歴をご確認ください。");
						}
					}
				}
			});
		},
		setQuery: function(my){
		/* 受注入力画面のへのアンカーにスクロール状態を追加 */
			var self = $(my);
			var href = self.attr('href')+'&scroll='+$('#result_searchtop').scrollTop();
			self.attr('href', href);
		},
		strPackmode: function(args){
		/* 袋詰の状態を示す文字列を返す */
			var res = [];
			if(args['package_no']==1){
				res = '-';
			}else{
				if(args['package_yes']==1) res.push('〇');
				if(args['package_nopack']==1) res.push('袋のみ');
				res = res.join(',');
			}
			return res;
		},
		search: function(){
			$('.pagenavi p', '#result_wrapper').show();
			$('.pagenavi .pagetitle', '#result_wrapper').hide();
			$('#result_count').text(0);
			$('#result_searchtop').html('');
			var params = '&filename=inkjetlist';	// 受注画面への遷移の際に渡すクエリストリング
			var info = [];		// 検索結果のレコードを代入する
			var list = '';		// 検索結果の一覧
			var curid = 0;		// 受注ID
			var order_count = 0;// 受注数
			var c = 0;			// ループカウンター
			var j = 0;
			var jobstate = ['未','終了'];	// 各作業の終了状況
			var pattern = '';	// 置換パターン
			var re = '';		// 正規表現オブジェクト
			var opt = '';		// スタッフのセレクター
			var factory = {0:'-',1:'[1]', 2:'[2]', 9:'[1,2]'};
			var staff = $('#state_6').html();	// 担当
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
			$.prop.params = params;
			
			$('#result_searchtop').html('<p class="alert">検索中 ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
			
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
				data:{'act':'search','mode':'inkjetlist', 'field1[]':field, 'data1[]':data}, success: function(r){
					if(r instanceof Array){
						if(r.length==0){
							$('#result_searchtop').html('<p class="alert">該当する注文データが見つかりませんでした</p>');
						}else{
							info = r;
							
							$('#main_wrapper fieldset').hide();
							$('#result_wrapper').show();
							
							var curdate = info[0]['schedule3'];
							var bosyColor = ['淡色', '濃色'];
							
							list += '<table class="result_list"><thead>';
							list += '<tr><th>受注日</th><th>顧客名</th><th rowspan="2">特　記</th><th rowspan="2">入荷予定日</th><th rowspan="2">版下予定日</th><th rowspan="2">版下</th>';
							list += '<th rowspan="2">袋詰</th><th rowspan="2">カラー</th><th rowspan="2">商品種類</th><th rowspan="2">枚数</th><th rowspan="2">個所数</th>';
							list += '</tr>';
							list += '<tr><th>納　期</th><th>題　名</th></tr></thead>';
							
							list += '<tbody>';
							for(c=0; c<info.length; c++){
								if(curid!=info[c]['id']){
									if(curid!=0){
										j = c-1;
										list += '<tr><td colspan="1"></td><td colspan="7">備考：';
										list += '<input type="text" class="remarks" name="note_inkjet" onchange="$.checkstatus(this,'+info[j]['id']+')" value="'+info[j]['note_inkjet']+'" />';
										pattern = 'value="'+info[j]['state_6']+'"';
										re = new RegExp(pattern, "i");
										opt = staff;
										opt = opt.replace(re, pattern+' selected="selected"');
										list += '　担当：<select name="state_6" onchange="$.checkstatus(this,'+info[j]['id']+')">'+opt+'</select>';
										list += '　作業予定日：<input type="text" value="'+info[j]['dateofinkjet']+'" name="dateofinkjet_'+info[j]['id']+'" size="10" class="forDate datepicker" />';
										list += '</td>';
										list += '<td colspan="3"><label><input type="checkbox" name="fin_6" value="1" onchange="$.checkstatus(this,'+info[j]['id']+')"';
										if(info[j]['fin_6']==1){
											list += ' checked="checked"';
										}else if(info[j]['state_6']==0){
											list += ' disabled="disabled"';
										}
										list += ' /> 終了</label>';
										list += '</td></tr>';
									}
									
									order_count++;
									curid = info[c]['id'];
									
									// 納期の区切り線
									list += '<tr class="toprow';
									if(curdate!=info[c]['schedule3']){
										list += ' dateline';
									}
									list += '"><td>受注No.<a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+info[c]['id']+params+'">'+info[c]['id']+' <img alt="受注画面へ" src="./img/link.png" width="10" /></a></td>';
									list += '<td colspan="10">[ 混合 ] ';
									if(info[c]['mixedprint']==''){
										list += '-';
									}else{
										info[c]['mixedprint'];
									}
									list += '　工場: '+factory[info[c]['factory']];
									list += '</td></tr>';
									list += '<tr class="bb0">';
									list += '<td>注文：'+info[c]['schedule2']+'<p>納期：'+info[c]['schedule3']+'</p></td>';
									list += '<td>'+info[c]['customername']+'<p style="width:230px;overflow:hidden;">'+info[c]['maintitle']+'</p></td>';
									// 特記事項
									var notices = [];
									if(info[c]['allrepeat']==1 || (info[c]['repeater']>0 && info[c]['ordertype']=='industry')) notices.push('リピ');
									if(info[c]['completionimage']==1) notices.push('イメ画');
									if(info[c]['express']!=0) notices.push('特急');
									if(info[c]['bundle']==1) notices.push('同梱');
									list += '<td>'+notices.toString()+'</td>';
									list += '<td class="ac">入荷<br /><p>'+info[c]['arrival']+'</p></td>';
									list += '<td class="ac">版下予定日<br /><p>'+info[c]['dateofartwork']+'</p></td>';
									list += '<td class="ac">版下<br /><p>'+jobstate[info[c]['fin_1']]+'</p></td>';
									list += '<td class="ac">袋詰<br /><p>'+$.strPackmode(info[c])+'</p></td>';
									list += '<td class="ac">';
									list += bosyColor[info[c]['print_option']];
									list += '</td>';
									
									list += '<td>'+info[c]['item']+'</td>';
									list += '<td class="ac">'+info[c]['volume']+' 枚</td>';
									list += '<td class="ac">'+info[c]['area']+' 個所<td>';
									list += '</tr>';
								}else{
									list += '<tr class="bb0"><td colspan="8"></td>';
									
									list += '<td>'+info[c]['item']+'</td>';
									list += '<td class="ac">'+info[c]['volume']+' 枚</td>';
									list += '<td class="ac">'+info[c]['area']+' 個所<td>';
									list += '</tr>';
								}
								
								curdate = info[c]['schedule3'];
							}
							
							j = c-1;
							list += '<tr><td colspan="1"></td><td colspan="7">備考：';
							list += '<input type="text" class="remarks" name="note_inkjet" onchange="$.checkstatus(this,'+info[j]['id']+')" value="'+info[j]['note_inkjet']+'" />';
							pattern = 'value="'+info[j]['state_6']+'"';
							re = new RegExp(pattern, "i");
							opt = staff;
							opt = opt.replace(re, pattern+' selected="selected"');
							list += '　担当：<select name="state_6" onchange="$.checkstatus(this,'+info[j]['id']+')">'+opt+'</select>';
							list += '　作業予定日：<input type="text" value="'+info[j]['dateofinkjet']+'" name="dateofinkjet_'+info[j]['id']+'" size="10" class="forDate datepicker" />';
							list += '</td>';
							list += '<td colspan="3"><label><input type="checkbox" name="fin_6" value="1" onchange="$.checkstatus(this,'+info[j]['id']+')"';
							if(info[j]['fin_6']==1){
								list += ' checked="checked"';
							}else if(info[j]['state_6']==0){
								list += ' disabled="disabled"';
							}
							list += ' /> 終了</label>';
							list += '</td></tr>';
							list += '</tbody></table>';
										
							$('#result_count').text(order_count);
							$('#result_searchtop').html(list);
							$('#result_searchtop .datepicker').datepicker({
								onClose: function(dateText, inst){
									var tmp = this.name.split('_');
									var field = ['orders_id',tmp[0],'workday','printtype_key'];
									var data = [tmp[1],this.value,tmp[0],'inkjet'];
									$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
										data: {'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async: true,
										success: function(r){ if(!r.match(/^\d+?$/)) alert('Error: p171\n'+r); }
									});
								}
							});
							
							if(_scroll!=''){
								$('#result_searchtop').scrollTop(_scroll);
								_scroll = '';
							}
						}
					}else{
						alert('Error: p244\n'+r);
					}
				}
			});
		},
		addup: function(){
		// 年度集計
			var FY = $('#FY').val();
			var state = 'state_6';
			var printtype = 'inkjet';
			
			$('.pagenavi p', '#result_wrapper').hide();
			$('.pagenavi .pagetitle', '#result_wrapper').text('商品数 【'+FY+'年度集計】').show();
			$('#result_count').text('0');
			$('#result_searchtop').html('');
			var info = [];		// 検索結果のレコードを代入する
			
			$('#result_searchtop').html('<p class="alert">検索中 ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
			
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
				data:{'act':'search','mode':'addup', 'field1[]':['FY','state','printtype'], 'data1[]':[FY,state,printtype]}, success: function(r){
					if(typeof r=='object'){
						if((r instanceof Array && r.length==0) || r==null){
								$('#result_searchtop').html('<p class="alert">該当する注文データが見つかりませんでした</p>');
						}else{
							info = r;
							
							$('#main_wrapper fieldset').hide();
							$('#result_wrapper').show();
							
							var result_len = info.length;
							var head1 = '';
							var foot1 = '';
							var list1 = '';
							var html1 = '';
							var head = '';
							var foot = '';
							var list = '';
							var html = '';
							var tot = 0;
							
							// 列固定パート
							head1 = '<table><thead><tr><th>'+FY+'年度</th></tr></thead>';
							list1 = "<tbody>";
							for(var staff in info){
								if(staff=='total') continue;
								list1 += '<tr><td>'+staff+'</td>';
								list1 += '</tr>';
							}
							list1 += '</tbody></table>';
							foot1 = '<tfoot><tr><td class="foot_separate" style="text-align:center;border-right:1px solid #d8d8d8;">合　計</td></tr></tfoot>';
							html1 = '<div class="leftcol">' + head1 + foot1 + list1 + '</div>';
							
							// スクロール対象の月次パート
							head = '<table id="resulttable"><thead><tr>';
							for(var i=4; i<13; i++){
								head += '<th style="width:70px;">'+i+'月</th>';
							}
							for(var i=1; i<4; i++){
								head += '<th style="width:70px;">'+i+'月</th>';
							}
							head += '<th style="width:90px;">通期合計</th></tr></thead>';
							
							// スタッフごとのデータ
							list = "<tbody>";
							for(var staff in info){
								if(staff=='total') continue;
								tot = 0;
								list += '<tr>';
								for(var m=4; m<13; m++){
									tot += info[staff][m]-0;
									list += '<td>'+$.addFigure(info[staff][m])+'</td>';
								}
								for(var m=1; m<4; m++){
									tot += info[staff][m]-0;
									list += '<td>'+$.addFigure(info[staff][m])+'</td>';
								}
								list += '<td>'+$.addFigure(tot)+'</td></tr>';
							}
							list += '</tbody></table>';
							
							// 合計行
							tot = 0;
							foot = '<tfoot><tr>';
							for(var m=4; m<13; m++){
								tot += info['total'][m]-0;
								foot += '<td class="foot_separate">'+$.addFigure(info['total'][m])+'</td>';
							}
							for(var m=1; m<4; m++){
								tot += info['total'][m]-0;
								foot += '<td class="foot_separate">'+$.addFigure(info['total'][m])+'</td>';
							}
							foot += '<td class="foot_separate">'+$.addFigure(tot)+'</td>';
							foot +='</tfoot>';
							
							// テーブル生成
							html += html1 + '<div class="scrollable">' + head + foot + list + '</div>';
							$('#result_searchtop').html('<div class="inner">'+html+'</div>');
							
							// 隔行の背景設定
							$('#result_searchtop .leftcol tbody tr:odd').each(function(){
								$(this).addClass('rowseparate');
							});
							$('#result_searchtop .scrollable tbody tr:odd').each(function(){
								$(this).addClass('rowseparate');
							});
						}
					}else{
						alert('Error: p816\n'+r);
					}
				}
			});
		}
	});
	
	$('#search').click( function(){
		$.search();
	});
	
	// リスト印刷
	$('#printout').click( function(){
		var url = './documents/inkjetworklist.php?mode=print&'+$.prop.params;
		window.open(url, 'printform');
		$('#printform').load(function(){window.frames['printform'].print();});
	});
	
	// 年度集計
	$('#addup').click( function(){
		$.addup();
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
		f.fin_6.value = '1';
		f.id.focus();
		$('#term_from, #term_to').change();
	});
	
	
	$('#searchform').click( function(){
		$('#result_searchtop').html('');
		$('#result_wrapper').hide();
		$('fieldset', '#main_wrapper').show();
		document.forms.searchtop_form.id.focus();
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
	*	発送日の変更で担当者セレクターを書き換える
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
