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

    var m_ajax_response = {};                               // Latest AjaxResponse

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
	while(m_input_index < m_input.length) {             // Skip whitespace
	    var ch = m_input[m_input_index];
	    if (is_whitespace(ch)) {
		m_input_index++;
	    }
	    else {
		break;
	    }
	}
	while(m_input_index < m_input.length) {             // Read chars up to next whitespace
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
	m_stack.length = 0;                                 // Clear stack
	m_return_stack.length = 0;                          // Clear return stack
	console.log(message, m_stack);
    }

    //---------------------------------------------------------------------------
    // Interprets specified word
    //---------------------------------------------------------------------------
    function interpret(word) {
	var entry = m_dictionary[word];                     // Look up entry
	if (entry) {                                        // If we have an entry, execute its code
	    return entry.code();
	}
	else {                                              // Otherwise, see if it's a number
	    var number = Number(word);
	    if (isNaN(number)) {
		abort(word + " is not a number");
		return -1;
	    }
	    m_stack.push(number);                           // Push number onto forth stack
	}
	return 0;
    }


    //---------------------------------------------------------------------------
    // Reads next word and attempts to interpret it
    //
    // If the word isn't found, try to convert to a number. If not a number,
    // then call abort.
    //
    // Returns 1 if a word was intepreted; 0 otherwise
    //---------------------------------------------------------------------------
    function interpret_next_word() {
	read_word();
	if (m_cur_word == "") {                             // If no word, then we're at the end of the string
	    return 0;
	}

	var status = interpret(m_cur_word);                 // Interpret word
	if (status == -1) {                                 // If something went wrong, return 0 to stop
	    return 0;
	}
	return 1;                                           // Indicate that we interpreted something
    }

    
    //---------------------------------------------------------------------------
    // Compiles word into current definition
    //
    // Returns the following:
    //   * If ";", then 1
    //   * If abort, then -1
    //   * Otherwise, 0
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
	    return entry.code();
	}
	else if (entry) {                                   // If just an entry, add it to the def's params
	    m_cur_definition.parameters.push(m_cur_word);
	    if (m_cur_word == ";") {                        // Also, if ";", then definition is complete
		return 1;
	    }
	}
	else {                                              // See if word is a number
	    var number = Number(m_cur_word);
	    if (isNaN(number)) {
		abort(m_cur_word + " is not a number");
		return -1;
	    }
	    m_cur_definition.parameters.push(m_cur_word);
	}

	return 0;
    }

    //---------------------------------------------------------------------------
    // Executes specified colon definition
    //
    // Returns -1 on abort; 0 otherwise.
    //---------------------------------------------------------------------------
    function execute_definition(def_name) {
	if (!m_dictionary[def_name]) {
	    abort("Can't find colon definition for " + entry);
	    return -1;
	}
	var context = {                                     // Create context...
	    def_name: def_name,
	    ip: 0
	}
	m_return_stack.push(context);                       // ...and push onto return stack

	while(1) {
	    var top_index = m_return_stack.length-1;
	    var top_context = m_return_stack[top_index];
	    var next_word = m_dictionary[top_context.def_name].parameters[top_context.ip];

	    var status;
	    if (next_word.pseudo_entry) {                   // If a pseudo entry, then execute directly
		status = next_word.code(next_word.parameters);
	    }
	    else {
		status = interpret(next_word);
	    }

	    // Check status
	    if (status == 0) {
		m_return_stack[top_index].ip++;             // Advance to next instruction
	    }
	    if (status == -1) {                             // If aborted
		return -1;                                  // then abort
	    }
	    if (status == 1) {                              // If word was an EXIT
		return 0;                                   // then return 0 to indicate successful execution
	    }
	}

	abort("execute_definition: Shouldn't get to here");
	return -1;
    }

    //---------------------------------------------------------------------------
    // Reads next word and pushes address (name) onto stack
    //
    // If can't find entry, pushes undefined.
    //---------------------------------------------------------------------------
    function Tick() {
	read_word();
	if (m_cur_word == "") {                             // If no word, abort
	    abort("TICK had no word to look up");           
	    return -1;				            
	}					            
	var entry = m_dictionary[m_cur_word];               // Look up entry
	if (entry) {				            
	    m_stack.push(m_cur_word);                       // If exists, push name onto stack
	}					            
	else {					            
	    m_stack.push(undefined);                        // Otherwise, push undefined
	}					            
	return 0;                                           // Normal execution
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
		    return -1;                              // -1 means aborted
		}
		var value = m_stack.pop();                  // Get the constant's value
		read_word();                                // Get constant's name

		m_dictionary[m_cur_word] = {                // Define entry for constant
		    code: function() {
			m_stack.push(value);                // Push constant's value onto stack
		    },
		    parameters: []
		};
		return 0;                                   // 0 means normal execution
	    }
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
		return 0;                                   // 0 means normal execution
	    }
	};

	// Define ":"
	m_dictionary[":"] = {
	    code: function() {
		read_word();                                // Get def's name
		var name = m_cur_word;
		m_cur_definition = {
		    code: function() {
			return execute_definition(name);
		    },
		    parameters: []                          // Holds compiled instructions
		}
		while(1) {                                  // Compile all words in definition
		    var status = compile_word();
		    if (status == 1) {                      // If end of definition
			break;                              // then break out of loop
		    }
		    if (status == -1) {                     // If abort happened during compile_word
			return -1;                          // then abort out as well
		    }
		}

		m_dictionary[name] = m_cur_definition;      // Store new definition
		return 0;
	    }
	};

	// Define ";"
	m_dictionary[";"] = {
	    code: function() {
		m_return_stack.pop();                       // Make previous context the current one
		return 1;                                   // Return 1 to indicate an EXIT
	    }
	};

	// Define "`"
	m_dictionary["`"] = {
	    code: Tick
	};


	// Define "IF"
	m_dictionary["IF"] = {
	    code: function() {
		var jmp_false_entry = {
		    pseudo_entry: true,
		    code: function(params) {                // params will be the entry's parameters
			if (m_stack.length == 0) {
			    abort("Stack underflow");
			    return -1;
			}

			var value = m_stack.pop();          // Get value from stack
			if (!value) {                       // If false, set ip to value specified in params
			    var top_index = m_return_stack.length-1;
			    m_return_stack[top_index].ip = params[0] - 1;  // Will be incremented when executed
			}
			return 0;
		    },
		    parameters: []                          // Will hold index to jump to if false
		};
		m_cur_definition.parameters.push(jmp_false_entry);
		var cur_params = m_cur_definition.parameters;
		m_return_stack.push(cur_params.length-1);   // Note that entry needs to be filled out
		return 0;
	    },
	    immediate: true
	};


	// Define "ELSE"
	m_dictionary["ELSE"] = {
	    code: function() {
		var index = m_return_stack.pop();           // Get index of pseudo entry to tie up

		// Add entry to jmp over the ELSE branch when executing the true branch
		var jmp_entry = {
		    pseudo_entry: true,
		    code: function(params) {                // params will be the entry's parameters
			if (m_stack.length == 0) {
			    abort("Stack underflow");
			    return -1;
			}

			var top_index = m_return_stack.length-1;
			m_return_stack[top_index].ip = params[0] - 1;  // Will be incremented when executed
			return 0;
		    },
		    parameters: []                          // Will hold index to jump to if false
		};
		m_cur_definition.parameters.push(jmp_entry);
		var cur_params = m_cur_definition.parameters;
		m_return_stack.push(cur_params.length-1);   // Note that entry needs to be filled out

		// Tie up pseudo entry
		var next_index = m_cur_definition.parameters.length;
		m_cur_definition.parameters[index].parameters.push(next_index);

		return 0;
	    },
	    immediate: true
	};

	// Define "THEN"
	m_dictionary["THEN"] = {
	    code: function() {
		var index = m_return_stack.pop();           // Get index of pseudo entry to tie up
		var next_index = m_cur_definition.parameters.length;
		m_cur_definition.parameters[index].parameters.push(next_index);
		return 0;
	    },
	    immediate: true
	};

	// Define "@"
	m_dictionary["@"] = {
	    code: function() {
		if (m_stack.length == 0) {                  // If underflow, abort
		    abort("Stack underflow");
		    return -1;                              // -1 means aborted
		}
		var var_name = m_stack.pop();               // Get variable name

		var var_entry = m_dictionary[var_name];     // Look up variable's entry...
		if (!var_entry) {
		    abort("Unknown variable " + var_name);
		    return -1;
		}
		m_stack.push(var_entry.parameters[0]);      // ...and push its value onto stack
		return 0;                                   // Normal execution
	    }
	};

	// Define "!"
	m_dictionary["!"] = {
	    code: function() {
		if (m_stack.length < 2) {                   // If underflow, abort
		    abort("Stack underflow");
		    return -1;
		}
		var var_name = m_stack.pop();               // Get variable name
		var value = m_stack.pop();                  // Get variable's new value

		var var_entry = m_dictionary[var_name];     // Look up variable's entry...
		if (!var_entry) {
		    abort("Unknown variable " + var_name);
		    return -1;
		}
		var_entry.parameters[0] = value;            // Set variable's value
		return 0;
	    }
	};
    }
    define_builtins();


    //---------------------------------------------------------------------------
    // Helper function for defining words in javascript
    //---------------------------------------------------------------------------
    function DefineWord(name, func) {
	m_dictionary[name] = {
	    code: func
	};
    }

    // jsforth intepreter
    function result(str) {
	m_input = str;                                      // Reset m_input
	m_input_index = 0;                                  // Start at the beginning of string
	while (interpret_next_word()) {};                   // Interpret while there are words in string
    }

    // Expose internals for extension
    result.dictionary = m_dictionary;
    result.stack = m_stack;
    result.return_stack = m_return_stack;
    result.Tick = Tick;
    result.DefineWord = DefineWord;
    result.ajax_response = m_ajax_response;
    return result;
})();




