var $f = (function createInterpreter() {
    var M_input = "";                   // Input string to parse
    var M_input_index = 0;              // Cur pos in string
    var M_tib = "";                     // Text input buffer
    var M_tib_index = 0;                // Cur pos in string
    var M_dictionary = {};              // Entries we can execute
    var M_stack = [];                   // Main stack
    var M_rstack = [];                  // Return stack

    var MAX_ITERATIONS = 1000;          // At most this many words in a string

    //----------------------------------------------------------------------
    // Reads next word from string
    //----------------------------------------------------------------------
    function read_word() {
	M_tib = "";                     // Clear tib
	
	// Skip whitespace
	while(M_input_index < M_input.length) {
	    var ch = M_input[M_input_index];
	    if (ch == " " || ch == "\t" || ch == "\n") {
		M_input_index++;
	    }
	    else {
		break;
	    }
	}

	// Read chars up to whitespace
	while(M_input_index < M_input.length) {
	    // Read chars
	    var ch = M_input[M_input_index];
	    if (ch == " " || ch == "\t" || ch == "\n") {
		M_input_index++;
		break;
	    }
	    else {
		M_tib += ch;
		M_input_index++;
	    }
	}
    }

    //----------------------------------------------------------------------
    // Converts M_tib into an object that can be pushed onto the stack
    //
    // Objects on the forth stack have the following fields:
    //   * type: "LITERAL" or "WORD"
    //   * value: The value of the object
    //----------------------------------------------------------------------
    function tick() {
	if (M_tib == "") {              // If EOS, nothing to do
	    return;
	}

	var entry_function = M_dictionary[M_tib];
	if (entry_function) {
	    M_stack.push({type: "WORD", value: entry_function})
	}
	else {
	    M_stack.push({type: "LITERAL", value: M_tib});
	}
    }

    // Define builtin words

    //----------------------------------------------------------------------
    // Builtin: LOG
    //----------------------------------------------------------------------
    M_dictionary["LOG"] = function() {
	var item = M_stack.pop();
	if (item.type == "LITERAL") {
	    console.log(item.value);
	}
	else {
	    console.log(item);
	}
    }

    
    //----------------------------------------------------------------------
    // Builtin: ."
    //----------------------------------------------------------------------
    M_dictionary['."'] = function() {
	var quoted_string = ""

	// Read chars up to '"'
	while(M_input_index < M_input.length) {
	    // Read chars
	    var ch = M_input[M_input_index];
	    if (ch == '"') {
		M_input_index++;
		break;
	    }
	    else {
		quoted_string += ch;
		M_input_index++;
	    }
	}
	M_stack.push({type: "LITERAL", value: quoted_string});
    }


    //----------------------------------------------------------------------
    // Interprets a forth string
    //----------------------------------------------------------------------
    function Interpret(fth_string) {
	M_input = fth_string;           // Set input string
	M_input_index = 0;              // Reset to start of string

	var num_times = 0;
	do {
	    read_word();                // Read next word in input
	    tick();                     // Figure out what word is and push onto stack
	    if (M_stack.length > 0) {
		var top = M_stack[M_stack.length-1];
		if (top.type == "WORD") {
		    M_stack.pop();            // Pop entry
		    (top.value)();            // and execute it
		}
	    }
	    num_times++;
	} while (num_times < MAX_ITERATIONS && M_tib != "");
	console.log(M_stack);

	return 0;
    }

    var result = Interpret;
    return result;
})();
