import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

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

interface ClassSelectionProps {
  user: StudentUser;
  onComplete: () => void;
}

export function ClassSelection({ user, onComplete }: ClassSelectionProps) {
  // 예시: 한 학생이 여러 반에 속할 수 있음
  const availableClasses = [
    { code: 'CLASS001', name: '3학년 1반 수학' },
    { code: 'CLASS002', name: '3학년 1반 영어' },
    { code: 'CLASS003', name: '토요일 특별반' },
  ];

  const handleClassSelect = (classCode: string) => {
    // 실제로는 API 호출하여 선택된 반 정보 저장
    console.log('Selected class:', classCode);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-gray-300">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-600 text-xl">{user.realName.charAt(0)}</span>
          </div>
          <CardTitle className="text-black">안녕하세요, {user.realName}님!</CardTitle>
          <p className="text-gray-600">참여할 반을 선택해주세요</p>
        </CardHeader>

        <CardContent className="space-y-3">
          {availableClasses.map((cls) => (
            <Button
              key={cls.code}
              onClick={() => handleClassSelect(cls.code)}
              className="w-full p-4 h-auto bg-white text-black border-2 border-gray-300 hover:bg-gray-100"
            >
              <div className="text-center">
                <p className="font-medium">{cls.name}</p>
                <p className="text-sm text-gray-600">{cls.code}</p>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}