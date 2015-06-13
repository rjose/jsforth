var Forth = (function() {
    var M_shadowBody = null;

    function Load(path) {
	M_shadowBody = document.body.cloneNode(true);
	console.log(M_shadowBody);
	function requestCallback() {
	    console.log("TODO", this.status, this.statusText, this.responseText);
	    //TeamTasksRender();
	    tasks_render();
	}

	var request = new XMLHttpRequest();
	request.onload = requestCallback;
	request.open("get", path);
	request.send();
    }

    function get_jsforth_nodes(rootNode) {
	var result = [];
	var treeWalker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT);
	while (treeWalker.nextNode()) {
	    var curNode = treeWalker.currentNode;
	    if (curNode.getAttribute("js-forth")) {
		result.push(curNode);
	    }
	}
	return result;
    }

    function TitleRender() {
	var nodes = get_jsforth_nodes();
	for (var i=0; i < nodes.length; i++) {
	    var node = nodes[i];
	    if (node.getAttribute("js-forth") == "TITLE RENDER") {
		console.log("Render title!");
		node.innerHTML = "Proto2"
	    }
	}
	console.log("TODO: Implement ProtoTitle", nodes);
    }

    function TeamTasksRender() {
	var body = M_shadowBody.cloneNode(true);

	var nodes = get_jsforth_nodes(body);
	for (var i=0; i < nodes.length; i++) {
	    var node = nodes[i];
	    if (node.getAttribute("js-forth") == "TEAMS TASKS RENDER") {
		console.log(node);
		console.log("Render team tasks!");
		var elem = document.createElement("p")
		elem.innerHTML = "Howdy";
		node.appendChild(elem);
	    }
	}

	document.body = body;
    }

    function tasks_render() {
	var body = M_shadowBody.cloneNode(true);
	
	var nodes = get_jsforth_nodes(body);
	var tasks = [{name: "Task1", status:"OK"}, {name: "Task2", status:"BAD"}, {name: "Task3", status:"OK"}];

	console.log(nodes);
	for (var i=0; i < nodes.length; i++) {
	    var node = nodes[i];
	    if (node.getAttribute("js-forth") == "TASKS RENDER") {
		// Get li.task
		var li_task = node.getElementsByClassName("task")[0];

		// Blank out node
		node.innerHTML = "";
		for (var j=0; j < tasks.length; j++) {
		    var new_li_task = li_task.cloneNode();
		    new_li_task.innerHTML = tasks[j].name;
		    new_li_task.classList.add("status_" + tasks[j].status);
		    node.appendChild(new_li_task);
		}
		
		console.log(li_task);
	    }
	}

	document.body = body;
    }
    
    var result = {
	Load: Load,
	TitleRender: TitleRender,
	TeamTasksRender: TeamTasksRender
    };
    return result;
})();

