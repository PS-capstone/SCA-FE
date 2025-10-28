import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { QuestDetailPage } from './QuestDetailPage';

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

interface StudentDashboardProps {
  user: StudentUser;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [selectedQuest, setSelectedQuest] = useState<typeof groupQuests[0] | null>(null);
  const currentRaid = {
    name: '중간고사 대비 레이드',
    bossName: '수학 마왕',
    currentHp: 6500,
    maxHp: 10000,
    timeLeft: '2일 14시간',
    participants: 45
  };

  const announcements = [
    { id: '1', type: '공지', title: '새로운 퀘스트가 추가되었습니다', time: '2시간 전' },
    { id: '2', type: '이벤트', title: '레이드 이벤트 참여하세요!', time: '1일 전' }
  ];

  // 단체 퀘스트 달성률 데이터
  const groupQuests = [
    {
      id: 1,
      title: "출석 체크",
      description: "폰 전부내면 보상",
      completed: 12,
      total: 15,
      incompleteStudents: ["김학생", "이학생", "박학생"]
    },
    {
      id: 2,
      title: "수업 참여도",
      description: "적극적인 수업 참여",
      completed: 14,
      total: 15,
      incompleteStudents: ["최학생"]
    }
  ];

  // 대표 칭호 데이터
  const representativeTitles = [
    { name: "수학의 달인", rarity: "전설", description: "수학 점수 90점 이상 달성" },
    { name: "출석왕", rarity: "희귀", description: "한 달 출석률 100%" },
    { name: "퀘스트 마스터", rarity: "일반", description: "퀘스트 10개 완료" }
  ];

  // 코랄/탐사데이터 로그 데이터
  const activityLogs = [
    { id: 1, type: 'coral', amount: 15, action: '퀘스트 완료', time: '2시간 전', description: '수학 문제집 풀기 완료' },
    { id: 2, type: 'exploration', amount: 8, action: '레이드 참여', time: '5시간 전', description: '중간고사 대비 레이드 참여' },
    { id: 3, type: 'coral', amount: 10, action: '퀘스트 완료', time: '1일 전', description: '영어 단어 암기 완료' },
    { id: 4, type: 'exploration', amount: 12, action: '배틀 승리', time: '1일 전', description: '친구와의 배틀에서 승리' },
    { id: 5, type: 'coral', amount: 20, action: '퀘스트 완료', time: '2일 전', description: '과학 실험 보고서 작성' }
  ];

  // 퀘스트 상세 페이지가 선택된 경우
  if (selectedQuest) {
    return (
      <QuestDetailPage 
        quest={selectedQuest}
        user={user}
        onBack={() => setSelectedQuest(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen pb-20">
      {/* 상단 고정 배너 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-black mb-4">이벤트 & 공지</h3>
          <div className="space-y-3">
            {announcements.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Badge className={item.type === '공지' ? 'bg-gray-100 text-black border-gray-300' : 'bg-black text-white border-black'}>
                    {item.type}
                  </Badge>
                  <span className="text-sm text-black font-medium">{item.title}</span>
                </div>
                <span className="text-xs text-gray-600">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 현재 레이드 보스 HP 요약 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-black mb-2">{currentRaid.name}</h3>
            <p className="text-lg text-gray-600">{currentRaid.bossName}</p>
          </div>

          {/* HP 바 */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">HP</span>
              <span className="text-black font-semibold">{currentRaid.currentHp.toLocaleString()} / {currentRaid.maxHp.toLocaleString()}</span>
            </div>
            <Progress 
              value={(currentRaid.currentHp / currentRaid.maxHp) * 100} 
              className="h-6 bg-gray-200"
              style={{
                '--progress-background': '#000000',
                '--progress-foreground': '#333333'
              } as React.CSSProperties}
            />
          </div>

          {/* 레이드 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
              <span className="text-sm text-gray-600 font-medium">남은 시간</span>
              <p className="text-lg text-black font-bold mt-1">{currentRaid.timeLeft}</p>
            </div>
            <div className="text-center p-4 bg-black rounded-lg border-2 border-black">
              <span className="text-sm text-white font-medium">참여자</span>
              <p className="text-lg text-white font-bold mt-1">{currentRaid.participants}명</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 단체 퀘스트 달성률 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <h3 className="font-medium text-black mb-4">현재 단체 퀘스트 달성률</h3>
          <div className="space-y-4">
            {groupQuests.map((quest) => (
              <div 
                key={quest.id} 
                className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-black">{quest.title}</h4>
                  <span className="text-sm text-gray-600">{quest.completed}/{quest.total}명</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(quest.completed / quest.total) * 100}%` }}
                  />
                </div>
                {quest.incompleteStudents.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">미완료 학생:</span> {quest.incompleteStudents.join(", ")}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2 text-right">
                  클릭하여 상세보기
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 내 현재 상태 및 활동 로그 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <h3 className="font-medium text-black mb-4">내 현재 상태</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 border-2 border-gray-300 rounded">
              <p className="text-sm text-gray-600">코랄</p>
              <p className="text-xl font-medium text-black">{user.currentCoral}</p>
            </div>
            <div className="text-center p-3 border-2 border-gray-300 rounded">
              <p className="text-sm text-gray-600">탐사데이터</p>
              <p className="text-xl font-medium text-black">{user.totalExplorationData}</p>
            </div>
          </div>

          {/* 활동 로그 */}
          <div className="border-t-2 border-gray-300 pt-4">
            <h4 className="font-medium text-black mb-3">최근 활동 로그</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
                      <span className="text-xs font-bold">
                        {log.type === 'coral' ? 'C' : 'E'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">{log.action}</p>
                      <p className="text-xs text-gray-600">{log.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-black">
                      +{log.amount} {log.type === 'coral' ? '코랄' : '탐사데이터'}
                    </p>
                    <p className="text-xs text-gray-500">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 대표 칭호 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <h3 className="font-medium text-black mb-4">대표 칭호</h3>
          <div className="space-y-3">
            {representativeTitles.map((title, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-2 border-gray-300 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">T</span>
                  </div>
                  <div>
                    <p className="font-medium text-black">{title.name}</p>
                    <p className="text-sm text-gray-600">{title.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={title.rarity === '전설' ? 'bg-black text-white border-black' : title.rarity === '희귀' ? 'bg-gray-100 text-black border-gray-300' : 'bg-gray-100 text-black border-gray-300'}>
                    {title.rarity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}