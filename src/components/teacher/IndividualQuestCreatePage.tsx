import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { User, Plus, Info, Sparkles, Loader2 } from "lucide-react";
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
  global_factor?: number;
  difficulty_factor?: number;
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

  const getCommonAiReason = () => {
    if (aiRecommendations.size === 0) return null;
    const firstRec = aiRecommendations.values().next().value;
    return firstRec?.reason || null;
  };

  // 수정 모달용 데이터
  const currentEditStudent = currentEditingStudentId ? allStudents.find(s => s.id === currentEditingStudentId) : null;
  const currentEditAiRec = currentEditingStudentId ? aiRecommendations.get(currentEditingStudentId) : null;

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">개인 퀘스트 등록</h1>
          <p className="text-sm text-gray-500 mt-1">특정 학생에게 할당할 개별 퀘스트를 등록합니다.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* 1. 기본 정보 카드 */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-gray-500" />
                퀘스트 기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">
                    퀘스트 제목 <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-gray-200 hover:bg-gray-50 text-gray-500"
                    onClick={() => {
                      setQuestData((prev) => ({
                        ...prev,
                        title: "쎈 미적분1 숙제",
                        teacher_content: "쎈 미적분1 2단원 03 미분계수와 도함수 A,B단계 풀어오기",
                      }));
                      // 입력 시 관련 에러 메시지 초기화 (선택 사항)
                      setFormErrors((prev) => ({
                        ...prev,
                        title: null,
                        teacher_content: null,
                      }));
                    }}
                  >
                    [시연] 퀘스트 입력
                  </Button>
                </div>
                <Input
                  id="title"
                  value={questData.title}
                  onChange={handleQuestDataChange}
                  placeholder="퀘스트 제목을 입력하세요"
                  className="h-11 bg-white"
                />
                {formErrors.title && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  퀘스트 설명 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="teacher_content"
                  value={questData.teacher_content}
                  onChange={(e) => setQuestData({ ...questData, teacher_content: e.target.value })}
                  placeholder="퀘스트에 대한 자세한 설명을 입력하세요"
                  className="min-h-[120px] bg-white resize-none text-sm leading-relaxed"
                />
                {formErrors.teacher_content && <p className="text-xs text-red-600 mt-1">{formErrors.teacher_content}</p>}
              </div>
              <div className="grid grid-cols-1 md:!grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    난이도 <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <Select
                      value={questData.difficulty.toString()}
                      onValueChange={handleDifficultyChange}
                    >
                      <SelectTrigger className="w-[300px] bg-white">
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
                      size="sm"
                      className="border-gray-200 hover:bg-gray-50"
                      onClick={() => setShowDifficultyGuide(true)}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      가이드
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. 대상 및 보상 카드 */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-gray-500" />
                대상 및 보상 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">

              {/* 학생 선택 영역 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    대상 학생 선택 <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-sm text-gray-500">{selectedStudents.length}명 선택됨</span>
                </div>


                <div className="border border-gray-200 rounded-lg bg-gray-50 max-h-[240px] overflow-y-auto p-2">
                  <div className="flex items-center gap-3">
                    {!isLoadingStudents && !fetchError && allStudents.length > 0 && (
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {selectedStudents.length === allStudents.length ? '전체 해제' : '전체 선택'}
                      </button>
                    )}
                    <span className="text-xs text-gray-500">
                      {selectedStudents.length > 0 ? `${selectedStudents.length}명 선택됨` : '선택 안됨'}
                    </span>
                  </div>
                </div>

                {isLoadingStudents ? (
                  <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <p className="text-sm text-gray-500">학생 목록을 불러오는 중...</p>
                  </div>
                ) : fetchError ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-center">
                    <p className="text-red-600 text-sm font-medium">{fetchError}</p>
                  </div>
                ) : allStudents.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">등록된 학생이 없습니다.</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto px-4 py-3 space-y-2 custom-scrollbar">
                      {allStudents.map((student) => {
                        const personalRec = personalRewards.get(student.id);
                        const aiRec = aiRecommendations.get(student.id);
                        const isSelected = selectedStudents.includes(student.id);

                        return (
                          <div
                            key={student.id}
                            className={`p-3 border rounded-md cursor-pointer transition-all ${isSelected
                              ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            onClick={() => toggleStudent(student.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleStudent(student.id)}
                                onClick={(e: any) => e.stopPropagation()}
                                className="shrink-0 p-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">{student.real_name}</p>
                                  {isSelected && (
                                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                      선택됨
                                    </span>
                                  )}
                                </div>

                                {isSelected && aiModeEnabled && personalRec && (
                                  <div className="mt-2 p-2 bg-white border border-blue-100 rounded text-xs space-y-1">
                                    {/* 값이 수정되었는지 확인 */}
                                    {aiRec && (aiRec.recommended_coral !== personalRec.coral || aiRec.recommended_research_data !== personalRec.research) ? (
                                      <>
                                        {/* 수정된 경우: AI 원본 표시 (취소선) */}
                                        <div className="flex justify-between items-center text-gray-400">
                                          <span className="text-[10px] bg-gray-100 px-1.5 rounded">AI 원본</span>
                                          <span className="line-through decoration-gray-300">
                                            C {aiRec.recommended_coral} / R {aiRec.recommended_research_data}
                                          </span>
                                        </div>
                                        {/* 수정된 경우: 실제 적용값 표시 */}
                                        <div className="flex justify-between items-center font-semibold text-blue-700">
                                          <span className="text-[10px] bg-blue-100 px-1.5 rounded">수정됨</span>
                                          <span>
                                            C {personalRec.coral} / R {personalRec.research}
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      /* 수정되지 않은 경우: 현재 값만 표시 (AI 추천값과 동일) */
                                      <div className="flex justify-between items-center font-semibold text-blue-700">
                                        <span className="text-[10px] bg-blue-100 px-1.5 rounded">보상</span>
                                        <span>
                                          C {personalRec.coral} / R {personalRec.research}
                                        </span>
                                      </div>
                                    )}

                                    {/* 메모 */}
                                    {personalRec.memo && (
                                      <p className="text-amber-600 mt-1 truncate" title={personalRec.memo}>
                                        📝 {personalRec.memo}
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
                  <p className="text-xs text-red-600 mt-1">{formErrors.selectedStudents}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">마감일</Label>
                  <div className="flex gap-2">
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={questData.deadline}
                      onChange={handleQuestDataChange}
                      className="bg-white flex-1"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-gray-200 hover:bg-gray-50 whitespace-nowrap"
                      onClick={() => {
                        const now = new Date();
                        const tomorrow = new Date(now);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(23, 59, 0, 0);
                        const formatted = tomorrow.toISOString().slice(0, 16);
                        setQuestData(prev => ({ ...prev, deadline: formatted }));
                      }}
                    >
                      내일 23:59
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-gray-200 hover:bg-gray-50 whitespace-nowrap"
                      onClick={() => {
                        const now = new Date();
                        const nextWeek = new Date(now);
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        nextWeek.setHours(23, 59, 0, 0);
                        const formatted = nextWeek.toISOString().slice(0, 16);
                        setQuestData(prev => ({ ...prev, deadline: formatted }));
                      }}
                    >
                      일주일 후
                    </Button>
                  </div>
                  {questData.deadline && (
                    <p className="text-xs text-gray-500 mt-1">
                      설정된 마감일: {new Date(questData.deadline).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50"
                    onClick={() => setShowAIReward(true)}
                    disabled={selectedStudents.length === 0}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI 보상 추천받기
                  </Button>
                </div>
              </div>

              {!aiModeEnabled && (
                <div className="grid grid-cols-1 sm:!grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <Label htmlFor="reward_coral_default" className="text-sm font-medium text-gray-700">기본 코랄 보상</Label>
                    <Input
                      id="reward_coral_default"
                      type="number"
                      value={questData.reward_coral_default}
                      onChange={handleQuestDataChange}
                      placeholder="예: 50"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reward_research_data_default" className="text-sm font-medium text-gray-700">기본 탐사 데이터 보상</Label>
                    <Input
                      id="reward_research_data_default"
                      type="number"
                      value={questData.reward_research_data_default}
                      onChange={handleQuestDataChange}
                      placeholder="예: 30"
                      className="bg-white"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {formErrors.formGeneral && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600">{formErrors.formGeneral}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/quest')}
              className="border-gray-200 hover:bg-gray-50 px-8"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              className="px-8 bg-black text-white hover:bg-gray-800 font-bold"
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
          </div>
        </div>
      </main>

      {/* 난이도 기준 모달 */}
      <Dialog open={showDifficultyGuide} onOpenChange={setShowDifficultyGuide}>
        <DialogContent className="max-w-2xl border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>난이도 가이드</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <ul className="space-y-2 text-sm text-gray-700">
                <li><span className="font-bold text-gray-900">1점 (EASY):</span> 개념 확인 - 수업 핵심 개념/공식 적용 (예: 개념 체크)</li>
                <li><span className="font-bold text-gray-900">2점 (BASIC):</span> 유형 적용 - 대표 유형 문제 (예: 쎈 B - 하)</li>
                <li><span className="font-bold text-gray-900">3점 (MEDIUM):</span> 복합 응용 - 두 가지 이상 개념, 조건 응용 (예: 쎈 B - 중/상)</li>
                <li><span className="font-bold text-gray-900">4점 (HARD):</span> 심화 분석 - 문제 구조 분석, 숨겨진 조건 (예: 쎈 C)</li>
                <li><span className="font-bold text-gray-900">5점 (VERY_HARD):</span> 창의적 해결 - 킬러 문항, 논리적 증명/추론</li>
              </ul>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowDifficultyGuide(false)}
                className="bg-black hover:bg-gray-800 text-white"
              >
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI 보상 추천 안내 모달 */}
      <Dialog open={showAIReward} onOpenChange={setShowAIReward}>
        <DialogContent className="max-w-2xl border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>AI 보상 추천받기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                선택한 <strong>{selectedStudents.length}명</strong>의 학생에 대해 AI가 개별 보상을 추천합니다.<br />
                학생의 평소 성취도와 퀘스트 난이도를 분석하여 산출됩니다.
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

      {/* AI 학생별 보상 추천 목록 모달 */}
      <Dialog open={showAiStudentModal} onOpenChange={setShowAiStudentModal}>
        <DialogContent className="max-w-2xl border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>학생별 추천 보상</DialogTitle>
          </DialogHeader>

          {/* AI Reason */}
          {getCommonAiReason() && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
              <p className="text-sm font-semibold text-blue-800 mb-1">AI 분석</p>
              <p className="text-sm text-blue-700 leading-relaxed">
                {getCommonAiReason()}
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto max-h-[500px] p-1">
            <div className="space-y-3">
              {selectedStudents.map(studentId => {
                const student = allStudents.find(s => s.id === studentId);
                const aiRec = aiRecommendations.get(studentId);
                const personalRec = personalRewards.get(studentId);

                if (!student || !aiRec || !personalRec) return null;

                return (
                  <div key={studentId} className="p-4 border border-gray-200 rounded-lg flex justify-between items-start bg-white shadow-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{student.real_name}</p>
                        {(aiRec.global_factor !== undefined || aiRec.difficulty_factor !== undefined) && (
                          <div className="flex gap-1">
                            {aiRec.global_factor !== undefined && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200" title="Global Factor">
                                Global Factor: {aiRec.global_factor.toFixed(2)}
                              </span>
                            )}
                            {aiRec.difficulty_factor !== undefined && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200" title="Difficulty Factor">
                                Difficulty Factor: {aiRec.difficulty_factor.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {personalRec.memo && (
                        <p className="text-xs text-amber-600 font-medium mt-1">
                          📝 {personalRec.memo}
                        </p>
                      )}
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

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={handleCancelAllAiRecs}>취소</Button>
            <Button onClick={handleConfirmAllAiRecs}>전체 확정</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI 개별 학생 보상 수정 모달 */}
      <Dialog open={showAiStudentEditModal} onOpenChange={setShowAiStudentEditModal}>
        <DialogContent className="max-w-lg border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>
              {currentEditStudent?.real_name} 학생 보상 수정
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentEditAiRec ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-gray-500 mb-1">AI 초기 추천값</p>
                    <div className="font-semibold text-gray-700">
                      <div>탐사데이터: {currentEditAiRec.recommended_research_data}</div>
                      <div>코랄: {currentEditAiRec.recommended_coral}</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-blue-500 mb-1 font-semibold">현재 설정값</p>
                    <div className="font-bold text-blue-700">
                      <div>탐사데이터: {editForm.research || 0}</div>
                      <div>코랄: {editForm.coral || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editResearch" className="text-sm font-medium">수정값: 탐사데이터</Label>
                    <Input
                      id="editResearch"
                      type="number"
                      value={editForm.research}
                      onChange={(e) => setEditForm(prev => ({ ...prev, research: e.target.value }))}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editCoral" className="text-sm font-medium">수정값: 코랄</Label>
                    <Input
                      id="editCoral"
                      type="number"
                      value={editForm.coral}
                      onChange={(e) => setEditForm(prev => ({ ...prev, coral: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editMemo" className="text-sm font-medium">메모 (선택)</Label>
                  <Textarea
                    id="editMemo"
                    value={editForm.memo}
                    onChange={(e) => setEditForm(prev => ({ ...prev, memo: e.target.value }))}
                    placeholder="수정 사유를 입력하세요"
                    className="bg-white"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">AI 추천 정보를 불러올 수 없습니다.</p>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="border-gray-200 hover:bg-gray-50"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmEdit}
                className="bg-black hover:bg-gray-800 text-white"
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
