import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Users, Copy, Sword, Trophy } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Progress } from "../ui/progress";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionCard } from "../common/SectionCard";

export function ClassManagePage() {
  const navigate = useNavigate();
  const [isRaidModalOpen, setIsRaidModalOpen] = useState(false);

  const classInfo = {
    name: "중등 1반",
    invite_code: "MATH2025A",
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

  const handleCopyCode = () => {
    if (!classInfo.invite_code) return;

    navigator.clipboard.writeText(classInfo.invite_code)
      .then(() => {
        alert('초대 코드가 복사되었습니다!');
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert('복사에 실패했습니다.');
      });
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <h1>{classInfo.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">초대 코드:</span>
              <code className="px-2 py-1 border-2 border-gray-300 bg-gray-100">
                {classInfo.invite_code}
              </code>
              <Button 
                variant="ghost" 
                size="sm"
                className="border border-gray-300 hover:bg-gray-100"
                onClick={handleCopyCode}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Quick Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => navigate('/teacher/students')}
            >
              <Users className="w-4 h-4 mr-2" />
              학생 목록 조회
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              onClick={() => navigate('/teacher/class/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              반 생성하기
            </Button>
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => navigate('/teacher/quest')}
            >
              <Plus className="w-4 h-4 mr-2" />
              퀘스트 등록
            </Button>
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => navigate('/teacher/raid/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              레이드 등록
            </Button>
          </div>

          {/* Active Quests */}
          <SectionCard 
            title="현재 진행 중인 단체 퀘스트"
            headerAction={
              <button 
                className="bg-black text-white px-4 py-2 rounded-lg border-2 border-black font-semibold"
                onClick={() => navigate('/teacher/quest/group/manage')}
                style={{ backgroundColor: '#000000', color: 'white' }}
              >
                단체 퀘스트 관리
              </button>
            }
          >
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
          </SectionCard>

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
                      onClick={() => setIsRaidModalOpen(true)}
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
                    onClick={() => navigate('/teacher/raid/create')}
                  >
                    레이드 시작하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 레이드 상세 모달 */}
      <Dialog open={isRaidModalOpen} onOpenChange={setIsRaidModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <Sword className="w-5 h-5 text-black" />
              {activeRaid.name} 상세 정보
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 레이드 상태 */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-2 border-gray-300 rounded-lg bg-white text-black">
                {activeRaid.daysLeft}일 남음
              </Badge>
              <span className="text-sm text-gray-600">현재 진행 중</span>
            </div>

            {/* 보스 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">보스 정보</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-black">보스 HP</span>
                    <span className="text-black font-semibold">{activeRaid.bossHp}%</span>
                  </div>
                  <div className="border-2 border-gray-300 h-6 overflow-hidden rounded bg-gray-200">
                    <div 
                      className="h-full bg-black transition-all duration-300"
                      style={{ width: `${activeRaid.bossHp}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 참여자 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">참여 현황</h3>
              <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                <Users className="w-5 h-5 text-black" />
                <span className="text-lg font-semibold text-black">
                  {activeRaid.participants}명 참여
                </span>
              </div>
            </div>

            {/* 레이드 통계 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">레이드 통계</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 rounded-lg text-center border-2 border-gray-300">
                  <div className="text-2xl font-bold text-black">{activeRaid.bossHp}%</div>
                  <div className="text-sm text-gray-600">남은 HP</div>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg text-center border-2 border-gray-300">
                  <div className="text-2xl font-bold text-black">{activeRaid.daysLeft}일</div>
                  <div className="text-sm text-gray-600">남은 시간</div>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-2 pt-4 border-t-2 border-gray-300">
              <Button 
                variant="outline" 
                className="flex-1 border-2 border-gray-300 rounded-lg bg-white text-black hover:bg-gray-100"
                onClick={() => setIsRaidModalOpen(false)}
              >
                닫기
              </Button>
              <Button 
                className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg"
              >
                레이드 종료
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}