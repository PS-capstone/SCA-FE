import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuth, StudentUser } from "../../contexts/AppContext";

interface RaidData {
  name: string;
  bossName: string;
  currentHp: number;
  maxHp: number;
  timeLeft: string;
  skillGauge: number;
  maxSkillGauge: number;
  skillReady: boolean;
}

export function StudentRaid() {
  const { user, isAuthenticated, userType } = useAuth();
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [contributeAmount, setContributeAmount] = useState(0);
  const [lastContributeResult, setLastContributeResult] = useState<{
    base: number;
    bonus: number;
    total: number;
    diceResult: number;
  } | null>(null);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);

  const raidData: RaidData = {
    name: '레이드: 중간고사 마왕',
    bossName: '수학의 악마',
    currentHp: 6500,
    maxHp: 10000,
    timeLeft: '48:15',
    skillGauge: 1000,
    maxSkillGauge: 1000,
    skillReady: true
  };

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-4">로그인 정보 로딩 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 페이지입니다.</div>;
  }

  const currentUser = user as StudentUser;
  const handleEnergyContribute = () => {
    if (contributeAmount <= 0 || contributeAmount > currentUser.research_data) {
      alert('올바른 기여량을 입력해주세요.');
      return;
    }

    // 주사위 굴리기 애니메이션 시작
    setIsDiceRolling(true);
    setDiceResult(null);

    // 주사위 굴리기 애니메이션 (2초)
    setTimeout(() => {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      const bonusMultiplier = diceResult / 6; // 0.16 ~ 1.0
      const bonus = Math.floor(contributeAmount * bonusMultiplier);
      const total = contributeAmount + bonus;

      setDiceResult(diceResult);
      setIsDiceRolling(false);

      setLastContributeResult({
        base: contributeAmount,
        bonus: bonus,
        total: total,
        diceResult: diceResult
      });

      // 실제로는 API 호출
      console.log('Energy contribution:', {
        userId: currentUser.id,
        baseAmount: contributeAmount,
        bonusAmount: bonus,
        totalAmount: total,
        diceResult: diceResult
      });

      setIsContributeOpen(false);
      setContributeAmount(0);

      alert(`기여 완료! 기본 ${contributeAmount} + 보너스 ${bonus} = 총 ${total} 기여`);
    }, 2000);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}시간 ${minutes}분`;
  };

  return (
    <div className="p-4 space-y-4 bg-white min-h-screen pb-20">
      {/* 레이드 헤더 */}
      <Card className="border-2 border-gray-300">
        <CardHeader className="text-center">
          <CardTitle className="text-black">{raidData.name}</CardTitle>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">남은 시간</span>
            <span className="text-black font-medium">{formatTime(raidData.timeLeft)}</span>
          </div>
        </CardHeader>
      </Card>

      {/* 보스 영역 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-6">
          {/* 보스 이미지 */}
          <div className="w-full h-48 bg-black rounded mb-4 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-gray-400 rounded-full mx-auto mb-2"></div>
              <p className="font-medium">{raidData.bossName}</p>
            </div>
          </div>

          {/* 보스 HP 바 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-black font-medium">보스 HP</span>
              <span className="text-black">
                {raidData.currentHp.toLocaleString()} / {raidData.maxHp.toLocaleString()}
              </span>
            </div>
            <Progress
              value={(raidData.currentHp / raidData.maxHp) * 100}
              className="h-6 bg-gray-200"
              style={{
                '--progress-background': '#ef4444',
                '--progress-foreground': '#dc2626'
              } as React.CSSProperties}
            />
          </div>
        </CardContent>
      </Card>

      {/* 개인 기여 영역 */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-black text-center">개인 기여</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 보유 자원 및 상태 */}
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">보유 탐사데이터</p>
              <p className="text-xl font-medium text-black">{currentUser.research_data}</p>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            <Button
              onClick={() => setIsContributeOpen(true)}
              className="w-full bg-black text-white hover:bg-gray-800 h-12"
              disabled={currentUser.research_data <= 0}
            >
              에너지 주입
            </Button>
          </div>

          {/* 마지막 기여 결과 */}
          {lastContributeResult && (
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-3">
                <p className="text-center text-sm text-gray-600 mb-2">마지막 기여 결과</p>
                <div className="text-center space-y-1">
                  <p className="text-black">
                    기본: {lastContributeResult.base} + 보너스: {lastContributeResult.bonus}
                  </p>
                  <p className="font-medium text-black">
                    총 기여: {lastContributeResult.total}
                  </p>
                  <Badge className="bg-gray-600">
                    주사위: {lastContributeResult.diceResult}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* 레이드 완료 시 보상 */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-black text-center">레이드 완료 시 보상</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-3 border border-gray-200 rounded">
            <p className="text-sm text-gray-600 mb-1">특별 보상</p>
            <p className="text-lg font-medium text-black">아이스크림</p>
          </div>
        </CardContent>
      </Card>

      {/* 레이드 로그 */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-black">
            레이드 로그
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-3 border-2 border-gray-300 rounded-lg p-3">
            {/* 최근 활동들 */}
            <div className="bg-gray-100 border-l-4 border-gray-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span className="text-sm font-medium text-black">김학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">2분 전</span>
              </div>
            </div>

            <div className="bg-white border-l-4 border-gray-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span className="text-sm font-medium text-black">이학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">5분 전</span>
              </div>
            </div>

            <div className="bg-gray-100 border-l-4 border-gray-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span className="text-sm font-medium text-black">박학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">8분 전</span>
              </div>
            </div>

            <div className="bg-white border-l-4 border-gray-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span className="text-sm font-medium text-black">최학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">12분 전</span>
              </div>
            </div>

            <div className="bg-gray-100 border-l-4 border-gray-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span className="text-sm font-medium text-black">정학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">15분 전</span>
              </div>
            </div>

            <div className="bg-white border-l-4 border-gray-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span className="text-sm font-medium text-black">한학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">18분 전</span>
              </div>
            </div>

            <div className="bg-gray-100 border-l-4 border-gray-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span className="text-sm font-medium text-black">조학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">22분 전</span>
              </div>
            </div>

            <div className="bg-white border-l-4 border-gray-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span className="text-sm font-medium text-black">윤학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">25분 전</span>
              </div>
            </div>

            <div className="bg-gray-100 border-l-4 border-gray-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span className="text-sm font-medium text-black">강학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">28분 전</span>
              </div>
            </div>

            <div className="bg-rose-50 border-l-4 border-rose-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                  <span className="text-sm font-medium text-rose-800">임학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-rose-600 bg-rose-100 px-2 py-1 rounded">32분 전</span>
              </div>
            </div>

            <div className="bg-lime-50 border-l-4 border-lime-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full"></span>
                  <span className="text-sm font-medium text-lime-800">서학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-lime-600 bg-lime-100 px-2 py-1 rounded">35분 전</span>
              </div>
            </div>

            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded-r">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-sm font-medium text-emerald-800">오학생님이 에너지를 주입했습니다</span>
                </div>
                <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">38분 전</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 기여 모달 */}
      <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">에너지 주입</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                보유 탐사데이터: {currentUser.research_data}
              </p>
              <input
                type="number"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(Number(e.target.value))}
                max={currentUser.research_data}
                min={1}
                className="w-full p-3 border border-gray-300 rounded bg-white text-black"
                placeholder="기여할 양을 입력하세요"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded space-y-2">
              <p className="text-sm text-gray-600 mb-1">기여 계산 방식:</p>
              <p className="text-xs text-black">
                기본 기여량 + 주사위 보너스(1-6) = 최종 기여량
              </p>
              <div className="flex items-center justify-center">
                {isDiceRolling ? (
                  <div className="w-12 h-12 border-2 border-gray-300 rounded bg-gray-400 flex items-center justify-center animate-spin">
                    <span className="text-white text-xs">🎲</span>
                  </div>
                ) : diceResult ? (
                  <div className="w-12 h-12 border-2 border-gray-300 rounded bg-gray-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{diceResult}</span>
                  </div>
                ) : (
                  <div className="w-12 h-12 border-2 border-gray-300 rounded bg-white flex items-center justify-center text-xs">
                    주사위
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleEnergyContribute}
                className="flex-1 bg-black text-white"
                disabled={contributeAmount <= 0 || contributeAmount > currentUser.research_data || isDiceRolling}
              >
                {isDiceRolling ? '주사위 굴리는 중...' : '기여하기'}
              </Button>
              <Button
                onClick={() => setIsContributeOpen(false)}
                className="flex-1 bg-white text-black border border-gray-300"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}