<?php
	if($_GET['req']!='su' && ($_GET['req']>time() || $_GET['req']<time()-2)) { header("Location: "._SERVER_ROOT."?req=1"); }
	require dirname(__FILE__)."/authentic.php";

	// ���������˥塼�Υϥå���
	$panes = array(
		array('filename'=>'orderform', 'title'=>'��ʸ����'),
		array('filename'=>'orderlist', 'title'=>'��ʸ����'),
		array('filename'=>'ordering', 'title'=>'ȯ��'),
		array('filename'=>'stocklist', 'title'=>'����'),
		array('filename'=>'artworklist', 'title'=>'�ǲ�'),
		array('filename'=>'platelist', 'title'=>'����'),
		array('filename'=>'silklist', 'title'=>'���륯'),
		array('filename'=>'translist', 'title'=>'ž�̻�'),
		array('filename'=>'presslist', 'title'=>'�ץ쥹'),
		array('filename'=>'inkjetlist', 'title'=>'���󥯥����å�'),
//		array('filename'=>'shippinglist', 'title'=>'ȯ��'),
	);
	
	for($i=0; $i<count($panes); $i++){
		$menu[] = '<li><a href="'._SERVER_ROOT.'main.php?req='.$panes[$i]['filename'].'&amp;pos='.time().'">'.$panes[$i]['title'].'</a></li>';
		$curr[] = '<li><span>'.$panes[$i]['title'].'</span></li>';
	}
	

//�ǡ������ϥ�˥奦
	$menu[] = '<li><span class="pull"> �ǡ������� </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=shippinglist&amp;pos='.time().'">ȯ��</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=b2_yamato&amp;pos='.time().'">��ޥȡ�Ģɼ</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=customercsvlist&amp;pos='.time().'">��̾����</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=earningscsvlist&amp;pos='.time().'">�����ɼ</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=clientcsvlist&amp;pos='.time().'">��������Ģ</a></li>
		</ul></li>';

//ȯ��
	$pull['shippinglist'] = '<li><span> �ǡ������� </span><ul>
		<li><span class="pull">ȯ��</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=b2_yamato&amp;pos='.time().'">��ޥȡ�Ģɼ</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=customercsvlist&amp;pos='.time().'">��̾����</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=earningscsvlist&amp;pos='.time().'">�����ɼ</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=clientcsvlist&amp;pos='.time().'">��������Ģ</a></li>
		</ul></li>';

//��ޥȡ�ȯ��
	$pull['b2_yamato'] = '<li><span> �ǡ������� </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=shippinglist&amp;pos='.time().'">ȯ��</a></li>
		<li><span class="pull">��ޥȡ�Ģɼ</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=customercsvlist&amp;pos='.time().'">��̾����</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=earningscsvlist&amp;pos='.time().'">�����ɼ</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=clientcsvlist&amp;pos='.time().'">��������Ģ</a></li>
		</ul></li>';


//��̾����
	$pull['customercsvlist'] = '<li><span> �ǡ������� </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=shippinglist&amp;pos='.time().'">ȯ��</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=b2_yamato&amp;pos='.time().'">��ޥȡ�Ģɼ</a></li>
		<li><span class="pull">��̾����</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=earningscsvlist&amp;pos='.time().'">�����ɼ</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=clientcsvlist&amp;pos='.time().'">��������Ģ</a></li>
		</ul></li>';
//�����ɼ
	$pull['earningscsvlist'] = '<li><span> �ǡ������� </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=shippinglist&amp;pos='.time().'">ȯ��</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=b2_yamato&amp;pos='.time().'">��ޥȡ�Ģɼ</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=customercsvlist&amp;pos='.time().'">��̾����</a></li>
		<li><span class="pull">�����ɼ</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=clientcsvlist&amp;pos='.time().'">��������Ģ</a></li>
		</ul></li>';

