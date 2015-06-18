$f(': PAGE-DATA-URL  ." /api/page/page2" ;');
$f('VARIABLE items');
$f('VARIABLE item-hash');

$f(': LIST-VIEW   DIV ." list-view" ADD-ID ;');
$f(`: DETAIL-VIEW   DIV ." detail-view" ADD-ID ;`);

$f(': list-view ." list-view" E ;');

$f(`: ADD-STRUCTURE
         LIST-VIEW body appendChild
         DETAIL-VIEW body appendChild ;`);

$f(`: STORE-PAGE-DATA 
         AJAX-DATA ." items" FIELD  items !
         items @ HASHIFY item-hash ! ;`);

$f(': NAME ." name" FIELD ;');
$f(': NAMES ` NAME MAP ;');

$f(': ADD-ITEM-PREFIX  ." item-" SWAP CONCAT  ;');

$f.DefineWord("ITEM-HANDLER", function() {
    console.log("TODO: Implement ITEM-HANDLER", $f.event);
});

$f.DefineWord("ADD-ITEM-HANDLER", function() {
    var element = $f.stack.pop();
    $f.stack.push(element); $f('click ` ITEM-HANDLER addEventListener');
    $f.stack.push(element);
});

$f(`: LIST-ITEMS
         items @  IDs  \` ADD-ITEM-PREFIX MAP
         items @  NAMES LIs
         ZIP-IDS
         \` ADD-ITEM-HANDLER MAP ;`);

$f(`: RENDER-LIST-VIEW
         list-view CLEAR
         LIST-ITEMS OL APPEND-CHILDREN
         list-view appendChild ;`);

$f(`: APPLY-PAGE-DATA
         STORE-PAGE-DATA
         RENDER-LIST-VIEW ;`);

$f(`: ADD-CONTENT
   PAGE-DATA-URL \` APPLY-PAGE-DATA \` SHOW-AJAX-ERROR HGET ;`);

$f(`: CONSTRUCT-PAGE
         ADD-STRUCTURE
         ADD-CONTENT ;`);

$f('document DOMContentLoaded ` CONSTRUCT-PAGE  addEventListener');
