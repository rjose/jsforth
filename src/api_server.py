from flask import Flask, redirect, render_template
from flask.ext.compress import Compress

app = Flask(__name__)
Compress(app)


#=======================================
# Page Vocabularies
#=======================================
JSFORTH_JS = ""                         # Contents of jsforth.js
SAMPLE1_JS = ""                         # Contents of sample1.js
PAGE1_JS = ""

#=======================================
# Page Routes
#=======================================
@app.route('/')
def root():
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

@app.route('/page1.min.js')
def page1_min_js():
    JSFORTH_JS = read_file("jsforth.min.js")
    SAMPLE1_JS = read_file("sample1.min.js")
    PAGE1_JS = JSFORTH_JS + SAMPLE1_JS
    return PAGE1_JS

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

    app.run(debug=True)
