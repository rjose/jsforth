$f(': PAGE-DATA-URL  ." /api/page/page2" ;');
$f('VARIABLE items');
$f('VARIABLE item-hash');
$f(': LIST-VIEW   DIV ." list-view" ADD-ID ;');
$f(': DETAIL-VIEW   DIV ." detail-view" ADD-ID ;');
$f(': list-view ." list-view" E ;');
$f(': detail-view ." detail-view" E ;');
$f(': NAME   ." name" FIELD ;');
$f(': NAMES   ` NAME MAP ;');

$f(`: ADD-STRUCTURE
         LIST-VIEW body appendChild
         DETAIL-VIEW body appendChild ;`);

$f(`: STORE-PAGE-DATA 
         AJAX-DATA ." items" FIELD  items !
         items @ HASHIFY  item-hash ! ;`);

function put_li_under(getContent) {
    var data = $f.stack.pop();
    var result = document.createElement("li");
    result.innerHTML = getContent(data);
    $f.stack.push(result);
    $f.stack.push(data);
}

$f.DefineWord("<LI-name", function() {
    put_li_under(function(data) {
	return "Name: " + data.name;
    });
});

$f.DefineWord("<LI-author", function() {
    put_li_under(function(data) {
	return "Author: " + data.author;
    });
});

$f.DefineWord("<LI-size", function() {
    put_li_under(function(data) {
	return "Size: " + data.size;
    });
});

$f(`: MAKE-DETAIL-VIEW
   [ SWAP <LI-name <LI-author <LI-size DROP ] UL APPEND-CHILDREN
   ;`);


$f(`: RENDER-DETAIL
   detail-view CLEAR
   item-hash @ SWAP FIELD
   MAKE-DETAIL-VIEW detail-view appendChild
   ;`);

$f(`: ITEM-HANDLER   EVENT TARGET ID RENDER-DETAIL ;`);

$f(': ADD-ITEM-HANDLER   click ` ITEM-HANDLER ADD-HANDLER   ;');

$f(`: LIST-ITEMS
         items @  IDs
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
