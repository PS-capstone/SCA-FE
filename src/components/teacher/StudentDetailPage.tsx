import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Plus, CheckCircle } from "lucide-react";
<<<<<<< HEAD
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function StudentDetailPage() {
  const navigate = useNavigate();
  const { classId, id } = useParams<{ classId?: string; id: string }>();
  
  const handleNavigate = (page: string) => {
    const routeMap: Record<string, string> = {
      'teacher-dashboard': '/teacher/dashboard',
      'quest-create-new': '/teacher/quest',
      'class-manage': classId ? `/teacher/class/${classId}` : '/teacher/class',
      'class-create': '/teacher/class/create',
      'student-list': classId ? `/teacher/students/${classId}` : '/teacher/students',
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
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{[key: number]: string}>({});

=======
import { TeacherSidebar } from "./TeacherSidebar";
import { Progress } from "../ui/progress";

interface StudentDetailPageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function StudentDetailPage({ onNavigate, onLogout }: StudentDetailPageProps) {
>>>>>>> f721c34 (Initial commit)
  const student = {
    name: "김학생",
    avatar: "김",
    coral: 45,
<<<<<<< HEAD
    research_data: 320,
=======
    explorationData: 320,
    attendance: 95,
>>>>>>> f721c34 (Initial commit)
    questCompletion: 82,
  };

  const ongoingQuests = [
<<<<<<< HEAD
    { id: 1, title: "rpm 100문제 풀기", deadline: "2025-10-05T23:59:59" },
    { id: 2, title: "영어 단어 20개 암기", deadline: "2025-10-04T23:59:59" },
    { id: 3, title: "수학 모의고사 80점", deadline: "2025-10-10T23:59:59" },
  ];

  // 실시간 마감 시간 계산
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const newTimeLeft: {[key: number]: string} = {};
      
      ongoingQuests.forEach(quest => {
        const deadline = new Date(quest.deadline);
        const diff = deadline.getTime() - now.getTime();
        
        if (diff <= 0) {
          newTimeLeft[quest.id] = "마감됨";
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            newTimeLeft[quest.id] = `${days}일 ${hours}시간 남음`;
          } else if (hours > 0) {
            newTimeLeft[quest.id] = `${hours}시간 ${minutes}분 남음`;
          } else {
            newTimeLeft[quest.id] = `${minutes}분 남음`;
          }
        }
      });
      
      setTimeLeft(newTimeLeft);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

=======
    { id: 1, title: "rpm 100문제 풀기", progress: 75, deadline: "2025.10.05" },
    { id: 2, title: "영어 단어 20개 암기", progress: 100, deadline: "2025.10.04" },
    { id: 3, title: "수학 모의고사 80점", progress: 30, deadline: "2025.10.10" },
  ];

>>>>>>> f721c34 (Initial commit)
  const pendingApprovals = [
    { 
      id: 1, 
      title: "독서록 작성하기", 
      submittedAt: "2025.10.04 14:30",
      coral: 4,
<<<<<<< HEAD
      research_data: 80
=======
      explorationData: 80
>>>>>>> f721c34 (Initial commit)
    },
    { 
      id: 2, 
      title: "5일 연속 출석", 
      submittedAt: "2025.10.04 10:00",
      coral: 3,
<<<<<<< HEAD
      research_data: 50
=======
      explorationData: 50
>>>>>>> f721c34 (Initial commit)
    },
  ];

  return (
<<<<<<< HEAD
    <>
=======
    <div className="min-h-screen bg-white flex">
      <TeacherSidebar currentPage="class-list" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 border-l-2 border-gray-300">
>>>>>>> f721c34 (Initial commit)
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-gray-300">
              <AvatarFallback className="bg-gray-200 text-black text-xl">
                {student.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1>{student.name}</h1>
              <p className="text-gray-600 mt-1">중등 1반</p>
            </div>
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
<<<<<<< HEAD
              onClick={() => handleNavigate('quest-create-new')}
=======
              onClick={() => onNavigate('quest-create-new')}
>>>>>>> f721c34 (Initial commit)
            >
              <Plus className="w-4 h-4 mr-2" />
              퀘스트 등록
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6 max-w-4xl">
          {/* Stats */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <h3 className="mb-4">학생 스테이터스</h3>
<<<<<<< HEAD
              <div className="grid grid-cols-3 gap-4">
=======
              <div className="grid grid-cols-4 gap-4">
>>>>>>> f721c34 (Initial commit)
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">코랄</p>
                  <h3>{student.coral}</h3>
                </div>
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">탐사데이터</p>
<<<<<<< HEAD
                  <h3>{student.research_data}</h3>
=======
                  <h3>{student.explorationData}</h3>
                </div>
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">출석률</p>
                  <h3>{student.attendance}%</h3>
>>>>>>> f721c34 (Initial commit)
                </div>
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">퀘스트 달성률</p>
                  <h3>{student.questCompletion}%</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3>승인 대기 중인 퀘스트</h3>
                <Badge className="bg-black text-white rounded-lg">
                  {pendingApprovals.length}건
                </Badge>
              </div>
              <div className="space-y-3">
                {pendingApprovals.map((quest) => (
                  <Card key={quest.id} className="border-2 border-gray-300 rounded-lg">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4>{quest.title}</h4>
                          <p className="text-sm text-gray-600">제출: {quest.submittedAt}</p>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-black text-white hover:bg-gray-800 rounded-lg"
<<<<<<< HEAD
                          onClick={() => setShowApprovalModal(true)}
=======
                          onClick={() => onNavigate('quest-approval-new')}
>>>>>>> f721c34 (Initial commit)
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          승인
                        </Button>
                      </div>
                      <div className="flex gap-2 text-sm border-t-2 border-gray-300 pt-2">
                        <span className="text-gray-600">보상:</span>
                        <span>코랄 {quest.coral}</span>
<<<<<<< HEAD
                        <span>탐사데이터 {quest.research_data}</span>
=======
                        <span>탐사데이터 {quest.explorationData}</span>
>>>>>>> f721c34 (Initial commit)
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ongoing Quests */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <h3 className="mb-4">현재 진행 중인 퀘스트</h3>
              <div className="space-y-3">
                {ongoingQuests.map((quest) => (
                  <Card key={quest.id} className="border-2 border-gray-300 rounded-lg">
                    <CardContent className="p-3">
<<<<<<< HEAD
                      <div className="flex items-center justify-between">
                        <h4>{quest.title}</h4>
                        <span className={`text-sm ${timeLeft[quest.id] === "마감됨" ? "text-red-600" : "text-gray-600"}`}>
                          {timeLeft[quest.id] || "로딩 중..."}
                        </span>
=======
                      <div className="flex items-center justify-between mb-2">
                        <h4>{quest.title}</h4>
                        <span className="text-sm text-gray-600">마감: {quest.deadline}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">진행률</span>
                          <span>{quest.progress}%</span>
                        </div>
                        <div className="border-2 border-gray-300 h-4 overflow-hidden">
                          <div 
                            className="h-full bg-black transition-all"
                            style={{ width: `${quest.progress}%` }}
                          />
                        </div>
>>>>>>> f721c34 (Initial commit)
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
<<<<<<< HEAD

      {/* 승인 모달 */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-black">
              승인되었습니다
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600">퀘스트가 성공적으로 승인되었습니다.</p>
          </div>
          <div className="flex justify-center">
            <Button 
              className="bg-black text-white hover:bg-gray-800 rounded-lg"
              onClick={() => setShowApprovalModal(false)}
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
=======
      </div>
    </div>
>>>>>>> f721c34 (Initial commit)
  );
}