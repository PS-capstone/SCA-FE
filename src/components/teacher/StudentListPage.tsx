import { Sidebar } from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { StudentListItem } from "../common/StudentListItem";

export function StudentListPage() {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    const routeMap: Record<string, string> = {
      'teacher-dashboard': '/teacher/dashboard',
      'quest-create-new': '/teacher/quest',
      'class-manage': '/teacher/class',
      'class-create': '/teacher/class/create',
      'student-list': '/teacher/students',
      'raid-create-new': '/teacher/raid/create',
      'raid-manage': '/teacher/raid/manage',
      'quest-approval': '/teacher/quest/approval',
    };
    const route = routeMap[page] || '/teacher/dashboard';
    navigate(route);
  };

  const handleLogout = () => {
    navigate('/teacher/login');
  };
  const students = [
    { 
      id: 1, 
      name: "김학생", 
      avatar: "김",
      pendingQuests: 2,
      coral: 45,
      research_data: 320,
      approvalRequests: [
        {
          id: 1,
          title: "수학 문제집 제출",
          description: "페이지 15-20 문제 완료",
          submittedAt: "2025-01-15 14:30",
          status: "pending"
        },
        {
          id: 2,
          title: "영어 단어 암기",
          description: "Unit 3 단어 20개 암기 완료",
          submittedAt: "2025-01-15 16:45",
          status: "pending"
        }
      ]
    },
    { 
      id: 2, 
      name: "이학생", 
      avatar: "이",
      pendingQuests: 1,
      coral: 38,
      research_data: 280,
      approvalRequests: [
        {
          id: 3,
          title: "과학 실험 보고서",
          description: "물의 끓는점 측정 실험 보고서",
          submittedAt: "2025-01-15 13:20",
          status: "pending"
        }
      ]
    },
    { 
      id: 3, 
      name: "박학생", 
      avatar: "박",
      pendingQuests: 0,
      coral: 52,
      research_data: 410,
      approvalRequests: []
    },
    { 
      id: 4, 
      name: "최학생", 
      avatar: "최",
      pendingQuests: 3,
      coral: 31,
      research_data: 250,
      approvalRequests: [
        {
          id: 4,
          title: "국어 독서 감상문",
          description: "소설 '해리포터' 독서 감상문",
          submittedAt: "2025-01-14 18:30",
          status: "pending"
        },
        {
          id: 5,
          title: "사회 과제",
          description: "우리나라 지리 특성 조사",
          submittedAt: "2025-01-15 09:15",
          status: "pending"
        },
        {
          id: 6,
          title: "체육 운동 기록",
          description: "주 3회 달리기 기록",
          submittedAt: "2025-01-15 17:00",
          status: "pending"
        }
      ]
    },
  ];



  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1>학생 목록</h1>
              <p className="text-gray-600 mt-1">중등 1반 - 총 {students.length}명</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {students.map((student) => (
              <StudentListItem
                key={student.id}
                id={student.id}
                name={student.name}
                avatar={student.avatar}
                pendingQuests={student.pendingQuests}
                coral={student.coral}
                research_data={student.research_data}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}