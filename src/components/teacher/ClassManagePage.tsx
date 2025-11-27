import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Users, Copy, Sword, Check, Loader2 } from "lucide-react";
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
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1>{class_name}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {classDetails
                ? '반 관리와 레이드 진행 상황을 확인하세요.'
                : '좌측 셀렉트 박스에서 반을 선택해주세요.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              onClick={handleRefresh}
              disabled={!selectedClassId || isLoading}
            >
              정보 새로고침
            </Button>
          </div>
        </div>

        {invite_code && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">초대 코드:</span>
            <code className="px-2 py-1 border-2 border-gray-300 bg-gray-100">
              {invite_code}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="border border-gray-300 hover:bg-gray-100"
              onClick={handleCopyCode}
              disabled={isCopied}
            >
              {isCopied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="px-6 pt-4 text-sm text-red-600">{error}</div>
      )}

      {/* Main Content */}
      <div className="p-6 space-y-6 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
            variant="outline"
            onClick={() => {
              // 우선순위: classDetail.classId > selectedClassId > currentClassId
              // classDetail이 가장 정확한 현재 선택된 반 정보
              const classIdToUse = classDetails?.class_id
                ?? selectedClassId
                ?? (currentClassId ? Number(currentClassId) : null);

              if (classIdToUse) {
                navigate(`/teacher/students/${classIdToUse}`);
              } else {
                navigate('/teacher/class');
              }
            }}
            disabled={!classDetails?.class_id && !selectedClassId}
          >
            <Users className="w-4 h-4 mr-2" />
            학생 목록 조회
          </Button>
          <Button
            className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
            variant="outline"
            onClick={() => navigate('/teacher/quest')}
          >
            <Plus className="w-4 h-4 mr-2" />
            퀘스트 등록
          </Button>
          <Button
            className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
            variant="outline"
            onClick={() => navigate('/teacher/raid/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            레이드 등록
          </Button>
        </div>

        {/* Active Quests */}
        <SectionCard
          title="현재 진행 중인 단체 퀘스트"
          headerAction={
            <button
              className="bg-black text-white px-4 py-2 rounded-lg border-2 border-black font-semibold"
              onClick={() => navigate('/teacher/quest/group/manage')}
              style={{ backgroundColor: '#000000', color: 'white' }}
            >
              단체 퀘스트 관리
            </button>
          }
        >
          {isLoading ? (
            <p className="text-sm text-gray-500">퀘스트 정보를 불러오는 중입니다...</p>
          ) : ongoing_group_quests.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {ongoing_group_quests.map((quest) => {
                const completed = quest.progress?.completed ?? 0;
                const required = quest.progress?.required ?? 0;
                const percentage = required > 0 ? (completed / required) * 100 : 0;
                return (
                  <Card
                    key={quest.quest_id}
                    className="border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4>{quest.title}</h4>
                        <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                          {completed}/{required}
                        </Badge>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">진행 중인 단체 퀘스트가 없습니다.</p>
          )}
        </SectionCard>

        {/* Active Raid */}
        <Card className="border-2 border-gray-300 rounded-lg">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3>현재 진행 중인 레이드</h3>
              {raidActionMessage && (
                <span className="text-xs text-gray-600">{raidActionMessage}</span>
              )}
            </div>
            {isLoading ? (
              <p className="text-sm text-gray-500">레이드 정보를 불러오는 중입니다...</p>
            ) : activeRaid && isActiveRaid ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4>{activeRaid.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      종료일: {endDateLabel}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                    {daysLeft > 0 ? `${daysLeft}일 남음` : '마감됨'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">보스 HP</span>
                    <span>{raidHpLabel}</span>
                  </div>
                  <Progress value={raidHpPercentage} className="h-2" />
                </div>
                <div className="flex justify-between text-sm border-t-2 border-gray-300 pt-3">
                  <span className="text-gray-600">참여자</span>
                  <span>{activeRaid.participants ?? 0}명</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={() => setIsRaidModalOpen(true)}
                  >
                    상세 보기
                  </Button>
                  <Button
                    className="flex-1 bg-black text-white hover:bg-gray-800 rounded-lg"
                    onClick={handleTerminateRaid}
                    disabled={isTerminating}
                  >
                    {isTerminating ? '종료 중...' : '레이드 종료'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p>진행 중인 레이드가 없습니다.</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    variant="outline"
                    className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={() => navigate('/teacher/raid/create')}
                  >
                    새 레이드 시작
                  </Button>
                  <Button
                    className="bg-black text-white hover:bg-gray-800 rounded-lg"
                    onClick={() => navigate('/teacher/raid/manage', { state: { initialFilter: 'ENDED' } })}
                  >
                    마감된 레이드 보기
                  </Button>
                </div>
              </div>
            )
            }
          </CardContent >
        </Card >
      </div >

      {/* 레이드 상세 모달 */}
      <Dialog open={isRaidModalOpen} onOpenChange={setIsRaidModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-300">
          {activeRaid ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-black">
                  <Sword className="w-5 h-5 text-black" />
                  {activeRaid.title} 상세 정보
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* 레이드 상태 */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-2 border-gray-300 rounded-lg bg-white text-black">
                    {daysLeft > 0 ? `${daysLeft}일 남음` : '마감됨'}
                  </Badge>
                  <span className="text-sm text-gray-600">현재 진행 중</span>
                </div>

                {/* 보스 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">보스 정보</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-black">보스 HP</span>
                        <span className="text-black font-semibold">{raidHpLabel}</span>
                      </div>
                      <div className="border-2 border-gray-300 h-6 overflow-hidden rounded bg-gray-200">
                        <div
                          className="h-full bg-black transition-all duration-300"
                          style={{ width: `${raidHpPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 참여자 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">참여 현황</h3>
                  <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <Users className="w-5 h-5 text-black" />
                    <span className="text-lg font-semibold text-black">
                      {activeRaid.participants ?? 0}명 참여
                    </span>
                  </div>
                </div>

                {/* 레이드 통계 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">레이드 통계</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-100 rounded-lg text-center border-2 border-gray-300">
                      <div className="text-2xl font-bold text-black">{raidHpPercentage}%</div>
                      <div className="text-sm text-gray-600">남은 HP%</div>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-lg text-center border-2 border-gray-300">
                      <div className="text-2xl font-bold text-black">{daysLeft > 0 ? `${daysLeft}일` : '마감'}</div>
                      <div className="text-sm text-gray-600">남은 시간</div>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-2 pt-4 border-t-2 border-gray-300">
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 rounded-lg bg-white text-black hover:bg-gray-100"
                    onClick={() => setIsRaidModalOpen(false)}
                  >
                    닫기
                  </Button>
                  <Button
                    className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg"
                    onClick={() => {
                      setIsRaidModalOpen(false);
                      handleTerminateRaid();
                    }}
                    disabled={isTerminating}
                  >
                    {isTerminating ? '종료 중...' : '레이드 종료'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-sm text-gray-600">
              진행 중인 레이드가 없습니다.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}