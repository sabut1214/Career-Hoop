"""
Script to enrich college data with missing fields:
- students (student count)
- tuition (tuition fees)
- acceptance_rate (acceptance rate percentage)
- founded (founded year, can use established_year if available)

This script reads the clean.json file and adds these fields where missing.
"""

import json
import re
from typing import Dict, Any, Optional
from pathlib import Path

def extract_year_from_text(text: str) -> Optional[int]:
    """Extract year from text, looking for patterns like '2065 B.S.', '2008 A.D.', 'established in 2008', etc."""
    if not text:
        return None
    
    # Pattern for B.S. (Bikram Sambat) years - convert to A.D.
    # B.S. to A.D. conversion: A.D. = B.S. - 57 (approximately, can vary slightly)
    bs_pattern = r'(\d{4})\s*B\.S\.'
    bs_match = re.search(bs_pattern, text)
    if bs_match:
        bs_year = int(bs_match.group(1))
        # B.S. to A.D. conversion: A.D. = B.S. - 57
        ad_year = bs_year - 57
        # Validate converted year is reasonable
        if 1800 <= ad_year <= 2025:
            return ad_year
    
    # Pattern for A.D. years (explicitly mentioned)
    ad_pattern = r'(\d{4})\s*A\.D\.'
    ad_match = re.search(ad_pattern, text)
    if ad_match:
        year = int(ad_match.group(1))
        if 1800 <= year <= 2025:
            return year
    
    # Pattern for "established in YYYY" or "founded in YYYY" (with or without "in")
    established_pattern = r'(?:established|founded)\s+(?:in\s+)?(\d{4})'
    established_match = re.search(established_pattern, text, re.IGNORECASE)
    if established_match:
        year = int(established_match.group(1))
        # Validate year is reasonable (between 1800 and current year)
        if 1800 <= year <= 2025:
            return year
    
    # Pattern for any 4-digit year in reasonable range (as fallback)
    # Look for years near "established" or "founded" keywords
    context_pattern = r'(?:established|founded|since|from).*?(\d{4})'
    context_match = re.search(context_pattern, text, re.IGNORECASE)
    if context_match:
        year = int(context_match.group(1))
        if 1800 <= year <= 2025:
            return year
    
    return None

def search_college_info_online(college_name: str, location: str) -> Dict[str, Any]:
    """
    Search for college information online.
    Note: This is a placeholder - in production, you'd use a web scraping API
    or search service. For now, returns empty dict.
    """
    # TODO: Implement actual web search/scraping
    # This could use:
    # - Google Custom Search API
    # - Web scraping with BeautifulSoup
    # - College information APIs
    return {}

def enrich_college_data(college: Dict[str, Any]) -> Dict[str, Any]:
    """Enrich a single college entry with missing data."""
    enriched = college.copy()
    
    # Extract founded year from established_year or overview text
    if not enriched.get('founded'):
        if enriched.get('established_year'):
            enriched['founded'] = enriched['established_year']
        else:
            # Try to extract from overview
            overview = enriched.get('overview', '')
            founded_year = extract_year_from_text(overview)
            if founded_year:
                enriched['founded'] = founded_year
                # Also update established_year if it was null
                if not enriched.get('established_year'):
                    enriched['established_year'] = founded_year
    
    # Add missing fields with None if they don't exist
    if 'students' not in enriched:
        enriched['students'] = None
    if 'tuition' not in enriched:
        enriched['tuition'] = None
    if 'acceptance_rate' not in enriched:
        enriched['acceptance_rate'] = None
    
    return enriched

def process_colleges_file(input_file: str, output_file: str):
    """Process the colleges JSON file and add missing fields."""
    print(f"Reading colleges from {input_file}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        colleges = json.load(f)
    
    print(f"Found {len(colleges)} colleges to process.")
    
    enriched_colleges = []
    for i, college in enumerate(colleges):
        if (i + 1) % 100 == 0:
            print(f"Processing college {i + 1}/{len(colleges)}...")
        
        enriched = enrich_college_data(college)
        enriched_colleges.append(enriched)
    
    print(f"Writing enriched data to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enriched_colleges, f, indent=2, ensure_ascii=False)
    
    print(f"Done! Processed {len(enriched_colleges)} colleges.")
    
    # Print statistics
    stats = {
        'with_founded': sum(1 for c in enriched_colleges if c.get('founded')),
        'with_students': sum(1 for c in enriched_colleges if c.get('students')),
        'with_tuition': sum(1 for c in enriched_colleges if c.get('tuition')),
        'with_acceptance_rate': sum(1 for c in enriched_colleges if c.get('acceptance_rate')),
    }
    print("\nStatistics:")
    print(f"  Colleges with founded year: {stats['with_founded']}")
    print(f"  Colleges with students data: {stats['with_students']}")
    print(f"  Colleges with tuition data: {stats['with_tuition']}")
    print(f"  Colleges with acceptance rate: {stats['with_acceptance_rate']}")

if __name__ == "__main__":
    # File paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    input_file = project_root / "data" / "colleges" / "clean.json"
    output_file = project_root / "data" / "colleges" / "clean.json"
    
    # Create backup first
    backup_file = project_root / "data" / "colleges" / "clean.json.backup"
    if input_file.exists():
        print(f"Creating backup at {backup_file}...")
        import shutil
        shutil.copy2(input_file, backup_file)
    
    process_colleges_file(str(input_file), str(output_file))

