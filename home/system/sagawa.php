<?php
    require_once dirname(__FILE__).'/php_libs/session_my_handler.php';
    require_once dirname(__FILE__).'/php_libs/mainmenu_list.php';

    // �������Ϥ�����ä��褿���
    if (isset($_GET['filename'])) {
        $scroll = $_GET['scroll'];
        $pos = strpos($_SERVER['QUERY_STRING'], 'filename=');
        $query_string = substr($_SERVER['QUERY_STRING'], $pos);

        $hash = explode('&', $query_string);
        for ($i=0; $i<count($hash); $i++) {
            $tmp = explode('=', $hash[$i]);
            if ($tmp[0]=='filename' || $tmp[0]=='reappear') {
                continue;
            }
            $q[$tmp[0]] = $tmp[1];
        }
    }
?>
<!DOCTYPE html>
<html>

<head>
    <meta charset="EUC-JP" />
    <meta name="robots" content="noindex" />
    <title><?php echo _TITLE_SYSTEM; ?>
    </title>
    <meta http-equiv="Content-Style-Type" content="text/css" />
    <meta http-equiv="Content-Script-Type" content="text/javascript" />

    <link rel="stylesheet" type="text/css" media="screen" href="./js/theme/style.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="./js/ui/cupertino/jquery.ui.all.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="./js/modalbox/css/jquery.modalbox.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="./css/template.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="./css/shippinglist.css" />

    <script type="text/javascript" src="./js/jquery.js"></script>
    <script type="text/javascript" src="./js/jquery.smoothscroll.js"></script>
    <script type="text/javascript" src="./js/ui/jquery.ui.core.js"></script>
    <script type="text/javascript" src="./js/ui/jquery.ui.datepicker.js"></script>
    <script type="text/javascript" src="./js/ui/i18n/jquery.ui.datepicker-ja.js"></script>
    <script type="text/javascript" src="./js/modalbox/jquery.modalbox-min.js"></script>
    <script type="text/javascript" src="./js/lib/common.js"></script>
    <script type="text/javascript" src="./js/b2_yamato.js"></script>

</head>

<body class="main_bg" id="page_top">

    <div id="header" class="main_bg">
        <div class="main_header">
            <p class="title">ȯ������</p>
            <?php echo $mainmenu;?>
        </div>
    </div>

    <div id="main_wrapper" class="wrapper">
        <div class="maincontents">
            <div>
                <fieldset id="search_wrapper">
                    <legend>������ء�����</legend>
                    <div class="clearfix">
                        <form action="" name="searchtop_form" id="searchtop_form" onsubmit="return false">
                            <div>
                                <table>
                                    <tbody>
                                        <tr>
                                            <th>ȯ����</th>
                                            <td>
                                                <input type="text" value="
                                                    <?php
                                                        if (isset($q['term_from'])) {
                                                            echo $q['term_from'];
                                                        } else {
                                                            echo date('Y-m-d');
                                                        }
                                                    ?>" name="term_from" size="10"
                                                    class="forDate datepicker" /> ���<input type="text" value="
                                                    <?php
                                                        if (isset($q['term_to'])) {
                                                            echo $q['term_to'];
                                                        }
                                                    ?>" name="term_to" size="10"
                                                    class="forDate datepicker" />
                                                <input type="button" value="���ե��ꥢ" title="cleardate" id="cleardate" />
                                            </td>
                                            <th>��ʸ�ֹ�</th>
                                            <td>
                                                <input type="text" value="
                                                    <?php
                                                        if (isset($q['orderid'])) {
                                                            echo $q['orderid'];
                                                        } else {
                                                            echo "";
                                                        }
                                                    ?>" name="orderid" size="10" class="" />
                                            </td>
                                            <th>�Ϥ���</th>
                                            <td>
                                                <input type="text" value="
                                                    <?php
                                                        if (isset($q['organization'])) {
                                                            echo $q['organization'];
                                                        } else {
                                                            echo "";
                                                        }
                                                    ?>" name="organization" size="10" class="" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>����</th>
                                            <td>
                                                <select name="factory">
                                                    <option value="0" selected="selected">----</option>
                                                    <option value="1">�裱����</option>
                                                    <option value="2">�裲����</option>
                                                    <option value="9">�裱��������</option>
                                                </select>
                                            </td>
                                            <th>����</th>
                                            <td>
                                                <select name="deposit">
                                                    <?php
                                                        if (!isset($q['deposit'])) {
                                                            $q['deposit'] = '';
                                                        }
                                                        $tmp = '<option value="" selected="selected">����</option>
                                                            <option value="1">̤����</option>
                                                            <option value="2">�����</option>';
                                                        echo preg_replace('/value=\"'.$q['deposit'].'\"/', 'value="'.$q['deposit'].'" selected="selected"', $tmp);
                                                    ?>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div>
                                <table>
                                    <tbody>
                                        <tr>
                                            <th>ȯ��������</th>
                                            <td>
                                                <select name="readytoship">
                                                    <?php
                                                        if (!isset($q['readytoship'])) {
                                                            $q['readytoship'] = '1';
                                                        }
                                                        $tmp = '<option value="" selected="selected">����</option>
                                                            <option value="1">ȯ����</option>
                                                            <option value="0">ȯ���Բ�</option>';
                                                        echo preg_replace('/value=\"'.$q['readytoship'].'\"/', 'value="'.$q['readytoship'].'" selected="selected"', $tmp);
                                                    ?>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </form>
                    </div>
                    <p class="btn_area">
                        <input type="button" value="����" title="search">
                        <input type="button" value="reset" title="reset">
                    </p>
                </fieldset>

                <div id="result_wrapper">
                    <p class="submenu">
                        <span class="btn_pagenavi" title="searchform">&lt;&lt; �����ե������</span>
                        <span class="btn_pagenavi" title="csv">CSV�������ݡ���</span>
                    </p>
                    <div class="pagenavi">
                        <p style="position: absolute;">�������<span id="result_count">0</span>��</p>
                        <span class="btn_pagenavi" title="first">�ǽ�� &lt;&lt;&lt;</span>&nbsp;<span class="btn_pagenavi"
                            title="previous">���� &lt;&lt;</span><span class="pos_pagenavi"></span><span
                            class="btn_pagenavi" title="next">&gt;&gt; ����</span>&nbsp;<span class="btn_pagenavi"
                            title="last">&gt;&gt;&gt; �Ǹ��</span>
                    </div>
                </div>
                <form action="" name="searchresult_form" id="searchresult_form" onsubmit="return false">
                    <div id="result_searchtop"></div>
                </form>
            </div>
        </div>

    </div>

    <div id="printform_wrapper"><iframe id="printform" name="printform"></iframe></div>
</body>

</html>