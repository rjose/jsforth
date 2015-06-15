$f(`
   VARIABLE documents

   : howdy-ctrl
       ." howdy" E ;

   : GREET
       ." Hello!" LOG ;

   : PAGE-DATA-URL
       ." /api/page/sample1" ;

   : DOCS
       ." docs" FIELD ;

   : STORE-PAGE-DATA
       AJAX-DATA DOCS documents ! ;

   : RENDER-DOCLIST
       ." TODO: Implement this" LOG . ;
   
   : RENDER-PAGE-DATA
       STORE-PAGE-DATA
       documents @ RENDER-DOCLIST ;

   : RENDER-PAGE
       howdy-ctrl click \` GREET   addEventListener
       PAGE-DATA-URL \` RENDER-PAGE-DATA  \` SHOW-AJAX-ERROR   HGET  ;

   document DOMContentLoaded \` RENDER-PAGE addEventListener
   `);
