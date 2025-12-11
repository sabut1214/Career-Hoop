/**
 * Script to enrich college data with missing fields:
 * - students (student count)
 * - tuition (tuition fees)
 * - acceptance_rate (acceptance rate percentage)
 * - founded (founded year, can use established_year if available)
 * 
 * This script reads the clean.json file and adds these fields where missing.
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract year from text, looking for patterns like '2065 B.S.', '2008 A.D.', 'established in 2008', etc.
 */
function extractYearFromText(text) {
  if (!text) return null;

  // Pattern for B.S. (Bikram Sambat) years - convert to A.D.
  // B.S. to A.D. conversion: A.D. = B.S. - 57
  const bsPattern = /(\d{4})\s*B\.S\./;
  const bsMatch = text.match(bsPattern);
  if (bsMatch) {
    const bsYear = parseInt(bsMatch[1]);
    const adYear = bsYear - 57;
    if (adYear >= 1800 && adYear <= 2025) {
      return adYear;
    }
  }

  // Pattern for A.D. years (explicitly mentioned)
  const adPattern = /(\d{4})\s*A\.D\./;
  const adMatch = text.match(adPattern);
  if (adMatch) {
    const year = parseInt(adMatch[1]);
    if (year >= 1800 && year <= 2025) {
      return year;
    }
  }

  // Pattern for "established in YYYY" or "founded in YYYY"
  const establishedPattern = /(?:established|founded)\s+(?:in\s+)?(\d{4})/i;
  const establishedMatch = text.match(establishedPattern);
  if (establishedMatch) {
    const year = parseInt(establishedMatch[1]);
    if (year >= 1800 && year <= 2025) {
      return year;
    }
  }

  // Pattern for years near "established" or "founded" keywords
  const contextPattern = /(?:established|founded|since|from).*?(\d{4})/i;
  const contextMatch = text.match(contextPattern);
  if (contextMatch) {
    const year = parseInt(contextMatch[1]);
    if (year >= 1800 && year <= 2025) {
      return year;
    }
  }

  return null;
}

/**
 * Enrich a single college entry with missing data.
 */
function enrichCollegeData(college) {
  const enriched = { ...college };

  // Extract founded year from established_year or overview text
  if (!enriched.founded) {
    if (enriched.established_year) {
      enriched.founded = enriched.established_year;
    } else {
      // Try to extract from overview
      const overview = enriched.overview || '';
      const foundedYear = extractYearFromText(overview);
      if (foundedYear) {
        enriched.founded = foundedYear;
        // Also update established_year if it was null
        if (!enriched.established_year) {
          enriched.established_year = foundedYear;
        }
      }
    }
  }

  // Add missing fields with null if they don't exist
  if (!('students' in enriched)) {
    enriched.students = null;
  }
  if (!('tuition' in enriched)) {
    enriched.tuition = null;
  }
  if (!('acceptance_rate' in enriched)) {
    enriched.acceptance_rate = null;
  }

  return enriched;
}

/**
 * Process the colleges JSON file and add missing fields.
 */
function processCollegesFile(inputFile, outputFile) {
  console.log(`Reading colleges from ${inputFile}...`);

  const data = fs.readFileSync(inputFile, 'utf8');
  const colleges = JSON.parse(data);

  console.log(`Found ${colleges.length} colleges to process.`);

  const enrichedColleges = [];
  for (let i = 0; i < colleges.length; i++) {
    if ((i + 1) % 100 === 0) {
      console.log(`Processing college ${i + 1}/${colleges.length}...`);
    }

    const enriched = enrichCollegeData(colleges[i]);
    enrichedColleges.push(enriched);
  }

  console.log(`Writing enriched data to ${outputFile}...`);
  fs.writeFileSync(outputFile, JSON.stringify(enrichedColleges, null, 2), 'utf8');

  console.log(`Done! Processed ${enrichedColleges.length} colleges.`);

  // Print statistics
  const stats = {
    withFounded: enrichedColleges.filter(c => c.founded).length,
    withStudents: enrichedColleges.filter(c => c.students).length,
    withTuition: enrichedColleges.filter(c => c.tuition).length,
    withAcceptanceRate: enrichedColleges.filter(c => c.acceptance_rate).length,
  };

  console.log('\nStatistics:');
  console.log(`  Colleges with founded year: ${stats.withFounded}`);
  console.log(`  Colleges with students data: ${stats.withStudents}`);
  console.log(`  Colleges with tuition data: ${stats.withTuition}`);
  console.log(`  Colleges with acceptance rate: ${stats.withAcceptanceRate}`);
}

// Main execution
if (require.main === module) {
  const scriptDir = __dirname;
  const projectRoot = path.resolve(scriptDir, '..');
  const inputFile = path.join(projectRoot, 'data', 'colleges', 'clean.json');
  const outputFile = path.join(projectRoot, 'data', 'colleges', 'clean.json');

  // Create backup first
  const backupFile = path.join(projectRoot, 'data', 'colleges', 'clean.json.backup');
  if (fs.existsSync(inputFile)) {
    console.log(`Creating backup at ${backupFile}...`);
    fs.copyFileSync(inputFile, backupFile);
  }

  processCollegesFile(inputFile, outputFile);
}

module.exports = { enrichCollegeData, extractYearFromText };

