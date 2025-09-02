import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Student } from "@/entities/all";
import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const students = await Student.list();
      if (students.length > 0) {
        const student = students[0];
        setFormData({
          full_name: student.full_name || "",
          marksheet_url: student.marksheet_url || "",
          extracted_grades: student.extracted_grades || null,
          interests: student.interests || [],
          preferred_location: student.preferred_location || ""
        });
      }
    } catch (error) {
      console.error("Error loading student data:", error);
    }
  };

  const handleFileUpload = async (file) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Upload the file first
      const { file_url } = await UploadFile({ file });

      // Define the schema for extracting academic data
      const gradeSchema = {
        type: "object",
        properties: {
          grade_10_percentage: {
            type: "number",
            description: "Grade 10 or Class 10 overall percentage"
          },
          grade_12_percentage: {
            type: "number",
            description: "Grade 12 or Class 12 overall percentage"
          },
          stream: {
            type: "string",
            enum: ["science", "commerce", "arts"],
            description: "Academic stream in grade 12 (science, commerce, or arts)"
          },
          subjects: {
            type: "array",
            items: { type: "string" },
            description: "List of subjects studied"
          },
          subject_grades: {
            type: "object",
            additionalProperties: { type: "number" },
            description: "Individual subject grades/marks"
          }
        }
      };

      // Extract data from the uploaded marksheet
      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: gradeSchema
      });

      if (result.status === "success" && result.output) {
        setFormData(prev => ({
          ...prev,
          marksheet_url: file_url,
          extracted_grades: result.output
        }));
        setUploadedFile(file);
      } else {
        throw new Error("Could not extract academic data from the marksheet. Please ensure the document is clear and contains grade information.");
      }
    } catch (error) {
      setError(error.message || "Error analyzing marksheet. Please try again.");
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
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const students = await Student.list();
      const studentData = {
        ...formData,
        marksheet_analyzed: !!formData.extracted_grades,
        assessment_completed: true
      };

      if (students.length > 0) {
        await Student.update(students[0].id, studentData);
      } else {
        await Student.create(studentData);
      }

      navigate(createPageUrl("Recommendations"));
    } catch (error) {
      console.error("Error saving assessment:", error);
      setError("Error saving assessment data. Please try again.");
    }
    setIsLoading(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.full_name.trim().length > 0;
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's Get Started</h2>
              <p className="text-gray-600">Tell us your name to begin your career journey</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Marksheet</h2>
              <p className="text-gray-600">Our AI will analyze your academic performance automatically</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!formData.extracted_grades ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  id="marksheet-upload"
                />

                {isAnalyzing ? (
                  <div className="space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Analyzing your marksheet...</h3>
                      <p className="text-gray-600 text-sm">Our AI is extracting your academic data</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Grade 10 & 12 Marksheets</h3>
                    <p className="text-gray-600 mb-6">Upload a clear image or PDF of your marksheets</p>
                    <label htmlFor="marksheet-upload">
                      <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-4">Supported: PDF, PNG, JPEG</p>
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
                    <p className="text-gray-600">Grade 10 Percentage:</p>
                    <p className="font-semibold text-lg">{formData.extracted_grades.grade_10_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Grade 12 Percentage:</p>
                    <p className="font-semibold text-lg">{formData.extracted_grades.grade_12_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stream:</p>
                    <p className="font-semibold capitalize">{formData.extracted_grades.stream}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Subjects:</p>
                    <p className="font-semibold">{formData.extracted_grades.subjects?.join(", ")}</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Interests</h2>
              <p className="text-gray-600">Select career areas that excite you (choose multiple)</p>
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
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${interest.color} flex items-center justify-center`}>
                        <interest.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{interest.name}</h3>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <p className="text-blue-800 text-sm">
                <strong>💡 Tip:</strong> Your interests will be used for personalized career recommendations
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferred Location</h2>
              <p className="text-gray-600">Where would you like to study or work?</p>
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
                Ready for AI Analysis! 🎉
              </h3>
              <p className="text-green-700 text-sm mb-3">
                You'll get two types of personalized recommendations:
              </p>
              <ul className="text-green-700 text-sm space-y-1 ml-4">
                <li>• <strong>Academic-Based:</strong> Careers recommended by AI analysis of your marksheet</li>
                <li>• <strong>Interest-Based:</strong> Careers aligned with your selected interests</li>
              </ul>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Career Assessment</h1>
              <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </motion.div>

        <Card className="shadow-lg border-0">
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
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
