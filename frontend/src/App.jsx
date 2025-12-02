import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { ModalProvider } from "./context/ModalContext"
import ModalContainer from "./components/common/ModalContainer"
import Navbar from "./components/navigation/Navbar"
import HealthCheck from "./components/views/HealthCheck"

import { Landing } from "./components/landing"
import Assessment from "./pages/Assessment"
import Grades from "./pages/Grades"
import Interests from "./pages/Interests"
import Careers from "./pages/Careers"
import Colleges from "./pages/Colleges"
import Mentors from "./pages/Mentors"
import Scholarships from "./pages/Scholarship"
import Trainings from "./pages/Trainings"
import QuizStart from "./pages/QuizStart"
import QuizPage from "./pages/QuizPage"
import QuizResult from "./pages/QuizResult"
import QuizAnalytics from "./pages/QuizAnalytics"
import Profile from "./pages/Profile"
import Recommendations from "./pages/Recomendations"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"
import AdminStudents from "./pages/admin/Students"
import AdminCareers from "./pages/admin/Careers"
import AdminColleges from "./pages/admin/Colleges"
import AdminMentors from "./pages/admin/Mentors"
import AdminScholarships from "./pages/admin/Scholarships"
import AdminTrainings from "./pages/admin/Trainings"
import AcademicRecords from "./pages/admin/AcademicRecords"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import About from "./pages/About"
import Features from "./pages/Features"
import WhyChooseUs from "./pages/WhyChooseUs"
import Contact from "./pages/Contact"

import NotFound from "./pages/NotFound"

import "./styles/App.css"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModalProvider>
          <Router>
            <div className="app">
              <Routes>
                {/* Public Routes - Show Navbar */}
                <Route path="/" element={<Landing />} />
                <Route path="/health" element={
                  <>
                    <Navbar />
                    <main className="main-content">
                      <HealthCheck />
                    </main>
                  </>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element={<About />} />
                <Route path="/features" element={<Features />} />
                <Route path="/why-choose-us" element={<WhyChooseUs />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected Dashboard Routes - Show Sidebar (handled in components) */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/grades" element={<Grades />} />
                <Route path="/interests" element={<Interests />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/colleges" element={<Colleges />} />
                <Route path="/mentors" element={<Mentors />} />
                <Route path="/scholarships" element={<Scholarships />} />
                <Route path="/trainings" element={<Trainings />} />
                <Route path="/quiz/start/:trainingId" element={<QuizStart />} />
                <Route path="/quiz/session/:quizSessionId" element={<QuizPage />} />
                <Route path="/quiz/result/:quizSessionId" element={<QuizResult />} />
                <Route path="/quiz/analytics" element={<QuizAnalytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/recommendations" element={<Recommendations />} />
                
                {/* Admin Routes - Show Admin Sidebar (handled in components) */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/students" element={<AdminStudents />} />
                <Route path="/admin/careers" element={<AdminCareers />} />
                <Route path="/admin/colleges" element={<AdminColleges />} />
                <Route path="/admin/mentors" element={<AdminMentors />} />
                <Route path="/admin/scholarships" element={<AdminScholarships />} />
                <Route path="/admin/trainings" element={<AdminTrainings />} />
                <Route path="/admin/academic-records" element={<AcademicRecords />} />

                {/* Fallback */}
                <Route path="*" element={
                  <>
                    <Navbar />
                    <main className="main-content">
                      <NotFound />
                    </main>
                  </>
                } />
              </Routes>
              <ModalContainer />
            </div>
          </Router>
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
