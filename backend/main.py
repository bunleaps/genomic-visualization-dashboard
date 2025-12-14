from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from controllers.ingest_controller import bp as api_bp

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=False,
    expose_headers=["*"],
    allow_headers=["*"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
app.register_blueprint(api_bp)

if __name__ == "__main__":
    app.run(debug=True, port=8000)
