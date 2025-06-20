import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai

# --- Import from our structured repository ---
# This assumes you are running `python app.py` from the root directory.
from src.project_ideate.config import settings

# --- Configuration ---
# The 'template_folder' argument tells Flask where to find the HTML files.
app = Flask(
    __name__, 
    template_folder='src/project_ideate/templates',
    static_folder='src/project_ideate/templates/src'
    )
CORS(app)

# Configure the Gemini API key from our settings file
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# --- Helper Function ---
def call_gemini_api(prompt):
    """Calls the Gemini API with a given prompt and returns the text response."""
    if not settings.google_api_key:
        return "Error: GOOGLE_API_KEY is not configured on the backend."
    try:
        model = genai.GenerativeModel(settings.default_model)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"🔴 Error calling Gemini API: {e}")
        return f"An error occurred while contacting the AI model: {e}"

# --- API Endpoints ---

@app.route('/api/key', methods=['GET'])
def get_gemini_api_key():
    """
    Endpoint to serve the Gemini API key from environment variables.
    """
    api_key = settings.GEMINI_API_KEY

    if not api_key:
        # Return an error if the key is not found (good for debugging)
        return jsonify({"error": "API key not configured in environment variables"}), 500

    # Return the key (securely as JSON)
    return jsonify({"apiKey": api_key})

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
        "You are a design thinking facilitator. Expand the following keyword into a rich, "
        "detailed, and inspiring design challenge for a creative team. Make it specific "
        "and actionable. KEYWORD: \"{keyword}\""
    ).format(keyword=keyword)

    generated_text = call_gemini_api(prompt)
    
    return jsonify({"challenge": generated_text})


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
    ideas_text = "1. AI-powered 'Smart Savings' feature.\n2. A 'Goal Visualizer' gamified interface."
    final_text = "Introducing 'Flow,' the financial co-pilot for freelancers..."
    
    return jsonify({
        "status": "Simulation complete.",
        "events": [
            {"type": "insight", "agent": "anthropologist", "content": insight},
            {"type": "ideas", "agent": "experience-architect", "content": ideas_text},
            {"type": "final_concept", "agent": "storyteller", "content": final_text},
        ]
    })


# --- Main Execution ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)

