// test if browser supports HTML5 localstorage
//alert(typeof window.localStorage == 'object');

/*localStorage structure:
key : value
listItemId : html string
*/

//listCounter is used to id an item added to the sales list
var listCounter = 0;
var fullListItem = {};
var imgWidth = 120;

//Golbal variable for the price to be posted
// if only one item, price is the item price
// if more than one item, price is the cheapest price among all items
var postingPrice = -1;

$(document).ready( function(){

	$('#sendToCraigslist').attr('disabled', "disabled");

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
		postToPreview();
	});
	
	$('#btnClear').click(function() {
		clearList();
	});

	$('#btnClearPreview').click(function() {
		$('#descriptionItems').empty();
		$('#deliverySection').empty();
		$('#sendToCraigslist').attr('disabled', "disabled");
		$("#btnClearPreview").hide();
		$('#descriptionPreview').hide();
		$("#pictureSizing").hide();
		//WX: reset the posting price back to -1
		postingPrice = -1;
		console.log("reset postingPrice back to -1" + postingPrice);
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

	$("#imgDropZone").filedrop({
	   paramname:'pic',
	   maxfiles: 5,
	   maxfilesize: 2, // in mb
	   url: 'upload.php',
	   uploadFinished:function(i,file,response){
	      //$.data(file).addClass('done');
	      // response is the JSON object that post_file.php returns
	      console.log(response);
	      alert(response.status);
	    }
	});

	$('#imgDropZone').bind("drop", function(event){
		handleFileSelect(event);
	});

	$('#imgDropZone li').draggable();

	//MW: Image resizing
	$("#imgSizer").keyup(function(){
		resizeImages($(this).val());
	})

	$('#plusSize').click(function(){
		newSize = parseInt($("#imgSizer").val())+10;
		$("#imgSizer").val(newSize);
		resizeImages(newSize);
	})

	$('#minusSize').click(function(){
		newSize = parseInt($("#imgSizer").val())-10;
		$("#imgSizer").val(newSize);
		resizeImages(newSize);
	})//end Image Resizing

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


	var itemName = itemBrand == ""? itemType : itemBrand + " " +itemType;

	var listItemStr = "<li id='"+ listCounter 
						+"' price='"+itemPrice +"'><button type='button' class='btn btn-mini'>X</button><strong>" 
						+itemName + "</strong> $" + itemPrice 
						+ " (" + numImgs + " images)"
						+ "<span class='hide-text'>" 
						+ itemDesc + "</span></li>"
		console.log(listItemStr);
	var itemObject = {
		"type": $('#inputFurnitureType').val(),
	}
	
	//Save the #listItems in an array with the full-length descriptions
	fullListItem[listCounter] = populateDescription();
	//console.log(fullListItem);
	$('#listItems').append(listItemStr);

	//WX: add the item id to each of its images
	/*MW: I moved this functionality to 'handleFileSelect' to simplify
	$('#imgList li').each(function(){
		var image = $(this).find('img');
		var imgDomEL = image[0];
		//$(imgDomEL).attr("itemid","item"+listCounter);
		//console.log(imgDomEL);
	});
	*/

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

/*MW: ***********************************
Function: postToPreview()
Description: 
	Makes a preview of the posting description that shows:
		- Notes for Entire Post,
		- Delivery availability,
		- and Item Summaries
****************************************/
function postToPreview(){
	$("#previewDescription").html($('#postingNotes').val()); 
	$("#deliverySection").html(deliverable())
	$("#descriptionItems").empty(); //remove old list items
	$('#descriptionPreview').show();
	$("#pictureSizing").show();
	$("#btnClearPreview").show();
	$('#sendToCraigslist').attr('disabled', false);
	
	//for each item in "List of Item(s)" find the full
	//description in 'fullListItem' object by using 'id' as the key
	
	var counter = 0;
	$("#listItems li").each(function(){
		$('#descriptionItems').append(fullListItem[($(this).attr('id'))]);
		counter ++;
	});

	//WX: added the following line to get the posting price of the entire post
	if(counter == 1){
		postingPrice = $('#listItems li').attr('price');
		//console.log("postingPrice is now " + postingPrice);
		//console.log(counter);
	}
}


/****************************************
Function: removeListItem()
Description:
	remove an item from the list

****************************************/
function removeListItem(){

	//bind button click event to the delete button on the list items
	$('#listItems button').on("click", function(){	
		var itemId = $(this).parent().attr("id");
		console.log(itemId);
		$(this).parent().remove();
		
		if(listCounter>0){
			listCounter--;
		}
	
		console.log(listCounter);
		//WX: remove the images associated with the item as well

		$("#galleryImgs > li > img[itemId='item"+itemId+"']").remove();
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
	
	$('#listItems').each(function(){
		thisItem = $(this).html();
		items.push(thisItem);
	});

	//convert the array of items to JSON string
	localStorage['saleList'] = JSON.stringify(items);
	localStorage['savedDescription'] = JSON.stringify(fullListItem);
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
			$('#listItems').append(items[index]);
		});
	}

	//load data back into 'fullListItem' object for use in postToPreview()
	if(localStorage['savedDescription']){
		fullListItem = JSON.parse(localStorage['savedDescription']);
		
		//update listCounter with accurate number of 
		$('#listItems li').each(function(){
			listCounter++;
		});

	}

}

/*MW: ***************************************
Function: populateDescription()
Description: 
	Create Item descriptions that will display in Craigslist
****************************************/


function populateDescription(){
	$("#imgSizer").show();
	var negotiable = ""	;
	if ($('#chkNegotiable').is(':checked')) {
		negotiable = " - price is negotiable"
	}

	var condition = "";
	if ($('#inputCondition').val() !== "") {
		condition = $('#inputCondition').val() + " condition. "
	}

	var description = "";	
	if ($('#inputDesc').val() !== "") {
		description = "Description: " + $('#inputDesc').val()
	};

	
	//width
	var w = '';
	if ($('#inputWidth').val() !== "") {
		w = "W: " + $("#inputWidth").val() + $("#selectUnit").val();
	}

	//height
	var h = '';
	if ($('#inputHeight').val() !== "") {
		h = ', H: ' + $("#inputHeight").val() + $("#selectUnit").val();
	};

	//depth
	var d = '';
	if ($('#inputDepth').val() !== "") {
		d = ', D: ' + $("#inputDepth").val() + $("#selectUnit").val();
	};
	
	//if input exists for 'Width' 'Height' or 'Depth' then populate
	var dimentions = '';
	if ($('#inputWidth').val() + $('#inputWidth').val() + $('#inputWidth').val() !=='') {
	dimentions = "("+ w + h + d + ")";	
	};
	
	//Create all the image tags for the preview. 
	//...Argument is width(px); height adjusts using aspect ratio


	var imageSource = appendImages(imgWidth);

	//This variable (previewListing) populates into the posting Description
	var previewListing = "<li>" 
	+ imageSource
	+ $('#inputBrand').val() + " " 
	+ $('#inputModel').val() + " " 
	+ $('#inputFurnitureType').val() 
	+ " ($" + $('#inputPrice').val() + negotiable+ "). " 
	+ condition
	+ dimentions
	+ description + "</li";

	return previewListing;
}

/*MW: ###############
Function: appendImages
Description:
	Returns image tag(s) 
###################*/
function appendImages(w){
	var imageArray = [];
	var aspectRatio = 1;
	console.log(imgWidth);
	//make image tag for each uploaded image
	$("#imgList li").each(function(){
		aspectRatio = $(this).find('img').width() / $(this).find('img').height();
		imageArray.push("<img class='thumbPreview' "//add class
			+"style='margin-bottom: 2px; width: " + w + "px; height: " + (w/aspectRatio) + "px;' "//add style
			+"src='" + $(this).find('img').attr('src') //get location of image
			+ "'> ");		
	})
	return imageArray.join(" ");
}

/*MW: ##################
Function: deliverable
Description: 
	return a string that says if the items are deliverable
	...and if they have a fee
######################*/
function deliverable(){
	var delivDisplay =''
	if ($('#chkDelivery').is(':checked')){
			if ($('#inputDeliveryFee').val()) {
				delivDisplay='Delivery is available for $' + $('#inputDeliveryFee').val()
			}
			else delivDisplay='Delivery is available';
	}
	else delivDisplay='Delivery not available';
	return delivDisplay;
}

/*MW: ###############
Function: clearList
Description: 
	empty list items sidebar
###################*/
function clearList(){
	$('#listItems').empty();
	fullListItem = {};

	$('#galleryImgs').empty();
	listCounter = 0;

	postingPrice = -1;
	console.log("postingPrice is back to "+ postingPrice);
};

/*MW: ###############
Function: autocomplete 
Description: 
	Simplify data entry for Furniture Type field
###################*/
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
			'TV',
			'Couch'
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
					"<img class='thumb' itemid='item" + listCounter + "' title='" 
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

function resizeImages(w){
	var newWidth = w;
		//console.log(newWidth);
		if (newWidth>9 && newWidth<500) {
			imgWidth = newWidth;
			console.log(imgWidth);
			$(".thumbPreview").each(function(i){
				//console.log($(this).width());
				$(this).height(newWidth / ($(this).width() / $(this).height()));
				$(this).width(newWidth);		
			});
		};
}

