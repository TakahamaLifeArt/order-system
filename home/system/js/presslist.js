/*
*	�����ϥޥ饤�ե�����
*	�ץ쥹
*	charset euc-jp
*/

$(function(){
	jQuery.extend({
		prop: {	
			'holidayInfo':{},
			'params':''
		},
		checkstatus: function(my, orders_id, printtype){
			if(orders_id==""){
				alert('��ʸ�μ��դ���λ���Ƥ��ޤ���');
				return;
			}
			var myname = $(my).attr('name');
			var args = $(my).val();
			var field = ['orders_id',myname,'printtype_key'];
			if(myname=='fin_4' && !$(my).is(':checked')){
				args = 0;
			}else if(myname=='adjtime_press'){
				$.check_Real(my);
				args = $(my).val()-0;
			}
			var data = [orders_id, args, printtype];
			// ô���Ԥλ�����֤ǽ�λ�����å���ͭ����̵�������ؤ�
			if(myname=='state_4'){
				var fin = $(my).closest('tr').children('td:last').find(':checkbox');
				if(args!="0"){
					fin.removeAttr('disabled');
				}else{
					fin.removeAttr('checked');
					fin.attr('disabled','disabled');
					field.push('fin_4');
					data.push(0);
				}
			}else if(myname=='fin_4'){
				var proc = $(my).closest('td').prev('td').prev('td').find('select').val();
				field.push('state_4');
				data.push(proc);
				
				// ��λ�����å��ξ�硢���ͽ�����˥����å������������
				if (args) {
					var dt = new Date(),
						dateOfPress = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2);
					field.push('dateofpress');
					data.push(dateOfPress);
				}
			}
			$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)){
						alert('Error: p48\n'+r);
						return;
					}else{
						if(r==3 || r==9){
							alert("�����ǧ�᡼��������ǥ��顼��ȯ�����Ƥ��ޤ���\n�᡼������򤴳�ǧ����������");
						}
					}
					if(myname=='adjtime_press'){
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
		/* �������ϲ��̤ΤؤΥ��󥫡��˥�����������֤��ɲ� */
			var self = $(my);
			var href = self.attr('href')+'&scroll='+$('#result_searchtop').scrollTop();
			self.attr('href', href);
		},
		strPackmode: function(args){
		/* �޵ͤξ��֤򼨤�ʸ������֤� */
			var res = [];
			if(args['package_no']==1){
				res = '-';
			}else{
				if(args['package_yes']==1) res.push('��');
				if(args['package_nopack']==1) res.push('�ޤΤ�');
				res = res.join(',');
			}
			return res;
		},
		search: function(){
			$('.pagenavi p', '#result_wrapper').show();
			$('.pagenavi .pagetitle', '#result_wrapper').hide();
			$('#result_count').text(0);
			$('#result_searchtop').html('');
			
			var params = '&filename=presslist';	// �������̤ؤ����ܤκݤ��Ϥ������ꥹ�ȥ��
			var info = [];		// ������̤Υ쥳���ɤ���������
			var list = '';		// ������̤ΰ���
			// var curid = 0;		// ����ID
			// var curprint = '';	// �ץ�����ˡ
			var order_count = 0;// ������
			var worktime = 0;	// �Ż��̤ι��
			var c = 0;			// �롼�ץ����󥿡�
			var j = 0;
			// var jobstate = ['̤','��λ'];	// �ƺ�Ȥν�λ����
			var pattern = '';	// �ִ��ѥ�����
			var re = '';		// ����ɽ�����֥�������
			var opt = '';		// �����åդΥ��쥯����
			var factory = {0:'-',1:'[1]', 2:'[2]', 9:'[1,2]'};
			var staff = $('#state_4').html();	// ô��
			staff = staff.replace('selected="selected"', '');
			
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
			$.prop.params = params;
			
			$('#result_searchtop').html('<p class="alert">������ ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
			
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
				data:{'act':'search','mode':'presslist', 'field1[]':field, 'data1[]':data}, success: function(r){
					if(r instanceof Array){
						if(r.length==0){
							$('#result_searchtop').html('<p class="alert">����������ʸ�ǡ��������Ĥ���ޤ���Ǥ���</p>');
						}else{
							info = r;
							
							order_count = info.length;
							if(order_count==0){
								return;
							}
							
							$('#main_wrapper fieldset').hide();
							$('#result_wrapper').show();
							
							var curdate = info[0]['schedule3'];
							var cols = 17;
							
							list += '<table class="result_list min"><thead>';
							list += '<tr><th>����No.</th><th>����</th><th>����</th><th>Ǽ��</th><th>���ͽ��</th><th>�ܵ�̾</th><th>�ꡡ̾</th><th>�õ�</th><th>����</th>';
							list += '<th>���ʼ���</th><th>���</th><th>����ͽ��</th><th>ž�̻�ͽ��</th><th>�ս�</th>';
							list += '<th>��������</th><th>�޵�</th><th>�ץ쥹</th><th>Ĵ��</th><th>�Ż���</th><th>��λ</th>';
							list += '</tr></thead>';
							
							list += '<tbody>';
							for(c=0; c<order_count; c++){
								var wt = (info[c]['wt']+(info[c]['adjtime']-0));
								worktime += wt;
								var itemnames = info[c]['item'].replace(/, /g, '<br>');
								
								// Ǽ���ζ��ڤ���
								list += '<tr';
								if(curdate!=info[c]['schedule3']){
									list += ' class="dateline"';
								}
								list += '>';
								list += '<td class="ac"><a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+info[c]['id']+params+'">'+info[c]['id']+' <img alt="�������̤�" src="./img/link.png" width="10" /></a></td>';
								list += '<td>'+info[c]['mixedprint']+'</td>';
								list += '<td class="ac">'+factory[info[c]['factory']]+'</td>';
								list += '<td>'+info[c]['schedule3'].slice(2)+'</td>';
								list += '<td><input type="text" value="'+info[c]['dateoftrans']+'" name="dateoftrans_'+info[c]['id']+'" size="10" class="forDate datepicker" /></td>';
								list += '<td>'+info[c]['customername']+'</td>';
								list += '<td><p style="max-width:180px;overflow:hidden;">'+info[c]['maintitle']+'</p></td>';
								// �õ�����
								var notices = [];
								if(info[c]['allrepeat']==1 || (info[c]['repeater']>0 && info[c]['ordertype']=='industry')) notices.push('���');
								if(info[c]['completionimage']==1) notices.push('�����');
								if(info[c]['express']!=0) notices.push('�õ�');
								if(info[c]['bundle']==1) notices.push('Ʊ��');
								list += '<td>'+notices.toString()+'</td>';
								list += '<td>'+info[c]['printname']+'</td>';
								list += '<td><p>'+itemnames+'</p></td>';
								list += '<td class="ac">'+info[c]['volume']+'</td>';
								list += '<td class="ac"><p>'+info[c]['arrival'].slice(2)+'</p></td>';
								if(info[c]['printtype_key']=='digit'){
									if(info[c]['fin_3']==1){
										list += '<td class="ac">��</td>';
									}else{
										list += '<td class="ac">'+info[c]['dateoftrans'].slice(2)+'</td>';
									}
								}else{
									list += '<td class="ac">-</td>';
								}
								list += '<td class="ac">'+info[c]['area']+'</td>';
								list += '<td class="ar">'+info[c]['shot']+'</td>';
								list += '<td class="ac">'+$.strPackmode(info[c])+'</td>';
								
								// �ץ쥹ô��
								pattern = 'value="'+info[c]['state_4']+'"';
								re = new RegExp(pattern, "i");
								opt = staff;
								opt = opt.replace(re, pattern+' selected="selected"');
								list += '<td><select name="state_4" onchange="$.checkstatus(this,'+info[c]['id']+',\''+info[c]['printtype_key']+'\')">'+opt+'</select></td>';
								
								list += '<td><input type="text" value="'+info[c]['adjtime']+'" name="adjtime_press" onchange="$.checkstatus(this,'+info[c]['id']+',\''+info[c]['printtype_key']+'\')" size="2" class="forReal" /></td>';
								list += '<td class="wt_'+info[c]['wt']+' ar">'+$.addFigure(wt)+'</td>';
								list += '<td><input type="checkbox" name="fin_4" value="1" onchange="$.checkstatus(this,'+info[c]['id']+',\''+info[c]['printtype_key']+'\')"';
								if(info[c]['fin_4']==1){
									list += ' checked="checked" />';
								}else if(info[c]['state_4']==0){
									list += ' disabled="disabled" />';
								}
								list += '</td>';
								list += '</tr>'
								
								curdate = info[c]['schedule3'];
							}
							
							list += '<tr><td colspan="'+cols+'"></td><td class="ac">���</td><td id="total_wt" class="ar">'+$.addFigure(worktime)+'</td><td></td></tr>';
							list += '</tbody></table>';
							
							$('#result_count').text(order_count);
							$('#result_searchtop').html(list);
							$('#result_searchtop .datepicker').datepicker({
								onClose: function(dateText, inst){
									var tmp = this.name.split('_');
									var field = ['orders_id',tmp[0],'workday','printtype_key'];
									var data = [tmp[1],this.value,tmp[0],tmp[2]];
									$.ajax({ url: './php_libs/ordersinfo.php', type: 'POST',
										data: {'act':'update','mode':'printstatus','field1[]':field,'data1[]':data}, async: true,
										success: function(r){ if(!r.match(/^\d+?$/)) alert('Error: p171\n'+r); }
									});
								}
							});
						}
					}else{
						alert('Error: p305\n'+r);
					}
				}
			});
		},
		addup: function(){
		// ǯ�ٽ���
			var FY = $('#FY').val();
			var state = 'state_4';
			var printtype = 'press';
			
			$('.pagenavi p', '#result_wrapper').hide();
			$('.pagenavi .pagetitle', '#result_wrapper').text('���ʿ� ��'+FY+'ǯ�ٽ��ס�').show();
			$('#result_count').text('0');
			$('#result_searchtop').html('');
			var info = [];		// ������̤Υ쥳���ɤ���������
			
			$('#result_searchtop').html('<p class="alert">������ ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
			
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
				data:{'act':'search','mode':'addup', 'field1[]':['FY','state','printtype'], 'data1[]':[FY,state,printtype]}, success: function(r){
					if(typeof r=='object'){
						if((r instanceof Array && r.length==0) || r==null){
								$('#result_searchtop').html('<p class="alert">����������ʸ�ǡ��������Ĥ���ޤ���Ǥ���</p>');
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
							
							// �����ѡ���
							head1 = '<table><thead><tr><th>'+FY+'ǯ��</th></tr></thead>';
							list1 = "<tbody>";
							for(var staff in info){
								if(staff=='total') continue;
								list1 += '<tr><td>'+staff+'</td>';
								list1 += '</tr>';
							}
							list1 += '</tbody></table>';
							foot1 = '<tfoot><tr><td class="foot_separate" style="text-align:center;border-right:1px solid #d8d8d8;">�硡��</td></tr></tfoot>';
							html1 = '<div class="leftcol">' + head1 + foot1 + list1 + '</div>';
							
							// �����������оݤη�ѡ���
							head = '<table id="resulttable"><thead><tr>';
							for(var i=4; i<13; i++){
								head += '<th style="width:70px;">'+i+'��</th>';
							}
							for(var i=1; i<4; i++){
								head += '<th style="width:70px;">'+i+'��</th>';
							}
							head += '<th style="width:90px;">�̴����</th></tr></thead>';
							
							// �����åդ��ȤΥǡ���
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
							
							// ��׹�
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
							
							// �ơ��֥�����
							html += html1 + '<div class="scrollable">' + head + foot + list + '</div>';
							$('#result_searchtop').html('<div class="inner">'+html+'</div>');
							
							// �ֹԤ��ط�����
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
	
	// ǯ�ٽ���
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
		f.print_type.value = '';
		f.fin_4.value = '1';
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
		var url = './documents/pressworklist.php?mode=print&'+$.prop.params;
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
			if(weeks == 0) texts = "����";
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
	*	ȯ�������ѹ���ô���ԥ��쥯������񤭴�����
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