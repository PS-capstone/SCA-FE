import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { CheckCircle, X, Image as ImageIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function QuestApprovalPageNew() {
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [customComment, setCustomComment] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const pendingQuests = [
    {
      id: 1,
      student: "김학생",
      target: "중등 1반",
      title: "rpm 100문제 풀기",
      group: "숙제",
      deadline: "2025.10.05 23:59",
      coral: 2,
      research_data: 50,
      hasAttachment: true,
      submittedAt: "2025.10.04 14:30",
      studentComment: "RPM 100문제를 모두 풀었습니다. 처음에는 어려웠지만 차근차근 풀어가니 실력이 늘어나는 것 같습니다. 특히 곱셈과 나눗셈 부분에서 많이 향상되었어요!"
    },
    {
      id: 2,
      student: "이학생",
      target: "중등 1반",
      title: "수학 모의고사 80점 이상",
      group: "시험",
      deadline: "2025.10.10 00:00",
      coral: 5,
      research_data: 100,
      hasAttachment: false,
      submittedAt: "2025.10.04 13:15",
      studentComment: "모의고사에서 85점을 받았습니다. 기하 부분에서 실수가 있었지만 대수 부분은 잘 풀었습니다. 다음에는 더 신중하게 풀어보겠습니다."
    },
  ];

  const presetComments = [
    "잘했어요! 계속 이렇게 해주세요.",
    "수고했어요! 다음에도 기대할게요.",
    "훌륭합니다! 완벽하게 완료했네요.",
    "노력이 보여요. 조금만 더 신경쓰면 좋겠어요.",
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <h1>퀘스트 승인</h1>
          <p className="text-gray-600 mt-1">승인 대기 중: {pendingQuests.length}건</p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="space-y-4 max-w-4xl">
            {pendingQuests.map((quest) => (
              <Card key={quest.id} className="border-2 border-gray-300 rounded-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4>{quest.student}</h4>
                        <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                          {quest.target}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{quest.title}</p>
                    </div>
                    <Badge className="bg-gray-200 text-black border-2 border-gray-300 rounded-lg">
                      {quest.group}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="border-2 border-gray-300 p-2">
                      <span className="text-gray-600">제출 시간</span>
                      <p className="mt-1">{quest.submittedAt}</p>
                    </div>
                    <div className="border-2 border-gray-300 p-2">
                      <span className="text-gray-600">마감 시간</span>
                      <p className="mt-1">{quest.deadline}</p>
                    </div>
                  </div>

                  {quest.hasAttachment && (
                    <div className="border-2 border-gray-300 p-3 mb-4 flex items-center gap-2">
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

                  <div className="flex items-center justify-between border-t-2 border-gray-300 pt-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600">보상:</span>
                      <span>코랄 {quest.coral}</span>
                      <span>탐사데이터 {quest.research_data}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                        onClick={() => setSelectedQuest(quest)}
                      >
                        상세보기
                      </Button>
                      <Button
                        className="bg-black text-white hover:bg-gray-800 rounded-lg"
                        onClick={() => {
                          setShowApprovalModal(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        승인
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                      {selectedQuest.student} - {selectedQuest.target}
                    </p>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">퀘스트 그룹</span>
                      <p>{selectedQuest.group}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">제출 시간</span>
                      <p>{selectedQuest.submittedAt}</p>
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
                  <Select>
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
                  onClick={() => setSelectedQuest(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  반려
                </Button>
                <Button 
                  className="flex-1 bg-black text-white hover:bg-gray-800 rounded-lg"
                  onClick={() => setSelectedQuest(null)}
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
    </div>
  );
}