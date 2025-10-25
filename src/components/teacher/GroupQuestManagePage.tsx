import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TeacherSidebar } from "./TeacherSidebar";
import { ArrowLeft, Users, Target, CheckCircle, Award, Calendar, Plus } from "lucide-react";
import { useState } from "react";

interface GroupQuestManagePageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function GroupQuestManagePage({ onNavigate, onLogout }: GroupQuestManagePageProps) {
  const [activeQuests] = useState([
    {
      id: 1,
      title: "출석 체크",
      description: "폰 전부내면 보상",
      type: "즉시 보상형",
      participants: 15,
      completed: 12,
      reward: "산호 30개",
      deadline: "2025-01-31",
      status: "진행중"
    },
    {
      id: 2,
      title: "학교 시험 점수",
      description: "80점 이상 달성하면 보상!",
      type: "목표 달성형",
      participants: 15,
      completed: 8,
      reward: "산호 50개",
      deadline: "2025-02-15",
      status: "진행중"
    },
    {
      id: 3,
      title: "과제 제출",
      description: "숙제 제출하면 보상!",
      type: "즉시 보상형",
      participants: 15,
      completed: 15,
      reward: "산호 20개",
      deadline: "2025-01-25",
      status: "완료"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "진행중": return "bg-gray-100 text-black border-gray-300";
      case "완료": return "bg-black text-white border-black";
      case "대기중": return "bg-gray-100 text-black border-gray-300";
      default: return "bg-gray-100 text-black border-gray-300";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "즉시 보상형": return "bg-gray-100 text-black border-gray-300";
      case "목표 달성형": return "bg-black text-white border-black";
      default: return "bg-gray-100 text-black border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <TeacherSidebar currentPage="group-quest-manage" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">단체 퀘스트 관리</h1>
              <p className="text-gray-600 mt-1">진행 중인 단체 퀘스트를 관리합니다</p>
            </div>
            <Button 
              className="bg-black hover:bg-gray-800 text-white rounded-lg border-2 border-gray-300"
              onClick={() => onNavigate('quest-create-group')}
            >
              <Plus className="w-4 h-4 mr-2" />
              단체 퀘스트 등록
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* 진행 중인 단체 퀘스트 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black">진행 중인 단체 퀘스트</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeQuests.map((quest) => (
                <Card key={quest.id} className="border-2 border-gray-300 hover:border-gray-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-black">{quest.title}</CardTitle>
                      <Badge className={getStatusColor(quest.status)}>
                        {quest.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{quest.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 퀘스트 타입 */}
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(quest.type)}>
                        {quest.type}
                      </Badge>
                    </div>

                    {/* 진행률 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">진행률</span>
                        <span className="text-black font-semibold">
                          {quest.completed}/{quest.participants}명
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-black h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(quest.completed / quest.participants) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* 보상 정보 */}
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-black" />
                      <span className="text-gray-600">보상:</span>
                      <span className="text-black font-medium">{quest.reward}</span>
                    </div>

                    {/* 마감일 */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">마감:</span>
                      <span className="text-black">{quest.deadline}</span>
                    </div>

                    {/* 액션 버튼들 */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <Button 
                        variant="outline"
                        className="flex-1 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                        onClick={() => onNavigate(`group-quest-detail-${quest.id}`)}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        달성률 체크
                      </Button>
                      {quest.status === "진행중" && (
                        <Button 
                          className="bg-black hover:bg-gray-800 text-white rounded-lg border-2 border-black"
                          onClick={() => alert(`${quest.title} 퀘스트를 완료 처리합니다.`)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          완료
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 통계 요약 */}
          <Card className="border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="text-black">단체 퀘스트 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-black">
                    {activeQuests.filter(q => q.status === "진행중").length}
                  </div>
                  <div className="text-sm text-gray-600">진행 중</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-black">
                    {activeQuests.filter(q => q.status === "완료").length}
                  </div>
                  <div className="text-sm text-gray-600">완료</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-black">
                    {activeQuests.reduce((sum, q) => sum + q.completed, 0)}
                  </div>
                  <div className="text-sm text-gray-600">총 달성</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
