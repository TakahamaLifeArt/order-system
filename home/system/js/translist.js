/*
*	タカハマライフアート
*	転写紙
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
			if( (myname=='fin_3' || myname=='cleaner') && !$(my).is(':checked')){
				args = 0;
			}else if(myname=='adjtime_trans'){
				$.check_Real(my);
				args = $(my).val()-0;
			}else if(myname=='state_prepress'){
				if( $(my).closest('tr').find('select[name="state_3"]').val()==0 ){
					$(my).val(0);
					alert('シート作成の担当者をご指定ください。');
					return;
				};
			}
			var data = [orders_id,args];
			// 担当者の指定状態で終了チェックの有効・無効を切替る
			if(myname=='state_3'){
				var fin = $(my).closest('tr').children('td:last').find(':checkbox');
				if(args!="0"){
					fin.removeAttr('disabled');
				}else{
					fin.removeAttr('checked');
					fin.attr('disabled','disabled');
					field.push('fin_3');
					data.push(0);
					
					// カット・検品の担当をクリア
					$(my).closest('tr').find('select[name="state_prepress"]').val(0);	
					field.push('state_prepress');
					data.push(0);
				}
			}else if(myname=='fin_3'){
				var proc = $(my).closest('td').prev().prev().find('select').val();
				field.push('state_3');
				data.push(proc);
				
				// 終了チェックの場合、作業予定日にチェックした日を指定
				if (args) {
					var dt = new Date(),
						dateOfTrans = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2);
					field.push('dateoftrans');
					data.push(dateOfTrans);
				}
			}else if(myname=='cleaner' || myname=='adjtime_trans'){
				field.push('printtype_key');
				data.push('digit');
			}
			$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)) alert('Error: p49\n'+r); 
					if(myname=='adjtime_trans'){
						var capa = $(my).parent('td').next();
						var wt = parseInt(capa.attr('class').split('_')[1]);
						wt += args;
						capa.text($.addFigure(wt));
						
						var tot = 0;
						$('.result_list tbody tr').each( function(){
							tot += $(this).find('td[class^="wt_"]').text().replace(',','')-0
						});
						$('#total_wt').text($.addFigure(tot));
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
		search: function(){
			$('.pagenavi p', '#result_wrapper').show();
			$('.pagenavi .pagetitle', '#result_wrapper').hide();
			$('#result_count').text(0);
			$('#result_searchtop').html('');
			var params = '&filename=translist';	// 受注画面への遷移の際に渡すクエリストリング
			var info = [];		// 検索結果のレコードを代入する
			var list = '';		// 検索結果の一覧
			var order_count = 0;// 受注数
			var worktime = 0;	// 仕事量の合計
			var c = 0;			// ループカウンター
			var jobstate = '未';	// 各作業の終了状況
			var pattern = '';	// 置換パターン
			var re = '';		// 正規表現オブジェクト
			var opt = '';		// スタッフのセレクター
			var factory = {0:'-',1:'[1]', 2:'[2]', 9:'[1,2]'};
			var edge = {'1':'白ふち','2':'スーパー','3':'濃色透明','4':'淡色透明','5':'隠ぺい','6':'シルク転写'};
			var staff = $('#state_3').html();	// 担当
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
				data:{'act':'search','mode':'translist', 'field1[]':field, 'data1[]':data}, success: function(r){
					if(r instanceof Array){
						if(r.length==0){
							$('#result_searchtop').html('<p class="alert">該当する注文データが見つかりませんでした</p>');
						}else{
							info = r;
							
							order_count = info.length;
							if(order_count==0){
								return;
							}
							
							$('#main_wrapper fieldset').hide();
							$('#result_wrapper').show();
							
							var curdate = info[0]['schedule3'];
							var cols = 15;
							list += '<table class="result_list min"><thead>';
							list += '<tr><th>受注No.</th><th>混合</th><th>工場</th><th>納期</th><th>作業予定日</th><th>顧客名</th><th>題　名</th><th>特　記</th>';
							list += '<th>製版</th><th>転写ふち</th><th>シート</th><th>掃除機</th><th>カット・検品</th><th>備考</th><th>シート作成</th><th>調整</th><th>仕事量</th><th>終了</th>';
							list += '</tr></thead>';
							
							list += '<tbody>';
							for(c=0; c<order_count; c++){
								var wt = (info[c]['wt']+(info[c]['adjtime']-0));
								worktime += wt;
								jobstate = info[c]['state_2']==0? '未': '終了';
								
								// 納期の区切り線
								list += '<tr';
								if(curdate!=info[c]['schedule3']){
									list += ' class="dateline"';
								}
								list += '>';
								list += '<td class="ac"><a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+info[c]['id']+params+'">'+info[c]['id']+' <img alt="受注画面へ" src="./img/link.png" width="10" /></a></td>';
								list += '<td>'+info[c]['mixedprint']+'</td>';
								list += '<td class="ac">'+factory[info[c]['factory']]+'</td>';
								list += '<td>'+info[c]['schedule3'].slice(2)+'</td>';
								list += '<td><input type="text" value="'+info[c]['dateoftrans']+'" name="dateoftrans_'+info[c]['id']+'" size="10" class="forDate datepicker" /></td>';
								list += '<td>'+info[c]['customername']+'</td>';
								list += '<td><p style="width:200px;overflow:hidden;">'+info[c]['maintitle']+'</p></td>';
								// 特記事項
								var notices = [];
								if(info[c]['allrepeat']==1 || (info[c]['repeater']>0 && info[c]['ordertype']=='industry')) notices.push('リピ');
								if(info[c]['completionimage']==1) notices.push('イメ画');
								if(info[c]['express']!=0) notices.push('特急');
								if(info[c]['sheetonly']==1) notices.push('シート');
								if(info[c]['bundle']==1) notices.push('同梱');
								list += '<td>'+notices.toString()+'</td>';
								list += '<td class="ac">'+jobstate+'</td>';
								list += '<td class="ac">'+edge[info[c]['edge']]+'</td>';
								list += '<td class="ac">'+info[c]['sheet']+'</td>';
								list += '<td class="ac"><input type="checkbox" name="cleaner" value="1" onchange="$.checkstatus(this,'+info[c]['id']+')"';
								if(info[c]['cleaner']==1){
									list += ' checked="checked"';
								}
								list += ' /></td>';
								// カット・検品
								pattern = 'value="'+info[c]['state_prepress']+'"';
								re = new RegExp(pattern, "i");
								opt = staff;
								opt = opt.replace(re, pattern+' selected="selected"');
								list += '<td><select name="state_prepress" onchange="$.checkstatus(this,'+info[c]['id']+',\''+info[c]['printtype_key']+'\')">'+opt+'</select></td>';
								
								list += '<td><input type="text" class="remarks_trans" name="note_trans" onchange="$.checkstatus(this,'+info[c]['id']+')" value="'+info[c]['note_trans']+'" /></td>';
								
								// 担当（シート作成）
								pattern = 'value="'+info[c]['state_3']+'"';
								re = new RegExp(pattern, "i");
								opt = staff;
								opt = opt.replace(re, pattern+' selected="selected"');
								list += '<td><select name="state_3" onchange="$.checkstatus(this,'+info[c]['id']+')">'+opt+'</select></td>';
								
								list += '<td><input type="text" value="'+info[c]['adjtime']+'" name="adjtime_trans" onchange="$.checkstatus(this,'+info[c]['id']+',\''+info[c]['printtype_key']+'\')" size="3" class="forReal" /></td>';
								list += '<td class="wt_'+info[c]['wt']+' ar">'+$.addFigure(wt)+'</td>';
								list += '<td class="ac"><input type="checkbox" name="fin_3" value="1" onchange="$.checkstatus(this,'+info[c]['id']+')"';
								if(info[c]['fin_3']==1){
									list += ' checked="checked" />';
								}else if(info[c]['state_3']==0){
									list += ' disabled="disabled" />';
								}
								list += '</td>';
								list += '</tr>';
								
								curdate = info[c]['schedule3'];
							}
							
							list += '<tr><td colspan="'+cols+'"></td><td class="ac">合計</td><td id="total_wt" class="ar">'+$.addFigure(worktime)+'</td><td></td></tr>';
							list += '</tbody></table>';
							
							$('#result_count').text(order_count);
							$('#result_searchtop').html(list);
							$('#result_searchtop .datepicker').datepicker({
								onClose: function(dateText, inst){
									var tmp = this.name.split('_');
									var field = ['orders_id',tmp[0],'workday','printtype_key'];
									var data = [tmp[1],this.value,tmp[0],'digit'];
									$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
										data: {'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async: true,
										success: function(r){ if(!r.match(/^\d+?$/)) alert('Error: p128\n'+r); }
									});
								}
							});
						}
					}else{
						alert('Error: p198\n'+r);
					}
				}
			});
		},
		addup: function(){
		// 年度集計
			var FY = $('#FY').val();
			var state = 'state_3';
			var printtype = 'digit';
			
			$('.pagenavi p', '#result_wrapper').hide();
			$('.pagenavi .pagetitle', '#result_wrapper').text('シート数 【'+FY+'年度集計】').show();
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
		f.fin_3.value = '1';
		f.id.focus();
		$('#term_from, #term_to').change();
	});
	
	
	$('#searchform').click( function(){
		$('#result_searchtop').html('');
		$('#result_wrapper').hide();
		$('fieldset', '#main_wrapper').show();
		document.forms.searchtop_form.id.focus();
	});
	
	
	$('#printout').click( function(){
		var url = './documents/transworklist.php?mode=print&'+$.prop.params;
		window.open(url, 'printform');
		$('#printform').load(function(){window.frames['printform'].print();});
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
