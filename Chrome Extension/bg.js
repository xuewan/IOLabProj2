var msg = {};
// message listener
chrome.extension.onConnect.addListener(function(port) {
   console.assert(port.name == "pageInfo");
   port.onMessage.addListener(function(pageMsg) {
      console.log("bg received msg");
      msg = pageMsg;
      console.log(msg);
   });
   alert("triggered tab id: " + port.sender.tab.id);
   console.log(msg);

   // create tab
   chrome.tabs.create(
      {
         url: "https://post.craigslist.org/c/sfo?lang=en"
      },
      function(t) {
         chrome.tabs.executeScript(t.id, { file: "jquery-1.8.2.min.js" }, function(){
            chrome.tabs.executeScript(t.id, { file: "tab_type.js" }, function(){
               setTimeout(function() {
                  chrome.tabs.executeScript(t.id, { file: "jquery-1.8.2.min.js" }, function(){
                     chrome.tabs.executeScript(t.id, { file: "tab_cat.js" }, function(){
                        setTimeout(function() {
                           chrome.tabs.executeScript(t.id, { file: "jquery-1.8.2.min.js" }, function(){
                              chrome.tabs.executeScript(t.id, { file: "tab_subarea.js" }, function(){
                                 setTimeout(function() {
                                    chrome.tabs.executeScript(t.id, { file: "jquery-1.8.2.min.js" }, function(){
                                       chrome.tabs.executeScript(t.id, { file: "tab_hood.js" }, function(){
                                          setTimeout(function() {
                                             chrome.tabs.executeScript(t.id, { file: "jquery-1.8.2.min.js" }, function(){
                                                // pass msg to tab_edit.js to fill in those info
                                                chrome.tabs.executeScript(t.id, { code: "var opt = " + JSON.stringify(msg) + ";" }, function(){
                                                   chrome.tabs.executeScript(t.id, { file: "tab_edit.js" }, function(){
                                                      setTimeout(function() {
                                                         chrome.tabs.executeScript(t.id, { file: "jquery-1.8.2.min.js" }, function(){
                                                            chrome.tabs.executeScript(t.id, { file: "tab_editimage.js" }, function(){
                                                            });
                                                         });
                                                      }, 20000);
                                                   });
                                                });
                                             });
                                          }, 7000);
                                       });
                                    });
                                 }, 7000);
                              });
                           });
                        }, 7000);
                     });
                  });
               }, 7000);
            });
         });
      }
   );
});
