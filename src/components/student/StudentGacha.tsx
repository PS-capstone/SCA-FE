import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuth, StudentUser } from "../../contexts/AppContext";
import { get, post } from "../../utils/api";

interface Fish {
  fish_id: number;
  fish_name: string;
  grade: 'COMMON' | 'RARE' | 'LEGENDARY';
  is_new: boolean;
  current_count: number;
}

export function StudentGacha() {
  const { user, isAuthenticated, userType, access_token } = useAuth();

  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isProbabilityOpen, setIsProbabilityOpen] = useState(false);
  const [resultFish, setResultFish] = useState<Fish | null>(null);

  const [gachaCost, setGachaCost] = useState(10);
  const [studentCoral, setStudentCoral] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const probabilityTable = [
    { rarity: 'COMMON', name: '커먼', rate: '70%', color: 'bg-gray-400' },
    { rarity: 'RARE', name: '레어', rate: '25%', color: 'bg-blue-500' },
    { rarity: 'LEGENDARY', name: '레전더리', rate: '5%', color: 'bg-yellow-600' },
  ];

  useEffect(() => {
    if (isAuthenticated && userType === 'student' && access_token) {
      const fetchGachaInfo = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await get('/api/v1/gacha/info');

          if (!response.ok) {
            throw new Error('가챠 정보를 불러오는데 실패했습니다.');
          }

          const result = await response.json();

          if (result.success) {
            setStudentCoral(result.data.student_coral);
            setGachaCost(result.data.gacha_cost);
          } else {
            throw new Error(result.message || '데이터 포맷 오류');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
        } finally {
          setIsLoading(false);
        }
      };

      fetchGachaInfo();
    }
  }, [isAuthenticated, userType, access_token]);

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-4">로그인 정보 로딩 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 페이지입니다.</div>;
  }

  // 가챠 정보 로딩 중
  if (isLoading) {
    return <div className="p-4">가챠 정보 로딩 중...</div>;
  }

  // 에러 발생 시
  if (error) {
    return <div className="p-4 text-red-500">오류: {error}</div>;
  }

  const drawGacha = async () => {
    if (studentCoral < gachaCost) {
      alert('코랄이 부족합니다!');
      return;
    }

    try {
      const response = await post('/api/v1/gacha/draw', {
        coral: studentCoral
      });

      const result = await response.json();

      // 가챠 뽑기 로직
      if (result.success) {
        // 가챠 성공
        setResultFish(result.data.drawn_fish);
        setStudentCoral(result.data.remaining_coral); // 남은 코랄 업데이트
        setIsResultOpen(true);
        console.log('Gacha result:', result.data);
      } else {
        // 가챠 실패 (예: 코랄 부족)
        if (result.error_code === 'INSUFFICIENT_CORAL') {
          alert('코랄이 부족합니다. (서버 체크)');
          // 서버 값으로 코랄 동기화
          if (result.details && typeof result.details.available === 'number') {
            setStudentCoral(result.details.available);
          }
        } else {
          alert(`오류: ${result.message}`);
        }
      }
    } catch (err) {
      console.error('Gacha draw error:', err);
      alert('가챠 뽑기 중 오류가 발생했습니다.');
    }
  };

  const getRarityBadge = (grade: Fish['grade']) => {
    switch (grade) {
      case 'COMMON':
        return <Badge className="bg-gray-400">커먼</Badge>;
      case 'RARE':
        return <Badge className="bg-blue-500">레어</Badge>;
      case 'LEGENDARY':
        return <Badge className="bg-yellow-600">레전더리</Badge>;
    }
  };

  return (
    <div className="p-4 space-y-6 bg-white min-h-screen pb-20">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-xl font-medium text-black mb-2">가챠 머신</h1>
        <p className="text-gray-600">새로운 물고기를 획득해보세요!</p>
      </div>

      {/* 가챠 머신 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-6">
          {/* 가챠 머신 이미지 */}
          <div className="w-full h-48 bg-gray-200 rounded mb-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <span className="text-gray-600">가챠 머신</span>
            </div>
          </div>

          {/* 현재 코랄 */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">보유 코랄</p>
            <p className="text-2xl font-medium text-black">{studentCoral}</p>
          </div>

          {/* 필요 코랄 */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">필요한 코랄</p>
            <p className="text-lg text-black">{gachaCost}</p>
          </div>

          {/* 가챠 버튼 */}
          <Button
            onClick={drawGacha}
            disabled={studentCoral < gachaCost}
            className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {studentCoral < gachaCost ? '코랄 부족' : '가챠 뽑기'}
          </Button>
        </CardContent>
      </Card>

      {/* 보상 가이드 버튼 */}
      <div className="flex justify-center">
        <Button
          onClick={() => setIsProbabilityOpen(true)}
          className="bg-gray-600 text-white hover:bg-gray-700 px-6 py-2"
        >
          보상 가이드
        </Button>
      </div>

      {/* 가챠 결과 모달 */}
      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black text-center">가챠 결과!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            {/* 물고기 이미지 */}
            <div className={`w-32 h-32 rounded mx-auto flex items-center justify-center ${resultFish?.grade === 'LEGENDARY' ? 'bg-yellow-600' :
              resultFish?.grade === 'RARE' ? 'bg-blue-500' : 'bg-gray-400'
              }`}>
              <span className="text-white">물고기</span>
            </div>

            {/* 물고기 정보 */}
            <div>
              <div className="flex justify-center items-center gap-2 mb-2">
                {resultFish?.is_new && (
                  <Badge className="bg-green-500 text-white">NEW!</Badge>
                )}
                <h3 className="text-lg font-medium text-black">{resultFish?.fish_name}</h3>
              </div>
              {resultFish && getRarityBadge(resultFish.grade)}
              <p className="text-sm text-gray-500 mt-2">
                (보유 수량: {resultFish?.current_count})
              </p>
            </div>

            {/* 희귀도에 따른 효과 설명 */}
            {resultFish?.grade === 'LEGENDARY' && (
              <p className="text-sm text-yellow-600">✨ 레전더리 물고기를 획득했습니다! ✨</p>
            )}
            {resultFish?.grade === 'RARE' && (
              <p className="text-sm text-blue-600">⭐ 레어 물고기를 획득했습니다!</p>
            )}

            <Button
              onClick={() => setIsResultOpen(false)}
              className="w-full bg-black text-white"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 확률표 모달 */}
      <Dialog open={isProbabilityOpen} onOpenChange={setIsProbabilityOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black text-center">보상 가이드</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">가챠에서 획득할 수 있는 물고기의 확률입니다</p>
            </div>

            <div className="space-y-3">
              {probabilityTable.map((item) => (
                <div key={item.rarity} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded ${item.color}`}></div>
                    <span className="text-black font-medium text-lg">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-black font-bold text-xl">{item.rate}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 가챠 팁</h4>
              <p className="text-xs text-blue-600">
                • 코랄 {gachaCost}개로 가챠 1회 뽑기 가능<br />
                • 레전더리 등급은 {probabilityTable.find(p => p.rarity === 'LEGENDARY')?.rate} 확률로 매우 희귀합니다<br />
              </p>
            </div>

            <Button
              onClick={() => setIsProbabilityOpen(false)}
              className="w-full bg-gray-600 text-white hover:bg-gray-700"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}