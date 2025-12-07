import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { get, post } from "../../utils/api";
import { useAuth } from "../../contexts/AppContext";

interface ClassInfo {
  class_id: number;
  class_name: string;
  student_count: number;
}

interface RaidTemplate {
  code: string;
  display_name: string;
  description: string;
}

interface RaidDifficulty {
  code: string;
  display_name: string;
  hp: number;
  min_hp: number;
  max_hp: number;
}

interface RaidCreationInfo {
  class_info: ClassInfo;
  templates: RaidTemplate[];
  difficulty_options: RaidDifficulty[];
}

export function RaidCreatePageNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { classId?: number } | null;
  const { currentClassId } = useAuth();
  // 우선순위: location.state > currentClassId (전역 상태)
  const [selectedClass, setSelectedClass] = useState<number | null>(
    locationState?.classId ?? (currentClassId ? Number(currentClassId) : null)
  );
  const [classList, setClassList] = useState<ClassInfo[]>([]);
  const [creationInfo, setCreationInfo] = useState<RaidCreationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    raid_name: "",
    template: "ZELUS_INDUSTRY", // 기본값 설정
    difficulty: "",
    start_date: "",
    end_date: "",
    boss_hp: "",
    reward_coral: 100,
    special_reward_description: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // 반 목록 조회
  useEffect(() => {
    const fetchClassList = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await get('/api/v1/classes');
        const json = await response.json();
        console.log('반 목록 조회 응답:', { status: response.status, ok: response.ok, json }); // 디버깅용

        if (response.ok && json.data) {
          const classes = json.data.classes || [];
          setClassList(classes);

          // location.state나 currentClassId가 없고, 반 목록이 있으면 currentClassId 사용
          if (!selectedClass && currentClassId) {
            const classId = Number(currentClassId);
            if (!isNaN(classId)) {
              console.log('currentClassId에서 반 선택:', classId); // 디버깅용
              setSelectedClass(classId);
            }
          } else if (classes.length === 0) {
            setError('생성된 반이 없습니다. 먼저 반을 생성해주세요.');
          }
        } else {
          const errorMsg = json?.message || '반 목록을 불러오지 못했습니다.';
          console.error('반 목록 조회 실패:', errorMsg);
          setError(errorMsg);
        }
      } catch (err: any) {
        setError('반 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchClassList();
  }, [selectedClass, currentClassId]);

  const loadCreationInfo = useCallback(async (classId: number) => {
    setInfoLoading(true);
    setError(null);
    setSubmitMessage(null);
    try {
      const response = await get(`/api/v1/raids/creation-info?class_id=${classId}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.message || '레이드 생성 정보를 불러오지 못했습니다.');
      }

      const data = json.data as RaidCreationInfo;
      setCreationInfo(data);

      setFormState(prev => ({
        ...prev,
        template: data.templates?.[0]?.code || 'ZELUS_INDUSTRY',
        difficulty: "",
        reward_coral: 100,
        boss_hp: ""
      }));
    } catch (err: any) {
      console.error('Error loading creation info:', err);
      setError(err.message ?? '정보를 불러오는 중 오류가 발생했습니다.');
      setCreationInfo(null);
    } finally {
      setInfoLoading(false);
    }
  }, []);

  // 반이 선택되면 레이드 생성 정보 불러오기
  useEffect(() => {
    if (selectedClass) {
      loadCreationInfo(selectedClass);
    } else {
      setCreationInfo(null);
    }
  }, [selectedClass, loadCreationInfo]);

  const handleRefreshInfo = () => {
    if (selectedClass) loadCreationInfo(selectedClass);
  };

  // 선택된 난이도 정보 찾기
  const selectedDifficultyInfo = useMemo(() => {
    if (!creationInfo || !formState.difficulty) return null;
    return creationInfo.difficulty_options.find(d => d.code === formState.difficulty);
  }, [creationInfo, formState.difficulty]);

  // 유효성 검사
  const canCreate = useMemo(() => {
    if (!creationInfo || !selectedClass) return false;

    const bossHp = Number(formState.boss_hp);
    return Boolean(
      formState.raid_name?.trim() &&
      formState.start_date?.trim() &&
      formState.end_date?.trim() &&
      formState.difficulty &&
      formState.boss_hp?.trim() &&
      bossHp > 0 &&
      formState.reward_coral > 0
    );
  }, [creationInfo, formState, selectedClass]);

  const missingFields = useMemo(() => {
    const fields: string[] = [];
    if (!formState.raid_name) fields.push('레이드 이름');
    if (!formState.start_date) fields.push('시작 날짜');
    if (!formState.end_date) fields.push('종료 날짜');
    if (!formState.difficulty) fields.push('난이도');
    if (!formState.boss_hp || Number(formState.boss_hp) <= 0) fields.push('보스 HP');
    return fields;
  }, [formState]);

  const handleSubmit = async () => {
    if (!selectedClass) return;
    setSubmitMessage(null);
    setSubmitting(true);
    try {
      // datetime-local 형식을 ISO 8601 형식으로 변환
      const formatDateTime = (dateTimeString: string): string => {
        if (!dateTimeString) return '';
        // datetime-local 형식 (YYYY-MM-DDTHH:mm)을 ISO 8601 형식으로 변환
        return dateTimeString + ':00'; // 초 추가
      };

      const payload = {
        class_id: selectedClass,
        template: formState.template,
        raid_name: formState.raid_name.trim(),
        difficulty: formState.difficulty,
        start_date: formatDateTime(formState.start_date),
        end_date: formatDateTime(formState.end_date),
        boss_hp: Number(formState.boss_hp),
        reward_coral: formState.reward_coral,
        special_reward_description: formState.special_reward_description.trim() || null
      };

      console.log('레이드 생성 요청:', payload); // 디버깅용

      const response = await post('/api/v1/raids', payload);
      const json = await response.json();

      console.log('레이드 생성 응답:', { status: response.status, ok: response.ok, json }); // 디버깅용

      if (!response.ok) {
        // 409 Conflict 처리 (이미 진행 중인 레이드)
        if (response.status === 409) {
          throw new Error("이미 진행 중인 레이드가 있습니다. 기존 레이드가 종료된 후 생성해주세요.");
        }
        throw new Error(json?.message || '레이드 생성에 실패했습니다.');
      }

      setSubmitMessage('레이드가 성공적으로 생성되었습니다.');
      setTimeout(() => navigate('/teacher/raid/manage'), 1000);
    } catch (err: any) {
      console.error('레이드 생성 에러:', err);
      setSubmitMessage(err.message ?? '레이드 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">반 목록을 불러오는 중...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">레이드 등록</h1>
        <p className="text-sm text-gray-500 mt-1">새로운 보스 레이드를 생성하세요.</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && !infoLoading && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex flex-col items-start gap-2">
            <div>
              <p className="text-sm font-semibold text-red-800">오류가 발생했습니다</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-red-200 text-red-700 hover:bg-red-50 h-8 text-xs"
              onClick={() => {
                setError(null);
                if (selectedClass) {
                  loadCreationInfo(selectedClass);
                }
              }}
            >
              다시 시도
            </Button>
          </div>
        )}

        <div className="space-y-8">
          {/* 반 선택 섹션 */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">대상 반 선택</Label>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Select
                value={selectedClass?.toString() || ""}
                onValueChange={(value: any) => {
                  const classId = parseInt(value, 10);
                  setSelectedClass(classId);
                }}
              >
                <SelectTrigger className="w-full md:w-[320px] bg-white border-gray-200">
                  <SelectValue placeholder="반을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((cls) => (
                    <SelectItem key={cls.class_id} value={String(cls.class_id)}>
                      {cls.class_name} {cls.student_count !== undefined && `(${cls.student_count}명)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedClass && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-gray-200 hover:bg-gray-50"
                  onClick={handleRefreshInfo}
                  disabled={infoLoading}
                >
                  {infoLoading ? '정보 새로고침 중...' : '정보 새로고침'}
                </Button>
              )}
            </div>
            {creationInfo && (
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md w-fit">
                <CheckCircle2 className="w-4 h-4" />
                <span>선택된 반: <strong>{creationInfo.class_info.class_name}</strong> (학생 {creationInfo.class_info.student_count}명)</span>
              </div>
            )}
          </div>

          {/* 정보 로딩 중일 때 표시 */}
          {infoLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
               <Loader2 className="w-8 h-8 animate-spin mb-3 text-gray-300" />
               <p>레이드 생성 정보를 불러오고 있습니다...</p>
            </div>
          )}

          {/* 메인 폼 영역 */}
          {!infoLoading && creationInfo && (
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6 space-y-8">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">레이드 이름</Label>
                  <Input
                    value={formState.raid_name}
                    onChange={(e) => setFormState((prev) => ({ ...prev, raid_name: e.target.value }))}
                    placeholder="예: 중간고사 대비 크라켄 토벌"
                    className="bg-white max-w-lg"
                  />
                </div>

                {/* 템플릿 선택 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">시나리오 / 보스</Label>
                  <RadioGroup
                    value={formState.template}
                    onValueChange={(value: any) => setFormState((prev) => ({ ...prev, template: value }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {creationInfo.templates.map((template) => (
                      <div
                        key={template.code}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${formState.template === template.code
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        onClick={() => setFormState(prev => ({ ...prev, template: template.code }))}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={template.code} id={template.code} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={template.code} className="cursor-pointer font-bold text-sm text-gray-900 block mb-1">
                              {template.display_name}
                            </Label>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* 기간 설정 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">시작 일시</Label>
                    <Input
                      type="datetime-local"
                      value={formState.start_date}
                      onChange={(e) => setFormState((prev) => ({ ...prev, start_date: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">종료 일시</Label>
                    <Input
                      type="datetime-local"
                      value={formState.end_date}
                      onChange={(e) => setFormState((prev) => ({ ...prev, end_date: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                </div>

                {/* 난이도 및 보상 설정 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">난이도 설정</Label>
                    <div className="space-y-3">
                       <Select
                        value={formState.difficulty}
                        onValueChange={(value: any) => {
                          const selectedDiff = creationInfo.difficulty_options.find(d => d.code === value);
                          const coral = value === 'LOW' ? 100 : value === 'MEDIUM' ? 150 : 200;
                          const hpValue = selectedDiff ? selectedDiff.hp : "";
                          setFormState((prev) => ({ ...prev, difficulty: value, reward_coral: coral, boss_hp: String(hpValue) }));
                        }}
                      >
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="난이도를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {creationInfo.difficulty_options.map((diff) => (
                            <SelectItem key={diff.code} value={diff.code}>
                              {diff.display_name} (HP: {diff.hp.toLocaleString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100 space-y-2">
                        <Label className="text-xs font-semibold text-gray-500">보스 HP (수동 조정)</Label>
                        <Input
                          type="number"
                          value={formState.boss_hp}
                          onChange={(e) => setFormState((prev) => ({ ...prev, boss_hp: e.target.value }))}
                          placeholder="HP 입력"
                          min="1"
                          className="bg-white h-9"
                        />
                        {selectedDifficultyInfo && (
                          <p className="text-[10px] text-gray-400">
                            권장범위: {selectedDifficultyInfo.min_hp.toLocaleString()} ~ {selectedDifficultyInfo.max_hp.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">클리어 보상</Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">기본 보상 (코랄)</Label>
                        <Input
                          type="number"
                          value={formState.reward_coral}
                          onChange={(e) => setFormState(prev => ({ ...prev, reward_coral: Number(e.target.value) }))}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">특별 보상 (선택 사항)</Label>
                        <Input
                          value={formState.special_reward_description}
                          onChange={(e) => setFormState((prev) => ({ ...prev, special_reward_description: e.target.value }))}
                          placeholder="예: 아이스크림, 간식 등"
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 제출 버튼 */}
                <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                  {submitMessage && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-200 text-center">
                      {submitMessage}
                    </div>
                  )}

                  <div className="flex gap-4 justify-end">
                    <Button
                      variant="outline"
                      className="w-32 border-gray-200"
                      onClick={() => navigate('/teacher/raid/manage')}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!canCreate || submitting}
                      className="w-40 bg-black hover:bg-gray-800 text-white"
                    >
                      {submitting ? '생성 중...' : '레이드 생성하기'}
                    </Button>
                  </div>

                  {!canCreate && !submitting && (
                    <p className="text-right text-xs text-red-500">
                      * 필수 항목을 모두 입력해주세요 ({missingFields.join(', ')})
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 반은 선택되었는데 정보를 못 불러온 경우 */}
          {!infoLoading && selectedClass && !creationInfo && !error && (
            <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p>레이드 생성 정보를 불러올 수 없습니다.</p>
              <Button variant="link" onClick={handleRefreshInfo} className="text-sm mt-1">다시 시도</Button>
            </div>
          )}

          {/* 반 선택 전 안내 */}
          {!selectedClass && (
            <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-sm">상단의 메뉴에서 대상 반을 먼저 선택해주세요.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}