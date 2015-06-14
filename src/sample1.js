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

// TODO: Consider making the current event global
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

$f.DefineWord("PAGE-APIURL", function() {
    $f.stack.push("/api/page/sample1");
    return 0;
});


$f.DefineWord("HGET", function() {
    $f.ajax_response = {};                                  // Clear ajax response
    var url = $f.stack.pop();
    
    $f.Tick();                                              // Read success handler
    var handleSuccess = $f.stack.pop();

    $f.Tick();                                              // Read failure handler
    var handleFailure = $f.stack.pop();

    function onload () {
	$f.ajax_response = this;                            // Set ajax response
	if (this.status < 400) {
	    $f(handleSuccess);
	}
	else {
	    $f(handleFailure);
	}
    }

    // Make API call
    var xhr = new XMLHttpRequest();
    xhr.onload = onload;
    xhr.open("get", url);
    xhr.send();
    return 0;
});


$f.DefineWord("S", function() {
    console.log("Success", $f.ajax_response);
    return 0;
});

$f.DefineWord("F", function() {
    console.log("Failure", $f.ajax_response);
    return 0;
});


// Add event handlers
$f("document DOMContentLoaded addEventListener RENDER-PAGE");

