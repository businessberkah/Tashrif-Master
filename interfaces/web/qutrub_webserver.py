#! /usr/bin/python
# -*- coding: UTF-8 -*-

import sys
import os
import os.path
import re
from glob import glob
import logging
import logging.config
from datetime import datetime, timedelta
from flask import Flask, render_template, make_response, send_from_directory, request, jsonify, redirect, abort

from flask_minify import minify

# ── Path setup ──────────────────────────────────────────────────────────────
_HERE = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.abspath(os.path.join(_HERE, "../../"))
sys.path.insert(0, _HERE)
sys.path.insert(0, _REPO_ROOT)

from config.qutrub_config import LOGGING_CFG_FILE, LOGGING_FILE, MODE_DEBUG
import qws_const
import core.adaat

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# ── Logging ──────────────────────────────────────────────────────────────────
if MODE_DEBUG:
    logging.basicConfig(filename=LOGGING_FILE, level=logging.DEBUG)
else:
    logging.basicConfig(filename=LOGGING_FILE, level=logging.INFO)

minify(app=app, html=True, js=True, cssless=True)


# ── Helpers ──────────────────────────────────────────────────────────────────

def str2bool(strg):
    if strg == "false":
        return False
    elif strg == "true":
        return True
    else:
        return strg


def prepare_result(resulttext, text, action, options, url="ajax"):
    """Extract results from conjugator."""
    if type(resulttext) == dict:
        suggestions = resulttext.get("suggest", [])
        results = {
            "result": resulttext.get("table", {}),
            "verb_info": resulttext.get("verb_info", ""),
            "suggest": suggestions,
        }
    else:
        app.logger.debug('No suggestion: %s', resulttext)
        suggestions = []
        results = {"result": {}, "verb_info": "", "suggest": []}

    invalid_verb = "" if results.get("result") else "invalid"
    app.logger.info('%s:%s:%s:%s', url, action, text, invalid_verb)
    logging.info('%s:%s:%s:%s', url, action, text, invalid_verb)
    app.logger.debug('%s:%s', "Suggest", repr(suggestions))
    return results


# ── Page routes ──────────────────────────────────────────────────────────────

@app.route("/doc/")
def doc():
    return render_template("doc.html", current_page='doc')


@app.route("/contact/")
def contact():
    return render_template("contact.html", current_page='contact')


@app.route("/download/")
def download():
    return render_template("download.html", current_page='download')


@app.route("/projects/")
def projects():
    context = {
        'libraries': qws_const.libraries,
        'websites': qws_const.websites,
    }
    return render_template("projects.html", current_page='projects', **context)


@app.route("/index/")
def index():
    return render_template("main.html", current_page='home')


@app.route("/")
def home():
    context = {}
    args = request.args
    context['verb'] = args.get('verb', "")
    context['future_type'] = args.get('haraka', "فتحة")
    context['transitive'] = args.get('trans', False)
    return render_template("main.html", current_page='home', **context)


@app.route("/verb/<verb_value>/<haraka>/<trans>")
@app.route("/verb/<verb_value>/<haraka>")
@app.route("/verb/<verb_value>")
def verb(verb_value, haraka="فتحة", trans=False):
    return redirect('/?verb=%s&haraka=%s&trans=%s' % (verb_value, haraka, trans))


# ── AJAX / API routes ─────────────────────────────────────────────────────────

@app.route("/ajaxGet", methods=["POST", "GET"])
def ajax():
    default = core.adaat.random_text()
    text = default
    action = ""
    options = {}

    if request.method == "GET":
        args = request.args
    elif request.method == "POST":
        body = request.get_json(silent=True)
        if body is None or "data" not in body:
            abort(400)
        args = body["data"]
    else:
        return jsonify({"text": default})

    if args.get("response_type", "") == "get_random_text":
        return jsonify({"text": default})

    text = args.get("text", "")
    action = args.get("action", "")
    options["all"] = args.get("all", False)
    options["transitive"] = args.get("transitive", False)
    options["past"] = args.get("past", False)
    options["future"] = args.get("future", False)
    options["imperative"] = args.get("imperative", False)
    options["future_moode"] = args.get("future_moode", False)
    options["confirmed"] = args.get("confirmed", False)
    options["passive"] = args.get("passive", False)
    options["future_type"] = args.get("future_type", "فتحة")
    options["display_format"] = args.get("display_format", "HTML")

    resulttext = core.adaat.DoAction(text, action, options)
    results = prepare_result(resulttext, text, action, options, "ajax")
    return jsonify(results)


@app.route("/api/<verb>/<haraka>", methods=["GET"])
@app.route("/api/<verb>", methods=["GET"])
@app.route("/api", methods=["GET"])
def api(verb="", haraka=""):
    """Public JSON API — backward-compatible with path and query-string styles."""
    default = "استعمل"
    action = "Conjugate"
    options = {}

    if request.method != "GET":
        return jsonify({"text": default})

    args = request.args

    if args.get("response_type", "") == "get_random_text":
        return jsonify({"text": default})

    # Text: path variable takes priority, then query string
    text = verb or args.get("verb", "")
    if not text:
        text = default

    # Haraka: path variable takes priority, then query string
    raw_haraka = haraka or args.get("haraka", "فتحة")
    if raw_haraka.lower() == "a":
        raw_haraka = "فتحة"
    elif raw_haraka.lower() == "u":
        raw_haraka = "ضمة"
    elif raw_haraka.lower() == "i":
        raw_haraka = "كسرة"
    options["future_type"] = raw_haraka

    trans = args.get("trans", True)
    if trans == "0":
        options["transitive"] = False
    else:
        options["transitive"] = True
    options["all"] = True

    resulttext = core.adaat.DoAction(text, action, options)
    results = prepare_result(resulttext, text, action, options, url="api")

    response = jsonify(results)
    response.headers["Content-Type"] = "application/json; charset=utf-8"
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# ── Sitemap ───────────────────────────────────────────────────────────────────

@app.route('/sitemap.txt', methods=['GET'])
def sitemap_txt():
    return send_from_directory(app.static_folder, request.path[1:])


@app.route('/sitemap.xml', methods=['GET'])
def sitemap_xml():
    return send_from_directory(app.static_folder, request.path[1:])


# ── Error handlers ────────────────────────────────────────────────────────────

@app.errorhandler(400)
def bad_request(e):
    return render_template('400.shtml'), 400


@app.errorhandler(404)
def not_found(e):
    return render_template('404.shtml'), 404


@app.errorhandler(500)
def server_error(e):
    return render_template('500.shtml'), 500


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    host = os.getenv("QUTRUB_HOST", "0.0.0.0")
    port = int(os.getenv("QUTRUB_PORT", "5000"))
    app.run(host=host, port=port, debug=os.getenv("QUTRUB_DEBUG") == "1")

