/*
* タカハマライフアート
* 発注
* charset euc-jp
* log
* 2020-07-09 トムスの未発注データをCSV形式でエクスポート
*/

$(function(){
	jQuery.extend({
		prop: {},
		handleDownload: function(content, filename) {
			var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
			var blob = new Blob([ bom, content ], { "type" : "text/csv" });
			// var blob = new Blob([ content ], { "type" : "text/csv" });

			if (window.navigator.msSaveBlob) { 
				window.navigator.msSaveBlob(blob, filename); 

				// msSaveOrOpenBlobの場合はファイルを保存せずに開ける
				window.navigator.msSaveOrOpenBlob(blob, filename); 
			} else {
				var a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.target = '_blank';
				a.download = filename;
				a.click();
			}
		},
		checkstatus: function(my,orders_id,isEDI){
		/*
		*	@my				this
		*	@orders_id		受注No.
		*	@isEDI			EDI発注の有無　0:なし　1:全てトムス　2:全てキャブ　3:トムスとキャブ
		*/
			if(orders_id==""){
				alert('注文の受付が完了していません。');
				return;
			}
			
			var staff = $('#order_staff').val();
			if(staff==0){
				alert('発注担当を指定してください。');
				return;
			}
			
			var field = ['orders_id', 'ordering'];
			var data = [orders_id, staff];
			switch(isEDI){
				case 1:	field[2] = 'toms_order';
						data[2] = 1;
						break;
				case 2: field[2] = 'cab_order';
						data[2] = 1;
						break;
				case 3:	field[2] = 'toms_order';
						field[3] = 'cab_order';
						data[2] = 1;
						data[3] = 1;
						break;
			}
			
			/* 不足分で発注中止になっている注文分を処理済にする */
			if($(my).val()=='done'){
				if(!$(my).is(':checked')) return;
				switch(isEDI){
					case 1:	field.push('toms_response');
							data.push(1);
							break;
					case 2: field.push('cab_response');
							data.push(1);
							break;
					case 3: field.push('toms_response');
							field.push('cab_response');
							data.push(1);
							data.push(1);
							break;
				}
				isEDI = 0;	// 表示を発注済にする
			}
			
			var tr = $(my).closest('tr');
			var destination = tr.find('.destination').val();			// 送付先
			$.screenOverlay(true,true);
			$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST', dataType:'text',
				data: {'act':'update','mode':'progressstatus','field1[]':field,'data1[]':data}, async: true,
 				success: function(r){
 					if(!r.match(/^\d+?$/)){
 						$.screenOverlay(false);
 						alert('Error: p64\n'+r);
 						return;
 					}
 					if(isEDI==0){
 						$(my).closest('td').html('<label class="fin">発注済み</lable>');
 						$.screenOverlay(false);
 					}else{
 						if(isEDI==1 || isEDI==3){
 							// トムス
	 						var deliver = tr.find('.deliver').val();					// 運送業者
							var saturday = tr.find('.saturday').is(':checked')? 1: 0;	// 土曜配達指定
							var holiday = tr.find('.holiday').is(':checked')? 1: 0;		// 日曜祝日配達指定
							//var pack = tr.find('.pack').is(':checked')? 1: 0;			// PP袋の有無
	 						$.ajax({ url: './php_libs/edi_ordering.php', type: 'POST', dataType:'text',
								data: {'maker':'toms', 'orders_id':orders_id, 'deliver':deliver, 'destination':destination, 'saturday':saturday, 'holiday':holiday}, async: true,
				 				success: function(r1){
	 								if(r1==1){
	 									$(my).closest('td').html('<label class="wait">トムス回答待ち</label><p><label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+orders_id+','+isEDI+');"> 処理済にする</label></p>');
	 									if(isEDI==1) $.screenOverlay(false);
	 								}else{
	 									field = ['orders_id', 'ordering', 'toms_order', 'toms_response'];
	 									data = [orders_id, 0, 0, 0];
	 									$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST', dataType:'text',
											data: {'act':'update','mode':'progressstatus','field1[]':field,'data1[]':data}, async: true,
											success: function(){
			 									$(my).closest('td').html('<label class="suspend">トムス発注エラー</lable><p><label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+orders_id+','+isEDI+');"> 処理済にする</label></p>');
			 									if(isEDI==1) $.screenOverlay(false);
			 									alert('Error: '+r1);
											},error: function(XMLHttpRequest, textStatus, errorThrown) {
												if(isEDI==1) $.screenOverlay(false);
												alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
											}
										});
	 								}
	 							},error: function(XMLHttpRequest, textStatus, errorThrown) {
									if(isEDI==1) $.screenOverlay(false);
									alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
								}
	 						});
	 					}
	 					if(isEDI==2 || isEDI==3){
	 						// キャブ
	 						var cab_note = tr.find('.cab_note').val();					// 着日指定
	 						$.ajax({ url: './php_libs/edi_ordering.php', type: 'POST', dataType:'text',
								data: {'maker':'cab', 'orders_id':orders_id, 'destination':destination, 'cab_note':cab_note}, async: true,
				 				success: function(r1){
	 								if(r1==1){
	 									$(my).closest('td').html('<label class="wait">キャブ回答待ち</label><p><label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+orders_id+','+isEDI+');"> 処理済にする</label></p>');
	 									$.screenOverlay(false);
	 								}else{
	 									field = ['orders_id', 'ordering', 'cab_order', 'cab_response'];
	 									data = [orders_id, 0, 0, 0];
	 									$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST', dataType:'text',
											data: {'act':'update','mode':'progressstatus','field1[]':field,'data1[]':data}, async: true,
											success: function(){
			 									$(my).closest('td').html('<label class="suspend">キャブ発注エラー</lable><p><label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+orders_id+','+isEDI+');"> 処理済にする</label></p>');
			 									$.screenOverlay(false);
			 									alert('Error: '+r1);
											},error: function(XMLHttpRequest, textStatus, errorThrown) {
												$.screenOverlay(false);
												alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
											}
										});
	 								}
	 							},error: function(XMLHttpRequest, textStatus, errorThrown) {
									$.screenOverlay(false);
									alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
								}
	 						});
	 					}
 					}
 				},error: function(XMLHttpRequest, textStatus, errorThrown) {
					$.screenOverlay(false);
					alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
				}
 			});
 			
		},
		setQuery: function(my){
		/* 受注入力画面のへのアンカーにスクロール状態を追加 */
			var self = $(my);
			var href = self.attr('href')+'&scroll='+$('#result_searchtop').scrollTop();
			self.attr('href', href);
		},
		export: function(factory, date) {
			$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'text', async:false,
				data:{'act':'export', 'mode':'', 'csv':'orderinglist', 'factory':factory},
				success: function(r){
					if (r.length < 2) {
						alert('工場' + factory + ' に該当するデータはありませんでした');
					} else {
						var filename = `toms-order-1_${date}.csv`;
						$.handleDownload(r, filename);
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
				}
			});
		},
		search: function(func){
			var params = '&filename=ordering&state_0=0';	// 受注画面へ遷移する際に渡すクエリストリング
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
			$('#result_count').text('0');
			$('#result_searchtop').html('<p class="alert">検索中 ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
				data:{'act':'search','mode':'ordering', 'field1[]':field, 'data1[]':data}, success: function(r){
					if(r instanceof Array){
						if(r[0]=="Error"){
							var err = "以下の受注No.で更新でエラーです\n";
							for(var i in r){
								err += r[i]+"\n";
							}
							alert('Error: p172\n'+err);
							$('#result_searchtop').html("");
							return;
						}
						if(r.length==0){
							$('#result_searchtop').html('<p class="alert">該当する注文データが見つかりませんでした</p>');
						}else{
							show(r);
						}
					}else{
						alert('Error: p182\n'+r);
						$('#result_searchtop').html("");
					}
				},error: function(XMLHttpRequest, textStatus, errorThrown) {
					$('#result_searchtop').html('');
					alert("XMLHttpRequest : " + XMLHttpRequest.status + "\ntextStatus : " + textStatus);
				}
			});
			
			var show = function(info){
				var t = 0;
				var curid = 0;
				var len = 0;
				var isEDI = 0;			// EDI発注の有無　0:なし　1:全てトムス　2:全てキャブ　3:トムスとキャブ
				var isNotEDI = false;	// EDIに対応していない商品の有無
				var state_0 = 0;		// 発注の有無
				var factory = {0:'-',1:'[1]', 2:'[2]', 9:'[1,2]'};
				var result_len = info.length;
				var body = '';
				var head = '<table class="result_list"><thead><tr><th>受注No.</th><th>工場</th><th>注文確定</th><th>顧客名</th><th>題名</th><th>受付</th></tr></thead>';
				var list = "<tbody>";
				var makeBody = function(rec){
					var body = '<tr class="rowseparate">';
					body += '<td class="centering">No.<a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+rec['ordersid']+params+'">'+rec['ordersid'];
					body += ' <img alt="受注画面へ" src="./img/link.png" width="10" /></a></td>';
					body += '<td class="centering">'+factory[rec['factory']]+'</td>';
					body += '<td class="centering">'+rec['schedule2']+'</td>';
					body += '<td>'+rec['customername']+' 様</td>';
					body += '<td>'+rec['maintitle']+'</td>';
					body += '<td class="centering">'+rec['staffname']+'</td>';
					//body += '<td></td>';
					body += '</tr>';
					body += '<tr><td colspan="6">';
					
					// 注文リスト（inner_table）
					body += '<table class="inner_table">';
					body += '<tbody>';
					body += '<tr class="heading">';
					body += '<td>メーカー</td><td>カテゴリ</td><td>商品名</td><td>サイズ</td><td>カラー</td><td>枚数</td><td></td>';
					body += list;
					body += '<tr class="subtotal">';
					if(isEDI==0){
						body += '<td colspan="5"></td>';
					}else{
						body += '<td>';
						body += '<select class="destination"><option value="1" selected="selected">第一工場</option><option value="2">第二工場</option></select>';
						body += '</td>';
						body += '<td colspan="4">';
						if(isEDI==1 || isEDI==3){
							body += '<p>';
							body += '<label>トムス指定項目</label>';
							body += '<select class="deliver"><option value="1">佐川急便</option><option value="2">福山通運</option><option value="3" selected="selected">ヤマト運輸</option></select>';
							body += '<label><input type="checkbox" value="1" class="saturday"> 土曜配送</label>';
							body += '<label><input type="checkbox" value="1" class="holiday"> 日曜祝日配送</label>';
							//body += '<label><input type="checkbox" value="1" class="pack"> PP袋あり</label>';
							body += '</p>';
						}
						if(isEDI==2 || isEDI==3){
							body += '<p>';
							body += '<label>キャブ着日指定</label>';
							body += '<input type="text" class="cab_note" value="">';
							body += '</p>';
						}
						body += '</td>';
					}
					body += '<td>'+rec['order_amount']+' 枚</td>';
					body += '<td>';
					if(rec['ordering']==0){
						body += '<input type="button" value="発注チェック" class="ordering" onclick="$.checkstatus(this,'+rec['ordersid']+','+isEDI+');">';
						switch(isEDI){
							case 0:	body += '<label>EDIなし</lable>';
									break;
							case 1:	body += '<label>トムスEDI発注';
									break;
							case 2:	body += '<label>キャブEDI発注';
									break;
							case 3:	body += '<label>トムス・キャブEDI発注';
									break;
						}
						if(isNotEDI){
							body += '　　※EDI非対応の商品あり';
						}
						body += '</lable>';
					}else{
						if(rec['toms_order']==0 && rec['cab_order']==0){
							body += '<label class="fin">発注済み</lable>';
						}else{
							if(rec['toms_order']==1){
								if(rec['toms_response']==0){
									body += '<p><label class="wait">トムス回答待ち</label>';
									body += '<label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+rec['ordersid']+', 1);"> 処理済にする</label></p>';
								}else if(rec['toms_response']==2){
									body += '<p><label class="suspend">トムス不足分あり！発注中止</lable>';
									body += '<label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+rec['ordersid']+', 1);"> 処理済にする</label></p>';
								}else if(rec['toms_response']==1 && rec['cab_response']!=1){
									body += '<p><label class="fin">トムス発注済み</lable></p>';
								}
							}
							if(rec['cab_order']==1){
								if(rec['toms_order']==1 && !(rec['toms_response']==1 && rec['cab_response']==1)){
									body += '<hr>';
								}
								if(rec['cab_response']==0){
									body += '<p><label class="wait">キャブ回答待ち</label>';
									body += '<label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+rec['ordersid']+', 2);"> 処理済にする</label></p>';
								}else if(rec['cab_response']==2){
									body += '<p><label class="suspend">キャブ不足分あり！発注中止</lable>';
									body += '<label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+rec['ordersid']+', 2);"> 処理済にする</label></p>';
								}else if(rec['cab_response']==1){
									body += '<p><label class="fin">キャブ発注済み</lable></p>';
								}
							}
						}
					}
					body += '</td>';
					body += '</tr>';
					body += '</tbody></table>';
					// ----- inner_table
					
					body += '</td></tr>'
					body += '<tr class="blank"><td colspan="6"> </td></tr>';
					return body;
				}
				for(var i=0; i<result_len; i++){
					if(curid!=info[i]['ordersid']){
						if(curid!=0){
							body += makeBody(info[i-1]);
						}
						list = '';
						curid = info[i]['ordersid'];
						len++;
						isEDI = 0;
						isNotEDI = false;
						state_0 = info[i]['state_0'];
					}
					
					// 注文リスト（inner_table）のボディ
					var itemname = info[i]['itemname'];
					if(info[i]['item_code']!=''){
						itemname = '['+info[i]['item_code']+'] '+itemname;
					}
					
					if(info[i]['makername']=='トムス'){
						if(isEDI==0){
							isEDI = 1;
						}else if(isEDI==2){
							isEDI = 3;
						}
						list += '<tr>';
					}else if(info[i]['makername']=='キャブ'){
						if(isEDI==0){
							isEDI = 2;
						}else if(isEDI==1){
							isEDI = 3;
						}
						list += '<tr>';
					}else{
						isNotEDI = true;
						list += '<tr class="notedi">';
					}
					list += '<td>'+info[i]['makername']+'</td>';
					list += '<td>'+info[i]['catname']+'</td>';
					list += '<td>'+itemname+'</td>';
					list += '<td class="centering">'+info[i]['sizename']+'</td>';
					list += '<td>'+info[i]['color']+'</td>';
					list += '<td class="toright">'+info[i]['amount']+' 枚</td>';
					list += '<td></td>';
					list += '</tr>';
					// ----- inner_table
				}
				
				body += makeBody(info[i-1]);
				body += '</tbody></table>';
				var html = head + body;
				$('#result_count').text(len);
				$('#result_searchtop').html(html);
				//$('#result_searchtop').find('tr:nth-child(even)').children('td').css({'background':'#f6f6f6'});
				$('#result_searchtop .result_list').tablefix({height:580, fixRows:1});
			}
		}
	});

	/* 検索開始 */
	$('#search').click( function(){
		$.search();
	});

	/* リセット */
	$('#reset').click( function(){
		document.forms.searchtop_form.reset();
		$('#result_count').text('0');
		$('#result_searchtop').html('');
	});

	/* CSV ダウンロード */
	$('#export').click( function() {
		var today = new Date(),
			month = today.getMonth() + 1,
			strDate = [
				today.getFullYear(),
				("0"+month).slice(-2),
				("0"+today.getDate()).slice(-2),
				("0"+today.getHours()).slice(-2),
				("0"+today.getMinutes()).slice(-2)
			].join('');

		$.export('1', strDate);
		$.export('2', strDate);
	});

	/* init */
	$(window).one('load', function(){
		$.search();
	});

});
