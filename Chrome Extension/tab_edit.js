setTimeout(function() {
   $("form input:text:eq(0)").val(opt.title);
   setTimeout(function() {
      $("form input:text:eq(1)").val("1000");
      setTimeout(function() {
         $("form input:text:eq(2)").val(opt.email);
         setTimeout(function() {
            $("form input:text:eq(3)").val(opt.email);
            setTimeout(function() {
               if (opt.emailHide) {
                  $("form input:radio:eq(0)").attr("checked", true);
               }
               $("form textarea").val(opt.desc + "<img src='http://developer.chrome.com/stable/static/images/overview/arch-cs.gif'>test description");
               setTimeout(function() {
                  $("form").submit();
               }, 3000);
            }, 3000);
         }, 3000);
      }, 3000);
   }, 3000);
}, 3000);
