import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { User, Plus, X, Info, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAuth, StudentUser, TeacherUser } from "../../contexts/AppContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { get, post } from "../../utils/api";

interface AiRecommendation {
  student_id: number;
  student_name: string;
  recommended_coral: number;
  recommended_research_data: number;
  reason: string;
}

type FormErrors = {
  title?: string | null;
  teacher_content?: string | null;
  difficulty?: number | null;
  deadline?: string | null;
  reward_coral_default?: number | null;
  reward_research_data_default?: number | null;
  selectedStudents?: string | null;
  formGeneral?: string | null;
};

type EditFormState = {
  coral: string;
  research: string;
  memo: string;
};

export function IndividualQuestCreatePage() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, user, access_token, currentClassId, setCurrentClass } = useAuth();

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showDifficultyGuide, setShowDifficultyGuide] = useState(false);
  const [showAIReward, setShowAIReward] = useState(false);
  const [questData, setQuestData] = useState({
    title: "",
    teacher_content: "",
    reward_coral_default: "",
    reward_research_data_default: "",
    difficulty: 3,
    deadline: "",
    category: "일반"
  });

  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Map<string, AiRecommendation>>(new Map());
  const [personalRewards, setPersonalRewards] = useState<Map<string, { coral: number, research: number, memo?: string }>>(new Map());

  const [allStudents, setAllStudents] = useState<StudentUser[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [showAiStudentModal, setShowAiStudentModal] = useState(false);
  const [showAiStudentEditModal, setShowAiStudentEditModal] = useState(false);
  const [currentEditingStudentId, setCurrentEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ coral: "", research: "", memo: "" });

  const handleQuestDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setQuestData(prev => ({ ...prev, [id]: value }));
    if (formErrors[id as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [id as keyof FormErrors]: null }));
    }
  };

  const handleDifficultyChange = (value: string) => {
    setQuestData(prev => ({ ...prev, difficulty: Number(value) }));
  };

  useEffect(() => {
    // 권한 체크
    if (!isAuthenticated || userType !== 'teacher') {
      setIsLoadingStudents(false);
      setFetchError("접근 권한이 없습니다.");
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      setFetchError(null);

      try {
        let classIdToUse = currentClassId;

        // currentClassId가 없으면 Teacher 정보에서 첫 번째 반을 찾아 설정 시도
        if (!classIdToUse && user) {
          const teacherUser = user as TeacherUser;
          if (teacherUser.classes && teacherUser.classes.length > 0) {
            classIdToUse = teacherUser.classes[0];
            if (setCurrentClass) setCurrentClass(classIdToUse);
          }
        }

        if (!classIdToUse) {
          setFetchError("선택된 반이 없습니다. 반 관리 페이지에서 반을 선택해주세요.");
          setAllStudents([]);
          return;
        }

        // API 호출
        const response = await get(`/api/v1/classes/${classIdToUse}/students`, undefined);

        if (signal.aborted) return;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '학생 목록을 불러오지 못했습니다.');
        }

        const json = await response.json();
        const studentsData = json.data?.students || [];

        const mappedStudents: StudentUser[] = studentsData.map((s: any) => ({
          id: String(s.student_id || s.studentId || s.id),
          real_name: s.name || s.real_name || '이름 없음',
          nickname: s.nickname || '',
          email: s.email || '',
          coral: s.coral || 0,
          research_data: s.researchData || s.research_data || 0,
          username: s.username || '',
          invite_code: s.invite_code || ''
        }));

        setAllStudents(mappedStudents);

      } catch (err: any) {
        if (signal.aborted) return;
        console.error('학생 목록 Fetch Error:', err);
        setFetchError(err.message || "알 수 없는 에러 발생");
      } finally {
        if (!signal.aborted) {
          setIsLoadingStudents(false);
        }
      }
    };

    fetchStudents();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, userType, currentClassId, user?.id, (user as TeacherUser)?.classes?.length]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
    if (formErrors.selectedStudents) {
      setFormErrors(prev => ({ ...prev, selectedStudents: null }));
    }
    setAiRecommendations(new Map());
    setPersonalRewards(new Map());
    setAiModeEnabled(false);
  };

  const toggleSelectAll = () => {
    if (allStudents.length === 0) return;

    if (selectedStudents.length === allStudents.length) {
      // 모두 선택되어 있으면 모두 해제
      setSelectedStudents([]);
    } else {
      // 모두 선택
      setSelectedStudents(allStudents.map(s => s.id));
    }
    if (formErrors.selectedStudents) {
      setFormErrors(prev => ({ ...prev, selectedStudents: null }));
    }
    setAiRecommendations(new Map());
    setPersonalRewards(new Map());
    setAiModeEnabled(false);
  };

  const handleAiRecommend = async () => {
    if (selectedStudents.length === 0) {
      alert("AI 추천을 받으려면 대상 학생을 1명 이상 선택해야 합니다.");
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await post('/api/v1/quests/personal/ai-recommend', {
        quest_title: questData.title,
        quest_content: questData.teacher_content,
        difficulty: questData.difficulty || 3,
        student_ids: selectedStudents.map(Number)
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.message ?? 'AI 추천에 실패했습니다.');
      }

      const responseData = json.data;

      setQuestData(prev => ({
        ...prev,
        reward_coral_default: responseData.reward_coral_default?.toString() || prev.reward_coral_default,
        reward_research_data_default: responseData.reward_research_data_default?.toString() || prev.reward_research_data_default
      }));

      const recommendations: AiRecommendation[] = responseData.recommendations || [];
      const newAiRecsMap = new Map<string, AiRecommendation>();
      const newPersonalRewardsMap = new Map<string, { coral: number, research: number, memo?: string }>();

      recommendations.forEach((rec: AiRecommendation) => {
        const studentId = rec.student_id.toString();
        if (selectedStudents.includes(studentId)) {
          newAiRecsMap.set(studentId, rec);
          newPersonalRewardsMap.set(studentId, {
            coral: rec.recommended_coral,
            research: rec.recommended_research_data,
            memo: ""
          });
        }
      });
      setAiRecommendations(newAiRecsMap);
      setPersonalRewards(newPersonalRewardsMap);

      setShowAIReward(false);
      setShowAiStudentModal(true);
      setAiModeEnabled(true);

    } catch (error) {
      console.error("AI 보상 추천 실패:", error);
      alert((error instanceof Error) ? error.message : "AI 추천 중 오류 발생");
    } finally {
      setIsAiLoading(false);
    }

  };

  const handleOpenEditModal = (studentId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    const personalRec = personalRewards.get(studentId);

    setEditForm({
      coral: personalRec?.coral.toString() || "0",
      research: personalRec?.research.toString() || "0",
      memo: personalRec?.memo || ""
    });
    setCurrentEditingStudentId(studentId);
    setShowAiStudentEditModal(true);
  };

  const handleCancelEdit = () => {
    setShowAiStudentEditModal(false);
    setCurrentEditingStudentId(null);
    setEditForm({ coral: "", research: "", memo: "" });
  };

  const handleConfirmEdit = () => {
    if (!currentEditingStudentId) return;

    const newCoral = Number(editForm.coral) || 0;
    const newResearch = Number(editForm.research) || 0;

    setPersonalRewards(prev => {
      const newMap = new Map(prev);
      newMap.set(currentEditingStudentId, {
        coral: newCoral,
        research: newResearch,
        memo: editForm.memo
      });
      return newMap;
    });

    handleCancelEdit();
  };

  const handleConfirmAllAiRecs = () => {
    setShowAiStudentModal(false);
    alert("AI 추천 보상이 적용되었습니다!");
  };

  const handleCancelAllAiRecs = () => {
    setAiRecommendations(new Map());
    setPersonalRewards(new Map());
    setShowAiStudentModal(false);
    setAiModeEnabled(false);
  };

  const handleSubmit = async () => {
    const errors: FormErrors = {};
    if (!questData.title.trim()) errors.title = "퀘스트 제목을 입력해주세요.";
    if (!questData.teacher_content.trim()) errors.teacher_content = "퀘스트 설명을 입력해주세요.";
    if (selectedStudents.length === 0) errors.selectedStudents = "대상 학생을 1명 이상 선택해주세요.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!currentClassId) {
      setFormErrors({ formGeneral: "반 정보가 없습니다." });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const assignments = selectedStudents.map(studentId => {
        const assignment: any = {
          student_id: Number(studentId)
        };

        if (aiModeEnabled) {
          const personalRec = personalRewards.get(studentId);
          const aiRec = aiRecommendations.get(studentId);

          assignment.reward_coral_personal = personalRec?.coral ?? 0;
          assignment.reward_research_data_personal = personalRec?.research ?? 0;
          assignment.ai_reward_coral = aiRec?.recommended_coral || 0;
          assignment.ai_reward_research_data = aiRec?.recommended_research_data || 0;

        } else {
          assignment.reward_coral_personal = Number(questData.reward_coral_default) || 0;
          assignment.reward_research_data_personal = Number(questData.reward_research_data_default) || 0;
        }
        return assignment;
      });

      let formattedDeadline: string | null = null;
      if (questData.deadline) {
        formattedDeadline = questData.deadline.length === 16 ? questData.deadline + ":00" : questData.deadline;
      }

      const payload = {
        title: questData.title,
        teacher_content: questData.teacher_content,
        difficulty: questData.difficulty || 3,
        deadline: formattedDeadline,
        class_id: Number(currentClassId),
        ai_used: aiModeEnabled,
        reward_coral_default: Number(questData.reward_coral_default) || 0,
        reward_research_data_default: Number(questData.reward_research_data_default) || 0,
        assignments: assignments
      };

      console.log("퀘스트 등록 페이로드:", JSON.stringify(payload, null, 2));

      const response = await post('/api/v1/quests/personal', payload);
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.message ?? "퀘스트 등록에 실패했습니다.");
      }

      alert(json.message || `[SUCCESS] 개인 퀘스트가 등록되었습니다!`);
      navigate('/teacher/quest');

    } catch (err) {
      console.error("퀘스트 등록 실패:", err);
      const message = (err instanceof Error) ? err.message : "알 수 없는 에러 발생";
      setFormErrors(prev => ({
        ...prev,
        formGeneral: message
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 수정 모달용 데이터
  const currentEditStudent = currentEditingStudentId ? allStudents.find(s => s.id === currentEditingStudentId) : null;
  const currentEditAiRec = currentEditingStudentId ? aiRecommendations.get(currentEditingStudentId) : null;

  return (
    <>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">개인 퀘스트 등록</h1>
            <p className="text-gray-500 mt-1.5 text-sm">특정 학생에게 할당할 개별 퀘스트를 등록합니다</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* 퀘스트 기본 정보 */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-center">
              <div className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <User className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <span className="whitespace-nowrap">퀘스트 기본 정보</span>
              </div>
            </div>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                  퀘스트 제목 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={questData.title}
                  onChange={handleQuestDataChange}
                  placeholder="퀘스트 제목을 입력하세요"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {formErrors.title && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher_content" className="text-sm font-semibold text-gray-700">
                  퀘스트 설명 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="teacher_content"
                  value={questData.teacher_content}
                  onChange={handleQuestDataChange}
                  placeholder="퀘스트에 대한 자세한 설명을 입력하세요"
                  className="min-h-32 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
                {formErrors.teacher_content && <p className="text-sm text-red-600 mt-1">{formErrors.teacher_content}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-sm font-semibold text-gray-700">
                  난이도 <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Select
                    value={questData.difficulty.toString()}
                    onValueChange={handleDifficultyChange}
                  >
                    <SelectTrigger className="w-[300px] h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="난이도 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1점 (EASY/개념 확인)</SelectItem>
                      <SelectItem value="2">2점 (BASIC/유형 적용)</SelectItem>
                      <SelectItem value="3">3점 (MEDIUM/복합 응용)</SelectItem>
                      <SelectItem value="4">4점 (HARD/심화 분석)</SelectItem>
                      <SelectItem value="5">5점 (VERY_HARD/창의적 해결)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 h-11"
                    onClick={() => setShowDifficultyGuide(true)}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    난이도 가이드
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="students" className="text-sm font-semibold text-gray-700">
                    대상 학생 선택 <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    {!isLoadingStudents && !fetchError && allStudents.length > 0 && (
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {selectedStudents.length === allStudents.length ? '전체 해제' : '전체 선택'}
                      </button>
                    )}
                    <span className="text-sm text-gray-500">
                      {selectedStudents.length > 0 ? `${selectedStudents.length}명 선택됨` : '선택 안됨'}
                    </span>
                  </div>
                </div>

                {isLoadingStudents ? (
                  <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-3" />
                    <p className="text-gray-600">학생 목록을 불러오는 중...</p>
                  </div>
                ) : fetchError ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-red-600 text-sm font-medium">{fetchError}</p>
                  </div>
                ) : allStudents.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-500">등록된 학생이 없습니다.</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto px-4 py-3 space-y-2">
                      {allStudents.map((student) => {
                        const personalRec = personalRewards.get(student.id);
                        const aiRec = aiRecommendations.get(student.id);
                        const isSelected = selectedStudents.includes(student.id);

                        return (
                          <div
                            key={student.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 bg-white'
                              }`}
                            onClick={() => toggleStudent(student.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleStudent(student.id)}
                                onClick={(e: any) => e.stopPropagation()}
                                className="shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-gray-900">{student.real_name}</p>
                                  {isSelected && (
                                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                      선택됨
                                    </span>
                                  )}
                                </div>

                                {isSelected && aiModeEnabled && personalRec && (
                                  <div className="mt-2 p-2 bg-white border border-blue-200 rounded text-xs">
                                    <p className="font-bold text-blue-800">
                                      보상: C {personalRec.coral} / R {personalRec.research}
                                    </p>
                                    {aiRec?.reason && (
                                      <p className="text-gray-600 mt-1 truncate" title={aiRec.reason}>
                                        AI 사유: {aiRec.reason}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {formErrors.selectedStudents && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.selectedStudents}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-sm font-semibold text-gray-700">마감일</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={questData.deadline}
                    onChange={handleQuestDataChange}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50 h-11"
                    onClick={() => setShowAIReward(true)}
                    disabled={selectedStudents.length === 0}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI 보상 추천받기
                  </Button>
                </div>
              </div>

              {!aiModeEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <Label htmlFor="reward_coral_default" className="text-sm font-semibold text-gray-700">기본 코랄 보상</Label>
                    <Input
                      id="reward_coral_default"
                      type="number"
                      value={questData.reward_coral_default}
                      onChange={handleQuestDataChange}
                      placeholder="예: 50"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reward_research_data_default" className="text-sm font-semibold text-gray-700">기본 탐사 데이터 보상</Label>
                    <Input
                      id="reward_research_data_default"
                      type="number"
                      value={questData.reward_research_data_default}
                      onChange={handleQuestDataChange}
                      placeholder="예: 30"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {formErrors.formGeneral && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{formErrors.formGeneral}</p>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 sticky bottom-0 bg-white pb-4">
            <Button
              onClick={handleSubmit}
              className="bg-gray-900 hover:bg-gray-800 text-white h-11 px-8 flex-1"
              disabled={isSubmitting || isLoadingStudents}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  개인 퀘스트 등록
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/quest')}
              className="border-gray-300 hover:bg-gray-50 h-11 px-8"
            >
              취소
            </Button>
          </div>
        </div>
      </div>

      {/* 난이도 기준 모달 */}
      <Dialog open={showDifficultyGuide} onOpenChange={setShowDifficultyGuide}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>난이도 가이드</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 1점 (EASY/개념 확인): 수업이나 교재에서 배운 핵심 개념이나 공식을 그대로 기억해서 풀 수 있는 문제(예: 일반적인 문제집의 '개념 체크', '보기' 문제)</li>
                <li>• 2점 (BASIC/유형 적용): 배운 개념을 직접적으로 적용하는 가장 대표적인 유형의 문제(예: 쎈 B스텝 - 하)</li>
                <li>• 3점 (MEDIUM/복합 응용): 두 가지 이상의 개념이 함께 사용되거나, 문제의 조건을 한 번 더 생각해야 하는 응용 문제(예: 쎈 B스텝 - 중/상)</li>
                <li>• 4점 (HARD/심화 분석): 문제의 구조를 분석하고 숨겨진 조건을 찾아야 하는 본격적인 심화 문제(예: 쎈 C스텝)</li>
                <li>• 5점 (VERY_HARD/창의적 해결): 기존 풀이법을 넘어서는 창의적인 아이디어가 필요하거나, 여러 단계를 거쳐 논리적으로 증명/추론해야 하는 최고난도 문제(예: 모의고사 킬러문항)</li>
              </ul>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowDifficultyGuide(false)}
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
              <p className="text-sm text-blue-800">
                선택한 <strong>{selectedStudents.length}명</strong>의 학생에 대해 AI가 개별 보상을 추천합니다.<br />
                학생의 평소 성취도와 퀘스트 난이도를 분석하여 산출됩니다.<br />
                (* 최초 추천 시 학생 목록에서 학생 개별 성적을 입력하면 초기값을 맞춤으로 추천받을 수 있습니다.)
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAIReward(false)}>취소</Button>
              <Button onClick={handleAiRecommend} disabled={isAiLoading}>
                {isAiLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 분석 중...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> 추천받기</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI 학생별 보상 추천 모달 */}
      <Dialog open={showAiStudentModal} onOpenChange={setShowAiStudentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">학생별 추천 보상</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-1">
            <div className="space-y-3">
              {selectedStudents.map(studentId => {
                const student = allStudents.find(s => s.id === studentId);
                const aiRec = aiRecommendations.get(studentId);
                const personalRec = personalRewards.get(studentId);

                if (!student || !aiRec || !personalRec) return null;

                return (
                  <div key={studentId} className="p-4 border rounded-lg flex justify-between items-start bg-white">
                    <div>
                      <p className="font-bold text-gray-900">{student.real_name}</p>
                      <p className="text-sm text-gray-500 mt-1">{aiRec.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600">
                        C {personalRec.coral} / R {personalRec.research}
                      </div>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs text-gray-400 hover:text-gray-600 mt-1"
                        onClick={() => handleOpenEditModal(studentId)}
                      >
                        수정
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelAllAiRecs}>취소</Button>
            <Button onClick={handleConfirmAllAiRecs}>전체 확정</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI 개별 학생 보상 수정 모달 */}
      <Dialog open={showAiStudentEditModal} onOpenChange={setShowAiStudentEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black">
              {currentEditStudent?.real_name} 학생 보상 수정
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentEditAiRec ? (
              <>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">
                    AI 추천: {currentEditAiRec.recommended_research_data} 탐사데이터, {currentEditAiRec.recommended_coral} 코랄
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editResearch" className="text-black font-medium">수정값: 탐사데이터</Label>
                  <Input
                    id="editResearch"
                    type="number"
                    value={editForm.research}
                    onChange={(e) => setEditForm(prev => ({ ...prev, research: e.target.value }))}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                  {(() => {
                    const aiResearch = currentEditAiRec.recommended_research_data;
                    const editedResearch = Number(editForm.research) || 0;
                    const researchChange = aiResearch > 0 ? ((editedResearch - aiResearch) / aiResearch) * 100 : (editedResearch > 0 ? 100 : 0);
                    return (
                      <p className={`text-sm ${researchChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        변경률: {researchChange.toFixed(1)}%
                      </p>
                    )
                  })()}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editCoral" className="text-black font-medium">수정값: 코랄</Label>
                  <Input
                    id="editCoral"
                    type="number"
                    value={editForm.coral}
                    onChange={(e) => setEditForm(prev => ({ ...prev, coral: e.target.value }))}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                  {(() => {
                    const aiCoral = currentEditAiRec.recommended_coral;
                    const editedCoral = Number(editForm.coral) || 0;
                    const coralChange = aiCoral > 0 ? ((editedCoral - aiCoral) / aiCoral) * 100 : (editedCoral > 0 ? 100 : 0);
                    return (
                      <p className={`text-sm ${coralChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        변경률: {coralChange.toFixed(1)}%
                      </p>
                    )
                  })()}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editMemo" className="text-black font-medium">메모 (선택)</Label>
                  <Textarea
                    id="editMemo"
                    value={editForm.memo}
                    onChange={(e) => setEditForm(prev => ({ ...prev, memo: e.target.value }))}
                    placeholder="수정 사유를 입력하세요 (예: 최근 성적 향상으로 상향 조정)"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </>
            ) : (
              <p>AI 추천 정보를 불러올 수 없습니다.</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmEdit}
                className="bg-black hover:bg-gray-800 text-white rounded-lg"
              >
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
