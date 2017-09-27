<?php
	require_once $_SERVER['DOCUMENT_ROOT'].'/../cgi-bin/JSON.php';


$des = new Design();


	class Design {

	/*****************************************************
	* saveDesFile
	*	フロントエンドからの注文デザイン画像ファイル保存
	*	$order_id ,$file ,$name ,$site
	*
	* @return {int} アップロードファイルの数
	*/
		public function saveDesFile($order_id, $file, $name, $site){
			$path =  $_SERVER['DOCUMENT_ROOT']."/system/attatchfile/".$order_id;
			if(!is_dir($path)) {
				mkdir($path);
			}

			$root = $_SERVER['DOCUMENT_ROOT']."/../../";
			$fileCount = count($file);
			$up = 0;
			for($i=0;$i<$fileCount;$i++){
				if(!$file[$i]){
					break;
				}
				$fileName = basename($file[$i]);

				// 同じファイル名の場合
				//				while($this->checkFileName($order_id,$fileName)) {
				//					$fileName = str_replace(".", "_next_.", $fileName);
				//				}
				$fileName = $path."/".$fileName;

				// ファイルを移動
				rename($root.$file[$i], $fileName);
				$up++;
			}

			if ($up>0 && $up==$fileCount) {
				$tmpPath = dirname($root.$file[0]);
				$this->removeDirectory($tmpPath);
			}

			return $up;
		}

		/**
		 * 未使用（旧バージョン）
		 */
		public function saveDesFile_old($order_id, $file, $name, $site){
			$path =  $_SERVER['DOCUMENT_ROOT']."/system/attatchfile/".$order_id;
			if(!is_dir($path)) {
				mkdir($path);
			}
			$encode = "";
			switch($site){
				case 1;
				case 5;
					$encode = "euc-jp";
					break;
				case 6;
					$encode = "utf-8";
					break;
			}
			for($i=0;$i<count($file);$i++){
				if(!$file[$i]){
					break;
				}
				$fileName = mb_convert_encoding($name[$i],"utf-8",$encode);

				//同じファイル名の場合
				while($this->checkFileName($order_id,$fileName)) {
					$fileName = str_replace(".", "_next_.", $fileName);
				}
				$fileName = $path."/".$fileName;
				$img_decode64 = base64_decode($file[$i]);
				$uploadfile = file_put_contents($fileName,$img_decode64);
			}
			return null;
		}

	/*****************************************************
	* removeDirectory
	*	ディレクトリとファイルを再帰的に全削除
	*	$dir
	*/
		public function removeDirectory($dir) {
			if ($handle = opendir("$dir")) {
				while (false !== ($item = readdir($handle))) {
					if ($item != "." && $item != "..") {
						if (is_dir("$dir/$item")) {
							$this->removeDirectory("$dir/$item");
						} else {
							unlink("$dir/$item");
						}
					}
				}
				closedir($handle);
				rmdir($dir);
			}
		}

	/*****************************************************
	* getDesFile
	*	デザイン画像ファイル名を取得
	*	$order_id ,$folder
	*/

		public function getDesFile($order_id, $folder){
			//$folderurl = $_SERVER['DOCUMENT_ROOT']."/system/attatchfile/".$order_id;
			$folderurl = $_SERVER['DOCUMENT_ROOT'].'/system/'.$folder.'/'.$order_id;
			$file = scandir($folderurl);
			return $file;
		}

	/*****************************************************
	* uploadDesFile
	*	管理システムからアップロードするデザイン画像の保存
	*	$order_id, $file, $name, $folder
	*/

		public function uploadDesFile($order_id, $file, $name, $folder){
			$path =  $_SERVER['DOCUMENT_ROOT'].'/system/'.$folder.'/'.$order_id;
			if(!is_dir($path)) {
				mkdir($path);
			}
			move_uploaded_file($file, $path."/".$name);
		}

	/*****************************************************
	* deleteDesFile
	*	デザイン画像ファイル削除
	*	$order_id, $name, $folder
	*/
		
		public function deleteDesFile($order_id, $name, $folder){
			$deleteFile = $_SERVER['DOCUMENT_ROOT'].'/system/'.$folder.'/'.$order_id.'/'.$name;
			$res = unlink($deleteFile);
			return $res;
		}
		

	/*****************************************************
	* checkFileName
	*	デザイン画像ファイル名前の有無チェック
	*	$order_id, $name, $folder
	*/

		public function checkFileName($order_id, $name, $folder){
			$path =  $_SERVER['DOCUMENT_ROOT'].'/system/'.$folder.'/'.$order_id;
			$res = file_exists($path."/".$name);
			return $res;
		}

		function mb_basename($str){
	    $tmp = preg_split('/[\/\\\\]/', $str);
	    $res = end($tmp);
	    return $res;
		}

	} 

	if(isset($_REQUEST['act'])){
		switch($_REQUEST['act']){

			//管理システムから画像をアップロード
			case 'uploadDesFile':
				$des = new Design();
				$file_id = "";
				if($_REQUEST[folder] == "attatchfile") {
					$file_id = "attach_des";
				} else {
					$file_id = "attach_img";
				}
  			$tmp_path = $_FILES[$file_id]['tmp_name'];
  			$filename = $_FILES[$file_id]['name'];
				$filename = mb_convert_encoding($filename,'utf-8','euc-jp');
				$des->uploadDesFile($_REQUEST['order_id'], $tmp_path, $filename, $_REQUEST['folder']);
	  		break;

			//管理システムで画像ファイルを表示
			case 'showDesignImg':
				$des = new Design();
				$list = $des->getDesFile($_REQUEST['order_id'], $_REQUEST['folder']);
				$json = new Services_JSON();
				$list = $json->encode($list);
				header("Content-Type: text/javascript; charset=utf-8");
				//$list = mb_convert_encoding($list,'euc-jp','utf-8');
				echo $list;
				break;
			case 'deleteDesFile':
				$des = new Design();
				$res = $des->deleteDesFile($_REQUEST['order_id'], $_REQUEST['file_name'], $_REQUEST['folder']);
				echo $res;
				break;	

			case 'checkFileName':
				$des = new Design();
				$name = $des->mb_basename($_REQUEST['file_name']);
				//$name = mb_convert_encoding($name,'SJIS','utf-8');
				$res = $des->checkFileName($_REQUEST['order_id'], $name, $_REQUEST['folder']);
				echo $res;
				break;
		}
		return $res;
}
?>