//��������Ģ
	$pull['clientcsvlist'] = '<li><span> �ǡ������� </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=shippinglist&amp;pos='.time().'">ȯ��</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=b2_yamato&amp;pos='.time().'">��ޥȡ�Ģɼ</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=customercsvlist&amp;pos='.time().'">��̾����</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=earningscsvlist&amp;pos='.time().'">�����ɼ</a></li>
		<li><span class="pull">��������Ģ</span></li>
		</ul></li>';

	//�ܵҴ�����˥塼
	$menu[] = '<li><span class="pull"> �ܵҴ��� </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=customerlist&amp;pos='.time().'">�ܵҰ���</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=enquetelist&amp;pos='.time().'">���󥱡���</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=requestlist&amp;pos='.time().'">��������</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=mailhistory&amp;pos='.time().'">�᡼������</a></li>
		</ul></li>';
	$pull['customerlist'] = '<li><span> �ܵҴ��� </span><ul>
		<li><span class="pull">�ܵҰ���</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=enquetelist&amp;pos='.time().'">���󥱡���</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=requestlist&amp;pos='.time().'">��������</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=mailhistory&amp;pos='.time().'">�᡼������</a></li>
		</ul></li>';
	$pull['enquetelist'] = '<li><span> �ܵҴ��� </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=customerlist&amp;pos='.time().'">�ܵҰ���</a></li>
		<li><span class="pull">���󥱡���</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=requestlist&amp;pos='.time().'">��������</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=mailhistory&amp;pos='.time().'">�᡼������</a></li>
		</ul></li>';
	$pull['requestlist'] = '<li><span> �ܵҴ��� </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=customerlist&amp;pos='.time().'">�ܵҰ���</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=enquetelist&amp;pos='.time().'">���󥱡���</a></li>
		<li><span class="pull">��������</span></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=mailhistory&amp;pos='.time().'">�᡼������</a></li>
		</ul></li>';
	$pull['mailhistory'] = '<li><span> �ܵҴ��� </span><ul>
		<li><a href="'._SERVER_ROOT.'main.php?req=customerlist&amp;pos='.time().'">�ܵҰ���</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=enquetelist&amp;pos='.time().'">���󥱡���</a></li>
		<li><a href="'._SERVER_ROOT.'main.php?req=requestlist&amp;pos='.time().'">��������</a></li>
		<li><span class="pull">�᡼������</span></li>
		</ul></li>';
	
	
	// ���������˥塼
	$menu2[] = '<li><span class="pull"> ���񡡡��ס� </span><ul>';
	$menu2[] = '<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">�����踵Ģ</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=accountbook&amp;pos='.time().'">�������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=billschedule&amp;pos='.time().'">�����ͽ��</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=billstate&amp;pos='.time().'">�����������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=billresults&amp;pos='.time().'">��������</a></li>
				</ul></li>';
	$menu2[] = '<li><span class="pull"> ���������� </span><ul>';
	$menu2[] = '<li><a href="'._SERVER_ROOT.'main.php?req=saleslist&amp;pos='.time().'">��彸��ɽ</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=saleschart&amp;pos='.time().'">����ʬ��</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=printworklist&amp;pos='.time().'">�ץ������</a></li>
				</ul></li>';
	$menu2[] = '<li><a href="'._SERVER_ROOT.'main.php?req=supplierlist&amp;pos='.time().'">���������</a></li>';
	$curr2[] = '<li><span> ���񡡡��ס� </span><ul>';
	$curr2[] = '';
	$curr2[] = '<li><span> ���������� </span><ul>';
	$curr2[] = '';
	$curr2[] = '<li><span>���������</span></li>';
	
	
	// ��������ؤΥ������������̤Υ�˥塼
	switch($authenticatedUser){
		case "1":
			$mylevel = "administrator";
			$menu[] = '<li><span class="pull"> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">�������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">����DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">���������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">��������</a></li>
				</ul></li>';
			$pull['itemdb'] = '<li><span> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">�������</a></li>
				<li><span class="pull">����DB</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">���������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">��������</a></li>
				</ul></li>';
			$pull['userreview'] = '<li><span> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">�������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">����DB</a></li>
				<li><span class="pull">�����ͥ�ӥ塼</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">���������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">��������</a></li>
				</ul></li>';
			$pull['itemreview'] = '<li><span> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">�������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">����DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><span class="pull">�����ƥ��ӥ塼</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">���������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">��������</a></li>
				</ul></li>';
			$pull['exportdata'] = '<li><span> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">�������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">����DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				<li><span class="pull">���������</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">��������</a></li>
				</ul></li>';
			$pull['notice'] = '<li><span> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">�������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">����DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">���������</a></li>
				<li><span class="pull">��������</span></li>
				</ul></li>';
			$menu2[] = '<li><a href="'._SERVER_ROOT.'main.php?req=orderform&amp;pos='.time().'">�������</a></li>';
			break;
		case "2":
			$mylevel = "financial";
			$menu[] = '<li><span class="pull"> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=customerledger&amp;pos='.time().'">�������</a></li>
				</ul></li>';
			$menu2[] = '<li><a href="'._SERVER_ROOT.'main.php?req=orderform&amp;pos='.time().'">�������</a></li>';
			break;
		case "3":
			$mylevel = "dbmanage";
			$menu[] = '<li><span class="pull"> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">����DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">���������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">��������</a></li>
				</ul></li>';
			$pull['itemdb'] = '<li><span> ����MENU </span><ul>
				<li><span class="pull">����DB</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">���������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">��������</a></li>
				</ul></li>';
			$pull['userreview'] = '<li><span> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">����DB</a></li>
				<li><span class="pull">�����ͥ�ӥ塼</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">���������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">��������</a></li>
				</ul></li>';
			$pull['itemreview'] = '<li><span> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">����DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><span class="pull">�����ƥ��ӥ塼</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=exportdata&amp;pos='.time().'">���������</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">��������</a></li>
				</ul></li>';
			$pull['exportdata'] = '<li><span> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=itemdb&amp;pos='.time().'">����DB</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				<li><span class="pull">���������</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-notice&amp;pos='.time().'">��������</a></li>
				</ul></li>';
		case "4":
			$mylevel = "acceptance";
			$menu[] = '<li><span class="pull"> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview.php&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview.php&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				</ul></li>';
			$pull['userreview'] = '<li><span> ����MENU </span><ul>
				<li><span class="pull">�����ͥ�ӥ塼</span></li>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview.php&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>
				</ul></li>';
			$pull['itemreview'] = '<li><span> ����MENU </span><ul>
				<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview.php&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>
				<li><span class="pull">�����ƥ��ӥ塼</span></li>
				</ul></li>';
	}
	
	$filename = basename($_SERVER['SCRIPT_FILENAME'], '.php');
	
	// �������ѥ�˥塼�С�
	if($authenticatedUser==9){
		if($filename!='userreview' && $filename!='itemreview') header("Location: "._SERVER_ROOT."?req=1");
		$mylevel = "guest";
		$mainmenu = '<ol class="mainmenu">';
		$mainmenu .= '<li><a href="'._SERVER_ROOT.'main.php?req=website-userreview&amp;pos='.time().'">�����ͥ�ӥ塼</a></li>';
		$mainmenu .= '<li><a href="'._SERVER_ROOT.'main.php?req=website-itemreview&amp;pos='.time().'">�����ƥ��ӥ塼</a></li>';
		$mainmenu .= '</ol>';
	}
	
	
	// ���������˥塼�С�������
	if($authenticatedUser<9){
		if($filename=='itemdb' || $filename=='userreview' || $filename=='itemreview'|| $filename=='exportdata'|| $filename=='notice'){
			$mainmenu = '<ol class="mainmenu">';
			for($m=0; $m<count($menu)-1; $m++){
				$mainmenu .= $menu[$m];
			}
			$mainmenu .= $pull[$filename];
			$mainmenu .= '</ol>';
		}else if($filename=='customerlist' || $filename=='enquetelist' || $filename=='useranalyze' || $filename=='requestlist' || $filename=='mailhistory'){
			$mainmenu = '<ol class="mainmenu">';
			for($m=0; $m<count($menu)-2; $m++){
				$mainmenu .= $menu[$m];
			}
			$mainmenu .= $pull[$filename];
			$mainmenu .= $menu[++$m];
			$mainmenu .= '</ol>';
		}else if($filename=='shippinglist'|| $filename=='b2_yamato' || $filename=='customercsvlist' || $filename=='earningscsvlist' || $filename=='itemcsvlist' || $filename=='clientcsvlist' ){
			$mainmenu = '<ol class="mainmenu">';
			for($m=0; $m<count($menu)-3; $m++){
				$mainmenu .= $menu[$m];
			}
			$mainmenu .= $pull[$filename];
			$mainmenu .= $menu[++$m];
			$mainmenu .= $menu[++$m];
			$mainmenu .= '</ol>';
		}else{
			for($i=0; $i<count($panes); $i++){
				if($panes[$i]['filename']==$filename){
					$mainmenu = '<ol class="mainmenu">';
					for($m=0; $m<count($menu); $m++){
						if($i==$m){
							$mainmenu .= $curr[$m];
						}else{
							$mainmenu .= $menu[$m];
						}
					}
					$mainmenu .= '</ol>';
					break;
				}
			}
		}
	}
	
	// ���������˥塼�С�����
	if(empty($mainmenu)){
		switch($_SERVER['SCRIPT_FILENAME']){
		case _DOC_ROOT.'customerledger.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$curr2[0].$menu2[1].$menu2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'accountbook.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$curr2[0].$menu2[1].$menu2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'billschedule.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$curr2[0].$menu2[1].$menu2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'billstate.php';
			$mainmenu = '<ol class="mainmenu_admin">'.$curr2[0].$menu2[1].$menu2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'billresults.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$curr2[0].$menu2[1].$menu2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'saleslist.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$menu2[0].$menu2[1].$curr2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'saleschart.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$menu2[0].$menu2[1].$curr2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'printworklist.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$menu2[0].$menu2[1].$curr2[2].$menu2[3].$menu2[4].$menu2[5].'</ol>';
			break;
		case _DOC_ROOT.'supplierlist.php':
			$mainmenu = '<ol class="mainmenu_admin">'.$menu2[0].$menu2[1].$menu2[2].$menu2[3].$curr2[4].$menu2[5].'</ol>';
			break;
		default:
			//$mainmenu = '<ol class="mainmenu">'.$menu[0].'</ol>';
			$mainmenu = '<ol class="mainmenu"></ol>';
			break;
		}
	}
?>