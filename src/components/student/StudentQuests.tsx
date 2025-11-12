import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { useAuth, StudentUser } from "../../contexts/AppContext";

interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'in_progress' | 'submitted' | 'completed';
  dueDate: string;
  rewards: {
    coral: number;
    research_data: number;
  };
  progress?: number;
  teacherComment?: string;
  submittedAt?: string;
  template?: {
    workbookName: string;
    problemCount: number;
    difficulty: string;
  };
}

export function StudentQuests() {
  const { user, isAuthenticated, userType } = useAuth();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [submitText, setSubmitText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const allQuests: Quest[] = [
    {
      id: '1',
      title: 'RPM 100 문제 풀기',
      description: '수학 연산 속도를 높이기 위해 RPM 100문제를 풀어보세요.',
      status: 'in_progress',
      dueDate: '2025-06-15T23:59:59',
      rewards: { coral: 2, research_data: 50 },
      progress: 65,
      template: {
        workbookName: 'RPM 100',
        problemCount: 100,
        difficulty: '보통'
      }
    },
    {
      id: '2',
      title: '영단어 50개 외우기',
      description: '이번 주 영단어 50개를 외우고 테스트를 통과하세요.',
      status: 'in_progress',
      dueDate: '2025-06-20T23:59:59',
      rewards: { coral: 3, research_data: 40 },
      template: {
        workbookName: '영단어 프린트',
        problemCount: 50,
        difficulty: '쉬움'
      }
    },
    {
      id: '3',
      title: '과학 실험 보고서 작성하기',
      description: '지난 시간에 진행한 실험 결과를 정리하여 보고서를 작성하세요.',
      status: 'submitted',
      dueDate: '2025-06-18T23:59:59',
      rewards: { coral: 5, research_data: 80 },
      submittedAt: '2024-03-17T14:30:00'
    },
    {
      id: '4',
      title: '수학 모의고사 80점 이상',
      description: '수학 모의고사에서 80점 이상을 받으세요.',
      status: 'completed',
      dueDate: '2024-03-15T23:59:59',
      rewards: { coral: 5, research_data: 100 },
      submittedAt: '2024-03-15T16:20:00',
      teacherComment: '85점으로 목표를 달성했네요! 기하 부분에서 실수가 있었지만 대수 부분은 완벽하게 풀었습니다. 다음에는 더 신중하게 풀어보세요. 수고했어요!'
    },
    {
      id: '5',
      title: '국어 독해 문제 20개',
      description: '국어 독해 문제를 풀고 정답률을 확인하세요.',
      status: 'in_progress',
      dueDate: '2025-06-25T23:59:59',
      rewards: { coral: 3, research_data: 60 }
    },
    {
      id: '6',
      title: '사회 과제 제출',
      description: '사회 시간에 배운 내용을 정리하여 과제를 제출하세요.',
      status: 'in_progress',
      dueDate: '2025-06-22T23:59:59',
      rewards: { coral: 4, research_data: 70 }
    },
    {
      id: '7',
      title: '물리 실험 보고서',
      description: '물리 실험 결과를 분석하고 보고서를 작성하세요.',
      status: 'in_progress',
      dueDate: '2025-06-28T23:59:59',
      rewards: { coral: 6, research_data: 90 }
    },
    {
      id: '8',
      title: '영어 에세이 작성',
      description: '주제에 대한 영어 에세이를 500단어 이상 작성하세요.',
      status: 'in_progress',
      dueDate: '2025-06-30T23:59:59',
      rewards: { coral: 4, research_data: 75 }
    },
    {
      id: '9',
      title: '화학 문제집 풀기',
      description: '화학 문제집 3장을 완료하고 정답을 확인하세요.',
      status: 'in_progress',
      dueDate: '2025-07-01T23:59:59',
      rewards: { coral: 3, research_data: 55 }
    },
    {
      id: '10',
      title: '역사 발표 준비',
      description: '한국사 주제로 발표 자료를 준비하고 발표하세요.',
      status: 'in_progress',
      dueDate: '2025-07-05T23:59:59',
      rewards: { coral: 5, research_data: 85 }
    }
  ];

  // 메인 목록: 진행중 + 승인대기중 퀘스트들 (마감일 체크 없이)
  const quests = allQuests.filter(quest => {
    const isInProgress = quest.status === 'in_progress';
    const isSubmitted = quest.status === 'submitted';
    return isInProgress || isSubmitted;
  });

  // 완료된 퀘스트들 (승인완료)
  const completedQuests = allQuests.filter(quest => quest.status === 'completed');

  // 마감된 퀘스트들 (진행중이지만 마감된 것들)
  const expiredQuests = allQuests.filter(quest => {
    const now = new Date();
    const due = new Date(quest.dueDate);
    return quest.status === 'in_progress' && due.getTime() <= now.getTime();
  });

  const formatTimeLeft = (dueDate: string, status: Quest['status']) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();

    // 승인대기중인 퀘스트는 시간 표시 안함
    if (status === 'submitted') return '';

    // 마감일자 표시 (YYYY-MM-DD 형식)
    return due.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '쉬움': return 'bg-green-100 text-green-800 border-green-200';
      case '보통': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '어려움': return 'bg-orange-100 text-orange-800 border-orange-200';
      case '매우어려움': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status: Quest['status']) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-black">진행중</Badge>;
      case 'submitted':
        return <Badge className="bg-gray-600">제출됨</Badge>;
      case 'completed':
        return <Badge className="bg-gray-800">완료</Badge>;
    }
  };

  const getButtonText = (status: Quest['status']) => {
    switch (status) {
      case 'in_progress':
        return '제출';
      case 'submitted':
        return '승인대기중';
      case 'completed':
        return '코멘트 확인';
    }
  };

  const isButtonDisabled = (status: Quest['status']) => {
    return status === 'submitted';
  };

  const handleQuestAction = (quest: Quest) => {
    setSelectedQuest(quest);
    if (quest.status === 'in_progress') {
      setIsSubmitOpen(true);
    } else if (quest.status === 'completed') {
      setIsCommentOpen(true);
    } else {
      setIsDetailOpen(true);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!submitText.trim()) {
      alert('제출 내용을 입력해주세요.');
      return;
    }

    // 실제로는 API 호출로 제출 (파일 포함)
    const submitData = {
      questId: selectedQuest?.id,
      content: submitText,
      files: attachedFiles
    };

    console.log('Quest submitted:', submitData);
    alert('퀘스트가 제출되었습니다!');
    setIsSubmitOpen(false);
    setSubmitText('');
    setAttachedFiles([]);
  };

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로딩중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 대시보드입니다.</div>;
  }

  const currentUser = user as StudentUser;

  const totalEarned = {
    coral: currentUser.coral - currentUser.coral,
    research_data: currentUser.research_data
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
                        <span className="text-sm text-gray-600">
                          {formatTimeLeft(quest.dueDate, quest.status)}
                        </span>
                        {quest.template?.difficulty && (
                          <Badge className={getDifficultyColor(quest.template.difficulty)}>
                            {quest.template.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleQuestAction(quest)}
                      disabled={isButtonDisabled(quest.status)}
                      className={`px-3 py-1 text-sm ${isButtonDisabled(quest.status)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : quest.status === 'completed'
                            ? 'bg-gray-800 text-white hover:bg-gray-900'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      size="sm"
                    >
                      {getButtonText(quest.status)}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-black">코랄 {quest.rewards.coral}</span>
                    <span className="text-black">탐사데이터 {quest.rewards.research_data}</span>
                  </div>

                  {quest.template && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{quest.template.workbookName}</span>
                      {quest.template.problemCount > 0 && (
                        <span> • {quest.template.problemCount}문제</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 하단 버튼들 */}
      <div className="mt-4 flex justify-center space-x-4">
        <Button
          onClick={() => setIsExpiredModalOpen(true)}
          className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200"
        >
          마감지난 퀘스트들 ({expiredQuests.length})
        </Button>
        <Button
          onClick={() => setIsCompletedModalOpen(true)}
          className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200"
        >
          승인완료된 퀘스트들 ({completedQuests.length})
        </Button>
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
              <p className="text-xl font-medium text-black">{totalEarned.research_data}</p>
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
                코랄 {selectedQuest?.rewards.coral}, 탐사데이터 {selectedQuest?.rewards.research_data}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">마감:</span>
              <span className="text-black">{selectedQuest && formatTimeLeft(selectedQuest.dueDate, selectedQuest.status)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 승인완료된 퀘스트 모달 */}
      <Dialog open={isCompletedModalOpen} onOpenChange={setIsCompletedModalOpen}>
        <DialogContent className="bg-white border-2 border-gray-300 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">승인완료된 퀘스트들</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {completedQuests.map((quest) => (
              <Card key={quest.id} className="border-2 border-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-black line-clamp-1 mb-1">{quest.title}</h3>
                          <div className="flex items-center space-x-2 text-sm">
                            {getStatusBadge(quest.status)}
                            <span className="text-sm text-gray-600">
                              완료일: {quest.submittedAt ? new Date(quest.submittedAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedQuest(quest);
                            setIsCommentOpen(true);
                          }}
                          className="px-3 py-1 text-sm bg-gray-800 text-white hover:bg-gray-900"
                          size="sm"
                        >
                          코멘트 확인
                        </Button>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-black">코랄 {quest.rewards.coral}</span>
                        <span className="text-black">탐사데이터 {quest.rewards.research_data}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setIsCompletedModalOpen(false)}
              className="bg-black text-white hover:bg-gray-800"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 마감된 퀘스트 모달 */}
      <Dialog open={isExpiredModalOpen} onOpenChange={setIsExpiredModalOpen}>
        <DialogContent className="bg-white border-2 border-gray-300 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">마감지난 퀘스트들</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expiredQuests.map((quest) => (
              <div key={quest.id} className="p-3 border border-gray-300 rounded">
                <h3 className="font-medium text-black">{quest.title}</h3>
                <p className="text-sm text-gray-600">마감일: {new Date(quest.dueDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setIsExpiredModalOpen(false)}
              className="bg-black text-white hover:bg-gray-800"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 선생님 코멘트 모달 */}
      <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">선생님 코멘트</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-black mb-2">{selectedQuest?.title}</h3>
              <p className="text-sm text-gray-600">제출일: {selectedQuest?.submittedAt ? new Date(selectedQuest.submittedAt).toLocaleString() : ''}</p>
            </div>

            <div className="border-2 border-gray-300 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">선생님 피드백</h4>
              <p className="text-black leading-relaxed">{selectedQuest?.teacherComment}</p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => setIsCommentOpen(false)}
                className="bg-black text-white hover:bg-gray-800"
              >
                확인
              </Button>
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

            {/* 첨부파일 섹션 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">첨부파일</label>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200"
                >
                  파일 추가
                </Button>
              </div>

              {/* 첨부된 파일 목록 */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-300 rounded">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs font-bold">F</span>
                        </div>
                        <span className="text-sm text-black">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 p-1 h-6 w-6"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-black text-white"
              >
                제출하기
              </Button>
              <Button
                onClick={() => {
                  setIsSubmitOpen(false);
                  setSubmitText('');
                  setAttachedFiles([]);
                }}
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