import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth, StudentUser } from "../../contexts/AppContext";

interface Fish {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'legend';
  image: string;
  count: number;
  isOwned: boolean;
}

export function StudentCollection() {
  const { user, isAuthenticated, userType } = useAuth();
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'aquarium' | 'book'>('aquarium');

  // 예시 수집 데이터
  const fishCollection: Fish[] = [
    // 소유한 물고기들
    { id: '1', name: '기본 물고기', rarity: 'common', image: 'fish1', count: 3, isOwned: true },
    { id: '2', name: '파랑 물고기', rarity: 'common', image: 'fish2', count: 2, isOwned: true },
    { id: '6', name: '무지개 물고기', rarity: 'rare', image: 'fish6', count: 1, isOwned: true },
    { id: '11', name: '전설의 드래곤 피쉬', rarity: 'legend', image: 'fish11', count: 1, isOwned: true },

    // 미소유 물고기들 (도감에만 표시)
    { id: '3', name: '빨강 물고기', rarity: 'common', image: 'fish3', count: 0, isOwned: false },
    { id: '4', name: '노랑 물고기', rarity: 'common', image: 'fish4', count: 0, isOwned: false },
    { id: '5', name: '초록 물고기', rarity: 'common', image: 'fish5', count: 0, isOwned: false },
    { id: '7', name: '별빛 물고기', rarity: 'rare', image: 'fish7', count: 0, isOwned: false },
    { id: '8', name: '황금 물고기', rarity: 'rare', image: 'fish8', count: 0, isOwned: false },
    { id: '12', name: '고대의 바다왕', rarity: 'legend', image: 'fish12', count: 0, isOwned: false },
  ];


  const ownedFish = fishCollection.filter(fish => fish.isOwned);
  const totalOwnedCount = ownedFish.reduce((sum, fish) => sum + fish.count, 0);
  const maxCapacity = 20; // 최대 수용 가능 물고기 수

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-4">로그인 정보 로딩 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 페이지입니다.</div>;
  }

  const currentUser = user as StudentUser;

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

  const handleFishClick = (fish: Fish) => {
    setSelectedFish(fish);
    setIsDetailOpen(true);
  };

  const handleDeleteFish = () => {
    if (!selectedFish) return;

    // 실제로는 API 호출
    console.log('Deleting fish:', selectedFish.id);
    alert('물고기가 삭제되었습니다.');
    setIsDeleteWarningOpen(false);
    setIsDetailOpen(false);
  };

  // 수족관이 꽉 찬 경우 경고
  const isNearCapacity = totalOwnedCount >= maxCapacity * 0.8;
  const isFullCapacity = totalOwnedCount >= maxCapacity;

  return (
    <div className="p-4 space-y-4 bg-white min-h-screen pb-20">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-medium text-black">도감</h1>
        {currentView === 'aquarium' && (
          <p className="text-sm text-gray-600">
            수집한 물고기: {ownedFish.length}종 / 총 {totalOwnedCount}마리
          </p>
        )}
        {currentView === 'book' && (
          <p className="text-sm text-gray-600">
            물고기 도감: {fishCollection.filter(f => f.isOwned).length}종 / {fishCollection.length}종
          </p>
        )}
      </div>

      {/* 용량 경고 */}
      {isNearCapacity && (
        <Card className="border-2 border-gray-400">
          <CardContent className="p-4">
            <p className="text-center text-black">
              {isFullCapacity
                ? '⚠️ 수족관이 가득 찼습니다! 일부 물고기를 삭제해주세요.'
                : '⚠️ 수족관 용량이 부족합니다. 곧 정리가 필요합니다.'
              }
            </p>
            <p className="text-center text-sm text-gray-600 mt-1">
              현재: {totalOwnedCount}/{maxCapacity}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 보기 모드 선택 */}
      <Tabs value={currentView} onValueChange={(value: string) => setCurrentView(value as 'aquarium' | 'book')}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="aquarium" className="text-black">수족관</TabsTrigger>
          <TabsTrigger value="book" className="text-black">도감</TabsTrigger>
        </TabsList>

        {/* 수족관 보기 */}
        <TabsContent value="aquarium" className="space-y-4">
          <Card className="border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="text-black text-center">내 수족관</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 수족관 배경 */}
              <div className="w-full h-64 bg-gray-100 border-2 border-gray-300 rounded p-4 relative overflow-hidden">
                <div className="grid grid-cols-4 gap-2 h-full">
                  {ownedFish.map((fish) => (
                    Array.from({ length: fish.count }, (_, index) => (
                      <div
                        key={`${fish.id}-${index}`}
                        onClick={() => handleFishClick(fish)}
                        className={`w-12 h-12 rounded flex items-center justify-center cursor-pointer border ${fish.rarity === 'legend' ? 'bg-gray-800 border-gray-700' :
                          fish.rarity === 'rare' ? 'bg-gray-600 border-gray-500' :
                            'bg-gray-400 border-gray-300'
                          }`}
                      >
                        <span className="text-white text-xs">물고기</span>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 도감 보기 */}
        <TabsContent value="book" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {fishCollection.map((fish) => (
              <Card
                key={fish.id}
                className={`border-2 cursor-pointer ${fish.isOwned ? 'border-gray-300' : 'border-gray-200'
                  }`}
                onClick={() => fish.isOwned && handleFishClick(fish)}
              >
                <CardContent className="p-3">
                  <div className={`w-full h-20 rounded mb-2 flex items-center justify-center ${fish.isOwned
                    ? fish.rarity === 'legend' ? 'bg-gray-800' :
                      fish.rarity === 'rare' ? 'bg-gray-600' : 'bg-gray-400'
                    : 'bg-gray-200'
                    }`}>
                    <span className={fish.isOwned ? 'text-white' : 'text-gray-400'}>
                      {fish.isOwned ? '물고기' : '???'}
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <p className={`font-medium ${fish.isOwned ? 'text-black' : 'text-gray-400'}`}>
                      {fish.isOwned ? fish.name : '???'}
                    </p>
                    {fish.isOwned && (
                      <>
                        {getRarityBadge(fish.rarity)}
                        <p className="text-xs text-gray-600">{fish.count}마리</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>

      {/* 물고기 상세 정보 모달 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">{selectedFish?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 물고기 이미지 */}
            <div className={`w-32 h-32 rounded mx-auto flex items-center justify-center ${selectedFish?.rarity === 'legend' ? 'bg-gray-800' :
              selectedFish?.rarity === 'rare' ? 'bg-gray-600' : 'bg-gray-400'
              }`}>
              <span className="text-white">물고기</span>
            </div>

            {/* 물고기 정보 */}
            <div className="text-center space-y-2">
              {selectedFish && getRarityBadge(selectedFish.rarity)}
              <p className="text-black">보유 수량: {selectedFish?.count}마리</p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex space-x-2">
              {selectedFish && selectedFish.count > 1 && (
                <Button
                  onClick={() => setIsDeleteWarningOpen(true)}
                  className="flex-1 bg-gray-600 text-white hover:bg-gray-700"
                >
                  삭제
                </Button>
              )}
              <Button
                onClick={() => setIsDetailOpen(false)}
                className="flex-1 bg-white text-black border border-gray-300"
              >
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={isDeleteWarningOpen} onOpenChange={setIsDeleteWarningOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">물고기 삭제</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-black">
              {selectedFish?.name} 1마리를 삭제하시겠습니까?
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={handleDeleteFish}
                className="flex-1 bg-gray-600 text-white"
              >
                삭제
              </Button>
              <Button
                onClick={() => setIsDeleteWarningOpen(false)}
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