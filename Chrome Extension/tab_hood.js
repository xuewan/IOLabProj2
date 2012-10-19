setTimeout(function() {
   $("form input:radio[value='48']").prop('checked', true).parent().css("background-color", "#FFFF66");
   setTimeout(function() {
      $("form").submit();
   }, 3000);
}, 3000);
