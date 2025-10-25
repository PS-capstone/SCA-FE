import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';

interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed';
  dueDate: string;
  rewards: {
    coral: number;
    explorationData: number;
  };
  progress?: number;
}

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

interface StudentQuestsProps {
  user: StudentUser;
}

export function StudentQuests({ user }: StudentQuestsProps) {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitText, setSubmitText] = useState('');
  const [timeLeft, setTimeLeft] = useState<{[key: string]: string}>({});
  
  const quests: Quest[] = [
    {
      id: '1',
      title: 'RPM 100 문제 풀기',
      description: '수학 연산 속도를 높이기 위해 RPM 100문제를 풀어보세요.',
      status: 'in_progress',
      dueDate: '2024-03-20T23:59:59',
      rewards: { coral: 2, explorationData: 50 },
      progress: 65
    },
    {
      id: '2',
      title: '영단어 50개 외우기',
      description: '이번 주 영단어 50개를 외우고 테스트를 통과하세요.',
      status: 'pending',
      dueDate: '2024-03-22T23:59:59',
      rewards: { coral: 3, explorationData: 40 }
    },
    {
      id: '3',
      title: '과학 실험 보고서 작성하기',
      description: '지난 시간에 진행한 실험 결과를 정리하여 보고서를 작성하세요.',
      status: 'submitted',
      dueDate: '2024-03-18T23:59:59',
      rewards: { coral: 5, explorationData: 80 }
    }
  ];

  // 실시간 마감 시간 계산
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const newTimeLeft: {[key: string]: string} = {};
      
      quests.forEach(quest => {
        const due = new Date(quest.dueDate);
        const diff = due.getTime() - now.getTime();
        
        if (diff <= 0) {
          newTimeLeft[quest.id] = "마감됨";
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            newTimeLeft[quest.id] = `${days}일 ${hours}시간 남음`;
          } else if (hours > 0) {
            newTimeLeft[quest.id] = `${hours}시간 ${minutes}분 남음`;
          } else {
            newTimeLeft[quest.id] = `${minutes}분 남음`;
          }
        }
      });
      
      setTimeLeft(newTimeLeft);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    if (diff < 0) return '마감됨';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `D-${days}`;
    if (hours >= 24) return `${Math.floor(hours / 24)}일`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  const getStatusBadge = (status: Quest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-gray-400">시작 전</Badge>;
      case 'in_progress':
        return <Badge className="bg-black">진행중</Badge>;
      case 'submitted':
        return <Badge className="bg-gray-600">제출됨</Badge>;
      case 'completed':
        return <Badge className="bg-gray-800">완료</Badge>;
    }
  };

  const handleQuestAction = (quest: Quest) => {
    setSelectedQuest(quest);
    if (quest.status === 'in_progress') {
      setIsSubmitOpen(true);
    } else {
      setIsDetailOpen(true);
    }
  };

  const handleSubmit = () => {
    if (!submitText.trim()) {
      alert('제출 내용을 입력해주세요.');
      return;
    }
    
    // 실제로는 API 호출
    console.log('Quest submitted:', { questId: selectedQuest?.id, content: submitText });
    alert('퀘스트가 제출되었습니다!');
    setIsSubmitOpen(false);
    setSubmitText('');
  };

  const totalEarned = {
    coral: user.totalCoral - user.currentCoral,
    explorationData: user.totalExplorationData
  };

  return (
    <div className="p-4 space-y-4 bg-white min-h-screen pb-20">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-medium text-black">오늘의 퀘스트</h1>
      </div>

      {/* 퀘스트 리스트 */}
      <div className="space-y-3">
        {quests.map((quest) => (
          <Card key={quest.id} className="border-2 border-gray-300">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  checked={quest.status === 'completed'}
                  disabled={quest.status !== 'in_progress'}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-black line-clamp-1 mb-1">{quest.title}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        {getStatusBadge(quest.status)}
                        <span className={`text-sm ${timeLeft[quest.id] === "마감됨" ? "text-red-600" : "text-gray-600"}`}>
                          {timeLeft[quest.id] || "로딩 중..."}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleQuestAction(quest)}
                      className="bg-gray-600 text-white hover:bg-gray-700 px-3 py-1 text-sm"
                      size="sm"
                    >
                      완료
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-black">코랄 {quest.rewards.coral}</span>
                    <span className="text-black">탐사데이터 {quest.rewards.explorationData}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 하단 획득 현황 */}
      <Card className="border-2 border-gray-300 mt-6">
        <CardHeader>
          <CardTitle className="text-black text-center">총 획득 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">획득한 코랄</p>
              <p className="text-xl font-medium text-black">{totalEarned.coral}</p>
            </div>
            <div className="p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">획득한 탐사데이터</p>
              <p className="text-xl font-medium text-black">{totalEarned.explorationData}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 세부정보 모달 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">{selectedQuest?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-black">{selectedQuest?.description}</p>
            <div className="flex justify-between">
              <span className="text-gray-600">보상:</span>
              <span className="text-black">
                코랄 {selectedQuest?.rewards.coral}, 탐사데이터 {selectedQuest?.rewards.explorationData}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">마감:</span>
              <span className="text-black">{selectedQuest && formatTimeLeft(selectedQuest.dueDate)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 제출 모달 */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">퀘스트 제출</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-black">{selectedQuest?.title}</p>
            <Textarea
              value={submitText}
              onChange={(e) => setSubmitText(e.target.value)}
              placeholder="수행 내용을 입력하세요..."
              className="border-gray-300 bg-white text-black"
              rows={4}
            />
            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-black text-white"
              >
                제출하기
              </Button>
              <Button 
                onClick={() => setIsSubmitOpen(false)}
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