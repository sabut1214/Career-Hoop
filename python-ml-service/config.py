"""
Configuration management for the Python ML Recommendation Service.
Handles environment variables, paths, and service settings.
"""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()


class Config:
    """Application configuration."""
    
    # Server configuration
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Career data path
    # Default: look for data directory relative to this script
    DEFAULT_DATA_PATH = Path(__file__).parent.parent / "data" / "career" / "career.json"
    CAREER_DATA_PATH: Path = Path(os.getenv("CAREER_DATA_PATH", str(DEFAULT_DATA_PATH)))
    
    # CORS configuration
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ]
    
    @classmethod
    def resolve_career_data_path(cls) -> Path:
        """Resolve the career data file path."""
        if cls.CAREER_DATA_PATH.exists():
            return cls.CAREER_DATA_PATH
        
        # Try alternative paths
        alternative_paths = [
            Path("data/career/career.json"),
            Path("../data/career/career.json"),
            Path("../../data/career/career.json"),
            Path.cwd() / "data" / "career" / "career.json",
        ]
        
        for path in alternative_paths:
            if path.exists():
                return path
        
        # Return default path even if it doesn't exist (will raise error when loading)
        return cls.CAREER_DATA_PATH


# Global config instance
config = Config()

