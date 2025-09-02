import React, { useState, useEffect } from "react";
import { Student, User } from "@/entities/all";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  Mail,
  BookOpen,
  Target,
  MapPin,
  Edit3,
  CheckCircle,
  School
} from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [userData, students] = await Promise.all([
        User.me(),
        Student.list()
      ]);

      setUser(userData);
      if (students.length > 0) {
        setStudentData(students[0]);
        setEditForm(students[0]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    try {
      if (studentData) {
        await Student.update(studentData.id, editForm);
      } else {
        await Student.create(editForm);
      }
      setStudentData(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const interestLabels = {
    technology: "Technology & IT",
    healthcare: "Healthcare & Medicine",
    creative: "Creative Arts & Design",
    engineering: "Engineering",
    business: "Business & Management",
    science: "Science & Research",
    law: "Law & Legal Services",
    marketing: "Marketing & Communications"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-gray-200 h-64 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="text-center shadow-lg border-0">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {studentData?.full_name || user?.full_name || "Student"}
                </h2>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">{user?.email}</span>
                </div>

                <div className="space-y-3">
                  {studentData?.assessment_completed ? (
                    <Badge className="bg-green-100 text-green-800">Assessment Complete</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">Assessment Pending</Badge>
                  )}

                  <div className="text-sm text-gray-600">
                    <p>Member since {new Date(user?.created_date || Date.now()).getFullYear()}</p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isEditing ? "Cancel Edit" : "Edit Profile"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editForm.full_name || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Preferred Location</Label>
                      <Input
                        id="location"
                        value={editForm.preferred_location || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, preferred_location: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Full Name</p>
                      <p className="font-medium">{studentData?.full_name || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Preferred Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="font-medium">{studentData?.preferred_location || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade10">Grade 10 Percentage</Label>
                      <Input
                        id="grade10"
                        type="number"
                        value={editForm.grade_10_percentage || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, grade_10_percentage: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade12">Grade 12 Percentage</Label>
                      <Input
                        id="grade12"
                        type="number"
                        value={editForm.grade_12_percentage || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, grade_12_percentage: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream">Stream</Label>
                      <select
                        id="stream"
                        value={editForm.stream || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, stream: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select stream</option>
                        <option value="science">Science</option>
                        <option value="commerce">Commerce</option>
                        <option value="arts">Arts</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Grade 10</p>
                      <p className="font-medium text-lg">
                        {studentData?.grade_10_percentage ? `${studentData.grade_10_percentage}%` : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Grade 12</p>
                      <p className="font-medium text-lg">
                        {studentData?.grade_12_percentage ? `${studentData.grade_12_percentage}%` : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Stream</p>
                      <Badge variant="outline" className="text-sm">
                        {studentData?.stream ? studentData.stream.charAt(0).toUpperCase() + studentData.stream.slice(1) : "Not specified"}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Career Interests */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Career Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentData?.interests && studentData.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {studentData.interests.map((interest, index) => (
                      <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200">
                        {interestLabels[interest] || interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No interests selected yet. Complete your assessment to add interests.</p>
                )}
              </CardContent>
            </Card>

            {isEditing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end gap-3"
              >
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
