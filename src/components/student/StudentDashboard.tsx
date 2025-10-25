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
    <div className="p-4 space-y-4 bg-white min-h-screen pb-20">
      {/* 상단 고정 배너 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <h3 className="font-medium text-black mb-3">이벤트 & 공지</h3>
          <div className="space-y-2">
            {announcements.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <div className="flex items-center space-x-2">
                  <Badge className={item.type === '공지' ? 'bg-gray-600' : 'bg-black'}>
                    {item.type}
                  </Badge>
                  <span className="text-sm text-black line-clamp-1">{item.title}</span>
                </div>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 현재 레이드 보스 HP 요약 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <h3 className="font-medium text-black">{currentRaid.name}</h3>
            <p className="text-sm text-gray-600">{currentRaid.bossName}</p>
          </div>

          {/* 보스 이미지 영역 */}
          <div className="w-full h-32 bg-gray-200 rounded mb-4 flex items-center justify-center">
            <span className="text-gray-600">보스 이미지</span>
          </div>

          {/* HP 바 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-black">HP</span>
              <span className="text-black">{currentRaid.currentHp.toLocaleString()} / {currentRaid.maxHp.toLocaleString()}</span>
            </div>
            <Progress value={(currentRaid.currentHp / currentRaid.maxHp) * 100} className="h-4" />
          </div>

          {/* 레이드 정보 */}
          <div className="flex justify-between mt-4 text-sm">
            <div>
              <span className="text-gray-600">남은 시간</span>
              <p className="text-black font-medium">{currentRaid.timeLeft}</p>
            </div>
            <div>
              <span className="text-gray-600">참여자</span>
              <p className="text-black font-medium">{currentRaid.participants}명</p>
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