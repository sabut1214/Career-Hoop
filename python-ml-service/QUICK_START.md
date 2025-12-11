# Quick Start Guide - Python ML Recommendation Service

## Setup Steps

### 1. Install Python Dependencies

```bash
cd python-ml-service
pip install -r requirements.txt
```

Or create a virtual environment (recommended):
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. Verify Career Data Path

Make sure the career data file exists at:
- `../data/career/career.json` (relative to python-ml-service folder)

Or set the path via environment variable:
```bash
set CAREER_DATA_PATH=E:\CareerHoop\data\career\career.json  # Windows
export CAREER_DATA_PATH=/path/to/data/career/career.json     # Linux/Mac
```

### 3. Start the Python Service

```bash
python app.py
```

The service will start on `http://localhost:8000`

### 4. Verify It's Working

Open your browser or use curl:
```bash
curl http://localhost:8000/health
```

You should see:
```json
{
  "status": "healthy",
  "service": "career-recommendation-service",
  "version": "1.0.0"
}
```

### 5. Test the Recommendation Endpoint

```bash
curl -X POST http://localhost:8000/recommend/grades ^
  -H "Content-Type: application/json" ^
  -d "{\"grade12\": 85, \"stream\": \"science\", \"subjects\": [\"Mathematics\", \"Physics\"]}"
```

### 6. Start Your Java Backend

The Java backend will automatically call the Python service when:
- Python service is running on `http://localhost:8000`
- `python.recommendation.service.enabled=true` in `application.properties`

If the Python service is unavailable, the Java backend will automatically fall back to the existing recommendation logic.

## Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Python ML Recommendation Service Configuration
python.recommendation.service.url=http://localhost:8000
python.recommendation.service.enabled=true
python.recommendation.service.timeout=5000
```

## Troubleshooting

### Python service not responding
- Check if service is running: `curl http://localhost:8000/health`
- Check port 8000 is not in use
- Check Python dependencies are installed

### Career data not found
- Verify `data/career/career.json` exists
- Set `CAREER_DATA_PATH` environment variable

### Java backend not calling Python service
- Check `python.recommendation.service.enabled=true`
- Check Java backend logs for errors
- Fallback logic will activate automatically if Python service is down

## Next Steps

1. Test with your frontend to see improved recommendations
2. Monitor logs to see which service is being used
3. Adjust scoring algorithms in `recommendation.py` if needed

