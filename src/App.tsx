import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { RoleSelection } from "./components/RoleSelection";

// Student components
import { StudentAuth } from "./components/student/StudentAuth";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { StudentQuests } from "./components/student/StudentQuests";
import { StudentGacha } from "./components/student/StudentGacha";
import { StudentCollection } from "./components/student/StudentCollection";
import { StudentProfile } from "./components/student/StudentProfile";
import { StudentBattle } from "./components/student/StudentBattle";
import { StudentBottomNav } from "./components/student/StudentBottomNav";

// Teacher components
import { TeacherLoginPageNew } from "./components/teacher/TeacherLoginPageNew";
import { TeacherSignupPageNew } from "./components/teacher/TeacherSignupPageNew";
import { TeacherDashboardNew } from "./components/teacher/TeacherDashboardNew";
import { QuestCreatePageNew } from "./components/teacher/QuestCreatePageNew";
import { QuestApprovalPageNew } from "./components/teacher/QuestApprovalPageNew";
import { RaidCreatePageNew } from "./components/teacher/RaidCreatePageNew";
import { ClassManagePage } from "./components/teacher/ClassManagePage";
import { StudentListPage } from "./components/teacher/StudentListPage";
import { StudentDetailPage } from "./components/teacher/StudentDetailPage";
import { RaidManagePage } from "./components/teacher/RaidManagePage";
import { TeacherProfilePage } from "./components/teacher/TeacherProfilePage";
import { ClassCreatePage } from "./components/teacher/ClassCreatePage";
import { QuestTypeSelection } from "./components/teacher/QuestTypeSelection";
import { IndividualQuestCreatePage } from "./components/teacher/IndividualQuestCreatePage";
import { GroupQuestCreatePage } from "./components/teacher/GroupQuestCreatePage";
import { GroupQuestManagePage } from "./components/teacher/GroupQuestManagePage";
import { GroupQuestDetailPage } from "./components/teacher/GroupQuestDetailPage";

interface StudentUser {
  id: string;
  realName: string;
  username: string;
  classCode: string;
  totalCoral: number;
  currentCoral: number;
  totalExplorationData: number;
  mainFish: string;
}

interface TeacherUser {
  id: string;
  name: string;
  email: string;
  school: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("role-selection");
  const [currentStudentScreen, setCurrentStudentScreen] = useState<string>("dashboard");
  const [studentUser, setStudentUser] = useState<StudentUser | null>(null);
  const [teacherUser, setTeacherUser] = useState<TeacherUser | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    setTeacherUser(null);
    setCurrentPage("role-selection");
  };

  const handleStudentLogin = (user: StudentUser) => {
    setStudentUser(user);
    setCurrentPage("student-main");
  };

  const handleTeacherLogin = (user: TeacherUser) => {
    setTeacherUser(user);
    setCurrentPage("teacher-dashboard-new");
  };

  const handleStudentScreenChange = (screen: string) => {
    setCurrentStudentScreen(screen);
  };

  const handleRoleSelection = (role: string) => {
    if (role === 'student') {
      setCurrentPage("student-auth");
    } else if (role === 'teacher') {
      setCurrentPage("teacher-login-new");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "role-selection":
        return <RoleSelection onSelectRole={handleRoleSelection} />;
      
      // Student pages
      case "student-auth":
        return <StudentAuth onLogin={handleStudentLogin} />;
      
      case "student-main":
        if (!studentUser) return <StudentAuth onLogin={handleStudentLogin} />;
        
        return (
          <div className="min-h-screen bg-white">
            {renderStudentScreen()}
            <StudentBottomNav 
              currentScreen={currentStudentScreen as any} 
              onNavigate={handleStudentScreenChange}
              onLogout={() => {
                setStudentUser(null);
                setCurrentPage("role-selection");
              }}
            />
          </div>
        );
      
      // Teacher pages
      case "teacher-login-new":
      case "login":
        return <TeacherLoginPageNew onNavigate={handleNavigate} />;
      case "teacher-signup-new":
      case "signup":
        return <TeacherSignupPageNew onNavigate={handleNavigate} />;
      
      case "teacher-dashboard-new":
      case "dashboard":
        return <TeacherDashboardNew onNavigate={handleNavigate} onLogout={handleLogout} />;
      
      case "quest-create-new":
        return <QuestTypeSelection onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "quest-create-individual":
        return <IndividualQuestCreatePage onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "quest-create-group":
        return <GroupQuestCreatePage onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "group-quest-manage":
        return <GroupQuestManagePage onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "group-quest-detail-1":
      case "group-quest-detail-2":
      case "group-quest-detail-3":
        return <GroupQuestDetailPage onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "quest-approval-new":
        return <QuestApprovalPageNew onNavigate={handleNavigate} onLogout={handleLogout} />;
      
      case "raid-create-new":
        return <RaidCreatePageNew onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "raid-manage":
        return <RaidManagePage onNavigate={handleNavigate} onLogout={handleLogout} />;
      
      case "class-list":
      case "class-manage":
      case "class-manage-1":
      case "class-manage-2":
      case "class-manage-3":
      case "class-manage-4":
        return <ClassManagePage onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "student-list":
        return <StudentListPage onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "student-detail-1":
      case "student-detail-2":
      case "student-detail-3":
      case "student-detail-4":
        return <StudentDetailPage onNavigate={handleNavigate} onLogout={handleLogout} />;
      
      case "teacher-profile":
        return <TeacherProfilePage onNavigate={handleNavigate} onLogout={handleLogout} />;
      
      case "class-create":
        return <ClassCreatePage onNavigate={handleNavigate} onLogout={handleLogout} />;
      
      
      default:
        return <RoleSelection onSelectRole={handleRoleSelection} />;
    }
  };

  const renderStudentScreen = () => {
    if (!studentUser) return null;

    switch (currentStudentScreen) {
      case "dashboard":
        return <StudentDashboard user={studentUser} />;
      case "quest":
        return <StudentQuests user={studentUser} />;
      case "gacha":
        return <StudentGacha user={studentUser} />;
      case "collection":
        return <StudentCollection user={studentUser} />;
      case "profile":
        return <StudentProfile user={studentUser} />;
      case "battle":
        return <StudentBattle user={studentUser} />;
      default:
        return <StudentDashboard user={studentUser} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
      <Toaster />
    </div>
  );
}