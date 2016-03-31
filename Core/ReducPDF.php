<?php
	function compressPdf($in, $to) {
		exec('/usr/bin/pdfinfo "'.$in.'" | /usr/bin/grep Pages | /usr/bin/sed "s/[^0-9]//g"', $output);
		$pages = intval($output[0]);
		
		$tnb = min(10, $pages);
		$id = preg_replace("/[\s\.]/","",microtime());
		exec('/usr/bin/gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dFirstPage=1 -dLastPage='.$tnb.' -dNOPAUSE -dQUIET -dBATCH -sOutputFile="/srv/http/tmp/'.$id.'" "'.$in.'"');

		$size = filesize("/srv/http/tmp/".$id);
		$nb = intval((1024*1024*5)/($size/$tnb));
		exec('/usr/bin/rm /srv/http/tmp/'.$id);
		exec('/usr/bin/gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dFirstPage=1 -dLastPage='.$nb.' -dNOPAUSE -dQUIET -dBATCH -sOutputFile="'.$to.'" "'.$in.'"');
		return file_exists($to);
	}

	function pdfThumbnail($in, $to) {
		exec('/usr/bin/gs -q -o "'.$to.'" -dFirstPage=1 -dLastPage=1 -r72 -dJPEGQ=100 -sDEVICE=jpeg "'.$in.'"');
		return file_exists($to);
	}

	//compressPdf($argv[1], "/srv/http/dd.pdf");
?>
