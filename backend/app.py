from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

from routes.auth_routes import auth_bp
from routes.analysis_routes import analysis_bp
from routes.chat_routes import chat_bp
from routes.health_routes import health_bp

def create_app():
    app = Flask(__name__)
    origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    CORS(app, origins=origins, supports_credentials=True)

    @app.route("/_health")
    def health():
        return {"status": "ok"}

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(analysis_bp, url_prefix="/api/analysis")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(health_bp, url_prefix="/api/health")

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
