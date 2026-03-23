import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import EmailVerified from "./pages/EmailVerified";
import Logout from "./pages/Logout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DjangoAuthProvider } from "@/contexts/DjangoAuthContext";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import MembersList from "./pages/dashboard/MembersList";
import TempMembersList from "./pages/dashboard/TempMembersList";
import AttendanceCapture from "./pages/dashboard/AttendanceCapture";
import AttendanceLogs from "./pages/dashboard/AttendanceLogs";
import AttendanceHistory from "./pages/dashboard/AttendanceHistory";
import DepartmentsList from "./pages/dashboard/DepartmentsList";
import ProfileSettings from "./pages/dashboard/ProfileSettings";
import FaceGallery from "./pages/dashboard/FaceGallery";
import Reports from "./pages/dashboard/Reports";
import MyAttendanceHistory from "./pages/dashboard/MyAttendanceHistory";
import OrganizationSettings from "./pages/dashboard/OrganizationSettings";
import AdminManagement from "./pages/dashboard/AdminManagement";
import ActivityLogs from "./pages/dashboard/ActivityLogs";
import ScheduleManagement from "./pages/dashboard/ScheduleManagement";
import SiteManagement from "./pages/dashboard/SiteManagement";
import FaceEnrollment from "./pages/dashboard/FaceEnrollment";
import AttendanceSummary from "./pages/dashboard/AttendanceSummary";
import StreaksAndBadges from "./pages/dashboard/StreaksAndBadges";
import MySchedule from "./pages/dashboard/MySchedule";
import BrandingSettings from "./pages/dashboard/BrandingSettings";
import PageWrapper from "./components/PageWrapper";

// Content pages
import SmartAttendance from "./pages/SmartAttendance";
import SecuritySystems from "./pages/SecuritySystems";
import HealthcareIntegration from "./pages/HealthcareIntegration";
import EducationalSolutions from "./pages/EducationalSolutions";
import CorporateAccess from "./pages/CorporateAccess";
import AboutUs from "./pages/AboutUs";
import OurTeam from "./pages/OurTeam";
import Careers from "./pages/Careers";
import PressMedia from "./pages/PressMedia";
import Blog from "./pages/Blog";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DjangoAuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <PageWrapper>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route path="/logout" element={<Logout />} />
              
              {/* Content Pages */}
              <Route path="/smart-attendance" element={<SmartAttendance />} />
              <Route path="/security-systems" element={<SecuritySystems />} />
              <Route path="/healthcare-integration" element={<HealthcareIntegration />} />
              <Route path="/educational-solutions" element={<EducationalSolutions />} />
              <Route path="/corporate-access" element={<CorporateAccess />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/team" element={<OurTeam />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/press" element={<PressMedia />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardRouter />} />
                <Route path="face-enrollment" element={<FaceEnrollment />} />
                <Route path="attendance-summary" element={<AttendanceSummary />} />
                <Route path="streaks" element={<StreaksAndBadges />} />
                <Route path="my-schedule" element={<MySchedule />} />
                <Route path="members" element={<MembersList />} />
                <Route path="temp-members" element={<TempMembersList />} />
                <Route path="attendance" element={<AttendanceCapture />} />
                <Route path="attendance-logs" element={<AttendanceLogs />} />
                <Route path="attendance-history" element={<AttendanceHistory />} />
                <Route path="departments" element={<DepartmentsList />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="my-attendance" element={<MyAttendanceHistory />} />
                <Route path="face-gallery" element={<FaceGallery />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<OrganizationSettings />} />
                <Route path="admin-management" element={<AdminManagement />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
                <Route path="schedules" element={<ScheduleManagement />} />
                <Route path="site-management" element={<SiteManagement />} />
                <Route path="branding" element={<BrandingSettings />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageWrapper>
        </TooltipProvider>
      </BrowserRouter>
    </DjangoAuthProvider>
  </QueryClientProvider>
);

export default App;
