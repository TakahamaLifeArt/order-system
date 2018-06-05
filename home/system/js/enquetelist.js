/*
*	�����ϥޥ饤�ե�����
*	���󥱡��Ƚ���
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
		$('#searchtop_form select').change( function(){
			mypage.main('btn', $('input[title="search"]'));
		});


		/********************************
		*	datepicker
		*/
		$('.datepicker', '#searchtop_form').datepicker({
			beforeShowDay: function(date){
				var weeks = date.getDay();
				var texts = "";
				if(weeks == 0) texts = "����";
				var YY = date.getFullYear();
				var MM = date.getMonth() + 1;
				var DD = date.getDate();
				var currDate = YY + "/" + MM + "/" + DD;
				var datesec = Date.parse(currDate)/1000;
				if(!mypage.prop.holidayInfo[YY+"_"+MM]){
					mypage.prop.holidayInfo[YY+"_"+MM] = new Array();
					$.ajax(
						{	url: './php_libs/checkHoliday.php',
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
						}
					);
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
			//document.forms.searchtop_form.customername.focus();
			mypage.main('btn', $('input[title="search"]'));
		});

	});

	var mypage = {
			prop: {	'holidayInfo':{}
		},
		main: function(func){
			var btn = function(my){
				var lines1 = [];		// ���׷��
				var lines2 = [];		// �������ν��׷��
				var list = '';			// HTML
				var tmp = [];
				var ans17 = [];
				var ans17Label = [
					"�äˤʤ�",
					"��ʸ���������",
					"���ʤ�������",
					"���ʤ��Ǻ�俧",
					"���Ϥ���",
					"���ʤθ��Ѥ��",
					"�ǥ���������Ƥ���ˡ",
					"�ץ��ȥ�����",
					"�ץ�����ˡ",
					"��������Ƥ���",
					"�������ᡦ���ʥ���ץ����ʸ"
				];
				

				$('#result_searchtop').html('');

				if(my.attr('title')=="search"){
					$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:false,
						data:{'act':'search','mode':'enquete1'}, success:function(r){
							if(r instanceof Array){
								if(r.length==0){
									alert('��������ǡ��������Ĥ���ޤ���Ǥ�����');
								}else{
									lines1 = r[0];
									lines2 = r[1];
								}
							}else{
								alert('Error: p144\n'+r);
							}
						}
					});
				}

				if(lines2.length>0){
					var i = 0;
					var t = 0;
					var w = 750;
					var count = lines2[0]['cnt'];
					$('#result_count').text(count);
					list += '<p class="q">Q1�����ʡ��ץ��Ȥ��ʼ��ˤ���­�Ǥ��ޤ�������</p>';
					list += '<table class="ans_choice"><tbody>';
					list += '<tr><td>5</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_5']+'</td></tr>';
					list += '<tr><td>4</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_4']+'</td></tr>';
					list += '<tr><td>3</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_3']+'</td></tr>';
					list += '<tr><td>2</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_2']+'</td></tr>';
					list += '<tr><td>1</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_1']+'</td></tr>';
					list += '</tbody></table>';
					
					list += '<p class="q">Q2�������åդ��б��ˤ���­�Ǥ��ޤ�����?</p>';
					list += '<table class="ans_choice"><tbody>';
					list += '<tr><td>5</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_5']+'</td></tr>';
					list += '<tr><td>4</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_4']+'</td></tr>';
					list += '<tr><td>3</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_3']+'</td></tr>';
					list += '<tr><td>2</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_2']+'</td></tr>';
					list += '<tr><td>1</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_1']+'</td></tr>';
					list += '</tbody></table>';
					
					list += '<p class="q">Q3��������֤ˤ���­�Ǥ��ޤ�����?</p>';
					list += '<table class="ans_choice"><tbody>';
					list += '<tr><td>5</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_5']+'</td></tr>';
					list += '<tr><td>4</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_4']+'</td></tr>';
					list += '<tr><td>3</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_3']+'</td></tr>';
					list += '<tr><td>2</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_2']+'</td></tr>';
					list += '<tr><td>1</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_1']+'</td></tr>';
					list += '</tbody></table>';
					
					list += '<p class="q">Q4���ۡ���ڡ����ϻȤ��䤹���ä��Ǥ���?</p>';
					list += '<table class="ans_choice"><tbody>';
					list += '<tr><td>5</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_5']+'</td></tr>';
					list += '<tr><td>4</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_4']+'</td></tr>';
					list += '<tr><td>3</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_3']+'</td></tr>';
					list += '<tr><td>2</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_2']+'</td></tr>';
					list += '<tr><td>1</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_1']+'</td></tr>';
					list += '</tbody></table>';
					
					list += '<p class="q">Q5�����ʤ��忴�ϤϤ������Ǥ����Ǥ��礦��</p>';
					list += '<div class="ans_text"><textarea>';
					for(i=0; i<count; i++){
						if (lines1[i]['ans10']=='') continue;
						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
						list += lines1[i]['enq1date']+"\n\n";
						list += lines1[i]['ans10'];
						list += "\n\n--------------------------\n\n";
					}
					list += '</textarea></div>';
					
					list += '<p class="q">Q6�������ϥޥ饤�ե����ȤΡ֤������Ȥ��Ť餤���פȤ������򶵤��Ƥ���������</p>';
					for (i=0; i<ans17Label.length; i++) {
						ans17[i] = 0;
					}
					for (i=0; i<count; i++) {
						if (lines1[i]['ans17']=='') continue;
						tmp = lines1[i]['ans17'].split(',');
						for (t=0; t<tmp.length; t++) {
							ans17[tmp[t]] += 1;
						}
						
					}
					list += '<table class="ans_choice"><tbody>';
					for(i=0; i<ans17Label.length; i++){
						list += '<tr><td>'+ans17Label[i]+'</td><td><p class="bar" style="width:'+ (ans17[i]/count)*w +'px;"></p></td><td>'+ans17[i]+'</td></tr>';
					}
					list += '</tbody></table>';
					
					list += '<p class="q">Q7�����Τ��̤��ơ����ո������ۤ�����ޤ����餴�������ꤤ���ޤ�</p>';
					list += '<div class="ans_text"><textarea>';
					for(i=0; i<count; i++){
						if (lines1[i]['ans9']=='') continue;
						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
						list += lines1[i]['enq1date']+"\n\n";
						list += lines1[i]['ans9'];
						list += "\n\n--------------------------\n\n";
					}
					list += '</textarea></div>';
					
					list += '<p class="q">Q8���̿��Ǻܳ�����ѤΤ����ͤϡ����������δ��ۤ䥳���Ȥ����Ϥ���������</p>';
					list += '<div class="ans_text"><textarea>';
					for(i=0; i<count; i++){
						if (lines1[i]['ans18']=='') continue;
						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
						list += lines1[i]['enq1date']+"\n\n";
						list += lines1[i]['ans18'];
						list += "\n\n--------------------------\n\n";
					}
					list += '</textarea></div>';
					
					$('#result_table').html(list);
					
				}else{
					$('#result_count').text('0');
					$('.pos_pagenavi').text('');
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
					$('.btn_pagenavi').css('visibility','hidden');
					document.forms.searchtop_form.reset();
					document.forms.searchtop_form.term_from.focus();
				}else{
					btn(arguments[1]);
				}
				break;
			}
		}
	}