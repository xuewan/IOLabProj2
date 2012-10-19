<?php
// Start the session since phpFlickr uses it but does not start it itself
session_start();

// Require the phpFlickr API
require_once('phpFlickr-3.1/phpFlickr.php');

$allowed_ext = array('jpg','jpeg','png','gif');

if(strtolower($_SERVER['REQUEST_METHOD']) != 'post'){
	exit_status('Error! Wrong HTTP method!');
}

if(array_key_exists('pic',$_FILES) && $_FILES['pic']['error'] == 0 ){

	$pic = $_FILES['pic'];

	if(!in_array(get_extension($pic['name']),$allowed_ext)){
		exit_status('Only '.implode(',',$allowed_ext).' files are allowed!');
	}	

   // Create new phpFlickr object: new phpFlickr('[API Key]','[API Secret]')
   $flickr = new phpFlickr('6d4c83a1fdc75e8d6207dfaa25e62cb9','cb424e345a75efe5', true);
   // token: 72157631793079506-c460fe1f5fd847e8 token get from phpFlick-3.1/getToken.php for 'honesty_mail'
   $flickr->setToken("72157631793079506-c460fe1f5fd847e8");
   // write access to upload a photo
   $flickr->auth('write');
   $result = $flickr->sync_upload($pic['tmp_name'], $pic['name'], $pic['name'], 'craigslistPlus');
   // generate photo url
   $person = $flickr->people_findByUsername('honesty_mail');
   $photos = $flickr->people_getPublicPhotos($person['id'], NULL, NULL, 1);
   foreach ((array)$photos['photos']['photo'] as $photo) {
      $photo_src = $flickr->buildPhotoURL($photo, "Square");
   }
   exit_status($photo_src);
}

exit_status('Something went wrong with your upload!');

// Helper functions

function exit_status($str){
	echo json_encode(array('status'=>$str));
	exit;
}

function get_extension($file_name){
	$ext = explode('.', $file_name);
	$ext = array_pop($ext);
	return strtolower($ext);
}
?>
