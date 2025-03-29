from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import logging
import json
import os

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the add-ins

current_dir = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE_PATH = os.path.join(current_dir, "config.json")

def load_config_data(config_file=CONFIG_FILE_PATH):
    """
    Load the config data from a JSON file, and return a dictionary containing a list of valid
    Gemini API credentials.
    """
    result = {
        "gemini_credentials": [],
    }

    if not os.path.exists(config_file):
        logging.info("No existing config file found.")
        return result

    try:
        with open(config_file, "r", encoding="utf-8") as f:
            config_data = json.load(f)

        # Extract gemini_credentials
        gemini_credentials_list = []
        for credential_set in config_data.get("credentials", []):
            gemini_credentials = credential_set.get("gemini_credentials", [])
            if isinstance(gemini_credentials, list):
                gemini_credentials_list.extend(gemini_credentials)

        valid_gemini_credentials = [cred for cred in gemini_credentials_list if "api_key" in cred]
        if valid_gemini_credentials:
            result["gemini_credentials"] = valid_gemini_credentials
        else:
            logging.error("No valid gemini credentials found.")

    except (json.JSONDecodeError, FileNotFoundError) as e:
        logging.error(f"Error reading config file: {e}")

    return result

config_data = load_config_data(CONFIG_FILE_PATH)
GEMINI_API_CREDENTIALS = config_data["gemini_credentials"]

@app.route("/translate", methods=["POST"])
def translate():
    """
    Handle a POST request from the add-in with a JSON object containing the text to translate and the target language.
    The JSON object should have the following structure:

    {
        "text": string,  # The text to translate
        "target_lang": string,  # The target language to translate to
        "source_lang": string (optional)  # The source language of the text. Defaults to auto-detection.
    }

    Returns a JSON object with a single key "translated_text" containing the translated text, or an error object with a "error" key if there is an error.

    :return: A JSON object containing the translated text or an error message.
    :statuscode 200: The translation was successful.
    :statuscode 400: The request was invalid.
    :statuscode 500: The translation failed.
    """
    data = request.json
    source_text = data.get("text", "")
    source_lang = data.get("source_lang", "auto")  # Default to auto-detection
    target_lang = data.get("target_lang")  # Get the target language from user input

    print("Got request:", data)
    if not source_text:
        return jsonify({"error": "No text provided"}), 400
    
    if not target_lang:
        return jsonify({"error": "Target language is required"}), 400

    command = "Translate the following text into " + target_lang + ". \n Return only the translated text. \n"
    prompt = command + source_text

    translated_text = None
    print("Start translation...")
    print(f"Gemini API credentials: {GEMINI_API_CREDENTIALS}")
    for credentials in GEMINI_API_CREDENTIALS:
        api_key = credentials["api_key"]
        try:
            print("Using API key:", api_key)
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.0-flash", contents=prompt
            )
            
            translated_text = response.text
            print(translated_text)
            logging.info(f"Success with API key: {api_key}")
            break

        except Exception as e:
            logging.error(f"Failed with API key {api_key}: {e}")
            continue

    if not translated_text:
        return jsonify({"error": "Translation failed"}), 500

    return jsonify({"translated_text": translated_text}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
