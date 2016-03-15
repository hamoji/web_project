<?php
$client = new SoapClient( 'https://torcache.net/torcache.wsdl' );
$infoHash = $client->cacheTorrent( base64_encode( file_get_contents( 'my.torrent' ) ) );
$files = array(
	array(
	        'name' => 'torrent',			// Don't change
	        'type' => 'application/x-bittorrent',
	        'file' => 'my.torrent'			// Full path for file to upload
	        )
	);

$http_resp = http_post_fields( 'https://torcache.net/autoupload.php', array(), $files );
$tmp = explode( "\r\n", $http_resp );
$infoHash = substr( $tmp[count( $tmp ) - 1], 0, 40 );
unset( $tmp, $http_resp, $files );
?>