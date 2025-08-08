from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
from google.generativeai.types import GenerationConfig
import os

app = Flask(__name__, template_folder='src/templates', static_folder='src/static')
CORS(app)  # Enable CORS for all origins

# Configure Google Generative AI with your API key
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/simulation')
def index():
    return render_template('index.html')

@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.json
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        # Create an ImagenModel instance
        # Use 'imagen-2' for image generation
        image_model = genai.GenerativeModel('imagen-2')
        
        # Generate content (image) based on the prompt
        # The response structure might vary slightly, refer to actual API docs for exact details
        response = image_model.generate_content(
            prompt,
            generation_config=GenerationConfig(
                temperature=0.4,
                candidate_count=1,
            ),
        )
        
        # Assuming the response contains an 'images' attribute with a URL
        if response and response.images and len(response.images) > 0:
            image_url = response.images[0].url
        else:
            raise Exception("No image URL found in the response.")

        print(f"Generated image URL: {image_url}")
        return jsonify({"imageUrl": image_url})
    except Exception as e:
        print(f"Error during image generation: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
