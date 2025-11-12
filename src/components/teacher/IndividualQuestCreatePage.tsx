import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { User, Plus, X, Info, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Switch } from "../ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function IndividualQuestCreatePage() {
  const navigate = useNavigate();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showRewardGuide, setShowRewardGuide] = useState(false);
  const [showAIReward, setShowAIReward] = useState(false);
  const [questData, setQuestData] = useState({
    title: "",
    description: "",
    reward_coral: "",
    reward_research: "",
    deadline: "",
    category: "일반"
  });

  // 학생 목록 (실제로는 API에서 가져옴)
  const students = [
    { id: "1", name: "김학생", class: "중등 1반" },
    { id: "2", name: "이학생", class: "중등 1반" },
    { id: "3", name: "박학생", class: "중등 1반" },
    { id: "4", name: "최학생", class: "중등 1반" },
  ];

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = () => {
    if (!questData.title || selectedStudents.length === 0) {
      alert("퀘스트 제목과 대상 학생을 선택해주세요.");
      return;
    }

    alert(`개인 퀘스트가 등록되었습니다!\n대상: ${selectedStudents.length}명\n제목: ${questData.title}`);
    navigate('teacher-dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-black">개인 퀘스트 등록</h1>
              <p className="text-gray-600 mt-1">특정 학생에게 할당할 개별 퀘스트를 등록합니다</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-4xl">
          <div className="space-y-6">
            {/* 퀘스트 기본 정보 */}
            <Card className="border-2 border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <User className="w-5 h-5" />
                  퀘스트 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-black font-medium">퀘스트 제목 *</Label>
                  <Input
                    id="title"
                    value={questData.title}
                    onChange={(e) => setQuestData({ ...questData, title: e.target.value })}
                    placeholder="퀘스트 제목을 입력하세요"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-black font-medium">퀘스트 설명</Label>
                  <Textarea
                    id="description"
                    value={questData.description}
                    onChange={(e) => setQuestData({ ...questData, description: e.target.value })}
                    placeholder="퀘스트에 대한 자세한 설명을 입력하세요"
                    className="border-2 border-gray-300 rounded-lg min-h-20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                        onClick={() => setShowRewardGuide(true)}
                      >
                        보상 가이드
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                        onClick={() => setShowAIReward(true)}
                      >
                        AI 보상 추천받기
                      </Button>
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="reward_coral" className="text-black font-medium">보상: 코랄</Label>
                    <Input
                      id="reward_coral"
                      value={questData.reward_coral}
                      onChange={(e) => setQuestData({ ...questData, reward_coral: e.target.value })}
                      placeholder="50"
                      className="border-2 border-gray-300 rounded-lg"
                    />

                    <Label htmlFor="reward_research" className="text-black font-medium">보상: 탐사데이터</Label>
                    <Input
                      id="reward_research"
                      value={questData.reward_research}
                      onChange={(e) => setQuestData({ ...questData, reward_research: e.target.value })}
                      placeholder="30"
                      className="border-2 border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-black font-medium">마감일</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={questData.deadline}
                      onChange={(e) => setQuestData({ ...questData, deadline: e.target.value })}
                      className="border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 대상 학생 선택 */}
            <Card className="border-2 border-gray-300">
              <CardHeader>
                <CardTitle className="text-black">대상 학생 선택 *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${selectedStudents.includes(student.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                      onClick={() => toggleStudent(student.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 ${selectedStudents.includes(student.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                          }`}>
                          {selectedStudents.includes(student.id) && (
                            <div className="w-full h-full bg-white rounded-sm flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-black">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.class}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  선택된 학생: {selectedStudents.length}명
                </p>
              </CardContent>
            </Card>


            {/* 액션 버튼들 */}
            <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
              <Button
                onClick={handleSubmit}
                className="bg-black hover:bg-gray-800 text-white rounded-lg border-2 border-gray-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                개인 퀘스트 등록
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('quest-create-new')}
                className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 보상 가이드 모달 */}
      <Dialog open={showRewardGuide} onOpenChange={setShowRewardGuide}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">보상 가이드</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-black mb-2">기본 보상 기준</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 쉬운 퀘스트: 산호 10-20개</li>
                <li>• 보통 퀘스트: 산호 30-50개</li>
                <li>• 어려운 퀘스트: 산호 60-100개</li>
                <li>• 특별 퀘스트: 산호 100개 이상</li>
              </ul>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-black mb-2">추가 보상 아이템</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 탐사데이터: 5-20개</li>
              </ul>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowRewardGuide(false)}
                className="bg-black hover:bg-gray-800 text-white rounded-lg"
              >
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI 보상 추천 모달 */}
      <Dialog open={showAIReward} onOpenChange={setShowAIReward}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">AI 보상 추천받기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-black mb-2">기본 보상 기준</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 쉬운 퀘스트: 산호 10-20개</li>
                <li>• 보통 퀘스트: 산호 30-50개</li>
                <li>• 어려운 퀘스트: 산호 60-100개</li>
                <li>• 특별 퀘스트: 산호 100개 이상</li>
              </ul>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowAIReward(false)}
                className="bg-black hover:bg-gray-800 text-white rounded-lg"
              >
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
