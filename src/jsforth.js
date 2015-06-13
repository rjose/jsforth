//======================================
// Constructs jsforth interpreter
//======================================
$f = (function makeInterpreter() {
    var m_dictionary = {};                                  // Contains forth words
    var m_stack = [];                                       // Main stack
    var m_return_stack = [];                                // Return stack (for colon definition execution)

    var m_input = "";                                       // Current input string
    var m_input_index = 0;                                  // Index into m_input

    var m_cur_word = "";                                    // Last word read
    var m_cur_definition = {};                              // Currently defined definition

    //---------------------------------------------------------------------------
    // True if space, tab, or newline
    //---------------------------------------------------------------------------
    function is_whitespace(ch) {
	if (ch == " " || ch == "\t" || ch == "\n") {
	    return true;
	}
	else {
	    return false;
	}
    }

    //---------------------------------------------------------------------------
    // Reads next word from m_input and stores in m_cur_word
    //---------------------------------------------------------------------------
    function read_word() {
	m_cur_word = "";                                    // Reset m_cur_word

	// Skip whitespace
	while(m_input_index < m_input.length) {
	    var ch = m_input[m_input_index];
	    if (is_whitespace(ch)) {
		m_input_index++;
	    }
	    else {
		break;
	    }
	}

	// Read chars up to next whitespace
	while(m_input_index < m_input.length) {
	    var ch = m_input[m_input_index];
	    if (is_whitespace(ch)) {
		m_input_index++;
		break;
	    }
	    else {
		m_cur_word += ch;
		m_input_index++;
	    }
	}
    }

    //---------------------------------------------------------------------------
    // Resets forth stack and return stack
    //
    // Also prints message to console
    //---------------------------------------------------------------------------
    function abort(message) {
	m_stack = [];
	m_return_stack = [];
	console.log(message);
    }


    //---------------------------------------------------------------------------
    // Reads next word and attempts to interpret it
    //
    // If the word isn't found, try to convert to a number. If not a number,
    // then call abort.
    //
    // Returns 1 if a word was intepreted; 0 otherwise
    //---------------------------------------------------------------------------
    function interpret_word() {
	read_word();
	if (m_cur_word == "") {                             // If no word, then we're at the end of the string
	    return 0;
	}

	var entry = m_dictionary[m_cur_word];               // Look up entry in dictionary

	if (entry) {                                        // If we have an entry, execute its code
	    entry.code();
	}
	else {                                              // Otherwise, see if it's a number
	    var number = Number(m_cur_word);
	    if (isNaN(number)) {
		abort(m_cur_word + " is not a number");
		return;
	    }
	    m_stack.push(number);                           // Push number onto forth stack
	}
	return 1;                                           // Indicate that we interpreted something
    }

    
    //---------------------------------------------------------------------------
    // Compiles word into current definition
    //
    // Returns the following:
    //   * If ";", then 0
    //   * If abort, then -1
    //   * Otherwise, 1
    //
    // NOTE: This should only be called by ":".
    //---------------------------------------------------------------------------
    function compile_word() {
	read_word();

	if (m_cur_word == "") {                             // If no word, then we're at the end of the string
	    abort("Incomplete definition");
	    return -1;
	}

	var entry = m_dictionary[m_cur_word];               // Look up entry in dictionary

	if (entry && entry.immediate) {                     // If an immediate word, then execute it
	    entry.code();
	}
	else if (entry) {                                   // If just an entry, add it to the def's params
	    m_cur_definition.parameters.push(m_cur_word);
	    if (m_cur_word == ";") {                        // Also, if ";", then definition is complete
		return 0;
	    }
	}
	else {                                              // See if word is a number
	    var number = Number(m_cur_word);
	    if (isNaN(number)) {
		abort(m_cur_word + " is not a number");
		return -1;
	    }
	    m_cur_definition.parameters.push(number);
	}

	return 1;
    }


    //---------------------------------------------------------------------------
    // Defines builtin words for jsforth interpreter
    //---------------------------------------------------------------------------
    function define_builtins() {
	// Define "CONSTANT"
	m_dictionary["CONSTANT"] = {
	    code: function() {
		if (m_stack.length == 0) {                  // If underflow, abort
		    abort("Stack underflow");
		    return;
		}
		var value = m_stack.pop();                  // Get the constant's value
		read_word();                                // Get constant's name

		m_dictionary[m_cur_word] = {                // Define entry for constant
		    code: function() {
			m_stack.push(value);                // Push constant's value onto stack
		    },
		    parameters: []
		};
	    },
	    parameters: []
	};


	// Define "VARIABLE"
	m_dictionary["VARIABLE"] = {
	    code: function() {
		read_word();                                // Get variable's name
		var name = m_cur_word;
		m_dictionary[name] = {                      // Define entry for variable
		    code: function() {
			m_stack.push(name);                 // Push variable's address (i.e., name)
		    },
		    parameters: [0]                         // Default value to 0
		};
	    },
	    parameters: []
	};

	// Define "@"
	m_dictionary["@"] = {
	    code: function() {
		if (m_stack.length == 0) {                  // If underflow, abort
		    abort("Stack underflow");
		    return;
		}
		var var_name = m_stack.pop();               // Get variable name

		var var_entry = m_dictionary[var_name];     // Look up variable's entry...
		if (!var_entry) {
		    abort("Unknown variable " + var_name);
		    return;
		}
		m_stack.push(var_entry.parameters[0]);      // ...and push its value onto stack
	    },
	    parameters: []
	};

	// Define "!"
	m_dictionary["!"] = {
	    code: function() {
		if (m_stack.length < 2) {                   // If underflow, abort
		    abort("Stack underflow");
		    return;
		}
		var var_name = m_stack.pop();               // Get variable name
		var value = m_stack.pop();                  // Get variable's new value

		var var_entry = m_dictionary[var_name];     // Look up variable's entry...
		if (!var_entry) {
		    abort("Unknown variable " + var_name);
		    return;
		}
		var_entry.parameters[0] = value;            // Set variable's value
	    },
	    parameters: []
	};

	// Define ":"
	m_dictionary[":"] = {
	    code: function() {
		read_word();                                // Get def's name
		var name = m_cur_word;
		m_cur_definition = {
		    code: function() {
			console.log("TODO: Define execute definition");
		    },
		    parameters: []
		}
		while(1) {
		    var status = compile_word();
		    if (status == 0) {                      // Normal end of definition
			break;
		    }
		    if (status == -1) {                     // Abort definition
			return;
		    }
		    // Otherwise, keep compiling
		}

		m_dictionary[name] = m_cur_definition;      // Store new definition
	    },
	    parameters: []
	};

	// Define ";"
	m_dictionary[";"] = {
	    code: function() {
		console.log("TODO: Implement ';'");
	    },
	    parameters: []
	};


	// Define ".s"
	m_dictionary[".s"] = {
	    code: function() {                              // Prints interpreter state
		var state = {
		    dictionary: m_dictionary,
		    stack: m_stack,
		    return_stack: m_return_stack
		};
		console.log(state);
	    },
	    parameters: []
	};
    }

    define_builtins();


    // jsforth intepreter
    var MAX_ITERATIONS = 5000;                              // Max words in string
    function result(str) {
	m_input = str;                                      // Reset m_input
	m_input_index = 0;                                  // Start at the beginning

	var num_iters = 0;
	while (interpret_word()) {                          // Interpret while there are words in string
	    num_iters++;
	    if (num_iters > MAX_ITERATIONS) {
		break;
	    }
	}
	return;
    }
    return result;
})();
