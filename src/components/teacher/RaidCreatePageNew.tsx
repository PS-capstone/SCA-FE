import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Loader2, Sword, Calendar, Trophy, AlertCircle } from "lucide-react";
import { get, post } from "../../utils/api";
import { useAuth } from "../../contexts/AppContext";
import { differenceInDays, parseISO } from "date-fns";

const DAILY_EXPLORATION_SCORE = 200; // 일일 기준 탐사데이터
const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  LOW: 0.6,
  MEDIUM: 0.8,
  HIGH: 1.0,
};

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

  // 1. 반 목록 조회
  useEffect(() => {
    const fetchClassList = async () => {
      setLoading(true);
      try {
        const response = await get('/api/v1/classes');
        const json = await response.json();

        if (response.ok && json.data) {
          const classes = json.data.classes || [];
          setClassList(classes);

          if (!selectedClass && currentClassId) {
            setSelectedClass(Number(currentClassId));
          } else if (classes.length === 0) {
            setError('생성된 반이 없습니다. 먼저 반을 생성해주세요.');
          }
        }
      } catch (err: any) {
        setError('반 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchClassList();
  }, [selectedClass, currentClassId]);

  // 2. 레이드 생성 정보(옵션) 조회
  const loadCreationInfo = useCallback(async (classId: number) => {
    setInfoLoading(true);
    setError(null);
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

  // 제출 핸들러
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

      const response = await post('/api/v1/raids', payload);
      const json = await response.json();

      if (!response.ok) {
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

  useEffect(() => {
    // 필수 데이터가 없으면 계산하지 않음
    if (!creationInfo?.class_info || !formState.start_date || !formState.end_date || !formState.difficulty) {
      return;
    }

    const startDate = new Date(formState.start_date);
    const endDate = new Date(formState.end_date);

    // 날짜 유효성 검사
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

    // 기간(일) 계산 (최소 1일 보장)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const studentCount = creationInfo.class_info.student_count;
    const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[formState.difficulty] || 1.0;

    // 수식: 학생 수 × 레이드 기간(일) × 일일 기준 탐사데이터 × 난이도 계수
    const calculatedHp = Math.floor(studentCount * durationDays * DAILY_EXPLORATION_SCORE * difficultyMultiplier);

    setFormState(prev => ({
      ...prev,
      boss_hp: String(calculatedHp)
    }));

  }, [
    creationInfo?.class_info,
    formState.start_date,
    formState.end_date,
    formState.difficulty
  ]);

  const calculationDisplay = useMemo(() => {
    if (!creationInfo?.class_info || !formState.start_date || !formState.end_date || !formState.difficulty) {
      return null;
    }

    const startDate = new Date(formState.start_date);
    const endDate = new Date(formState.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const studentCount = creationInfo.class_info.student_count;
    const multiplier = DIFFICULTY_MULTIPLIERS[formState.difficulty] || 1.0;

    return {
      studentCount,
      durationDays,
      dailyScore: DAILY_EXPLORATION_SCORE,
      multiplier
    };
  }, [creationInfo?.class_info, formState.start_date, formState.end_date, formState.difficulty]);

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">레이드 등록</h1>
        <p className="text-sm text-gray-500 mt-1">새로운 보스 레이드를 생성하세요.</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {/* 1. 기본 설정 카드 */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sword className="w-5 h-5 text-gray-500" />
                기본 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* 대상 반 선택 */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-900">대상 반 선택</Label>
                <Select
                  value={selectedClass?.toString()}
                  onValueChange={(val: any) => setSelectedClass(Number(val))}
                >
                  <SelectTrigger className="h-11 bg-white border-gray-300">
                    <SelectValue placeholder="반을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {classList.map(cls => (
                      <SelectItem key={cls.class_id} value={String(cls.class_id)}>
                        {cls.class_name} ({cls.student_count}명)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">선택한 반의 모든 학생이 레이드에 참여하게 됩니다.</p>
              </div>

              {/* 레이드 이름 */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-900">레이드 이름</Label>
                <Input
                  value={formState.raid_name}
                  onChange={(e) => setFormState(prev => ({ ...prev, raid_name: e.target.value }))}
                  placeholder="예: 중간고사 대비 크라켄 토벌전"
                  className="h-11 bg-white"
                />
              </div>

              {/* 템플릿 선택 */}
              {creationInfo && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-900">보스 시나리오</Label>
                  <RadioGroup
                    value={formState.template}
                    onValueChange={(val: any) => setFormState(prev => ({ ...prev, template: val }))}
                    className="grid grid-cols-1 sm:!grid-cols-2 gap-4"
                  >
                    {creationInfo.templates.map(tmpl => (
                      <div key={tmpl.code}
                        className={`
                                    relative flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-all
                                    ${formState.template === tmpl.code
                            ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600'
                            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'}
                                `}
                        onClick={() => setFormState(prev => ({ ...prev, template: tmpl.code }))}
                      >
                        <RadioGroupItem value={tmpl.code} id={tmpl.code} className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor={tmpl.code} className="font-bold cursor-pointer">{tmpl.display_name}</Label>
                          <p className="text-sm text-gray-500 leading-snug">{tmpl.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. 일정 및 난이도 카드 */}
          {creationInfo && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  일정 및 난이도
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:!grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">시작 일시</Label>
                    <Input
                      type="datetime-local"
                      className="h-11 bg-white"
                      value={formState.start_date}
                      onChange={e => setFormState(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">종료 일시</Label>
                    <Input
                      type="datetime-local"
                      className="h-11 bg-white"
                      value={formState.end_date}
                      onChange={e => setFormState(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-4" />

                <div className="grid grid-cols-1 md:!grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">난이도 설정</Label>
                    <Select
                      value={formState.difficulty}
                      onValueChange={(val: any) => {
                        const preset = creationInfo.difficulty_options.find(d => d.code === val);
                        setFormState(prev => ({
                          ...prev,
                          difficulty: val,
                          boss_hp: preset ? String(preset.hp) : "",
                          reward_coral: val === 'LOW' ? 100 : val === 'MEDIUM' ? 150 : 200
                        }));
                      }}
                    >
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder="난이도를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {creationInfo.difficulty_options.map(opt => (
                          <SelectItem key={opt.code} value={opt.code}>
                            {opt.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">보스 HP (Total)</Label>
                    <div className="flex flex-col gap-1.5">
                      <Input
                        type="number"
                        className="h-11 bg-white"
                        placeholder="자동 계산됨 (직접 수정 가능)"
                        value={formState.boss_hp}
                        onChange={e => setFormState(prev => ({ ...prev, boss_hp: e.target.value }))}
                      />
                      {calculationDisplay ? (
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>
                            계산식: {calculationDisplay.studentCount}명(학생)
                            × {calculationDisplay.durationDays}일(기간)
                            × {calculationDisplay.dailyScore}점(기준)
                            × {calculationDisplay.multiplier} (난이도)
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">
                          * 기간과 난이도를 설정하면 권장 HP가 자동 계산됩니다.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. 보상 설정 카드 */}
          {creationInfo && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-gray-500" />
                  보상 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">기본 보상 (Coral)</Label>
                    <Input
                      type="number"
                      className="h-11 bg-white"
                      value={formState.reward_coral}
                      onChange={e => setFormState(prev => ({ ...prev, reward_coral: Number(e.target.value) }))}
                    />
                    <p className="text-sm text-gray-500">레이드 성공 시 참여자 전원에게 지급됩니다.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">특별 보상 (선택)</Label>
                    <Input
                      className="h-11 bg-white"
                      placeholder="예: 아이스크림, 간식 등"
                      value={formState.special_reward_description}
                      onChange={e => setFormState(prev => ({ ...prev, special_reward_description: e.target.value }))}
                    />
                    <p className="text-sm text-gray-500">추가 보상이 있다면 입력해주세요.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              size="lg"
              className="px-8 border-gray-300"
              onClick={() => navigate('/teacher/raid/manage')}
            >
              취소
            </Button>
            <Button
              size="lg"
              className="px-8 bg-black hover:bg-gray-800 text-white font-bold"
              disabled={!canCreate || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  레이드 생성하기
                </>
              )}
            </Button>
          </div>
        </div>
        {!canCreate && !submitting && (
          <p className="text-right text-xs text-red-500">
            * 필수 항목을 모두 입력해주세요 ({missingFields.join(', ')})
          </p>
        )}

      </main>
    </div>
  );
}