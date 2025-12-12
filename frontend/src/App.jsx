import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/shared/context/AuthContext"
import { ThemeProvider } from "@/shared/context/ThemeContext"
import { ModalProvider } from "@/shared/context/ModalContext"
import ModalContainer from "@/shared/components/common/ModalContainer"
import { Navbar } from "@/shared/components/layout/navbar"
import HealthCheck from "@/shared/components/views/HealthCheck"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { Landing } from "@/features/landing-page/components/landing"
import Assessment from "@/features/assessment/pages/Assessment"
import Grades from "@/features/assessment/pages/Grades"
import Interests from "@/features/assessment/pages/Interests"
import Careers from "@/features/careers/pages/Careers"
import Colleges from "@/features/colleges/pages/Colleges"
import SavedColleges from "@/features/colleges/pages/SavedColleges"
import CollegeComparison from "@/features/colleges/pages/CollegeComparison"
import Trainings from "@/features/trainings/pages/Trainings"
import QuizStart from "@/features/trainings/pages/QuizStart"
import QuizPage from "@/features/trainings/pages/QuizPage"
import QuizResult from "@/features/trainings/pages/QuizResult"
import QuizAnalytics from "@/features/trainings/pages/QuizAnalytics"
import Profile from "@/features/profile/pages/Profile"
import Recommendations from "@/features/recommendations/pages/Recomendations"
import Dashboard from "@/features/dashboard/pages/Dashboard"
import AdminDashboard from "@/features/admin/pages/AdminDashboard"
import AdminStudents from "@/features/admin/pages/Students"
import AdminCareers from "@/features/admin/pages/Careers"
import AdminColleges from "@/features/admin/pages/Colleges"
import AdminMentors from "@/features/admin/pages/Mentors"
import AdminScholarships from "@/features/admin/pages/Scholarships"
import AdminTrainings from "@/features/admin/pages/Trainings"
import AcademicRecords from "@/features/admin/pages/AcademicRecords"
import Login from "@/features/auth/pages/Login"
import Signup from "@/features/auth/pages/Signup"
import ForgotPassword from "@/features/auth/pages/ForgotPassword"
import ResetPassword from "@/features/auth/pages/ResetPassword"
import About from "@/features/landing-page/pages/About"
import Features from "@/features/landing-page/pages/Features"
import WhyChooseUs from "@/features/landing-page/pages/WhyChooseUs"
import Contact from "@/features/landing-page/pages/Contact"

import NotFound from "@/shared/components/views/NotFound"

import "@/shared/styles/App.css"

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
                <Route path="/saved-colleges" element={<SavedColleges />} />
                <Route path="/college-comparison" element={<CollegeComparison />} />
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
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </Router>
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
