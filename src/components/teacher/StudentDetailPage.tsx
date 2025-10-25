import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Plus, CheckCircle } from "lucide-react";
import { TeacherSidebar } from "./TeacherSidebar";
import { Progress } from "../ui/progress";

interface StudentDetailPageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function StudentDetailPage({ onNavigate, onLogout }: StudentDetailPageProps) {
  const student = {
    name: "김학생",
    avatar: "김",
    coral: 45,
    explorationData: 320,
    attendance: 95,
    questCompletion: 82,
  };

  const ongoingQuests = [
    { id: 1, title: "rpm 100문제 풀기", progress: 75, deadline: "2025.10.05" },
    { id: 2, title: "영어 단어 20개 암기", progress: 100, deadline: "2025.10.04" },
    { id: 3, title: "수학 모의고사 80점", progress: 30, deadline: "2025.10.10" },
  ];

  const pendingApprovals = [
    { 
      id: 1, 
      title: "독서록 작성하기", 
      submittedAt: "2025.10.04 14:30",
      coral: 4,
      explorationData: 80
    },
    { 
      id: 2, 
      title: "5일 연속 출석", 
      submittedAt: "2025.10.04 10:00",
      coral: 3,
      explorationData: 50
    },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <TeacherSidebar currentPage="class-list" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 border-l-2 border-gray-300">
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
              onClick={() => onNavigate('quest-create-new')}
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
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">코랄</p>
                  <h3>{student.coral}</h3>
                </div>
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">탐사데이터</p>
                  <h3>{student.explorationData}</h3>
                </div>
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">출석률</p>
                  <h3>{student.attendance}%</h3>
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
                          onClick={() => onNavigate('quest-approval-new')}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          승인
                        </Button>
                      </div>
                      <div className="flex gap-2 text-sm border-t-2 border-gray-300 pt-2">
                        <span className="text-gray-600">보상:</span>
                        <span>코랄 {quest.coral}</span>
                        <span>탐사데이터 {quest.explorationData}</span>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}