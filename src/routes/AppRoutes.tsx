import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

// Components
import { RoleSelection } from '../components/RoleSelection';

// Student components
const StudentAuth = lazy(() => import('../components/student/StudentAuth').then(m => ({ default: m.StudentAuth })));
const StudentDashboard = lazy(() => import('../components/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const StudentQuests = lazy(() => import('../components/student/StudentQuests').then(m => ({ default: m.StudentQuests })));
const StudentGacha = lazy(() => import('../components/student/StudentGacha').then(m => ({ default: m.StudentGacha })));
const StudentCollection = lazy(() => import('../components/student/StudentCollection').then(m => ({ default: m.StudentCollection })));
const StudentProfile = lazy(() => import('../components/student/StudentProfile').then(m => ({ default: m.StudentProfile })));
const StudentBattle = lazy(() => import('../components/student/StudentBattle').then(m => ({ default: m.StudentBattle })));
import { StudentBottomNav } from '../components/student/StudentBottomNav';

// Teacher components
const TeacherLoginPageNew = lazy(() => import('../components/teacher/TeacherLoginPageNew').then(m => ({ default: m.TeacherLoginPageNew })));
const TeacherSignupPageNew = lazy(() => import('../components/teacher/TeacherSignupPageNew').then(m => ({ default: m.TeacherSignupPageNew })));
const TeacherDashboardNew = lazy(() => import('../components/teacher/TeacherDashboardNew').then(m => ({ default: m.TeacherDashboardNew })));
const QuestTypeSelection = lazy(() => import('../components/teacher/QuestTypeSelection').then(m => ({ default: m.QuestTypeSelection })));
const IndividualQuestCreatePage = lazy(() => import('../components/teacher/IndividualQuestCreatePage').then(m => ({ default: m.IndividualQuestCreatePage })));
const GroupQuestCreatePage = lazy(() => import('../components/teacher/GroupQuestCreatePage').then(m => ({ default: m.GroupQuestCreatePage })));
const GroupQuestManagePage = lazy(() => import('../components/teacher/GroupQuestManagePage').then(m => ({ default: m.GroupQuestManagePage })));
const GroupQuestDetailPage = lazy(() => import('../components/teacher/GroupQuestDetailPage').then(m => ({ default: m.GroupQuestDetailPage })));
const QuestApprovalPageNew = lazy(() => import('../components/teacher/QuestApprovalPageNew').then(m => ({ default: m.QuestApprovalPageNew })));
const RaidCreatePageNew = lazy(() => import('../components/teacher/RaidCreatePageNew').then(m => ({ default: m.RaidCreatePageNew })));
const RaidManagePage = lazy(() => import('../components/teacher/RaidManagePage').then(m => ({ default: m.RaidManagePage })));
const ClassManagePage = lazy(() => import('../components/teacher/ClassManagePage').then(m => ({ default: m.ClassManagePage })));
const StudentListPage = lazy(() => import('../components/teacher/StudentListPage').then(m => ({ default: m.StudentListPage })));
const StudentDetailPage = lazy(() => import('../components/teacher/StudentDetailPage').then(m => ({ default: m.StudentDetailPage })));
const TeacherProfilePage = lazy(() => import('../components/teacher/TeacherProfilePage').then(m => ({ default: m.TeacherProfilePage })));
const ClassCreatePage = lazy(() => import('../components/teacher/ClassCreatePage').then(m => ({ default: m.ClassCreatePage })));

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
    <Suspense fallback={<div className="p-6">로딩중...</div>}>
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
    </Suspense>
  );
};
