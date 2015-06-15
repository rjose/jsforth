$f.DefineWord("-", function() {
    var r = $f.stack.pop();
    var l = $f.stack.pop();
    var difference = l - r;
    $f.stack.push(difference);
});

$f.DefineWord("+", function() {
    var r = $f.stack.pop();
    var l = $f.stack.pop();
    var sum = l + r;
    $f.stack.push(sum);
});


$f.DefineWord("howdy", function() {
    var element = document.getElementById('howdy');
    $f.stack.push(element);
});

$f.DefineWord("GREET", function() {
    console.log("Hello!", $f.event);
});


$f.DefineWord("RENDER-PAGE", function() {
    $f("howdy click addEventListener GREET");
});

$f.DefineWord("PAGE-APIURL", function() {
    $f.stack.push("/api/page/sample1");
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
});


$f.DefineWord("S", function() {
    console.log("Success", $f.ajax_response);
});

$f.DefineWord("F", function() {
    console.log("Failure", $f.ajax_response);
});


// Add event handlers
$f("document DOMContentLoaded addEventListener RENDER-PAGE");

