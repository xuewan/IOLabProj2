// test if browser supports HTML5 localstorage
//alert(typeof window.localStorage == 'object');

/*localStorage structure:
key : value
listItemId : html string
*/

//listCounter is used to id an item added to the sales list
var listCounter = 0;


$(document).ready( function(){

	autocomplete();
	$('#descriptionPreview').hide()

	//Toggle the Delivery Fee input box
	//Delivery Fee is hidden by default. Only show if user checks off delivery option
	$('#divDeliveryFee').hide();

	//hide error msg section by default
	$('#divErrorMsg').hide();

	//dismiss the err message box if error has been acknowledged
	$('#btnDismiss').click(function(){
		$('#divErrorMsg').hide();
	});

	$('#chkDelivery').change(function (){
		if($('#chkDelivery').is(':checked')){
			$('#divDeliveryFee').show();
		}
		else{
			$('#divDeliveryFee').hide();
		}
	}); //end chkDelivery change

	//when user clicks Add Item button, append the item to the list
	$('#btnAdd').click(function (){

		var errMsg = validateInputs();
		if(errMsg == ""){
			appendToItemList();
		}
	});

	$('#btnPost').click(function() {
		postToCraigslist();
	});
	
	$('#btnClear').click(function() {
		clearList();
	});

	$('#btnClearPreview').click(function() {
		$('#descriptionItems').empty();
	});
	
	//make items in the list sortable
	$('#listItems').sortable();

	$(window).bind('unload', function(){
		saveToStorage();
	});

	loadFromStorage();
	
	//bind button clicking on deleting list items
	removeListItem();

	//bind spell checking event
	$(':input[spellcheck=true]').spellcheck();
	$('#inputDesc').spellcheck({ events: 'keyup' });

	//check for HTML5 File API support
	if(window.File && window.FileReader && window.FileList && window.Blob){
		console.log("HTML5 filereader works");
	}
	else{
		console.log("File API is not fully supported in this browser");
	}

	$('#imgDropZone').bind("drop", function(event){
		handleFileSelect(event);
	});

	$('#imgDropZone li').draggable();

	return false;
		
});

/****************************************
Function: appendToItemList()
Description:
	Append an item to the list of items for sales

****************************************/
function appendToItemList(){
	//construct a list element
	var itemDesc = "";
	var itemType = "";
	var itemBrand = "";
	var itemPrice = "";

	$('#formPostItems :input:not(:button)').each(function(index) {
		 fieldId = $(this).attr('id');
		 fieldLabel = $('label[for='+fieldId +']').text(); 
		 fieldVal = $(this).val();

		 if(fieldId == "inputFurnitureType"){
		 	itemType = fieldVal;
		 }
		 else if(fieldId == "inputBrand"){
		 	itemBrand = fieldVal.toUpperCase();
		 }
		 else if(fieldId == "inputPrice"){
		 	itemPrice = fieldVal;
		 }
		 else{
		 	itemDesc = itemDesc + fieldLabel + ": " + fieldVal + ";";
		 }
			
	});

	//WX: added following line to calculate number of images for this item
	var numImgs = $('#imgList li').length;
	//console.log(numImgs);


	//Show full length item descriptions
	refNum=populateDescription();

	var itemName = itemBrand == ""? itemType : itemBrand + " " +itemType;
		// console.log(listItemStr)
	var listItemStr = "<li id='"+ listCounter 
						+"'><button type='button' class='btn btn-mini'>X</button><strong>" 
						+itemName + "</strong> $" + itemPrice 
						+ " (" + numImgs + " images)"
						+ "<span class='hide-text'>" 
						+ itemDesc + refNum + "</span></li>"
	var itemObject = {
		"type": $('#inputFurnitureType').val(),
	}
	//console.log(listItemStr);
	$('#listItems').append(listItemStr);

	listCounter ++;

	//WX: bind delete item from list action to button clicking
	removeListItem();

	//WX: move item images to gallery
	moveImagesToGallery();
	
	//WX: rest the item form after item is added to the list on the right
	clearForNextItem();
}

/****************************************
Function: validateInputs()
Description:
	Validate whether the required inputs are provided for an item

****************************************/
function validateInputs(){
	
	var errMsg = "";
	var furnitureTypeErr = false;
	
	//If price is not set, default to 0.00
	if($('#inputPrice').val() == ""){
		    $('#inputPrice').val($('#inputPrice').attr('placeholder'));
		}

	//if furniture type is blank, display error message
	if($('#inputFurnitureType').val() == ""){
		$('#divFurnitureType').addClass("error");
		furnitureTypeErr=true;
	}

	if(furnitureTypeErr){
		errMsg = "Furniture Type is required."
		//expose the err msg
	$('#divErrorMsg span').html(errMsg);
	$('#divErrorMsg').show();
	}

	return errMsg;
}

/****************************************
Function: postToCraigslist()
Description:
	construct the content of the posting and post to the Craigslist

****************************************/
function postToCraigslist(){
	$('#descriptionPreview').show();
	$('#listItems').each(function(){
		$('#descriptionItems').append(this);
	});

/* Old Code  #######
	//header of the post
	var postTitle = $('#inputPostTitle').val();
	var email = $('#inputEmail').val();
	var emailAgain = $('#inputEmailAgain').val();
	var emailDisplayOption = $(':input[name=radioEmailOptions]:checked').val();

	var delivery = $('chkDelivery').val();
	var deliveryFed = "";
	
	var msg = "";

	if($('chkDelivery').is(':checked'))
		 deliveryFee = $('inputDeliveryFee').val() == ""? "0" : $('inputDeliveryFee').val();

	//details of individual items
	#######*/
};

