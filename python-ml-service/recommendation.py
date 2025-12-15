"""
Recommendation scoring algorithm for career matching.
Uses similarity scoring based on stream, grades, interests, and subjects.
"""

import json
import uuid
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from config import config


def load_careers() -> List[Dict[str, Any]]:
    """Load career data from JSON file."""
    career_path = config.resolve_career_data_path()
    
    if not career_path.exists():
        raise FileNotFoundError(f"Career data file not found: {career_path}")
    
    with open(career_path, 'r', encoding='utf-8') as f:
        careers = json.load(f)
    
    return careers


def calculate_stream_match(stream: str, career_category: str) -> int:
    """
    Calculate match score based on stream and career category.
    Returns: 0-30 points
    """
    stream_lower = stream.lower()
    category_lower = career_category.lower()
    
    # Science stream matches
    if "science" in stream_lower:
        tech_categories = ["technology", "engineering", "science", "healthcare", "medical", "data science", "gaming"]
        if any(cat in category_lower for cat in tech_categories):
            return 30
    
    # Commerce/Business stream matches
    if any(word in stream_lower for word in ["commerce", "business", "management", "accounting"]):
        business_categories = ["business", "finance", "marketing", "banking"]
        if any(cat in category_lower for cat in business_categories):
            return 30
    
    # Arts/Humanities stream matches
    if any(word in stream_lower for word in ["arts", "humanities", "fine arts"]):
        creative_categories = ["design", "media", "education", "arts", "entertainment", "marketing"]
        if any(cat in category_lower for cat in creative_categories):
            return 30
    
    # General stream - partial match
    if stream_lower == "general":
        return 15
    
    return 0


def calculate_grade_match(grade12: float, grade10: Optional[float] = None, career_category: str = "") -> int:
    """
    Calculate match score based on grade level.
    Returns: 0-25 points
    """
    score = 0
    
    # Grade 12 scoring
    if grade12 >= 90:
        score += 25
    elif grade12 >= 80:
        score += 20
    elif grade12 >= 70:
        score += 15
    else:
        score += 10
    
    # Grade consistency bonus
    if grade10 is not None:
        grade_diff = abs(grade12 - grade10)
        if grade_diff < 5:
            score += 5
        elif grade_diff > 15:
            score -= 5
    
    return max(0, min(30, score))  # Cap at 30 points


def calculate_interest_match(
    career_fields: List[str],
    activities: List[str],
    career_category: str,
    career_skills: List[str]
) -> int:
    """
    Calculate match score based on user interests and activities.
    Returns: 0-25 points
    """
    score = 0
    
    # Normalize strings for comparison
    career_fields_lower = [f.lower() for f in career_fields]
    activities_lower = [a.lower() for a in activities]
    career_category_lower = career_category.lower()
    career_skills_lower = [s.lower() for s in career_skills] if career_skills else []
    
    # Field matching (10 points max)
    field_keywords = {
        "technology": ["technology", "tech", "it", "software", "programming", "coding"],
        "engineering": ["engineering", "engineer"],
        "business": ["business", "commerce", "finance", "marketing"],
        "medicine": ["medicine", "medical", "healthcare", "health"],
        "arts": ["arts", "design", "creative", "media"],
        "science": ["science", "research"],
        "education": ["education", "teaching"],
    }
    
    for field in career_fields_lower:
        for keyword, matches in field_keywords.items():
            if field in keyword or any(m in field for m in matches):
                if any(m in career_category_lower for m in matches):
                    score += 10
                    break
    
    # Activity matching (10 points max)
    activity_keywords = {
        "programming": ["programming", "coding", "software", "development"],
        "design": ["design", "creative", "art", "sketching"],
        "leadership": ["leadership", "management", "organizing"],
        "research": ["research", "analysis", "studying"],
    }
    
    for activity in activities_lower:
        for keyword, matches in activity_keywords.items():
            if any(m in activity for m in matches):
                # Check if matches career skills or category
                if any(m in ' '.join(career_skills_lower) for m in matches) or \
                   any(m in career_category_lower for m in matches):
                    score += 5
                    break
    
    # Category-interest alignment bonus (5 points)
    if any(field in career_category_lower for field in career_fields_lower):
        score += 5
    
    return min(25, score)  # Cap at 25 points


