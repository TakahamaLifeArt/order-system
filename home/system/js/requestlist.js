/*
*	タカハマライフアート
*	資料請求一覧
*	charset euc-jp
*/

	$(function(){

/***************************************************************************************************************************
*
*	main page module
*
****************************************************************************************************************************/

		$('input[type="button"], .btn_pagenavi, p[class^="attach_"], .act', '#main_wrapper').live('click', function(){
			mypage.main('btn', $(this));
		});


		/********************************
		*	change selector event
		*/
	   /*
		$('#searchtop_form select').change( function(){
			mypage.main('btn', $('input[title="search"]'));
		});
		*/

		/********************************
		*	clear
		*/
		$('#cleardate').click( function(){
			document.forms.searchtop_form.term_from.value="";
			document.forms.searchtop_form.term_to.value="";
		});
		
		
		/********************************
		*	datepicker
		*/
		$('.datepicker', '#searchtop_form').datepicker({
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
					$.ajax({ url: './php_libs/checkHoliday.php',
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
				if(mypage.prop.holidayInfo[YY+"_"+MM][DD]) weeks = 0;
				if(weeks == 0) return [true, 'days_red', texts];
				else if(weeks == 6) return [true, 'days_blue'];
				return [true];
			}
		});


		/********************************
		*	initialization
		*/
		$(window).one('load', function(){
			document.forms.searchtop_form.customername.focus();
			// mypage.main('btn', $('input[title="search"]'));
		});

	});

	var mypage = {
		prop: {	'holidayInfo':{},
				'searchdata':[]
		},
		checkstatus: function(my, id){
			var phase = 1;
			if($(my).attr('checked')){
				phase = 2;
			}
			$.ajax({url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'update','mode':'requestmail','field1[]':['reqid','phase'],'data1[]':[id,phase]}, async: false,
				success: function(r){
					var $shippingdate = $(my).parent().next();
					if(r==""){
						alert('Error: p90\n'+r);
						if(phase==1){
							$(my).removeAttr('checked');
							$shippingdate.text('0000-00-00'); 
						}else{
							$(my).attr('checked', 'checked');
						}
						return;
					}
					
					if(phase==2){
						$(my).next('label').text(' 発送済み');
						$shippingdate.text(r);
					}else{
						$(my).next('label').text(' 未発送');
						$shippingdate.text('0000-00-00');
					}
				}
			});
		},
		main: function(func){
			var btn = function(my){
				var LEN = 20;
				var myTitle = my.attr('title');
				var start_row = $('.pos_pagenavi').text().split('-')[0]-0;
				var result_len = $('#result_count').text()-0;
				var lines = [];			// 検索結果のレコードを代入する
				var total_request = 0;	// 資料請求の総数
				var html = '';
				var list = '';
				var head = '';
				var i = 0;
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
						start_row = 0;
						$('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility','hidden');
						$('.btn_pagenavi[title="first"], .btn_pagenavi[title="previous"]').css('visibility','hidden');
						$('#result_searchtop').html('');
						break;
					case 'conversion':
						break;
					default:
						return;
						break;
				}

				if(myTitle=="search" || myTitle=="conversion"){
					var field = [];
					var data = [];
					var elem = document.forms.searchtop_form.elements;
					
					$('#result_searchtop').html('');
					$('#result_count').text('0');
					$('.pos_pagenavi').text('');
					mypage.prop.searchdata = [];
					
					for (var j=0; j < elem.length; j++) {
						if(elem[j].type=="text" || elem[j].type=="select-one"){
							field.push(elem[j].name);
							var tmp = (elem[j].value).trim();
							data.push(tmp);
						}
					}
					if(myTitle=="conversion"){
						field.push('conversion');
						data.push('1');
					}

					$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:false,
						data:{'act':'search','mode':'requestmail', 'field1[]':field, 'data1[]':data}, success:function(r){
							if(r instanceof Array){
								if(r.length==0){
									$('#result_searchtop').html('<p class="alert">該当するデータが見つかりませんでした</p>');
								}else{
									if(myTitle=="conversion"){
										mypage.prop.searchdata = r[0];
										lines = r[0];
										total_request = r[1];
										if(r[0]==0) $('#result_searchtop').html('<p class="alert">該当するデータが見つかりませんでした</p>');
									}else{
										mypage.prop.searchdata = r;
										lines = r;
									}
								}
								$('#result_wrapper').show();
							}else{
								alert('Error: p154\n'+r);
							}
						}
					});
				}

				result_len = mypage.prop.searchdata.length;
				
				// コンバージョン
				if(myTitle=="conversion"){
					var ratio = 0;			// 注文率
					var order_count = 0;	// 成約数
					
					if(result_len>0){
						html = '<table><thead><tr><th>注文</th><th>顧客ID</th><th>顧客名</th><th>Webサイト</th><th>資料請求日</th><th>問い合わせ日</th><th>受注No.</th><th>注文確定日</th></tr></thead>';
						html += "<tbody>";
						for(i=0; i<result_len; i++){
							html += '<tr>';
							html += '<td>';
							if(lines[i]['progress_id']==4){
								html += '<span style="color:#c30;">注文</span>';
								order_count++;
							}
							html += '</td>';
							html += '<td>'+lines[i]['customer_num']+'</td>';
							html += '<td>'+lines[i]['customername']+'</td>';
							html += '<td>'+lines[i]['sitename']+'</td>';
							html += '<td class="centering">'+lines[i]['requestdate'].split(' ')[0]+'</td>';
							html += '<td class="centering">'+lines[i]['created']+'</td>';
							html += '<td class="centering">'+lines[i]['orders_id']+'</td>';
							html += '<td class="centering">';
							if(lines[i]['progress_id']==4){
								html += lines[i]['schedule2']+'</td>';
							}else{
								html += '-';
							}
							html += '</tr>';
						}
						html += '</tbody></table>';

						if(order_count>0){
							ratio = Math.round((order_count/total_request)*1000)/10;
						}
					}
					
					if(total_request>0){
							html = '<p style="margin: 20px 0 10px 10px;">注文率：　<strong style="font-size:125%;">'+ratio+'</strong>％　　（'+order_count+'／'+total_request+'件）</p>' + html;
							$('#result_searchtop').html(html);
							$('#result_searchtop tbody tr').each(function(i){
								if(i%2==0) $(this).children('td').css({'border-bottom': '1px solid #d8d8d8'});
								if(i%2==1) $(this).addClass('rowseparate');
							});

						$('#main_wrapper fieldset').hide();
						$('#result_wrapper').show();
					}
					
					return;
				}
				
				// 一覧
				if(result_len>0){
					lines = mypage.prop.searchdata;
					$('#result_count').text(result_len);

					if(result_len>LEN && myTitle=='search'){
						$('.btn_pagenavi[title="last"], .btn_pagenavi[title="next"]').css('visibility','visible');
					}
					if(start_row+LEN<=result_len) result_len = start_row+LEN;

					$('.pos_pagenavi').text(start_row+1+'-'+result_len);

					list = "<tbody>";
					head = '<table><thead><tr><th rowspan="2">受信日時</th><th>件名</th><th rowspan="2">名前</th><th rowspan="2">発送先住所</th>';
					head += '<th rowspan="2">Webサイト</th><th rowspan="2">発送状況</th><th rowspan="2">発送日</th></tr>';
					head += '<tr><th>メッセージ</th></tr></thead>';
					for(i=start_row; i<result_len; i++){
						var dt = lines[i]['requestdate'].split(' ');
						list += '<tr>';
						list += '<td rowspan="2" style="border-bottom: 1px solid #d8d8d8" class="centering">'+dt[0]+'<br>'+dt[1]+'</td>';
						list += '<td>'+lines[i]['subject']+'</td>';
						list += '<td rowspan="2" style="border-bottom: 1px solid #d8d8d8">'+lines[i]['requester']+'</td>';
						list += '<td rowspan="2" style="border-bottom: 1px solid #d8d8d8">'+lines[i]['reqzip']+'<br>'+lines[i]['reqaddr']+'</td>';
						list += '<td rowspan="2" style="border-bottom: 1px solid #d8d8d8">'+lines[i]['sitename']+'</td>';
						list += '<td rowspan="2" style="border-bottom: 1px solid #d8d8d8" class="centering"><input type="checkbox" value="1" id="phase_'+lines[i]['reqid']+'" onchange="mypage.checkstatus(this,'+ lines[i]['reqid'] +')"';
						if(lines[i]['phase']==1){
							list += ' /><label for="phase_'+lines[i]['reqid']+'"> 未発送</label>';
						}else{
							list += ' checked="checked" /><label for="phase_'+lines[i]['reqid']+'"> 発送済み</label>';
						}
						list += '</td>';
						list += '<td rowspan="2" style="border-bottom: 1px solid #d8d8d8" class="centering">'+lines[i]['shippedreqdate']+'</td>';
						list += '</tr>';

						list +='<tr>';
						if(lines[i]['message']!=""){
							list += '<td style="border-bottom: 1px solid #d8d8d8">'+lines[i]['message'].slice(0,10)+'...';
							list += '<span class="act" id="message_'+lines[i]['reqid']+'" title="showmessage">[全文表示]</span>';
							list += '</td>';
						}else{
							list += '<td style="border-bottom: 1px solid #d8d8d8"></td>';
						}
						list += '</tr>';
					}
					list += '</tbody></table>';

					html = head + list;
					$('#result_searchtop').html(html);
					$('#result_searchtop tbody tr').each(function(i){
						if(i%4==0) $(this).children('td').css({'background':'#f6f6f6','border-top': '1px solid #d8d8d8'});
						if(i%4==1) $(this).addClass('rowseparate');
					});

					$('#main_wrapper fieldset').hide();
					$('#result_wrapper').show();
				}
			}

			var display = {
				show_message: function(contact_id){
					// メッセージの全文を表示
					var d = "";
					for(var i=0; i<mypage.prop.searchdata.length; i++){
						if(mypage.prop.searchdata[i]['reqid']==contact_id){
							d = mypage.prop.searchdata[i]['message'].replace(/\r\n/g, '<br />');
							break;
						}
					}

					if(d=="") return;	// メッセージなし

					var image = '<div style="width:520px;height:550px;margin:0 auto;overflow:auto;">';
					image += '<p style="padding:1em;">'+d+'</p>';
					image += '</div>';

					$.msgbox(image);
				}
			}

			switch(func){
			case 'btn':
				var title = arguments[1].attr('title');
				if(title=='reset'){
					if($('#detail_wrapper').is(':visible')){
						$('.popup_wrapper').fadeOut();
						$('#detail_lists').remove();
						$('#detail_wrapper').hide();
						$('#result_wrapper').show();
					}
					$('#result_searchtop').html('');
					$('#result_count').text('0');
					$('.pos_pagenavi').text('');
					$('#plates_status').val('0');
					// $('.btn_pagenavi').css('visibility','hidden');
					document.forms.searchtop_form.reset();
					document.forms.searchtop_form.customername.focus();
				}else if(title=='detail'){
					var id = arguments[1].attr('class').split('_')[1];
					display.detail(id);
				}else if(title=='showmessage'){
					var id = arguments[1].attr('id').split('_')[1];
					display.show_message(id);
				}else if(title=='searchform'){
					$('#result_searchtop').html('');
					$('#result_wrapper').hide();
					$('fieldset', '#main_wrapper').show();
				}else if(title=='seal'){
					var url = './documents/tackseal.php?startpos='+$('#start_seal_pos').val();
					window.open(url, 'printform');
					$('#printform').load(function(){window.frames['printform'].print();});
				}else{
					btn(arguments[1]);
				}
				break;
			}
		}
	}