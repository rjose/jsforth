$f(': PAGE-DATA-URL  ." /api/page/page2" ;');
$f('VARIABLE items');
$f('VARIABLE item-hash');

$f(': LIST-VIEW   DIV ." list-view" ADD-ID ;');
$f(': DETAIL-VIEW   DIV ." detail-view" ADD-ID ;');

$f(': list-view ." list-view" E ;');
$f(': detail-view ." detail-view" E ;');

$f(`: ADD-STRUCTURE
         LIST-VIEW body appendChild
         DETAIL-VIEW body appendChild ;`);

$f(`: STORE-PAGE-DATA 
         AJAX-DATA ." items" FIELD  items !
         items @ HASHIFY  item-hash ! ;`);

$f(': NAME   ." name" FIELD ;');
$f(': NAMES   ` NAME MAP ;');

$f(': ADD-ITEM-PREFIX  ." item-" SWAP CONCAT  ;');
$f.DefineWord("DROP-PREFIX", function() {
    var item = $f.stack.pop();
    var pieces = item.split('-');
    var result = pieces[pieces.length-1];
    $f.stack.push(result);
});

$f.DefineWord("MAKE-DETAIL-VIEW", function() {
    var data = $f.stack.pop();
    var ul = document.createElement("ul");

    var li_name = document.createElement("li");
    li_name.innerHTML = "Name: " + data.name;

    var li_author = document.createElement("li");
    li_author.innerHTML = "Author: " + data.author;


    var li_size = document.createElement("li");
    li_size.innerHTML = "Size: " + data.size;

    ul.appendChild(li_name);
    ul.appendChild(li_author);
    ul.appendChild(li_size);
    $f.stack.push(ul);
});

$f(`: RENDER-DETAIL
   detail-view CLEAR
   DROP-PREFIX item-hash @ SWAP FIELD
   MAKE-DETAIL-VIEW detail-view appendChild
   ;`);

$f(`: ITEM-HANDLER   EVENT TARGET ID RENDER-DETAIL ;`);


$f(': ADD-ITEM-HANDLER   click ` ITEM-HANDLER ADD-HANDLER   ;');

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
