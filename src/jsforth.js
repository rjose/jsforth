//======================================
// Constructs jsforth interpreter
//======================================
$f = (function makeInterpreter() {
    var m_dictionary = {};
    var m_stack = [];
    var m_return_stack = [];
    var m_variables = {};


    // Interpreter
    function result(str) {
	console.log("TODO: Interpret forth", str);
	return;
    }
    return result;
})();
