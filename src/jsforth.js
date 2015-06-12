//======================================
// Constructs jsforth interpreter
//======================================
$f = (function makeInterpreter() {
    var m_dictionary = {};              // Contains forth words
    var m_stack = [];                   // Main stack
    var m_return_stack = [];            // Return stack (for colon definition execution)
    var m_variables = {};               // Stores variables
    var m_constants = {};               // Stores constants

    var m_input = "";                   // Current input string
    var m_input_index = 0;              // Index into m_input

    var m_cur_word = "";                // Last word read

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
	m_cur_word = "";                // Reset m_cur_word

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
	if (m_cur_word == "") {         // If no word, then we're at the end of the string
	    return 0;
	}

	var entry = m_dictionary[m_cur_word];
	                                // Look up entry in dictionary

	if (entry) {                    // If we have an entry, execute its code
	    entry.code();
	}
	else {                          // Otherwise, see if it's a number
	    var number = Number(m_cur_word);
	    if (isNaN(number)) {
		abort(m_cur_word + " is not a number");
		return;
	    }
	    m_stack.push(number);       // Push number onto forth stack
	}
	return 1;                       // Indicate that we interpreted something
    }

    //---------------------------------------------------------------------------
    // Defines builtin words for jsforth interpreter
    //---------------------------------------------------------------------------
    function define_builtins() {
	// Define ".s"
	m_dictionary[".s"] = {
	    code: function() {
		var state = {
		    dictionary: m_dictionary,
		    stack: m_stack,
		    return_stack: m_return_stack,
		    variables: m_variables,
		    constants: m_constants
		};
		console.log(state);
	    },
	    parameters: []
	};

	// Define "HOWDY"
	m_dictionary["HOWDY"] = {
	    code: function() {
		console.log("ENTRY: HOWDY");
	    },
	    paramters: []
	}
    }

    define_builtins();


    var MAX_ITERATIONS = 5000;          // Max words in string

    // jsforth intepreter
    function result(str) {
	m_input = str;                  // Reset m_input
	m_input_index = 0;              // Start at the beginning

	var num_iters = 0;

	while (interpret_word()) {      // Interpret while there are words in string
	    num_iters++;
	    if (num_iters > MAX_ITERATIONS) {
		break;
	    }
	}
	return;
    }
    return result;
})();
