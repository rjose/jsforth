from flask import Flask, redirect, render_template
app = Flask(__name__)

# The core forth file defines a vocabulary used by all pages
CORE_FTH = ""                           # Contents of core.fth

#=======================================
# Page Vocabularies
#=======================================
MAIN_FTH = ""                           # Contents of main.fth

#=======================================
# Page Routes
#=======================================
@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/app/main.html')
def app_main():
    return render_template("app/main.html")

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
    CORE_FTH = read_file("static/vocab/ssk/core.fth")
    MAIN_FTH = read_file("static/vocab/ssk/main.fth")

    app.run(debug=True)
