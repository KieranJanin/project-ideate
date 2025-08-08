import os
import sys
import json
from flask import Flask, request, jsonify, render_template, Response, make_response
from flask_cors import CORS
import google.generativeai as genai
from datetime import datetime
from functools import wraps

import firebase_admin
from firebase_admin import credentials, auth, firestore

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

# --- Firebase Admin SDK Initialization ---
try:
    service_account_key_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_PATH', "project-ideate-firebase-adminsdk-fbsvc-3c8a3b1fde.json") # Assuming it's in the root
    cred = credentials.Certificate(service_account_key_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK and Firestore initialized successfully.")
except Exception as e:
    print(f"🔴 Error initializing Firebase Admin SDK or Firestore: {e}")
    print("Ensure your service account key path is correct and the file exists, and that Firestore is enabled for your project.")
    db = None # Set db to None if initialization fails

# Configure the Gemini API key
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# --- Helper for no-cache headers ---
def no_cache_response(template_name):
    response = make_response(render_template(template_name))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# --- Authentication Decorator ---
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if db is None: # Check if Firebase was initialized
            return jsonify({"error": "Backend database not initialized."}), 500

        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header missing."}), 401
        
        id_token = auth_header.split(' ').pop()
        if not id_token:
            return jsonify({"error": "ID token missing."}), 401

        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user_id = decoded_token['uid']
            # print(f"User authenticated: {request.user_id}") # Uncomment for debugging
        except Exception as e:
            print(f"🔴 Token verification failed: {e}")
            return jsonify({"error": "Invalid or expired token.", "details": str(e)}), 403
        
        return f(*args, **kwargs)
    return decorated_function

# --- API Endpoints ---

@app.route('/')
def landing():
    """Serves the landing page."""
    return render_template('landing.html')

@app.route('/mission-control')
def mission_control():
    """Serves the mission control page."""
    return no_cache_response('mission_control.html')

@app.route('/empathize')
def empathize():
    """Serves the empathize phase page."""
    return no_cache_response('empathize.html')

@app.route('/define')
def define():
    """Serves the define phase page."""
    return no_cache_response('define.html')

@app.route('/ideate')
def ideate():
    """Serves the ideate phase page."""
    return no_cache_response('ideate.html')

@app.route('/prototype-test')
def prototype_test():
    """Serves the prototype & test phase page."""
    return no_cache_response('prototype_test.html')

@app.route('/finalize')
def finalize():
    """Serves the finalize phase page."""
    return no_cache_response('finalize.html')

@app.route('/directed')
def directed():
    """Serves the directed workflow page."""
    return render_template('directed.html')

@app.route('/api/gemini-proxy', methods=['POST'])
def gemini_proxy(): # Not protected for now, as it might be used by unauthenticated demo flows
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
                            yield f"data: {json.dumps({'text': chunk.text})}\n\n"
                except Exception as e:
                    print(f"🔴 Error during stream generation: {e}")
                finally:
                    yield f"data: {json.dumps({'event': 'EOS'})}\n\n"
            
            return Response(generate(), mimetype='text/event-stream')

        else:
            # --- Standard (Non-Streaming) Response ---
            generation_config = {"response_mime_type": "application/json"} if is_json else {}
            response = model.generate_content(prompt, generation_config=generation_config)
            
            if is_json:
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

# --- User Project Management Endpoints (Firestore) ---

@app.route('/api/projects/create', methods=['POST'])
@require_auth
def create_project():
    user_id = request.user_id
    data = request.get_json()
    project_name = data.get('projectName')
    design_challenge = data.get('designChallenge')

    if not project_name or not design_challenge:
        return jsonify({"error": "Project name and design challenge are required."}), 400

    try:
        # Generate a new project ID
        project_ref = db.collection('users').document(user_id).collection('projects').document()
        project_id = project_ref.id

        initial_state = {
            'projectName': project_name,
            'designChallenge': design_challenge,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'lastUpdated': firestore.SERVER_TIMESTAMP,
            'simulationState': { # Initial simulation state
                'scriptIndex': 0,
                'isPaused': False,
                'currentPhase': 'mission_control',
                'collectedData': {},
                'designChallenge': design_challenge # Store here as well for easy access
            }
        }
        project_ref.set(initial_state)
        return jsonify({"message": "Project created successfully", "projectId": project_id}), 201
    except Exception as e:
        print(f"🔴 Error creating project: {e}")
        return jsonify({"error": "Failed to create project", "details": str(e)}), 500

@app.route('/api/projects/list', methods=['GET'])
@require_auth
def list_projects():
    user_id = request.user_id
    try:
        projects_ref = db.collection('users').document(user_id).collection('projects')
        projects = []
        for doc in projects_ref.order_by('lastUpdated', direction=firestore.Query.DESCENDING).stream():
            project_data = doc.to_dict()
            projects.append({
                'id': doc.id,
                'projectName': project_data.get('projectName', 'Untitled Project'),
                'designChallenge': project_data.get('designChallenge', ''),
                'lastUpdated': project_data.get('lastUpdated').isoformat() if project_data.get('lastUpdated') else None # Convert timestamp to string
            })
        return jsonify({"projects": projects}), 200
    except Exception as e:
        print(f"🔴 Error listing projects: {e}")
        return jsonify({"error": "Failed to list projects", "details": str(e)}), 500

@app.route('/api/projects/<project_id>/load', methods=['GET'])
@require_auth
def load_project(project_id):
    user_id = request.user_id
    try:
        project_ref = db.collection('users').document(user_id).collection('projects').document(project_id)
        doc = project_ref.get()
        if not doc.exists:
            return jsonify({"error": "Project not found."}), 404
        
        project_data = doc.to_dict()
        # Return the entire simulation state stored for this project
        return jsonify({"project": project_data}), 200
    except Exception as e:
        print(f"🔴 Error loading project: {e}")
        return jsonify({"error": "Failed to load project", "details": str(e)}), 500

@app.route('/api/projects/<project_id>/save', methods=['POST'])
@require_auth
def save_project(project_id):
    user_id = request.user_id
    data = request.get_json()
    simulation_state = data.get('simulationState')

    if not simulation_state:
        return jsonify({"error": "Simulation state is required."}), 400

    try:
        project_ref = db.collection('users').document(user_id).collection('projects').document(project_id)
        project_ref.update({
            'simulationState': simulation_state,
            'lastUpdated': firestore.SERVER_TIMESTAMP
        })
        return jsonify({"message": "Project saved successfully"}), 200
    except Exception as e:
        print(f"🔴 Error saving project: {e}")
        return jsonify({"error": "Failed to save project", "details": str(e)}), 500

@app.route('/api/projects/<project_id>/delete', methods=['DELETE'])
@require_auth
def delete_project(project_id):
    user_id = request.user_id
    try:
        project_ref = db.collection('users').document(user_id).collection('projects').document(project_id)
        project_ref.delete()
        return jsonify({"message": "Project deleted successfully"}), 200
    except Exception as e:
        print(f"🔴 Error deleting project: {e}")
        return jsonify({"error": "Failed to delete project", "details": str(e)}), 500

@app.route('/api/key', methods=['GET'])
@require_auth # Protect the API key endpoint too if it exposes sensitive info
def get_gemini_api_key_status():
    return jsonify({"message": "API key is handled securely on the backend.", "configured": bool(settings.GEMINI_API_KEY)})

@app.route('/api/generate-challenge', methods=['POST'])
@require_auth 
def generate_challenge():
    data = request.get_json()
    keyword = data.get('keyword')
    if not keyword:
        return jsonify({"error": "Keyword is required."}), 400
    prompt = f"You are a design thinking facilitator. Expand the following keyword into a rich, detailed, and inspiring design challenge. KEYWORD: '{keyword}'"
    generated_text = call_gemini_api(prompt)
    return jsonify({"challenge": generated_text})

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
