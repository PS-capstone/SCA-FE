import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { useAuth, StudentUser } from "../../contexts/AppContext";
import { Loader2, Send, File as FileIcon, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { get, apiCall } from '../../utils/api';

interface MyPersonalQuest {
  assignment_id: number;
  quest_id: number;
  title: string;
  teacher_content: string;
  reward_coral_personal: number;
  reward_research_data_personal: number;
  status: "ASSIGNED" | "SUBMITTED" | "REJECTED" | "APPROVED" | "EXPIRED";
  created_at: string;
  submission?: {
    submitted_at?: string;
    comment?: string;
  };
}

const formatDateTime = (isoString: string | undefined) => {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return "날짜 오류";
  }
};

export function StudentQuests() {
  const { user, isAuthenticated, userType, access_token } = useAuth();

  const [activeQuests, setActiveQuests] = useState<MyPersonalQuest[]>([]);
  const [approvedQuests, setApprovedQuests] = useState<MyPersonalQuest[]>([]);
  const [expiredQuests, setExpiredQuests] = useState<MyPersonalQuest[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedQuest, setSelectedQuest] = useState<MyPersonalQuest | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  const [submitText, setSubmitText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API로부터 퀘스트 목록을 불러오는 함수
  const fetchAllQuests = async () => {
    if (!access_token) return;

    setIsLoading(true);
    setError(null);

    try {
      const [activeRes, approvedRes, expiredRes] = await Promise.all([
        get('/api/v1/quests/personal/my?status=ACTIVE'),
        get('/api/v1/quests/personal/my?status=APPROVED'),
        get('/api/v1/quests/personal/my?status=EXPIRED')
      ]);

      if (!activeRes.ok || !approvedRes.ok || !expiredRes.ok) {
        throw new Error('퀘스트 목록을 불러오는 데 실패했습니다.');
      }

      const activeData = await activeRes.json();
      const approvedData = await approvedRes.json();
      const expiredData = await expiredRes.json();

      setActiveQuests(activeData.data.quests || []);
      setApprovedQuests(approvedData.data.quests || []);
      setExpiredQuests(expiredData.data.quests || []);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userType === 'student' && access_token) {
      fetchAllQuests();
    } else if (!isAuthenticated) {
      setIsLoading(false);
      setError("로그인이 필요합니다.");
    }
  }, [isAuthenticated, userType, access_token]);

  const getStatusBadge = (status: MyPersonalQuest['status']) => {
    switch (status) {
      case 'ASSIGNED':
        return <Badge className="bg-blue-600 text-white">제출 필요</Badge>;
      case 'SUBMITTED':
        return <Badge className="bg-yellow-500 text-black">승인 대기중</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-600 text-white">반려됨 (재제출)</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-600 text-white">승인 완료</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-gray-500 text-white">만료됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getButtonText = (status: MyPersonalQuest['status']) => {
    switch (status) {
      case 'ASSIGNED':
        return '제출하기';
      case 'REJECTED':
        return '다시 제출';
      case 'SUBMITTED':
        return '승인대기중';
      case 'APPROVED':
        return '코멘트 확인';
      case 'EXPIRED':
        return '만료됨';
    }
  };

  const isButtonDisabled = (status: MyPersonalQuest['status']) => {
    return status === 'SUBMITTED' || status === 'EXPIRED';
  };

  const handleQuestAction = (quest: MyPersonalQuest) => {
    setSelectedQuest(quest);
    if (quest.status === 'ASSIGNED' || quest.status === 'REJECTED') {
      // 반려된 경우, 이전 제출 내용을 불러올 수 있으나,
      // API 명세에 재제출 시 이전 내용 로드 기능이 없으므로 새로 입력
      setSubmitText('');
      setAttachedFiles([]);
      setSubmitError(null);
      setIsSubmitOpen(true);
    } else if (quest.status === 'APPROVED') {
      setIsCommentOpen(true);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFiles([file]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedQuest || !access_token) return;
    if (!submitText.trim() && attachedFiles.length === 0) {
      setSubmitError('제출 내용이나 첨부파일 중 하나는 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('content', submitText);
    if (attachedFiles.length > 0) {
      formData.append('attachment', attachedFiles[0]);
    }

    const method = selectedQuest.status === 'REJECTED' ? 'PUT' : 'POST';
    const endpoint = `/api/v1/quests/personal/${selectedQuest.assignment_id}/submit`;

    try {
      // apiCall이 FormData를 자동으로 감지하여 적절한 Content-Type을 설정
      const response = await apiCall(endpoint, {
        method: method,
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || '제출에 실패했습니다.');
      }

      alert(data.message || '퀘스트가 제출되었습니다!');
      setIsSubmitOpen(false);
      setSubmitText('');
      setAttachedFiles([]);
      fetchAllQuests(); // 퀘스트 목록 새로고침

    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 대시보드입니다.</div>;
  }

  const currentUser = user as StudentUser;

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>퀘스트 목록을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">오류: {error}</div>;
  }

  return (
    <div className="p-4 space-y-4 bg-white min-h-screen pb-20">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-medium text-black">오늘의 퀘스트</h1>
      </div>

      {/* 퀘스트 리스트 */}
      <div className="space-y-3">
        {activeQuests.length === 0 && (
          <p className="text-center text-gray-500">진행 중인 퀘스트가 없습니다.</p>
        )}
        {activeQuests.map((quest) => (
          <Card key={quest.assignment_id} className="border-2 border-gray-300">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-black line-clamp-1 mb-1">{quest.title}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        {getStatusBadge(quest.status)}
                        <span className="text-sm text-gray-600">
                          {quest.status === 'SUBMITTED' ? `제출: ${formatDateTime(quest.submission?.submitted_at)}` : `생성: ${formatDateTime(quest.created_at)}`}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleQuestAction(quest)}
                      disabled={isButtonDisabled(quest.status)}
                      className={`px-3 py-1 text-sm ${isButtonDisabled(quest.status)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : quest.status === 'APPROVED'
                          ? 'bg-gray-800 text-white hover:bg-gray-900'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      size="sm"
                    >
                      {getButtonText(quest.status)}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-black font-semibold"><span className="text-blue-600">C</span> {quest.reward_coral_personal}</span>
                    <span className="text-black font-semibold"><span className="text-purple-600">R</span> {quest.reward_research_data_personal}</span>
                  </div>
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
          승인완료된 퀘스트들 ({approvedQuests.length})
        </Button>
      </div>

      {/* 하단 획득 현황 */}
      <Card className="border-2 border-gray-300 mt-6">
        <CardHeader>
          <CardTitle className="text-black text-center">현재 보유 재화</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">획득한 코랄</p>
              <p className="text-xl font-medium text-black">{currentUser.coral}</p>
            </div>
            <div className="p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">획득한 탐사데이터</p>
              <p className="text-xl font-medium text-black">{currentUser.research_data}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 승인완료된 퀘스트 모달 */}
      <Dialog open={isCompletedModalOpen} onOpenChange={setIsCompletedModalOpen}>
        <DialogContent className="bg-white border-2 border-gray-300 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">승인완료된 퀘스트들</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {approvedQuests.length === 0 && <p className="text-gray-500 text-center">승인 완료된 퀘스트가 없습니다.</p>}
            {approvedQuests.map((quest) => (
              <Card key={quest.assignment_id} className="border-2 border-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-black line-clamp-1 mb-1">{quest.title}</h3>
                          <div className="flex items-center space-x-2 text-sm">
                            {getStatusBadge(quest.status)}
                            <span className="text-sm text-gray-600">
                              완료일: {formatDateTime(quest.submission?.submitted_at)}
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
                        <span className="text-black font-semibold"><span className="text-blue-600">C</span> {quest.reward_coral_personal}</span>
                        <span className="text-black font-semibold"><span className="text-purple-600">R</span> {quest.reward_research_data_personal}</span>
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
            <DialogTitle className="text-black">마감지난 퀘스트</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expiredQuests.length === 0 && <p className="text-gray-500 text-center">마감 지난 퀘스트가 없습니다.</p>}
            {expiredQuests.map((quest) => (
              <div key={quest.assignment_id} className="p-3 border border-gray-300 rounded">
                <h3 className="font-medium text-black">{quest.title}</h3>
                <p className="text-sm text-gray-600">생성일: {formatDateTime(quest.created_at)}</p>
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
              <p className="text-sm text-gray-600">제출일: {formatDateTime(selectedQuest?.submission?.submitted_at)}</p>
            </div>

            <div className="border-2 border-gray-300 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">선생님 피드백</h4>
              <p className="text-black leading-relaxed whitespace-pre-wrap">
                {selectedQuest?.submission?.comment || "추가 코멘트가 없습니다."}
              </p>
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
      <Dialog open={isSubmitOpen} onOpenChange={(isOpen: Boolean) => { if (!isOpen) setIsSubmitOpen(false); }}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">퀘스트 제출</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <p className="font-semibold text-black">{selectedQuest?.title}</p>
            <p className="text-sm text-gray-600 border p-2 rounded-md bg-gray-50">
              {selectedQuest?.teacher_content}
            </p>

            {/* 반려된 경우, 반려 사유 표시 */}
            {selectedQuest?.status === 'REJECTED' && (
              <Alert variant="destructive">
                <AlertTitle>반려 사유</AlertTitle>
                <AlertDescription>
                  {selectedQuest.submission?.comment || "사유가 없습니다. 다시 제출해주세요."}
                </AlertDescription>
              </Alert>
            )}

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
                <label className="text-sm font-medium text-black">첨부파일 (10MB 이하)</label>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf, .jpg, .jpeg, .png, .doc, .docx"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200"
                >
                  파일 선택
                </Button>
              </div>

              {/* 첨부된 파일 목록 */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-300 rounded">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-black truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 p-1 h-6 w-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button
                type="submit"
                className="flex-1 bg-black text-white hover:bg-gray-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedQuest?.status === 'REJECTED' ? '다시 제출' : '제출하기')}
              </Button>
              <Button
                type="button"
                onClick={() => setIsSubmitOpen(false)}
                className="flex-1 bg-white text-black border border-gray-300 hover:bg-gray-50"
              >
                취소
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}