import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

// Components
import { RoleSelection } from '../components/RoleSelection';

// Student components
import { StudentAuth } from '../components/student/StudentAuth';
import { StudentDashboard } from '../components/student/StudentDashboard';
import { StudentQuests } from '../components/student/StudentQuests';
import { StudentGacha } from '../components/student/StudentGacha';
import { StudentCollection } from '../components/student/StudentCollection';
import { StudentProfile } from '../components/student/StudentProfile';
import { StudentBattle } from '../components/student/StudentBattle';
import { StudentBottomNav } from '../components/student/StudentBottomNav';

// Teacher components
import { TeacherLoginPageNew } from '../components/teacher/TeacherLoginPageNew';
import { TeacherSignupPageNew } from '../components/teacher/TeacherSignupPageNew';
import { TeacherDashboardNew } from '../components/teacher/TeacherDashboardNew';
import { QuestTypeSelection } from '../components/teacher/QuestTypeSelection';
import { IndividualQuestCreatePage } from '../components/teacher/IndividualQuestCreatePage';
import { GroupQuestCreatePage } from '../components/teacher/GroupQuestCreatePage';
import { GroupQuestManagePage } from '../components/teacher/GroupQuestManagePage';
import { GroupQuestDetailPage } from '../components/teacher/GroupQuestDetailPage';
import { QuestApprovalPageNew } from '../components/teacher/QuestApprovalPageNew';
import { RaidCreatePageNew } from '../components/teacher/RaidCreatePageNew';
import { RaidManagePage } from '../components/teacher/RaidManagePage';
import { ClassManagePage } from '../components/teacher/ClassManagePage';
import { StudentListPage } from '../components/teacher/StudentListPage';
import { StudentDetailPage } from '../components/teacher/StudentDetailPage';
import { TeacherProfilePage } from '../components/teacher/TeacherProfilePage';
import { ClassCreatePage } from '../components/teacher/ClassCreatePage';

// Student Layout Component
const StudentLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (!tab) return;

    const tabToPath: Record<string, string> = {
      dashboard: '/student/dashboard',
      quests: '/student/quests',
      gacha: '/student/gacha',
      collection: '/student/collection',
      profile: '/student/profile',
      battle: '/student/battle',
    };

    const target = tabToPath[tab];
    if (target && target !== location.pathname) {
      navigate(target, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Outlet />
      <StudentBottomNav />
    </div>
  );
};

// Main Routes Component
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RoleSelection />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      
      {/* Student Routes */}
      <Route path="/student/auth" element={<StudentAuth />} />
      
      {/* Student Protected Routes */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="quests" element={<StudentQuests />} />
        <Route path="gacha" element={<StudentGacha />} />
        <Route path="collection" element={<StudentCollection />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="battle" element={<StudentBattle />} />
      </Route>
      
      {/* Teacher Routes */}
      <Route path="/teacher/login" element={<TeacherLoginPageNew />} />
      <Route path="/teacher/signup" element={<TeacherSignupPageNew />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboardNew />} />
      
      {/* Teacher Quest Routes */}
      <Route path="/teacher/quest" element={<QuestTypeSelection />} />
      <Route path="/teacher/quest/individual" element={<IndividualQuestCreatePage />} />
      <Route path="/teacher/quest/group" element={<GroupQuestCreatePage />} />
      <Route path="/teacher/quest/group/manage" element={<GroupQuestManagePage />} />
      <Route path="/teacher/quest/group/detail/:id" element={<GroupQuestDetailPage />} />
      <Route path="/teacher/quest/approval" element={<QuestApprovalPageNew />} />
      
      {/* Teacher Raid Routes */}
      <Route path="/teacher/raid/create" element={<RaidCreatePageNew />} />
      <Route path="/teacher/raid/manage" element={<RaidManagePage />} />
      
      {/* Teacher Class Routes */}
      <Route path="/teacher/class" element={<ClassManagePage />} />
      <Route path="/teacher/class/create" element={<ClassCreatePage />} />
      <Route path="/teacher/students" element={<StudentListPage />} />
      <Route path="/teacher/students/:id" element={<StudentDetailPage />} />
      
      {/* Teacher Profile */}
      <Route path="/teacher/profile" element={<TeacherProfilePage />} />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
