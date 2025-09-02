
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Student, Career } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  DollarSign,
  BookOpen,
  Star,
  Lightbulb,
  BarChart,
  Brain,
  Heart,
  FileText,
  Sparkles
} from "lucide-react";

const confidenceLevels = {
  high: { color: "text-green-600", bg: "bg-green-100", label: "Excellent Match" },
  medium: { color: "text-yellow-600", bg: "bg-yellow-100", label: "Good Match" },
  low: { color: "text-orange-600", bg: "bg-orange-100", label: "Consider" }
};

export default function Recommendations() {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [careers, setCareers] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState("ai-based");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [students, careersData] = await Promise.all([
        Student.list(),
        Career.list()
      ]);

      if (students.length > 0) {
        setStudentData(students[0]);
      }
      setCareers(careersData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const generateAIRecommendations = useCallback(async () => {
    if (!studentData?.extracted_grades) return;

    setIsLoadingAI(true);
    try {
      const prompt = `
        Analyze this student's academic profile and recommend the top 6 most suitable career paths:

        Academic Data:
        - Grade 10: ${studentData.extracted_grades.grade_10_percentage}%
        - Grade 12: ${studentData.extracted_grades.grade_12_percentage}%
        - Stream: ${studentData.extracted_grades.stream}
        - Subjects: ${studentData.extracted_grades.subjects?.join(", ")}
        - Subject Grades: ${JSON.stringify(studentData.extracted_grades.subject_grades)}

        For each career recommendation, provide:
        1. Career title
        2. Match percentage (realistic based on grades and subjects)
        3. Confidence level (high/medium/low)
        4. Detailed reasoning for why this career suits the student
        5. Required skills for this career
        6. Salary range in Indian context
        7. Growth prospects
        8. Education pathway needed

        Focus on careers that align with their academic strengths, stream, and performance level.
        Be realistic about match percentages based on actual academic performance.
      `;

      const responseSchema = {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                match_percentage: { type: "number" },
                confidence: { type: "string", enum: ["high", "medium", "low"] },
                reasoning: { type: "string" },
                required_skills: { type: "array", items: { type: "string" } },
                salary_range: { type: "string" },
                growth_prospects: { type: "string" },
                education_required: { type: "string" },
                category: { type: "string" }
              }
            }
          }
        }
      };

      const result = await InvokeLLM({
        prompt,
        response_json_schema: responseSchema
      });

      if (result?.recommendations) {
        setAiRecommendations(result.recommendations);
      }
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
    }
    setIsLoadingAI(false);
  }, [studentData]); // studentData is a dependency because it's used inside the callback

  useEffect(() => {
    if (studentData && studentData.extracted_grades && activeTab === "ai-based" && aiRecommendations.length === 0) {
      generateAIRecommendations();
    }
  }, [studentData, activeTab, aiRecommendations.length, generateAIRecommendations]); // Added aiRecommendations.length and generateAIRecommendations as dependencies

  const getInterestBasedRecommendations = () => {
    if (!studentData || !studentData.interests) return [];

    return careers.map(career => {
      const isInterestMatch = studentData.interests.includes(career.category);
      let confidence = "low";
      let percentage = Math.random() * 25 + 40; // Base 40-65%

      if (isInterestMatch) {
        percentage += 35;
        confidence = "high";
      } else {
        // Check if there's partial interest alignment
        const relatedInterests = {
          technology: ["engineering", "science"],
          healthcare: ["science"],
          engineering: ["technology", "science"],
          business: ["marketing"],
          creative: ["marketing"],
        };

        const careerRelated = relatedInterests[career.category] || [];
        const hasRelatedInterest = studentData.interests.some(interest =>
          careerRelated.includes(interest)
        );

        if (hasRelatedInterest) {
          percentage += 15;
          confidence = "medium";
        }
      }

      return {
        ...career,
        confidence,
        match_percentage: Math.min(98, Math.round(percentage))
      };
    }).sort((a, b) => b.match_percentage - a.match_percentage);
  };

  const getCurrentRecommendations = () => {
    return activeTab === "ai-based" ? aiRecommendations : getInterestBasedRecommendations();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentData || !studentData.assessment_completed) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8 flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <Lightbulb className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Required</h2>
            <p className="text-gray-600 mb-4">Complete your assessment first to see personalized recommendations.</p>
            <Button onClick={() => navigate(createPageUrl("Assessment"))}>
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Recommendations</h1>
          <p className="text-gray-600">
            Personalized career guidance based on AI analysis and your interests
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ai-based" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="interest-based" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Your Interests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-based" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI-Powered Academic Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-blue-700"><strong>Academic Performance:</strong></p>
                    <p className="text-gray-700">Grade 10: {studentData.extracted_grades?.grade_10_percentage}% | Grade 12: {studentData.extracted_grades?.grade_12_percentage}%</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-blue-700"><strong>Stream & Subjects:</strong></p>
                    <p className="text-gray-700 capitalize">{studentData.extracted_grades?.stream} - {studentData.extracted_grades?.subjects?.slice(0, 3).join(", ")}</p>
                  </div>
                </div>
                <p className="text-blue-700 text-sm mt-3">
                  Our AI analyzed your marksheet to recommend careers that match your academic strengths and performance level.
                </p>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="interest-based" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-green-50 to-pink-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Interest-Based Recommendations
                </h3>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-green-700 mb-2"><strong>Your Selected Interests:</strong></p>
                  <div className="flex flex-wrap gap-2">
                    {studentData.interests?.map((interest) => (
                      <Badge key={interest} className="bg-green-100 text-green-800">
                        {interest.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-green-700 text-sm mt-3">
                  These recommendations are based on career fields that align with your personal interests and passions.
                </p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Loading for AI recommendations */}
        {activeTab === "ai-based" && isLoadingAI && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI is analyzing your academic profile...</h3>
            <p className="text-gray-600">This may take a few moments</p>
          </div>
        )}

        {/* Recommendations Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {getCurrentRecommendations().map((career, index) => {
            const confidenceLevel = confidenceLevels[career.confidence];
            return (
              <motion.div
                key={`${career.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          activeTab === "ai-based"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500"
                            : "bg-gradient-to-r from-green-500 to-pink-500"
                        }`}>
                          {activeTab === "ai-based" ? (
                            <Brain className="w-5 h-5 text-white" />
                          ) : (
                            <Heart className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{career.title}</CardTitle>
                          {career.category && (
                            <p className="text-sm text-gray-500 capitalize">{career.category.replace("_", " ")}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Match Score</span>
                        <Badge className={`${confidenceLevel.bg} ${confidenceLevel.color} border-0`}>
                          {confidenceLevel.label}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Compatibility</span>
                          <span className="font-semibold">{career.match_percentage}%</span>
                        </div>
                        <Progress value={career.match_percentage} className="h-2" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* AI Analysis shows reasoning, Interest-based shows description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {activeTab === "ai-based" ? career.reasoning : career.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Growth:</span>
                        <Badge variant="outline" className="text-xs">
                          {career.growth_prospects || "High"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Salary:</span>
                        <span className="text-sm font-medium">{career.salary_range}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">Education:</span>
                        <span className="text-sm font-medium">{career.education_required}</span>
                      </div>
                    </div>

                    {career.required_skills && career.required_skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Key Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {career.required_skills.slice(0, 3).map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {getCurrentRecommendations().length === 0 && !isLoadingAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations available</h3>
            <p className="text-gray-600">
              {activeTab === "ai-based"
                ? "Please ensure you've uploaded and analyzed your marksheet properly."
                : "Select your interests in the assessment to see personalized recommendations."
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
