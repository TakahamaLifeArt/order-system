/*
*	タカハマライフアート
*	アンケート集計
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
				if(weeks == 0) texts = "休日";
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
				var lines1 = [];		// 集計結果
				var lines2 = [];		// 選択質問の集計結果
				var list = '';			// HTML
				var tmp = [];
				var ans17 = [];
				var ans17Label = [
					"特になし",
					"注文確定の電話",
					"商品の選び方",
					"商品の素材や色",
					"お届け日",
					"商品の見積もり",
					"デザインの入稿の方法",
					"プリントサイズ",
					"プリント方法",
					"割引の内容や条件",
					"資料請求・商品サンプルの注文",
					"ホームページ全体"
				];
				

				$('#result_searchtop').html('');

				if(my.attr('title')=="search"){
					$.ajax({url:'./php_libs/ordersinfo.php', type:'GET', dataType:'json', async:false,
						data:{'act':'search','mode':'enquete1'}, success:function(r){
							if(r instanceof Array){
								if(r.length==0){
									alert('該当するデータが見つかりませんでした。');
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
					list += '<p class="q">Q1　商品、プリントの品質には満足できましたか？</p>';
					list += '<table class="ans_choice"><tbody>';
					list += '<tr><td>5</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_5']+'</td></tr>';
					list += '<tr><td>4</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_4']+'</td></tr>';
					list += '<tr><td>3</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_3']+'</td></tr>';
					list += '<tr><td>2</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_2']+'</td></tr>';
					list += '<tr><td>1</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_1']+'</td></tr>';
					list += '</tbody></table>';
					
					list += '<p class="q">Q2　その理由があればお聞かせください</p>';
					list += '<div class="ans_text"><textarea>';
					for(i=0; i<count; i++){
						if (lines1[i]['ans15']=='') continue;
						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
						list += lines1[i]['enq1date']+"\n\n";
						list += lines1[i]['ans15'];
						list += "\n\n--------------------------\n\n";
					}
					list += '</textarea></div>';
					
					list += '<p class="q">Q3　スタッフの対応には満足できましたか?</p>';
					list += '<table class="ans_choice"><tbody>';
					list += '<tr><td>5</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_5']+'</td></tr>';
					list += '<tr><td>4</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_4']+'</td></tr>';
					list += '<tr><td>3</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_3']+'</td></tr>';
					list += '<tr><td>2</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_2']+'</td></tr>';
					list += '<tr><td>1</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_1']+'</td></tr>';
					list += '</tbody></table>';
					
					list += '<p class="q">Q4　その理由があればお聞かせください</p>';
					list += '<div class="ans_text"><textarea>';
					for(i=0; i<count; i++){
						if (lines1[i]['ans16']=='') continue;
						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
						list += lines1[i]['enq1date']+"\n\n";
						list += lines1[i]['ans16'];
						list += "\n\n--------------------------\n\n";
					}
					list += '</textarea></div>';
					
					list += '<p class="q">Q5　タカハマライフアートの「ここが使いづらい！」という点を教えてください。</p>';
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
					
					list += '<p class="q">Q6　全体を通して、ご意見ご感想がありましたらご記入お願いします</p>';
					list += '<div class="ans_text"><textarea>';
					for(i=0; i<count; i++){
						if (lines1[i]['ans9']=='') continue;
						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
						list += lines1[i]['enq1date']+"\n\n";
						list += lines1[i]['ans9'];
						list += "\n\n--------------------------\n\n";
					}
					list += '</textarea></div>';
					
					list += '<p class="q">Q7　写真掲載割をご利用のお客様は、商品到着後の感想やコメントをご入力ください。</p>';
					list += '<div class="ans_text"><textarea>';
					for(i=0; i<count; i++){
						if (lines1[i]['ans18']=='') continue;
						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
						list += lines1[i]['enq1date']+"\n\n";
						list += lines1[i]['ans18'];
						list += "\n\n--------------------------\n\n";
					}
					list += '</textarea></div>';
					
					
					
					
					
					
					
//					list += '<p class="q">Q1　今回、タカハマライフアートをお選びいただいた理由をお聞かせ下さい。</p>';
//					list += '<div class="ans_text"><textarea>';
//					for(i=0; i<count; i++){
//						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
//						list += lines1[i]['enq1date']+"\n\n";
//						list += lines1[i]['ans12'];
//						list += "\n\n--------------------------\n\n";
//					}
//					list += '</textarea></div>';
//					
//					list += '<p class="q">Q2　タカハマライフアートのホームページはわかりやすかったでしょうか？</p>';
//					list += '<table class="ans_choice"><tbody>';
//					list += '<tr><td>とても分りやすかった</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_5']+'</td></tr>';
//					list += '<tr><td>分りやすかった</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_4']+'</td></tr>';
//					list += '<tr><td>普通</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_3']+'</td></tr>';
//					list += '<tr><td>分りにくかった</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_2']+'</td></tr>';
//					list += '<tr><td>とても分りにくかった</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_1']+'</td></tr>';
////					list += '<tr><td>無回答</td><td><p class="bar" style="width:'+ (lines2[0]['ans1_0']/count)*w +'px;"></p></td><td>'+lines2[0]['ans1_0']+'</td></tr>';
//					list += '</tbody></table>';
//					
//					list += '<p class="q">Q3　ホームページで、わかりやすかった点、わかりにくかった点について</p>';
//					list += '<div class="ans_text"><textarea>';
//					for(i=0; i<count; i++){
//						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
//						list += lines1[i]['enq1date']+"\n\n";
//						list += lines1[i]['ans2'];
//						list += "\n\n--------------------------\n\n";
//					}
//					list += '</textarea></div>';
//					
//					list += '<p class="q">Q4　ご注文いただいた際の弊社の対応はいかがでしたでしょうか？</p>';
//					list += '<table class="ans_choice"><tbody>';
//					list += '<tr><td>とても良かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_5']+'</td></tr>';
//					list += '<tr><td>良かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_4']+'</td></tr>';
//					list += '<tr><td>普通</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_3']+'</td></tr>';
//					list += '<tr><td>悪かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_2']+'</td></tr>';
//					list += '<tr><td>とても悪かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_1']+'</td></tr>';
////					list += '<tr><td>無回答</td><td><p class="bar" style="width:'+ (lines2[0]['ans5_0']/count)*w +'px;"></p></td><td>'+lines2[0]['ans5_0']+'</td></tr>';
//					list += '</tbody></table>';
//					
//					list += '<p class="q">Q5　プリントの仕上がりは、お客様のイメージ通りでしたでしょうか？</p>';
//					list += '<table class="ans_choice"><tbody>';
//					list += '<tr><td>イメージ以上に良かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_5']+'</td></tr>';
//					list += '<tr><td>イメージ通り良かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_4']+'</td></tr>';
//					list += '<tr><td>普通</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_3']+'</td></tr>';
//					list += '<tr><td>イメージしていたより悪かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_2']+'</td></tr>';
//					list += '<tr><td>全くイメージ通りではなかった</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_1']+'</td></tr>';
////					list += '<tr><td>無回答</td><td><p class="bar" style="width:'+ (lines2[0]['ans6_0']/count)*w +'px;"></p></td><td>'+lines2[0]['ans6_0']+'</td></tr>';
//					list += '</tbody></table>';
//					
//					list += '<p class="q">Q6　商品が到着した際の梱包状態はいかがでしたでしょうか？</p>';
//					list += '<table class="ans_choice"><tbody>';
//					list += '<tr><td>とても良かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_5']+'</td></tr>';
//					list += '<tr><td>良かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_4']+'</td></tr>';
//					list += '<tr><td>普通</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_3']+'</td></tr>';
//					list += '<tr><td>悪かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_2']+'</td></tr>';
//					list += '<tr><td>とても悪かった</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_1']+'</td></tr>';
////					list += '<tr><td>無回答</td><td><p class="bar" style="width:'+ (lines2[0]['ans7_0']/count)*w +'px;"></p></td><td>'+lines2[0]['ans7_0']+'</td></tr>';
//					list += '</tbody></table>';
//					
//					list += '<p class="q">Q7　実際に商品を着用・使用してみての、アイテムに関する感想</p>';
//					list += '<div class="ans_text"><textarea>';
//					for(i=0; i<count; i++){
//						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
//						list += lines1[i]['enq1date']+"\n\n";
//						list += lines1[i]['ans10'];
//						list += "\n\n--------------------------\n\n";
//					}
//					list += '</textarea></div>';
//					
////					list += '<p class="q">Q8　デザイン、色、サイズ、素材など、「もっとこんな商品（アイテム）があればよいのに！」というご希望</p>';
////					list += '<div class="ans_text"><textarea>';
////					for(i=0; i<count; i++){
////						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
////						list += lines1[i]['enq1date']+"\n\n";
////						list += lines1[i]['ans11'];
////						list += "\n\n--------------------------\n\n";
////					}
////					list += '</textarea></div>';
//					
//					list += '<p class="q">Q8　ご使用の用途（音楽イベント、文化祭など）</p>';
//					list += '<div class="ans_text"><textarea>';
//					for(i=0; i<count; i++){
//						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
//						list += lines1[i]['enq1date']+"\n\n";
//						list += lines1[i]['ans13'];
//						list += "\n\n--------------------------\n\n";
//					}
//					list += '</textarea></div>';
//					
//					list += '<p class="q">Q9　「もっとこんなサービス・商品があれば良いのに！」というご要望</p>';
//					list += '<div class="ans_text"><textarea>';
//					for(i=0; i<count; i++){
//						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
//						list += lines1[i]['enq1date']+"\n\n";
//						list += lines1[i]['ans8'];
//						list += "\n\n--------------------------\n\n";
//					}
//					list += '</textarea></div>';
//					
//					list += '<p class="q">Q10　弊社を知ったきっかけ</p>';
//					list += '<table class="ans_choice"><tbody>';
//					list += '<tr><td>インターネット検索</td><td><p class="bar" style="width:'+ (lines2[0]['ans14_6']/count)*w +'px;"></p></td><td>'+lines2[0]['ans14_6']+'</td></tr>';
//					list += '<tr><td>知り合いの紹介</td><td><p class="bar" style="width:'+ (lines2[0]['ans14_5']/count)*w +'px;"></p></td><td>'+lines2[0]['ans14_5']+'</td></tr>';
//					list += '<tr><td>雑誌、新聞記事、広告</td><td><p class="bar" style="width:'+ (lines2[0]['ans14_4']/count)*w +'px;"></p></td><td>'+lines2[0]['ans14_4']+'</td></tr>';
//					list += '<tr><td>セミナー講演会</td><td><p class="bar" style="width:'+ (lines2[0]['ans14_3']/count)*w +'px;"></p></td><td>'+lines2[0]['ans14_3']+'</td></tr>';
//					list += '<tr><td>2回目以降の購入</td><td><p class="bar" style="width:'+ (lines2[0]['ans14_2']/count)*w +'px;"></p></td><td>'+lines2[0]['ans14_2']+'</td></tr>';
//					list += '<tr><td>その他</td><td><p class="bar" style="width:'+ (lines2[0]['ans14_1']/count)*w +'px;"></p></td><td>'+lines2[0]['ans14_1']+'</td></tr>';
////					list += '<tr><td>無回答</td><td><p class="bar" style="width:'+ (lines2[0]['ans14_0']/count)*w +'px;"></p></td><td>'+lines2[0]['ans14_0']+'</td></tr>';
//					list += '</tbody></table>';
//					
//					list += '<p class="q">Q11　その他、注文してみての感想・お気づきの点</p>';
//					list += '<div class="ans_text"><textarea>';
//					for(i=0; i<count; i++){
//						list += 'K'+("000000"+lines1[i]['customer_number']).slice(-6)+" "+lines1[i]['enq1name']+"\n";
//						list += lines1[i]['enq1date']+"\n\n";
//						list += lines1[i]['ans9'];
//						list += "\n\n--------------------------\n\n";
//					}
//					list += '</textarea></div>';
					
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