def calculate_subject_match(subjects: List[str], career_category: str, career_skills: List[str]) -> int:
    """
    Calculate match score based on user subjects and career requirements.
    Returns: 0-20 points
    """
    score = 0
    subjects_lower = [s.lower() for s in subjects]
    category_lower = career_category.lower()
    skills_lower = [s.lower() for s in career_skills] if career_skills else []
    all_text = ' '.join(subjects_lower + skills_lower + [category_lower])
    
    # Math/Physics subjects → Tech/Engineering careers
    if any(subj in subjects_lower for subj in ["mathematics", "math", "physics"]):
        if any(cat in category_lower for cat in ["technology", "engineering", "science", "data"]):
            score += 15
    
    # Biology/Chemistry subjects → Medical/Healthcare careers
    if any(subj in subjects_lower for subj in ["biology", "chemistry"]):
        if any(cat in category_lower for cat in ["medical", "healthcare", "health", "science"]):
            score += 15
    
    # Economics/Accounts subjects → Business careers
    if any(subj in subjects_lower for subj in ["economics", "accounting", "accounts", "business"]):
        if any(cat in category_lower for cat in ["business", "finance", "marketing"]):
            score += 15
    
    # English/Literature subjects → Arts/Media careers
    if any(subj in subjects_lower for subj in ["english", "literature", "language"]):
        if any(cat in category_lower for cat in ["arts", "design", "media", "education"]):
            score += 10
    
    # Skill-subject alignment
    for subject in subjects_lower:
        if any(subject in skill or skill in subject for skill in skills_lower):
            score += 5
            break
    
    return min(20, score)  # Cap at 20 points


def generate_match_reason(
    stream: str,
    grade12: float,
    total_score: int,
    stream_score: int,
    grade_score: int,
    interest_score: int,
    subject_score: int
) -> str:
    """Generate a human-readable explanation for the match."""
    reasons = []
    
    if stream_score >= 20:
        reasons.append(f"Strong alignment with {stream} stream")
    
    if grade_score >= 20:
        reasons.append(f"Excellent academic performance ({grade12:.1f}%)")
    elif grade_score >= 15:
        reasons.append(f"Good academic performance ({grade12:.1f}%)")
    
    if interest_score >= 15:
        reasons.append("Strong interest match")
    
    if subject_score >= 10:
        reasons.append("Relevant subject background")
    
    if not reasons:
        reasons.append("General match based on profile")
    
    score_breakdown = f"Match breakdown: Stream ({stream_score}pts) + Grades ({grade_score}pts) + Interests ({interest_score}pts) + Subjects ({subject_score}pts) = {total_score}%"
    
    return f"{', '.join(reasons)}. {score_breakdown}"


