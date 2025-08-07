import os
import sys
import json
from flask import Flask, request, jsonify, render_template, Response
from flask_cors import CORS
import google.generativeai as genai
from datetime import datetime

# --- Path setup for package import ---
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, os.pardir))
sys.path.insert(0, os.path.join(project_root, 'src'))

# --- Import from our structured repository ---
from src.project_ideate.config import settings

# --- Configuration ---
app = Flask(
    __name__, 
    template_folder='src/templates',
    static_folder='src/static'
    )
CORS(app)

# Configure the Gemini API key
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# --- API Endpoints ---

@app.route('/')
def landing():
    """Serves the landing page."""
    return render_template('landing.html')

@app.route('/simulation')
def simulation():
    """Serves the simulation page."""
    return render_template('simulation.html')

@app.route('/directed')
def directed():
    """Serves the directed workflow page."""
    return render_template('directed.html')

@app.route('/api/gemini-proxy', methods=['POST'])
def gemini_proxy():
    """
    Proxies requests to the Gemini API. It supports both standard and streaming responses.
    """
    data = request.get_json()
    prompt = data.get('prompt')
    is_json = data.get('is_json', False)
    should_stream = data.get('stream', False)

    if not prompt:
        return jsonify({"error": "Prompt is required."}), 400
    
    if not settings.GEMINI_API_KEY:
        return jsonify({"error": "GEMINI_API_KEY is not configured on the backend."}), 500

    try:
        model = genai.GenerativeModel(settings.DEFAULT_MODEL)
        
        if should_stream:
            # --- Streaming Response ---
            response_stream = model.generate_content(prompt, stream=True)
            
            def generate():
                try:
                    for chunk in response_stream:
                        if chunk.text:
                            # SSE format: data: <json_string>\n\n
                            yield f"data: {json.dumps({'text': chunk.text})}\n\n"
                except Exception as e:
                    print(f"🔴 Error during stream generation: {e}")
                finally:
                    # Signal the end of the stream
                    yield f"data: {json.dumps({'event': 'EOS'})}\n\n"
            
            return Response(generate(), mimetype='text/event-stream')

        else:
            # --- Standard (Non-Streaming) Response ---
            generation_config = {"response_mime_type": "application/json"} if is_json else {}
            response = model.generate_content(prompt, generation_config=generation_config)
            
            if is_json:
                # Handle JSON parsing and cleanup
                text_content = response.text.strip()
                if text_content.startswith('```json') and text_content.endswith('```'):
                    text_content = text_content[len('```json'):-len('```')].strip()
                try:
                    parsed_json = json.loads(text_content)
                    return jsonify(parsed_json)
                except json.JSONDecodeError:
                    return jsonify({"error": "Failed to parse JSON response from AI.", "raw_response": response.text}), 500
            else:
                return jsonify({"text": response.text})

    except Exception as e:
        print(f"🔴 Error in Gemini proxy: {e}")
        return jsonify({"error": f"An error occurred while contacting the AI model: {str(e)}"}), 500

# --- Other routes remain the same ---

@app.route('/api/key', methods=['GET'])
def get_gemini_api_key():
    return jsonify({"message": "API key is handled securely on the backend."})

@app.route('/api/generate-challenge', methods=['POST'])
def generate_challenge():
    data = request.get_json()
    keyword = data.get('keyword')
    if not keyword:
        return jsonify({"error": "Keyword is required."}), 400
    prompt = f"You are a design thinking facilitator. Expand the following keyword into a rich, detailed, and inspiring design challenge. KEYWORD: '{keyword}'"
    generated_text = call_gemini_api(prompt)
    return jsonify({"challenge": generated_text})

@app.route('/api/save-challenge', methods=['POST'])
def save_challenge():
    data = request.get_json()
    challenge = data.get('challenge')
    if not challenge:
        return jsonify({"error": "Challenge is required."}), 400
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"design_challenge_{timestamp}.json"
        filepath = os.path.join(project_root, 'data', 'inputs', filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            json.dump({"challenge": challenge}, f, indent=4)
        return jsonify({"message": "Challenge saved successfully.", "filepath": filepath}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def call_gemini_api(prompt):
    """Simple helper for non-streaming calls, used by older routes."""
    try:
        model = genai.GenerativeModel(settings.DEFAULT_MODEL)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

# --- Main Execution ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
