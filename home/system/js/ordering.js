/*
* �����ϥޥ饤�ե�����
* ȯ��
* charset euc-jp
* log
* 2020-07-09 �ȥॹ��̤ȯ��ǡ�����CSV�����ǥ������ݡ���
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

				// msSaveOrOpenBlob�ξ��ϥե��������¸�����˳�����
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
		*	@orders_id		����No.
		*	@isEDI			EDIȯ���̵ͭ��0:�ʤ���1:���ƥȥॹ��2:���ƥ���֡�3:�ȥॹ�ȥ����
		*/
			if(orders_id==""){
				alert('��ʸ�μ��դ���λ���Ƥ��ޤ���');
				return;
			}
			
			var staff = $('#order_staff').val();
			if(staff==0){
				alert('ȯ��ô������ꤷ�Ƥ���������');
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
			
			/* ��­ʬ��ȯ����ߤˤʤäƤ�����ʸʬ������Ѥˤ��� */
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
				isEDI = 0;	// ɽ����ȯ��Ѥˤ���
			}
			
			var tr = $(my).closest('tr');
			var destination = tr.find('.destination').val();			// ������
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
 						$(my).closest('td').html('<label class="fin">ȯ��Ѥ�</lable>');
 						$.screenOverlay(false);
 					}else{
 						if(isEDI==1 || isEDI==3){
 							// �ȥॹ
	 						var deliver = tr.find('.deliver').val();					// �����ȼ�
							var saturday = tr.find('.saturday').is(':checked')? 1: 0;	// ������ã����
							var holiday = tr.find('.holiday').is(':checked')? 1: 0;		// ���˽�����ã����
							//var pack = tr.find('.pack').is(':checked')? 1: 0;			// PP�ޤ�̵ͭ
	 						$.ajax({ url: './php_libs/edi_ordering.php', type: 'POST', dataType:'text',
								data: {'maker':'toms', 'orders_id':orders_id, 'deliver':deliver, 'destination':destination, 'saturday':saturday, 'holiday':holiday}, async: true,
				 				success: function(r1){
	 								if(r1==1){
	 									$(my).closest('td').html('<label class="wait">�ȥॹ�����Ԥ�</label><p><label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+orders_id+','+isEDI+');"> �����Ѥˤ���</label></p>');
	 									if(isEDI==1) $.screenOverlay(false);
	 								}else{
	 									field = ['orders_id', 'ordering', 'toms_order', 'toms_response'];
	 									data = [orders_id, 0, 0, 0];
	 									$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST', dataType:'text',
											data: {'act':'update','mode':'progressstatus','field1[]':field,'data1[]':data}, async: true,
											success: function(){
			 									$(my).closest('td').html('<label class="suspend">�ȥॹȯ���顼</lable><p><label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+orders_id+','+isEDI+');"> �����Ѥˤ���</label></p>');
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
	 						// �����
	 						var cab_note = tr.find('.cab_note').val();					// ��������
	 						$.ajax({ url: './php_libs/edi_ordering.php', type: 'POST', dataType:'text',
								data: {'maker':'cab', 'orders_id':orders_id, 'destination':destination, 'cab_note':cab_note}, async: true,
				 				success: function(r1){
	 								if(r1==1){
	 									$(my).closest('td').html('<label class="wait">����ֲ����Ԥ�</label><p><label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+orders_id+','+isEDI+');"> �����Ѥˤ���</label></p>');
	 									$.screenOverlay(false);
	 								}else{
	 									field = ['orders_id', 'ordering', 'cab_order', 'cab_response'];
	 									data = [orders_id, 0, 0, 0];
	 									$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST', dataType:'text',
											data: {'act':'update','mode':'progressstatus','field1[]':field,'data1[]':data}, async: true,
											success: function(){
			 									$(my).closest('td').html('<label class="suspend">�����ȯ���顼</lable><p><label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+orders_id+','+isEDI+');"> �����Ѥˤ���</label></p>');
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
		/* �������ϲ��̤ΤؤΥ��󥫡��˥���������֤��ɲ� */
			var self = $(my);
			var href = self.attr('href')+'&scroll='+$('#result_searchtop').scrollTop();
			self.attr('href', href);
		},
		export: function(factory, date) {
			$.ajax({url:'./php_libs/ordersinfo.php', type:'POST', dataType:'text', async:false,
				data:{'act':'export', 'mode':'', 'csv':'orderinglist', 'factory':factory},
				success: function(r){
					if (r.length < 2) {
						alert('����' + factory + ' �˳�������ǡ����Ϥ���ޤ���Ǥ���');
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
			var params = '&filename=ordering&state_0=0';	// ������̤����ܤ���ݤ��Ϥ������ꥹ�ȥ��
			var i = 0;
			var field = [];
			var data = [];
			var elem = document.forms.searchtop_form.elements;
			for (var j=0; j<elem.length; j++) {
				if((elem[j].type == "text" || elem[j].type=="select-one") && elem[j].value.trim()!=''){
					field[i] = elem[j].name;
					data[i] = elem[j].value;
					// �����ꥹ�ȥ��
					params += '&'+field[i]+'='+data[i];
					i++;
				}
			}
			$('#result_count').text('0');
			$('#result_searchtop').html('<p class="alert">������ ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
				data:{'act':'search','mode':'ordering', 'field1[]':field, 'data1[]':data}, success: function(r){
					if(r instanceof Array){
						if(r[0]=="Error"){
							var err = "�ʲ��μ���No.�ǹ����ǥ��顼�Ǥ�\n";
							for(var i in r){
								err += r[i]+"\n";
							}
							alert('Error: p172\n'+err);
							$('#result_searchtop').html("");
							return;
						}
						if(r.length==0){
							$('#result_searchtop').html('<p class="alert">����������ʸ�ǡ��������Ĥ���ޤ���Ǥ���</p>');
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
				var isEDI = 0;			// EDIȯ���̵ͭ��0:�ʤ���1:���ƥȥॹ��2:���ƥ���֡�3:�ȥॹ�ȥ����
				var isNotEDI = false;	// EDI���б����Ƥ��ʤ����ʤ�̵ͭ
				var state_0 = 0;		// ȯ���̵ͭ
				var factory = {0:'-',1:'[1]', 2:'[2]', 9:'[1,2]'};
				var result_len = info.length;
				var body = '';
				var head = '<table class="result_list"><thead><tr><th>����No.</th><th>����</th><th>��ʸ����</th><th>�ܵ�̾</th><th>��̾</th><th>����</th></tr></thead>';
				var list = "<tbody>";
				var makeBody = function(rec){
					var body = '<tr class="rowseparate">';
					body += '<td class="centering">No.<a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+rec['ordersid']+params+'">'+rec['ordersid'];
					body += ' <img alt="������̤�" src="./img/link.png" width="10" /></a></td>';
					body += '<td class="centering">'+factory[rec['factory']]+'</td>';
					body += '<td class="centering">'+rec['schedule2']+'</td>';
					body += '<td>'+rec['customername']+' ��</td>';
					body += '<td>'+rec['maintitle']+'</td>';
					body += '<td class="centering">'+rec['staffname']+'</td>';
					//body += '<td></td>';
					body += '</tr>';
					body += '<tr><td colspan="6">';
					
					// ��ʸ�ꥹ�ȡ�inner_table��
					body += '<table class="inner_table">';
					body += '<tbody>';
					body += '<tr class="heading">';
					body += '<td>�᡼����</td><td>���ƥ���</td><td>����̾</td><td>������</td><td>���顼</td><td>���</td><td></td>';
					body += list;
					body += '<tr class="subtotal">';
					if(isEDI==0){
						body += '<td colspan="5"></td>';
					}else{
						body += '<td>';
						body += '<select class="destination"><option value="1" selected="selected">��칩��</option><option value="2">���󹩾�</option></select>';
						body += '</td>';
						body += '<td colspan="4">';
						if(isEDI==1 || isEDI==3){
							body += '<p>';
							body += '<label>�ȥॹ�������</label>';
							body += '<select class="deliver"><option value="1">�������</option><option value="2">ʡ���̱�</option><option value="3" selected="selected">��ޥȱ�͢</option></select>';
							body += '<label><input type="checkbox" value="1" class="saturday"> ��������</label>';
							body += '<label><input type="checkbox" value="1" class="holiday"> ���˽�������</label>';
							//body += '<label><input type="checkbox" value="1" class="pack"> PP�ޤ���</label>';
							body += '</p>';
						}
						if(isEDI==2 || isEDI==3){
							body += '<p>';
							body += '<label>�������������</label>';
							body += '<input type="text" class="cab_note" value="">';
							body += '</p>';
						}
						body += '</td>';
					}
					body += '<td>'+rec['order_amount']+' ��</td>';
					body += '<td>';
					if(rec['ordering']==0){
						body += '<input type="button" value="ȯ������å�" class="ordering" onclick="$.checkstatus(this,'+rec['ordersid']+','+isEDI+');">';
						switch(isEDI){
							case 0:	body += '<label>EDI�ʤ�</lable>';
									break;
							case 1:	body += '<label>�ȥॹEDIȯ��';
									break;
							case 2:	body += '<label>�����EDIȯ��';
									break;
							case 3:	body += '<label>�ȥॹ�������EDIȯ��';
									break;
						}
						if(isNotEDI){
							body += '������EDI���б��ξ��ʤ���';
						}
						body += '</lable>';
					}else{
						if(rec['toms_order']==0 && rec['cab_order']==0){
							body += '<label class="fin">ȯ��Ѥ�</lable>';
						}else{
							if(rec['toms_order']==1){
								if(rec['toms_response']==0){
									body += '<p><label class="wait">�ȥॹ�����Ԥ�</label>';
									body += '<label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+rec['ordersid']+', 1);"> �����Ѥˤ���</label></p>';
								}else if(rec['toms_response']==2){
									body += '<p><label class="suspend">�ȥॹ��­ʬ���ꡪȯ�����</lable>';
									body += '<label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+rec['ordersid']+', 1);"> �����Ѥˤ���</label></p>';
								}else if(rec['toms_response']==1 && rec['cab_response']!=1){
									body += '<p><label class="fin">�ȥॹȯ��Ѥ�</lable></p>';
								}
							}
							if(rec['cab_order']==1){
								if(rec['toms_order']==1 && !(rec['toms_response']==1 && rec['cab_response']==1)){
									body += '<hr>';
								}
								if(rec['cab_response']==0){
									body += '<p><label class="wait">����ֲ����Ԥ�</label>';
									body += '<label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+rec['ordersid']+', 2);"> �����Ѥˤ���</label></p>';
								}else if(rec['cab_response']==2){
									body += '<p><label class="suspend">�������­ʬ���ꡪȯ�����</lable>';
									body += '<label><input type="checkbox" value="done" onchange="$.checkstatus(this,'+rec['ordersid']+', 2);"> �����Ѥˤ���</label></p>';
								}else if(rec['cab_response']==1){
									body += '<p><label class="fin">�����ȯ��Ѥ�</lable></p>';
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
					
					// ��ʸ�ꥹ�ȡ�inner_table�ˤΥܥǥ�
					var itemname = info[i]['itemname'];
					if(info[i]['item_code']!=''){
						itemname = '['+info[i]['item_code']+'] '+itemname;
					}
					
					if(info[i]['makername']=='�ȥॹ'){
						if(isEDI==0){
							isEDI = 1;
						}else if(isEDI==2){
							isEDI = 3;
						}
						list += '<tr>';
					}else if(info[i]['makername']=='�����'){
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
					list += '<td class="toright">'+info[i]['amount']+' ��</td>';
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

	/* �������� */
	$('#search').click( function(){
		$.search();
	});

	/* �ꥻ�å� */
	$('#reset').click( function(){
		document.forms.searchtop_form.reset();
		$('#result_count').text('0');
		$('#result_searchtop').html('');
	});

	/* CSV ��������� */
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