def get_recommendations(
    grade12: float,
    stream: str,
    grade10: Optional[float] = None,
    subjects: Optional[List[str]] = None,
    career_fields: Optional[List[str]] = None,
    activities: Optional[List[str]] = None,
    work_environments: Optional[List[str]] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Get career recommendations based on user profile.
    
    Args:
        grade12: Grade 12 percentage
        stream: Student stream (science/commerce/arts)
        grade10: Optional Grade 10 percentage
        subjects: Optional list of subjects
        career_fields: Optional list of career fields of interest
        activities: Optional list of activities
        work_environments: Optional list of preferred work environments
        limit: Maximum number of recommendations to return
    
    Returns:
        List of career recommendations with scores
    """
    # Load careers
    careers = load_careers()
    
    # Normalize inputs
    subjects = subjects or []
    career_fields = career_fields or []
    activities = activities or []
    stream = stream.lower() if stream else "general"
    
    # Calculate scores for each career
    scored_careers = []
    
    for career in careers:
        career_category = career.get("category", "").lower()
        career_skills = career.get("skills", [])
        if isinstance(career_skills, str):
            career_skills = [career_skills]
        
        # Calculate individual scores
        stream_score = calculate_stream_match(stream, career_category)
        grade_score = calculate_grade_match(grade12, grade10, career_category)
        interest_score = calculate_interest_match(career_fields, activities, career_category, career_skills)
        subject_score = calculate_subject_match(subjects, career_category, career_skills)
        
        # Total score (0-100, converted to percentage)
        total_score = stream_score + grade_score + interest_score + subject_score
        confidence = min(98, max(60, total_score))  # Confidence between 60-98%
        
        # Skip careers with very low scores
        if total_score < 30:
            continue
        
        # Generate match reason
        match_reason = generate_match_reason(
            stream, grade12, confidence, stream_score, grade_score, interest_score, subject_score
        )
        
        # Determine confidence level
        if confidence >= 85:
            confidence_level = "High"
        elif confidence >= 70:
            confidence_level = "Medium"
        else:
            confidence_level = "Low"
        
        # Format job outlook
        job_outlook = career.get("jobOutlook", "Moderate")
        if isinstance(job_outlook, str):
            if "high" in job_outlook.lower() or "very high" in job_outlook.lower():
                job_growth = f"+{20 + (confidence // 10)}%"
            elif "moderate" in job_outlook.lower():
                job_growth = f"+{10 + (confidence // 20)}%"
            else:
                job_growth = "+5%"
        else:
            job_growth = "+10%"
        
        # Build recommendation
        recommendation = {
            "id": str(uuid.uuid4()),
            "title": career.get("careerName", "Unknown Career"),
            "description": career.get("description", ""),
            "confidence": confidence,
            "confidenceLevel": confidence_level,
            "matchReason": match_reason,
            "salaryRange": career.get("averageSalaryUSD", "N/A"),
            "jobGrowth": job_growth,
            "skills": career_skills if isinstance(career_skills, list) else [],
            "opportunities": [],  # Can be enhanced later
            "category": career.get("category", "General"),
            "_totalScore": total_score  # Internal use for sorting
        }
        
        scored_careers.append(recommendation)
    
    # Sort by total score (descending) and return top N
    scored_careers.sort(key=lambda x: x["_totalScore"], reverse=True)
    
    # Remove internal score field before returning
    for rec in scored_careers:
        rec.pop("_totalScore", None)
    
    return scored_careers[:limit]


def score_college_for_profile(
    college: Dict[str, Any],
    grade12: float,
    stream: str,
    subjects: List[str],
    grade10: Optional[float] = None
) -> Tuple[int, str]:
    """
    Score a college based on user profile.
    
    Args:
        college: College data dictionary
        grade12: Grade 12 percentage
        stream: Student stream
        subjects: List of subjects
        grade10: Optional Grade 10 percentage
    
    Returns:
        Tuple of (score, match_reason)
    """
    score = 0
    reasons = []
    
    # Normalize inputs
    stream_lower = stream.lower() if stream else "general"
    subjects_lower = [s.lower() for s in subjects] if subjects else []
    
    # Extract college information
    college_name = str(college.get("name", "")).lower()
    college_overview = str(college.get("overview", "")).lower()
    college_programs = str(college.get("programs", "")).lower()
    college_courses = str(college.get("coursesOffered", "")).lower()
    college_type = str(college.get("type", "")).lower()
    college_affiliation = str(college.get("affiliation", "")).lower()
    
    all_college_text = f"{college_name} {college_overview} {college_programs} {college_courses} {college_type} {college_affiliation}"
    
    # Stream-based matching (0-30 points)
    if "science" in stream_lower:
        science_keywords = ["science", "engineering", "technology", "medical", "health", "physics", "chemistry", "biology", "math"]
        if any(keyword in all_college_text for keyword in science_keywords):
            score += 30
            reasons.append("Strong match for Science stream")
    elif any(word in stream_lower for word in ["commerce", "business"]):
        commerce_keywords = ["commerce", "business", "management", "accounting", "finance", "economics"]
        if any(keyword in all_college_text for keyword in commerce_keywords):
            score += 30
            reasons.append("Strong match for Commerce stream")
    elif any(word in stream_lower for word in ["arts", "humanities"]):
        arts_keywords = ["arts", "humanities", "design", "media", "literature", "language", "fine arts"]
        if any(keyword in all_college_text for keyword in arts_keywords):
            score += 30
            reasons.append("Strong match for Arts stream")
    else:
        score += 15  # General stream gets partial points
        reasons.append("General stream match")
    
    # Grade-based matching (0-25 points)
    if grade12 >= 90:
        score += 25
        reasons.append(f"Excellent grades ({grade12:.1f}%)")
    elif grade12 >= 80:
        score += 20
        reasons.append(f"Good grades ({grade12:.1f}%)")
    elif grade12 >= 70:
        score += 15
        reasons.append(f"Average grades ({grade12:.1f}%)")
    else:
        score += 10
        reasons.append(f"Grades ({grade12:.1f}%)")
    
    # Subject-based matching (0-20 points)
    subject_keywords = {
        "mathematics": ["math", "mathematics", "engineering", "science"],
        "physics": ["physics", "engineering", "science", "technology"],
        "chemistry": ["chemistry", "science", "medical", "pharmacy"],
        "biology": ["biology", "medical", "health", "pharmacy", "nursing"],
        "economics": ["economics", "commerce", "business", "finance"],
        "accounting": ["accounting", "commerce", "business", "finance"],
        "english": ["english", "literature", "language", "arts", "humanities"],
    }
    
    subject_score = 0
    for subject in subjects_lower:
        if subject in subject_keywords:
            keywords = subject_keywords[subject]
            if any(keyword in all_college_text for keyword in keywords):
                subject_score += 10
    
    score += min(20, subject_score)
    if subject_score > 0:
        reasons.append("Relevant subject alignment")
    
    # College quality indicators (0-15 points)
    if college.get("rating"):
        try:
            rating = float(college.get("rating", 0))
            if rating >= 4.5:
                score += 15
            elif rating >= 4.0:
                score += 10
            elif rating >= 3.5:
                score += 5
        except (ValueError, TypeError):
            pass
    
    if college.get("overview") and len(str(college.get("overview", ""))) > 100:
        score += 5
        reasons.append("Well-documented college")
    
    # Cap total score at 100
    total_score = min(100, score)
    
    # Generate match reason
    if not reasons:
        match_reason = f"General match based on {stream} stream and {grade12:.1f}% grades"
    else:
        match_reason = ", ".join(reasons[:3])  # Limit to top 3 reasons
    
    return total_score, match_reason


def get_college_recommendations(
    colleges: List[Dict[str, Any]],
    grade12: float,
    stream: str,
    subjects: Optional[List[str]] = None,
    grade10: Optional[float] = None,
    limit: int = 4
) -> List[Dict[str, Any]]:
    """
    Get college recommendations based on user profile.
    
    Args:
        colleges: List of college dictionaries from backend
        grade12: Grade 12 percentage
        stream: Student stream
        subjects: Optional list of subjects
        grade10: Optional Grade 10 percentage
        limit: Maximum number of recommendations to return
    
    Returns:
        List of scored college recommendations
    """
    subjects = subjects or []
    
    scored_colleges = []
    
    for college in colleges:
        score, match_reason = score_college_for_profile(
            college, grade12, stream, subjects, grade10
        )
        
        # Skip colleges with very low scores
        if score < 30:
            continue
        
        # Add score and match reason to college
        college_with_score = {
            **college,
            "matchScore": score,
            "highlight": match_reason,
            "_totalScore": score  # Internal use for sorting
        }
        
        scored_colleges.append(college_with_score)
    
    # Sort by total score (descending) and return top N
    scored_colleges.sort(key=lambda x: x.get("_totalScore", 0), reverse=True)
    
    # Remove internal score field before returning
    for college in scored_colleges:
        college.pop("_totalScore", None)
    
    return scored_colleges[:limit]
