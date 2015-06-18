from flask import Flask, redirect, render_template, jsonify
from flask.ext.compress import Compress

app = Flask(__name__)
Compress(app)


#=======================================
# Page Vocabularies
#=======================================
JSFORTH_JS = ""                         # Contents of jsforth.js
SAMPLE1_JS = ""                         # Contents of sample1.js
PAGE1_JS = ""
PAGE2_JS = ""

#=======================================
# Page Routes
#=======================================
@app.route('/')
def root():
    return render_template("page2.html")

@app.route('/page1')
def page1():
    return render_template("test1.html")

@app.route('/jsforth.js')
def jsforth_js():
    return JSFORTH_JS

@app.route('/page1.js')
def page1_js():
    JSFORTH_JS = read_file("jsforth.js")
    SAMPLE1_JS = read_file("sample1.js")
    PAGE1_JS = JSFORTH_JS + SAMPLE1_JS
    return PAGE1_JS

@app.route('/page2.js')
def page2_js():
    JSFORTH_JS = read_file("jsforth.js")
    PAGE2_JS = read_file("page2.js")
    result = JSFORTH_JS + PAGE2_JS
    return result


@app.route('/page1.min.js')
def page1_min_js():
    JSFORTH_JS = read_file("jsforth.min.js")
    SAMPLE1_JS = read_file("sample1.min.js")
    PAGE1_JS = JSFORTH_JS + SAMPLE1_JS
    return PAGE1_JS

#=======================================
# API Routes
#=======================================
@app.route('/api/page/sample1')
def api_page_sample1():
    return jsonify({"docs": ["one", "two", "three"]})

# TODO: Make this into a hash from ID to item
@app.route('/api/page/page2')
def api_page_page2():
    item1 = {
        "id": 41,
        "name": "Awsome Doc1",
        "author": "Jimmy J",
        "size": "20MB"
    }
    item2 = {
        "id": 51,
        "name": "Awsome Doc2",
        "author": "Timmy T",
        "size": "4MB"
    }
    item3 = {
        "id": 63,
        "name": "Awsome Doc3",
        "author": "Vimmy V",
        "size": "42MB"
    }

    return jsonify({"items": [item1, item2, item3]})

#=======================================
# Vocabulary Routes
#=======================================
@app.route('/vocab/ssk/main')
def vocab_ssk_core_fth():
    return CORE_FTH + MAIN_FTH

def read_file(filename):
    result = ""
    file = open(filename)
    result = file.read()
    file.close()
    return result

if __name__ == '__main__':
    JSFORTH_JS = read_file("jsforth.js")
    SAMPLE1_JS = read_file("sample1.js")
    PAGE1_JS = JSFORTH_JS + SAMPLE1_JS
    PAGE2_JS = read_file("page2.js")

    app.run(debug=True)