//==========================================================
// Define common words
//==========================================================

//------------------------------------------------------------------------------
// Prints state of forth interpreter
//------------------------------------------------------------------------------
$f.DefineWord(".state", function() {
    var state = {
	dictionary: $f.dictionary,
	stack: $f.stack,
	return_stack: $f.return_stack
    };
    console.log(state);
    return 0;
});


//------------------------------------------------------------------------------
// Prints forth stack
//------------------------------------------------------------------------------
$f.DefineWord(".s", function() {
    console.log($f.stack);
    return 0;
});


//------------------------------------------------------------------------------
// Pops value from forth stack and prints it
//------------------------------------------------------------------------------
$f.DefineWord(".", function() {
    if ($f.stack.length == 0) {
	abort("Stack underflow");
	return -1;
    }
    var value = $f.stack.pop();
    console.log(value);
    return 0;
});

//------------------------------------------------------------------------------
// Adds event listener to element
//------------------------------------------------------------------------------
$f.DefineWord("addEventListener", function() {
    // Get event, and element from the stack
    var eventName = $f.stack.pop();
    var element = $f.stack.pop();

    // Next word is handler
    $f.Tick();
    var entryName = $f.stack.pop();

    // Add listener
    element.addEventListener(eventName, function(event) {
	$f.stack.push(event);                               // Push the event onto the stack
	$f(entryName);                                      // Execute the specified handler
    });
    return 0;
});


//------------------------------------------------------------------------------
// Pushes document element onto stack
//------------------------------------------------------------------------------
$f.DefineWord("document", function() {
    $f.stack.push(document);
    return 0;
});


//------------------------------------------------------------------------------
// Pushes event names onto stack
//------------------------------------------------------------------------------
$f.DefineWord("DOMContentLoaded", function() {
    $f.stack.push("DOMContentLoaded");
    return 0;
});

$f.DefineWord("click", function() {
    $f.stack.push("click");
    return 0;
});
