import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Users, Target, Loader2, ClipboardList, Gift, Plus, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
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
  const [showRewardGuide, setShowRewardGuide] = useState(false);

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
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">단체 퀘스트 등록</h1>
          <p className="text-sm text-gray-500 mt-1">
            {classInfo?.class_name} 학생 전원이 참여하는 협동 퀘스트를 생성합니다.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 1. 템플릿 선택 */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="w-5 h-5 text-gray-500" />
                템플릿 선택
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.code}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${questData.template === template.code
                      ? 'border-green-600 bg-green-50/30 ring-1 ring-green-600'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <h4 className="text-base font-bold text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{template.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 2. 상세 정보 */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-gray-500" />
                퀘스트 상세 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">퀘스트 제목 <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={questData.title}
                  onChange={(e) => setQuestData({ ...questData, title: e.target.value })}
                  className="h-11 bg-white"
                  placeholder="퀘스트 제목을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">퀘스트 설명</Label>
                <Textarea
                  id="content"
                  value={questData.content}
                  onChange={(e) => setQuestData({ ...questData, content: e.target.value })}
                  className="min-h-[100px] bg-white resize-none text-sm leading-relaxed"
                  placeholder="퀘스트에 대한 자세한 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">마감일 <span className="text-red-500">*</span></Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={questData.deadline}
                    onChange={(e) => setQuestData({ ...questData, deadline: e.target.value })}
                    className="h-11 bg-white"
                  />
                </div>
                {/* 대상 정보 표시 (Read-only) */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-500">참여 대상</Label>
                  <div className="h-11 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    {classInfo?.class_name} 전체 학생 ({questData.total_count}명)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. 보상 및 조건 */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="w-5 h-5 text-gray-500" />
                보상 및 완료 조건
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => setShowRewardGuide(true)}
              >
                <Info className="w-3.5 h-3.5 mr-1.5" />
                보상 가이드
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">보상: 코랄</Label>
                  <Input
                    type="number"
                    className="h-11 bg-white"
                    placeholder="예: 30"
                    value={questData.reward_coral}
                    onChange={(e) => setQuestData({ ...questData, reward_coral: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">보상: 탐사데이터</Label>
                  <Input
                    type="number"
                    className="h-11 bg-white"
                    placeholder="예: 20"
                    value={questData.reward_research_data}
                    onChange={(e) => setQuestData({ ...questData, reward_research_data: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-bold text-gray-900">완료 조건 설정</Label>
                  <span className="text-sm text-gray-500">전체 {questData.total_count}명 중</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      className="h-11 bg-white text-lg font-bold text-blue-600"
                      value={questData.required_count}
                      max={questData.total_count}
                      onChange={(e) => setQuestData({ ...questData, required_count: Number(e.target.value) })}
                    />
                  </div>
                  <span className="text-gray-900 font-medium">명이 완료하면 퀘스트 성공</span>
                </div>

                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  * 예상 달성률: {questData.total_count > 0 ? Math.round((questData.required_count / questData.total_count) * 100) : 0}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              size="lg"
              className="px-8 border-gray-300"
              onClick={() => navigate('/teacher/quest')}
            >
              취소
            </Button>
            <Button
              size="lg"
              className="px-8 bg-black hover:bg-gray-800 text-white font-bold"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  단체 퀘스트 등록
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      {/* 보상 가이드 모달 */}
          <Dialog open={showRewardGuide} onOpenChange={setShowRewardGuide}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>보상 가이드</DialogTitle>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">템플릿</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">난이도</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">기본 코랄</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">기본 탐사데이터</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">출석 체크</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">쉬움</span></td>
                      <td className="px-4 py-3">20</td>
                      <td className="px-4 py-3">50</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">과제 제출</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">쉬움</span></td>
                      <td className="px-4 py-3">25</td>
                      <td className="px-4 py-3">50</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">수업 참여</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">보통</span></td>
                      <td className="px-4 py-3">30</td>
                      <td className="px-4 py-3">100</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">학교 시험 점수 달성</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">어려움</span></td>
                      <td className="px-4 py-3">45</td>
                      <td className="px-4 py-3">400</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">기타</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">커스텀</span></td>
                      <td className="px-4 py-3">자유 설정</td>
                      <td className="px-4 py-3">자유 설정</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowRewardGuide(false)} className="bg-black text-white hover:bg-gray-800">확인</Button>
              </div>
            </DialogContent>
          </Dialog>
    </div>
  );
}
