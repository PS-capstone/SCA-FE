import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

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

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen pb-20">
      {/* 상단 고정 배너 */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">이벤트 & 공지</h3>
          <div className="space-y-3">
            {announcements.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Badge className={item.type === '공지' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-orange-100 text-orange-800 border-orange-200'}>
                    {item.type}
                  </Badge>
                  <span className="text-sm text-gray-900 font-medium">{item.title}</span>
                </div>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 현재 레이드 보스 HP 요약 */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{currentRaid.name}</h3>
            <p className="text-lg text-gray-600">{currentRaid.bossName}</p>
          </div>

          {/* 보스 이미지 영역 */}
          <div className="w-full h-40 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl mb-6 flex items-center justify-center border-2 border-red-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">👹</span>
              </div>
              <span className="text-gray-700 font-medium">보스 이미지</span>
            </div>
          </div>

          {/* HP 바 */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">HP</span>
              <span className="text-gray-900 font-semibold">{currentRaid.currentHp.toLocaleString()} / {currentRaid.maxHp.toLocaleString()}</span>
            </div>
            <Progress 
              value={(currentRaid.currentHp / currentRaid.maxHp) * 100} 
              className="h-6 bg-gray-200"
              style={{
                '--progress-background': '#ef4444',
                '--progress-foreground': '#dc2626'
              } as React.CSSProperties}
            />
          </div>

          {/* 레이드 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-600 font-medium">남은 시간</span>
              <p className="text-lg text-blue-900 font-bold mt-1">{currentRaid.timeLeft}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm text-green-600 font-medium">참여자</span>
              <p className="text-lg text-green-900 font-bold mt-1">{currentRaid.participants}명</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 내 현재 상태 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <h3 className="font-medium text-black mb-3">내 현재 상태</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">코랄</p>
              <p className="text-xl font-medium text-black">{user.currentCoral}</p>
            </div>
            <div className="text-center p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">탐사데이터</p>
              <p className="text-xl font-medium text-black">{user.totalExplorationData}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}