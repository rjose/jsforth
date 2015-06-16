$f(': PAGE-DATA-URL  ." /api/page/sample1" ;');   // Pushes page data API url onto stack
$f(': DOCS  ." docs" FIELD ;');                   // Replaces top of stack with its "docs" field
$f(': howdy-ctrl  ." howdy" E ;');                // The 'howdy' element is a control we can click
$f(': doclist  ." doclist" E ;');                 // The 'doclist' element is a list of documents
$f(': GREET  ." Hello!" LOG ;');                  // Prints a message to the console
$f(`VARIABLE documents`);                         // Holds documents data

// Stores data from page data call into variables
$f(`: STORE-PAGE-DATA
       AJAX-DATA DOCS documents ! ;`);

// Wraps item in an li and appends to doclist
$f(`: ADD-DOC
       LI doclist appendChild ;`);

// Renders |documents| into doclist
$f(`: RENDER-DOCLIST
       documents @  \` ADD-DOC MAP ;`);

// Connects controls to their handlers
$f(`: HOOK-UP-CONTROLS
       howdy-ctrl click \` GREET addEventListener ;`);

// Handler for page data API call
$f(`: RENDER-PAGE-DATA
        STORE-PAGE-DATA
        documents @ RENDER-DOCLIST
        HOOK-UP-CONTROLS ;`);

// Makes ajax call to get page data
$f(`: GET-PAGE-DATA
        PAGE-DATA-URL \` RENDER-PAGE-DATA  \` SHOW-AJAX-ERROR   HGET  ;`);

// Execute RENDER-PAGE when page is loaded
$f('document DOMContentLoaded ` GET-PAGE-DATA addEventListener');
