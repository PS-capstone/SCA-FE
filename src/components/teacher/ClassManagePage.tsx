import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Users, Copy, Sword, Check, Loader2, ChevronRight } from "lucide-react";
import { Progress } from "../ui/progress";
import { SectionCard } from "../common/SectionCard";
import { get, post } from "../../utils/api";
import { useAuth } from "../../contexts/AppContext";

interface ApiQuestProgress {
  completed: number;
  required: number;
}

interface ApiGroupQuest {
  quest_id: number;
  title: string;
  progress: ApiQuestProgress;
}

interface ApiBossHp {
  current: number;
  total: number;
  percentage: number;
}

interface ApiRaid {
  raid_id: number;
  title: string;
  boss_hp: ApiBossHp;
  participants: number;
  end_date: string;
}

interface ApiClassDetails {
  class_id: number;
  class_name: string;
  ongoing_group_quests: ApiGroupQuest[];
  ongoing_raid: ApiRaid | null;
  invite_code: string; // 반 api에도 invite_code 필요
}

// 남은 일수 계산 헬퍼 함수
function calculateDaysLeft(endDateString: string): number {
  if (!endDateString) return 0;
  try {
    const end = new Date(endDateString);
    const now = new Date();
    // 남은 시간이 0 미만이면 0을 반환
    const diffTime = Math.max(end.getTime() - now.getTime(), 0);
    // 남은 일수를 올림하여 계산
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (e) {
    return 0;
  }
}

export function ClassManagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId: urlClassId } = useParams<{ classId?: string }>();
  const locationState = location.state as { classId?: number } | null;
  const { currentClassId, setCurrentClass } = useAuth();

  const [isRaidModalOpen, setIsRaidModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    urlClassId ? Number(urlClassId) : (currentClassId ? Number(currentClassId) : (locationState?.classId ?? null))
  );
  const [classDetails, setClassDetails] = useState<ApiClassDetails | null>(null);
  const [raidActionMessage, setRaidActionMessage] = useState<string | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (urlClassId) {
      const parsedClassId = Number(urlClassId);
      if (!isNaN(parsedClassId)) {
        // 숫자로 변환 가능하면 숫자 ID 사용
        if (parsedClassId !== selectedClassId) {
          setSelectedClassId(parsedClassId);
          // 전역 상태에도 저장
          if (setCurrentClass) {
            setCurrentClass(String(parsedClassId));
          }
        }
      } else {
        const findClassByName = async () => {
          try {
            const response = await get('/api/v1/classes');
            const json = await response.json();
            if (response.ok && json.data?.classes?.length > 0) {
              const foundClass = json.data.classes.find(
                (c: any) => c.class_name === urlClassId || c.className === urlClassId
              );
              if (foundClass) {
                const classId = foundClass.class_id ?? foundClass.classId;
                setSelectedClassId(classId);
                // 전역 상태에도 저장
                if (setCurrentClass) {
                  setCurrentClass(String(classId));
                }
                // URL도 숫자 ID로 업데이트
                navigate(`/teacher/class/${classId}`, { replace: true });
              } else {
                setError(`반 "${urlClassId}"을 찾을 수 없습니다.`);
              }
            }
          } catch (err: any) {
            console.error('반 목록 조회 실패:', err);
            setError('반 정보를 불러오지 못했습니다.');
          }
        };
        findClassByName();
      }
    } else if (currentClassId && !selectedClassId) {
      // URL 파라미터가 없고 currentClassId가 있으면 그것을 사용
      const parsedClassId = Number(currentClassId);
      if (!isNaN(parsedClassId)) {
        setSelectedClassId(parsedClassId);
        navigate(`/teacher/class/${parsedClassId}`, { replace: true });
      }
    } else if (!selectedClassId) {
      // 아무런 ID도 없으면 첫 번째 반 가져오기 시도
      const fetchFirstClass = async () => {
        setIsLoading(true);
        try {
          const response = await get('/api/v1/classes');
          const json = await response.json();
          if (response.ok && json.data?.classes?.length > 0) {
            const firstClass = json.data.classes[0];
            const firstClassId = firstClass.class_id ?? firstClass.classId;
            setSelectedClassId(firstClassId);
            if (setCurrentClass) setCurrentClass(String(firstClassId));
          } else {
            setIsLoading(false); // 반이 아예 없는 경우 로딩 종료
          }
        } catch (err: any) {
          setError(err.message ?? '반 정보를 불러오지 못했습니다.');
          setIsLoading(false);
        }
      };
      fetchFirstClass();
    }
  }, [urlClassId, selectedClassId, currentClassId, navigate, setCurrentClass]);

  const loadClassDetail = useCallback(async (classId: number) => {
    console.log('[ClassManagePage] API 요청 시작:', `/api/v1/classes/${classId}`);
    setIsLoading(true);
    setError(null);
    try {
      const response = await get(`/api/v1/classes/${classId}`);
      console.log('[ClassManagePage] API 응답 상태:', response.status, response.ok);

      const json = await response.json();
      console.log('[ClassManagePage] API 응답 전체:', json);

      if (!response.ok) {
        throw new Error(json?.message ?? '반 상세 정보를 불러오지 못했습니다.');
      }
      if (json.success) {
        console.log('[ClassManagePage] 레이드 정보:', {
          ongoing_raid: json.data?.ongoing_raid,
          hasOngoingRaid: !!json.data?.ongoing_raid,
          raidDetails: json.data?.ongoing_raid ? {
            raid_id: json.data.ongoing_raid.raid_id,
            title: json.data.ongoing_raid.title,
            boss_hp: json.data.ongoing_raid.boss_hp,
            participants: json.data.ongoing_raid.participants,
            end_date: json.data.ongoing_raid.end_date
          } : null
        });
        setClassDetails(json.data);
      } else {
        throw new Error(json.message || "데이터 포맷 오류");
      }
    } catch (err: any) {
      console.error('[ClassManagePage] 데이터 로드 실패:', err);
      setError(err.message ?? '반 상세 정보를 불러오지 못했습니다.');
      setClassDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadClassDetail(selectedClassId);
    }
  }, [selectedClassId, loadClassDetail]);

  // 데이터 추출 및 가공
  const class_name = classDetails?.class_name ?? '반 정보 없음';
  const invite_code = classDetails?.invite_code ?? '';
  const ongoing_group_quests = classDetails?.ongoing_group_quests ?? [];
  const activeRaid = classDetails?.ongoing_raid ?? null;

  // 레이드 관련 변수
  const daysLeft = activeRaid ? calculateDaysLeft(activeRaid.end_date) : 0;
  const isActiveRaid = activeRaid; // API에서 ongoing_raid가 null이면 없는 것, 있으면 진행 중인 것으로 간주 (혹은 status 체크 추가 가능)

  const raidHpPercentage = activeRaid?.boss_hp?.percentage ?? 0;
  const raidHpLabel = activeRaid
    ? `${activeRaid.boss_hp?.current?.toLocaleString() ?? 0} / ${activeRaid.boss_hp?.total?.toLocaleString() ?? 0}`
    : "";
  const endDateLabel = activeRaid?.end_date ? new Date(activeRaid.end_date).toLocaleString() : '정보 없음';

  const handleCopyCode = () => {
    if (!invite_code || isCopied) return;
    navigator.clipboard.writeText(invite_code)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => alert('복사에 실패했습니다.'));
  };

  const handleTerminateRaid = async () => {
    if (!activeRaid) return;
    setIsTerminating(true);
    setRaidActionMessage(null);
    try {
      const response = await post(`/api/v1/raids/${activeRaid.raid_id}/terminate`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message ?? '레이드 종료에 실패했습니다.');
      }
      setRaidActionMessage('레이드를 종료했습니다.');
      if (selectedClassId) {
        loadClassDetail(selectedClassId);
      }
    } catch (err: any) {
      setRaidActionMessage(err.message ?? '레이드 종료에 실패했습니다.');
    } finally {
      setIsTerminating(false);
    }
  };

  const handleRefresh = () => {
    if (selectedClassId) {
      loadClassDetail(selectedClassId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{class_name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {classDetails ? '반 관리와 레이드 진행 상황을 확인하세요.' : '반을 선택해주세요.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {invite_code && (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">초대 코드</span>
              <code className="text-sm font-bold text-gray-800 font-mono">{invite_code}</code>
              <button
                onClick={handleCopyCode}
                disabled={isCopied}
                className="ml-1 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center w-10"
                title="초대 코드 복사"
              >
                {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={!selectedClassId || isLoading}
            className="h-9"
          >
            새로고침
          </Button>
        </div>
      </header>

      {error && (
        <div className="m-6 mb-0 p-4 rounded-md bg-red-50 text-sm text-red-600 border border-red-100 flex items-center">
          <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            className="h-auto py-4 justify-start bg-white border border-gray-200 text-black hover:bg-gray-50 hover:border-gray-300 shadow-sm"
            variant="ghost"
            onClick={() => {
              const classIdToUse = classDetails?.class_id ?? selectedClassId ?? (currentClassId ? Number(currentClassId) : null);
              if (classIdToUse) navigate(`/teacher/students/${classIdToUse}`);
              else navigate('/teacher/class');
            }}
          >
            <div className="bg-blue-50 p-2 rounded-full mr-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">학생 목록 조회</div>
              <div className="text-xs text-gray-500 font-normal">반 소속 학생 관리</div>
            </div>
          </Button>

          <Button
            className="h-auto py-4 justify-start bg-white border border-gray-200 text-black hover:bg-gray-50 hover:border-gray-300 shadow-sm"
            variant="ghost"
            onClick={() => navigate('/teacher/quest')}
          >
            <div className="bg-green-50 p-2 rounded-full mr-3">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">퀘스트 등록</div>
              <div className="text-xs text-gray-500 font-normal">새로운 과제 생성</div>
            </div>
          </Button>

          <Button
            className="h-auto py-4 justify-start bg-white border border-gray-200 text-black hover:bg-gray-50 hover:border-gray-300 shadow-sm"
            variant="ghost"
            onClick={() => navigate('/teacher/raid/create')}
          >
            <div className="bg-purple-50 p-2 rounded-full mr-3">
              <Sword className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">레이드 등록</div>
              <div className="text-xs text-gray-500 font-normal">보스전 이벤트 시작</div>
            </div>
          </Button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Quests Section */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold">진행 중인 단체 퀘스트</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-black h-8 px-2"
                onClick={() => navigate('/teacher/quest/group/manage')}
              >
                관리 <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {ongoing_group_quests.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {ongoing_group_quests.map((quest) => {
                    const completed = quest.progress?.completed ?? 0;
                    const required = quest.progress?.required ?? 0;
                    const percentage = required > 0 ? (completed / required) * 100 : 0;
                    return (
                      <div
                        key={quest.quest_id}
                        className="group border border-gray-100 rounded-lg p-4 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                        onClick={() => navigate(`/teacher/quest/group/detail/${quest.quest_id}`)} // 이동 로직 있다면 추가
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                            {quest.title}
                          </h4>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {completed}/{required}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                  <p className="text-sm text-gray-500">진행 중인 퀘스트가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Raid Section */}
          <Card className="border border-gray-200 shadow-sm flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold">진행 중인 레이드</CardTitle>
                {raidActionMessage && <span className="text-xs text-blue-600 animate-fade-in">{raidActionMessage}</span>}
              </div>
              {activeRaid && (
                <Badge variant={daysLeft > 0 ? "default" : "secondary"} className={`rounded-sm px-2 font-normal text-white ${daysLeft > 0 ? 'bg-red-600 hover:bg-red-700' : ''}`}>
                  {daysLeft > 0 ? `D-${daysLeft}` : '종료됨'}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              {activeRaid && isActiveRaid ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{activeRaid.title}</h4>
                    <p className="text-xs text-gray-500">종료일: {endDateLabel}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">보스 HP</span>
                      <span className="font-mono font-medium text-gray-700">{raidHpLabel}</span>
                    </div>
                    <Progress value={raidHpPercentage} className="h-3" indicatorClassName="bg-red-600" />
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-gray-100 mt-2">
                    <span className="text-sm text-gray-500">현재 참여자</span>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{activeRaid.participants ?? 0}명</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setIsRaidModalOpen(true)}>
                      상세 보기
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleTerminateRaid}
                      disabled={isTerminating}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {isTerminating ? '처리 중...' : '레이드 종료'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sword className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">진행 중인 레이드가 없습니다</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4">레이드를 시작하세요.</p>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/teacher/raid/create')}>
                      새 레이드 생성
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/raid/manage', { state: { initialFilter: 'ENDED' } })}>
                      지난 기록 보기
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 레이드 상세 모달 */}
      <Dialog open={isRaidModalOpen} onOpenChange={setIsRaidModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white p-0 overflow-hidden border border-gray-200">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <span className="bg-red-100 p-1.5 rounded-md"><Sword className="w-5 h-5 text-red-600" /></span>
              {activeRaid?.title}
            </DialogTitle>
          </DialogHeader>

          {activeRaid && (
             <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                      <div className="text-xs text-gray-500 mb-1">남은 HP</div>
                      <div className="text-2xl font-bold text-gray-900">{raidHpPercentage}%</div>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                      <div className="text-xs text-gray-500 mb-1">남은 시간</div>
                      <div className="text-2xl font-bold text-gray-900">{daysLeft > 0 ? `${daysLeft}일` : '종료'}</div>
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between text-sm text-gray-600">
                      <span>체력 현황</span>
                      <span className="font-mono">{raidHpLabel}</span>
                   </div>
                   <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div 
                        className="h-full bg-red-600 transition-all duration-500" 
                        style={{ width: `${raidHpPercentage}%` }} 
                      />
                   </div>
                </div>

                <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex items-center justify-center gap-2">
                   <Users className="w-4 h-4" />
                   현재 <strong>{activeRaid.participants}명</strong>의 학생이 참여 중입니다.
                </div>

                <div className="flex gap-3 pt-2">
                   <Button variant="outline" className="flex-1" onClick={() => setIsRaidModalOpen(false)}>닫기</Button>
                   <Button 
                      className="flex-1 bg-black text-white hover:bg-gray-800"
                      onClick={() => {
                        setIsRaidModalOpen(false);
                        handleTerminateRaid();
                      }}
                      disabled={isTerminating}
                   >
                     레이드 강제 종료
                   </Button>
                </div>
             </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}