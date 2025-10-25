import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus, Users, Copy } from "lucide-react";
import { TeacherSidebar } from "./TeacherSidebar";
import { Progress } from "../ui/progress";

interface ClassManagePageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function ClassManagePage({ onNavigate, onLogout }: ClassManagePageProps) {
  const classInfo = {
    name: "중등 1반",
    inviteCode: "MATH2025A",
    studentCount: 15,
    attendance: 92,
    questCompletion: 78,
  };

  const activeQuests = [
    { id: 1, title: "출석 체크", participants: 15, completed: 12 },
    { id: 2, title: "수업 참여도", participants: 15, completed: 14 },
    { id: 3, title: "과제 제출", participants: 15, completed: 11 },
  ];

  const activeRaid = {
    name: "중간고사 대비 크라켄",
    bossHp: 42,
    participants: 15,
    daysLeft: 3,
  };

  return (
    <div className="min-h-screen bg-white flex">
      <TeacherSidebar currentPage="class-list" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <h1>{classInfo.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">초대 코드:</span>
              <code className="px-2 py-1 border-2 border-gray-300 bg-gray-100">
                {classInfo.inviteCode}
              </code>
              <Button 
                variant="ghost" 
                size="sm"
                className="border border-gray-300 hover:bg-gray-100"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => onNavigate('student-list')}
            >
              <Users className="w-4 h-4 mr-2" />
              학생 목록 조회
            </Button>
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => onNavigate('quest-create-new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              퀘스트 등록
            </Button>
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => onNavigate('raid-create-new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              레이드 등록
            </Button>
          </div>

          {/* Active Quests */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <h3 className="mb-4">현재 진행 중인 그룹 퀘스트</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeQuests.map((quest) => (
                  <Card 
                    key={quest.id} 
                    className="border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4>{quest.title}</h4>
                        <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                          {quest.completed}/{quest.participants}
                        </Badge>
                      </div>
                      <Progress 
                        value={(quest.completed / quest.participants) * 100} 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Raid */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <h3 className="mb-4">현재 진행 중인 레이드</h3>
              {activeRaid ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4>{activeRaid.name}</h4>
                    <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                      {activeRaid.daysLeft}일 남음
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">보스 HP</span>
                      <span>{activeRaid.bossHp}%</span>
                    </div>
                    <div className="border-2 border-gray-300 h-6 overflow-hidden">
                      <div 
                        className="h-full bg-black"
                        style={{ width: `${activeRaid.bossHp}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm border-t-2 border-gray-300 pt-3">
                    <span className="text-gray-600">참여자</span>
                    <span>{activeRaid.participants}명</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                      onClick={() => onNavigate('raid-manage')}
                    >
                      상세 보기
                    </Button>
                    <Button 
                      className="flex-1 bg-black text-white hover:bg-gray-800 rounded-lg"
                    >
                      레이드 종료
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>진행 중인 레이드가 없습니다</p>
                  <Button 
                    variant="outline"
                    className="mt-4 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={() => onNavigate('raid-create-new')}
                  >
                    레이드 시작하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}