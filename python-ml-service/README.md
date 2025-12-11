# CareerHoop Python ML Recommendation Service

A FastAPI-based recommendation service that provides intelligent career recommendations using similarity scoring algorithms.

## Features

- Smart career matching based on grades, stream, interests, and subjects
- Similarity scoring algorithm (no ML training required)
- RESTful API endpoints
- Fast and lightweight

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Navigate to the service directory:
```bash
cd python-ml-service
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Linux/Mac:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. (Optional) Copy `.env.example` to `.env` and customize:
```bash
cp .env.example .env
```

## Running the Service

### Development Mode

```bash
python app.py
```

Or using uvicorn directly:
```bash
uvicorn app:app --reload --port 8000
```

The service will start on `http://localhost:8000`

### Production Mode

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Health Check
```
GET /health
```

Returns service health status.

### Get Recommendations (Full Profile)
```
POST /recommend
Content-Type: application/json

{
  "grades": {
    "grade12": 85.0,
    "grade10": 82.0,
    "stream": "science",
    "subjects": ["Mathematics", "Physics", "Chemistry"]
  },
  "interests": {
    "careerFields": ["technology", "engineering"],
    "activities": ["programming", "robotics"],
    "workEnvironments": ["office", "remote"]
  }
}
```

### Get Recommendations (Grades Only)
```
POST /recommend/grades
Content-Type: application/json

{
  "grade12": 85.0,
  "grade10": 82.0,
  "stream": "science",
  "subjects": ["Mathematics", "Physics"]
}
```

### Get Recommendations (Interests Only)
```
POST /recommend/interests
Content-Type: application/json

{
  "careerFields": ["technology"],
  "activities": ["programming"],
  "workEnvironments": ["office"]
}
```

## Response Format

All endpoints return:
```json
{
  "recommendations": [
    {
      "id": "uuid-string",
      "title": "Software Engineer",
      "description": "...",
      "confidence": 92,
      "confidenceLevel": "High",
      "matchReason": "Strong alignment with science stream...",
      "salaryRange": "$85,000 - $170,000",
      "jobGrowth": "+22%",
      "skills": ["Programming", "Databases"],
      "opportunities": [],
      "category": "Technology"
    }
  ]
}
```

## Configuration

Environment variables (via `.env` file or system environment):

- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)
- `LOG_LEVEL`: Logging level (default: INFO)
- `CAREER_DATA_PATH`: Path to career.json file (default: ../data/career/career.json)

## Integration with Java Backend

The Java Spring Boot backend calls this service via HTTP. The service URL is configured in `application.properties`:

```properties
python.recommendation.service.url=http://localhost:8000
python.recommendation.service.enabled=true
```

## Scoring Algorithm

The recommendation engine uses a scoring system (0-100 points):

- **Stream Matching** (30 points): Matches student stream with career categories
- **Grade Matching** (25 points): Considers grade level and consistency
- **Interest Matching** (25 points): Matches user interests with career skills/fields
- **Subject Matching** (20 points): Aligns subjects with career requirements

## Troubleshooting

### Career data file not found
- Check that `data/career/career.json` exists
- Set `CAREER_DATA_PATH` environment variable to correct path

### Port already in use
- Change `PORT` in `.env` file or use `--port` flag with uvicorn

### Import errors
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

## Development

To test the service locally:
```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "grades": {
      "grade12": 85,
      "stream": "science"
    }
  }'
```

## License

Part of the CareerHoop project.

