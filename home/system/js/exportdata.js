/*
*	タカハマライフアート
*	データダウンロード
*	charset euc-jp
*/

	$(function(){

/***************************************************************************************************************************
*
*	main page module
*
****************************************************************************************************************************/

		/********************************
		*	export data
		*/
		$('#orderlist, #printlist, #orderitemlist, #orderitemlist_additional, #worktimelist').click(function(){
			var start = document.forms.searchtop_form.term_from.value;
			var end = document.forms.searchtop_form.term_to.value;
			var id = document.forms.searchtop_form.id.value;
			var csv = $(this).attr('id').split('_');
			var mode = csv.length<2? "": csv[1];
			if(start==""){
				alert('受付日を指定してください');
				return;
			}

			$('#result_searchtop').show();
			$.ajax({ url:'./php_libs/ordersinfo.php', type:'POST', dataType:'text',
				data:{'act':'export', 'csv':csv[0], 'mode':mode, 'start':start, 'end':end, 'id':id}, async:false, 
				success:function(r){
					if (r.length < 2) {
						alert('該当するデータはありませんでした');
					} else {
						var filename = mode? csv[0]+'-'+mode+'.csv': csv[0]+'.csv';
						mypage.handleDownload(r, filename);
					}
				},
				complete:function(XMLHttpRequest, textStatus){
					$('#result_searchtop').hide();
				}
			});
		});
		
		
		/********************************
		*	reset form
		*/
		$('#reset').click( function(){
			document.forms.searchtop_form.term_from.value="";
			document.forms.searchtop_form.term_to.value="";
			document.forms.searchtop_form.id.value="";
		});
		
		
		/********************************
		*	clear date
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
			
		});

	});

	var mypage = {
		prop: {
			'holidayInfo':{}
		},
		handleDownload: function(content, filename) {
			var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
			var blob = new Blob([ bom, content ], { "type" : "text/csv" });
//			var blob = new Blob([ content ], { "type" : "text/csv" });

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
		}
	}