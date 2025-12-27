import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl, getUserStorageKey } from "@/shared/utils/utils";
import { Student } from "@/shared/entities/all";
import { analyzeGradeSheet } from "@/shared/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Code,
  Heart,
  Palette,
  Calculator,
  Briefcase,
  Microscope,
  Scale,
  Megaphone,
  Upload,
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";

const interests = [
  { id: "technology", name: "Technology & IT", icon: Code, color: "from-blue-500 to-blue-600" },
  { id: "healthcare", name: "Healthcare & Medicine", icon: Heart, color: "from-red-500 to-red-600" },
  { id: "creative", name: "Creative Arts & Design", icon: Palette, color: "from-purple-500 to-purple-600" },
  { id: "engineering", name: "Engineering", icon: Calculator, color: "from-green-500 to-green-600" },
  { id: "business", name: "Business & Management", icon: Briefcase, color: "from-yellow-500 to-yellow-600" },
  { id: "science", name: "Science & Research", icon: Microscope, color: "from-teal-500 to-teal-600" },
  { id: "law", name: "Law & Legal Services", icon: Scale, color: "from-indigo-500 to-indigo-600" },
  { id: "marketing", name: "Marketing & Communications", icon: Megaphone, color: "from-pink-500 to-pink-600" }
];

export default function Assessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    marksheet_url: "",
    extracted_grades: null,
    interests: [],
    preferred_location: ""
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalSteps = user?.name && formData.full_name ? 3 : 4; // Skip name step if already available
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    loadExistingData();
  }, [user]);

  const loadExistingData = async () => {
    try {
      const userName = user?.name || "";

      // 1) Try to restore from localStorage first (survives login/logout in same browser)
      if (user?.id) {
        const storedFullName = localStorage.getItem(getUserStorageKey("fullName", user.id));
        const storedGrades = localStorage.getItem(getUserStorageKey("aiGradesAnalysis", user.id));
        const storedInterests = localStorage.getItem(getUserStorageKey("userInterests", user.id));
        const storedLocation = localStorage.getItem(getUserStorageKey("preferredLocation", user.id));

        setFormData(prev => ({
          ...prev,
          full_name: storedFullName || prev.full_name || userName,
          extracted_grades: storedGrades ? JSON.parse(storedGrades) : prev.extracted_grades,
          interests: storedInterests ? (JSON.parse(storedInterests).careerFields || []) : prev.interests,
          preferred_location: storedLocation || prev.preferred_location || ""
        }));

        // If we already have grades from a previous upload, jump straight to interests step
        if (storedGrades) {
          setCurrentStep(userName ? 3 : 2);
          return;
        }
      }

      // 2) Fallback: try to load from Student list (legacy / admin-created records)
      const students = await Student.list();
      if (students.length > 0) {
        const student = students[0];
        setFormData(prev => ({
          ...prev,
          full_name: student.full_name || prev.full_name || userName,
          marksheet_url: student.marksheet_url || prev.marksheet_url || "",
          extracted_grades: student.extracted_grades || prev.extracted_grades || null,
          interests: student.interests || prev.interests || [],
          preferred_location: student.preferred_location || prev.preferred_location || ""
        }));

        if (student.extracted_grades) {
          // If backend has grades, skip upload step
          setCurrentStep(userName ? 3 : 2);
          return;
        }
      } else if (userName) {
        // No student record yet; at least pre-fill the name
        setFormData(prev => ({
          ...prev,
          full_name: prev.full_name || userName
        }));
      }

      // 3) If we have a name but no grades yet, start from step 2 (upload)
      if (userName && !formData.full_name) {
        setCurrentStep(2);
      }
    } catch (error) {
      console.error("Error loading student data:", error);
      if (user?.name) {
        setFormData(prev => ({
          ...prev,
          full_name: prev.full_name || user.name
        }));
        setCurrentStep(2);
      }
    }
  };

  // Transform backend response to match UI expectations
  const transformGradeData = (backendResult) => {
    if (!backendResult || !Array.isArray(backendResult.subjects)) {
      return null;
    }

    // Calculate average percentage from subject marks
    const marks = backendResult.subjects
      .map(s => s.marks)
      .filter(m => m != null && !isNaN(m));
    
    const averagePercentage = marks.length > 0
      ? Math.round(marks.reduce((sum, m) => sum + m, 0) / marks.length)
      : 0;

    // Detect stream from subject names
    const subjectNames = backendResult.subjects.map(s => s.name?.toLowerCase() || '').join(' ');
    let stream = 'science';
    if (subjectNames.includes('commerce') || subjectNames.includes('accounting') || subjectNames.includes('economics')) {
      stream = 'commerce';
    } else if (subjectNames.includes('arts') || subjectNames.includes('history') || subjectNames.includes('political')) {
      stream = 'arts';
    }

    // Extract subject names as array
    const subjects = backendResult.subjects.map(s => s.name).filter(Boolean);

    // Create subject_grades object
    const subject_grades = {};
    backendResult.subjects.forEach(s => {
      if (s.name && s.marks != null) {
        subject_grades[s.name] = s.marks;
      }
    });

    return {
      grade_10_percentage: averagePercentage, // Use average as approximation
      grade_12_percentage: averagePercentage, // Use average as approximation
      stream: stream,
      subjects: subjects,
      subject_grades: subject_grades,
      // Keep original data for reference
      originalData: backendResult
    };
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    // Validate file type (backend only supports PNG and JPEG images)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      const errorMsg = "Please upload a PNG or JPEG image file.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      const errorMsg = "File size must be less than 10MB.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Upload and analyze the file using the real API
      const result = await analyzeGradeSheet(file);

      if (result) {
        // Transform the backend response to match UI expectations
        const transformedData = transformGradeData(result);
        
        if (transformedData) {
          setFormData(prev => ({
            ...prev,
            marksheet_url: file.name, // Store filename as reference
            extracted_grades: transformedData
          }));
          setUploadedFile(file);
          toast.success("Marksheet analyzed successfully!");
        } else {
          throw new Error("Could not extract academic data from the marksheet. Please ensure the document is clear and contains grade information.");
        }
      } else {
        throw new Error("Could not extract academic data from the marksheet. Please ensure the document is clear and contains grade information.");
      }
    } catch (error) {
      const errorMsg = error.message || "Error analyzing marksheet. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    }

    setIsAnalyzing(false);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInterestToggle = (interestId) => {
    setFormData(prev => {
      const isSelected = prev.interests.includes(interestId);

      // If already selected, allow deselect
      if (isSelected) {
        return {
          ...prev,
          interests: prev.interests.filter(id => id !== interestId)
        };
      }

      // Enforce a maximum of 2 interests
      if (prev.interests.length >= 2) {
        toast.info("You can choose up to 2 interest areas. Deselect one to pick a different area.");
        return prev;
      }

      return {
        ...prev,
        interests: [...prev.interests, interestId]
      };
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Map formData to Student entity structure
      // Student entity expects: name, email, careerFields (String[]), activities (String[]), workEnvironments (String[])
      const studentData = {
        name: formData.full_name || user?.name || "",
        email: user?.email || "",
        careerFields: formData.interests || [], // Map interests to careerFields
        activities: [], // Not collected in assessment, can be empty
        workEnvironments: [] // Not collected in assessment, can be empty
      };

      // Validate required fields
      if (!studentData.name || !studentData.email) {
        throw new Error("Name and email are required to save assessment data.");
      }

      const students = await Student.list();
      
      // Find student by email or use first one
      let existingStudent = students.find(s => s.email === studentData.email);
      
      if (existingStudent) {
        await Student.update(existingStudent.id, studentData);
      } else {
        await Student.create(studentData);
      }

      // Save additional assessment data to localStorage for frontend use
      if (user?.id) {
        localStorage.setItem(getUserStorageKey("fullName", user.id), formData.full_name);
        localStorage.setItem(getUserStorageKey("aiGradesAnalysis", user.id), JSON.stringify(formData.extracted_grades));
        localStorage.setItem(getUserStorageKey("userInterests", user.id), JSON.stringify({ careerFields: formData.interests }));
        localStorage.setItem(getUserStorageKey("preferredLocation", user.id), formData.preferred_location);
        localStorage.setItem(getUserStorageKey("onboardingCompleted", user.id), "true");
      }

      toast.success("Assessment saved successfully!");
      navigate(createPageUrl("Recommendations"));
    } catch (error) {
      console.error("Error saving assessment:", error);
      const errorMsg = error.message || "Error saving assessment data. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setIsLoading(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Allow proceeding if name is already available from signup
        return formData.full_name.trim().length > 0 || user?.name;
      case 2:
        return formData.extracted_grades !== null;
      case 3:
        return formData.interests.length > 0;
      case 4:
        return formData.preferred_location.trim().length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Let's Get Started</h2>
              <p className="text-muted-foreground">
                {formData.full_name 
                  ? "We've pre-filled your name from your account. You can update it if needed."
                  : "Tell us your name to begin your career journey"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="text-lg p-4"
              />
              {formData.full_name && user?.name && formData.full_name === user.name && (
                <p className="text-xs text-muted-foreground">
                  Note: Pre-filled from your account
                </p>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your Marksheet</h2>
              <p className="text-muted-foreground">Our AI will analyze your academic performance automatically</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!formData.extracted_grades ? (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                    // Reset input to allow re-uploading the same file
                    e.target.value = '';
                  }}
                  className="hidden"
                  id="marksheet-upload"
                  disabled={isAnalyzing}
                />

                {isAnalyzing ? (
                  <div className="space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Analyzing your marksheet...</h3>
                      <p className="text-muted-foreground text-sm">Our AI is extracting your academic data</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Upload Grade 10 & 12 Marksheets</h3>
                    <p className="text-muted-foreground mb-6">Upload a clear image of your marksheets</p>
                    <Button 
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('marksheet-upload');
                        if (input && !isAnalyzing) {
                          input.click();
                        }
                      }}
                      disabled={isAnalyzing}
                      className="cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">Supported: PNG, JPG, JPEG (up to 10MB)</p>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-800">Marksheet Analyzed Successfully!</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Grade 10 Percentage:</p>
                    <p className="font-semibold text-lg text-foreground">{formData.extracted_grades.grade_10_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Grade 12 Percentage:</p>
                    <p className="font-semibold text-lg text-foreground">{formData.extracted_grades.grade_12_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stream:</p>
                    <p className="font-semibold capitalize text-foreground">{formData.extracted_grades.stream}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subjects:</p>
                    <p className="font-semibold text-foreground">{formData.extracted_grades.subjects?.join(", ")}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, extracted_grades: null, marksheet_url: "" }));
                    setUploadedFile(null);
                  }}
                >
                  Upload Different Marksheet
                </Button>
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Top Interests</h2>
              <p className="text-muted-foreground">Select 1-2 career areas that genuinely excite you</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {interests.map((interest) => {
                const isSelected = formData.interests.includes(interest.id);
                return (
                  <motion.div
                    key={interest.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${interest.color} flex items-center justify-center`}>
                        <interest.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{interest.name}</h3>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-6">
              <p className="text-primary text-sm">
                <strong>Tip:</strong> Your interests will be used for personalized career recommendations
                separate from your academic analysis. Select all areas that genuinely interest you!
              </p>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Preferred Location</h2>
              <p className="text-muted-foreground">Where would you like to study or work?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Preferred City/State</Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                value={formData.preferred_location}
                onChange={(e) => setFormData(prev => ({ ...prev, preferred_location: e.target.value }))}
                className="text-lg p-4"
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Ready for AI Analysis!
              </h3>
              <p className="text-green-700 text-sm mb-3">
                You'll get two types of personalized recommendations:
              </p>
              <ul className="text-green-700 text-sm space-y-1 ml-4">
                <li><strong>Academic-Based:</strong> Careers recommended by AI analysis of your marksheet</li>
                <li><strong>Interest-Based:</strong> Careers aligned with your selected interests</li>
              </ul>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Career Assessment</h1>
          <p className="text-muted-foreground mt-1">Complete your profile to get personalized recommendations</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </motion.div>

      <Card className="shadow-lg border-2">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Assessment
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isAnalyzing}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
