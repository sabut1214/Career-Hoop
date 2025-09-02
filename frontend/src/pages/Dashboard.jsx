import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Student } from "@/entities/Student";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Target,
  School,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  Lightbulb,
  FileText
} from "lucide-react";

const actionCards = [
  {
    title: "Complete Assessment",
    description: "Enter your grades and select interests to get personalized recommendations",
    icon: FileText,
    action: "Start Assessment",
    link: "Assessment",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "View Recommendations",
    description: "Explore career paths matched to your profile and interests",
    icon: Target,
    action: "View Careers",
    link: "Recommendations",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Explore Colleges",
    description: "Find colleges and courses that match your career goals",
    icon: School,
    action: "Browse Colleges",
    link: "Colleges",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50"
  }
];

const progressSteps = [
  { title: "Profile Setup", completed: true },
  { title: "Assessment", completed: false },
  { title: "Recommendations", completed: false },
  { title: "College Selection", completed: false }
];

export default function Dashboard() {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const students = await Student.list();
      if (students.length > 0) {
        setStudentData(students[0]);
      }
    } catch (error) {
      console.error("Error loading student data:", error);
    }
    setIsLoading(false);
  };

  const calculateProgress = () => {
    if (!studentData) return 25;
    let progress = 25; // Profile setup
    if (studentData.grade_10_percentage) progress += 25; // Assessment partially done
    if (studentData.interests && studentData.interests.length > 0) progress += 25; // Assessment complete
    if (studentData.assessment_completed) progress += 25; // Ready for recommendations
    return progress;
  };

  const getNextStep = () => {
    if (!studentData) return "Complete your profile setup";
    if (!studentData.grade_10_percentage) return "Enter your academic grades";
    if (!studentData.interests || studentData.interests.length === 0) return "Select your career interests";
    if (!studentData.assessment_completed) return "Complete your assessment";
    return "Explore your career recommendations";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back{studentData ? `, ${studentData.full_name}` : ''}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Ready to take the next step in your career journey?
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Progress</p>
                <p className="font-semibold text-blue-600">{calculateProgress()}% Complete</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Your Journey Progress</h3>
                <span className="text-sm font-medium text-blue-600">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="mb-4 h-3" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Next step: {getNextStep()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {actionCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {card.description}
                    </p>
                    <Link to={createPageUrl(card.link)}>
                      <Button
                        className="w-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 group-hover:border-blue-300 group-hover:text-blue-600 transition-all duration-300"
                      >
                        {card.action}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats and Overview */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Journey Steps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Your Career Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressSteps.map((step, index) => (
                    <div key={step.title} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : index === progressSteps.findIndex(s => !s.completed)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          step.completed ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h4>
                        {step.completed && (
                          <p className="text-sm text-gray-500">Completed</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Career Tip</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Complete your assessment to unlock personalized career recommendations
                </p>
                <Link to={createPageUrl("Assessment")}>
                  <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Students</span>
                    </div>
                    <span className="font-semibold">10,000+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Careers</span>
                    </div>
                    <span className="font-semibold">500+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Colleges</span>
                    </div>
                    <span className="font-semibold">200+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
