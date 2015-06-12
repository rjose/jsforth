//======================================
// Constructs jsforth interpreter
//======================================
$f = (function makeInterpreter() {
    var m_dictionary = {};              // Contains forth words
    var m_stack = [];                   // Main stack
    var m_return_stack = [];            // Return stack (for colon definition execution)
    var m_variables = {};               // Stores variables (and constants)

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

    // jsforth intepreter
    function result(str) {
	m_input = str;                  // Reset m_input
	m_input_index = 0;              // Start at the beginning

	read_word();
	console.log(m_cur_word);

	read_word();
	console.log(m_cur_word);

	read_word();
	console.log(m_cur_word);
	read_word();
	console.log(m_cur_word);
	return;
    }
    return result;
})();
