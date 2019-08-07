/*
*	タカハマライフアート
*	シルク
*	charset euc-jp
*/

// 連想配列のキーでソート
Array.prototype.asort = function(key) {
    this.sort(function(a, b) {
        return (a[key] > b[key]) ? 1 : -1;
    });
};


$(function(){
	jQuery.extend({
		prop: {	
			'modified':false,			// 修正フラグ　true:修正あり
			'update_id':{},				// 作業予定の更新をおこなう行番号をキーにした受注No.のハッシュ
			'holidayInfo':{}
		},
		checkstatus: function(my, orders_id){
			if(orders_id==""){
				alert('注文の受付が完了していません。');
				return;
			}
			var myname = $(my).attr('name');
			var args = $(my).val().trim();;
			var field = ['orders_id',myname,'printtype_key'];
			if(myname=='fin_5' && !$(my).is(':checked')){
				args = 0;
			}
			var data = [orders_id,args,'silk'];
			// 担当者の指定状態で終了チェックの有効・無効を切替る
			if(myname=='state_5'){
				var fin = $(my).parent('tr').children('td:last').find(':checkbox');
				if(args!="0"){
					fin.removeAttr('disabled');
				}else{
					fin.removeAttr('checked');
					fin.attr('disabled','disabled');
					field.push('fin_5');
					data.push(0);
				}
			}else if(myname=='fin_5'){
				var proc = $(my).closest('td').prev('td').prev('td').find('select').val();
				field.push('state_5');
				data.push(proc);
			}
			
			/* 2013-11-21 作業予定者を別テーブルに移行
			if(myname=='worker'){
				$.screenOverlay(true);
				$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
					data: {'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async: false,
					success: function(r){ 
						if(!r.match(/^\d+?$/)) alert('Error: p57\n'+r); 
						$.search('schedule');
						$.screenOverlay(false);
					},
					error: function(){
						$.screenOverlay(false);
					}
				});
			}else{
				$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
					data: {'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async: false,
					success: function(r){ if(!r.match(/^\d+?$/)) alert('Error: p68\n'+r); }
				});
			}
			*/
			
			$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)){
						alert('Error: p77\n'+r);
						return;
					}else{
						if(r==3 || r==9){
							alert("引取確認メールの送信でエラーが発生しています。\nメール履歴をご確認ください。");
						}
					}
				}
			});
			
		},
		setActualwork: function(my, print_id){
		/*
		*	実作業時間
		*	- 状況確認
		*/
			if(print_id==""){
				alert('IDが指定されていません。');
				return;
			}
			$.check_Real(my);
			var args = $(my).val()-0;
			var field = ['print_id','actualwork'];
			var data = [print_id,args];
			$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'update','mode':'actualwork','field1[]':field,'data1[]':data}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)) alert('Error: p57\n'+r);
					var staff = $(my).closest('tr').find('select[name="state_5"] option:selected').text();
					if(staff=='----') staff='未定';
					var pre = ($(my).attr('rel').split('_')[1]-0);
					$(my).attr('rel', 'aw_'+args);
					var val = args - pre;
					var tot = 0;
					$('#actualwork_table th:not(:last)').each( function(idx){
						var td = $('#actualwork_table td:eq('+idx+')');
						if($(this).text()==staff){
							td.text((td.text()-0)+val);
						}
						tot += (td.text()-0);
					});
					$('#actualwork_table td:last, #tot_actualwork').text(tot);
				}
			});
		},
		setWorktime: function(my, print_id){
		/*
		*	仕事時間調整
		*	- 作業予定
		*/
			if(print_id==""){
				alert('IDが指定されていません。');
				return;
			}
			$.check_Real(my);
			var args = $(my).val()-0;
			var field = ['print_id','adjworktime'];
			var data = [print_id,args];
			$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'update','mode':'adjworktime','field1[]':field,'data1[]':data}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)) alert('Error: p103\n'+r);
					var capa = $(my).parent('td').next();
					var wt = capa.attr('class').split('_')[1]-0;
					wt += args;
					capa.text(wt);
					
					var i = 0;
					var n = $(my).closest('tr').attr('class').split('_')[1];
					var row = $('.result_list tbody tr').length;
					if(n==0){
						args = wt-($('#tot_0').text()-0);
					}else{
						i = n-1;
						args = wt+($('#tot_'+i).text()-0) - ($('#tot_'+n).text()-0);
					}
					
					for(i=n; i<row; i++){
						var t = $('#tot_'+i).text()-0;
						$('#tot_'+i).text(t+args);
					}
					
					$(my).closest('tr').find('select[name="worker"]').each( function(){
						// 仕事量の集計テーブル
						var staff = $(this).children('option:selected').text();
						if(staff=='----') staff='未定';
						$('#workplan_table th:not(:last)').each( function(idx){
							var td = $('#workplan_table td:eq('+idx+')');
							if($(this).text()==staff){
								td.text((td.text()-0)+args);
							}
						});
						$('#tot_workplan').text( $('#tot_'+(row-1)).text() );
						
						// 納期ごとの仕事量
						var d = $(my).closest('tr').find('.schedule').text();
						$('#workplan_table2 th:not(:last)').each( function(idx){
							var td = $('#workplan_table2 td:eq('+idx+')');
							if($(this).text().slice(2)==d){
								td.text((td.text()-0)+args);
							}
						});
						$('#tot_workplan2').text( ($('#tot_workplan2').text()-0) + args );
						
						// 作用予定日ごとの仕事量
						var scheduled = 100;
						var results = 0;
						$(this).closest('.clearfix').children('.rightside').children('p').each( function(){
							var d = $(this).children('.scheduled').val();
							$('#workplan_table3 th:not(:last)').each( function(idx){
								var td = $('#workplan_table3 td:eq('+idx+')');
								if($(this).text()==d){
									var w = args*((scheduled-results)/100);
									td.text( (td.text()-0) + w );
									$('#tot_workplan3').text( ($('#tot_workplan3').text()-0) + w );
								}
							});
							var r = $(this).children('.results').val();
							if(r==0) return false;
							results += r;
						});
					});
				}
			});
		},
		setPrintcount: function(my, orders_id, print_id){
		/*
		*	刷数調整
		*	- 作業予定
		*/
			if(print_id==""){
				alert('IDが指定されていません。');
				return;
			}
			$.check_Real(my);
			var args = $(my).val();
			var field = ['orders_id','print_id','adjprintcount'];
			var data = [orders_id,print_id,args];
			$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'update','mode':'adjprintcount','field1[]':field,'data1[]':data}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)) alert('Error: p147\n'+r);
					var adj = $(my).parent('td').next().find('input').val()-0;
					var capa = $(my).parent('td').next().next();
					var wt = (r-0)+adj;
					capa.attr('class', 'wt_'+r);
					capa.text(wt);
					
					var i = 0;
					var n = $(my).closest('tr').attr('class').split('_')[1];
					var row = $('.result_list tbody tr').length;
					if(n==0){
						args = wt-($('#tot_0').text()-0);
					}else{
						i = n-1;
						args = wt+($('#tot_'+i).text()-0) - ($('#tot_'+n).text()-0);
					}
					
					for(i=n; i<row; i++){
						var t = $('#tot_'+i).text()-0;
						$('#tot_'+i).text(t+args);
					}
					
					$(my).closest('tr').find('select[name="worker"]').each( function(){
						// 仕事量の集計テーブル
						var staff = $(this).children('option:selected').text();
						if(staff=='----') staff='未定';
						$('#workplan_table th:not(:last)').each( function(idx){
							var td = $('#workplan_table td:eq('+idx+')');
							if($(this).text()==staff){
								td.text((td.text()-0)+args);
							}
						});
						$('#tot_workplan').text( $('#tot_'+(row-1)).text() );
						
						// 納期ごとの仕事量
						var d = $(my).closest('tr').find('.schedule').text();
						$('#workplan_table2 th:not(:last)').each( function(idx){
							var td = $('#workplan_table2 td:eq('+idx+')');
							if($(this).text().slice(2)==d){
								td.text((td.text()-0)+args);
							}
						});
						$('#tot_workplan2').text( ($('#tot_workplan2').text()-0) + args );
						
						// 作用予定日ごとの仕事量
						var scheduled = 100;
						var results = 0;
						$(this).closest('.clearfix').children('.rightside').children('p').each( function(){
							var d = $(this).children('.scheduled').val();
							$('#workplan_table3 th:not(:last)').each( function(idx){
								var td = $('#workplan_table3 td:eq('+idx+')');
								if($(this).text()==d){
									var w = args*((scheduled-results)/100);
									td.text( (td.text()-0) + w );
									$('#tot_workplan3').text( ($('#tot_workplan3').text()-0) + w );
								}
							});
							var r = $(this).children('.results').val();
							if(r==0) return false;
							results += r;
						});
					});
				}
			});
		},
		setQuery: function(my){
		/* 受注入力画面のへのアンカーにスクロール状態を追加 */
			var self = $(my);
			var href = self.attr('href')+'&scroll='+$('#result_searchtop').scrollTop();
			self.attr('href', href);
		},
		cancel_schedule: function(my){
		/*
		*	作業予定日の削除
		*/
			$.setModify(my);
			$(my).closest('p').remove();
		},
		add_worker: function(my){
		/*
		*	作業予定担当の追加
		*/
			$.setModify(my);
			var orderid = $(my).closest('td').prev().attr('class').split('_')[1];
			var opt = $('#state_5').html();	// 担当
			var pattern = 'value="0"';
			var re = new RegExp(pattern, "i");
			opt = opt.replace(re, pattern+' selected="selected"');
			var list = '<div class="clearfix" style="width:400px;">';
			list += '<div class="leftside">';
			list += '<div class="del_worker" onclick="$.del_worker(this);"><img src="./img/cross.png" width="16"></div>';
			list += '<select name="worker">'+opt+'</select>';
			list += '</div>';
			
			list += '<div class="rightside">';
			list += '<p><input type="text" value="0000-00-00" size="10" class="forDate datepicker scheduled"> ';
			//list += '<input type="text" value="'+workingday+'" size="10" class="forDate datepicker workingday"> ';
			list += '<input type="text" value="0" class="forReal results"> %　';
			list += '<input type="button" value="予定追加" class="add_schedule" name="id_'+orderid+'"></p>';
			list += '</div>';
			list += '</div>';
			
			$(my).closest('td').prev('td').append(list);
			
			// イベント設定
			$('.datepicker, .results', '#result_searchtop').change( function(){
				$.setModify(this);
			});
			$('#result_searchtop .datepicker').datepicker();
		},
		del_worker: function(my){
		/*
		*	作業予定担当の削除
		*/
			if($(my).closest('td').children('.clearfix').length==1) return;
			
			$.setModify(my);
			$(my).closest('.clearfix').remove();
		},
		setModify: function(my){
		/*
		*	変更があった行番号キーにして受注No.を設定
		*/
			$.prop.modified = true;
			var idx = $(my).closest('tr').attr('class').split('_')[1];	// 行インデックス
			var id = $(my).closest('td').attr('class').split('_')[1];	// 受注No
			$.prop.update_id[idx] = id;
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
		search: function(mode){
			$('#result_count').text(0);
			$('#result_searchtop, #result_table, #chart1 .inner .series').html('');
			if(mode!='schedule') $('#update_workplan').hide();
			
			var info = [];						// 検索結果のレコードを代入する
			var params = '&filename=silklist';	// 受注画面への遷移の際に渡すクエリストリング
			var list = '';						// 検索結果の一覧
			var list2 = '';						// 担当ごとの作業量テーブルと担当ごとの実作業時間テーブル
			var curid = 0;						// 受注ID
			var order_count = 0;				// 受注数
			var scheduled = "0000-00-00";		// 作業予定日
			var actualwork = 0;					// 実作業時間
			var worktime = 0;					// 仕事量
			var arrival = '';					// 入荷予定日若しくは入荷済み
			var c = 0;							// ループカウンター
			var jobstate = '';					// 製版の終了状況
			var pattern = '';					// 置換パターン
			var re = '';						// 正規表現オブジェクト
			var opt = '';						// スタッフのセレクター
			var factory = {0:'-',1:'[1]', 2:'[2]', 9:'[1,2]'};
			var staff = $('#state_5').html();	// 担当
			staff = staff.replace('selected="selected"', '');
			var pack = {'yes':'〇','no':'-','nopack':'袋のみ'};	// 袋詰
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
			data[i] = mode;
			params += '&mode='+mode;
			
			$('#result_searchtop').html('<p class="alert">検索中 ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
			
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
				data:{'act':'search','mode':'silklist', 'field1[]':field, 'data1[]':data}, success: function(r){
					if(r instanceof Array){
						if(r.length==0){
							$('#result_searchtop').html('<p class="alert">該当する注文データが見つかりませんでした</p>');
						}else{
							info = r;
							
							if(mode!='chart'){
								$('#chart1').hide();
								$('#result_wrapper, #result_searchtop').show();
								
								var curdate = info[0]['schedule3'];
								
								if(mode=='progress'){
								// 状況確認
									$('.pagetitle').text('状況確認');
									list = '<table class="result_list"><thead><tr>';
									list += '<th>受注No.</th><th>混合</th><th>工場</th><th>納期</th><th>作業予定</th><th>顧客名</th><th>題名</th><th>特記</th>';
									list += '<th>商品種類</th><th>袋詰</th><th>備考1</th><th>担当</th><th>仕事量</th><th>実作業</th><th>終了</th>';
									list += '</tr></thead>';
									
									list += '<tbody>';
									for(c=0; c<info.length; c++){
										order_count++;
										actualwork += (info[c]['actualwork']-0);
										worktime += (info[c]['capacity']+(info[c]['adjworktime']-0));
									 	/* 2013-09-19 廃止
									 		jobstate = info[c]['state_2']==0? '未': '済';
											arrival = info[c]['state_7']!=0? '済': info[c]['arrival'].slice(2);
										*/
										
										// 納期の区切り線
										list += '<tr';
										if(curdate!=info[c]['schedule3']){
											list += ' class="dateline"';
										}
										list += '>';
										list += '<td class="ac"><a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+info[c]['id']+params+'">'+info[c]['id']+' <img alt="受注画面へ" src="./img/link.png" width="10" /></a></td>';
										list += '<td>'+info[c]['mixedprint']+'</td>';
										list += '<td class="ac">'+factory[info[c]['factory']]+'</td>';
										list += '<td class="ac">'+info[c]['schedule3'].slice(2)+'</td>';
										if(info[c]['wp']){
											scheduled = info[c]['wp'][0]['scheduled'].slice(2);
										}else{
											scheduled = info[c]['dateofsilk'].slice(2);
										}
										list += '<td>'+scheduled+'</td>';
										list += '<td><p style="width:12em;overflow:hidden;">'+info[c]['customername']+'</p></td>';
										list += '<td><p style="width:12em;overflow:hidden;">'+info[c]['maintitle']+'</p></td>';
										// 特記事項
										var notices = [];
										if(info[c]['allrepeat']==1 || (info[c]['repeater']>0 && info[c]['ordertype']=='industry')) notices.push('リピ');
										if(info[c]['completionimage']==1) notices.push('イメ画');
										if(info[c]['express']!=0) notices.push('特急');
										if(info[c]['bundle']==1) notices.push('同梱');
										list += '<td>'+notices.toString()+'</td>';
										/* 2013-09-19 廃止
											list += '<td class="ac">'+arrival+'</td>';
										*/
										list += '<td title="'+info[c]['itemcolor']+'" class="tooltip" style="white-space:normal;"><p style="width:10.5em; background:transparent;">'+info[c]['item']+'</p></td>';
										
										/* 2013-09-19 廃止
											list += '<td class="ac">'+jobstate+'</p></td>';
										*/
										list += '<td class="ac">'+$.strPackmode(info[c])+'</td>';
										list += '<td><input type="text" name="note_silk" onchange="$.checkstatus(this,'+info[c]['id']+')" value="'+info[c]['note_silk']+'" style="width:170px;" /></td>';
										/* 2013-09-19 廃止
											list += '<td><input type="text" name="note_silk2" onchange="$.checkstatus(this,'+info[c]['id']+')" value="'+info[c]['note_silk2']+'" style="width:170px;" /></td>';
										*/
										pattern = 'value="'+info[c]['state_5']+'"';
										re = new RegExp(pattern, "i");
										opt = staff;
										opt = opt.replace(re, pattern+' selected="selected"');
										list += '<td class="ac"><select name="state_5" onchange="$.checkstatus(this,'+info[c]['id']+')">'+opt+'</select></td>';
										list += '<td style="text-align:right;">'+(info[c]['capacity']+(info[c]['adjworktime']-0))+'</td>';
										list += '<td class=ac>';
										list += '<input type="text" value="'+info[c]['actualwork']+'" rel="aw_'+info[c]['actualwork']+'" class="forReal" name="actualwork" onchange="$.setActualwork(this,'+info[c]['print_id']+')" size="2" class="forReal" />';
										list += '</td>';
										list += '<td class="ac"><label><input type="checkbox" name="fin_5" value="1" onchange="$.checkstatus(this,'+info[c]['id']+')"';
										if(info[c]['fin_5']==1){
											list += ' checked="checked"';
										}else if(info[c]['state_5']==0){
											list += ' disabled="disabled"';
										}
										list += ' /></label>';
										list += '</td></tr>';
										
										curdate = info[c]['schedule3'];
									}
									
									list += '<tr><td colspan="9"></td><td class="ac">合計</td><td style="text-align:right;">'+worktime+'</td><td id="tot_actualwork" style="text-align:right;">'+actualwork+'</td></tr>';
									list += '<td></td></tbody></table>';
									
									// 仕事量の集計テーブル
									var head = '<table class="work_table"><caption>仕事量</caption><thead><tr>';
									var body = '<tbody><tr>';
									for(var staffname in info[0]['worktime']){
										head += '<th style="width:80px;">'+staffname+'</th>';
										body += '<td style="text-align:center;">'+info[0]['worktime'][staffname]+'</td>';
									}
									head += '<th style="width:80px;">合計</th>';
									body += '<td style="text-align:center;">'+worktime+'</td>';
									list2 += head+'</tr></thead>'+body+'</tr></tbody></table>';
									
									// 実作業時間の集計テーブル
									head = '<table id="actualwork_table" class="work_table"><caption>実作業時間</caption><thead><tr>';
									body = '<tbody><tr>';
									var col = 0;
									for(var staffname in info[0]['actualtime']){
										head += '<th class="th_'+col+'" style="width:80px;">'+staffname+'</th>';
										body += '<td class="td_'+col+'" style="text-align:center;">'+info[0]['actualtime'][staffname]+'</td>';
										col++;
									}
									head += '<th style="width:80px;">合計</th>';
									body += '<td style="text-align:center;">'+actualwork+'</td>';
									list2 += head+'</tr></thead>'+body+'</tr></tbody></table>';
									
								}else if(mode=='schedule'){
								// 作業予定
									$('#update_workplan').show();
									$('.pagetitle').text('作業予定');
									list = '<table class="result_list"><thead>';
									list += '<tr><th>受注No.</th><th>工場</th><th>納期</th><th>顧客名</th><th>入荷予定</th><th>特記</th><th>商品種類</th><th>製版</th>';
									list += '<th>枚数</th><th>袋詰</th><th>1ヵ所</th><th>2ヵ所</th><th>3ヵ所</th><th>4ヵ所</th><th>刷数</th>';
									list += '<th>刷調整</th><th>仕事調整</th><th>仕事量</th><th>累計</th><th>作業予定者 - 作業予定日 - 実績</th>';
									list += '<th></th></tr></thead>';
									
									list += '<tbody>';
									
									var totWork = {};
									var totPlan = {};
									var w = 0;		// 納期ごとの作業量
									var cnt = 0;
									//var workingday = "0000-00-00";
									var results = 0;
									totWork[info[0]['schedule3']] = 0;
									for(c=0; c<info.length; c++){
										w = (info[c]['capacity']+(info[c]['adjworktime']-0));
										worktime += w;
										jobstate = info[c]['state_2']==0? '未': '済';
										if(curid!=info[c]['id']){
											order_count++;
											curid = info[c]['id'];
											arrival = info[c]['state_7']!=0? '済': info[c]['arrival'].slice(2);
											
											// 納期の区切り線
											list += '<tr class="';
											if(curdate!=info[c]['schedule3']){
												list += 'dateline ';
												totWork[info[c]['schedule3']] = 0;
											}
											
											list += 'row_'+c+'"';
											
											list += '">';
											list += '<td class="ac"><a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+info[c]['id']+params+'">'+info[c]['id']+' <img alt="受注画面へ" src="./img/link.png" width="10" /></a></td>';
											list += '<td class="ac">'+factory[info[c]['factory']]+'</td>';
											list += '<td class="schedule">'+info[c]['schedule3'].slice(2)+'</td>';
											list += '<td><p style="width:12em;overflow:hidden;">'+info[c]['customername']+'</p></td>';
											//list += '<td><p style="width:12em;overflow:hidden;">'+info[c]['maintitle']+'</p></td>';
											list += '<td class="ac">'+arrival+'</td>';
											// 特記事項
											var notices = [];
											if(info[c]['allrepeat']==1 || (info[c]['repeater']>0 && info[c]['ordertype']=='industry')) notices.push('リピ');
											if(info[c]['completionimage']==1) notices.push('イメ画');
											if(info[c]['express']!=0) notices.push('特急');
											if(info[c]['bundle']==1) notices.push('同梱');
											list += '<td>'+notices.toString()+'</td>';
											list += '<td title="'+info[c]['itemcolor']+'" class="tooltip" style="white-space:normal;"><p style="min-width:10.5em; background:transparent">'+info[c]['item']+'</p></td>';
											list += '<td class="ac">'+jobstate+'</p></td>';
											
											list += '<td class="ac">'+info[c]['volume']+' 枚</td>';
											list += '<td class="ac">'+$.strPackmode(info[c])+'</td>';
											
											for(var t=0; t<4; t++){
												list += '<td class="ac';
												if(info[c]['inkcount1']>0) list += ' popup';
												var i = t+1;
												list += '" title="'+info[c]['ink'+i]+'" rel="'+info[c]['pos'+i]+'">'+info[c]['inkcount'+i]+'</td>';
											}
											
											list += '<td class="ac">'+info[c]['platesnumber']+'</td>';
											list += '<td class="ac">';
											list += '<input type="text" value="'+info[c]['adjprintcount']+'" name="adjprintcount" onchange="$.setPrintcount(this,'+info[c]['id']+','+info[c]['print_id']+')" size="2" class="forReal" />';
											list += '</td>';
											list += '<td class="ac">';
											list += '<input type="text" value="'+info[c]['adjworktime']+'" name="adjworktime" onchange="$.setWorktime(this,'+info[c]['print_id']+')" size="2" class="forReal" />';
											list += '</td>';
											list += '<td class="wt_'+info[c]['capacity']+'" style="text-align:right;">'+(info[c]['capacity']+(info[c]['adjworktime']-0))+'</td>';
											list += '<td id="tot_'+c+'" style="text-align:right;">'+worktime+'</td>';
											
											list += '<td class="id_'+info[c]['id']+'">';
											
											// 適用日などのフィールドの違いを吸収
											if(info[c]['wp']){
												scheduled = info[c]['wp'][0]['scheduled'];
												//workingday = info[c]['wp'][0]['workingday'];
												results = info[c]['wp'][0]['results'];
												cnt = info[c]['wp'].length;
											}else{
												scheduled = info[c]['dateofsilk'];
												//workingday = '0000-00-00';
												results = 0;
												cnt = 0;
											}
											
											if(cnt==0){	// 作業予定日集計の導入前のデータ
												pattern = 'value="'+info[c]['state_5_1']+'"';
												re = new RegExp(pattern, "i");
												opt = staff;
												opt = opt.replace(re, pattern+' selected="selected"');
												list += '<div class="clearfix" style="width:400px;">';
													list += '<div class="leftside">';
													list += '<div class="del_worker" onclick="$.del_worker(this);"><img src="./img/cross.png" width="16"></div>';
													list += '<select name="worker">'+opt+'</select>';
													list += '</div>';
													
													list += '<div class="rightside">';
													list += '<p><input type="text" value="'+scheduled+'" size="10" class="forDate datepicker scheduled"> ';
													//list += '<input type="text" value="'+workingday+'" size="10" class="forDate datepicker workingday"> ';
													list += '<input type="text" value="'+results+'" class="forReal results"> %　';
													list += '<input type="button" value="予定追加" class="add_schedule" name="id_'+info[c]['id']+'"></p>';
													list += '</div>';
												list += '</div>';
											}else{
												var wp = info[c]['wp'];
												var isFirst = true;		// 当該スタッフの最初の予定日
												var worker = '';
												for(var d=0; d<cnt; d++){
													if(worker!=wp[d]['worker']){	// 担当者ごとに作業予定と実績を表示
														isFirst = true;
														worker = wp[d]['worker'];
														pattern = 'value="'+worker+'"';
														re = new RegExp(pattern, "i");
														opt = staff;
														opt = opt.replace(re, pattern+' selected="selected"');
														
														if(d>0) list += '</div></div>';
														
														list += '<div class="clearfix" style="width:400px;">';
														
														list += '<div class="leftside">';
														list += '<div class="del_worker" onclick="$.del_worker(this);"><img src="./img/cross.png" width="16"></div>';
														list += '<select name="worker">'+opt+'</select>';
														list += '</div>';
														
														list += '<div class="rightside">';
													}
													
													list += '<p><input type="text" value="'+wp[d]['scheduled']+'" size="10" class="forDate datepicker scheduled"> ';
													//list += '<input type="text" value="'+wp[d]['workingday']+'" size="10" class="forDate datepicker workingday"> ';
													list += '<input type="text" value="'+wp[d]['results']+'" class="forReal results"> %　';
													if(isFirst){
														isFirst = false;
														list += '<input type="button" value="予定追加" class="add_schedule" name="id_'+info[c]['id']+'"></p>';
													}else{
														list += '<input type="button" value="取消" class="cancel_schedule" onclick="$.cancel_schedule(this);"></p>';
													}
												}
												list += '</div></div>';
											}
											list += '</td>';
											
											list += '<td><div class="add_worker" onclick="$.add_worker(this);"><img src="./img/plus.png"></div></td>';
											list += '</tr>';
										}
										
										curdate = info[c]['schedule3'];
										totWork[curdate] += w;
										
										if(info[c]['wp']){
											for(var i=0; i<info[c]['wp'].length; i++){
												scheduled = info[c]['wp'][i]['scheduled'];
												if(typeof totPlan[scheduled]=='undefined'){
													totPlan[scheduled] = w;
												}else{
													totPlan[scheduled] += w;
												}
											}
										}else{
											scheduled = info[c]['dateofsilk'];
											if(typeof totPlan[scheduled]=='undefined'){
												totPlan[scheduled] = w;
											}else{
												totPlan[scheduled] += w;
											}
										}
									}
									list += '</tbody></table>';
									
									// 仕事量の集計テーブル
									var head = '<table id="workplan_table" class="work_table"><caption>仕事量</caption><thead><tr>';
									var body = '<tbody><tr>';
									for(var staffname in info[0]['workplan']){
										head += '<th style="width:80px;">'+staffname+'</th>';
										body += '<td style="text-align:center;">'+info[0]['workplan'][staffname]+'</td>';
									}
									head += '<th style="width:80px;">合計</th>';
									body += '<td id="tot_workplan" style="text-align:center;">'+worktime+'</td>';
									list2 += head+'</tr></thead>'+body+'</tr></tbody></table>';
									
									// 納期ごとの仕事量の集計テーブル
									cnt = 0;
									w = 0;
									head = '<table id="workplan_table2" class="work_table"><caption>納期ごとの仕事量累計</caption><thead><tr>';
									body = '<tbody><tr>';
									for(var date in totWork){
										if(++cnt>10) break;
										w += totWork[date];
										head += '<th style="width:80px;">'+date+'</th>';
										body += '<td style="text-align:center;">'+totWork[date]+'</td>';
									}
									head += '<th style="width:80px;">累計</th>';
									body += '<td id="tot_workplan2" style="text-align:center;">'+w+'</td>';
									list2 += head+'</tr></thead>'+body+'</tr></tbody></table>';
									
									// 作業予定ごとの仕事量の集計テーブル
									Array.prototype.asort = function(key) {
									    this.sort(function(a, b) {
									        return (a[key] > b[key]) ? 1 : -1;
									    });
									};
									
									var tmp = [];
									for(var d in totPlan){
										tmp.push({'date':d, 'wp':totPlan[d]});
									}
									tmp.asort('date');
									w = 0;
									head = '<table id="workplan_table3" class="work_table"><caption>作業予定日ごとの仕事量累計</caption><thead><tr>';
									body = '<tbody><tr>';
									for(cnt=0; cnt<tmp.length; cnt++){
										if(cnt>=10) break;
										w += (tmp[cnt]['wp']-0);
										head += '<th style="width:80px;">'+tmp[cnt]['date']+'</th>';
										body += '<td style="text-align:center;">'+tmp[cnt]['wp']+'</td>';
									}
									head += '<th style="width:80px;">累計</th>';
									body += '<td id="tot_workplan3" style="text-align:center;">'+w+'</td>';
									list2 += head+'</tr></thead>'+body+'</tr></tbody></table>';
									
								}else if(mode=='print'){
								/* 印刷 */
									var print_count = 0;
									var url = './documents/silkworklist.php?'+params;
									window.open(url, 'printform');
									$('#printform').html('').load(function(){window.frames['printform'].print();});
									$('.pagetitle').text('印刷');
									list = '<table class="result_list"><thead>';
									list += '<tr><th>混合</th><th>工場</th><th>納期</th><th>顧客名</th><th>題名</th><th>商品種類</th><th>枚数</th>';
									list += '<th>刷数</th><th>仕事量</th><th>実作業</th>';
									list += '</tr></thead>';
									
									list += '<tbody>';
									for(c=0; c<info.length; c++){
										worktime = Number(info[c]['capacity'])+Number(info[c]['adjworktime']);
										print_count = Number(info[c]['adjprintcount']) + Number(info[c]['platesnumber']);
										if(curid!=info[c]['id']){
											order_count++;
											curid = info[c]['id'];
											list += '<tr class="row_'+c+'">';
											list += '<td>'+info[c]['mixedprint']+'</td>';
											list += '<td class="ac">'+factory[info[c]['factory']]+'</td>';
											list += '<td class="ac">'+info[c]['schedule3']+'</td>';
											list += '<td>'+info[c]['customername']+'</td>';
											list += '<td><p style="width:230px;overflow:hidden;">'+info[c]['maintitle']+'</p></td>';
											list += '<td title="'+info[c]['itemcolor']+'" class="tooltip">'+info[c]['item']+'</td>';
											list += '<td class="ar">'+info[c]['volume']+' 枚</td>';
											list += '<td class="ar">'+print_count+'</td>';
											list += '<td class="ar">'+worktime+'</td>';
											list += '<td class="ar">'+info[c]['actualwork']+'</td>';
											list += '</tr>';
										}else{
											list += '<tr class="row_'+c+'"><td colspan="4"></td>';
											list += '<td title="'+info[c]['itemcolor']+'" class="tooltip">'+info[c]['item']+'</td>';
											list += '<td class="ar">'+info[c]['volume']+' 枚</td>';
											list += '<td class="ar">'+print_count+'</td>';
											list += '<td class="ar">'+worktime+'</td>';
											list += '<td class="ar">'+info[c]['actualwork']+'</td>';
											list += '</tr>';
										}
									}
									list += '</tbody></table>';
								}
								
								$('#result_count').text(order_count);
								$('#result_table').html(list2);
								$('#result_searchtop').html(list);
								if(_scroll!=''){
									$('#result_searchtop').scrollTop(_scroll);
									_scroll = '';
								}
								
								$('.datepicker, .puata, .results, select[name="worker"]', '#result_searchtop').change( function(){
									$.setModify(this);
								});
								$('#result_searchtop .datepicker').datepicker();
							}else{
							// チャート表示
								$('.pagetitle').text('');
								var graph = '';
								var date = '';
								var height = 500;					// チャート表示領域の高さ（px）
								var max = Math.ceil(info[0]*1.2);	// バーの最大値の120％
								var unit = max/height;				// 1pxあたりの作業単位
								var h = 0;
								c = 0;
								for(var d in info[1]){
									graph += '<div class="series">';
									h = info[1][d]['quota']? Math.ceil(info[1][d]['quota']/unit): 0;
									graph += '<div class="bar_quota" style="height:'+ h + 'px;"></div>';
									
									h = info[1][d]['results']? Math.ceil(info[1][d]['results']/unit): 0;
									graph += '<div class="bar_results" style="height:'+ h + 'px;"></div>';
									
									h = info[1][d]['shipping']? Math.ceil(info[1][d]['shipping']/unit): 0;
									var on_100 = info[1][d]['on_100']? Math.ceil(info[1][d]['on_100']/unit): 0;
									//var on_pack = info[1][d]['shipping']? Math.ceil(info[1][d]['shipping']/unit): 0;
									//var on_compo = info[1][d]['shipping']? Math.ceil(info[1][d]['shipping']/unit): 0;
									graph += '<div class="bar_shipping on100" style="height:'+ h + 'px;">';
									graph += '<div class="bar_shipping on100" style="height:'+ on_100 + 'px;"></div>';
									graph += '</div>';
									
									graph += '</div>';
									
									date += '<p>'+d+'</p>';
									
									if(++c == 10) break;
								}
								$('#chart1 .inner').html(graph);
								$('#chart1 .date_wrap').html(date);
								
								// X方向の罫線
								if(max>2500){
									$('.l_2500').css('bottom', (2500/unit+40)+'px').show();
									if(max>3000){
										$('.l_3000').css('bottom', (3000/unit+40)+'px').show();
									}else{
										$('.l_3000').hide();
									}
								}else{
									$('.l_2500, .l_3000').hide();
								}
								$('.l_2000').css('bottom', (2000/unit+40)+'px');
								$('.l_1500').css('bottom', (1500/unit+40)+'px');
								$('.l_1000').css('bottom',(1000/unit+40)+'px');
								$('.l_500').css('bottom', (500/unit+40)+'px');
								
								$('#result_searchtop').hide();
								$('#result_wrapper, #chart1').show();
							}
						}
					}else{
						alert('Error: p711\n'+r);
					}
				}
			});
		},
		list1: function(){
		// 年度集計
			$('#result_count').text(0);
			$('#result_searchtop, #result_table, #chart1 .inner .series').html('');
			$('#update_workplan').hide();
			$('#chart1').hide();
			$('#result_wrapper, #result_searchtop').show();
			
			var FY = $('#FY').val();
			var state = 'state_5';
			var printtype = 'silk';
			var info = [];		// 検索結果のレコードを代入する
			
			$('.pagenavi p', '#result_wrapper').hide();
			$('.pagenavi .pagetitle', '#result_wrapper').text('商品数 【'+FY+'年度集計】').show();
			$('#result_count').text('0');
			$('#result_searchtop').html('<p class="alert">検索中 ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
				data:{'act':'search','mode':'addup', 'field1[]':['FY','state','printtype'], 'data1[]':[FY,state,printtype]}, success: function(r){
					if(typeof r=='object'){
						if((r instanceof Array && r.length==0) || r==null){
								$('#result_searchtop').html('<p class="alert">該当する注文データが見つかりませんでした</p>');
						}else{
							info = r;
							//$('#main_wrapper fieldset').hide();
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
		},
		list2: function(){
		// 日計
			$('#result_count').text(0);
			$('#result_searchtop, #result_table, #chart1 .inner .series').html('');
			$('#update_workplan').hide();
			$('#chart1').hide();
			$('#result_wrapper, #result_searchtop').show();
			var FY = $('#FY2').val();
			var monthly = $('#monthly').val();
			var state = 'state_5';
			var printtype = 'silk';
			var info = [];		// 検索結果のレコードを代入する
			$('.pagenavi p', '#result_wrapper').hide();
			$('.pagenavi .pagetitle', '#result_wrapper').text('商品数 【'+FY+'年'+monthly+'月集計】').show();
			$('#result_count').text('0');
			$('#result_searchtop').html('<p class="alert">検索中 ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
				data:{'act':'search','mode':'daily', 'field1[]':['FY','monthly','state','printtype'], 'data1[]':[FY,monthly,state,printtype]}, success: function(r){
					if(typeof r=='object'){
						if((r instanceof Array && r.length==0) || r==null){
								$('#result_searchtop').html('<p class="alert">該当する注文データが見つかりませんでした</p>');
						}else{
							info = r;
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
							var lastday = info['total'].length;
							
							// 列固定パート
							head1 = '<table><thead><tr><th>'+FY+'年'+monthly+'月</th></tr></thead>';
							list1 = "<tbody>";
							for(var staff in info){
								if(staff=='total') continue;
								list1 += '<tr><td>'+staff+'</td></tr>';
							}
							list1 += '</tbody></table>';
							foot1 = '<tfoot><tr><td class="foot_separate" style="text-align:center;border-right:1px solid #d8d8d8;">合　計</td></tr></tfoot>';
							html1 = '<div class="leftcol">' + head1 + foot1 + list1 + '</div>';
							
							// スクロール対象の日計パート
							head = '<table id="resulttable"><thead><tr>';
							for(var i=1; i<=lastday; i++){
								head += '<th style="width:70px;">'+i+'</th>';
							}
							head += '<th style="width:90px;">月合計</th></tr></thead>';
							
							// スタッフごとのデータ
							list = "<tbody>";
							for(var staff in info){
								if(staff=='total') continue;
								tot = 0;
								list += '<tr>';
								for(var i=0; i<lastday; i++){
									tot += info[staff][i]-0;
									list += '<td>'+$.addFigure(info[staff][i])+'</td>';
								}
								list += '<td>'+$.addFigure(tot)+'</td></tr>';
							}
							list += '</tbody></table>';
							
							// 合計行
							tot = 0;
							foot = '<tfoot><tr>';
							for(var i=0; i<lastday; i++){
								tot += info['total'][i]-0;
								foot += '<td class="foot_separate">'+$.addFigure(info['total'][i])+'</td>';
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
	
	
	$('#progress').click( function(){
		$.search('progress');
	});
	
	$('#schedule').click( function(){
		$.search('schedule');
	});
	
	$('#chart').click( function(){
		$.search('chart');
	});
	
	$('#print').click( function(){
		$.search('print');
	});
	
	// 年度集計
	$('#list1').click( function(){
		$.list1();
	});
	
	// 日計
	$('#list2').click( function(){
		$.list2();
	});
	
	$('#reset').click( function(){
		$('#result_count').text(0);
		$('#result_searchtop, #result_table').html('');
		$('.pagetitle').text('');
		var f = document.forms.searchtop_form;
		var dt = new Date();
		dt.setDate(dt.getDate()-3);
		var d = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
		f.term_from.value = d;
		f.term_to.value = '';
		f.schedule_from.value = '';
		f.schedule_to.value = '';
		f.fin_5.value = '1';
		f.state_5.value = '0';
		$('#term_from, #term_to').change();
	});
	
	
	$('#cleardate').click( function(){
		document.forms.searchtop_form.term_from.value="";
		document.forms.searchtop_form.term_to.value="";
		$('#term_from, #term_to').change();
	});
	
	
	$('#clearschedule').click( function(){
		document.forms.searchtop_form.schedule_from.value="";
		document.forms.searchtop_form.schedule_to.value="";
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
	
	
	/* 絵型とインクのポップアップ */
	$('.popup').live('click', function(){
		var ink = $(this).attr('title');
		var pos = $(this).attr('rel').split(' ');
		$.ajax({url:'./php_libs/dbinfo.php', type:'POST', dataType:'text', async:false,
			data:{'act':'positionimage','area_path':pos[0], 'selectivename':pos[1], 'selectivekey':pos[2]}, success: function(r){
				$.msgbox('インク：'+ink+'<hr><p>位置：'+pos[1]+'</p><div class="pp_image">'+r+'</div>');
			}
		});
		
	});
	
	
	/* 作業予定の追加 */
	$('.add_schedule', '#result_searchtop').live('click', function(){
		$.setModify(this);
		
		// タグ追加
		var list = '<p><input type="text" value="0000-00-00" size="10" class="forDate datepicker scheduled"> ';
		//list += '<input type="text" value="" size="10" class="forDate datepicker workingday"> ';
		list += '<input type="text" value="0" class="forReal results"> %　';
		list += '<input type="button" value="取消" class="cancel_schedule" onclick="$.cancel_schedule(this);"></p>';
		$(this).closest('div').append(list);
		
		// イベント設定
		$('.datepicker, .results, select[name="worker"]', '#result_searchtop').change( function(){
			$setModify(this);
		});
		$('#result_searchtop .datepicker').datepicker();
	});
	
	
	/* 作業予定の更新 */
	$('#update_workplan').click( function(){
		var fld = ['orders_id','scheduled','quota','results','worker'];
		var dat = [];
		var isOver = false;
		for(var row in $.prop.update_id){
			var orderid = $.prop.update_id[row];
			var $td = $('.row_'+row+' .id_'+orderid, '#result_searchtop');
			$td.children('div').each( function(){
				var tot_results = 0;							// 実績合計
				var quota = 0;									// 作業予定の割当分（％）
				var results = 0;								// 作業実績（％）
				var worker = $('.leftside select', this).val();	// 作業予定者のスタッフID
				var exist_schedul = {};							// 作業予定日の重複チェック
				
				$(this).css('background', 'transparent');
				
				$(this).find('.rightside p').each( function(index){
					var scheduled = $(this).children('.scheduled').val();
					// var workingday = $(this).children('.workingday').val();
					
					if((scheduled=="" || scheduled=="0000-00-00") && index>0) return true;	// 1行目の作業予定を除き未指定の場合は continue
					if(exist_schedule[scheduled]) return true;								// 同じ日付があれば continue
					exist_schedule[scheduled] = true;
					if(index==0){
						quota = 100;
					}else{
						quota -= results;	// 作業割当は100％から実績を引いていく
					}
					results = $(this).children('.results').val()-0;
					tot_results += results;
					if(quota<results || tot_results>100){
						$.msgbox('実績が予定を上回っています。');
						$(this).closest('.clearfix').css('background', '#fd0');
						isOver = true;
						return false;	// break
					}
					dat.push(orderid+'|'+scheduled+'|'+quota+'|'+results+'|'+worker);
				});
				
				if(isOver) return;
			});
			
			
		}
		
		if(dat.length==0){
			alert('更新データはありません。');
			return;
		}
		
		$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'text', async:false,
			data:{'act':'update','mode':'workplan', 'field4[]':['orders_id'], 'data4[]':$.prop.update_id, 'field5':fld, 'data5':dat}, success: function(r){
				if(r){
					$.prop.update_id = {};
					$.prop.modified = false;
					$.search('schedule');
					alert('更新完了！');
				}else{
					alert('Error: 更新できませんでした。');
				}
			}
		});
	});
	
	
	/*
	*	納期日付の変更で担当者セレクターを書き換える
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
	
	
	// unload
	window.addEventListener('beforeunload', function(event) {
    	if($.prop.modified) {
			return event.returnValue = '保存されていない作業予定があります。';
		}
	}, false);
	
	
	/* init */
	$(window).one('load', function(){
		if(document.forms.searchtop_form.term_from.value==""){
			var dt = new Date();
			dt.setDate(dt.getDate()-3);
			var d = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
			document.forms.searchtop_form.term_from.value = d;
		}
		$.search(_mode);
	});
});
