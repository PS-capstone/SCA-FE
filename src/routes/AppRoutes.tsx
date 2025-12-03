import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/teacher/Sidebar';

// Components
import { RoleSelection } from '../components/RoleSelection';
const LoginPage = lazy(() => import('../components/common/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('../components/common/SignupPage').then(m => ({ default: m.SignupPage })));

// Student components
const StudentDashboard = lazy(() => import('../components/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const StudentQuests = lazy(() => import('../components/student/StudentQuests').then(m => ({ default: m.StudentQuests })));
const StudentGacha = lazy(() => import('../components/student/StudentGacha').then(m => ({ default: m.StudentGacha })));
const StudentCollection = lazy(() => import('../components/student/StudentCollection').then(m => ({ default: m.StudentCollection })));
const StudentRaid = lazy(() => import('../components/student/StudentRaid').then(m => ({ default: m.StudentRaid })));
import { StudentBottomNav } from '../components/student/StudentBottomNav';

// Teacher components
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
const ClassActivityDashboard = lazy(() => import('../components/teacher/ClassActivityDashboard').then(m => ({ default: m.ClassActivityDashboard })));

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
      raid: '/student/raid',
    };

    const target = tabToPath[tab];
    if (target && target !== location.pathname) {
      navigate(target, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  return (
    <div className="retro-layout h-screen flex flex-col bg-gray overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar mb-20" style={{backgroundImage: "var(--bg-url)"}}>
        <Outlet />
      </div>
      <StudentBottomNav />
    </div>
  );
};

// Teacher Layout Component
const TeacherLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // localStorage에서 직접 확인
  const storedUser = localStorage.getItem('user');
  const storedUserType = localStorage.getItem('userType');
  
  useEffect(() => {
    // 로그인 페이지에서는 체크하지 않음
    if (location.pathname.startsWith('/login')) {
      return;
    }
    
    // 인증되지 않았으면 로그인 페이지로 리다이렉트
    if (!storedUser || storedUserType !== 'teacher') {
      navigate('/login/teacher', { replace: true });
    }
  }, [storedUser, storedUserType, navigate, location.pathname]);
  
  // 로그인 페이지로 가는 중이면 아무것도 렌더링하지 않음
  if (location.pathname.startsWith('/login')) {
    return null;
  }
  
  // 인증되지 않았으면 로딩 화면 표시
  if (!storedUser || storedUserType !== 'teacher') {
    return <div className="p-6">로딩중...</div>;
  }

  return (
    <div className="window min-h-screen" style={{ margin: '20px', width: 'calc(100% - 40px)', height: 'calc(100vh - 40px)' }}>
      <div className="title-bar">
        <div className="title-bar-text">선생님 대시보드</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body bg-white flex" style={{ padding: 0, height: 'calc(100% - 30px)' }}>
        <Sidebar />
        <main className="flex-1 border-l-2 border-gray-300 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Main Routes Component
export const AppRoutes: React.FC = () => {
  const location = useLocation();

  // 경로에 따라 페이지 제목 설정
  useEffect(() => {
    const pathToTitle: Record<string, string> = {
      '/': 'SCA 학습 관리 시스템',
      '/login/student': '학생 로그인 - SCA',
      '/login/teacher': '선생님 로그인 - SCA',
      '/signup': '회원가입 - SCA',
      '/student/dashboard': '학생 대시보드 - SCA',
      '/student/quests': '내 퀘스트 - SCA',
      '/student/gacha': '가챠 - SCA',
      '/student/collection': '도감 - SCA',
      '/student/raid': '레이드 - SCA',
      '/teacher/dashboard': '선생님 대시보드 - SCA',
      '/teacher/quest': '퀘스트 등록 - SCA',
      '/teacher/quest/individual': '개인 퀘스트 등록 - SCA',
      '/teacher/quest/group': '단체 퀘스트 등록 - SCA',
      '/teacher/quest/group/manage': '단체 퀘스트 관리 - SCA',
      '/teacher/quest/approval': '퀘스트 승인 - SCA',
      '/teacher/raid/create': '레이드 등록 - SCA',
      '/teacher/raid/manage': '레이드 관리 - SCA',
      '/teacher/class/create': '반 생성 - SCA',
      '/teacher/students': '학생 목록 - SCA',
      '/teacher/profile': '프로필 - SCA',
    };

    // 정확한 경로 매칭 시도
    let title = pathToTitle[location.pathname];
    
    // 정확한 매칭이 없으면 패턴 매칭
    if (!title) {
      if (location.pathname.startsWith('/teacher/students/')) {
        title = '학생 상세 - SCA';
      } else if (location.pathname.startsWith('/teacher/class/')) {
        title = '반 관리 - SCA';
      } else if (location.pathname.startsWith('/teacher/quest/group/detail/')) {
        title = '단체 퀘스트 상세 - SCA';
      } else if (location.pathname.startsWith('/student')) {
        title = '학생 - SCA';
      } else if (location.pathname.startsWith('/teacher')) {
        title = '선생님 대시보드 - SCA';
      } else {
        title = 'SCA 학습 관리 시스템';
      }
    }

    document.title = title;
  }, [location.pathname]);

  return (
    <Suspense fallback={<div className="p-6">로딩중...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="quests" element={<StudentQuests />} />
          <Route path="gacha" element={<StudentGacha />} />
          <Route path="collection" element={<StudentCollection />} />
          <Route path="raid" element={<StudentRaid />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardNew />} />

          {/* Teacher Quest Routes */}
          <Route path="quest" element={<QuestTypeSelection />} />
          <Route path="quest/individual" element={<IndividualQuestCreatePage />} />
          <Route path="quest/group" element={<GroupQuestCreatePage />} />
          <Route path="quest/group/manage" element={<GroupQuestManagePage />} />
          <Route path="quest/group/detail/:id" element={<GroupQuestDetailPage />} />
          <Route path="quest/approval" element={<QuestApprovalPageNew />} />

          {/* Teacher Raid Routes */}
          <Route path="raid/create" element={<RaidCreatePageNew />} />
          <Route path="raid/manage" element={<RaidManagePage />} />

          {/* Teacher Class Routes */}
          <Route path="class/create" element={<ClassCreatePage />} />
          <Route path="class/:classId/dashboard" element={<ClassActivityDashboard />} />
          <Route path="class/:classId?" element={<ClassManagePage />} />
          <Route path="students/:classId?" element={<StudentListPage />} />
          <Route path="students/:classId/:id" element={<StudentDetailPage />} />

          {/* Teacher Profile */}
          <Route path="profile" element={<TeacherProfilePage />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
