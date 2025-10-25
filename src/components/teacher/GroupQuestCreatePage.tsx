import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ArrowLeft, Users, Plus, Calendar, Clock, Target } from "lucide-react";
import { TeacherSidebar } from "./TeacherSidebar";
import { Switch } from "../ui/switch";

interface GroupQuestCreatePageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function GroupQuestCreatePage({ onNavigate, onLogout }: GroupQuestCreatePageProps) {
  const [questData, setQuestData] = useState({
    title: "",
    description: "",
    reward: "",
    deadline: "",
    category: "출석",
    template: "출석 체크"
  });

  const [useTemplate, setUseTemplate] = useState(true);

  // 단체 퀘스트 템플릿
  const templates = [
    { id: "attendance", name: "출석 체크", description: "수업 출석 확인" },
    { id: "homework", name: "과제 제출", description: "숙제 제출 확인" },
    { id: "participation", name: "수업 참여", description: "적극적인 수업 참여" },
    { id: "exam", name: "학교 시험 점수", description: "학교 시험 점수 입력" },
    { id: "other", name: "기타", description: "기타 퀘스트" },
  ];

  const handleTemplateSelect = (template: any) => {
    setQuestData({
      ...questData,
      template: template.name,
      title: template.name,
      description: template.description
    });
  };

  const handleSubmit = () => {
    if (!questData.title) {
      alert("퀘스트 제목을 입력해주세요.");
      return;
    }
    
    alert(`단체 퀘스트가 등록되었습니다!\n제목: ${questData.title}\n대상: 반 전체 학생`);
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
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-black">단체 퀘스트 등록</h1>
              <p className="text-gray-600 mt-1">반 전체 학생에게 할당할 공통 퀘스트를 등록합니다</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-4xl">
          <div className="space-y-6">
            {/* 템플릿 선택 */}
            <Card className="border-2 border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Target className="w-5 h-5" />
                  퀘스트 템플릿
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        questData.template === template.name
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <h3 className="font-medium text-black">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 퀘스트 기본 정보 */}
            <Card className="border-2 border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Users className="w-5 h-5" />
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
                      placeholder="예: 산호 30개"
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

            {/* 대상 정보 */}
            <Card className="border-2 border-gray-300 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Users className="w-5 h-5" />
                  <h3 className="font-medium">대상: 반 전체 학생</h3>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  이 퀘스트는 반의 모든 학생에게 자동으로 할당됩니다.
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
                단체 퀘스트 등록
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
