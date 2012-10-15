// test if browser supports HTML5 localstorage
//alert(typeof window.localStorage == 'object');

/*localStorage structure:
key : value
listItemId : html string
*/

//listCounter is used to id an item added to the sales list
var listCounter = 0;
var fullListItem = {};

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
			//clear this part of the form so user can enter the next item
		//	$('#formPostItems :input:not(:button)').val("");
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

	var itemName = itemBrand == ""? itemType : itemBrand + " " +itemType;
		// console.log(listItemStr)
	var listItemStr = "<li id='"+ listCounter 
						+"'><button type='button' class='btn btn-mini'>X</button><strong>" 
						+itemName + "</strong> $" + itemPrice 
						+ "<span class='hide-text'>" 
						+ itemDesc + refNum + "</span></li>"
	

	
	var itemObject = {
		"type": $('#inputFurnitureType').val(),
	}
	
	//Save the #listItems in an array with the full-length descriptions
	fullListItem[listCounter] = populateDescription();
	console.log(fullListItem);
	$('#listItems').append(listItemStr);

	listCounter ++;

	removeListItem();
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
Description: Makes a preview of the posting description 
that shows:
Notes for Entire Post,
Delivery availability,
and Item Summaries
For questions, ask Morgan Wallace
****************************************/
function postToPreview(){
	//$('#previewDescription').remove();
	$("#previewDescription").html($('#postingNotes').val()); 
	$("#deliverySection").html(deliverable())
	$("#descriptionItems").empty(); //remove old list items
	$('#descriptionPreview').show();
	
	//for each item in "List of Item(s)" find the full
	//description in 'fullListItem' object by using 'id' as the key
	$("#listItems li").each(function(){
		$('#descriptionItems').append(fullListItem[($(this).attr('id'))]);
	});
}


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

/****************************************
Function: populateDescription()
Description: Create Item descriptions that will display in Craigslist
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

	return previewListing;
}

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


function clearList(){
	$('#listItems').empty();
	fullListItem = {};
};

//Furniture Type Autocomplete function
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
	respond to the event of dropping an image file
	HTML5 API

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
					"<h5 class='muted'>" + theFile.name + "</h5><i class='icon-remove'> </i>" +
					"<img class='thumb' title='" 
						+theFile.name+ "'' src='"+event.target.result+"'></li>" ;
				$('#imgList').append(image);
			};
		})(f);

		reader.readAsDataURL(f);

	}
	return false;

}


