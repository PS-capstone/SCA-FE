import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

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

interface ContributionData {
  totalContribution: number;
  rank: number;
  totalParticipants: number;
  weeklyContribution: number;
}

interface StudentProfileProps {
  user?: StudentUser;
}

export function StudentProfile({ user }: StudentProfileProps) {
  // 기본 사용자 데이터 (실제로는 로그인 후 받아온 데이터를 사용)
  const defaultUser: StudentUser = {
    id: '1',
    realName: '학생',
    username: 'student',
    classCode: 'CLASS001',
    totalCoral: 50,
    currentCoral: 50,
    totalExplorationData: 100,
    mainFish: '기본 물고기'
  };

  const currentUser = user || defaultUser;
  const [showCollection, setShowCollection] = useState(false);

  // 예시 데이터
  const contributionData: ContributionData = {
    totalContribution: 1250,
    rank: 3,
    totalParticipants: 45,
    weeklyContribution: 280
  };

  const questCompletionRate = 85; // 85% 완료율

  return (
    <div className="p-4 space-y-4 bg-white min-h-screen pb-20">
      {/* 프로필 헤더 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* 대표 물고기 */}
            <div className="w-24 h-24 bg-gray-400 rounded-full mx-auto flex items-center justify-center">
              <span className="text-white">물고기</span>
            </div>
            
            {/* 사용자 정보 */}
            <div>
              <h2 className="text-xl font-medium text-black">{currentUser.realName}</h2>
              <p className="text-gray-600">@{currentUser.username}</p>
              <p className="text-gray-600">{currentUser.classCode}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 스탯 정보 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gray-600">현재 퀘스트 달성률</p>
          <p className="text-2xl font-medium text-black">{questCompletionRate}%</p>
        </CardContent>
      </Card>

      {/* 기여도 데이터 */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-black">기여도 기록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">총 기여도</p>
              <p className="text-lg font-medium text-black">{contributionData.totalContribution.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">현재 순위</p>
              <p className="text-lg font-medium text-black">
                {contributionData.rank}위 / {contributionData.totalParticipants}명
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">이번 주 기여도</span>
              <span className="text-black">{contributionData.weeklyContribution}</span>
            </div>
            <Progress value={(contributionData.weeklyContribution / 500) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼들 */}
      <div className="space-y-3">
        <Button
          onClick={() => setShowCollection(true)}
          className="w-full bg-white text-black border-2 border-gray-300 hover:bg-gray-100"
        >
          도감 보기
        </Button>
        
      </div>

      {/* 도감 모달 (간단한 버전) */}
      <Dialog open={showCollection} onOpenChange={setShowCollection}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">내 물고기 컬렉션</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-600">현재 수집한 물고기: 5종</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs">물고기</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowCollection(false)}
              className="w-full bg-black text-white"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}