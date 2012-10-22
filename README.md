Project title
Craigslist Plus

Team member names
Wendy Xue, Morgan Wallace, Jiun-Tang Huang

Team member responsibilities (i.e. what each person did on the project)
Wendy: 
- Front end UI design and HTML
- Spellcheck plug-in functionality
- Drag & Drop images from desktop using HTML5 File API
- Post item into sales list

Morgan
- Autocomplete function for form input fields
- Construct the preview HTML by aggregating multiple item descriptions
- Embed image files into preview
- Modify image size in preview

Jiun-Tang
- Chrome extension to automate posting on Craigslist
- Flicker API to upload images into Flicker and retrieve an URL to be used in the preview

Project description 
The project creates a structured form using controlled vocabulary to allow a user to post advertisement for selling furniture on Craigslist. 
The user will enter descriptions of the sales items using the form instead of using the free form text field directly on Craigslist. The user must provide the description of the sales item following the form format. The format of the entire ad is also formatted automatically for the user before posting to Craigslist. 
After the form is completed, the Chrome Extension will take the data and automatically post the ad onto Craigslist. 

The project aims to address two issues identified by Cory Doctorow's "Metacrap" essay
1. People are lazy
2. People are stupid

People are lazy: 
We created a separate UI for posting furniture ad that we believe is easier to use. The input fields on the UI are designed so that they direct people to provide accurate data that are relevant for describing furniture items. 
We added autocompelete function to the form input fields so that user can choose from predefined terms. User can also drag and drop images to be added from their desktop. The ad is formatted automatically so that user doesn't have to worry about the formatting. 
The meta data is constructed and controlled for the user. 

People are stupid
We utilized a Spellcheck plug-in to check the spelling mistakes in attempt to reduce the amount of metacarpi created by the people


Technologies used in the project: HTML, CSS, Javascript, Jquery, Jquery UI, PHP, JSON, AJAX, Chrome Extension.

URL of Repo on GitHub: https://github.com/xuewan/IOLabProj2

Live URL of where it's hosted: http://people.ischool.berkeley.edu/~wendy.xue/IOLabProj2/postingForm.html

Browser support: Chrome only because we use Chrome extensions

Any bugs/quirks we should be aware of: 
 - Our functionality is limited to Furniture posts in Berkeley
 - Spell check and Chrome Extension functionality only runs when run from our server where a spell check PHP program is running