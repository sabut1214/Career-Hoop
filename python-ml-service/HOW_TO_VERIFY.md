# How to Verify Python Recommendation Service is Working

## Method 1: Quick Test Script (Easiest)

1. **Start the Python service** (in one terminal):
   ```powershell
   cd python-ml-service
   python app.py
   ```

2. **Run the test script** (in another terminal):
   ```powershell
   cd python-ml-service
   pip install requests  # If not already installed
   python test_service.py
   ```

The test script will:
- Check if the service is running
- Test all recommendation endpoints
- Show sample recommendations
- Display a summary of results

---

## Method 2: Manual Testing with PowerShell

### Step 1: Verify Service is Running

```powershell
# Check health endpoint
Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{"status":"healthy","service":"career-recommendation-service","version":"1.0.0"}
```

### Step 2: Test Grade-Based Recommendations

```powershell
$body = @{
    grade12 = 85.0
    grade10 = 82.0
    stream = "science"
    subjects = @("Mathematics", "Physics", "Chemistry")
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/recommend/grades -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

**Expected:** JSON with recommendations array containing career suggestions.

### Step 3: Test Interest-Based Recommendations

```powershell
$body = @{
    careerFields = @("technology", "engineering")
    activities = @("programming", "robotics")
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/recommend/interests -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

---

## Method 3: Verify Java Backend Integration

### Step 1: Start Both Services

1. **Start Python service:**
   ```powershell
   cd python-ml-service
   python app.py
   ```

2. **Start Java backend:**
   ```powershell
   cd backend
   ./mvnw spring-boot:run
   ```

### Step 2: Check Java Backend Logs

When you make a recommendation request, look for these log messages:

**If Python service is being used:**
```
DEBUG: Calling Python recommendation service: http://localhost:8000/recommend/grades
```

**If fallback is used:**
```
WARN: Failed to call Python recommendation service: ... Falling back to default logic.
```

### Step 3: Test via Java API

Make a POST request to your Java backend:

```powershell
$body = @{
    grade12 = 85.0
    stream = "science"
    subjects = @("Mathematics", "Physics")
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8080/api/recommendations/grades -Method POST -Body $body -ContentType "application/json" -Headers @{Authorization="Bearer YOUR_TOKEN"} | ConvertTo-Json -Depth 10
```

**To verify Python is being used:**
- Check that recommendations are different from before
- Check match reasons are more detailed
- Check Java backend logs show Python service calls

---

## Method 4: Compare Recommendations

### Test with Same Input

**Without Python (disable in application.properties):**
```properties
python.recommendation.service.enabled=false
```

**With Python (enable in application.properties):**
```properties
python.recommendation.service.enabled=true
```

Compare the results - Python recommendations should be:
- More personalized
- Have better match reasons
- Consider more factors (subjects, interests)
- Show confidence scores based on multiple criteria

---

## Method 5: Check Service Status

### Verify Python Service is Listening

```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000
```

### Check Service Logs

When running `python app.py`, you should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

When a request comes in:
```
INFO:     127.0.0.1:xxxxx - "POST /recommend/grades HTTP/1.1" 200 OK
```

---

## Common Issues and Solutions

### Issue: "Connection refused" or "Service not running"

**Solution:**
1. Make sure Python service is running: `python app.py`
2. Check port 8000 is not blocked
3. Verify service started without errors

### Issue: "Career data file not found"

**Solution:**
1. Verify `data/career/career.json` exists
2. Set `CAREER_DATA_PATH` environment variable if needed:
   ```powershell
   $env:CAREER_DATA_PATH="E:\CareerHoop\data\career\career.json"
   ```

### Issue: Java backend not calling Python service

**Solution:**
1. Check `application.properties`:
   ```properties
   python.recommendation.service.enabled=true
   python.recommendation.service.url=http://localhost:8000
   ```
2. Check Java backend logs for errors
3. Verify Python service is accessible from Java backend

### Issue: Recommendations look the same

**Solution:**
1. Clear browser cache
2. Check Java logs to confirm Python service is being called
3. Try different input values (different grades/streams/interests)
4. Compare match reasons - Python ones should be more detailed

---

## Quick Verification Checklist

- [ ] Python service starts without errors
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Grade recommendations endpoint returns results
- [ ] Interest recommendations endpoint returns results
- [ ] Java backend can connect to Python service
- [ ] Java backend logs show Python service calls
- [ ] Recommendations have detailed match reasons
- [ ] Recommendations differ from old hardcoded ones

---

## Expected Behavior

**When Python service is working:**
- Recommendations have confidence scores 60-98%
- Match reasons explain WHY (e.g., "Strong alignment with science stream (30pts) + Excellent grades (25pts)...")
- Recommendations consider multiple factors (stream, grades, subjects, interests)
- Different inputs produce different recommendations
- Service responds quickly (< 1 second)

**When fallback is used:**
- Java logs show warning messages
- Recommendations use old hardcoded logic
- Match reasons are simpler/generic
- Still works, just not as smart

