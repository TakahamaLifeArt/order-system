/*
*	タカハマライフアート
*	ユーザーレビュー
*	charset euc-jp
*/

$(function(){

/***************************************************************************************************************************
*
*	main page module
*
****************************************************************************************************************************/
	
	/********************************
	*	hide overlay
	*/
	$('#overlay').click( function(){
		if($('.popup_wrapper:visible').length){
			$('.popup_wrapper:visible').fadeOut();
			$.screenOverlay(false);
		}
	});
	
	
	/********************************
	*	一覧のページング
	*/
	$('.btn_pagenavi', '#main_wrapper').live('click', function(){
		$.main('btn', $(this));
	});
	
	
	/********************************
	*	日付
	*
*/
	$('.datepicker').datepicker({
		click: function(dateText, inst){
			$.change_category();
		},
		beforeShowDay: function(date){
			var weeks = date.getDay();
			var texts = "";
			if(weeks == 0) texts = "休日";
			var YY = date.getFullYear();
			var MM = date.getMonth() + 1;
			var DD = date.getDate();
			var currDate = YY + "/" + MM + "/" + DD;
			var datesec = Date.parse(currDate)/1000;
			if(!$.prop.holidayInfo[YY+MM]){
				$.prop.holidayInfo[YY+MM] = new Array();
				$.ajax({ url: '../php_libs/checkHoliday.php',
						type: 'GET',
						dataType: 'text',
						data: {'datesec':datesec},
						async: false,
						success: function(r){
							if(r!=""){
								var info = r.split(',');
								for(var i=0; i<info.length; i++){
									$.prop.holidayInfo[YY+MM][info[i]] = info[i];
								}
							}
						}
					});
			}
			if($.prop.holidayInfo[YY+MM][DD]) weeks = 0;
			if(weeks == 0) return [true, 'days_red', texts];
			else if(weeks == 6) return [true, 'days_blue'];
			return [true];
		}
	});
	
	
	/********************************
	*	日付のクリア
	*
	$('#cleardate').click( function(){
		$('.datepicker', '#search_wrapper').text('');
		$.change_category();
	});
	*/
	
	/********************************
	*	更新
	*/
	$('#update').click( function(){
	var start = $('#start').val();
	var end = $('#end').val();
	var starttime = new Date(start.replace("-", "/").replace("-", "/")); 
	var endtime = new Date(end.replace("-", "/").replace("-", "/")); 

//	if(!start.match(/^[0-9A-Za-z-]+$/)){
//		$.msgbox('開始日付を確認してください。');
//		return;
//	}else if(!end.match(/^[0-9A-Za-z-]+$/)){
//		$.msgbox('終了日付を確認してください。');
//		return;
//	}else 
	
	if(end < start){
		$.msgbox('終始日付のをチェックしてください。');
		return;
	}


  var notice = $('#notice').val();
  var notice_ext = $('#notice_ext').val();
	var site_1_state = 0;
	var site_5_state = 0;
	var site_6_state = 0;
	var site_1_state_ext = 0;
	var site_5_state_ext = 0;
	var site_6_state_ext = 0;

	if($('#site_1_state').is(':checked')){
  	site_1_state = $('#site_1_state').val();
	} else {
		site_1_state = "";
	}
	if($('#site_5_state').is(':checked')){
		site_5_state = $('#site_5_state').val();
	} else {
		site_5_state = "";
	}
	if($('#site_6_state').is(':checked')){
  	site_6_state = $('#site_6_state').val();
	} else {
		site_6_state = "";
	}

	if($('#site_1_state_ext').is(':checked')){
  	site_1_state_ext = $('#site_1_state_ext').val();
	}	else {
		site_1_state_ext = "";
	}
	if($('#site_5_state_ext').is(':checked')){
		site_5_state_ext = $('#site_5_state_ext').val();
	}	else {
		site_5_state_ext = "";
	}
	if($('#site_6_state_ext').is(':checked')){
  	site_6_state_ext = $('#site_6_state_ext').val();
	}	else {
		site_6_state_ext = "";
	}
	
	var api_url = 'http://takahamalifeart.com/v1/api';
	$.ajax({url:api_url, type: 'POST', dataType: 'json', async: false,
		data:{
			'act':'holidayinfo',
			'mode':'w',
			'start':start,
			'end':end,
			'notice':notice,
			'notice-ext':notice_ext,
			'site':1,
			'state':site_1_state,
			'state-ext':site_1_state_ext,
		}, 
	});

	$.ajax({url:api_url, type: 'POST', dataType: 'json', async: false,
		data:{
			'act':'holidayinfo',
			'mode':'w',
			'site':5,
			'state':site_5_state,
			'state-ext':site_5_state_ext
		}, 
	});
	$.ajax({url:api_url, type: 'POST', dataType: 'json', async: false,
		data:{
			'act':'holidayinfo',
			'mode':'w',
			'site':6,
			'state':site_6_state,
			'state-ext':site_6_state_ext,
		}, 
	});
	alert('休日を更新いたしました。');

	});
});


jQuery.extend({
	prop: { 'holidayInfo':{}, 
			'searchdata':[],
			'len':20
	},
});