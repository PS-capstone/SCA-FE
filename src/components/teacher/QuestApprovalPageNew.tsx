import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { CheckCircle, X, ChevronDown, Loader2, FileText, Download, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "../../contexts/AppContext";
import { get, post } from "../../utils/api";

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
}

interface DetailedAssignment {
  assignment_id: number;
  quest: {
    quest_id: number;
    title: string;
    teacher_content: string;
  };
  student: {
    student_id: number;
    student_name: string;
    class_name: string;
  };
  reward_coral_personal: number;
  reward_research_data_personal: number;
  status: "SUBMITTED";
  submission: {
    submission_id: number;
    student_content: string;
    attachment_url: string | null;
    submitted_at: string;
    comment: string | null;
  };
}

// 파일 타입 감지 및 UI 렌더링 헬퍼 함수
function getFileType(url: string): 'image' | 'pdf' | 'other' {
  if (!url) return 'other';
  const lowerUrl = url.toLowerCase();
  // 이미지 확장자 체크 (쿼리 파라미터나 해시 제거 후 체크)
  const urlWithoutQuery = lowerUrl.split('?')[0].split('#')[0];
  
  // 확장자로 파일 타입 판단
  if (urlWithoutQuery.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'image';
  if (urlWithoutQuery.match(/\.pdf$/i)) return 'pdf';
  
  // S3 경로로 파일 타입 추론 (이미지 업로드 서비스는 'images/' 폴더에 저장)
  if (lowerUrl.includes('/images/')) return 'image';
  if (lowerUrl.includes('/documents/') || lowerUrl.includes('/uploads/')) {
    // documents 폴더는 PDF일 가능성이 높지만, 확장자로 확인하는 것이 더 정확
    return 'other';
  }
  
  return 'other';
}

function getFileName(url: string): string {
  if (!url) return '파일';
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || '파일';
    return decodeURIComponent(fileName);
  } catch {
    const parts = url.split('/');
    return parts[parts.length - 1] || '파일';
  }
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
  const { isAuthenticated, userType, access_token, currentClassId } = useAuth();
  const [pendingQuests, setPendingQuests] = useState<Assignment[]>([]);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuestDetail, setSelectedQuestDetail] = useState<DetailedAssignment | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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


  const fetchPendingQuests = async () => {
    if (!isAuthenticated || userType !== 'teacher' || !access_token) return;

    setIsLoading(true);
    setError(null);

    let url = '/api/v1/quests/personal/pending';
    if (currentClassId) {
      url += `?class_id=${currentClassId}`;
    }

    try {
      const response = await get(url);
      if (!response.ok) {
        throw new Error('승인 대기 목록을 불러오는 데 실패했습니다.');
      }
      const data = await response.json();
      setPendingQuests(data.data.assignments || []);
    } catch (err) {
      const message = (err instanceof Error) ? err.message : "알 수 없는 에러 발생";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQuests();
  }, [isAuthenticated, userType, access_token, currentClassId]);

  const handleOpenDetailModal = async (assignmentId: number) => {
    setShowDetailModal(true);
    setIsModalLoading(true);
    setModalError(null);
    setSelectedQuestDetail(null);

    try {
      console.log('[퀘스트 상세] 조회 시작, assignmentId:', assignmentId);
      const response = await get(`/api/v1/quests/personal/${assignmentId}/detail`);
      console.log('[퀘스트 상세] 응답 상태:', response.status);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || '퀘스트 상세 정보를 불러오지 못했습니다.');
      }

      const data = await response.json();
      console.log('[퀘스트 상세] 전체 응답 데이터:', data);
      console.log('[퀘스트 상세] submission 데이터:', data.data?.submission);
      console.log('[퀘스트 상세] attachment_url:', data.data?.submission?.attachment_url);
      setSelectedQuestDetail(data.data);

    } catch (err) {
      const message = (err instanceof Error) ? err.message : "알 수 없는 에러 발생";
      setModalError(message);
    } finally {
      setIsModalLoading(false); // 수정: 로딩 상태 해제
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedQuestDetail(null);
    setCustomComment("");
    setModalError(null);
  };

  const handleApproveOrReject = async (action: 'approve' | 'reject') => {
    if (!selectedQuestDetail || !access_token) return;

    setIsSubmitting(true);
    const endpoint = `/api/v1/quests/personal/${selectedQuestDetail.assignment_id}/${action}`;

    try {
      const response = await post(endpoint, {
        comment: customComment || (action === 'approve' ? "잘했어요!" : "다시 확인해주세요.")
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || `${action} 처리에 실패했습니다.`);
      }

      // 먼저 상세 모달 닫기 및 목록 업데이트
      handleCloseDetailModal();
      setPendingQuests(prev => prev.filter(q => q.assignment_id !== selectedQuestDetail.assignment_id));

      // 상태 업데이트가 완료된 후 승인 성공 모달 표시
      if (action === 'approve') {
        // setTimeout을 사용하여 다음 이벤트 루프에서 실행
        setTimeout(() => {
          setShowApprovalModal(true);
        }, 100);
      } else {
        alert("퀘스트가 반려되었습니다.");
      }

    } catch (error) {
      alert((error instanceof Error) ? error.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        승인 대기 목록을 불러오는 중...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">오류: {error}</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">퀘스트 승인</h1>
            <p className="text-gray-600 mt-1">승인 대기 중: {pendingQuests.length}건</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchPendingQuests}
            className="border-2 border-gray-300"
          >
            새로고침
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="space-y-4 max-w-4xl">
          {pendingQuests.length === 0 && !isLoading && (
            <p className="text-gray-500 text-center py-10">승인 대기 중인 퀘스트가 없습니다.</p>
          )}

          {pendingQuests.map((quest) => {
            const isExpanded = expandedQuestId === quest.assignment_id;
            const toggleExpansion = () => {
              setExpandedQuestId(isExpanded ? null : quest.assignment_id);
            };

            return (
              <Card key={quest.assignment_id} className="border-2 border-gray-300 rounded-lg transition-all hover:border-gray-400">
                <CardContent className="p-4">
                  <div
                    className="cursor-pointer"
                    onClick={toggleExpansion}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{quest.student_name}</h4>
                          <Badge variant="outline" className="border-2 border-gray-300 rounded-lg bg-white">
                            {quest.class_name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{quest.title}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100">
                        승인 대기
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-gray-500">
                        제출: {formatDateTime(quest.submitted_at)}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="font-semibold text-gray-700">보상:</span>
                          <span className="text-blue-600 font-medium">코랄 {quest.reward_coral_personal}</span>
                          <span className="text-purple-600 font-medium">탐사데이터 {quest.reward_research_data_personal}</span>
                        </div>
                        <Button
                          className="bg-black text-white hover:bg-gray-800 rounded-lg"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            handleOpenDetailModal(quest.assignment_id);
                          }}
                        >
                          상세보기 및 승인
                        </Button>
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
      <Dialog open={showDetailModal} onOpenChange={(isOpen: boolean) => { if (!isOpen) handleCloseDetailModal(); }}>
        <DialogContent className="border-2 border-gray-300 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>퀘스트 승인</DialogTitle>
          </DialogHeader>

          {isModalLoading && (
            <div className="py-20 flex flex-col justify-center items-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>상세 내용을 불러오는 중...</p>
            </div>
          )}

          {modalError && (
            <div className="py-10 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
              오류: {modalError}
            </div>
          )}

          {selectedQuestDetail && !isModalLoading && (
            <div className="space-y-6">
              {/* Quest Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{selectedQuestDetail.quest.title}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedQuestDetail.student.student_name} ({selectedQuestDetail.student.class_name})
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {formatDateTime(selectedQuestDetail.submission.submitted_at)}
                  </div>
                </div>
                <div className="text-sm text-gray-700 border-t border-gray-200 pt-3 mt-2">
                  <span className="font-semibold block mb-1">퀘스트 내용:</span>
                  {selectedQuestDetail.quest.teacher_content || "내용 없음"}
                </div>
              </div>

              {/* Student Submission */}
              <div className="space-y-2">
                <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  학생 수행 결과
                </h5>

                <div className="border-2 border-gray-300 rounded-lg p-4 bg-white min-h-[100px]">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedQuestDetail.submission.student_content || "텍스트 내용 없음"}
                  </p>
                </div>

                {/* Attachment */}
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2 font-medium">첨부 파일</p>
                  {selectedQuestDetail.submission?.attachment_url ? (() => {
                    const fileUrl = selectedQuestDetail.submission.attachment_url!;
                    console.log('[퀘스트 승인] 첨부파일 URL:', fileUrl);
                    const fileType = getFileType(fileUrl);
                    console.log('[퀘스트 승인] 감지된 파일 타입:', fileType);
                    const fileName = getFileName(fileUrl);

                    if (fileType === 'image') {
                      return (
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:border-blue-300 hover:shadow-sm transition-all">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <div className="bg-gray-50 p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                              <img
                                src={fileUrl}
                                alt="첨부파일 미리보기"
                                className="max-w-full max-h-[400px] object-contain shadow-md rounded-lg"
                                crossOrigin="anonymous"
                                onLoad={() => {
                                  console.log('[퀘스트 승인] 이미지 로드 성공:', fileUrl);
                                }}
                                onError={(e) => {
                                  console.error('[퀘스트 승인] 이미지 로드 실패:', fileUrl, e);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="flex flex-col items-center gap-3 text-gray-500 py-8">
                                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                          </svg>
                                        </div>
                                        <p class="text-sm font-medium">이미지를 불러올 수 없습니다</p>
                                        <p class="text-xs text-gray-400 mt-1">URL: ${fileUrl.substring(0, 50)}...</p>
                                        <a href="${fileUrl}" target="_blank" class="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium">
                                          직접 열기 →
                                        </a>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                              <p className="mt-4 text-sm text-blue-600 font-medium flex items-center gap-2 hover:text-blue-700 transition-colors">
                                <ImageIcon className="w-4 h-4" />
                                새 창에서 이미지 열기
                              </p>
                            </div>
                          </a>
                        </div>
                      );
                    } else if (fileType === 'pdf') {
                      return (
                        <div className="border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50/50 hover:border-blue-300 hover:shadow-sm transition-all">
                          <div className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                                  <FileText className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate text-base">{fileName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">PDF 문서</p>
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    asChild
                                    variant="default"
                                    size="sm"
                                    className="flex-1 sm:flex-initial"
                                  >
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <FileText className="w-4 h-4" />
                                      새 창에서 열기
                                    </a>
                                  </Button>
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 sm:flex-initial border-gray-300"
                                  >
                                    <a
                                      href={fileUrl}
                                      download={fileName}
                                    >
                                      <Download className="w-4 h-4" />
                                      다운로드
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50/50 hover:border-blue-300 hover:shadow-sm transition-all">
                          <div className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-sm">
                                  <FileText className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate text-base">{fileName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">첨부 파일</p>
                                <div className="mt-3">
                                  <Button
                                    asChild
                                    variant="default"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                  >
                                    <a
                                      href={fileUrl}
                                      download={fileName}
                                    >
                                      <Download className="w-4 h-4" />
                                      다운로드
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })() : (
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 text-center min-h-[100px] flex items-center justify-center">
                      <p className="text-gray-500 text-sm">첨부파일이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Teacher Feedback Section */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                <h5 className="font-semibold text-blue-900">피드백 작성</h5>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-blue-700 mb-1 block">빠른 코멘트</label>
                    <Select onValueChange={(value: any) => setCustomComment(value)}>
                      <SelectTrigger className="bg-white border-blue-200">
                        <SelectValue placeholder="자주 쓰는 코멘트 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {presetComments.map((comment, idx) => (
                          <SelectItem key={idx} value={comment}>{comment}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-700 mb-1 block">직접 입력</label>
                    <Textarea
                      placeholder="학생에게 전달할 피드백을 입력하세요..."
                      value={customComment}
                      onChange={(e) => setCustomComment(e.target.value)}
                      className="bg-white border-blue-200 min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300"
                    onClick={() => handleApproveOrReject('reject')}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-2" />
                    {isSubmitting ? "처리 중..." : "반려하기"}
                  </Button>
                  <Button
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleApproveOrReject('approve')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {isSubmitting ? "처리 중..." : "승인 및 보상 지급"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Success Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="border-2 border-gray-300 rounded-lg max-w-sm">
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">승인 완료!</h3>
            <p className="text-sm text-gray-500 mt-2">
              퀘스트 승인이 완료되었습니다.<br />
              학생에게 보상이 지급되었습니다.
            </p>
            <Button
              className="mt-6 w-full bg-black text-white hover:bg-gray-800"
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