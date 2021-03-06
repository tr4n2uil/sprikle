<?php 
/**
 *	Sample Project URLs
 *
 *	Vibhaj Rajan <vibhaj8@gmail.com>
 *
 *	Licenced under MIT Licence 
 *	http://www.opensource.org/licenses/mit-license.php
 *
**/
	require_once( PR_ROOT. 'auth/models.php' );
	require_once( PR_ROOT. 'auth/session.php' );
	require_once( PR_ROOT. 'fsdb.php' );

	$URLS = array(
		'/^(apps|core|lib|tmp)/i' => array( 'tpl/test.php' ),

		// auth views
		'/^auth$/i' => array( PR_ROOT. 'auth/endpoint.php' ),
		'/^login\/?(?P<provider>[\w\-]+)?$/i' => array( PR_ROOT. 'auth/login.php' ),
		'/^logout$/i' => array( PR_ROOT. 'auth/logout.php' ),

		// auth api
		'/^v1\/user\/?(?P<id>[\d]+)?$/i' => array( PR_ROOT. 'rest.php', array( 'model' => 'User' )),
		'/^v1\/session\/?(?P<id>[\w\.]+)?$/i' => array( PR_ROOT. 'rest.php', array( 'model' => 'Session' )),

		// jsondb api
		'/^v1\/data\/?(?P<id>[\w\-\.]+)?$/i' => array( PR_ROOT. 'rest.php', array( 'model' => 'Map' )),

		// file views
		'/^embed$/i' => array( PR_ROOT. 'embed.php' ),

		// include views
		'/^(?P<path>[\w\-\/]*)$/i' => array( PR_ROOT. 'include.php', array( 'root' => ROOT. 'tpl/',  ) ),
	);

?>
