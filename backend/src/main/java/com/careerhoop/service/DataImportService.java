package com.careerhoop.service;

import com.careerhoop.entity.College;
import com.careerhoop.entity.Program;
import com.careerhoop.entity.University;
import com.careerhoop.entity.Syllabus;
import com.careerhoop.entity.PopularCollege;
import com.careerhoop.entity.Career;
import com.careerhoop.repository.CollegeRepository;
import com.careerhoop.repository.ProgramRepository;
import com.careerhoop.repository.UniversityRepository;
import com.careerhoop.repository.SyllabusRepository;
import com.careerhoop.repository.PopularCollegeRepository;
import com.careerhoop.repository.CareerRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Service
public class DataImportService {

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private UniversityRepository universityRepository;

    @Autowired
    private SyllabusRepository syllabusRepository;

    @Autowired
    private PopularCollegeRepository popularCollegeRepository;

    @Autowired
    private CareerRepository careerRepository;

    @Value("${data.import.path:}")
    private String dataImportPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getStringValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof String) {
            return (String) value;
        }
        return value.toString();
    }

    private Path resolveDataPath(String filePath) {
        // If absolute path is provided, use it
        if (dataImportPath != null && !dataImportPath.isEmpty()) {
            return Paths.get(dataImportPath, filePath);
        }
        
        // Otherwise, try to resolve relative to project root
        // Try multiple possible locations
        String[] possiblePaths = {
            "../../data",  // From backend/target/classes
            "../data",     // From backend/
            "data",        // If running from root
            System.getProperty("user.dir") + "/data"  // Absolute from working directory
        };
        
        for (String basePath : possiblePaths) {
            Path fullPath = Paths.get(basePath, filePath);
            if (Files.exists(fullPath)) {
                return fullPath;
            }
        }
        
        // Last resort: try from user.dir
        return Paths.get(System.getProperty("user.dir"), "data", filePath);
    }

    @Transactional
    public void importColleges(String filePath) throws Exception {
        Path fullPath = resolveDataPath(filePath);
        if (!Files.exists(fullPath)) {
            throw new RuntimeException("Data file not found: " + fullPath.toAbsolutePath());
        }
        InputStream inputStream = Files.newInputStream(fullPath);
        List<Map<String, Object>> colleges = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});

        for (Map<String, Object> collegeData : colleges) {
            College college = new College();
            college.setName(getStringValue(collegeData.get("name")));
            college.setLocation(getStringValue(collegeData.get("location")));
            college.setAffiliation(getStringValue(collegeData.get("affiliation")));
            
            Object establishedYear = collegeData.get("established_year");
            if (establishedYear != null) {
                if (establishedYear instanceof Integer) {
                    college.setEstablishedYear((Integer) establishedYear);
                } else if (establishedYear instanceof Number) {
                    college.setEstablishedYear(((Number) establishedYear).intValue());
                } else if (establishedYear instanceof String && !((String) establishedYear).isEmpty()) {
                    try {
                        college.setEstablishedYear(Integer.parseInt((String) establishedYear));
                    } catch (NumberFormatException e) {
                        // Skip invalid year
                    }
                }
            }
            
            // Handle contact object - convert to JSON string
            Object contact = collegeData.get("contact");
            if (contact != null) {
                college.setContact(objectMapper.writeValueAsString(contact));
            }
            
            college.setDetailUrl(getStringValue(collegeData.get("detail_url")));
            college.setOverview(getStringValue(collegeData.get("overview")));
            
            // Handle programs array - convert to JSON string
            Object programs = collegeData.get("programs");
            if (programs != null) {
                college.setPrograms(objectMapper.writeValueAsString(programs));
            }
            
            college.setFacilities(getStringValue(collegeData.get("facilities")));
            college.setWhyChoose(getStringValue(collegeData.get("why_choose")));
            college.setPrincipalMessage(getStringValue(collegeData.get("principal_message")));
            college.setExtraInformation(getStringValue(collegeData.get("extra_information")));
            college.setMapEmbedUrl(getStringValue(collegeData.get("map_embed_url")));
            
            // Additional fields
            college.setType(getStringValue(collegeData.get("type")));
            Object rating = collegeData.get("rating");
            if (rating != null) {
                if (rating instanceof Number) {
                    college.setRating(((Number) rating).doubleValue());
                }
            }
            college.setFeesRange(getStringValue(collegeData.get("fees_range")));
            college.setCoursesOffered(getStringValue(collegeData.get("courses_offered")));
            college.setWebsite(getStringValue(collegeData.get("website")));
            
            // New fields: Students, Tuition, Acceptance Rate
            college.setStudents(getStringValue(collegeData.get("students")));
            college.setTuition(getStringValue(collegeData.get("tuition")));
            college.setAcceptanceRate(getStringValue(collegeData.get("acceptance_rate")));
            
            collegeRepository.save(college);
        }
    }

    @Transactional
    public void importPrograms(String filePath) throws Exception {
        Path fullPath = resolveDataPath(filePath);
        if (!Files.exists(fullPath)) {
            throw new RuntimeException("Data file not found: " + fullPath.toAbsolutePath());
        }
        InputStream inputStream = Files.newInputStream(fullPath);
        List<Map<String, Object>> programs = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});

        for (Map<String, Object> programData : programs) {
            Program program = new Program();
            program.setUniversity(getStringValue(programData.get("university")));
            program.setProgramName(getStringValue(programData.get("program_name")));
            program.setDescription(getStringValue(programData.get("description")));
            program.setDuration(getStringValue(programData.get("duration")));
            program.setEligibility(getStringValue(programData.get("eligibility")));
            program.setFees(getStringValue(programData.get("fees")));
            program.setProgramUrl(getStringValue(programData.get("program_url")));
            
            programRepository.save(program);
        }
    }

    @Transactional
    public void importUniversities(String filePath) throws Exception {
        Path fullPath = resolveDataPath(filePath);
        if (!Files.exists(fullPath)) {
            throw new RuntimeException("Data file not found: " + fullPath.toAbsolutePath());
        }
        InputStream inputStream = Files.newInputStream(fullPath);
        List<Map<String, Object>> universities = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});

        for (Map<String, Object> universityData : universities) {
            University university = new University();
            university.setName(getStringValue(universityData.get("name")));
            university.setCountry(getStringValue(universityData.get("country")));
            
            Object numColleges = universityData.get("num_colleges");
            if (numColleges != null) {
                if (numColleges instanceof Integer) {
                    university.setNumColleges((Integer) numColleges);
                } else if (numColleges instanceof Number) {
                    university.setNumColleges(((Number) numColleges).intValue());
                }
            }
            
            Object numPrograms = universityData.get("num_programs");
            if (numPrograms != null) {
                if (numPrograms instanceof Integer) {
                    university.setNumPrograms((Integer) numPrograms);
                } else if (numPrograms instanceof Number) {
                    university.setNumPrograms(((Number) numPrograms).intValue());
                }
            }
            
            university.setDescription(getStringValue(universityData.get("description")));
            university.setProgramsUrl(getStringValue(universityData.get("programs_url")));
            university.setCollegesUrl(getStringValue(universityData.get("colleges_url")));
            
            universityRepository.save(university);
        }
    }

    @Transactional
    public void importSyllabus(String filePath) throws Exception {
        Path fullPath = resolveDataPath(filePath);
        if (!Files.exists(fullPath)) {
            throw new RuntimeException("Data file not found: " + fullPath.toAbsolutePath());
        }
        InputStream inputStream = Files.newInputStream(fullPath);
        List<Map<String, Object>> syllabi = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});

        for (Map<String, Object> syllabusData : syllabi) {
            Syllabus syllabus = new Syllabus();
            syllabus.setProgramCode(getStringValue(syllabusData.get("program_code")));
            syllabus.setProgramName(getStringValue(syllabusData.get("program_name")));
            syllabus.setSyllabusUrl(getStringValue(syllabusData.get("syllabus_url")));
            
            // Convert subjects array to JSON string
            Object subjects = syllabusData.get("subjects");
            if (subjects != null) {
                syllabus.setSubjects(objectMapper.writeValueAsString(subjects));
            }
            
            syllabusRepository.save(syllabus);
        }
    }

    @Transactional
    public void importPopularColleges(String filePath) throws Exception {
        Path fullPath = resolveDataPath(filePath);
        if (!Files.exists(fullPath)) {
            throw new RuntimeException("Data file not found: " + fullPath.toAbsolutePath());
        }
        InputStream inputStream = Files.newInputStream(fullPath);
        List<Map<String, Object>> popularColleges = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});

        for (Map<String, Object> popularCollegeData : popularColleges) {
            PopularCollege popularCollege = new PopularCollege();
            popularCollege.setName(getStringValue(popularCollegeData.get("name")));
            popularCollege.setCategory(getStringValue(popularCollegeData.get("category")));
            popularCollege.setCategorySlug(getStringValue(popularCollegeData.get("category_slug")));
            popularCollege.setProgram(getStringValue(popularCollegeData.get("program")));
            popularCollege.setAffiliation(getStringValue(popularCollegeData.get("affiliation")));
            popularCollege.setLocation(getStringValue(popularCollegeData.get("location")));
            popularCollege.setDescription(getStringValue(popularCollegeData.get("description")));
            popularCollege.setDetailUrl(getStringValue(popularCollegeData.get("detail_url")));
            
            popularCollegeRepository.save(popularCollege);
        }
    }

    @Transactional
    public void importCareers(String filePath) throws Exception {
        Path fullPath = resolveDataPath(filePath);
        if (!Files.exists(fullPath)) {
            throw new RuntimeException("Data file not found: " + fullPath.toAbsolutePath());
        }
        InputStream inputStream = Files.newInputStream(fullPath);
        List<Map<String, Object>> careers = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});

        for (Map<String, Object> careerData : careers) {
            Career career = new Career();
            
            // Map careerName to name
            career.setName(getStringValue(careerData.get("careerName")));
            
            // Map description
            career.setDescription(getStringValue(careerData.get("description")));
            
            // Map jobOutlook to outlook
            career.setOutlook(getStringValue(careerData.get("jobOutlook")));
            
            // Map averageSalaryUSD to salaryRange
            career.setSalaryRange(getStringValue(careerData.get("averageSalaryUSD")));
            
            // Map skills array to requiredSkills
            Object skills = careerData.get("skills");
            if (skills != null) {
                if (skills instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<String> skillsList = (List<String>) skills;
                    career.setRequiredSkills(skillsList.toArray(new String[0]));
                } else if (skills instanceof String[]) {
                    career.setRequiredSkills((String[]) skills);
                }
            }
            
            careerRepository.save(career);
        }
    }
}

