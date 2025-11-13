import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuth, StudentUser } from "../../contexts/AppContext";

interface Fish {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'legend';
  image: string;
}

export function StudentGacha() {
  const { user, isAuthenticated, userType } = useAuth();

  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isProbabilityOpen, setIsProbabilityOpen] = useState(false);
  const [resultFish, setResultFish] = useState<Fish | null>(null);

  const gachaCost = 10; // 코랄 10개 필요

  const fishDatabase: Fish[] = [
    // Common (60%)
    { id: '1', name: '기본 물고기', rarity: 'common', image: 'fish1' },
    { id: '2', name: '파랑 물고기', rarity: 'common', image: 'fish2' },
    { id: '3', name: '빨강 물고기', rarity: 'common', image: 'fish3' },
    { id: '4', name: '노랑 물고기', rarity: 'common', image: 'fish4' },
    { id: '5', name: '초록 물고기', rarity: 'common', image: 'fish5' },

    // Rare (30%)
    { id: '6', name: '무지개 물고기', rarity: 'rare', image: 'fish6' },
    { id: '7', name: '별빛 물고기', rarity: 'rare', image: 'fish7' },
    { id: '8', name: '황금 물고기', rarity: 'rare', image: 'fish8' },
    { id: '9', name: '크리스탈 물고기', rarity: 'rare', image: 'fish9' },
    { id: '10', name: '다이아 물고기', rarity: 'rare', image: 'fish10' },

    // Legend (10%)
    { id: '11', name: '전설의 드래곤 피쉬', rarity: 'legend', image: 'fish11' },
    { id: '12', name: '고대의 바다왕', rarity: 'legend', image: 'fish12' },
    { id: '13', name: '신화의 크라켄', rarity: 'legend', image: 'fish13' },
    { id: '14', name: '환상의 리바이어던', rarity: 'legend', image: 'fish14' },
    { id: '15', name: '천공의 바다독수리', rarity: 'legend', image: 'fish15' },
  ];

  const probabilityTable = [
    { rarity: 'common', name: '커먼', rate: '60%', color: 'bg-gray-400' },
    { rarity: 'rare', name: '레어', rate: '30%', color: 'bg-gray-600' },
    { rarity: 'legend', name: '레전드', rate: '10%', color: 'bg-black' },
  ];

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-4">로그인 정보 로딩 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 페이지입니다.</div>;
  }

  const currentUser = user as StudentUser;

  const drawGacha = () => {
    if (currentUser.coral < gachaCost) {
      alert('코랄이 부족합니다!');
      return;
    }

    // 가챠 뽑기 로직
    const random = Math.random() * 100;
    let selectedRarity: Fish['rarity'];

    if (random < 10) {
      selectedRarity = 'legend';
    } else if (random < 40) {
      selectedRarity = 'rare';
    } else {
      selectedRarity = 'common';
    }

    const fishOfRarity = fishDatabase.filter(fish => fish.rarity === selectedRarity);
    const randomFish = fishOfRarity[Math.floor(Math.random() * fishOfRarity.length)];

    setResultFish(randomFish);
    setIsResultOpen(true);

    // 실제로는 API 호출하여 코랄 차감 및 물고기 추가
    console.log('Gacha result:', randomFish);
  };

  const getRarityBadge = (rarity: Fish['rarity']) => {
    switch (rarity) {
      case 'common':
        return <Badge className="bg-gray-400">커먼</Badge>;
      case 'rare':
        return <Badge className="bg-gray-600">레어</Badge>;
      case 'legend':
        return <Badge className="bg-black">레전드</Badge>;
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
            <p className="text-2xl font-medium text-black">{currentUser.coral}</p>
          </div>

          {/* 필요 코랄 */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">필요한 코랄</p>
            <p className="text-lg text-black">{gachaCost}</p>
          </div>

          {/* 가챠 버튼 */}
          <Button
            onClick={drawGacha}
            disabled={currentUser.coral < gachaCost}
            className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {currentUser.coral < gachaCost ? '코랄 부족' : '가챠 뽑기'}
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
            <div className={`w-32 h-32 rounded mx-auto flex items-center justify-center ${resultFish?.rarity === 'legend' ? 'bg-gray-800' :
              resultFish?.rarity === 'rare' ? 'bg-gray-600' : 'bg-gray-400'
              }`}>
              <span className="text-white">물고기</span>
            </div>

            {/* 물고기 정보 */}
            <div>
              <h3 className="text-lg font-medium text-black">{resultFish?.name}</h3>
              {resultFish && getRarityBadge(resultFish.rarity)}
            </div>

            {/* 희귀도에 따른 효과 설명 */}
            {resultFish?.rarity === 'legend' && (
              <p className="text-sm text-gray-600">✨ 전설급 물고기를 획득했습니다! ✨</p>
            )}
            {resultFish?.rarity === 'rare' && (
              <p className="text-sm text-gray-600">⭐ 희귀한 물고기를 획득했습니다!</p>
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
                • 코랄 10개로 가챠 1회 뽑기 가능<br />
                • 레전드 등급은 10% 확률로 매우 희귀합니다<br />
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