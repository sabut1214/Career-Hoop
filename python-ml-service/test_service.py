"""
Test script to verify the Python recommendation service is working.
Run this after starting the service with: python app.py
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"


def test_health_endpoint():
    """Test the health check endpoint."""
    print("\n" + "="*60)
    print("TEST 1: Health Check Endpoint")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Health check PASSED")
            print(f"  Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"✗ Health check FAILED - Status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Health check FAILED - Service not running!")
        print("  Make sure to start the service first: python app.py")
        return False
    except Exception as e:
        print(f"✗ Health check FAILED - Error: {e}")
        return False


def test_grades_recommendation():
    """Test grade-based recommendations."""
    print("\n" + "="*60)
    print("TEST 2: Grade-Based Recommendations")
    print("="*60)
    
    test_data = {
        "grade12": 85.0,
        "grade10": 82.0,
        "stream": "science",
        "subjects": ["Mathematics", "Physics", "Chemistry"]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/recommend/grades",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            recommendations = result.get("recommendations", [])
            
            print("✓ Grade recommendation PASSED")
            print(f"  Found {len(recommendations)} recommendations")
            
            if recommendations:
                print("\n  Top 3 Recommendations:")
                for i, rec in enumerate(recommendations[:3], 1):
                    print(f"\n  {i}. {rec.get('title', 'N/A')}")
                    print(f"     Confidence: {rec.get('confidence', 0)}% ({rec.get('confidenceLevel', 'N/A')})")
                    print(f"     Category: {rec.get('category', 'N/A')}")
                    print(f"     Reason: {rec.get('matchReason', 'N/A')[:80]}...")
            
            return True
        else:
            print(f"✗ Grade recommendation FAILED - Status: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Grade recommendation FAILED - Error: {e}")
        return False


def test_interests_recommendation():
    """Test interest-based recommendations."""
    print("\n" + "="*60)
    print("TEST 3: Interest-Based Recommendations")
    print("="*60)
    
    test_data = {
        "careerFields": ["technology", "engineering"],
        "activities": ["programming", "robotics"],
        "workEnvironments": ["office", "remote"]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/recommend/interests",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            recommendations = result.get("recommendations", [])
            
            print("✓ Interest recommendation PASSED")
            print(f"  Found {len(recommendations)} recommendations")
            
            if recommendations:
                print("\n  Top 3 Recommendations:")
                for i, rec in enumerate(recommendations[:3], 1):
                    print(f"\n  {i}. {rec.get('title', 'N/A')}")
                    print(f"     Confidence: {rec.get('confidence', 0)}% ({rec.get('confidenceLevel', 'N/A')})")
                    print(f"     Category: {rec.get('category', 'N/A')}")
            
            return True
        else:
            print(f"✗ Interest recommendation FAILED - Status: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Interest recommendation FAILED - Error: {e}")
        return False


def test_full_recommendation():
    """Test full profile recommendation (grades + interests)."""
    print("\n" + "="*60)
    print("TEST 4: Full Profile Recommendations")
    print("="*60)
    
    test_data = {
        "grades": {
            "grade12": 88.0,
            "grade10": 85.0,
            "stream": "science",
            "subjects": ["Mathematics", "Physics", "Chemistry", "Computer Science"]
        },
        "interests": {
            "careerFields": ["technology"],
            "activities": ["coding", "hackathons"],
            "workEnvironments": ["startup", "remote"]
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/recommend",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            recommendations = result.get("recommendations", [])
            
            print("✓ Full profile recommendation PASSED")
            print(f"  Found {len(recommendations)} recommendations")
            
            if recommendations:
                print("\n  Top Recommendation:")
                rec = recommendations[0]
                print(f"    Title: {rec.get('title', 'N/A')}")
                print(f"    Confidence: {rec.get('confidence', 0)}% ({rec.get('confidenceLevel', 'N/A')})")
                print(f"    Salary: {rec.get('salaryRange', 'N/A')}")
                print(f"    Job Growth: {rec.get('jobGrowth', 'N/A')}")
                print(f"    Skills: {', '.join(rec.get('skills', [])[:5])}")
                print(f"    Match Reason: {rec.get('matchReason', 'N/A')}")
            
            return True
        else:
            print(f"✗ Full profile recommendation FAILED - Status: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Full profile recommendation FAILED - Error: {e}")
        return False


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("PYTHON RECOMMENDATION SERVICE - TEST SUITE")
    print("="*60)
    print("\nMake sure the service is running: python app.py")
    print("Waiting 2 seconds for service to be ready...")
    time.sleep(2)
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health_endpoint()))
    
    if results[-1][1]:  # Only continue if health check passed
        results.append(("Grade Recommendations", test_grades_recommendation()))
        results.append(("Interest Recommendations", test_interests_recommendation()))
        results.append(("Full Profile Recommendations", test_full_recommendation()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{test_name:.<40} {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! The Python recommendation service is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")


if __name__ == "__main__":
    main()

