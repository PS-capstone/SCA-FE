import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { TeacherSidebar } from "./TeacherSidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export function StudentListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const students = [
    { 
      id: 1, 
      name: "김학생", 
      avatar: "김",
      pendingQuests: 2,
      coral: 45,
      explorationData: 320,
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
      explorationData: 280,
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
      explorationData: 410,
      approvalRequests: []
    },
    { 
      id: 4, 
      name: "최학생", 
      avatar: "최",
      pendingQuests: 3,
      coral: 31,
      explorationData: 250,
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

  // ?studentId= 로 진입 시 자동 처리
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentId = params.get('studentId');
    if (!studentId) return;
    const s = students.find(st => String(st.id) === String(studentId));
    if (!s) return;

    if (s.pendingQuests > 0) {
      setSelectedStudent(s);
      setIsApprovalModalOpen(true);
    } else {
      navigate(`/teacher/students/${s.id}`, { replace: true });
    }
  }, [location.search]);

  const handleStudentClick = (student: any) => {
    if (student.pendingQuests > 0) {
      setSelectedStudent(student);
      setIsApprovalModalOpen(true);
    } else {
      navigate(`/teacher/students/${student.id}`);
    }
  };

  const handleApproveRequest = (requestId: number) => {
    // 승인 처리 로직
    alert(`승인 요청 ${requestId}번을 승인했습니다.`);
    // 실제로는 API 호출 후 상태 업데이트
  };

  const handleRejectRequest = (requestId: number) => {
    // 거부 처리 로직
    alert(`승인 요청 ${requestId}번을 거부했습니다.`);
    // 실제로는 API 호출 후 상태 업데이트
  };

  return (
    <div className="min-h-screen bg-white flex">
      <TeacherSidebar currentPage="class-list" />
      
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
              <Card 
                key={student.id}
                className="border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleStudentClick(student)}
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

      {/* 승인 요청 모달 */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">
              {selectedStudent?.name}의 승인 요청 ({selectedStudent?.pendingQuests}건)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedStudent?.approvalRequests.map((request: any) => (
              <Card key={request.id} className="border-2 border-gray-300">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-black">{request.title}</h4>
                      <Badge className="bg-gray-100 text-black border-gray-300">
                        <Clock className="w-3 h-3 mr-1" />
                        대기중
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm">{request.description}</p>
                    
                    <div className="text-xs text-gray-500">
                      제출일시: {request.submittedAt}
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveRequest(request.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        승인
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        거부
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t-2 border-gray-300">
            <Button
              variant="outline"
              className="flex-1 border-2 border-gray-300 rounded-lg bg-white text-black hover:bg-gray-100"
              onClick={() => setIsApprovalModalOpen(false)}
            >
              닫기
            </Button>
            <Button
              className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg"
              onClick={() => {
                setIsApprovalModalOpen(false);
                navigate(`/teacher/students/${selectedStudent?.id}`);
              }}
            >
              학생 상세보기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}