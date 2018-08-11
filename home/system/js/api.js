/**
 * API
 * log
 * 2017-10-21 Created
 */
$(function(){
	'use strict';
	const API_URL = 'https://takahamalifeart.com/v3/';
	const ACCESS_TOKEN = 'cuJ5yaqUqufruSPasePRazasUwrevawU';
	$.extend({
		api: function (args, method, callback) {
			/**
			 * @param args リソースのコレクション
			 * @param method HTTP Method{@dode GET, POST, PUT}
			 * @param callback 成功後に実行する関数
			 * @param arguments[3]
			 *		プリント代計算のパラメータ、他引数（json形式）
			 *		または
			 *		タグIDの配列、量販単価の枚数
			 * @return jqXHR object
			 */
			if (Array.isArray(args) !== true) reurn;
			var resource = '',
				param = {},
				len = args.length,
				isAsync = true;
			if (len == 0) return;
			resource += args[0];
			for (var i = 1; i < len; i++) {
				resource += '/' + args[i];
			}
			if (arguments.length > 3) {
				param = {
					'args': arguments[3]
				};
				resource += '/';
			}

			if (method=='sync') {
				method = 'GET';
				isAsync = false;
			}

			return $.ajax({
				async: isAsync,
				url: API_URL + resource,
				type: method,
				dataType: 'json',
				data: param,
				timeout: 5000,
				headers: {
					'X-TLA-Access-Token': ACCESS_TOKEN
				}
			}).done(function (r) {
				if (Object.prototype.toString.call(callback)==='[object Function]') callback(r);
			}).fail(function (jqXHR, textStatus, errorThrown) {
				if (typeof jqXHR.statusCode[jqXHR.status] != 'undefined') {
					return false;
				}
				alert("不正なリクエスト、またはタイムアウトです");
			});
		}
	});
});