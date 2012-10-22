$("#sendToCraigslist").click(function(){
   // get page info as msg
   var msg = {};
   msg.title = $("#inputPostTitle").val();
   msg.email = $("#inputEmail").val();
   msg.emailHide = true;
   if ($("#radioEmailOption1").attr("checked")) {
      msg.emailHide = false;
   }
   msg.desc = $("#previewArea").html();
   console.log(msg.desc);

   // pass msg to background js
   var port = chrome.extension.connect({name: "pageInfo"});
   port.postMessage(msg);
   console.log("tab sent msg");
   console.log(msg);
})   
