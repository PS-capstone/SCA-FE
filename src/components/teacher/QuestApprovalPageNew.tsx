import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { CheckCircle, X, Image as ImageIcon, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "../../contexts/AppContext";

interface Assignment {
  assignment_id: number;
  quest_id: number;
  title: string;
  student_id: number;
  student_name: string;
  class_name: string;
  submitted_at: string;
  reward_coral_personal: number;
  reward_research_data_personal: number;
  status: "SUBMITTED";

  studentComment: string;
  hasAttachment: boolean;
}

function formatDateTime(isoString: string) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

export function QuestApprovalPageNew() {
  const { isAuthenticated, userType } = useAuth();
  const [pendingQuests, setPendingQuests] = useState<Assignment[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Assignment | null>(null);
  const [customComment, setCustomComment] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedQuestId, setExpandedQuestId] = useState<number | null>(null);

  const presetComments = [
    "잘했어요! 계속 이렇게 해주세요.",
    "수고했어요! 다음에도 기대할게요.",
    "훌륭합니다! 완벽하게 완료했네요.",
    "노력이 보여요. 조금만 더 신경쓰면 좋겠어요.",
  ];

  useEffect(() => {
    if (!isAuthenticated || userType !== 'teacher') {
      setIsLoading(false);
      setError("접근 권한이 없습니다.");
      return;
    }

    const fetchPendingQuests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/quests/personal/pending', {
          headers: {
            // 'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('승인 대기 목록을 불러오는 데 실패했습니다.');
        }
        const data = await response.json();

        // [수정] API 명세에 없는 'studentComment', 'hasAttachment'를 임시로 추가합니다.
        // [참고] 실제로는 '/api/quests/personal/pending' API가 이 정보를 줘야 합니다.
        const questsWithMockDetails = (data.data.assignments || []).map((q: Assignment) => ({
          ...q,
          studentComment: q.title === "RPM 100 문제 풀기"
            ? "RPM 100문제를 모두 풀었습니다. 처음에는 어려웠지만..."
            : "모의고사에서 85점을 받았습니다. 기하 부분에서...",
          hasAttachment: q.title === "RPM 100 문제 풀기"
        }));

        setPendingQuests(questsWithMockDetails);
      } catch (err) {
        const message = (err instanceof Error) ? err.message : "알 수 없는 에러 발생";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingQuests();
  }, [isAuthenticated, userType]);

  const handleApproveOrReject = async (action: 'approve' | 'reject') => {
    if (!selectedQuest) return;

    setIsSubmitting(true);
    const endpoint = `/api/quests/personal/{assignmentId}/${action}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacher_comment: customComment || (action === 'approve' ? "잘했어요!" : "다시 확인해주세요.")
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `${action} 처리에 실패했습니다.`);
      }

      // API 호출 성공 시
      if (action === 'approve') {
        setShowApprovalModal(true);
      } else {
        alert("퀘스트가 반려되었습니다.");
      }

      setSelectedQuest(null);
      setCustomComment("");
      setPendingQuests(prev => prev.filter(q => q.assignment_id !== selectedQuest.assignment_id));

    } catch (error) {
      alert((error instanceof Error) ? error.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">승인 대기 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">오류: {error}</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
        <h1>퀘스트 승인</h1>
        <p className="text-gray-600 mt-1">승인 대기 중: {pendingQuests.length}건</p>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="space-y-4 max-w-4xl">
          {pendingQuests.map((quest) => {
            const isExpanded = expandedQuestId === quest.assignment_id;
            const toggleExpansion = () => {
              if (isExpanded) {
                setExpandedQuestId(null);
              } else {
                setExpandedQuestId(quest.assignment_id);
              }
            };

            return (
              <Card key={quest.assignment_id} className="border-2 border-gray-300 rounded-lg">
                <CardContent className="p-4">
                  <div
                    className="cursor-pointer"
                    onClick={toggleExpansion}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4>{quest.student_name}</h4>
                          <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                            {quest.class_name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{quest.title}</p>
                      </div>
                      <Badge className="bg-gray-200 text-black border-2 border-gray-300 rounded-lg">
                        {quest.title}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">제출:</span> {formatDateTime(quest.submitted_at)}
                    </div>
                    <div className="flex justify-center mt-2">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="border-2 border-gray-300 p-2">
                          <span className="text-gray-600">마감 시간</span>
                          <p className="mt-1">{"N/A"}</p>
                        </div>
                      </div>
                      {quest.hasAttachment && (
                        <div className="border-2 border-gray-300 p-3 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-sm">첨부 파일 있음</span>
                          <Button
                            variant="link"
                            className="ml-auto text-black underline"
                          >
                            보기
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">보상:</span>
                          <span>코랄 {quest.reward_coral_personal}</span>
                          <span>탐사데이터 {quest.reward_research_data_personal}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                            onClick={() => setSelectedQuest(quest)}
                          >
                            상세보기/승인
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quest Detail Dialog */}
      <Dialog open={selectedQuest !== null} onOpenChange={() => setSelectedQuest(null)}>
        <DialogContent className="border-2 border-gray-300 rounded-lg max-w-2xl">
          <DialogHeader>
            <DialogTitle>퀘스트 승인</DialogTitle>
          </DialogHeader>

          {selectedQuest && (
            <div className="space-y-4">
              {/* Quest Info */}
              <Card className="border-2 border-gray-300 rounded-lg">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4>{selectedQuest.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedQuest.student_name} - {selectedQuest.class_name}
                    </p>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">퀘스트 그룹</span>
                      <p>{selectedQuest.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">제출 시간</span>
                      <p>{formatDateTime(selectedQuest.submitted_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Comment */}
              <Card className="border-2 border-gray-300 rounded-lg">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-2">학생 수행내용</p>
                  <div className="border-2 border-gray-300 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-black">{selectedQuest.studentComment}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Attachment */}
              {selectedQuest.hasAttachment && (
                <Card className="border-2 border-gray-300 rounded-lg">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-2">첨부 파일</p>
                    <div className="border-2 border-gray-300 p-8 text-center">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">증거 이미지</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comment Section */}
              <div className="space-y-3">
                <h4>선생님 코멘트</h4>

                <div className="space-y-2">
                  <label className="text-sm">기본 코멘트 선택</label>
                  <Select onValueChange={(value: string) => setCustomComment(value)}>
                    <SelectTrigger className="border-2 border-gray-300 rounded-lg">
                      <SelectValue placeholder="기본 코멘트를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-300 rounded-lg">
                      {presetComments.map((comment, idx) => (
                        <SelectItem key={idx} value={comment}>
                          {comment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">또는 직접 작성</label>
                  <Textarea
                    placeholder="학생에게 전달할 피드백을 작성하세요"
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    className="border-2 border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-300">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                  onClick={() => handleApproveOrReject('reject')}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  {isSubmitting ? "처리 중..." : "반려"}
                </Button>
                <Button
                  className="flex-1 bg-black text-white hover:bg-gray-800 rounded-lg"
                  onClick={() => handleApproveOrReject('approve')}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  승인 및 보상 지급
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Success Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="border-2 border-gray-300 rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">완료되었습니다</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-black" />
            <p className="text-lg">퀘스트가 승인되었습니다.</p>
            <p className="text-sm text-gray-600 mt-2">보상이 학생에게 지급되었습니다.</p>
          </div>
          <div className="flex justify-center pt-4">
            <Button
              className="bg-black text-white hover:bg-gray-800 rounded-lg px-8"
              onClick={() => setShowApprovalModal(false)}
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}