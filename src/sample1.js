$f.DefineWord("-", function() {
    var r = $f.stack.pop();
    var l = $f.stack.pop();
    var difference = l - r;
    $f.stack.push(difference);
    return 0;
});

$f.DefineWord("+", function() {
    var r = $f.stack.pop();
    var l = $f.stack.pop();
    var sum = l + r;
    $f.stack.push(sum);
    return 0;
});


$f.DefineWord("howdy", function() {
    var element = document.getElementById('howdy');
    $f.stack.push(element);
    return 0;
});

$f.DefineWord("GREET", function() {
    var event = $f.stack.pop();                             // Event handlers must pop event
    console.log("Hello!", event);
    return 0;
});

$f.DefineWord("RENDER-PAGE", function() {
    var event = $f.stack.pop();                             // Event handlers must pop event
    $f("howdy click addEventListener GREET");
    return 0;
});

// Add event handlers
$f("document DOMContentLoaded addEventListener RENDER-PAGE");

