// test if browser supports HTML5 localstorage
//alert(typeof window.localStorage == 'object');

/*localStorage structure:
key : value
listItemId : html string
*/

//listCounter is used to id an item added to the sales list
var listCounter = 0;


$(document).ready( function(){

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
		postToCraigslist();
	});

	
	//make items in the list sortable
	$('#listItems').sortable();

	$(window).bind('unload', function(){
		saveToStorage();
	});

	loadFromStorage();

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

	var listItemStr = "<li id='"+ listCounter 
						+"'><button type='button' class='btn btn-mini'>X</button><strong>" 
						+itemName + "</strong> $" + itemPrice 
						+ "<span class='hide-text'>" 
						+ itemDesc + "</span></li>"

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
Description:
	construct the content of the posting and post to the Craigslist

****************************************/
function postToCraigslist(){

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