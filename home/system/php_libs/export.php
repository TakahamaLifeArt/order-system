<?php
/**
 * ファイル出力
 */
class ExportCsv
{
	/**
	 * データを小分けにして出力する（readfileの替わり）
	 *
	 * @param string $path
	 */
	public static function efficient_readfile($path)
	{
		ob_end_clean();
		$handle = fopen($path, "rb");
		while (!feof($handle)) {
			print fread($handle, 4096);
			ob_flush();
			flush();
		}
		fclose();
	}
}

$zip = new ZipArchive();
$time = date("Ymds");
$zipFileName = "toms-csv-order_" . $time .'.zip';
$zipTmpDir = '../data/zip/';
if (!file_exists($zipTmpDir)) {
	mkdir($zipTmpDir, 0707);
}
chmod($zipTmpDir, 0707);	// umaskが指定されている場合に対応

// Zipファイルオープン
$result = $zip->open($zipTmpDir.$zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE);
if ($result !== true) {
	die('ZIPファイル生成に失敗しました');
}

// 処理制限時間を外す
set_time_limit(0);

// 工場
$factories = [
	'1', '2', '9',
];

foreach ($factories as $factoryId) {
	$filename = "orderinglist-{$factoryId}";
	$filepath = "../data/{$filename}.csv";
    $localname = "{$filename}_{$time}.csv";

	if (!is_readable($filepath)) {
		continue;
	}

	$zip->addFromString($localname, file_get_contents($filepath));
}
$zip->close();

// 上記で作ったZIPをダウンロードします。
header("Content-Type: application/zip");
header("Content-Transfer-Encoding: Binary");
header("Content-Disposition: attachment; filename=\"" . $zipFileName . "\"");

ExportCsv::efficient_readfile($zipTmpDir.$zipFileName);

unlink($zipTmpDir.$zipFileName);

exit;
?>
