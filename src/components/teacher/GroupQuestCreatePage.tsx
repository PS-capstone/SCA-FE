import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Users, Plus, Target, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AppContext";
import { get, post } from "../../utils/api";

interface QuestTemplate {
  code: string;
  name: string;
  description: string;
}

interface ClassInfoResponse {
  class_id: number;
  class_name: string;
  total_students: number;
  templates: QuestTemplate[];
}

export function GroupQuestCreatePage() {
  const navigate = useNavigate();
  const { currentClassId, access_token } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classInfo, setClassInfo] = useState<ClassInfoResponse | null>(null);
  const [templates, setTemplates] = useState<QuestTemplate[]>([]);

  const [questData, setQuestData] = useState({
    title: "",
    content: "",
    reward_coral: "",
    reward_research_data: "",
    deadline: "",
    template: "",
    required_count: 0,
    total_count: 0
  });

  useEffect(() => {
    if (!currentClassId || !access_token) return;

    const fetchClassInfo = async () => {
      setIsLoading(true);
      try {
        const response = await get(`/api/v1/quests/group/class-info?class_id=${currentClassId}`);
        if (!response.ok) throw new Error("클래스 정보를 불러오는데 실패했습니다.");

        const json = await response.json();
        if (json.success) {
          const data = json.data;
          setClassInfo(data);
          setTemplates(data.templates);
          // 초기값 설정
          setQuestData(prev => ({
            ...prev,
            total_count: data.total_students,
            required_count: data.total_students // 기본값은 전원
          }));
        }
      } catch (error) {
        console.error("Error fetching class info:", error);
        alert("정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassInfo();
  }, [currentClassId, access_token]);

  const handleTemplateSelect = (template: QuestTemplate) => {
    setQuestData({
      ...questData,
      template: template.code,
      title: template.name,
      content: template.description
    });
  };

  const handleSubmit = async () => {
    if (!questData.title || !questData.template || !questData.deadline) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    if (Number(questData.required_count) > Number(questData.total_count)) {
      alert("완료 필요 학생 수는 전체 학생 수보다 많을 수 없습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        class_id: Number(currentClassId),
        template: questData.template,
        title: questData.title,
        content: questData.content,
        reward_coral: Number(questData.reward_coral),
        reward_research_data: Number(questData.reward_research_data),
        deadline: questData.deadline,
        required_count: Number(questData.required_count),
        total_count: Number(questData.total_count)
      };

      const response = await post('/api/v1/quests/group', payload);
      const json = await response.json();

      if (response.ok && json.success) {
        alert("단체 퀘스트가 생성되었습니다.");
        navigate('/teacher/quest/group/manage');
      } else {
        throw new Error(json.message || "생성 실패");
      }
    } catch (error) {
      console.error("Error creating quest:", error);
      alert("퀘스트 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black">단체 퀘스트 등록</h1>
            <p className="text-gray-600 mt-1">
              {classInfo?.class_name} ({classInfo?.total_students}명) 학생들에게 할당할 퀘스트를 등록합니다.
            </p>
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
                퀘스트 템플릿 선택
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.code}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${questData.template === template.name
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
                상세 정보 입력
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
                  id="content"
                  value={questData.content}
                  onChange={(e) => setQuestData({ ...questData, content: e.target.value })}
                  placeholder="퀘스트에 대한 자세한 설명을 입력하세요"
                  className="border-2 border-gray-300 rounded-lg min-h-20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reward_coral" className="text-black font-medium">보상: 코랄</Label>
                  <Input
                    id="reward_coral"
                    value={questData.reward_coral}
                    onChange={(e) => setQuestData({ ...questData, reward_coral: e.target.value })}
                    placeholder="예: 30"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward_research" className="text-black font-medium">보상: 탐사데이터</Label>
                  <Input
                    id="reward_research_data"
                    type="number"
                    value={questData.reward_research_data}
                    onChange={(e) => setQuestData({ ...questData, reward_research_data: e.target.value })}
                    placeholder="예: 20"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-black font-medium">마감일 *</Label>
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

          {/* 완료 조건 설정 */}
          <Card className="border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <Target className="w-5 h-5" />
                완료 조건 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  전체 {questData.total_count}명 중 몇 명이 완료해야 퀘스트를 성공으로 처리할지 설정하세요.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalStudents" className="text-black font-medium">전체 학생 수</Label>
                    <Input
                      id="totalStudents"
                      type="number"
                      value={questData.total_count}
                      disabled
                      className="border-2 border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiredStudents" className="text-black font-medium">필요 완료 학생 수</Label>
                    <Input
                      id="requiredStudents"
                      type="number"
                      value={questData.required_count}
                      onChange={(e) => setQuestData({ ...questData, required_count: parseInt(e.target.value) || 0 })}
                      min="1"
                      max={questData.total_count}
                      className="border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>조건:</strong> {questData.required_count}명 / {questData.total_count}명 달성 시 완료 가능 (달성률 {questData.total_count > 0 ? Math.round((questData.required_count / questData.total_count) * 100) : 0}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼들 */}
          <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
            <Button
              onClick={handleSubmit}
              className="bg-black hover:bg-gray-800 text-white rounded-lg border-2 border-gray-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              단체 퀘스트 등록
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/quest')}
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
            >
              취소
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
