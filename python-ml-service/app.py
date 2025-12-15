"""
FastAPI application for career recommendations.
Provides REST API endpoints for the recommendation service.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import uvicorn
from config import config
from recommendation import get_recommendations, get_college_recommendations

# Initialize FastAPI app
app = FastAPI(
    title="CareerHoop Recommendation Service",
    description="Smart career recommendation API using similarity scoring",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class GradesInput(BaseModel):
    grade10: Optional[float] = Field(None, ge=0, le=100, description="Grade 10 percentage")
    grade12: float = Field(..., ge=0, le=100, description="Grade 12 percentage")
    stream: str = Field(..., description="Student stream (science/commerce/arts/general)")
    subjects: Optional[List[str]] = Field(default_factory=list, description="List of subjects")


class InterestsInput(BaseModel):
    careerFields: Optional[List[str]] = Field(default_factory=list, description="Career fields of interest")
    activities: Optional[List[str]] = Field(default_factory=list, description="Activities and hobbies")
    workEnvironments: Optional[List[str]] = Field(default_factory=list, description="Preferred work environments")


class RecommendationRequest(BaseModel):
    grades: Optional[GradesInput] = None
    interests: Optional[InterestsInput] = None


class CareerRecommendation(BaseModel):
    id: str
    title: str
    description: str
    confidence: int
    confidenceLevel: str
    matchReason: str
    salaryRange: str
    jobGrowth: str
    skills: List[str]
    opportunities: List[str]
    category: str


class RecommendationResponse(BaseModel):
    recommendations: List[CareerRecommendation]


class CollegeInput(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    location: Optional[str] = None
    affiliation: Optional[str] = None
    overview: Optional[str] = None
    programs: Optional[str] = None
    coursesOffered: Optional[str] = None
    type: Optional[str] = None
    rating: Optional[float] = None
    feesRange: Optional[str] = None
    website: Optional[str] = None
    students: Optional[str] = None
    tuition: Optional[str] = None
    acceptanceRate: Optional[str] = None


class CollegeRecommendationRequest(BaseModel):
    grades: GradesInput
    colleges: List[CollegeInput] = Field(..., description="List of colleges to score")
    limit: Optional[int] = Field(4, ge=1, le=20, description="Maximum number of recommendations")


class CollegeRecommendationResponse(BaseModel):
    recommendations: List[dict]  # Colleges with scores added


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "career-recommendation-service",
        "version": "1.0.0"
    }


# Main recommendation endpoint
@app.post("/recommend", response_model=RecommendationResponse)
async def get_career_recommendations(request: RecommendationRequest):
    """
    Get career recommendations based on user profile.
    
    Accepts grades and/or interests information and returns
    personalized career recommendations with confidence scores.
    """
    try:
        # Extract grades information
        grade12 = 70.0  # Default
        grade10 = None
        stream = "general"
        subjects = []
        
        if request.grades:
            grade12 = request.grades.grade12
            grade10 = request.grades.grade10
            stream = request.grades.stream or "general"
            subjects = request.grades.subjects or []
        
        # Extract interests information
        career_fields = []
        activities = []
        work_environments = []
        
        if request.interests:
            career_fields = request.interests.careerFields or []
            activities = request.interests.activities or []
            work_environments = request.interests.workEnvironments or []
        
        # Get recommendations
        recommendations = get_recommendations(
            grade12=grade12,
            stream=stream,
            grade10=grade10,
            subjects=subjects,
            career_fields=career_fields,
            activities=activities,
            work_environments=work_environments,
            limit=15  # Return top 15, frontend can filter
        )
        
        if not recommendations:
            # Return default recommendation if none found
            recommendations = [{
                "id": "default-1",
                "title": "Career Explorer",
                "description": "Explore multiple career areas while strengthening transferable skills.",
                "confidence": 60,
                "confidenceLevel": "Low",
                "matchReason": "General recommendation for career exploration.",
                "salaryRange": "$45,000 - $95,000",
                "jobGrowth": "+5%",
                "skills": ["Communication", "Digital Literacy", "Problem Solving"],
                "opportunities": ["Entry-level programs", "Internships"],
                "category": "General"
            }]
        
        return RecommendationResponse(recommendations=recommendations)
    
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Career data file not found: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


# Simplified endpoint for grades-only recommendations
@app.post("/recommend/grades", response_model=RecommendationResponse)
async def get_grade_recommendations(grades: GradesInput):
    """Get recommendations based on grades only."""
    try:
        recommendations = get_recommendations(
            grade12=grades.grade12,
            stream=grades.stream,
            grade10=grades.grade10,
            subjects=grades.subjects or [],
            limit=15
        )
        
        if not recommendations:
            recommendations = [{
                "id": "default-1",
                "title": "Career Explorer",
                "description": "Explore multiple career areas while strengthening transferable skills.",
                "confidence": 60,
                "confidenceLevel": "Low",
                "matchReason": "General recommendation based on academic profile.",
                "salaryRange": "$45,000 - $95,000",
                "jobGrowth": "+5%",
                "skills": ["Communication", "Digital Literacy", "Problem Solving"],
                "opportunities": ["Entry-level programs", "Internships"],
                "category": "General"
            }]
        
        return RecommendationResponse(recommendations=recommendations)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


# Simplified endpoint for interests-only recommendations
@app.post("/recommend/interests", response_model=RecommendationResponse)
async def get_interest_recommendations(interests: InterestsInput):
    """Get recommendations based on interests only."""
    try:
        recommendations = get_recommendations(
            grade12=70.0,  # Default average grade
            stream="general",
            career_fields=interests.careerFields or [],
            activities=interests.activities or [],
            work_environments=interests.workEnvironments or [],
            limit=15
        )
        
        if not recommendations:
            recommendations = [{
                "id": "default-1",
                "title": "Career Explorer",
                "description": "Explore multiple career areas while strengthening transferable skills.",
                "confidence": 60,
                "confidenceLevel": "Low",
                "matchReason": "General recommendation based on interests.",
                "salaryRange": "$45,000 - $95,000",
                "jobGrowth": "+5%",
                "skills": ["Communication", "Digital Literacy", "Problem Solving"],
                "opportunities": ["Entry-level programs", "Internships"],
                "category": "General"
            }]
        
        return RecommendationResponse(recommendations=recommendations)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


# College recommendation endpoint
@app.post("/recommend/colleges", response_model=CollegeRecommendationResponse)
async def get_college_recommendations_endpoint(request: CollegeRecommendationRequest):
    """Get college recommendations based on user grades and profile."""
    try:
        # Convert Pydantic models to dictionaries
        colleges_data = [college.dict(exclude_none=True) for college in request.colleges]
        
        # Get recommendations
        recommendations = get_college_recommendations(
            colleges=colleges_data,
            grade12=request.grades.grade12,
            stream=request.grades.stream,
            subjects=request.grades.subjects or [],
            grade10=request.grades.grade10,
            limit=request.limit or 20
        )
        
        return CollegeRecommendationResponse(recommendations=recommendations)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating college recommendations: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=config.HOST,
        port=config.PORT,
        log_level=config.LOG_LEVEL.lower(),
        reload=True  # Auto-reload on code changes (development)
    )

