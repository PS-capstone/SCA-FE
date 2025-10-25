import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ArrowLeft, User, Plus, X, Info, Sparkles } from "lucide-react";
import { TeacherSidebar } from "./TeacherSidebar";
import { Switch } from "../ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface IndividualQuestCreatePageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function IndividualQuestCreatePage({ onNavigate, onLogout }: IndividualQuestCreatePageProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showRewardGuide, setShowRewardGuide] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [questData, setQuestData] = useState({
    title: "",
    description: "",
    reward: "",
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
    onNavigate('teacher-dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex">
      <TeacherSidebar currentPage="quest-create-new" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              onClick={() => onNavigate('quest-create-new')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
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
                    onChange={(e) => setQuestData({...questData, title: e.target.value})}
                    placeholder="퀘스트 제목을 입력하세요"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-black font-medium">퀘스트 설명</Label>
                  <Textarea
                    id="description"
                    value={questData.description}
                    onChange={(e) => setQuestData({...questData, description: e.target.value})}
                    placeholder="퀘스트에 대한 자세한 설명을 입력하세요"
                    className="border-2 border-gray-300 rounded-lg min-h-20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reward" className="text-black font-medium">보상</Label>
                    <Input
                      id="reward"
                      value={questData.reward}
                      onChange={(e) => setQuestData({...questData, reward: e.target.value})}
                      placeholder="예: 산호 50개"
                      className="border-2 border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-black font-medium">마감일</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={questData.deadline}
                      onChange={(e) => setQuestData({...questData, deadline: e.target.value})}
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
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedStudents.includes(student.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => toggleStudent(student.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 ${
                          selectedStudents.includes(student.id)
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

            {/* 자동 승인 설정 */}
            <Card className="border-2 border-gray-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-black">자동 승인</h3>
                    <p className="text-sm text-gray-600">학생이 퀘스트를 완료하면 자동으로 승인됩니다</p>
                  </div>
                  <Switch
                    checked={autoApprove}
                    onCheckedChange={setAutoApprove}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 액션 버튼들 */}
            <div className="flex gap-3">
              <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                개인 퀘스트 등록
              </Button>
              <Button 
                variant="outline"
                onClick={() => onNavigate('quest-create-new')}
                className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
