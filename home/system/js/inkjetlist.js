/*
*	�����ϥޥ饤�ե�����
*	���󥯥����å�
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
				alert('��ʸ�μ��դ���λ���Ƥ��ޤ���');
				return;
			}
			var myname = $(my).attr('name');
			var args = $(my).val();
			var field = ['orders_id',myname];
			if(myname=='fin_6' && !$(my).is(':checked')){
				args = 0;
			}
			var data = [orders_id,args];
			// ô���Ԥλ�����֤ǽ�λ�����å���ͭ����̵�������ؤ�
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
							alert("�����ǧ�᡼��������ǥ��顼��ȯ�����Ƥ��ޤ���\n�᡼������򤴳�ǧ����������");
						}
					}
				}
			});
		},
		setQuery: function(my){
		/* �������ϲ��̤ΤؤΥ��󥫡��˥���������֤��ɲ� */
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
			var params = '&filename=inkjetlist';	// ������̤ؤ����ܤκݤ��Ϥ������ꥹ�ȥ��
			var info = [];		// ������̤Υ쥳���ɤ���������
			var list = '';		// ������̤ΰ���
			var curid = 0;		// ����ID
			var order_count = 0;// �����
			var c = 0;			// �롼�ץ����󥿡�
			var j = 0;
			var jobstate = ['̤','��λ'];	// �ƺ�Ȥν�λ����
			var pattern = '';	// �ִ��ѥ�����
			var re = '';		// ����ɽ�����֥�������
			var opt = '';		// �����åդΥ��쥯����
			var factory = {0:'-',1:'[1]', 2:'[2]', 9:'[1,2]'};
			var staff = $('#state_6').html();	// ô��
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
				data:{'act':'search','mode':'inkjetlist', 'field1[]':field, 'data1[]':data}, success: function(r){
					if(r instanceof Array){
						if(r.length==0){
							$('#result_searchtop').html('<p class="alert">����������ʸ�ǡ��������Ĥ���ޤ���Ǥ���</p>');
						}else{
							info = r;
							
							$('#main_wrapper fieldset').hide();
							$('#result_wrapper').show();
							
							var curdate = info[0]['schedule3'];
							var bosyColor = ['ø��', 'ǻ��'];
							
							list += '<table class="result_list"><thead>';
							list += '<tr><th>������</th><th>�ܵ�̾</th><th rowspan="2">�á���</th><th rowspan="2">����ͽ����</th><th rowspan="2">�ǲ�ͽ����</th><th rowspan="2">�ǲ�</th>';
							list += '<th rowspan="2">�޵�</th><th rowspan="2">���顼</th><th rowspan="2">���ʼ���</th><th rowspan="2">���</th><th rowspan="2">�Ľ��</th>';
							list += '</tr>';
							list += '<tr><th>Ǽ����</th><th>�ꡡ̾</th></tr></thead>';
							
							list += '<tbody>';
							for(c=0; c<info.length; c++){
								if(curid!=info[c]['id']){
									if(curid!=0){
										j = c-1;
										list += '<tr><td colspan="1"></td><td colspan="7">���͡�';
										list += '<input type="text" class="remarks" name="note_inkjet" onchange="$.checkstatus(this,'+info[j]['id']+')" value="'+info[j]['note_inkjet']+'" />';
										pattern = 'value="'+info[j]['state_6']+'"';
										re = new RegExp(pattern, "i");
										opt = staff;
										opt = opt.replace(re, pattern+' selected="selected"');
										list += '��ô����<select name="state_6" onchange="$.checkstatus(this,'+info[j]['id']+')">'+opt+'</select>';
										list += '�����ͽ������<input type="text" value="'+info[j]['dateofinkjet']+'" name="dateofinkjet_'+info[j]['id']+'" size="10" class="forDate datepicker" />';
										list += '</td>';
										list += '<td colspan="3"><label><input type="checkbox" name="fin_6" value="1" onchange="$.checkstatus(this,'+info[j]['id']+')"';
										if(info[j]['fin_6']==1){
											list += ' checked="checked"';
										}else if(info[j]['state_6']==0){
											list += ' disabled="disabled"';
										}
										list += ' /> ��λ</label>';
										list += '</td></tr>';
									}
									
									order_count++;
									curid = info[c]['id'];
									
									// Ǽ���ζ��ڤ���
									list += '<tr class="toprow';
									if(curdate!=info[c]['schedule3']){
										list += ' dateline';
									}
									list += '"><td>����No.<a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+info[c]['id']+params+'">'+info[c]['id']+' <img alt="������̤�" src="./img/link.png" width="10" /></a></td>';
									list += '<td colspan="10">[ ���� ] ';
									if(info[c]['mixedprint']==''){
										list += '-';
									}else{
										info[c]['mixedprint'];
									}
									list += '������: '+factory[info[c]['factory']];
									list += '</td></tr>';
									list += '<tr class="bb0">';
									list += '<td>��ʸ��'+info[c]['schedule2']+'<p>Ǽ����'+info[c]['schedule3']+'</p></td>';
									list += '<td>'+info[c]['customername']+'<p style="width:230px;overflow:hidden;">'+info[c]['maintitle']+'</p></td>';
									// �õ�����
									var notices = [];
									if(info[c]['allrepeat']==1 || (info[c]['repeater']>0 && info[c]['ordertype']=='industry')) notices.push('���');
									if(info[c]['completionimage']==1) notices.push('�����');
									if(info[c]['express']!=0) notices.push('�õ�');
									if(info[c]['bundle']==1) notices.push('Ʊ��');
									list += '<td>'+notices.toString()+'</td>';
									list += '<td class="ac">����<br /><p>'+info[c]['arrival']+'</p></td>';
									list += '<td class="ac">�ǲ�ͽ����<br /><p>'+info[c]['dateofartwork']+'</p></td>';
									list += '<td class="ac">�ǲ�<br /><p>'+jobstate[info[c]['fin_1']]+'</p></td>';
									list += '<td class="ac">�޵�<br /><p>'+$.strPackmode(info[c])+'</p></td>';
									list += '<td class="ac">';
									list += bosyColor[info[c]['print_option']];
									list += '</td>';
									
									list += '<td>'+info[c]['item']+'</td>';
									list += '<td class="ac">'+info[c]['volume']+' ��</td>';
									list += '<td class="ac">'+info[c]['area']+' �Ľ�<td>';
									list += '</tr>';
								}else{
									list += '<tr class="bb0"><td colspan="8"></td>';
									
									list += '<td>'+info[c]['item']+'</td>';
									list += '<td class="ac">'+info[c]['volume']+' ��</td>';
									list += '<td class="ac">'+info[c]['area']+' �Ľ�<td>';
									list += '</tr>';
								}
								
								curdate = info[c]['schedule3'];
							}
							
							j = c-1;
							list += '<tr><td colspan="1"></td><td colspan="7">���͡�';
							list += '<input type="text" class="remarks" name="note_inkjet" onchange="$.checkstatus(this,'+info[j]['id']+')" value="'+info[j]['note_inkjet']+'" />';
							pattern = 'value="'+info[j]['state_6']+'"';
							re = new RegExp(pattern, "i");
							opt = staff;
							opt = opt.replace(re, pattern+' selected="selected"');
							list += '��ô����<select name="state_6" onchange="$.checkstatus(this,'+info[j]['id']+')">'+opt+'</select>';
							list += '�����ͽ������<input type="text" value="'+info[j]['dateofinkjet']+'" name="dateofinkjet_'+info[j]['id']+'" size="10" class="forDate datepicker" />';
							list += '</td>';
							list += '<td colspan="3"><label><input type="checkbox" name="fin_6" value="1" onchange="$.checkstatus(this,'+info[j]['id']+')"';
							if(info[j]['fin_6']==1){
								list += ' checked="checked"';
							}else if(info[j]['state_6']==0){
								list += ' disabled="disabled"';
							}
							list += ' /> ��λ</label>';
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
		// ǯ�ٽ���
			var FY = $('#FY').val();
			var state = 'state_6';
			var printtype = 'inkjet';
			
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
							
							// ���������оݤη�ѡ���
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
	
	// �ꥹ�Ȱ���
	$('#printout').click( function(){
		var url = './documents/inkjetworklist.php?mode=print&'+$.prop.params;
		window.open(url, 'printform');
		$('#printform').load(function(){window.frames['printform'].print();});
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
