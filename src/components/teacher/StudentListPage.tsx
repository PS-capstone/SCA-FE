import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { TeacherSidebar } from "./TeacherSidebar";

interface StudentListPageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function StudentListPage({ onNavigate, onLogout }: StudentListPageProps) {
  const students = [
    { 
      id: 1, 
      name: "김학생", 
      avatar: "김",
      pendingQuests: 2,
      coral: 45,
      explorationData: 320
    },
    { 
      id: 2, 
      name: "이학생", 
      avatar: "이",
      pendingQuests: 1,
      coral: 38,
      explorationData: 280
    },
    { 
      id: 3, 
      name: "박학생", 
      avatar: "박",
      pendingQuests: 0,
      coral: 52,
      explorationData: 410
    },
    { 
      id: 4, 
      name: "최학생", 
      avatar: "최",
      pendingQuests: 3,
      coral: 31,
      explorationData: 250
    },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <TeacherSidebar currentPage="class-list" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <h1>학생 목록</h1>
          <p className="text-gray-600 mt-1">중등 1반 - 총 {students.length}명</p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
            {students.map((student) => (
              <Card 
                key={student.id}
                className="border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onNavigate(`student-detail-${student.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12 border-2 border-gray-300">
                      <AvatarFallback className="bg-gray-200 text-black">
                        {student.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4>{student.name}</h4>
                      {student.pendingQuests > 0 && (
                        <Badge className="mt-1 bg-black text-white rounded-lg">
                          승인 요청 {student.pendingQuests}건
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm border-t-2 border-gray-300 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">코랄</span>
                      <span>{student.coral}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">탐사데이터</span>
                      <span>{student.explorationData}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}