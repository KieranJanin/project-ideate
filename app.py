import os
import sys
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
from datetime import datetime

# --- Path setup for package import ---
# This ensures that 'project_ideate' can be imported when running app.py directly.
# It adds the 'src' directory to the Python path.
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, os.pardir))
sys.path.insert(0, os.path.join(project_root, 'src'))

# --- Import from our structured repository ---
# This now uses a standard package import, thanks to our `pyproject.toml` setup.
from src.project_ideate.config import settings

# --- Configuration ---
# The 'template_folder' argument tells Flask where to find the HTML files.
app = Flask(
    __name__, 
    template_folder='src/templates',
    static_folder='src/static'
    )
CORS(app)

# Configure the Gemini API key from our settings file
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# --- Helper Function ---

def call_gemini_api(prompt):
    """Calls the Gemini API with a given prompt and returns the text response."""
    if not settings.GEMINI_API_KEY:
        return "Error: GEMINI_API_KEY is not configured on the backend."
    try:
        model = genai.GenerativeModel(settings.DEFAULT_MODEL)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"🔴 Error calling Gemini API: {e}")
        return f"An error occurred while contacting the AI model: {str(e)}"


# --- API Endpoints ---

@app.route('/api/key', methods=['GET'])
def get_gemini_api_key():
    """
    Endpoint to serve the Gemini API key from environment variables.
    This endpoint is now deprecated as the frontend should no longer directly access the key.
    It is kept for backward compatibility but should ideally be removed.
    """
    # In a fully secure setup, this endpoint would return a non-sensitive token or be removed.
    # For now, we return a dummy message or a very limited token.
    return jsonify({"message": "API key is handled securely on the backend."})

@app.route('/')
def index():
    """
    NEW: This route serves the main user interface.
    When a user navigates to the root URL, Flask will find 'index.html'
    in the 'templates' folder and return it.
    """
    return render_template('index.html')

@app.route('/api/generate-challenge', methods=['POST'])
def generate_challenge():
    """
    Receives a keyword and uses Gemini to generate a full design challenge.
    NOTE: The route is now prefixed with /api/ to distinguish it from page routes.
    """
    data = request.get_json()
    keyword = data.get('keyword')

    if not keyword:
        return jsonify({"error": "Keyword is required."}), 400

    prompt = (
        f"""You are a design thinking facilitator. Expand the following keyword into a rich, 
        detailed, and inspiring design challenge for a creative team. Make it specific 
        and actionable. KEYWORD: '{keyword}'"""
    ).format(keyword=keyword)

    generated_text = call_gemini_api(prompt)
    
    return jsonify({"challenge": generated_text})

@app.route('/api/save-challenge', methods=['POST'])
def save_challenge():
    """
    Saves the design challenge to a file in the data/inputs directory.
    """
    data = request.get_json()
    challenge = data.get('challenge')

    if not challenge:
        return jsonify({"error": "Challenge is required."}), 400

    try:
        # Create a timestamp for the filename
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"design_challenge_{timestamp}.json"
        filepath = os.path.join(project_root, 'data', 'inputs', filename)

        # Ensure the directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        # Save the challenge to the file
        with open(filepath, 'w') as f:
            json.dump({"challenge": challenge}, f, indent=4)

        return jsonify({"message": "Challenge saved successfully.", "filepath": filepath}), 200
    except Exception as e:
        print(f"🔴 Error saving challenge: {e}")
        return jsonify({"error": f"An error occurred while saving the challenge: {str(e)}"}), 500


@app.route('/api/run-simulation', methods=['POST'])
def run_simulation():
    """
    This endpoint runs the full simulation using the selected agents and challenge.
    """
    data = request.get_json()
    challenge = data.get('challenge')
    active_agent_ids = data.get('active_agents') # List of agent IDs

    if not challenge or not active_agent_ids:
        return jsonify({"error": "Design challenge and active agents are required."}), 400

    print("--- 🚀 Backend Simulation Received ---")
    print(f"Challenge: {challenge}")
    print(f"Active Crew: {', '.join(active_agent_ids)}")
    print("---------------------------------")
    
    # Placeholder simulation logic remains the same.
    # A real implementation would now run the ADK workflow.
    insight = "Users struggle with unpredictable income."
    ideas_text = """1. AI-powered 'Smart Savings' feature.
2. A 'Goal Visualizer' gamified interface."""
    final_text = "Introducing 'Flow,' the financial co-pilot for freelancers..."
    
    return jsonify({
        "status": "Simulation complete.",
        "events": [
            {"type": "insight", "agent": "anthropologist", "content": insight},
            {"type": "ideas", "agent": "experience-architect", "content": ideas_text},
            {"type": "final_concept", "agent": "storyteller", "content": final_text},
        ]
    })

@app.route('/api/gemini-proxy', methods=['POST'])
def gemini_proxy():
    """
    Proxies requests from the frontend to the Google Gemini API securely.
    The frontend sends the prompt, and the backend makes the actual API call.
    """
    data = request.get_json()
    prompt = data.get('prompt')
    is_json = data.get('is_json', False)

    if not prompt:
        return jsonify({"error": "Prompt is required."}), 400
    
    if not settings.GEMINI_API_KEY:
        return jsonify({"error": "GEMINI_API_KEY is not configured on the backend."}), 500

    try:
        model = genai.GenerativeModel(settings.DEFAULT_MODEL)
        generation_config = {"response_mime_type": "application/json"} if is_json else {}
        
        response = model.generate_content(prompt, generation_config=generation_config)

        if is_json:
            try:
                # Remove markdown code block fences if present
                text_content = response.text.strip() # Initial strip for leading/trailing whitespace/newlines

                if text_content.startswith('```json') and text_content.endswith('```'):
                    text_content = text_content[len('```json'):-len('```')].strip() # Strip again after removing fences

                # Attempt to parse as JSON
                import json
                parsed_json = json.loads(text_content)
                return jsonify(parsed_json)
            except json.JSONDecodeError as e:
                # If initial parse fails, try more aggressive cleanup
                print(f"🔴 Initial JSON Decoding Error, attempting cleanup...")
                
                # Try to find the last occurrence of ']' or '}' and trim everything after it
                # This assumes a single, valid JSON object/array is present.
                last_brace_index = max(text_content.rfind('}'), text_content.rfind(']'))
                if last_brace_index != -1:
                    # Keep only up to and including the last brace, then strip whitespace
                    cleaned_text_content = text_content[:last_brace_index + 1].strip()
                    try:
                        parsed_json = json.loads(cleaned_text_content)
                        print("✅ Successfully parsed after aggressive trimming and stripping.")
                        return jsonify(parsed_json)
                    except json.JSONDecodeError as inner_e:
                        print(f"🔴 JSON Decoding Error even after aggressive cleanup: {inner_e}")
                        print(f"Original received text: {response.text}")
                        print(f"Cleaned text attempted: {cleaned_text_content}")
                        return jsonify({"error": "Failed to parse JSON response from AI model.", "raw_response": response.text}), 500
                else:
                    # If no ']' or '}' found, it's severely malformed
                    print(f"🔴 JSON Decoding Error: No valid closing brace found. {e}")
                    print(f"Received text: {response.text}")
                    return jsonify({"error": "Failed to parse JSON response from AI model.", "raw_response": response.text}), 500
        else:
            return jsonify({"text": response.text})
    except Exception as e:
        print(f"🔴 Error in Gemini proxy: {e}")
        return jsonify({"error": f"An error occurred while contacting the AI model: {str(e)}"}), 500


# --- Main Execution ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
