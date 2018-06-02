/*
*	�����ϥޥ饤�ե�����
*	�������
*	charset euc-jp
*/
	
$(function(){

	jQuery.extend({
		prop: {'modified':false,
				'ordertype':'general',
				'holidayInfo':{},
				'staff':[],
				'searchdata':[]
		},
		checkstatus: function(my, proc_num, orders_id){
			if(orders_id==""){
				alert('��ʸ�μ��դ���λ���Ƥ��ޤ���');
				return;
			}
			var myname = $(my).attr('name');
			var args = "";						// ������
			var tablename = 'progressstatus';	// �����ơ��֥�̾
			var print_type = "";				// �ץ�����ˡ��printstatus�������Τߡ�
			var isSendMail = false				// ȯ�����ޤ����᡼���������̵ͭ
			var fin = -1;						// ��λ�����å����ǲ������ǡ�ž�̻桢�ץ쥹�����륯��IJ��
			
			//$.screenOverlay(true);
			
			if(myname=="state"){			// �ץ�����ˡ���Ȥκ�ȿ�Ľ
				myname = 'state_'+proc_num;
				args = $(my).val();
				print_type = arguments[3];
				tablename = 'printstatus';
				if(proc_num!=0 && proc_num!=7){
					if(args!=0){
						fin = 1;
					}else{
						fin = 0;
					}
				}
			}else if(myname=="note"){
				args = $(my).val();
			}else if(myname=="deposit"){		// ��������å�
				if($(my).attr('checked')){
					args = 2;	// ������
					// $('.shipped_'+orders_id).removeAttr('disabled');
				}else{
					args = 1;	// ̤����
					// $('.shipped_'+orders_id).attr('disabled','disabled');
				}
			}else if(myname=="plates_state"){	// ���ǥ����å� - �ѻ�
				if($(my).attr('checked')) args = 1;
				else args = 0;
			}else if(myname=="readytoship"){	// ȯ������
				if($(my).attr('checked')){
					args = 1;	// ȯ����
					//$(my).next('ins').text('ȯ����');
				}else{
					args = 0;	// ȯ���Բ�
					//$(my).next('ins').text('-');
				}
			}else if(myname=='factory'){		// �������
				myname = 'factory_'+proc_num;
				args = $(my).val();
				print_type = arguments[3];
				tablename = 'printstatus';
			}else{								// ȯ���Ѥߥ����å��ȥ᡼������
				if($(my).attr('checked')){
					args = 2;	// ������
					
					// ȯ�����ޤ����᡼����������ǧ��proc_num:1 �ϥ᡼����ߥ����å������
					if(proc_num==0){
						if(!confirm("��ȯ�����ޤ����᡼��פ��������ޤ���\n������Ǥ�����")){
							//$.screenOverlay(false);
						}else{
							isSendMail = true;
						}
					}else if(proc_num==2){
						$(my).attr('checked', false);
						$.msgbox('����礻�ֹ�����Ϥ��Ƥ���������');
						return;
					}
				}else{
					args = 1;	// ̤����
				}
			}
			var field = ['orders_id',myname];
			var data = [orders_id,args];
	
			if(tablename=='printstatus'){
				if(proc_num!=0){ // ȯ��ʳ��ϥץ�����ˡ�����
					field = ['orders_id',myname,'printtype_key'];
					data = [orders_id,args,print_type];
				}
				if(fin!=-1){	// �ǲ������ǡ�ž�̻桢�ץ쥹�����륯��IJ �ν�λ�����å�
					field.push('fin_'+proc_num);
					data.push(fin);
				}
				
				// ȯ���Progressstatus�⹹���ʰܹԤΰ١�
				if(proc_num==0){
					$.ajax({url: './php_libs/ordersinfo.php', type: 'POST',
						data: {'act':'update','mode':'progressstatus','field1[]':['orders_id','ordering'],'data1[]':[orders_id,args]}, async: false,
						success: function(r){
							if(!r.match(/^\d+?$/)){
								alert('Error: p101\n'+r);
								return;
							}
						}
					});
				}
			}
			$.ajax({url: './php_libs/ordersinfo.php', type: 'POST',
				data: {'act':'update','mode':tablename,'field1[]':field,'data1[]':data}, async: false,
				success: function(r){
					if(!r.match(/^\d+?$/)){
						alert('Error: p77\n'+r);
						//$.screenOverlay(false);
						return;
					}
					
					if(tablename=='printstatus' && (r==3 || r==9)){
						alert("�����ǧ�᡼��������ǥ��顼��ȯ�����Ƥ��ޤ���\n�᡼������򤴳�ǧ����������");
					}
					
					if(isSendMail){
						$.ajax({url: './documents/shipmentmail.php', type: 'POST',
							data: {'orders_id':orders_id}, async: false,
							success: function(r){
								alert(r);
							}
						});
					}
					
					if(myname=="readytoship"){	// ȯ������
						if(args){
							$(my).next('ins').text('ȯ����');
						}else{
							$(my).next('ins').text('-');
						}
					}
					
					//$.screenOverlay(false);
				}
			});
			
		},
		screenOverlay: function(mode){
			var body_w = $(document).width();
			var body_h = $(document).height();
			if(mode){
				$('#overlay').css({'width': '100%',
									'height': body_h+'px',
									'opacity': 0.5}).show('fast');
				if(arguments.length>1){
					$('#loadingbar').css({'top': body_h/2+'px', 'left': body_w/2-150+'px'}).show();
				}
			}else{
				if($('#loadingbar:visible').length>0) $('#loadingbar').hide();
				$('#overlay').css({'width': '0px',	'height': '0px'}).hide("1000");
			}
		},
		setQuery: function(my){
		/* �������ϲ��̤ΤؤΥ��󥫡��˥���������֤��ɲ� */
			var self = $(my);
			var href = self.attr('href')+'&scroll='+self.closest('div').scrollTop();
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
		main: function(func){
			var btn = function(my){
				var i,j,n = 0;
				var info = [];		// ������̤Υ쥳���ɤ���������
				var pattern = '';	// �ִ��ѥ�����
				var re = '';		// ����ɽ�����֥�������
				var opt = '';		// �����åդΥ��쥯����
				var factory = {0:'-', 1:'�裱����', 2:'�裲����', 9:'����'}
				var params = '&filename=orderlist';	// ������̤ؤ����ܤκݤ��Ϥ������ꥹ�ȥ��
				var field = [];
				var data = [];
				var elem = document.forms.searchtop_form.elements;
				for (j=0; j < elem.length; j++) {
					if((elem[j].type=="text" || elem[j].type=="select-one") && elem[j].value.trim()!=''){
						field.push(elem[j].name);
						if(elem[j].name=='term_from' || elem[j].name=='term_to'){
							data.push(elem[j].value.replace(/\//g,"-"));
						}else{
							data.push(elem[j].value);
						}
						
						// �����ꥹ�ȥ��
						if(elem[j].value!='') {
							params += '&'+elem[j].name+'='+elem[j].value;
						}
					}
				}
				
				if(data.length==0){
					alert('�������ܤ���ꤷ�Ƥ�������');
					return;
				}
				
				$('#result_searchtop').html('<p class="alert">������ ... <img src="./img/pbar-ani.gif" style="width:150px; height:22px;"></p>');
				
				$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:true,
					data:{'act':'search','mode':'orderlist', 'field1[]':field, 'data1[]':data}, success: function(r){
						if(r instanceof Array){
							if(r.length==0){
								$('#result_searchtop').html('<p class="alert">����������ʸ�ǡ��������Ĥ���ޤ���Ǥ���</p>');
							}else{
								info = r;
								
								/* ������̤���ǰ��ָŤ���ʸ�������ǥ����åեǡ������������
								$.ajax({url:'./php_libs/set_tablelist.php', type:'POST', dataType:'text', data:{'act':'staff', 'rowid':'all', 'curdate':info[0]['oldestdate']}, async:false,
									success: function(r){
										$.prop.staff = r.split('|');
									}
								});
								*/
								
								var result_len = info.length;
								$('#result_count').text(result_len);
								var list = '<table class="result_list"><thead><tr><th>����No.</th><th>ȯ��������</th><th>�ܵ�̾</th><th>������</th>';
								list += '<th rowspan="2">�á���</th><th rowspan="2">ȯ��ô��</th><th rowspan="2">�ǲ�</th><th rowspan="2">����</th><th rowspan="2">ž�̻�</th><th rowspan="2">����</th><th rowspan="2">�ץ���</th>';
								list += '<th rowspan="2">����</th>';
								if(_my_level=="financial" || _my_level=="administrator"){
									list += '<th rowspan="2">����</th>';
								}
								list += '<th rowspan="2">ȯ������</th><th rowspan="2">ȯ����<br />�����å�</th>';
								// list += '<th rowspan="2">&nbsp;</th>';
								list += '<th rowspan="2" style="display:none;"></th></tr>';
								list += '<tr><th>��������</th><th>��ʸ������</th><th>�ꡡ̾</th><th>������޵�</th></tr></thead><tbody>';
								var isWorks = [];	// ���ǡ�ž�̻桢���١��ץ��Ȥκ�Ȥ�̵ͭ
								var abled = "";
								var curid = 0;
								var customer_id = info[0]['customer_id'];
								var bundle_id = 0;	// Ʊ���ξ��˺ǽ�μ���No.���ݻ�
								var curdate = info[0]['schedule3'];
								var number = 0;
								for(i=0; i<result_len; i++){
									isWorks = [1,1,1,1];
									
									// Ʊ�������å�
									if(info[i]["bundle"]==1){
										if(bundle_id==0 || curdate!=info[i]['schedule3'] || customer_id!=info[i]['customer_id']) bundle_id = info[i]['orders_id'];
									}else{
										bundle_id = 0;
									}
									
									// �ܵ�ID
									if(info[i]['cstprefix']=='g'){
										number = 'G' + ("0000"+info[i]['number']).slice(-4);
									}else{
										number = 'K' + ("000000"+info[i]['number']).slice(-6);
									}
									
									list += '<tr class="toprow';
									// Ǽ���ζ��ڤ���
									if(curdate!=info[i]['schedule3']){
										list += ' dateline';
									}
									list += '">';
									list += '<td class="centering"><a onclick="$.setQuery(this);" href="./main.php?req=orderform&pos=428&order='+info[i]['orders_id']+params+'">'+info[i]['orders_id']+' <img alt="������̤�" src="./img/link.png" width="10" /></a></td>';
									list += '<td class="centering emphasis">'+info[i]['schedule3']+'</td>';
									list += '<td><p class="fix_140" style="line-height:1.2">'+number+'<br>';
									list += '<a href="./main.php?req=customerlist&amp;pos=428&amp;cst='+info[i]['customer_id']+'">';
									
									/* ��ԡ��ȤΥޡ���
									if(info[i]['repeater']!=0){
										list += '<strong>(R)</strong>';
									}
									*/
									
									list += info[i]['customername'] + '</a></p></td>';
									
									// ����̾
									list += '<td><p class="fix_100">'+info[i]['category_name']+'</p></td>';
									
									// �õ�����
									var notices = [];
									if(r[i]['allrepeat']==1 || (r[i]['repeater']>0 && r[i]['ordertype']=='industry')) notices.push('���');
									if(r[i]['completionimage']==1) notices.push('�����');
									if(r[i]['express']!=0) notices.push('�õ�'+r[i]['express']);
									if(r[i]['bundle']==1) notices.push('Ʊ��');
									list += '<td rowspan="2" class="rowline_c">'+notices.toString()+'</td>';
									
									// ��Ľ�����å��Υ��쥯����
									var fieldname = [];
									var print_name = info[i]['print_name'];
									
									// ȯ��ô������ʸ���ȡ�
									if(curid!=info[i]['orders_id']){
										pattern = 'value="'+info[i]['state_0']+'"';
										re = new RegExp(pattern, "i");
										opt = $.prop.staff[0];
										opt = opt.replace(re, pattern+' selected="selected"');
										list += '<td class="rowline_c"><select name="state" onchange="$.checkstatus(this,0,'+info[i]['orders_id']+',\''+info[i]['printtype_key']+'\')">'+opt+'</select></td>';
									}else{
										list += '<td class="rowline_c">---</td>';
									}
									
									// �ǲ������ǡ�ž�̻桢���١ʥץ�����ˡ���ȡ�
									if(info[i]['print_name']!="" && info[i]['noprint']==0){
										fieldname = ['', 'state_1','state_2','state_3','state_7'];
										for(n=1; n<5; n++){
											pattern = 'value="'+info[i][fieldname[n]]+'"';
											re = new RegExp(pattern, "i");
											opt = $.prop.staff[n];
											opt = opt.replace(re, pattern+' selected="selected"');
											
											if(n==2){	// ����
												if(info[i]['print_type']=='silk' || info[i]['print_type']=='digit'){
													list += '<td class="rowline_c"><select name="state" onchange="$.checkstatus(this,2,'+info[i]['orders_id']+',\''+info[i]['printtype_key']+'\')">'+opt+'</select></td>';
												}else{
													list += '<td class="rowline_c">---</td>';
													isWorks[0] = 0;
												}
											}else if(n==3){	// ž�̻�
												if(info[i]['print_type']=='digit'){
													list += '<td class="rowline_c"><select name="state" onchange="$.checkstatus(this,3,'+info[i]['orders_id']+',\''+info[i]['printtype_key']+'\')">'+opt+'</select></td>';
												}else{
													list += '<td class="rowline_c">---</td>';
													isWorks[1] = 0;
												}
											}else{
												list += '<td class="rowline_c"><select name="state" onchange="$.checkstatus(this,'+fieldname[n].slice(-1)+','+info[i]['orders_id']+',\''+info[i]['printtype_key']+'\')">'+opt+'</select></td>';
											}
										}
										// �ץ��ȡʥ��쥯�����ϥץ�����ˡ�˰ͤä��ͤ�Ƚ�̡�
										if(info[i]['printtype_key']=='silk'){
											n=5;
											pattern = 'value="'+info[i]['state_5']+'"';
										}else if(info[i]['printtype_key']=='inkjet'){
											n=6;
											pattern = 'value="'+info[i]['state_6']+'"';
										}else{
											n=4;
											pattern = 'value="'+info[i]['state_4']+'"';
										}
										re = new RegExp(pattern, "i");
										opt = $.prop.staff[5];
										opt = opt.replace(re, pattern+' selected="selected"');
										list += '<td class="rowline_c"><select name="state" onchange="$.checkstatus(this,'+n+','+info[i]['orders_id']+',\''+info[i]['printtype_key']+'\')">'+opt+'</select></td>';
										
									}else{
										// �ץ��Ȥʤ�����ʸ
										isWorks = [0,0,1,0];
										print_name = '����¾';
										
										// �ǲ������ǡ�ž�̻�
										list += '<td class="rowline_c">---</td>';
										list += '<td class="rowline_c">---</td>';
										list += '<td class="rowline_c">---</td>';
										
										// ����
										pattern = 'value="'+info[i]['state_7']+'"';
										re = new RegExp(pattern, "i");
										opt = $.prop.staff[4];
										opt = opt.replace(re, pattern+' selected="selected"');
										list += '<td class="rowline_c"><select name="state" onchange="$.checkstatus(this,7,'+info[i]['orders_id']+',\''+info[i]['printtype_key']+'\')">'+opt+'</select></td>';
										
										// �ץ���
										list += '<td class="rowline_c">---</td>';
									}
									
									// ���Ǿ���
									list += '<td rowspan="2" class="rowline_c">';
									if(info[i]['rakuhan']!=0) {
										list += '<strong>��</strong>';
									}else{
										list += '-';
									}
									list += '</td>';
									
									// �����ԤΤ���������å���ɽ��
									if(_my_level=="financial" || _my_level=="administrator"){
										list += '<td rowspan="2" class="rowline_c deposit_row">';
										if(curid!=info[i]['orders_id']){
											list += '<input type="checkbox" name="deposit" onchange="$.checkstatus(this,0,'+info[i]['orders_id']+')" ';
											if(info[i]['deposit']==2){
												list+= 'checked="checked"';
											}
											list += ' />';
										}
										list += '</td>';
									}
									
									// ���������������Ƥ��ʤ��Ƥ⡢������㤷���Ϸ�����ξ��Ͻв٥����å���ͭ���ˤ���
									// �����Ԥξ��Ͼ�˥����å���ͭ���ˤ���
									/* 2012-05-26 ��˥������Ĥˤ���
									if(info[i]['deposit']==2){
										abled = '';
									}else if(info[i]['payment']=="cod" || info[i]['bill']==2 || (info[i]['payment']=="0" && info[i]['recipt_key']=="cod")){
										abled = '';
									}else if(_my_level=="acceptance"){
										abled = 'disabled="disabled"';
									}else{
										abled = '';
									}
									*/
									
									
									list += '<td rowspan="2" class="rowline_c">';
									if(curid!=info[i]['orders_id']){
										if(bundle_id!=0 && bundle_id!=info[i]['orders_id']){
											list += '-';
										}else{
											list += '<label>';
											if(_my_level=="financial" || _my_level=="administrator"){
												list += '<input type="checkbox" name="readytoship" class="readytoship_'+info[i]['orders_id']+'" onchange="$.checkstatus(this,'+info[i]['cancelchipmail']+','+info[i]['orders_id']+')" '+abled;
												if(info[i]['readytoship']==1) list+= ' checked="checked"';
												list +=' /> ';
											}
											if(info[i]['readytoship']==1){
												list += '<ins>ȯ����</ins></label>';
											}else{
												list += '<ins>-</ins></label>';
											}
										}
									}
									list += '</td>';
									
									list += '<td rowspan="2" class="rowline_c">';
									if(curid!=info[i]['orders_id']){
										if(bundle_id!=0 && bundle_id!=info[i]['orders_id']){
											list += '-';
										}else{
											list += '<input type="checkbox" name="shipped" class="shipped_'+info[i]['orders_id']+'" ';
											if(info[i]['cancelshipmail']==1 || info[i]['carriage']=='accept'){
												list += 'onchange="$.checkstatus(this,1,'+info[i]['orders_id']+')" '+abled;
											}else{
												if(info[i]['contact_number']!=""){
													list += 'onchange="$.checkstatus(this,0,'+info[i]['orders_id']+')" '+abled;
												}else{
													list += 'onchange="$.checkstatus(this,2,'+info[i]['orders_id']+')" '+abled;
												}
											}
											if(info[i]['shipped']==2) list+= ' checked="checked"';
											list += ' />';
										}
									}
									list += '</td>';
									
								   /* 2012-07-02 �������ϲ��̤�ɽ�����ѹ�
									list += '<td rowspan="2" class="rowline_c">';
									if(info[i]['print_name']!=""){
										list += '<input type="button" value="����ؼ���" title="detail" class="detail_'+i+'" />';
									}
									list += '</td>';
									*/
									
									list += '<td rowspan="2" style="display:none;">'+i+'</td>';
									list += '</tr>';
									
									list += '<tr class="rowseparate">';
									list += '<td>'+print_name+'</td>';
									list += '<td class="centering">'+info[i]['schedule2']+'</td>';
									list += '<td><p class="fix_140"';
									if(info[i]['caution']==1){
										list += ' style="color:#c33;"';
									}
									list += '>'+info[i]['maintitle']+'</p></td>';
									list += '<td class="centering">'+info[i]['order_amount']+'��';
									list += '<span>'+$.strPackmode(info[i])+'</span></td>';
									list += '<td></td>';
									list += '<td></td>';
									for(var w=0; w<isWorks.length; w++){
										if(isWorks[w]==1){
											var n = 0;
											if(w==0){
												n=2;		// ����
											}else if(w==1){
												n=3;		// ž�̻�
											}else if(w==2){
												n=7;		// ����
											}else if(w==3){
												if(info[i]['printtype_key']=='silk'){
													n=5;
												}else if(info[i]['printtype_key']=='inkjet'){
													n=6;
												}else{
													n=4;
												}
											}
											// ����λ��ϥ��쥯����������
											if(info[i]['factory_'+n]==9){
												pattern = 'value="'+info[i]['factory_'+n]+'"';
												re = new RegExp(pattern, "i");
												opt = '<option value="1">�裱����</option><option value="2">�裲����</option><option value="9">����</option>';
												opt = opt.replace(re, pattern+' selected="selected"');
												list += '<td class="centering"><select name="factory" style="font-size:12px;" onchange="$.checkstatus(this,'+n+','+info[i]['orders_id']+',\''+info[i]['printtype_key']+'\')">'+opt+'</select></td>';
											}else{
												list += '<td>'+factory[info[i]['factory_'+n]]+'</td>';
											}
										}else{
											list += '<td></td>';
										}
									}
									list += '</tr>';
									
									curid = info[i]['orders_id'];
									curdate = info[i]['schedule3'];
									customer_id = info[i]['customer_id'];
								}
								list += '</tbody></table>';
								
								$('#result_searchtop').html(list);
								$('#result_searchtop .result_list').tablefix({height:580, fixRows:2});
								
								if(_scroll!=''){
									$('#result_searchtop .result_list').closest('div').scrollTop(_scroll);
									_scroll = '';
								}
							}
						}else{
							alert('Error: p417\n'+r);
						}
					}
				});
			}
			
			switch(func){
			case 'btn':
				$('#result_count').text(0);
				$('#result_searchtop').html('');
				var title = arguments[1].attr('title');
				switch(title){
					case 'reset':
						var f = document.forms.searchtop_form;
						var dt = new Date();
						dt.setDate(dt.getDate()-3);
						//f.reset();
						var elem = f.elements;
						for (j=0; j < elem.length; j++) {
							if(elem[j].type=="text") elem[j].value = "";
						}
						f.term_from.value = dt.getFullYear() + "-" + ("00"+(dt.getMonth() + 1)).slice(-2) + "-" + ("00"+dt.getDate()).slice(-2);
						f.shipped.value = '1';
						f.print_key.value = '';
						f.id.focus();
						$('#term_from, #term_to').change();
						break;
					
					case 'progress':
						btn(arguments[1]);
						break;
				}
				break;
			}
		}
	});


	$('#search, #reset').click( function(){
		$.main('btn', $(this));
	});


	$('#searchtop_form select').change( function(){
		$.main('btn', $('#search'));
	});


	/* customer number ����k000000���ȼ�g0000 */
	$('#searchtop_form input[name=number]').change( function(){	
		var str = $(this).val();
		if(str=='') return;
		str = str.replace(/[��-��]/g, function(m){
			var a = "��������������������";
			var r = a.indexOf(m);
			return r==-1? m: r;
		});
		str = str.replace(/[K�ˣ�]/g, 'k');
		str = str.replace(/[G�ǣ�]/g, 'g');
		/* /^[gk]{1}([1-9]{1}\d*)?$/ 0���ץ쥹�ξ�� */
		if(!str.match(/^[gk]{1}\d*$/)){
			$(this).val('');
		}else{
			$(this).val(str);
		}
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
				$.ajax({url: './php_libs/checkHoliday.php',
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
	
	
	/* �ȥॹ��EDIȯ������������ */
	$('#orderByTOMS').live('click', function(){
		var orders_id = $(this).attr('class').split('_')[1];
		$.ajax({url: './php_libs/dbinfo.php', type: 'POST',
			data: {'act':'itemsByToms','orders_id':orders_id}, async: false,
			success: function(r){
				r = r.trim();
				if(!r.match(/^\d/)){
					alert('Error: p71\n'+r);
					return;
				}
				var data = r.split('|');
				if(data[0]==0){
					alert('�����ֹ� '+orders_id+' �˥ȥॹ�ξ��ʤϤ���ޤ���');
				}else{
					var msg = "�ȥॹ��ȯ�����������ɤ��ޤ���\n������Ǥ�����";
					if(data[1]==""){
						msg = "ȯ��ô���Ԥ����ꤵ��Ƥ��ޤ���\n\n" + msg;
					}else{
						msg = "��ȯ��ô����"+data[1]+"��\n\n" + msg;
					}
					if(confirm(msg)){
						location.href = './php_libs/toms_ediform.php?orders_id='+orders_id;
					}
				}
			}
		});
	});
	
	
	/*
	*	ȯ�����դ��ѹ���ô���ԥ��쥯������񤭴�����
	*/
	$('#term_from, #term_to').change( function(){
		var $my = $('#staff_selectors');
		var options = [];
		var rowid = ['rowid1','rowid2','rowid3','rowid4','rowid5','rowid6'];
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
		var data1 = [];
		for(var t=0; t<rowid.length; t++){
			data1 = [rowid[t], term_from, term_to];
			$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:false,
				data:{'act':'search','mode':'stafflist', 'field1[]':field1, 'data1[]':data1}, success: function(r){
					if(r instanceof Array){
						if(r.length!=0){
							var option = '<option value="0"">----</option>';
							for(var i=0; i<r.length; i++){
								option += '<option value="'+r[i]['id']+'">'+r[i]['staffname']+'</option>';
							}
							$.prop.staff[t] = option;
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
		}
		
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
		
		// ô���ԥ��쥯������<option>����������
		$('#staff_selectors select').each( function(index){
			$.prop.staff[index] = $(this).html();
		});
		
		//$.main('btn', $('#search'));

	});


	/********************************
	*	dhtmlx ComboBox
	*/
   /*
	dhtmlx.skin = "dhx_skyblue";
	$.dhx.Combo = new dhtmlXCombo("mesh", "alfa", 90);
	$.dhx.Combo.addOption([["120", 120], ["80", 80], ["80-120", "80-120"], ["����¾", "����¾"]]);
	*/	
		
});