/****************************************
Function: removeListItem()
Description:
	remove an item from the list

****************************************/
function removeListItem(){

	//bind button click event to the delete button on the list items
	$('#listItems button').on("click", function(){	
		$(this).parent().remove();
	}); 
}
/****************************************
Function: saveToStorage()
Description:
	save the items for sales to browser's local storage

****************************************/
function saveToStorage(){
	var items = [];
	var thisItem;

	//localStorage['test']="test";

	$('#listItems li').each(function(){
		thisItem = $(this).html();
		items.push(thisItem);
	});

	//convert the array of items to JSON string
	localStorage['saleList'] = JSON.stringify(items);

}

/****************************************
Function: loadFromStorage()
Description:
	load items for sales from browser's local storage

****************************************/
function loadFromStorage(){
	var items;

//	alert(localStorage['test']);
	if(localStorage['saleList']){
		items = JSON.parse(localStorage['saleList']);

		$(items).each(function(index){
			//alert(items[index]);
			$('#listItems').append("<li>"+items[index] + "</li>");
		});
	}
}

/****************************************
Function: populateDescription()
Description:
	make the description preview

****************************************/
//global object to save all the description line items
var itemDescriptions = new Array()
var refNum = 0;

function populateDescription(){

	//On the condition that negotiable is checked add to price section
	
	var negotiable = ""	;
	if ($('#chkNegotiable').is(':checked')) {
		negotiable = " - price is negotiable"
	};


	var condition = ""	
	if ($('#inputCondition').val() != "") {
		condition = $('#inputCondition').val() + " condition."
	};

	var description = ""	
	if ($('#inputDesc').val() != "") {
		description = "Description: " + $('#inputDesc').val()
	};

	//This variable (previewListing) populates into the posting Description
	var previewListing = "<li>" 
	+ $('#inputBrand').val() + " " 
	+ $('#inputModel').val() + " " 
	+ $('#inputFurnitureType').val() 
	+ " ($" + $('#inputPrice').val() + negotiable+ ") " 
	+ condition
	+ description + "</li";
	
	
	itemDescriptions.push(previewListing)
	return itemDescriptions.length-1;
	
	

	//put in preview div
	//$('#descriptionPreview').show();
	//$('#descriptionItems').append(previewListing);
}



function clearList(){
	$('#listItems').empty();
	$('#galleryImgs').empty();
};

function autocomplete(){
	//Pulled list from ebay  (http://pages.ebay.com/furniture/)
	var availableTags = [
			'Fireplace Accessory', 
			'Foot stool', 
			'Futon', 
			'Occasional table', 
			'Recliner', 
			'Sofa', 
			'Loveseat',  
			'Lamp', 
			'Mirror', 
			'Armoire', 
			'Coat/hat rack', 
			'Curio cabinet', 
			'Rocking chair', 
			'Trunk', 
			'Bar stool', 
			'Buffet, sideboard', 
			'China cabinet', 
			'Storage',
			'Display', 
			'Table', 
			'Chair', 
			'Wine rack', 
			'Bed', 
			'Mattress', 
			'Dresser', 
			'Guest sleeper', 
			'Night stand', 
			'Vanity', 
			'Desk', 
			'High chair', 
			'Toy box', 
			'Bench', 
			'Swings', 
			'Slide', 
			'Umbrella', 
			'Bookcase', 
			'Office lamp', 
			'Home audio/theater', 
			'Jukebox', 
			'Pinball machine', 
			'TV'
		];
	$( "#inputFurnitureType" ).autocomplete({
		source: availableTags
	});
};

/****************************************
Function: handleFileSelect()
Description:
	respond to the event of dropping an image file into the dropbox area
	use HTML5 File API and JQuery FileDrop API
	Render dropped image into thumbnail and display underneather the dropbox area
****************************************/
function handleFileSelect(event){
	event.stopPropagation();
	event.preventDefault();

	var file = event.dataTransfer.files; //get the FileList object

	var output = [];
	for (var i=0,f; f=file[i]; i++){
		//process iamge files
		if(!f.type.match('image.*')){
			continue; //skip any file that is not an image
		}

		var reader = new  FileReader();
		reader.onload = (function(theFile){
			return function(event){

				var image = "<li>" +
					"<h5 class='muted'>" + theFile.name + " <i class='icon-remove'></i></h5>" +
					"<img class='thumb' title='" 
						+theFile.name+ "'' src='"+event.target.result+"'></li>" ;
				$('#imgList').append(image);

				//bind the click event to delete image
				bindDeleteImage();
			};
		})(f);

		reader.readAsDataURL(f);

		
	}
	return false;
}

/****************************************
Function: deleteImage()
Description:
	Delete an image when user clicks on the delete icon next to the image thumbnail

****************************************/
function bindDeleteImage(){
	$('#imgList i').on("click", function(){
		$(this).parents('li').remove();
	});
}

/****************************************
Function: moveImagesToGallery()
Description:
	When user add an item to the sales list, move the images of the item to the gallery

****************************************/
function moveImagesToGallery(){
		
		$('#imgList li').each(function(){
		
			var image = $(this).find('img');
			var imgDomEL= image[0];
			var li = $('<li></li>').append(imgDomEL);
			//console.log(str);
			$('#galleryImgs').append(li);
			$(this).remove();
		});
}

/****************************************
Function: clearForNextItem()
Description:
	clear the input fields for the item form in order to enter data for the next item
	move all images of the current item to gallery
****************************************/
function clearForNextItem(){
	$('#formPostItems :input:not(:button, :checkbox)').val("");
}
